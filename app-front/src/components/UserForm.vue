<script setup>
import { ref, watch } from 'vue';

/**
 * ユーザー名エラーテキスト（空文字）
 */
const NAME_EMPTY_ERROR_TEXT = 'ユーザー名を入力して下さい。';

/**
 * ユーザー名エラーテキスト（文字数）
 */
const NAME_LENGTH_ERROR_TEXT = 'ユーザー名は10文字以内で入力して下さい。';

/**
 * パスワードエラーテキスト
 */
const PASSWORD_ERROR_TEXT = 'パスワードは4文字以上で入力して下さい。';

/**
 * props定義
 */
defineProps({
  buttonText: String, //ボタンテキスト
});

/**
 * emit定義
 */
const emit = defineEmits(['submit-form', 'input-form']);

/**
 * 入力フォーム：ユーザー名、パスワード
 */
const userForm = ref({ name: '', password: '' });

/**
 * ユーザー名エラー
 */
const nameError = ref('');

/**
 * パスワードエラー
 */
const passwordError = ref('');

/**
 * パスワード入力欄
 */
const passwordInputRef = ref(null);

// --- ユーザー名の入力値を監視 ---
watch(
  () => userForm.value.name,
  (newName) => {
    emit('input-form');
    // 10文字より多い場合にエラー
    if (newName.length > 10) {
      nameError.value = NAME_LENGTH_ERROR_TEXT;
    } else {
      // 10文字以内ならば、エラーを消す
      nameError.value = '';
    }
  }
);

// --- パスワードの入力値を監視 ---
watch(
  () => userForm.value.password,
  (newPassword) => {
    emit('input-form');
    // 0文字より大きく、4文字未満の場合にエラー
    if (0 < newPassword.length && newPassword.length < 4) {
      passwordError.value = PASSWORD_ERROR_TEXT;
    } else {
      // 4文字以上ならば、エラーを消す
      passwordError.value = '';
    }
  }
);

/**
 * ボタンクリック時の処理
 */
const handleSubmit = () => {
  // エラーフラグをリセット
  nameError.value = '';
  passwordError.value = '';

  // フォームが有効かどうかのフラグ
  let isValid = true;

  // ユーザー名のチェック
  if (userForm.value.name.length === 0) {
    // 空文字のエラー
    nameError.value = NAME_EMPTY_ERROR_TEXT;
    isValid = false;
  } else if (userForm.value.name.length > 10) {
    // 文字数オーバーのエラー
    nameError.value = NAME_LENGTH_ERROR_TEXT;
    isValid = false;
  }

  // パスワードのチェック
  if (userForm.value.password.length < 4) {
    // 4文字未満の場合エラー
    passwordError.value = PASSWORD_ERROR_TEXT;
    isValid = false;
  }

  // 親にイベントを送信
  if (isValid) {
    //@submit-formに設定された処理を実行
    emit('submit-form', userForm.value);
  }
};

/**
 * ユーザー名入力欄でEnterが押された時の処理
 */
const handleNameEnter = () => {
  // パスワード入力欄にフォーカスを当てる
  if (passwordInputRef.value) {
    passwordInputRef.value.focus();
  }
};

/**
 * パスワード入力欄でEnterが押された時の処理
 */
const handlePasswordEnter = () => {
  // ボタンクリック処理を実行
  handleSubmit();
};
</script>

<template>
  <div class="user-form">
    <div class="user-form__form-group">
      <label class="user-form__label" for="user-form__input-name"
        >ユーザー名</label
      >
      <input
        id="user-form__input-name"
        class="user-form__input-name"
        type="text"
        placeholder="ユーザー名"
        v-model.trim="userForm.name"
        @keydown.enter.prevent="handleNameEnter"
      />
      <p v-if="nameError" class="user-form__input-name-error">
        {{ nameError }}
      </p>
    </div>
    <div class="user-form__form-group">
      <label class="user-form__label" for="user-form__input-password"
        >パスワード</label
      >
      <input
        id="user-form__input-password"
        class="user-form__input-password"
        type="password"
        placeholder="パスワード"
        v-model.trim="userForm.password"
        ref="passwordInputRef"
        @keydown.enter.prevent="handlePasswordEnter"
      />
      <p v-if="passwordError" class="user-form__input-password-error">
        {{ passwordError }}
      </p>
    </div>
    <button class="user-form__button" @click="handleSubmit">
      {{ buttonText }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 3.2rem;

  @include tab {
    gap: 3.6rem;
  }

  @include pc {
    gap: 4rem;
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-weight: 700;
    font-size: clamp(14px, 1.4rem, 15px);
    letter-spacing: 0.1em;

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__input-name,
  &__input-password {
    @include input-text-style;
  }

  &__input-name-error,
  &__input-password-error {
    color: $red;
    font-size: clamp(14px, 1.4rem, 15px);

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__button {
    @include button-style-fill($brown, $white-brown);
  }
}
</style>