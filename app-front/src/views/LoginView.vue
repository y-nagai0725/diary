<script setup>
import { ref } from 'vue';
import apiClient from '@/api';
import UserForm from '@/components/UserForm.vue';
import { login } from '@/auth.js';

/**
 * エラーメッセージ表示用
 */
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

    //トークン保存、home画面へ遷移
    login(response.data.token);
  } catch (error) {
    //サーバーからのログインエラーメッセージを表示
    console.error('ログインに失敗しました。', error);
    message.value = error.response.data.error;
  }
};
</script>

<template>
  <div class="login">
    <h1 class="login__title">ログイン</h1>
    <div class="login__box">
      <UserForm buttonText="ログイン" @submit-form="handleLogin" />
      <p class="login__message">{{ message }}</p>
      <p class="login__notice">ユーザー未登録の方はこちらから</p>
      <RouterLink class="login__link" to="/register">ユーザー登録</RouterLink>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.login {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  background-color: $white;
  border-radius: 10px;

  @include tab {
    width: 75%;
    margin-inline: auto;
    padding: 0 3rem;
  }

  @include pc {
    width: 100%;
    margin-inline: 0;
    padding: 0;
    flex-direction: row;
  }

  &__title {
    width: 100vw;
    height: 18rem;
    margin-inline: calc(50% - 50vw);
    padding-left: 2rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: $orange;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    color: $white-brown;
    font-weight: 700;
    font-size: clamp(24px, 2.4rem, 28px);
    letter-spacing: 0.1em;

    @include tab {
      width: calc(100% + 6rem);
      margin-inline: -3rem;
      padding-left: 3rem;
      font-size: clamp(28px, 2.8rem, 30px);
    }

    @include pc {
      width: 40%;
      height: auto;
      margin-inline: 0;
      padding-left: 0;
      justify-content: center;
      border-top-right-radius: 0;
      border-bottom-left-radius: 10px;
      font-size: clamp(30px, 3.4rem, 34px);
    }
  }

  &__box {
    padding: 4rem 0;

    @include tab {
      padding: 6rem 0;
    }

    @include pc {
      min-width: 320px;
      width: 44.8rem;
      margin-inline: auto;
      padding: 8rem 0;
    }
  }

  &__message {
    padding: 1.6rem 0;
    margin-bottom: 1.6rem;
    border-bottom: 1px solid $brown;
    color: $red;
    font-size: clamp(14px, 1.4rem, 15px);
    line-height: 1.8;

    @include tab {
      margin-bottom: 1.8rem;
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      margin-bottom: 2rem;
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__notice {
    text-align: center;
    margin-bottom: 1.6rem;
    font-size: clamp(12px, 1.2rem, 13px);

    @include tab {
      margin-bottom: 1.8rem;
      font-size: clamp(13px, 1.3rem, 14px);
    }

    @include pc {
      margin-bottom: 2rem;
      font-size: clamp(13px, 1.4rem, 14px);
    }
  }

  &__link {
    @include button-style-border($brown);
  }
}
</style>