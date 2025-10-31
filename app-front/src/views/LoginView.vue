<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ConfirmModal from '@/components/ConfirmModal.vue';
import apiClient from '@/api';
import UserForm from '@/components/UserForm.vue';
import { login } from '@/auth.js';

/**
 * 通知メッセージ
 */
const notificationMessage = ref('');

/**
 * エラーメッセージ表示用
 */
const serverErrorMessage = ref('');

/**
 * ページアクセス管理用router
 */
const router = useRouter();

/**
 * ページ情報管理用route
 */
const route = useRoute();

// テストユーザー情報
const testUserData = {
  name: 'testUser',
  password: 'testPass',
};

/**
 * 結果モーダル表示・非表示
 */
const showResultModal = ref(false);

/**
 * 結果モーダルのメッセージ
 */
const resultMessage = ref('');

// UserFormからデータを受け取って、ログイン処理を実行
const handleLogin = async (formData) => {
  try {
    //ログイン
    const response = await apiClient.post('/api/login', formData);

    //トークン保存
    login(response.data.token);

    // URL に redirect クエリが付いているかチェック
    const redirectPath = route.query.redirect;

    if (redirectPath) {
      // redirect 先があれば、そこへ移動
      router.replace(redirectPath);
    } else {
      // redirect 先がなければ、デフォルトの Home へ移動
      router.replace('/home');
    }
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 400 || error.response.status === 401)
    ) {
      //エラーメッセージをログインボタンの下にテキストで表示
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

onMounted(() => {
  // 画面が表示された時にURLをチェック
  if (route.query.session === 'expired') {
    notificationMessage.value =
      'セッションが無効か期限切れです。再度ログインしてください。';
  }
});
</script>

<template>
  <div class="login">
    <h2 class="login__title">ログイン</h2>
    <div class="login__box">
      <p v-if="notificationMessage" class="login__notification-message">
        {{ notificationMessage }}
      </p>
      <UserForm
        buttonText="ログイン"
        @submit-form="handleLogin"
        @input-form="handleInput"
      />
      <p class="login__server-error-message">{{ serverErrorMessage }}</p>
      <p class="login__trial-description">
        日記機能をお試しで使ってみたい方はこちらから
      </p>
      <button
        class="login__trial-login-button"
        @click="handleLogin(testUserData)"
      >
        テストユーザーでお試しログイン
      </button>
      <p class="login__text">ユーザー未登録の方はこちらから</p>
      <RouterLink class="login__link" to="/register">ユーザー登録</RouterLink>
    </div>
    <ConfirmModal
      :show="showResultModal"
      :title="'ログインエラー'"
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
    padding: 2.4rem 0;

    @include tab {
      padding: 3.2rem 0;
    }

    @include pc {
      min-width: 320px;
      width: 44.8rem;
      margin-inline: auto;
      padding: 4rem 0;
    }
  }

  &__notification-message {
    margin-bottom: 1.6rem;
    color: $red;
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

  &__trial-login-button {
    @include button-style-fill($orange, $white-brown);
    width: 100%;
    margin-bottom: 1.6rem;

    @include tab {
      margin-bottom: 1.8rem;
    }

    @include pc {
      margin-bottom: 2rem;
    }
  }

  &__trial-description,
  &__text {
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