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
      <RouterView />
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
</style>