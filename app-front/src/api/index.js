import axios from 'axios';
import router from '@/router';

//api呼び出し時のbaseURLを設定
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

//リクエスト時の事前処理
apiClient.interceptors.request.use((config) => {
  //トークンがある場合はヘッダーに設定する
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//レスポンス時の事後処理
apiClient.interceptors.response.use(
  //通信成功時、そのままデータを返す
  (response) => {
    return response;
  },
  //通信失敗時
  (error) => {
    //エラーが「401 Unauthorized」か「403 Forbidden」且つ、ログイン処理のapiではない場合
    if (error.response && [401, 403].includes(error.response.status) && error.config.url !== '/api/login') {
      console.error('トークンが無効か期限切れです。ログイン画面に移動します。');

      //トークン削除
      localStorage.removeItem('token');

      //ログイン画面に遷移
      router.push('/login');
    }

    //それ以外のエラーの場合は、そのままエラーを次に渡す
    return Promise.reject(error);
  }
);

export default apiClient;