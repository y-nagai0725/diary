<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import apiClient from '@/api';
import CheckmarkIcon from '@/components/icons/CheckmarkIcon.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { formatDate } from '@/utils/date.js';

const diaries = ref([]);
const currentPage = ref(1);
const totalDiaries = ref(0);
const sortOrder = ref('desc');
const searchTerm = ref('');
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(totalDiaries.value / itemsPerPage));

// --- モーダル用の設定 ---
const showDeleteModal = ref(false); //削除モーダルの表示状態
const deleteTargetId = ref(null); // 削除対象の日記ID
const deleteTargetDate = ref(''); // 削除対象の日記の日付
const showResultModal = ref(false); // 削除完了モーダルの表示状態
const resultMessage = ref(''); // 完了メッセージ

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
        search: searchTerm.value,
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

watch(searchTerm, () => {
  // 検索キーワードが変わったら、必ず1ページ目から検索し直す
  fetchDiaries(1);
});

onMounted(() => {
  //初期表示は、1ページ目のデータを表示
  fetchDiaries(1);
});
</script>

<template>
  <div class="diaries">
    <h1 class="diaries__title">日記一覧</h1>

    <div class="diaries__link-button-wrapper">
      <RouterLink class="diaries__link" to="/home">ホーム</RouterLink>
      <RouterLink class="diaries__link" to="/diary/new">日記作成</RouterLink>
    </div>

    <div class="diaries__search-form">
      <input
        class="diaries__search-box"
        type="text"
        v-model="searchTerm"
        placeholder="日記を検索..."
      />
    </div>
    <button class="diaries__order-button" @click="toggleSortOrder">
      並び替え: {{ sortOrder === 'desc' ? '新しい順' : '古い順' }}
    </button>

    <div class="diaries__grid">
      <div class="diaries__grid-header">日付</div>
      <div class="diaries__grid-header">日記内容</div>
      <div class="diaries__grid-header">Geminiコメント有無</div>
      <div class="diaries__grid-header">編集リンク</div>
      <div class="diaries__grid-header">削除リンク</div>
      <div v-for="diary in diaries" :key="diary.id" class="diaries__grid-row">
        <p class="diaries__grid-item">{{ formatDate(diary.date) }}</p>
        <p class="diaries__grid-item">{{ diary.text }}</p>
        <p class="diaries__grid-item diaries__gemini-check">
          <CheckmarkIcon v-if="diary.geminiComment" />
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
</template>
<style lang="scss" scoped>
//TODOメモ css(デザイン)はほとんど全部まだ仮です、最後に作成します。
.diaries {
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