<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue';
import { useResponsive } from '@/composables/useResponsive.js';
import apiClient from '@/api';
import CaretRightIcon from '@/components/icons/CaretRightIcon.vue';
import CaretLeftIcon from '@/components/icons/CaretLeftIcon.vue';
import PenIcon from '@/components/icons/PenIcon.vue';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { formatDate } from '@/utils/date.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import Simplebar from 'simplebar-vue';
import 'simplebar-vue/dist/simplebar.min.css';

/**
 * 日記一覧の件数が0の時のメッセージ
 */
const NO_DIARIES_MESSAGE = '検索条件に該当する日記はありません。';

/**
 * （最低保証の）ローディング表示時間
 */
const MIN_LOADING_TIME = 300;

/**
 * PC表示かどうか
 */
const { isPc } = useResponsive();

/**
 * simplebar要素
 */
const simplebarRef = ref(null);

/**
 * 年月入力値
 */
const inputDateYm = ref(null);

/**
 * 年月日入力値
 */
const inputDateYmd = ref(null);

/**
 * 検索設定の表示・非表示 (SP用)
 */
const isSearchSettingsOpenSp = ref(false);

/**
 * 検索設定が表示されているか (PCでは常にtrue, SPではisSearchSettingsOpenSpに依存)
 */
const isSearchSettingsOpen = computed(() =>
  isPc.value ? true : isSearchSettingsOpenSp.value
);

/**
 * 検索設定を開閉する (SP用)
 */
const toggleSearchSettings = () => {
  if (!isPc.value) {
    // SPの時だけ実行
    isSearchSettingsOpenSp.value = !isSearchSettingsOpenSp.value;
  }
};

/**
 * （検索結果の）日記一覧
 */
const diaries = ref([]);

/**
 * 現在の表示ページ
 */
const currentPage = ref(1);

/**
 * （検索結果の）日記の合計数
 */
const totalDiaries = ref(0);

/**
 * 検索用の並び順（デフォルトは'新しい順'）
 */
const searchSortOrder = ref('desc');

/**
 * 検索用キーワード
 */
const searchWord = ref('');

/**
 * 検索用日付種類（デフォルトは'すべて'）
 */
const searchDateType = ref('all');

/**
 * 検索用日付
 */
const searchDateValue = computed(() => {
  if (searchDateType.value === 'ym' && inputDateYm.value) {
    // 年月が選ばれてたら 'yyyy-MM' の形にする
    const year = String(inputDateYm.value.year);
    const month = String(inputDateYm.value.month + 1).padStart(2, '0');
    return `${year}-${month}`;
  } else if (searchDateType.value === 'ymd' && inputDateYmd.value) {
    // 年月日が選ばれてたら 'yyyy-MM-dd' の形にする
    return formatDate(inputDateYmd.value, '-');
  }
  // 'all'の時や、日付がまだ選ばれてない時はnullを返す
  return null;
});

/**
 * 一覧の1ページ当たりの表示数
 */
const itemsPerPage = 10;

/**
 * 一覧の合計ページ数
 */
const totalPages = computed(() => Math.ceil(totalDiaries.value / itemsPerPage));

/**
 * ページネーションに表示する数字リスト（省略記号...も含む）
 */
const paginationList = computed(() =>
  createPaginationList(totalPages.value, currentPage.value)
);

/**
 * 削除モーダルの表示状態
 */
const showDeleteModal = ref(false);

/**
 * 削除対象の日記ID
 */
const deleteTargetId = ref(null);

/**
 * 削除対象の日記の日付
 */
const deleteTargetDate = ref('');

/**
 * 結果モーダルの表示状態
 */
const showResultModal = ref(false);

/**
 * 結果モーダルのタイトル
 */
const resultTitle = ref('');

/**
 * 結果モーダルのメッセージ
 */
const resultMessage = ref('');

/**
 * 検索時のローディング表示制御用
 */
const isSearchLoading = ref(false);

/**
 * 結果モーダルのコールバック処理
 */
let resultModalCallBack = null;

/**
 * 検索処理のデバウンス用のタイマー
 */
let debounceTimer = null;

/**
 * 指定されたページの日記を取得
 */
const fetchDiaries = async (page) => {
  //ローディング表示
  isSearchLoading.value = true;

  const fetchDataPromise = new Promise(async (resolve, reject) => {
    try {
      const params = {
        page,
        limit: itemsPerPage,
        order: searchSortOrder.value,
        search: searchWord.value,
      };

      //日付が入力されている場合、検索条件に加える
      if (searchDateValue.value) {
        params.searchDateType = searchDateType.value;
        params.searchDateValue = searchDateValue.value;
      }

      //検索対象の日記取得
      const response = await apiClient.get('/api/diaries', { params });

      //表示更新
      diaries.value = response.data.diaries;
      totalDiaries.value = response.data.totalDiaries;
      currentPage.value = page;

      //DOMの更新を待つ
      await nextTick();

      if (!isPc.value) {
        // SP表示の時
        if (simplebarRef.value && simplebarRef.value.$el) {
          const scrollElement = simplebarRef.value.$el.querySelector(
            '.simplebar-content-wrapper'
          );
          if (scrollElement) {
            scrollElement.scrollTop = 0; // simplebar要素のスクロール位置を一番上に
          }
        }
      } else {
        // PC表示の時
        window.scrollTo({ top: 0 });
      }

      resolve();
    } catch (error) {
      console.error('日記一覧の取得に失敗しました。', error);
      // エラーメッセージを設定して、結果モーダルを表示
      resultTitle.value = '検索エラー';
      resultMessage.value = error.response.data.error;
      showResultModal.value = true;

      reject(error);
    }
  });

  //最低表示時間待機用のPromise
  const waitMinTimePromise = new Promise((resolve) => {
    setTimeout(resolve, MIN_LOADING_TIME); // 最低時間待つタイマー
  });

  //データ取得と最低時間待機の両方が終わるのを待つ
  try {
    await Promise.all([fetchDataPromise, waitMinTimePromise]);
  } catch (error) {
    console.error('日記一覧の取得に失敗しました。', error);
  } finally {
    isSearchLoading.value = false;
  }
};

/**
 * 削除ボタンが押された時の処理
 * @param {object} diary 削除対象の日記オブジェクト
 */
const handleDeleteDiary = (diary) => {
  // 削除対象の日記のid
  deleteTargetId.value = diary.id;
  // 削除対象の日記の日付
  deleteTargetDate.value = formatDate(diary.date);
  // 削除確認モーダルを表示する
  showDeleteModal.value = true;
};

/**
 * 削除確認モーダルで「OK」が押された時の処理
 */
const confirmDelete = async () => {
  // モーダルを閉じる
  showDeleteModal.value = false;

  try {
    // データベースから削除
    await apiClient.delete(`/api/diaries/${deleteTargetId.value}`);

    //結果モーダルのコールバック処理設定
    resultModalCallBack = () => {
      // 日記一覧の再表示
      fetchDiaries(1);
    };

    // 完了メッセージを設定して、完了モーダルを表示
    resultTitle.value = '削除完了';
    resultMessage.value = `${deleteTargetDate.value} の日記を削除しました。`;
    showResultModal.value = true;
  } catch (error) {
    console.error('日記データの削除に失敗しました。', error);
    // エラーメッセージを設定して、完了モーダルを表示
    resultTitle.value = '削除エラー';
    resultMessage.value = `${deleteTargetDate.value} の日記の削除に失敗しました。`;
    showResultModal.value = true;
  }
};

/**
 * 削除確認モーダルで「キャンセル」が押された時の処理
 */
const cancelDelete = () => {
  // モーダルを閉じる
  showDeleteModal.value = false;

  //保持していた削除対象idと日付を空に
  deleteTargetId.value = null;
  deleteTargetDate.value = '';
};

/**
 * 結果モーダルを閉じる処理
 */
const closeResultModal = () => {
  // モーダルを閉じる
  showResultModal.value = false;

  //タイトル、メッセージを空に
  resultTitle.value = '';
  resultMessage.value = '';

  if (resultModalCallBack) {
    //設定されているコールバック処理を実行
    resultModalCallBack();

    //コールバック処理を空に
    resultModalCallBack = null;
  }
};

/**
 * 年月選択ボックス用フォーマッター
 */
const formatYm = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year} 年 ${month} 月`;
};

/**
 * 年月日選択ボックス用フォーマッター
 */
const formatYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year} 年 ${month} 月 ${day} 日`;
};

/**
 * ページネーションの数字リストを作成
 * @param {Number} totalPages 合計ページ数
 * @param {Number} currentPage 現在のページ数
 * @returns {Number[]} ページネーションリスト
 */
const createPaginationList = (totalPages, currentPage) => {
  const pages = [];

  // ---常に表示するページを追加---
  // 最初のページ
  pages.push(1);
  // 現在のページ
  if (currentPage > 1) pages.push(currentPage);
  // 最後のページ
  if (totalPages > 1) pages.push(totalPages);

  // ---現在の前後のページを追加---
  // 前のページ
  if (currentPage > 2) pages.push(currentPage - 1);
  // 後のページ
  if (currentPage < totalPages - 1) pages.push(currentPage + 1);

  // Setを使って重複を削除し、ソートする
  const pageSet = [...new Set(pages)].sort((a, b) => a - b);

  // ...（省略記号）を挿入する
  const resultPages = [];
  let lastPage = 0;
  for (const page of pageSet) {
    if (page > lastPage + 1) {
      resultPages.push('...');
    }
    resultPages.push(page);
    lastPage = page;
  }

  return resultPages;
};

/**
 * キーワード検索入力の監視
 */
watch(searchWord, () => {
  // 前回のタイマー予約があったらキャンセル
  clearTimeout(debounceTimer);

  // タイマーを予約
  debounceTimer = setTimeout(() => {
    // 1ページ目から検索し直す
    fetchDiaries(1);
  }, 500);
});

/**
 * 日付入力、並び順の選択監視
 */
watch([searchSortOrder, searchDateValue], () => {
  // 並び順、日付が変更されたら必ず1ページ目から検索し直す
  fetchDiaries(1);
});

/**
 * 検索期間のラジオボタンを監視
 */
watch(searchDateType, (newType) => {
  // all選択時 または ym or ymd 選択時に日付がすでに入力されてたら検索
  if (
    (newType === 'ym' && inputDateYm.value) ||
    (newType === 'ymd' && inputDateYmd.value) ||
    newType === 'all'
  ) {
    fetchDiaries(1);
  }
});

onMounted(() => {
  //初期表示は、1ページ目のデータを表示
  fetchDiaries(1);
});

onUnmounted(() => {
  // 残ってるタイマー予約があったらキャンセル
  clearTimeout(debounceTimer);
});
</script>

<template>
  <div class="diaries">
    <div class="diaries__search-area">
      <p
        class="diaries__search-title"
        :class="{ 'is-opened-menu': isSearchSettingsOpen }"
        @click="toggleSearchSettings"
      >
        検索設定
      </p>
      <Transition name="search-accordion">
        <div v-show="isSearchSettingsOpen" class="diaries__search-settings">
          <div class="diaries__order-wrapper">
            <label class="diaries__form-label">並び順</label>
            <div class="diaries__order-radio-wrapper">
              <input
                id="diaries__order-desc"
                class="diaries__order-radio"
                type="radio"
                name="search-order"
                v-model="searchSortOrder"
                value="desc"
              />
              <label class="diaries__order-label" for="diaries__order-desc"
                >新しい順</label
              >
              <input
                id="diaries__order-asc"
                class="diaries__order-radio"
                type="radio"
                name="search-order"
                v-model="searchSortOrder"
                value="asc"
              />
              <label class="diaries__order-label" for="diaries__order-asc"
                >古い順</label
              >
            </div>
          </div>
          <div class="diaries__date-wrapper">
            <label class="diaries__form-label">対象期間</label>
            <div class="diaries__date-box">
              <div class="diaries__date-radio-wrapper">
                <input
                  id="diaries__date-all"
                  class="diaries__date-radio"
                  type="radio"
                  name="search-date-type"
                  v-model="searchDateType"
                  value="all"
                  checked
                />
                <label class="diaries__date-label" for="diaries__date-all"
                  >すべて</label
                >
                <input
                  id="diaries__date-ym"
                  class="diaries__date-radio"
                  type="radio"
                  name="search-date-type"
                  v-model="searchDateType"
                  value="ym"
                />
                <label class="diaries__date-label" for="diaries__date-ym"
                  >年月</label
                >
                <input
                  id="diaries__date-ymd"
                  class="diaries__date-radio"
                  type="radio"
                  name="search-date-type"
                  v-model="searchDateType"
                  value="ymd"
                />
                <label class="diaries__date-label" for="diaries__date-ymd"
                  >年月日</label
                >
              </div>
              <VueDatePicker
                v-if="searchDateType === 'ym'"
                class="diaries__input-date"
                v-model="inputDateYm"
                placeholder="---- 年 -- 月"
                locale="ja"
                month-picker
                auto-apply
                :format="formatYm"
              ></VueDatePicker>
              <VueDatePicker
                v-else-if="searchDateType === 'ymd'"
                class="diaries__input-date"
                v-model="inputDateYmd"
                placeholder="---- 年 -- 月 -- 日"
                locale="ja"
                auto-apply
                :enable-time-picker="false"
                :format="formatYmd"
              ></VueDatePicker>
            </div>
          </div>
          <div class="diaries__search-word-wrapper">
            <label class="diaries__form-label" for="diaries__input-search-word"
              >検索ワード</label
            >
            <input
              id="diaries__input-search-word"
              class="diaries__input-search-word"
              type="text"
              v-model="searchWord"
              placeholder="日記内容を検索..."
            />
          </div>
        </div>
      </Transition>
      <div v-if="isPc" class="diaries__pc-link-wrapper">
        <RouterLink class="diaries__link-create" to="/diary/new"
          ><PenIcon class="diaries__pen-icon" />作成</RouterLink
        >
        <RouterLink class="diaries__link-home" to="/home"
          ><HomeIcon class="diaries__home-icon" />Home</RouterLink
        >
      </div>
    </div>
    <div class="diaries__right-box">
      <h2 class="diaries__sub-title">日記一覧</h2>
      <div class="diaries__list-outer-wrapper">
        <Simplebar
          class="diaries__list-wrapper"
          :class="{
            'no-data': diaries.length === 0,
            'is-loading': isSearchLoading,
          }"
          :auto-hide="false"
          ref="simplebarRef"
        >
          <div v-if="isSearchLoading" class="diaries__loader"></div>
          <p
            v-if="!isSearchLoading && diaries.length === 0"
            class="diaries__no-data"
          >
            {{ NO_DIARIES_MESSAGE }}
          </p>
          <ul
            v-if="!isSearchLoading && diaries.length > 0"
            class="diaries__result-list"
          >
            <li
              v-for="diary in diaries"
              :key="diary.id"
              class="diaries__diary-item"
            >
              <div class="diaries__diary-text-wrapper">
                <span class="diaries__diary-date">{{
                  formatDate(diary.date, '/', true)
                }}</span>
                <span class="diaries__diary-text">{{ diary.text }}</span>
              </div>
              <RouterLink class="diaries__edit-link" :to="`/diary/${diary.id}`"
                ><EditIcon class="diaries__edit-icon"
              /></RouterLink>
              <button
                class="diaries__delete-button"
                @click="handleDeleteDiary(diary)"
              >
                <DeleteIcon class="diaries__delete-icon" />
              </button>
            </li>
          </ul>
        </Simplebar>
      </div>
      <div class="diaries__pagination">
        <button
          class="diaries__page-button diaries__page-button--prev"
          @click="fetchDiaries(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <CaretLeftIcon class="diaries__caret-left-icon" />
        </button>
        <template v-for="(page, index) in paginationList">
          <button
            v-if="page !== '...'"
            class="diaries__page-button"
            :class="{
              selected: currentPage === page,
            }"
            @click="fetchDiaries(page)"
            :key="page"
          >
            {{ page }}
          </button>
          <span v-else class="diaries__page-dot" :key="`dot-${index}`">{{
            page
          }}</span>
        </template>
        <button
          class="diaries__page-button diaries__page-button--next"
          @click="fetchDiaries(currentPage + 1)"
          :disabled="currentPage === totalPages || totalPages === 0"
        >
          <CaretRightIcon class="diaries__caret-right-icon" />
        </button>
      </div>
    </div>
    <div v-if="!isPc" class="diaries__sp-link-wrapper">
      <RouterLink class="diaries__link-create" to="/diary/new"
        ><PenIcon class="diaries__pen-icon" />作成</RouterLink
      >
      <RouterLink class="diaries__link-home" to="/home"
        ><HomeIcon class="diaries__home-icon" />Home</RouterLink
      >
    </div>
    <ConfirmModal
      :show="showDeleteModal"
      :title="'日記削除'"
      :message="`${deleteTargetDate} の日記を削除します。本当によろしいですか？`"
      :confirmButtonText="'削除する'"
      :confirmButtonClass="'delete'"
      :cancelButtonText="'キャンセル'"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <ConfirmModal
      :show="showResultModal"
      :title="resultTitle"
      :message="resultMessage"
      :confirmButtonText="'OK'"
      :confirmButtonClass="'confirm'"
      :confirmOnly="true"
      @confirm="closeResultModal"
      @cancel="closeResultModal"
    />
  </div>
</template>
<style lang="scss" scoped>
//TODO hover処理などは最後に
.diaries {
  $parent: &;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  @include tab {
    gap: 2.4rem;
  }

  @include pc {
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
  }

  &__search-area {
    padding: 1.6rem;
    border-radius: 10px;
    background-color: $white;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    @include tab {
      width: 55%;
      margin-inline: auto;
      padding: 2rem;
      gap: 2rem;
    }

    @include pc {
      width: clamp(340px, 40rem, 400px);
      margin-inline: initial;
      padding: 2.4rem;
      gap: 2.4rem;
      position: sticky;
      top: $header-height-pc; //ヘッダーの高さ分
    }
  }

  &__search-title {
    @include accordion-menu-style;
  }

  &__search-settings {
    transition: opacity 0.3s ease-out, max-height 0.3s ease-out;
    max-height: 500px;
    opacity: 1;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    @include tab {
      gap: 2rem;
    }

    @include pc {
      gap: 2.4rem;
      max-height: none;
      opacity: 1;
      overflow: visible;
      transition: none;
    }
  }

  // --- アコーディオンが開くとき ---
  // 開始時
  .search-accordion-enter-from {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
  }
  // 終了時
  .search-accordion-enter-to {
    overflow: visible;
    max-height: 500px;
    opacity: 1;
  }

  // --- アコーディオンが閉じるとき ---
  // 開始時
  .search-accordion-leave-from {
    overflow: visible;
    max-height: 500px;
    opacity: 1;
  }
  // 終了時
  .search-accordion-leave-to {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
  }

  &__order-wrapper,
  &__date-wrapper {
    display: grid;
    grid-template-columns: 60px auto;
    gap: 1.6rem;

    @include tab {
      grid-template-columns: 65px auto;
      gap: 2rem;
    }

    @include pc {
      grid-template-columns: 70px auto;
      gap: 2.4rem;
    }
  }

  &__form-label {
    font-size: clamp(14px, 1.4rem, 15px);

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__order-radio-wrapper {
    display: flex;
    gap: 2rem;

    @include tab {
      gap: 2.2rem;
    }

    @include pc {
      gap: 2.4rem;
    }
  }

  &__date-box {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    @include tab {
      gap: 2rem;
    }

    @include pc {
      gap: 2.4rem;
    }
  }

  &__date-radio-wrapper {
    display: flex;
    justify-content: space-between;
  }

  &__order-radio,
  &__date-radio {
    display: none;

    &:checked + #{$parent}__order-label,
    &:checked + #{$parent}__date-label {
      color: $white;
      background-color: $orange;
    }
  }

  &__order-label,
  &__date-label {
    cursor: pointer;
    padding: 0.75em;
    color: $orange;
    border: 1px solid $orange;
    border-radius: 4px;
    font-size: clamp(14px, 1.4rem, 15px);
    transition: color 0.3s ease-out, background-color 0.3s ease-out;

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__search-word-wrapper {
    display: grid;
    gap: 0.8rem;

    @include tab {
      gap: 1.2rem;
    }

    @include pc {
      gap: 1.6rem;
    }
  }

  &__input-search-word {
    @include input-text-style;
  }

  &__pc-link-wrapper {
    display: flex;
    justify-content: space-between;
  }

  &__link-create,
  &__link-home {
    width: 13rem;
    gap: 1em;

    @include tab {
      width: 14rem;
    }

    @include pc {
      min-width: 120px;
      width: 15rem;
    }
  }

  &__link-create {
    @include button-style-fill($orange, $white-brown);
  }

  &__pen-icon {
    height: 1.5em;
    stroke: $white-brown;
    stroke-width: 2;
    fill: none;
  }

  &__link-home {
    @include button-style-fill($brown, $white-brown);
  }

  &__home-icon {
    height: 1.5em;
    fill: $white-brown;
  }

  &__right-box {
    @include tab {
      width: 80%;
      margin-inline: auto;
    }

    @include pc {
      width: calc(100% - clamp(340px, 40rem, 400px) - 10rem);
      margin-inline: initial;
    }
  }

  &__sub-title {
    text-align: center;
    font-weight: 700;
    font-size: clamp(22px, 2.2rem, 26px);
    letter-spacing: 0.1em;
    margin-bottom: 1.6rem;

    @include tab {
      font-size: clamp(26px, 2.6rem, 30px);
      margin-bottom: 2.4rem;
    }

    @include pc {
      font-size: clamp(30px, 4rem, 40px);
    }
  }

  &__list-outer-wrapper {
    position: relative;
  }

  &__list-wrapper {
    height: 330px;
    padding: 1.6rem;
    border-radius: 10px;
    background-color: $orange;
    transition: opacity 0.3s ease-out;

    &.is-loading {
      opacity: 0.7;
    }

    &.no-data {
      display: flex;
      align-items: center;
    }

    &::v-deep(.simplebar-scrollbar::before) {
      //スクロールバー色
      background-color: $brown;

      //スクロールバー不透明度（デフォルト0.5）
      opacity: 0.7;
    }

    &::v-deep(.simplebar-track.simplebar-vertical) {
      //スクロールバー高さ
      height: calc(100% - 3.2rem);

      //スクロールバー位置
      top: 1.6rem;
      right: 2px;
    }

    @include tab {
      height: 400px;
      padding: 2rem;

      &::v-deep(.simplebar-track.simplebar-vertical) {
        height: calc(100% - 4rem);
        top: 2rem;
        right: 4px;
      }
    }

    @include pc {
      min-height: 480px;
      padding: clamp(16px, 2.4rem, 24px);

      &::v-deep(.simplebar-track.simplebar-vertical) {
        height: calc(100% - 4.8rem);
        top: 2.4rem;
        right: clamp(3px, 0.6rem, 6px);
      }
    }
  }

  &__loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 4px solid $white-brown;
    border-top-color: $brown;
    border-radius: 100vmax;
    animation: spin 1s linear infinite;
    z-index: 10;
  }

  @keyframes spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  &__no-data {
    width: 100%;
    padding: 1em;
    border-radius: 10px;
    background-color: $white;
    line-height: 1.8;
    color: $red;
    font-size: clamp(14px, 1.4rem, 15px);

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__result-list {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    @include tab {
      gap: 2rem;
    }

    @include pc {
      gap: 2.4rem;
    }
  }

  &__diary-item {
    padding: 1.6rem;
    border-radius: 10px;
    background-color: $white;
    display: grid;
    align-items: center;
    grid-template-columns: auto 4rem 4rem;
    gap: 1rem;

    @include tab {
      padding: 2rem;
      grid-template-columns: auto 4.4rem 4.4rem;
      gap: 1.6rem;
    }

    @include pc {
      padding: 2.4rem;
      grid-template-columns: auto minmax(40px, 4.8rem) minmax(40px, 4.8rem);
      gap: 2.4rem;
    }
  }

  &__diary-text-wrapper {
    display: grid;
    gap: 0.4rem;

    @include tab {
      gap: 0.6rem;
    }

    @include pc {
      gap: 1rem;
    }
  }

  &__diary-date {
    font-size: clamp(11px, 1.1rem, 12px);

    @include tab {
      font-size: clamp(12px, 1.2rem, 14px);
    }

    @include pc {
      font-size: clamp(12px, 1.4rem, 14px);
    }
  }

  &__diary-text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: clamp(14px, 1.4rem, 15px);
    line-height: 1.8;

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(14px, 1.6rem, 16px);
    }
  }

  &__edit-link,
  &__delete-button {
    cursor: pointer;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__edit-link {
    background-color: $green;
  }

  &__delete-button {
    background-color: $red;
  }

  &__edit-icon,
  &__delete-icon {
    width: 60%;
  }

  &__edit-icon {
    fill: $white-brown;
  }

  &__delete-icon {
    fill: none;
    stroke: $white-brown;
    stroke-width: 3;
  }

  &__pagination {
    width: fit-content;
    margin-inline: auto;
    padding: 1rem 0.8rem;
    background-color: $white;
    border-radius: 100vmax;
    display: flex;
    gap: 0.8rem;
    position: relative;
    transform: translateY(-50%);

    @include tab {
      padding: 1.2rem 1rem;
      gap: 1.6rem;
    }

    @include pc {
      padding: 1.6rem;
      gap: 2.4rem;
      transform: translateY(0);
      margin-top: 2.4rem;
    }
  }

  &__page-button {
    cursor: pointer;
    width: 2.8rem;
    aspect-ratio: 1;
    border-radius: 100vmax;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $brown;
    font-size: clamp(12px, 1.2rem, 14px);

    &.selected {
      background-color: $orange;
      color: $white-brown;
    }

    &:disabled {
      cursor: not-allowed;
    }

    @include tab {
      width: 3.4rem;
      font-size: clamp(14px, 1.4rem, 16px);
    }

    @include pc {
      width: 4rem;
      font-size: clamp(14px, 1.6rem, 16px);
    }
  }

  &__page-dot {
    display: grid;
    place-content: center;
    width: 1.2rem;
    color: $brown;
    font-size: clamp(12px, 1.2rem, 14px);

    @include tab {
      width: 1.6rem;
      font-size: clamp(14px, 1.4rem, 16px);
    }

    @include pc {
      width: 2.4rem;
      font-size: clamp(14px, 1.6rem, 16px);
    }
  }

  &__caret-left-icon,
  &__caret-right-icon {
    width: 0.5rem;
    fill: $brown;

    @include tab {
      width: 0.6rem;
    }

    @include pc {
      width: clamp(5px, 0.7rem, 7px);
    }
  }

  &__sp-link-wrapper {
    padding: 0 1.6rem;
    display: flex;
    justify-content: space-between;

    @include tab {
      width: 55%;
      margin-inline: auto;
      padding: 2rem;
    }
  }
}
</style>