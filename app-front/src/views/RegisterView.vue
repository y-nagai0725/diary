<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/ConfirmModal.vue';
import apiClient from '@/api';
import UserForm from '@/components/UserForm.vue';
import { login } from '@/auth.js';

/**
 * ページアクセス管理用router
 */
const router = useRouter();

/**
 * エラーメッセージ表示用
 */
const serverErrorMessage = ref('');

/**
 * 結果モーダル表示・非表示
 */
const showResultModal = ref(false);

/**
 * 結果モーダルのメッセージ
 */
const resultMessage = ref('');

// UserFormからデータを受け取って、ユーザー登録処理を実行
const handleRegister = async (formData) => {
  try {
    // ユーザー登録
    await apiClient.post('/api/register', formData);

    // そのままログイン処理へ
    const loginResponse = await apiClient.post('/api/login', formData);

    //トークン保存
    login(loginResponse.data.token);

    //home画面へ遷移
    router.push('/home');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      //エラーメッセージをユーザー登録ボタンの下にテキストで表示
      serverErrorMessage.value = error.response.data.error;
    } else {
      resultMessage.value =
        'サーバーにてエラーが発生しています。時間を空けてもう一度試してください。';
      showResultModal.value = true;
    }
  }
};

/**
 * 入力フォームへの入力時の処理
 */
const handleInput = () => {
  //サーバーからのエラーメッセージを消す
  serverErrorMessage.value = '';
};
</script>

<template>
  <div class="register">
    <h2 class="register__title">ユーザー登録</h2>
    <div class="register__box">
      <UserForm
        buttonText="ユーザー登録"
        @submit-form="handleRegister"
        @input-form="handleInput"
      />
      <p class="register__server-error-message">{{ serverErrorMessage }}</p>
      <p class="register__notice">登録済みの方はこちらから</p>
      <RouterLink class="register__link" to="/login">ログイン</RouterLink>
    </div>
    <ConfirmModal
      :show="showResultModal"
      :title="'ユーザー登録エラー'"
      :message="resultMessage"
      :confirmButtonText="'OK'"
      :confirmButtonClass="'confirm'"
      :confirmOnly="true"
      @confirm="showResultModal = false"
      @cancel="showResultModal = false"
    />
  </div>
</template>
<style lang="scss" scoped>
.register {
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

  &__server-error-message {
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