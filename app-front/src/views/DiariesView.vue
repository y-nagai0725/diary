<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import apiClient from '@/api';
import CheckmarkIcon from '@/components/icons/CheckmarkIcon.vue';

const diaries = ref([]);
const currentPage = ref(1);
const totalDiaries = ref(0);
const sortOrder = ref('desc');
const searchTerm = ref('');
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(totalDiaries.value / itemsPerPage));

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
 * 対象idの日記データを削除
 */
const handleDeleteDiary = async (id) => {
  //console.log(id);

  //TODO 確認モーダルウィンドウ（「○○○を削除します。よろしいですか？」 みたいなメッセージとOKボタンとキャンセルボタン）表示、OKボタンを押されたら次へ進む

  //削除処理
  try {
    //データベースから削除
    const response = await apiClient.delete(`/api/diaries/${id}`);

    //TODO 確認モーダルウィンドウ（「○○○を削除しました。」 みたいなメッセージとOKボタン）表示、OKボタンを押されたら次へ進む

    //1ページ目を再表示
    fetchDiaries(1);
  } catch (error) {
    console.error('日記データの削除に失敗しました。', error);
  }
};

/**
 * 日付を指定された形式の文字列にフォーマットする関数
 * @param {Date | String} date フォーマットしたい日付（Dateオブジェクトか日付文字列）
 * @param {String} separator区切り文字（デフォルトは '/'）
 * @returns {String} フォーマットされた日付文字列
 */
const formatDate = (date, separator = '/') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  //separatorの文字で区切る
  return `${year}${separator}${month}${separator}${day}`;
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
            @click="handleDeleteDiary(diary.id)"
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