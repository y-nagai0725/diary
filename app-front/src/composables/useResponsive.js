import { ref, computed, onMounted, onUnmounted } from 'vue';

/**
 * レスポンシブ対応用コンポーザブル関数
 * @returns 画面幅とPC表示判定変数を返す
 */
export function useResponsive() {
  /**
   * 画面幅
   */
  const windowWidth = ref(window.innerWidth);

  /**
   * PC表示（画面幅1024px以上）かどうか
   */
  const isPc = computed(() => windowWidth.value >= 1024);

  /**
   * リサイズイベント時のタイマー処理
   */
  let resizeTimeout = null;

  /**
   * 画面幅リサイズ時処理
   */
  const handleResize = () => {
    //以前のタイマー処理を削除
    clearTimeout(resizeTimeout);

    //150ミリ秒待ってから実行
    resizeTimeout = setTimeout(() => {
      windowWidth.value = window.innerWidth;
    }, 150);
  };

  onMounted(() => {
    //リサイズイベント時の処理設定
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    //リサイズイベント時の処理削除
    window.removeEventListener('resize', handleResize);
    //タイマー処理を削除
    clearTimeout(resizeTimeout);
  });

  // 画面幅とPC表示判定変数を返す
  return {
    windowWidth,
    isPc,
  };
}