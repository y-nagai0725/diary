<script setup>
import { ref } from 'vue';

/**
 *
 */
defineProps({
  buttonText: String, //ボタンテキスト
});

/**
 *
 */
const emit = defineEmits(['submit-form']);

/**
 * 入力フォーム：ユーザー名、パスワード
 */
const userForm = ref({ name: '', password: '' });

/**
 * ユーザー名エラーテキスト
 */
const nameErrorText = ref('');

/**
 * パスワードエラーテキスト
 */
const passwordErrorText = ref('');

/**
 * ボタンクリック時の処理
 */
const handleSubmit = () => {
  //@submit-formに設定された処理を実行
  emit('submit-form', userForm.value);
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
      />
      <p v-if="nameErrorText" class="user-form__input-name-error">
        {{ nameErrorText }}
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
      />
      <p v-if="passwordErrorText" class="user-form__input-password-error">
        {{ passwordErrorText }}
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