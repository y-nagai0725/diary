<script setup>
defineProps({
  show: Boolean, // モーダルの表示・非表示
  message: String, // 表示するメッセージ
  confirmOnly: {
    // OKボタンのみの場合はtrue
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(74, 32, 12, 0.33);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: $white-brown;
  padding: 1.6rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @include tab {
    padding: 2rem;
  }

  @include pc {
    padding: 2.4rem;
  }
}

.modal-message {
  margin-bottom: 1.6rem;
  font-size: clamp(14px, 1.4rem, 15px);

  @include tab {
    margin-bottom: 2rem;
    font-size: clamp(15px, 1.5rem, 16px);
  }

  @include pc {
    margin-bottom: 2.4rem;
    font-size: clamp(15px, 1.6rem, 16px);
  }
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1.6rem;

  @include tab {
    gap: 2rem;
  }

  @include pc {
    gap: 2.4rem;
  }
}

.modal-button {
  width: 130px;

  &.confirm {
    @include button-style-fill($brown, $white-brown);
  }

  &.cancel {
    @include button-style-fill($gray, $white-brown);
  }

  @include tab {
    width: 140px;
  }

  @include pc {
    width: 150px;
  }
}
</style>