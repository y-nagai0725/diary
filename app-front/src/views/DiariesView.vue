<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import apiClient from '@/api';
import CheckmarkIcon from '@/components/icons/CheckmarkIcon.vue';
import PenIcon from '@/components/icons/PenIcon.vue';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { formatDate } from '@/utils/date.js';
import VueDatePicker from '@vuepic/vue-datepicker';

const inputDateYm = ref(null);
const inputDateYmd = ref(null);

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
 * 日記未登録時のメッセージ
 */
const NO_DIARIES_MESSAGE =
  'まだ日記が登録されていません。初めての日記を書いてみよう！';

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
}

/**
 * 年月日選択ボックス用フォーマッター
 */
const formatYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year} 年 ${month} 月 ${day} 日`;
}

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
    <div class="diaries__list-wrapper">
      <p v-if="diaries.length === 0" class="diaries__no-data">
        {{ NO_DIARIES_MESSAGE }}
      </p>
      <div v-else class="diaries__data-wrapper">
        <button class="diaries__order-button" @click="toggleSortOrder">
          並び替え: {{ sortOrder === 'desc' ? '新しい順' : '古い順' }}
        </button>

        <div class="diaries__grid">
          <div class="diaries__grid-header">日付</div>
          <div class="diaries__grid-header">日記内容</div>
          <div class="diaries__grid-header">Geminiコメント有無</div>
          <div class="diaries__grid-header">編集リンク</div>
          <div class="diaries__grid-header">削除リンク</div>
          <div
            v-for="diary in diaries"
            :key="diary.id"
            class="diaries__grid-row"
          >
            <p class="diaries__grid-item">{{ formatDate(diary.date) }}</p>
            <p class="diaries__grid-item">{{ diary.text }}</p>
            <p class="diaries__grid-item diaries__gemini-check">
              <CheckmarkIcon
                v-if="diary.geminiComment"
                class="diaries__gemini-check-icon"
              />
            </p>
            <p class="diaries__grid-item">
              <RouterLink class="diaries__edit-link" :to="`/diary/${diary.id}`"
                >編集</RouterLink
              >
            </p>
            <p class="diaries__grid-item">
              <button
                class="diaries__delete-button"
                @click="handleDeleteDiary(diary)"
              >
                削除
              </button>
            </p>
          </div>
        </div>

        <div class="diaries__pagination">
          <button
            class="diaries__prev-button"
            @click="fetchDiaries(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            前へ
          </button>
          <span class="diaries__page-number"
            >{{ currentPage }} / {{ totalPages }} ページ</span
          >
          <button
            class="diaries__next-button"
            @click="fetchDiaries(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            次へ
          </button>
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
    </div>
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
      padding-top: 2.4rem;
      border-top: 1px solid $brown;
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

  &__grid {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr 1fr 1fr;
  }

  &__grid-header {
  }

  &__grid-row {
    display: contents;
  }

  &__grid-item {
    &:nth-of-type(2) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__gemini-check {
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      width: 20px;
      height: 20px;
      color: #42b983;
    }
  }
}
</style>