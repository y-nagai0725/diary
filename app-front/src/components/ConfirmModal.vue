<script setup>
import CloseIcon from '@/components/icons/CloseIcon.vue';
defineProps({
  show: Boolean, // モーダルの表示・非表示
  title: String, // タイトル
  message: String, // 表示するメッセージ
  confirmButtonText: String, // OKボタンのテキスト
  confirmButtonClass: String, // OKボタンのクラス
  cancelButtonText: String, // キャンセルボタンのテキスト
  confirmOnly: {
    // OKボタンのみの場合はtrue
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['confirm', 'cancel']);

/**
 * オーバーレイ（背景）がクリックされた時の処理
 */
const handleOverlayClick = () => {
  // キャンセルイベントを発行する
  emit('cancel');
};

/**
 * 確認ボタンクリック時の処理
 */
const handleConfirm = () => {
  emit('confirm');
};

/**
 * キャンセルボタンクリック時の処理
 */
const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal" @click.self="handleOverlayClick">
      <div class="modal__content">
        <button class="modal__close-button" @click="handleCancel">
          <CloseIcon class="modal__close-icon" />
        </button>
        <p class="modal__title">{{ title }}</p>
        <p class="modal__message">{{ message }}</p>
        <div class="modal__button-wrapper">
          <button
            v-if="!confirmOnly"
            class="modal__button cancel"
            @click="handleCancel"
          >
            {{ cancelButtonText }}
          </button>
          <button
            class="modal__button"
            :class="`${confirmButtonClass}`"
            @click="handleConfirm"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $brown-transparent;
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  &__content {
    min-width: 300px;
    max-width: 400px;
    margin-inline: 2rem;
    padding: 1.6rem;
    background-color: $white-brown;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
    position: relative;

    @include tab {
      margin-inline: 0;
      padding: 2rem;
      gap: 2rem;
    }

    @include pc {
      padding: 2.4rem;
      gap: 2.4rem;
    }
  }

  &__close-button {
    cursor: pointer;
    width: 48px;
    aspect-ratio: 1;
    display: grid;
    place-content: center;
    position: absolute;
    top: 0;
    right: 0;
  }

  &__close-icon {
    width: 14px;
    aspect-ratio: 1;
    stroke: $brown;
    stroke-width: 2;
  }

  &__title {
    font-weight: 700;
    letter-spacing: 0.1em;
    font-size: clamp(18px, 1.8rem, 20px);

    @include tab {
      font-size: clamp(20px, 2rem, 22px);
    }

    @include pc {
      font-size: clamp(20px, 2.2rem, 22px);
    }
  }

  &__message {
    line-height: 1.8;
    font-size: clamp(14px, 1.4rem, 15px);

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__button-wrapper {
    display: flex;
    justify-content: center;
    gap: 1.6rem;

    @include tab {
      gap: 2.4rem;
    }

    @include pc {
      gap: 3.2rem;
    }
  }

  &__button {
    width: 130px;

    &.confirm {
      @include button-style-fill($orange, $white-brown);
    }

    &.delete {
      @include button-style-fill($red, $white-brown);
    }

    &.cancel {
      @include button-style-border($brown);
    }

    @include tab {
      width: 140px;
    }

    @include pc {
      width: 150px;
    }
  }
}

/* Transition用クラス */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease-out;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-from .modal__content,
.modal-leave-to .modal__content {
  transform: scale(0.8);
}

.modal-enter-active .modal__content,
.modal-leave-active .modal__content {
  transition: transform 0.3s ease-out;
}

.modal-enter-to .modal__content,
.modal-leave-from .modal__content {
  transform: scale(1);
}
</style>