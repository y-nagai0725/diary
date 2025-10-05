<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api';
import UserForm from '@/components/UserForm.vue';

const router = useRouter();
const message = ref('');

// UserFormからデータを受け取って、ユーザー登録処理を実行
const handleRegister = async (formData) => {
  // 入力値チェック
  if (!formData.name || !formData.password) {
    message.value = 'ユーザー名とパスワードを入力してください。';
    return;
  }

  try {
    // ユーザー登録
    await apiClient.post('/api/register', formData);

    // そのままログイン処理へ
    const loginResponse = await apiClient.post('/api/login', formData);
    localStorage.setItem('token', loginResponse.data.token);
    router.push('/home');
  } catch (error) {
    //サーバーからのエラーメッセージを表示
    message.value = error.response.data.error;
  }
};
</script>

<template>
  <div class="register">
    <UserForm
      formTitle="ユーザー登録"
      buttonText="登録する"
      @submit-form="handleRegister"
    />
    <p class="register__noice">
      登録済みの方は
      <RouterLink class="register__link" to="/login"
        >こちらからログイン</RouterLink
      >
    </p>
    <p v-if="message" class="register__message">{{ message }}</p>
  </div>
</template>