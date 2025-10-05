<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <header>
    <!-- ここにヘッダーとかナビゲーションを後で入れると良いかも！ -->
  </header>

  <main>
    <div class="container">
      <RouterView />
    </div>
  </main>

  <footer>
    <!-- ここにフッターを入れると良いかも！ -->
  </footer>
</template>

<style scoped>
/* あとでここにスタイルを書こうね！ */
</style>