<script setup>
import { ref } from 'vue';

// 親からもらうデータ定義
defineProps({
  buttonText: String, //ボタンテキスト
});

const emit = defineEmits(['submit-form']);
const userForm = ref({ name: '', password: '' });

//ボタンクリック時の処理
const handleSubmit = () => {
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
    border: 1px solid $brown;
    border-radius: 4px;
    padding: 0.65em;
    font-size: clamp(14px, 1.4rem, 15px);

    &::placeholder {
      color: $gray;
    }

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__button {
    cursor: pointer;
    height: 4.8rem;
    display: grid;
    place-content: center;
    background-color: $brown;
    border-radius: 100vmax;
    color: $white-brown;
    font-weight: 700;
    font-size: clamp(14px, 1.4rem, 15px);
    letter-spacing: 0.1em;

    @include tab {
      height: 5.2rem;
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      height: clamp(46px, 5.6rem, 56px);
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }
}
</style>