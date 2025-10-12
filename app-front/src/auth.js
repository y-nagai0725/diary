import { ref } from 'vue';
import router from '@/router';

// ログインしているかどうかを管理する変数、ローカルストレージのトークンの有無で初期化
export const isLoggedIn = ref(!!localStorage.getItem('token'));

/**
 * ログイン処理
 * @param {string} token
 */
export const login = (token) => {
  localStorage.setItem('token', token);
  isLoggedIn.value = true;
  router.push('/home');
};

/**
 * ログアウト処理
 */
export const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/login');
};