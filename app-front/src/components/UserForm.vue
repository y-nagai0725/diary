<script setup>
import { ref } from 'vue';

// 親からもらうデータ定義
defineProps({
  formTitle: String, //フォームタイトル
  buttonText: String, //ボタンテキスト
});

const emit = defineEmits(['submit-form']);
const userForm = ref({ name: '', password: '' });

//送信時の処理
const handleSubmit = () => {
  emit('submit-form', userForm.value);
};
</script>

<template>
  <div class="user-form">
    <h1 class="user-form__title">{{ formTitle }}</h1>
    <div class="user-form__form">
      <div class="user-form__form-group">
        <input
          class="user-form__input-name"
          type="text"
          placeholder="ユーザー名"
          v-model.trim="userForm.name"
        />
      </div>
      <div class="user-form__form-group">
        <input
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
  </div>
</template>

<style lang="scss" scoped>
.user-form {
  /* ... */
}
</style>