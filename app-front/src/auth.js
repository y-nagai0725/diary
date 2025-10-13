import { ref } from 'vue';
import router from '@/router';

/**
 * ログインしているかどうかを管理する変数、ローカルストレージのトークンの有無で初期化
 */
export const isLoggedIn = ref(!!localStorage.getItem('token'));

/**
 * ログインユーザー名
 */
export const userName = ref(getUserNameFromToken());

/**
 * ログイン処理
 * @param {string} token
 */
export const login = (token) => {
  localStorage.setItem('token', token);
  isLoggedIn.value = true;
  userName.value = getUserNameFromToken();
  router.push('/home');
};

/**
 * ログアウト処理
 */
export const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  userName.value = null;
  router.push('/login');
};

/**
 * トークンからユーザー名を取得
 */
function getUserNameFromToken() {
  //ログイン時に発行したトークン
  const token = localStorage.getItem('token');

  //トークンが存在しない場合
  if (!token) {
    return null;
  }

  try {
    //トークンのペイロード部分取り出し
    const payload = token.split('.')[1];

    //Base64でデコードしJSON形式に変換
    const decodedPayload = JSON.parse(atob(payload));

    //ユーザー名を返す
    return decodedPayload.userName;
  } catch (error) {
    console.error('トークンの解析に失敗しました。', error);
    return null;
  }
}