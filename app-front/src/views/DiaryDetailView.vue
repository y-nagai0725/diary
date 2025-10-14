<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import apiClient from '@/api';
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { formatDate, isValidDate } from '@/utils/date.js';

/**
 * vue-router
 */
const router = useRouter();

/**
 * props定義
 */
const props = defineProps({
  id: String, //URLからの受け取り用
});

/**
 * 日記登録用の入力データ
 */
const diaryForm = ref({
  text: '',
  geminiComment: '',
  date: '',
});

/**
 * Gemini APIへの設定
 */
const promptSettings = ref({
  writerGenderKey: '',
  geminiGenderKey: '',
  relationKey: '',
  styleKey: '',
});

/**
 * Geminiコメント表示要素
 */
const geminiCommentSection = ref(null);

/**
 * Gemini APIとのやり取り中かどうか
 */
const isLoadingGeminiComment = ref(false);

/**
 * 編集モードかどうか（編集 or 新規作成モード）
 */
const isEditMode = computed(() => !!props.id);

/**
 * 結果モーダルの表示・非表示
 */
const showResultModal = ref(false);

/**
 * 結果モーダルの表示メッセージ
 */
const resultMessage = ref('');

/**
 * 結果モーダルのコールバック処理
 */
let resultModalCallBack = null;

/**
 * 日記保存処理（作成 or 更新）
 */
const saveDiary = async () => {
  //日付
  let date = diaryForm.value.date;

  //日記内容
  const text = diaryForm.value.text.trim();

  //Geminiコメント
  const geminiComment = diaryForm.value.geminiComment;

  //日付の入力チェック
  if (!isValidDate(date)) {
    resultMessage.value = '日付が未入力または不正な値が設定されています。';
    showResultModal.value = true;
    return;
  } else {
    //登録用にUTCに変換
    date = new Date(date).toISOString();
  }

  //日記内容の入力チェック
  if (!text) {
    resultMessage.value = '日記内容を入力して下さい。';
    showResultModal.value = true;
    return;
  }

  //apiへの送信データ
  const postData = {
    text,
    date,
    geminiComment,
  };

  if (isEditMode.value) {
    //更新処理
    try {
      await apiClient.put(`/api/diaries/${props.id}`, postData);

      //結果モーダルにメッセージを設定し、モーダルを表示する
      resultMessage.value = '日記を更新しました。';
      showResultModal.value = true;
    } catch (error) {
      console.error('日記更新が失敗しました。', error);

      //結果モーダルにエラーメッセージを設定し、モーダルを表示する
      resultMessage.value = '日記更新が失敗しました。';
      showResultModal.value = true;
    }
  } else {
    //新規作成処理
    try {
      const newDiary = await apiClient.post('/api/diaries', postData);

      //結果モーダルのコールバック処理設定
      resultModalCallBack = () => {
        //作成した日記の更新モード画面へ遷移
        const newDiaryId = newDiary.data.id;
        router.push(`/diary/${newDiaryId}`);
      };

      //結果モーダルにメッセージを設定し、モーダルを表示する
      resultMessage.value = '日記を登録しました。';
      showResultModal.value = true;
    } catch (error) {
      console.error('日記登録が失敗しました。', error);

      //結果モーダルにエラーメッセージを設定し、モーダルを表示する
      resultMessage.value = '日記登録が失敗しました。';
      showResultModal.value = true;
    }
  }
};

/**
 * 日記内容に対してGeminiからコメントを取得する
 */
const getGeminiComment = async () => {
  //日記内容
  const diaryText = diaryForm.value.text.trim();

  //Gemini APIへの設定
  const { writerGenderKey, geminiGenderKey, relationKey, styleKey } =
    promptSettings.value;

  //入力値チェック
  if (!diaryText) {
    resultMessage.value = '日記内容を入力して下さい。';
    showResultModal.value = true;
    return;
  } else if (
    !writerGenderKey ||
    !geminiGenderKey ||
    !relationKey ||
    !styleKey
  ) {
    resultMessage.value = 'Gemini APIの設定を全て選択して下さい。';
    showResultModal.value = true;
    return;
  }

  //ボタンをローディング状態にする
  isLoadingGeminiComment.value = true;

  //Geminiコメントの表示をクリア
  diaryForm.value.geminiComment = '';

  try {
    //Geminiからのコメントを取得
    const response = await apiClient.post(`/api/comment`, {
      diaryText,
      writerGenderKey,
      geminiGenderKey,
      relationKey,
      styleKey,
    });

    //Geminiからのコメントを表示
    diaryForm.value.geminiComment = response.data.comment;

    //コメントが表示されるのを待ってから、次の処理を実行する
    await nextTick();

    //コメントを表示している要素が画面中央にくるまでスクロールさせる
    if (geminiCommentSection.value) {
      geminiCommentSection.value.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // 画面の真ん中に表示
      });
    }
  } catch (error) {
    console.error('Geminiからのコメント取得に失敗しました。', error);
    resultMessage.value = 'Geminiからのコメント取得に失敗しました。';
    showResultModal.value = true;
  }

  //ローディング状態解除
  isLoadingGeminiComment.value = false;
};

/**
 * 日付ボックスに現在日付時刻を設定
 */
const setNowDate = () => {
  diaryForm.value.date = formatDate(new Date(), '-', true);
};

/**
 * 結果モーダルを閉じる
 */
const closeResultModal = () => {
  //モーダルを非表示
  showResultModal.value = false;

  //メッセージを空に
  resultMessage.value = '';

  if (resultModalCallBack) {
    //設定されているコールバック処理を実行
    resultModalCallBack();

    //コールバック処理を空に
    resultModalCallBack = null;
  }
};

/**
 * 初期表示設定
 */
const initDisplay = async () => {
  //ローカルストレージからGemini APIへの設定を取得、空の場合は初期値設定
  const settings = {
    writerGender: localStorage.getItem('writerGender')
      ? localStorage.getItem('writerGender')
      : 'other',
    geminiGender: localStorage.getItem('geminiGender')
      ? localStorage.getItem('geminiGender')
      : 'other',
    relation: localStorage.getItem('relation')
      ? localStorage.getItem('relation')
      : 'other',
    style: localStorage.getItem('style')
      ? localStorage.getItem('style')
      : 'empathy',
  };

  //日記の書き手の性別
  promptSettings.value.writerGenderKey = settings.writerGender;

  //Geminiの性別
  promptSettings.value.geminiGenderKey = settings.geminiGender;

  //日記の書き手との関係性
  promptSettings.value.relationKey = settings.relation;

  //Geminiのコメントスタイル
  promptSettings.value.styleKey = settings.style;

  if (isEditMode.value) {
    // --- 更新モードの時の処理 ---
    try {
      //更新対象の日記データ取得
      const response = await apiClient.get(`/api/diaries/${props.id}`);

      //取得日記データから日付、日記内容、Geminiからのコメントを表示
      diaryForm.value.date = formatDate(response.data.date, '-', true);
      diaryForm.value.text = response.data.text;
      diaryForm.value.geminiComment = response.data.geminiComment;
    } catch (error) {
      console.error('日記の取得に失敗しました。', error);
      resultMessage.value = '日記の取得に失敗しました。';
      showResultModal.value = true;
      resultModalCallBack = () => {
        //日記一覧画面へ遷移
        router.push(`/diaries`);
      };
    }
  } else {
    // --- 新規作成モードの時の処理 ---
    //日付ボックスに現在日付時刻を設定
    setNowDate();
  }
};

/**
 * Gemini APIの設定変更時処理
 */
watch(
  promptSettings,
  () => {
    //書き手との関係性がGeminiの性別によっておかしくならように、関係性を'その他'に設定
    if (
      (promptSettings.value.geminiGenderKey === 'female' &&
        (promptSettings.value.relationKey === 'olderBrother' ||
          promptSettings.value.relationKey === 'youngerBrother')) ||
      (promptSettings.value.geminiGenderKey === 'male' &&
        (promptSettings.value.relationKey === 'olderSister' ||
          promptSettings.value.relationKey === 'youngerSister')) ||
      (promptSettings.value.geminiGenderKey === 'other' &&
        (promptSettings.value.relationKey === 'olderBrother' ||
          promptSettings.value.relationKey === 'youngerBrother' ||
          promptSettings.value.relationKey === 'olderSister' ||
          promptSettings.value.relationKey === 'youngerSister'))
    ) {
      promptSettings.value.relationKey = 'other';
    }

    //ローカルストレージに設定を保存
    localStorage.setItem('writerGender', promptSettings.value.writerGenderKey);
    localStorage.setItem('geminiGender', promptSettings.value.geminiGenderKey);
    localStorage.setItem('relation', promptSettings.value.relationKey);
    localStorage.setItem('style', promptSettings.value.styleKey);
  },
  { deep: true }
);

/**
 * （編集 or 新規作成）モード変更時処理
 */
watch(isEditMode, () => {
  if (!isEditMode.value) {
    //新規作成モードに変わった場合は、入力内容を全てクリア
    diaryForm.value.text = '';
    diaryForm.value.geminiComment = '';
    setNowDate();
  }
});

onMounted(() => {
  //初期表示設定
  initDisplay();
});
</script>

<template>
  <div class="diary">
    <h1 class="diary__title">
      {{ isEditMode ? '日記の編集' : '新しい日記の作成' }}
    </h1>
    <div class="diary__link-button-wrapper">
      <RouterLink class="diary__link" to="/home">ホーム</RouterLink>
      <RouterLink class="diary__link" to="/diaries">日記一覧</RouterLink>
      <RouterLink v-if="isEditMode" class="diary__link" to="/diary/new"
        >日記作成</RouterLink
      >
    </div>
    <div class="diary__input-area">
      <div class="diary__form-group">
        <label class="diary__input-label" for="diary__input-date">日付</label>
        <input
          class="diary__input-date"
          v-model="diaryForm.date"
          type="datetime-local"
          id="diary__input-date"
        />
        <button class="diary__now-date-button" @click="setNowDate()">
          現在時刻設定
        </button>
      </div>
      <div class="diary__form-group">
        <label class="diary__input-label" for="diary__input-text"
          >日記内容</label
        >
        <textarea
          id="diary__input-text"
          class="diary__input-text"
          v-model.trim="diaryForm.text"
          rows="6"
          placeholder="（例）今日は天気が良くて気持ちよかったから、近所の公園を散歩した。"
        ></textarea>
      </div>
    </div>
    <div class="diary__prompt-settings">
      <p class="diary__sub-title">GeminiAPIの設定</p>
      <div class="diary__group-wrapper">
        <fieldset class="diary__setting-group">
          <legend class="diary__caption">日記の書き手の性別</legend>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="writer-gender-other"
              class="diary__radio"
              value="other"
              v-model="promptSettings.writerGenderKey"
            />
            <label for="writer-gender-other" class="diary__setting-label"
              >無し</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="writer-gender-male"
              class="diary__radio"
              value="male"
              v-model="promptSettings.writerGenderKey"
            />
            <label for="writer-gender-male" class="diary__setting-label"
              >男性</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="writer-gender-female"
              class="diary__radio"
              value="female"
              v-model="promptSettings.writerGenderKey"
            />
            <label for="writer-gender-female" class="diary__setting-label"
              >女性</label
            >
          </div>
        </fieldset>
        <fieldset class="diary__setting-group">
          <legend class="diary__caption">Geminiの性別</legend>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="gemini-gender-other"
              class="diary__radio"
              value="other"
              v-model="promptSettings.geminiGenderKey"
            />
            <label for="gemini-gender-other" class="diary__setting-label"
              >無し</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="gemini-gender-male"
              class="diary__radio"
              value="male"
              v-model="promptSettings.geminiGenderKey"
            />
            <label for="gemini-gender-male" class="diary__setting-label"
              >男性</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="gemini-gender-female"
              class="diary__radio"
              value="female"
              v-model="promptSettings.geminiGenderKey"
            />
            <label for="gemini-gender-female" class="diary__setting-label"
              >女性</label
            >
          </div>
        </fieldset>
        <fieldset class="diary__setting-group">
          <legend class="diary__caption">日記の書き手との関係性</legend>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="relation-other"
              class="diary__radio"
              value="other"
              v-model="promptSettings.relationKey"
            />
            <label for="relation-other" class="diary__setting-label"
              >無し</label
            >
          </div>
          <div
            v-if="promptSettings.geminiGenderKey === 'male'"
            class="diary__radio-item"
          >
            <input
              type="radio"
              id="relation-older-brother"
              class="diary__radio"
              value="olderBrother"
              v-model="promptSettings.relationKey"
            />
            <label for="relation-older-brother" class="diary__setting-label"
              >兄</label
            >
          </div>
          <div
            v-if="promptSettings.geminiGenderKey === 'male'"
            class="diary__radio-item"
          >
            <input
              type="radio"
              id="relation-younger-brother"
              class="diary__radio"
              value="youngerBrother"
              v-model="promptSettings.relationKey"
            />
            <label for="relation-younger-brother" class="diary__setting-label"
              >弟</label
            >
          </div>
          <div
            v-if="promptSettings.geminiGenderKey === 'female'"
            class="diary__radio-item"
          >
            <input
              type="radio"
              id="relation-older-sister"
              class="diary__radio"
              value="olderSister"
              v-model="promptSettings.relationKey"
            />
            <label for="relation-older-sister" class="diary__setting-label"
              >姉</label
            >
          </div>
          <div
            v-if="promptSettings.geminiGenderKey === 'female'"
            class="diary__radio-item"
          >
            <input
              type="radio"
              id="relation-younger-sister"
              class="diary__radio"
              value="youngerSister"
              v-model="promptSettings.relationKey"
            />
            <label for="relation-younger-sister" class="diary__setting-label"
              >妹</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="relation-friend"
              class="diary__radio"
              value="friend"
              v-model="promptSettings.relationKey"
            />
            <label for="relation-friend" class="diary__setting-label"
              >友人</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="relation-lover"
              class="diary__radio"
              value="lover"
              v-model="promptSettings.relationKey"
            />
            <label for="relation-lover" class="diary__setting-label"
              >恋人</label
            >
          </div>
        </fieldset>
        <fieldset class="diary__setting-group">
          <legend class="diary__caption">Geminiのコメントスタイル</legend>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="comment-style-empathy"
              class="diary__radio"
              value="empathy"
              v-model="promptSettings.styleKey"
            />
            <label for="comment-style-empathy" class="diary__setting-label"
              >共感</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="comment-style-advice"
              class="diary__radio"
              value="advice"
              v-model="promptSettings.styleKey"
            />
            <label for="comment-style-advice" class="diary__setting-label"
              >アドバイス</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="comment-style-encouragement"
              class="diary__radio"
              value="encouragement"
              v-model="promptSettings.styleKey"
            />
            <label
              for="comment-style-encouragement"
              class="diary__setting-label"
              >激励</label
            >
          </div>
          <div class="diary__radio-item">
            <input
              type="radio"
              id="comment-style-suggestion"
              class="diary__radio"
              value="suggestion"
              v-model="promptSettings.styleKey"
            />
            <label for="comment-style-suggestion" class="diary__setting-label"
              >提案</label
            >
          </div>
        </fieldset>
      </div>
    </div>
    <button
      class="diary__submit-gemini-button"
      :disabled="isLoadingGeminiComment"
      @click="getGeminiComment()"
    >
      <span
        v-if="isLoadingGeminiComment"
        class="diary__gemini-button-text loading"
        >Gemini考え中…</span
      >
      <span v-else class="diary__gemini-button-text"
        >Geminiにコメントをもらう</span
      >
    </button>
    <div
      v-if="diaryForm.geminiComment"
      ref="geminiCommentSection"
      class="diary__gemini-comment"
    >
      <p class="diary__gemini-comment-title">Geminiからのコメント</p>
      <p class="diary__gemini-comment-text">{{ diaryForm.geminiComment }}</p>
    </div>
    <button
      v-if="isEditMode"
      class="diary__update-button"
      :disabled="isLoadingGeminiComment"
      @click="saveDiary()"
    >
      更新
    </button>
    <button
      v-else
      class="diary__register-button"
      :disabled="isLoadingGeminiComment"
      @click="saveDiary()"
    >
      登録
    </button>

    <ConfirmModal
      :show="showResultModal"
      :message="resultMessage"
      :confirmOnly="true"
      @confirm="closeResultModal"
    />
  </div>
</template>
<style lang="scss" scoped>
//TODOメモ css(デザイン)はほとんど全部まだ仮です、最後に作成します。
.diary {
  $parent: &;

  &__form-group {
    display: flex;
    flex-direction: column;
  }

  &__radio {
    display: none;

    &:checked + #{$parent}__setting-label {
      background-color: $orange;
      color: $white-brown;
    }
  }

  &__setting-label {
    cursor: pointer;
    display: block;
    padding: 1rem;
    border: 1px solid $orange;
    border-radius: 4px;
    font-size: clamp(12px, 1.2rem, 14px);
    transition: background-color 0.3s ease-out, color 0.3s ease-out;

    @include tab {
      padding: 1.2rem;
      font-size: clamp(14px, 1.4rem, 16px);
    }

    @include pc {
      padding: 1.4rem;
      font-size: clamp(14px, 1.6rem, 16px);
    }
  }

  &__now-date-button {
    cursor: pointer;
  }

  &__submit-gemini-button {
    cursor: pointer;
    display: block;

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__gemini-button-text {
    display: flex;
    align-items: center;
    gap: 1em;

    &.loading::before {
      content: '';
      width: 1.5em;
      aspect-ratio: 1;
      border-radius: 100vmax;
      border: 3px solid gray;
      border-top-color: black;
      animation: spinner 1.5s linear infinite;
    }

    @keyframes spinner {
      to {
        transform: rotate(360deg);
      }
    }
  }

  &__update-button,
  &__register-button {
    cursor: pointer;
    display: block;

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__update-button {
  }

  &__register-button {
  }
}
</style>