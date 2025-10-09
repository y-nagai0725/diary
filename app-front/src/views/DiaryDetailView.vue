<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api';
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { formatDate } from '@/utils/date.js';

const router = useRouter();

const props = defineProps({
  id: String,
});

const diaryForm = ref({
  text: '',
  geminiComment: '',
  date: '',
});
const showResultModal = ref(false);
const resultMessage = ref('');

const promptSettings = ref({
  writerGenderKey: '',
  geminiGenderKey: '',
  relationKey: '',
  styleKey: '',
});

const submitGeminiButtonText = ref('');
const GEMINI_READY_TEXT = 'Geminiにコメントをもらう';
const GEMINI_LOADING_TEXT = 'Gemini考え中…';

const isEditMode = computed(() => !!props.id);

const saveDiary = async () => {
  //入力チェック
  console.log('aaa');

  if (isEditMode) {
    //更新処理
  } else {
    //新規作成処理
    //作成した日記の更新モード画面へ
    //router.push(`/diary/${newDiaryId}`);
  }
};

const initDisplay = async () => {
  //gemini送信ボタンのテキスト
  submitGeminiButtonText.value = GEMINI_READY_TEXT;

  //TODO ローカルストレージからGemini APIへの設定を取得、設定
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
    console.log(`更新モードです。ID: ${props.id} のデータを取得します。`);
    try {
      //更新対象の日記データ取得
      const response = await apiClient.get(`/api/diaries/${props.id}`);

      //取得日記データから日付、日記内容、Geminiからのコメントを表示
      diaryForm.value.date = formatDate(response.data.date, '-', true);
      diaryForm.value.text = response.data.text;
      diaryForm.value.geminiComment = response.data.geminiComment;
    } catch (error) {
      console.error('日記の取得に失敗しました。', error);
    }
  } else {
    // --- 新規作成モードの時の処理 ---
    console.log('新規作成モードです。');

    //現在日付と時刻を初期値とする(yyyy-MM-ddThh:mm)
    diaryForm.value.date = formatDate(new Date(), '-', true);
  }
};

onMounted(() => {
  initDisplay();
});
</script>

<template>
  <div class="diary">
    <h1 class="diary__title">
      {{ isEditMode ? '日記の編集' : '新しい日記の作成' }}
    </h1>
    <div class="diary__input-area">
      <div class="diary__form-group">
        <label class="diary__label" for="diary__input-date">日付</label>
        <input
          class="diary__input-date"
          v-model="diaryForm.date"
          type="datetime-local"
          id="diary__input-date"
        />
      </div>
      <div class="diary__form-group">
        <label class="diary__label" for="diary__input-text">日記内容</label>
        <textarea
          id="diary__input-text"
          class="diary__input-text"
          v-model="diaryForm.text"
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
    <button class="diary__submit-gemini-button">
      {{ submitGeminiButtonText }}
    </button>
    <p class="diary__gemini-comment">
      {{ diaryForm.geminiComment }}
    </p>
    <button v-if="isEditMode" class="diary__update-button" @click="saveDiary()">
      更新
    </button>
    <button v-else class="diary__register-button" @click="saveDiary()">
      登録
    </button>
  </div>
</template>
<style lang="scss" scoped>
.diary {
  $parent: &;

  &__radio {
    display: none;

    &:checked + #{$parent}__setting-label {
      background-color: cyan;
      color: white;
    }
  }

  &__setting-label {
    cursor: pointer;
    display: block;
    padding: 1rem;
    border: 1px solid blue;
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
}
</style>