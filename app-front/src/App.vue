<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <!-- ここにヘッダーとかナビゲーションを後で入れると良いかも！ -->
  </header>

  <main>
    <!-- ここに、URLに合わせて色々なページが表示されるよ！ -->
    <RouterView />
  </main>

  <footer>
    <!-- ここにフッターを入れると良いかも！ -->
  </footer>
</template>

<style scoped>
/* あとでここにスタイルを書こうね！ */
</style>