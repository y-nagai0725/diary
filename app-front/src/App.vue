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
  margin-top: 70px;

  @include tab {
    margin-top: 80px;
  }

  @include pc {
    margin-top: 100px;
  }
}
</style>