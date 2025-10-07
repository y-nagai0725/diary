<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api';

const userName = ref('');
const notice = ref('');
const recentDiaries = ref([]);

/**
 * 日記未登録時のメッセージ
 */
const NO_DIARIES_MESSAGE =
  'まだ日記が登録されていません。初めての日記を書いてみよう！';

/**
 * 今日の日記が未登録時のお知らせメッセージ
 */
const NOT_EXISTS_TODAY_DIARY_MESSAGE = '今日の日記がまだ登録されていません。';

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

/**
 * トークンからユーザー名を取得
 */
const getUserNameFromToken = () => {
  //ログイン時に発行したトークン
  const token = localStorage.getItem('token');

  //トークンが存在しない場合
  if (!token) {
    return null;
  }

  try {
    //トークンのペイロード部分取り出し
    const payload = token.split('.')[1];

    //Base64でデコードしJSON形式に変換
    const decodedPayload = JSON.parse(atob(payload));

    //ユーザー名を返す
    return decodedPayload.userName;
  } catch (error) {
    console.error('トークンの解析に失敗しました。', error);
    return null;
  }
};

/**
 * 直近5件の日記データ取得
 */
const getRecentDiaries = async () => {
  try {
    const response = await apiClient.get('/api/diaries/recent');
    return response.data;
  } catch (error) {
    console.error('直近5件の日記データの取得に失敗しました。', error);
    return [];
  }
};

/**
 * 本日の日記データが登録されているかどうか
 */
const existsTodayDiaryData = () => {
  //直近データがない場合
  if (recentDiaries.value.length === 0) {
    return false;
  }

  // 最新の日記の日付を'YYYY-MM-DD'形式にする
  const recentDate = formatDate(recentDiaries.value[0].date, '-');

  // 今日の日付も、同じ関数を使って'YYYY-MM-DD'形式にする
  const today = formatDate(new Date(), '-');

  //比較結果を返す
  return recentDate === today;
};

/**
 * マウント時の初期処理
 */
onMounted(async () => {
  //ユーザー名表示
  userName.value = getUserNameFromToken();

  //直近5件の日記データ取得、表示
  recentDiaries.value = await getRecentDiaries();

  //お知らせメッセージ表示
  if (recentDiaries.value.length === 0 || !existsTodayDiaryData()) {
    notice.value = NOT_EXISTS_TODAY_DIARY_MESSAGE;
  }
});
</script>
<template>
  <div class="home">
    <h1 class="home__title">ホーム画面</h1>
    <p class="home__user-name">{{ userName }}さん、こんにちは！</p>
    <p v-if="notice" class="home__notice">{{ notice }}</p>
    <div class="home__recent-diaries-area">
      <h2 class="home__sub-title">最近の日記</h2>
      <p v-if="recentDiaries.length === 0" class="home__no-diaries">
        {{ NO_DIARIES_MESSAGE }}
      </p>
      <div v-else class="home__diaries-grid">
        <div class="home__grid-header">日付</div>
        <div class="home__grid-header">日記内容</div>
        <div class="home__grid-header">Geminiコメント有無</div>
        <div class="home__grid-header">編集リンク</div>
        <div
          v-for="diary in recentDiaries"
          :key="diary.id"
          class="home__grid-row"
        >
          <p class="home__grid-item">{{ formatDate(diary.date) }}</p>
          <p class="home__grid-item">{{ diary.text }}</p>
          <p class="home__grid-item">
            <span v-if="diary.geminiComment" class="home__gemini-check"
              >コメント有</span
            >
            <span v-else class="home__gemini-check">コメント無</span>
          </p>
          <p class="home__grid-item">
            <RouterLink class="home__edit-link" :to="`/diary/${diary.id}`"
              >編集</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
    <RouterLink class="home__link" to="/diary/new">日記作成</RouterLink>
    <RouterLink class="home__link" to="/diaries">日記一覧</RouterLink>
  </div>
</template>
<style lang="scss" scoped>
//TODOメモ css(デザイン)はほとんど全部まだ仮です、最後に作成します。
.home {
  &__diaries-grid {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr 1fr;
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
}
</style>