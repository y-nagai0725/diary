<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useResponsive } from '@/composables/useResponsive';
import { isLoggedIn } from '@/auth.js';
import PenIcon from '@/components/icons/PenIcon.vue';

/**
 * pc表示かどうか
 */
const { isPc } = useResponsive();

/**
 * ルート情報
 */
const route = useRoute();

/**
 * ボタンを表示するかしないか
 */
const isVisible = computed(() => {
  // SP表示である
  const isSpView = !isPc.value;

  // ログインしている
  const isAuthed = isLoggedIn.value;

  // 日記作成(diary-new)ページではない
  const isNotCreatePage = route.name !== 'diary-new';

  // 3つの条件を満たしている時は表示させる
  return isSpView && isAuthed && isNotCreatePage;
});
</script>

<template>
  <RouterLink v-if="isVisible" class="floating-create-button" to="/diary/new">
    <PenIcon class="floating-create-button__icon" />
  </RouterLink>
</template>

<style lang="scss" scoped>
.floating-create-button {
  position: fixed;
  bottom: 4rem;
  right: 2rem;
  height: 4.8rem;
  aspect-ratio: 1;
  border-radius: 100vmax;
  background-color: $orange;
  display: flex;
  justify-content: center;
  align-items: center;

  @include tab {
    bottom: 5rem;
    right: 3rem;
    height: 5.2rem;
  }

  &__icon {
    width: 45%;
    fill: none;
    stroke: $white-brown;
    stroke-width: 2;
  }
}
</style>