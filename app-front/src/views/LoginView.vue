<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const userForm = ref({ name: '', password: '' });
const message = ref('');
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * リクエストヘッダーにトークンを設定
 * @param {String} token
 */
const setAuthHeader = (token) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * ログイン処理
 */
const login = async () => {
  //入力値チェック:ユーザー名
  if (!userForm.value.name) {
    message.value = 'ユーザー名を入力して下さい。';
    return;
  }

  //入力値チェック:パスワード
  if (!userForm.value.password) {
    message.value = 'パスワードを入力して下さい。';
    return;
  }

  try {
    //ログイン処理
    const response = await apiClient.post('/api/login', userForm.value);

    //サーバーから受け取ったトークン、ヘッダーとローカルストレージへ設定
    const token = response.data.token;
    setAuthHeader(token);
    localStorage.setItem('token', token);

    //ホーム画面へ遷移
    router.push('/home');
  } catch (error) {
    //エラーメッセージを表示
    message.value = error.response.data.error;
  }
};
</script>

<template>
  <div class="login">
    <h1 class="login__title">ログイン</h1>
    <div class="login__form">
      <div class="login__form-group">
        <input
          class="login__input-name"
          type="text"
          placeholder="ユーザー名"
          v-model.trim="userForm.name"
        />
      </div>
      <div class="login__form-group">
        <input
          class="login__input-password"
          type="password"
          placeholder="パスワード"
          v-model.trim="userForm.password"
        />
      </div>
      <button class="login__button" @click="login">ログインする</button>
      <p class="login__noice">
        まだユーザー登録してない方は
        <RouterLink class="login__link" to="/register"
          >こちらからユーザー登録</RouterLink
        >
      </p>
      <p v-if="message" class="login__message">{{ message }}</p>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.login {
}
</style>