<script setup>
import { ref, onMounted } from 'vue';

const userName = ref('');

/**
 * トークンからユーザー名を取得
 */
const getUserNameFromToken = () => {
  //ログイン時に発行したトークン
  const token = localStorage.getItem('token');

  //トークンが存在しない場合
  if (!token) {
    return null;
  }

  try {
    //トークンのペイロード部分取り出し
    const payload = token.split('.')[1];

    //Base64でデコードしJSON形式に変換
    const decodedPayload = JSON.parse(atob(payload));

    //ユーザー名を返す
    return decodedPayload.userName;
  } catch (error) {
    console.error('トークンの解析に失敗しました。', error);
    return null;
  }
};

onMounted(() => {
  userName.value = getUserNameFromToken();
});
</script>
<template>
  <div class="home">
    <h1>ホーム画面</h1>
    <p>{{ userName }}さん、ようこそ！</p>
  </div>
</template>
<style lang="scss" scoped>
.home {
}
</style>