<script setup>
defineProps({
  show: Boolean, // モーダルの表示・非表示
  message: String, // 表示するメッセージ
  confirmOnly: { // OKボタンのみの場合はtrue
    type: Boolean,
    defalut: false,
  },
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <p class="modal-message">{{ message }}</p>
      <div class="modal-buttons">
        <button class="modal-button confirm" @click="emit('confirm')">
          OK
        </button>
        <button
          v-if="!confirmOnly"
          class="modal-button cancel"
          @click="emit('cancel')"
        >
          キャンセル
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* モーダル仮デザイン*/
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 後ろをちょっと暗くするよ */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-message {
  margin-bottom: 1.5rem;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.modal-button {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;

  &.confirm {
    background-color: #42b983;
    color: white;
  }

  &.cancel {
    background-color: #ccc;
  }
}
</style>