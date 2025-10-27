<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { loadingState } from '@/loadingState.js';
import { useResponsive } from '@/composables/useResponsive.js';
import apiClient from '@/api';
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { formatDate, isValidDate } from '@/utils/date.js';
import CaretRightIcon from '@/components/icons/CaretRightIcon.vue';
import CaretLeftIcon from '@/components/icons/CaretLeftIcon.vue';
import PenIcon from '@/components/icons/PenIcon.vue';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import BookIcon from '@/components/icons/BookIcon.vue';
import ClockIcon from '@/components/icons/ClockIcon.vue';
import VueDatePicker from '@vuepic/vue-datepicker';

/**
 * PC表示かどうか
 */
const { isPc } = useResponsive();

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
 * 次の日記のid
 */
const nextDiaryId = ref(null);

/**
 * 前の日記のid
 */
const prevDiaryId = ref(null);

/**
 * ボタンを非活性にするかどうか
 */
const isDisabled = computed(() => loadingState.isGeminiLoading);

/**
 * Gemini API設定の表示・非表示 (SP用)
 */
const isGeminiSettingsOpenSp = ref(false);

/**
 * Gemini API設定が表示されているか (PCでは常にtrue, SPではisGeminiSettingsOpenSpに依存)
 */
const isGeminiSettingsOpen = computed(() =>
  isPc.value ? true : isGeminiSettingsOpenSp.value
);

/**
 * Gemini API設定を開閉する (SP用)
 */
const toggleGeminiSettings = () => {
  if (!isPc.value) {
    // SPの時だけ実行
    isGeminiSettingsOpenSp.value = !isGeminiSettingsOpenSp.value;
  }
};

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
 * 編集モードかどうか（編集 or 新規作成モード）
 */
const isEditMode = computed(() => !!props.id);

/**
 * 削除モーダルの表示・非表示
 */
const showDeleteModal = ref(false);

/**
 * 削除対象の日記ID
 */
const deleteTargetId = ref(null);

/**
 * 削除対象の日記の日付
 */
const deleteTargetDate = ref('');

/**
 * 結果モーダルの表示・非表示
 */
const showResultModal = ref(false);

/**
 * 結果モーダルの表示メッセージ
 */
const resultMessage = ref('');

/**
 * 結果モーダルのタイトル
 */
const resultTitle = ref('');

/**
 * 結果モーダルのコールバック処理
 */
let resultModalCallBack = null;

/**
 * 前後の日記IDを取得する
 */
const fetchNeighborIds = async (diaryId) => {
  if (!diaryId) return; // IDがなかったら何もしない
  try {
    const response = await apiClient.get(`/api/diaries/${diaryId}/neighbors`);
    prevDiaryId.value = response.data.prevId;
    nextDiaryId.value = response.data.nextId;
  } catch (error) {
    throw error;
  }
};

/**
 * 日記保存処理（作成 or 更新）
 */
const saveDiary = async () => {
  //日付
  const date = diaryForm.value.date;

  //日記内容
  const text = diaryForm.value.text.trim();

  //Geminiコメント
  const geminiComment = diaryForm.value.geminiComment;

  //日付の入力チェック
  if (!isValidDate(date)) {
    resultTitle.value = '未入力エラー';
    resultMessage.value = '日付が未入力または不正な値です。';
    showResultModal.value = true;
    return;
  }

  //日記内容の入力チェック
  if (!text) {
    resultTitle.value = '未入力エラー';
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
      resultTitle.value = '日記更新';
      resultMessage.value = '日記を更新しました。';
      showResultModal.value = true;
    } catch (error) {
      //結果モーダルにエラーメッセージを設定し、モーダルを表示する
      if (error.response && error.response.status === 400) {
        resultMessage.value =
          '日記更新が失敗しました。' + error.response.data.error;
      } else if (error.response && error.response.status === 403) {
        resultMessage.value =
          '日記更新が失敗しました。対象の日記が存在しない、または既に削除されている可能性があります。';
      } else {
        resultMessage.value =
          'サーバーにてエラーが発生しています。時間を空けてもう一度試してください。';
      }
      resultTitle.value = '更新エラー';
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
      resultTitle.value = '日記登録';
      resultMessage.value = '日記を登録しました。';
      showResultModal.value = true;
    } catch (error) {
      //結果モーダルにエラーメッセージを設定し、モーダルを表示する
      if (error.response && error.response.status === 400) {
        resultMessage.value =
          '日記登録が失敗しました。' + error.response.data.error;
      } else {
        resultMessage.value =
          'サーバーにてエラーが発生しています。時間を空けてもう一度試してください。';
      }
      resultTitle.value = '登録エラー';
      showResultModal.value = true;
    }
  }
};

/**
 * 削除ボタンが押された時の処理
 */
const handleDeleteDiary = () => {
  // 削除確認モーダルを表示する
  showDeleteModal.value = true;
};

/**
 * 日記削除処理
 */
const deleteDiary = async () => {
  // モーダルを閉じる
  showDeleteModal.value = false;

  try {
    // データベースから削除
    await apiClient.delete(`/api/diaries/${deleteTargetId.value}`);

    //結果モーダルのコールバック処理設定
    resultModalCallBack = () => {
      //一覧画面へ遷移
      router.push('/diaries');
    };

    // 完了メッセージを設定して、結果モーダルを表示
    resultTitle.value = '削除完了';
    resultMessage.value = `${deleteTargetDate.value} の日記を削除しました。`;
    showResultModal.value = true;
  } catch (error) {
    // エラーメッセージを設定して、結果モーダルを表示
    if (error.response && error.response.status === 403) {
      resultMessage.value = `${deleteTargetDate.value} の日記の削除に失敗しました。日記が存在しないか、既に削除されている可能性があります。`;
    } else {
      resultMessage.value = `サーバーにてエラーが発生しています。時間を空けてもう一度試してください。`;
    }
    resultTitle.value = '削除エラー';
    showResultModal.value = true;
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
    resultTitle.value = '未入力エラー';
    resultMessage.value = '日記内容を入力して下さい。';
    showResultModal.value = true;
    return;
  } else if (
    !writerGenderKey ||
    !geminiGenderKey ||
    !relationKey ||
    !styleKey
  ) {
    resultTitle.value = '未選択エラー';
    resultMessage.value = 'Gemini APIの設定を全て選択して下さい。';
    showResultModal.value = true;
    return;
  }

  //ボタンをローディング状態にする
  loadingState.isGeminiLoading = true;

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
    if (error.response && error.response.status === 400) {
      resultMessage.value = error.response.data.error;
    } else {
      resultMessage.value =
        'Geminiからのコメント取得に失敗しました。時間を空けてもう一度試してください。';
    }
    resultTitle.value = 'Gemini API エラー';
    showResultModal.value = true;
  }

  //ローディング状態解除
  loadingState.isGeminiLoading = false;
};

/**
 * 日付ボックスに現在日付時刻を設定
 */
const setNowDate = () => {
  diaryForm.value.date = new Date();
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
 * 削除確認モーダルで「キャンセル」が押された時の処理
 */
const cancelDelete = () => {
  // モーダルを閉じる
  showDeleteModal.value = false;
};

/**
 * 日付選択ボックス用フォーマッター
 */
const formatter = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year} 年 ${month} 月 ${day} 日 ${hours}:${minutes}`;
};

/**
 * 初期表示設定
 */
const initializeDisplay = async () => {
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
      //urlからidを取得
      const diaryId = props.id;

      //更新対象の日記データ取得
      const response = await apiClient.get(`/api/diaries/${diaryId}`);

      //取得日記データから日付、日記内容、Geminiからのコメントを表示
      diaryForm.value.date = response.data.date;
      diaryForm.value.text = response.data.text;
      diaryForm.value.geminiComment = response.data.geminiComment;

      //削除用にidと日付データ取得
      deleteTargetId.value = response.data.id;
      deleteTargetDate.value = formatDate(response.data.date, '-', true);

      //前後のidを取得
      await fetchNeighborIds(diaryId);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        resultMessage.value =
          '日記の取得に失敗しました。対象の日記は存在していない、または既に削除された可能性があります。';
      } else {
        resultMessage.value =
          'サーバーにてエラーが発生しています。時間を空けてもう一度試してください。';
      }
      resultTitle.value = '日記取得エラー';
      showResultModal.value = true;
      resultModalCallBack = () => {
        //日記一覧画面へ遷移
        router.push(`/diaries`);
      };
    }
  } else {
    // --- 新規作成モードの時の処理 ---

    //日記内容、Geminiコメントを空に
    diaryForm.value.text = '';
    diaryForm.value.geminiComment = '';

    //日付ボックスに現在日付時刻を設定
    setNowDate();

    // 新規作成時は前後はない
    prevDiaryId.value = null;
    nextDiaryId.value = null;
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
 *
 */
watch(
  () => props.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      // IDが変わったら再表示
      initializeDisplay();
    }
  }
);

onMounted(() => {
  //初期表示設定
  initializeDisplay();
});
</script>

<template>
  <div class="diary">
    <div class="diary__gemini-settings-wrapper">
      <p
        class="diary__settings-title"
        :class="{ 'is-opened-menu': isGeminiSettingsOpen }"
        @click="toggleGeminiSettings"
      >
        Gemini API 設定
      </p>
      <Transition name="gemini-accordion">
        <div v-show="isGeminiSettingsOpen" class="diary__prompt-settings">
          <div class="diary__setting-group">
            <p class="diary__setting-heading">日記の書き手の性別</p>
            <div class="diary__radio-wrapper">
              <div class="diary__radio-item">
                <input
                  type="radio"
                  id="writer-gender-other"
                  class="diary__radio"
                  value="other"
                  v-model="promptSettings.writerGenderKey"
                />
                <label for="writer-gender-other" class="diary__radio-label"
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
                <label for="writer-gender-male" class="diary__radio-label"
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
                <label for="writer-gender-female" class="diary__radio-label"
                  >女性</label
                >
              </div>
            </div>
          </div>
          <div class="diary__setting-group">
            <p class="diary__setting-heading">Geminiの性別</p>
            <div class="diary__radio-wrapper">
              <div class="diary__radio-item">
                <input
                  type="radio"
                  id="gemini-gender-other"
                  class="diary__radio"
                  value="other"
                  v-model="promptSettings.geminiGenderKey"
                />
                <label for="gemini-gender-other" class="diary__radio-label"
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
                <label for="gemini-gender-male" class="diary__radio-label"
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
                <label for="gemini-gender-female" class="diary__radio-label"
                  >女性</label
                >
              </div>
            </div>
          </div>
          <div class="diary__setting-group">
            <p class="diary__setting-heading">日記の書き手との関係性</p>
            <div class="diary__radio-wrapper">
              <div class="diary__radio-item">
                <input
                  type="radio"
                  id="relation-other"
                  class="diary__radio"
                  value="other"
                  v-model="promptSettings.relationKey"
                />
                <label for="relation-other" class="diary__radio-label"
                  >無し</label
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
                <label for="relation-friend" class="diary__radio-label"
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
                <label for="relation-lover" class="diary__radio-label"
                  >恋人</label
                >
              </div>
              <div
                v-if="promptSettings.geminiGenderKey === 'male'"
                class="diary__radio-item row-2"
              >
                <input
                  type="radio"
                  id="relation-older-brother"
                  class="diary__radio"
                  value="olderBrother"
                  v-model="promptSettings.relationKey"
                />
                <label for="relation-older-brother" class="diary__radio-label"
                  >兄</label
                >
              </div>
              <div
                v-if="promptSettings.geminiGenderKey === 'male'"
                class="diary__radio-item row-2"
              >
                <input
                  type="radio"
                  id="relation-younger-brother"
                  class="diary__radio"
                  value="youngerBrother"
                  v-model="promptSettings.relationKey"
                />
                <label for="relation-younger-brother" class="diary__radio-label"
                  >弟</label
                >
              </div>
              <div
                v-if="promptSettings.geminiGenderKey === 'female'"
                class="diary__radio-item row-2"
              >
                <input
                  type="radio"
                  id="relation-older-sister"
                  class="diary__radio"
                  value="olderSister"
                  v-model="promptSettings.relationKey"
                />
                <label for="relation-older-sister" class="diary__radio-label"
                  >姉</label
                >
              </div>
              <div
                v-if="promptSettings.geminiGenderKey === 'female'"
                class="diary__radio-item row-2"
              >
                <input
                  type="radio"
                  id="relation-younger-sister"
                  class="diary__radio"
                  value="youngerSister"
                  v-model="promptSettings.relationKey"
                />
                <label for="relation-younger-sister" class="diary__radio-label"
                  >妹</label
                >
              </div>
            </div>
          </div>
          <div class="diary__setting-group">
            <p class="diary__setting-heading">Geminiのコメントスタイル</p>
            <div class="diary__radio-wrapper">
              <div class="diary__radio-item">
                <input
                  type="radio"
                  id="comment-style-empathy"
                  class="diary__radio"
                  value="empathy"
                  v-model="promptSettings.styleKey"
                />
                <label for="comment-style-empathy" class="diary__radio-label"
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
                <label for="comment-style-advice" class="diary__radio-label"
                  >助言</label
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
                  class="diary__radio-label"
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
                <label for="comment-style-suggestion" class="diary__radio-label"
                  >提案</label
                >
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <div v-if="isPc" class="diary__pc-link-wrapper">
        <RouterLink
          class="diary__link-views"
          :class="{ 'is-disabled': isDisabled }"
          to="/diaries"
          ><BookIcon class="diary__book-icon" />一覧</RouterLink
        >
        <RouterLink
          class="diary__link-home"
          :class="{ 'is-disabled': isDisabled }"
          to="/home"
          ><HomeIcon class="diary__home-icon" />Home</RouterLink
        >
      </div>
    </div>
    <Transition name="fade-detail" mode="out-in">
      <div class="diary__right-box" :key="props.id">
        <RouterLink
          v-if="isEditMode && isPc"
          class="diary__pc-create-button"
          :class="{ 'is-disabled': isDisabled }"
          to="/diary/new"
          ><PenIcon class="diary__pc-create-icon" />作成</RouterLink
        >
        <h2 class="diary__sub-title">
          {{ isEditMode ? '日記更新' : '日記作成' }}
        </h2>
        <div class="diary__input-area">
          <div class="diary__form-group">
            <label class="diary__input-label" for="diary__input-date"
              >日付</label
            >
            <div class="diary__input-date-wrapper">
              <VueDatePicker
                class="diary__input-date"
                v-model="diaryForm.date"
                placeholder="---- 年 -- 月 -- 日 --:--"
                locale="ja"
                auto-apply
                :format="formatter"
              ></VueDatePicker>
              <button class="diary__now-date-button" @click="setNowDate()">
                <ClockIcon class="diary__clock-icon" />now
              </button>
            </div>
          </div>
          <div class="diary__form-group">
            <label class="diary__input-label" for="diary__input-text"
              >日記内容</label
            >
            <div class="diary__input-text-wrapper">
              <textarea
                id="diary__input-text"
                class="diary__input-text"
                v-model.trim="diaryForm.text"
                placeholder="（例）今日は天気が良くて気持ちよかったから、近所の公園を散歩した。"
              ></textarea>
            </div>
          </div>
          <button
            class="diary__gemini-button"
            :disabled="isDisabled"
            @click="getGeminiComment()"
          >
            <span v-if="isDisabled" class="diary__gemini-button-text loading"
              >Gemini考え中…</span
            >
            <span v-else class="diary__gemini-button-text"
              >Geminiにコメントをもらう</span
            >
          </button>
          <div class="diary__form-group">
            <p class="diary__input-label">Geminiからのコメント</p>
            <div ref="geminiCommentSection" class="diary__gemini-comment">
              <p class="diary__gemini-comment-text">
                {{ diaryForm.geminiComment }}
              </p>
            </div>
          </div>
          <div class="diary__edit-button-wrapper">
            <template v-if="isEditMode">
              <button
                class="diary__update-button"
                :disabled="isDisabled"
                @click="saveDiary()"
              >
                <EditIcon class="diary__update-icon" />更新
              </button>
              <button
                class="diary__delete-button"
                :disabled="isDisabled"
                @click="handleDeleteDiary()"
              >
                <DeleteIcon class="diary__delete-icon" />削除
              </button>
            </template>
            <template v-else>
              <button
                class="diary__register-button"
                :disabled="isDisabled"
                @click="saveDiary()"
              >
                <PenIcon class="diary__register-icon" />日記登録
              </button>
            </template>
          </div>
        </div>
        <div v-if="isEditMode" class="diary__edit-link-wrapper">
          <RouterLink
            class="diary__link-prev"
            :to="`/diary/${prevDiaryId}`"
            :class="{
              'is-disabled': !prevDiaryId || isDisabled,
            }"
            ><CaretLeftIcon
              class="diary__caret-left-icon"
            />前の日記</RouterLink
          >
          <RouterLink
            class="diary__link-next"
            :to="`/diary/${nextDiaryId}`"
            :class="{
              'is-disabled': !nextDiaryId || isDisabled,
            }"
            >次の日記<CaretRightIcon class="diary__caret-right-icon"
          /></RouterLink>
        </div>
        <div v-if="!isPc" class="diary__sp-link-wrapper">
          <RouterLink
            class="diary__link-views"
            :class="{ 'is-disabled': isDisabled }"
            to="/diaries"
            ><BookIcon class="diary__book-icon" />一覧</RouterLink
          >
          <RouterLink
            class="diary__link-home"
            :class="{ 'is-disabled': isDisabled }"
            to="/home"
            ><HomeIcon class="diary__home-icon" />Home</RouterLink
          >
        </div>
      </div>
    </Transition>
    <ConfirmModal
      :show="showDeleteModal"
      :title="'日記削除'"
      :message="`${deleteTargetDate} の日記を削除します。本当によろしいですか？`"
      :confirmButtonText="'削除する'"
      :confirmButtonClass="'delete'"
      :cancelButtonText="'キャンセル'"
      @confirm="deleteDiary"
      @cancel="cancelDelete"
    />
    <ConfirmModal
      :show="showResultModal"
      :title="resultTitle"
      :message="resultMessage"
      :confirmButtonText="'OK'"
      :confirmButtonClass="'confirm'"
      :confirmOnly="true"
      @confirm="closeResultModal"
      @cancel="closeResultModal"
    />
  </div>
</template>
<style lang="scss" scoped>
// --- 日記切り替えTransiton設定 ---
.fade-detail-enter-active,
.fade-detail-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-detail-enter-from,
.fade-detail-leave-to {
  opacity: 0;
}

.diary {
  $parent: &;
  display: grid;
  gap: 1.6rem;

  @include tab {
    gap: 2.4rem;
  }

  @include pc {
    align-items: start;
    grid-template-columns: minmax(340px, 40rem) auto;
    gap: 10rem;
  }

  &__gemini-settings-wrapper {
    padding: 1.6rem;
    background-color: $white;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;

    @include tab {
      width: 75%;
      margin-inline: auto;
      padding: 2rem;
      gap: 2.8rem;
    }

    @include pc {
      width: 100%;
      margin-inline: 0;
      padding: 2.4rem;
      gap: 3.2rem;
      position: sticky;
      top: $header-height-pc;
    }
  }

  &__settings-title {
    @include accordion-menu-style;
  }

  &__prompt-settings {
    transition: opacity 0.3s ease-out, max-height 0.3s ease-out;
    max-height: 500px;
    opacity: 1;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    @include tab {
      gap: 2rem;
    }

    @include pc {
      gap: 2.4rem;
      max-height: none;
      opacity: 1;
      overflow: visible;
      transition: none;
    }
  }

  // --- アコーディオンのTransiton設定 ---
  .gemini-accordion-enter-from,
  .gemini-accordion-leave-to {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
  }
  .gemini-accordion-enter-active,
  .gemini-accordion-leave-active {
    transition: opacity 0.3s ease-out, max-height 0.3s ease-out;
  }
  .gemini-accordion-enter-to,
  .gemini-accordion-leave-from {
    overflow: visible;
    max-height: 500px;
    opacity: 1;
  }

  &__setting-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    @include tab {
      gap: 0.6rem;
    }

    @include pc {
      gap: 0.8rem;
    }
  }

  &__setting-heading {
    font-size: clamp(14px, 1.4rem, 15px);

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__radio-wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @include tab {
      gap: 1.3rem;
    }

    @include pc {
      gap: 1.6rem;
    }
  }

  &__radio-item {
    &.row-2 {
      grid-row: 2 / 3;
    }
  }

  &__radio {
    display: none;

    &:checked + #{$parent}__radio-label {
      background-color: $orange;
      color: $white-brown;
    }
  }

  &__radio-label {
    cursor: pointer;
    padding: 0.75em;
    border-radius: 4px;
    border: 1px solid $orange;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $orange;
    font-size: clamp(14px, 1.4rem, 15px);
    transition: background-color 0.3s ease-out, color 0.3s ease-out;

    @include hover {
      color: $white;
      background-color: $orange;
    }

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__pc-link-wrapper {
    display: flex;
    justify-content: space-between;
  }

  &__link-views,
  &__link-home {
    @include button-style-fill($brown, $white-brown);
    width: 13rem;
    gap: 1em;

    @include tab {
      width: 14rem;
    }

    @include pc {
      min-width: 120px;
      width: 15rem;
    }
  }

  &__book-icon,
  &__home-icon {
    height: 1.5em;
    fill: currentColor;
  }

  &__right-box {
    position: relative;
  }

  &__pc-create-button {
    @include button-style-fill($orange, $white-brown);
    min-width: 140px;
    width: 15rem;
    gap: 1em;
    position: absolute;
    top: 0;
    right: 0;
  }

  &__pc-create-icon {
    height: 1.5em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  &__sub-title {
    @include sub-title-style;
    margin-bottom: 1.6rem;

    @include tab {
      margin-bottom: 2rem;
    }

    @include pc {
      margin-bottom: 2.4rem;
    }
  }

  &__input-area {
    margin-bottom: 3.2rem;
    padding: 1.6rem;
    background-color: $white;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;

    @include tab {
      width: 75%;
      margin-inline: auto;
      margin-bottom: 3.6rem;
      padding: 2rem;
      gap: 2.8rem;
    }

    @include pc {
      width: 100%;
      margin-inline: 0;
      margin-bottom: 4rem;
      padding: 2.4rem;
      gap: 3.2rem;
    }
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    @include tab {
      gap: 0.9rem;
    }

    @include pc {
      gap: 1rem;
    }
  }

  &__input-label {
    font-weight: 700;
    letter-spacing: 0.1em;
    font-size: clamp(16px, 1.6rem, 17px);

    @include tab {
      font-size: clamp(17px, 1.7rem, 18px);
    }

    @include pc {
      font-size: clamp(17px, 1.8rem, 18px);
    }
  }

  &__input-date-wrapper {
    display: flex;
  }

  &__input-date {
    width: 220px;

    @include tab {
      width: 240px;
    }

    @include pc {
      width: 260px;
    }
  }

  &__now-date-button {
    cursor: pointer;
    width: 6.5rem;
    margin-left: 1.6rem;
    border: 1px solid $brown;
    border-radius: 100vmax;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.6em;
    color: $brown;
    font-size: clamp(14px, 1.4rem, 15px);
    transition: color 0.3s ease-out, background-color 0.3s ease-out;

    @include hover {
      color: $white-brown;
      background-color: $brown;
    }

    @include tab {
      width: 8rem;
      margin-left: 2rem;
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      width: 94px;
      margin-left: 24px;
      font-size: clamp(14px, 1.6rem, 16px);
    }
  }

  &__clock-icon {
    height: 1em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  &__input-text-wrapper {
    width: 100%;
    padding: 1.6rem;
    border-radius: 10px;
    background-color: $white-brown;

    @include tab {
      padding: 1.8rem;
    }

    @include pc {
      padding: 2rem;
    }
  }

  &__input-text {
    min-height: calc(26em + 1px); //13行表示
    width: 100%;
    background-image: linear-gradient(
        90deg,
        transparent 0%,
        transparent 50%,
        $white-brown 50%,
        $white-brown 100%
      ),
      linear-gradient(180deg, $brown 1px, transparent 1px);
    background-size: 6px 100%, 100% 2em;
    line-height: 2em;
    font-size: clamp(16px, 1.6rem, 17px);

    &::placeholder {
      color: $gray;
    }

    @include tab {
      min-height: calc(18em + 1px); //9行表示
      font-size: clamp(17px, 1.7rem, 18px);
    }

    @include pc {
      min-height: calc(14em + 1px); //7行表示
      font-size: clamp(17px, 1.8rem, 18px);
    }
  }

  &__gemini-button {
    @include button-style-fill($brown, $white-brown);

    @include tab {
      width: 60%;
      margin-inline: auto;
    }

    @include pc {
      width: 50%;
      min-width: 260px;
      margin-inline: auto;
    }

    &:disabled {
      opacity: 1;
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
      border: 4px solid $orange;
      border-top-color: $white-brown;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }

  &__gemini-comment {
    padding: 1.6rem;
    border-radius: 10px;
    background-color: $white-brown;

    @include tab {
      padding: 1.8rem;
    }

    @include pc {
      padding: 2rem;
    }
  }

  &__gemini-comment-text {
    min-height: calc(18em + 1px); //9行表示
    padding-bottom: 1px;
    background-image: linear-gradient(
        90deg,
        transparent 0%,
        transparent 50%,
        $white-brown 50%,
        $white-brown 100%
      ),
      linear-gradient(180deg, $brown 1px, transparent 1px);
    background-size: 6px 100%, 100% 2em;
    line-height: 2em;
    font-size: clamp(16px, 1.6rem, 17px);

    @include tab {
      min-height: calc(12em + 1px); //6行表示
      font-size: clamp(17px, 1.7rem, 18px);
    }

    @include pc {
      min-height: calc(8em + 1px); //4行表示
      font-size: clamp(17px, 1.8rem, 18px);
    }
  }

  &__edit-button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4rem;
  }

  &__update-button,
  &__delete-button,
  &__register-button {
    min-width: 120px;
    width: 13rem;
    gap: 1em;

    @include tab {
      width: 14rem;
    }

    @include pc {
      width: 15rem;
    }
  }

  &__update-button {
    @include button-style-fill($green, $white-brown);
  }

  &__update-icon {
    height: 1.5em;
    fill: currentColor;
  }

  &__delete-button {
    @include button-style-fill($red, $white-brown);
  }

  &__delete-icon {
    height: 1.5em;
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
  }

  &__register-button {
    @include button-style-fill($orange, $white-brown);
    min-width: 140px;
    width: 15rem;
    gap: 1em;

    @include tab {
      width: 16rem;
    }

    @include pc {
      width: 17rem;
    }
  }

  &__register-icon {
    height: 1.5em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  &__edit-link-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3.2rem;

    @include tab {
      width: 75%;
      margin-inline: auto;
      margin-bottom: 3.6rem;
    }

    @include pc {
      width: 100%;
      margin-inline: 0;
      margin-bottom: 4rem;
    }
  }

  &__link-prev,
  &__link-next {
    @include button-style-border($brown);
    min-width: 120px;
    width: 13rem;
    gap: 1em;

    @include hover {
      color: $brown;
      background-color: transparent;

      #{$parent}__caret-left-icon {
        transform: translateX(-6px);
      }

      #{$parent}__caret-right-icon {
        transform: translateX(6px);
      }
    }

    @include tab {
      width: 14rem;
    }

    @include pc {
      width: 15rem;
    }
  }

  &__caret-left-icon,
  &__caret-right-icon {
    fill: currentColor;
    height: 0.85em;
    transition: transform 0.3s ease-out;
  }

  &__sp-link-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }
}
</style>