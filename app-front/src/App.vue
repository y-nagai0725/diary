<script setup>
import { ref, watch, nextTick } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import FloatingCreateButton from '@/components/FloatingCreateButton.vue';
import Simplebar from 'simplebar-vue';

/**
 * 現在のルート情報を取得
 */
const route = useRoute();

/**
 * Simplebar要素
 */
const simplebarRef = ref(null);

/**
 * 画面切り替えを監視
 */
watch(
  () => route.path,
  async () => {
    // ---ページが切り替わったら---
    // 画面の更新が終わるのを待つ
    await nextTick();

    if (simplebarRef.value && simplebarRef.value.$el) {
      // Simplebarの中のスクロール要素を探す
      const scrollElement = simplebarRef.value.$el.querySelector(
        '.simplebar-content-wrapper'
      );
      if (scrollElement) {
        // スクロール位置を一番上 (0) にする
        scrollElement.scrollTop = 0;
      }
    }
  }
);
</script>

<template>
  <div class="app-container">
    <Header />

    <div class="contents-wrapper">
      <Simplebar
        class="main-contents-simplebar"
        ref="simplebarRef"
        :auto-hide="false"
      >
        <main class="main-contents">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
        <Footer />
      </Simplebar>
    </div>

    <FloatingCreateButton />
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.contents-wrapper {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
}

.main-contents-simplebar {
  height: 100%;

  &::v-deep(.simplebar-scrollbar::before) {
    //スクロールバー色
    background-color: $brown;

    //スクロールバー不透明度（デフォルト0.5）
    opacity: 0.85;
  }
}

.main-contents {
  @include contents-width;
  margin-top: calc(70px + 4rem);

  @include tab {
    margin-top: calc(80px + 6rem);
  }

  @include pc {
    margin-top: calc(100px + 8rem);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>