<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api';
import UserForm from '@/components/UserForm.vue';

const router = useRouter();
const message = ref('');

// UserFormからデータを受け取って、ログイン処理を実行
const handleLogin = async (formData) => {
  // 入力値チェック
  if (!formData.name || !formData.password) {
    message.value = 'ユーザー名とパスワードを入力してください。';
    return;
  }

  try {
    //ログイン
    const response = await apiClient.post('/api/login', formData);

    //トークンをローカルストレージに保存
    localStorage.setItem('token', response.data.token);

    //ホーム画面へ遷移
    router.push('/home');
  } catch (error) {
    //サーバーからのログインエラーメッセージを表示
    message.value = error.response.data.error;
  }
};
</script>

<template>
  <div class="login">
    <UserForm
      formTitle="ログイン"
      buttonText="ログインする"
      @submit-form="handleLogin"
    />
    <p class="login__noice">
      まだユーザー登録してない方は
      <RouterLink class="login__link" to="/register"
        >こちらからユーザー登録</RouterLink
      >
    </p>
    <p v-if="message" class="login__message">{{ message }}</p>
  </div>
</template>
<style lang="scss" scoped>
.login {
}
</style>