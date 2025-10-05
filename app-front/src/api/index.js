import axios from 'axios';

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

export default apiClient;