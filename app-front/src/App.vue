<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <Header />

  <main>
    <div class="container">
      <RouterView />
    </div>
  </main>

  <Footer />
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