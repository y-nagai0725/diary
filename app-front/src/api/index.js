import axios from 'axios';
import { logout } from '@/auth.js';

//api呼び出し時のbaseURLを設定
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

//リクエスト時の事前処理
apiClient.interceptors.request.use(
  (config) => {
    //トークンがある場合はヘッダーに設定する
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  });

//レスポンス時の事後処理
apiClient.interceptors.response.use(
  //通信成功時、そのままデータを返す
  (response) => {
    return response;
  },
  //通信失敗時
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const config = error.config;

      // 401 (認証エラー) または 403 (権限エラー) かどうか
      const isAuthError = [401, 403].includes(status);

      // 日記更新or削除APIのリクエストかどうか
      const isDiaryUpdateOrDeleteRequest =
        config.url.startsWith('/api/diaries/') &&
        (config.method === 'put' || config.method === 'delete');

      // ログインAPIのリクエストではないかどうか
      const isNotLoginRequest = config.url !== '/api/login';

      // 認証エラー(401 or 403) で、
      // ログインAPIへのリクエストではなく、
      // かつ、日記の更新・削除リクエストでもない場合
      if (isAuthError && isNotLoginRequest && !isDiaryUpdateOrDeleteRequest) {
        // トークンが無効か期限切れ、ログアウト処理
        logout();
      }
    }

    //それ以外のエラーの場合は、そのままエラーを次に渡す
    return Promise.reject(error);
  }
);

export default apiClient;