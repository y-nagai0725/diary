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
 * @param {string} token ログイントークン
 */
export const login = (token) => {
  localStorage.setItem('token', token);
  isLoggedIn.value = true;
  userName.value = getUserNameFromToken();
};

/**
 * ログアウト処理
 * @param {Object} redirectQuery クエリパラメータ
 */
export const logout = (redirectQuery = {}) => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  userName.value = null;

  // 受け取ったクエリパラメータを付けて、ログイン画面に遷移する
  router.push({ path: '/login', query: redirectQuery });
};

/**
 * トークンからユーザー名を取得
 * @returns ログインユーザー名
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
    return null;
  }
}