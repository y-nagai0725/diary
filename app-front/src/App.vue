<script setup>
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import FloatingCreateButton from '@/components/FloatingCreateButton.vue';
</script>

<template>
  <Header />

  <main>
    <div class="container">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </main>

  <Footer />

  <FloatingCreateButton />
</template>

<style lang="scss" scoped>
.container {
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
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>