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
 * ユーザー登録処理
 */
const register = async () => {
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
    //ユーザー登録処理
    await apiClient.post('/api/register', userForm.value);

    //ログイン処理
    const loginResponse = await apiClient.post('/api/login', userForm.value);

    //サーバーから受け取ったトークンをヘッダーとローカルストレージへ設定
    const token = loginResponse.data.token;
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
  <div class="register">
    <h1 class="register__title">ユーザー登録</h1>
    <div class="register__form">
      <div class="register__form-group">
        <input
          class="register__input-name"
          type="text"
          placeholder="ユーザー名"
          v-model.trim="userForm.name"
        />
      </div>
      <div class="register__form-group">
        <input
          class="register__input-password"
          type="password"
          placeholder="パスワード"
          v-model.trim="userForm.password"
        />
      </div>
      <button class="register__button" @click="register">登録する</button>
      <p class="register__noice">
        登録済みの方は
        <RouterLink class="register__link" to="/login"
          >こちらからログイン</RouterLink
        >
      </p>
      <p v-if="message" class="register__message">{{ message }}</p>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.register {
}
</style>