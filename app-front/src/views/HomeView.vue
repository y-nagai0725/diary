<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api';
import CheckmarkIcon from '@/components/icons/CheckmarkIcon.vue';
import UserIcon from '@/components/icons/UserIcon.vue';
import PenIcon from '@/components/icons/PenIcon.vue';
import BookIcon from '@/components/icons/BookIcon.vue';
import { formatDate } from '@/utils/date.js';
import { userName } from '@/auth.js';

const notice = ref('');
const recentDiaries = ref([]);
const totalDiaries = ref(null);

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
 * 直近5件の日記データ取得
 */
const getRecentDiaries = async () => {
  try {
    const response = await apiClient.get('/api/diaries/recent');
    return response.data;
  } catch (error) {
    console.error('直近5件の日記データの取得に失敗しました。', error);
    return { recentDiaries: [], totalDiaries: null };
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
  //直近5件の日記データ取得、表示
  const responseData = await getRecentDiaries();
  recentDiaries.value = responseData.recentDiaries;
  totalDiaries.value = responseData.totalDiaries;

  //お知らせメッセージ表示
  if (recentDiaries.value.length === 0 || !existsTodayDiaryData()) {
    notice.value = NOT_EXISTS_TODAY_DIARY_MESSAGE;
  }
});
</script>
<template>
  <div class="home">
    <div class="home__user-information-wrapper">
      <div class="home__user-information">
        <UserIcon class="home__user-icon" />
        <div class="home__information-grid">
          <div class="home__information-grid-header">登録名：</div>
          <div class="home__information-grid-item">{{ userName }}</div>
          <div class="home__information-grid-header">投稿数：</div>
          <div class="home__information-grid-item">{{ totalDiaries }}</div>
        </div>
        <div class="home__information-link-wrapper">
          <RouterLink class="home__link-create" to="/diary/new"
            ><PenIcon class="home__pen-icon" />作成</RouterLink
          >
          <RouterLink class="home__link-list" to="/diaries"
            ><BookIcon class="home__book-icon" />一覧</RouterLink
          >
        </div>
      </div>
      <p v-if="notice" class="home__notice">{{ notice }}</p>
    </div>
    <div class="home__recent-diaries">
      <p class="home__sub-title">最近の日記</p>
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
          <p class="home__grid-item home__gemini-check">
            <CheckmarkIcon v-if="diary.geminiComment" />
          </p>
          <p class="home__grid-item">
            <RouterLink class="home__edit-link" :to="`/diary/${diary.id}`"
              >編集</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
//TODOメモ css(デザイン)はほとんど全部まだ仮です、最後に作成します。
.home {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  @include tab {
    gap: 2.4rem;
  }

  @include pc {
    flex-direction: row;
    gap: 10rem;
  }

  &__user-information-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    @include tab {
      width: 50%;
      margin-inline: auto;
      gap: 2.4rem;
    }

    @include pc {
      width: calc(100% / 3);
      margin-inline: initial;
      gap: 3.2rem;
    }
  }

  &__user-information {
    padding: 1.6rem;
    border-radius: 10px;
    background-color: $white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;

    @include tab {
      padding: 2rem;
      gap: 2rem;
    }

    @include pc {
      padding: 2.4rem;
      gap: 2.4rem;
    }
  }

  &__user-icon {
    width: 50px;
    fill: $brown;

    @include tab {
      width: 55px;
    }

    @include pc {
      width: 60px;
    }
  }

  &__information-grid {
    display: grid;
    grid-template-columns: [header] 1fr [item] 2.25fr;
    row-gap: 1rem;

    @include tab {
      row-gap: 1.3rem;
    }

    @include pc {
      row-gap: 1.6rem;
    }
  }

  &__information-grid-header,
  &__information-grid-item {
    font-size: clamp(14px, 1.4rem, 15px);

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__information-grid-header {
    grid-column: header;
  }

  &__information-grid-item {
    grid-column: item;
  }

  &__information-link-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__link-create,
  &__link-list {
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

  &__link-list {
    @include button-style-fill($brown, $white-brown);
  }

  &__book-icon {
    height: 1.5em;
    fill: $white-brown;
  }

  &__notice {
    padding: 1em;
    background-color: $white;
    border-radius: 10px;
    color: $red;
    font-size: clamp(14px, 1.4rem, 15px);
    line-height: 1.8;

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(14px, 1.6rem, 16px);
    }
  }

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