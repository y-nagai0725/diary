<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="not-found">
    <h1>404 - ページが見つかりません</h1>
    <p>お探しのページは存在しないか、移動した可能性があります。</p>
    <RouterLink to="/home">ホームに戻る</RouterLink>
  </div>
</template>

<style scoped>
.not-found {

}
</style>