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

      // ログインAPIのリクエストではないかどうか
      const isNotLoginRequest = config.url !== '/api/login';

      // --- 401 (認証エラー) の場合 ---
      // トークン自体が無い、無効、または期限切れ。
      // ログインAPI以外からの401は、ログアウトさせる。
      if (status === 401 && isNotLoginRequest) {
        logout({ session: 'expired' });
      }
    }

    //それ以外のエラーの場合は、そのままエラーを次に渡す
    return Promise.reject(error);
  }
);

export default apiClient;