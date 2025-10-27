import { reactive } from 'vue';

/**
 * アプリ全体のローディング状態を管理する
 */
export const loadingState = reactive({
  /**
   * Gemini APIとの通信中かどうか
   */
  isGeminiLoading: false,
});