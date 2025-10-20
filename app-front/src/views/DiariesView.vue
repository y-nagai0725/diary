<script setup>
import { ref, onMounted, computed, watch } from 'vue';
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
import SimpleBar from 'simplebar'; // or "import SimpleBar from 'simplebar';" if you want to use it manually.
import 'simplebar/dist/simplebar.min.css';

const inputDateYm = ref(null);
const inputDateYmd = ref(null);

const simplebarBox = ref(null);

const diaries = ref([]);
const currentPage = ref(1);
const totalDiaries = ref(0);
const sortOrder = ref('desc');
const searchWord = ref('');
const searchDate = ref('');
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(totalDiaries.value / itemsPerPage));

// --- モーダル用の設定 ---
const showDeleteModal = ref(false); //削除モーダルの表示状態
const deleteTargetId = ref(null); // 削除対象の日記ID
const deleteTargetDate = ref(''); // 削除対象の日記の日付
const showResultModal = ref(false); // 削除完了モーダルの表示状態
const resultMessage = ref(''); // 完了メッセージ

/**
 * 日記一覧の件数が0の時のメッセージ
 */
const NO_DIARIES_MESSAGE = '検索条件に該当する日記はありません。';

/**
 * 指定されたページの日記を取得
 */
const fetchDiaries = async (page) => {
  try {
    const response = await apiClient.get('/api/diaries', {
      params: {
        page,
        limit: itemsPerPage,
        order: sortOrder.value,
        search: searchWord.value,
      },
    });
    diaries.value = response.data.diaries;
    totalDiaries.value = response.data.totalDiaries;
    currentPage.value = page;
  } catch (error) {
    console.error('日記一覧の取得に失敗しました。', error);
  }
};

/**
 * 並び順を切り替える
 */
const toggleSortOrder = () => {
  //現在の反対の並び順に
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';

  // 並び順を変えたら、1ページ目からデータを取り直す
  fetchDiaries(1);
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

    // 完了メッセージを設定して、完了モーダルを表示
    resultMessage.value = `${deleteTargetDate.value} の日記を削除しました。`;
    showResultModal.value = true;
  } catch (error) {
    console.error('日記データの削除に失敗しました。', error);
    // エラーメッセージを設定して、完了モーダルを表示
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
 * 削除完了モーダルを閉じる処理
 */
const closeResultModal = () => {
  // モーダルを閉じる
  showResultModal.value = false;

  // 日記一覧の再表示
  fetchDiaries(1);
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
 * ページネーションに表示する数字リスト（省略記号...も含む）
 */
const paginationList = computed(() =>
  createPaginationList(totalPages.value, currentPage.value)
);

watch(searchWord, () => {
  // 検索キーワードが変わったら、必ず1ページ目から検索し直す
  fetchDiaries(1);
});

watch(inputDateYm, (newValue) => {
  console.log(newValue);
});

watch(inputDateYmd, (newValue) => {
  console.log(newValue);
});

onMounted(() => {
  //初期表示は、1ページ目のデータを表示
  fetchDiaries(1);

  new SimpleBar(simplebarBox.value, { autoHide: false });
});
</script>

<template>
  <div class="diaries">
    <div class="diaries__search-area">
      <div class="diaries__date-wrapper">
        <label class="diaries__form-label" for="">対象期間</label>
        <div class="diaries__date-box">
          <div class="diaries__date-radio-wrapper">
            <input
              id="diaries__date-all"
              class="diaries__date-radio"
              type="radio"
              name="search-date"
              v-model="searchDate"
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
              name="search-date"
              v-model="searchDate"
              value="ym"
            />
            <label class="diaries__date-label" for="diaries__date-ym"
              >年月</label
            >
            <input
              id="diaries__date-ymd"
              class="diaries__date-radio"
              type="radio"
              name="search-date"
              v-model="searchDate"
              value="ymd"
            />
            <label class="diaries__date-label" for="diaries__date-ymd"
              >年月日</label
            >
          </div>
          <VueDatePicker
            v-if="searchDate === 'ym'"
            class="diaries__input-date"
            v-model="inputDateYm"
            placeholder="---- 年 -- 月"
            locale="ja"
            month-picker
            auto-apply
            :format="formatYm"
          ></VueDatePicker>
          <VueDatePicker
            v-else-if="searchDate === 'ymd'"
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
      <div class="diaries__pc-link-wrapper">
        <RouterLink class="diaries__link-create" to="/diary/new"
          ><PenIcon class="diaries__pen-icon" />作成</RouterLink
        >
        <RouterLink class="diaries__link-home" to="/home"
          ><HomeIcon class="diaries__home-icon" />Home</RouterLink
        >
      </div>
    </div>
    <div class="diaries__right-box">
      <p class="diaries__sub-title">日記一覧</p>
      <div
        class="diaries__list-wrapper"
        :class="{ 'no-data': diaries.length === 0 }"
        ref="simplebarBox"
      >
        <p v-if="diaries.length === 0" class="diaries__no-data">
          {{ NO_DIARIES_MESSAGE }}
        </p>
        <ul v-else class="diaries__result-list">
          <!-- <button class="diaries__order-button" @click="toggleSortOrder">
          並び替え: {{ sortOrder === 'desc' ? '新しい順' : '古い順' }}
        </button> -->
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
      </div>
      <div class="diaries__pagination">
        <button
          class="diaries__page-button diaries__page-button--prev"
          @click="fetchDiaries(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <CaretLeftIcon class="diaries__caret-left-icon" />
        </button>
        <template v-for="page in paginationList">
          <button
            v-if="page !== '...'"
            class="diaries__page-button"
            :class="{
              selected: currentPage === page,
            }"
            @click="fetchDiaries(page)"
            :key="page.index"
          >
            {{ page }}
          </button>
          <span v-else class="diaries__page-dot" :key="page.index">{{
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
    <div class="diaries__sp-link-wrapper">
      <RouterLink class="diaries__link-create" to="/diary/new"
        ><PenIcon class="diaries__pen-icon" />作成</RouterLink
      >
      <RouterLink class="diaries__link-home" to="/home"
        ><HomeIcon class="diaries__home-icon" />Home</RouterLink
      >
    </div>
    <ConfirmModal
      :show="showDeleteModal"
      :message="`${deleteTargetDate} の日記を削除します。よろしいですか？`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <ConfirmModal
      :show="showResultModal"
      :message="resultMessage"
      :confirmOnly="true"
      @confirm="closeResultModal"
    />
  </div>
</template>
<style lang="scss" scoped>
//TODOメモ css(デザイン)はほとんど全部まだ仮です、最後に作成します。
.diaries {
  $parent: &;
  display: grid;
  gap: 1.6rem;

  @include tab {
    gap: 2.4rem;
  }

  @include pc {
    align-items: start;
    grid-template-columns: minmax(340px, 40rem) auto;
    gap: 10rem;
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
      width: 100%;
      margin-inline: initial;
      padding: 2.4rem;
      gap: 2.4rem;
      position: sticky;
      top: 100px; //ヘッダーの高さ分
    }
  }

  &__date-wrapper {
    display: grid;
    grid-template-columns: max-content auto;
    gap: 2.4rem;

    @include tab {
      gap: 3.2rem;
    }

    @include pc {
      gap: 4rem;
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

  &__date-radio {
    display: none;

    &:checked + #{$parent}__date-label {
      color: $white;
      background-color: $orange;
    }
  }

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

  &__input-date {
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
    display: none;

    @include pc {
      display: flex;
      justify-content: space-between;
    }
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
      width: 100%;
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

  &__list-wrapper {
    height: 330px;
    padding: 1.6rem;
    border-radius: 10px;
    background-color: $orange;
    overflow: auto;

    &.no-data {
      display: flex;
      align-items: center;
    }

    @include tab {
      height: 400px;
      padding: 2rem;
    }

    @include pc {
      height: auto;
      padding: 2.4rem;
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
      grid-template-columns: auto 4.8rem 4.8rem;
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
    padding: 1.6rem;
    background-color: $white;
    border-radius: 100vmax;
    display: flex;
    justify-content: space-between;

    @include tab {
      width: 55%;
      margin-inline: auto;
      padding: 2rem;
    }

    @include pc {
      display: none;
    }
  }
}
</style>