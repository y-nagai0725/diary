<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { isLoggedIn, logout, userName } from '@/auth.js';
import { useResponsive } from '@/composables/useResponsive.js';
import { loadingState } from '@/loadingState.js';
import UserIcon from '@/components/icons/UserIcon.vue';

/**
 * PC表示かどうか
 */
const { isPc } = useResponsive();

/**
 * sp用ナビゲーションメニュー開閉状態
 */
const isOpenedSpMenu = ref(false);

/**
 * ボタンを非活性にするかどうか
 */
const isDisabled = computed(() => loadingState.isGeminiLoading);

watch(isPc, (newValue) => {
  //SP用メニューが開かれた状態で、PC表示になった場合はメニューを閉じる
  if (isOpenedSpMenu.value && newValue) {
    isOpenedSpMenu.value = false;
  }
});

watch(isOpenedSpMenu, (newValue) => {
  if (newValue) {
    // メニューが開いた時、背景のスクロールを禁止する
    document.body.style.overflow = 'hidden';
  } else {
    // メニューが閉じた時、スクロール禁止を解除する
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  //スクロール禁止を解除
  document.body.style.overflow = '';
});
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <h1 class="header__title">
        <RouterLink
          class="header__home-link"
          :class="{ 'is-disabled': isDisabled }"
          to="/home"
        >
          <img
            class="header__home-logo"
            src="@/assets/images/common/site-logo.svg"
            alt="Diary日記帳アプリロゴ"
          />
        </RouterLink>
      </h1>
      <div class="header__right-box">
        <div v-if="isLoggedIn" class="header__user-information">
          <UserIcon class="header__user-icon" />
          <span class="header__user-name">{{ userName }}</span>
        </div>
        <nav v-if="isPc" class="header__gnav-pc">
          <ul class="header__pc-link-list">
            <template v-if="isLoggedIn">
              <li class="header__pc-item">
                <RouterLink
                  class="header__pc-link"
                  :class="{ 'is-disabled': isDisabled }"
                  to="/home"
                  >Home</RouterLink
                >
              </li>
              <li class="header__pc-item">
                <RouterLink
                  class="header__pc-link"
                  :class="{ 'is-disabled': isDisabled }"
                  to="/diary/new"
                  >日記作成</RouterLink
                >
              </li>
              <li class="header__pc-item">
                <RouterLink
                  class="header__pc-link"
                  :class="{ 'is-disabled': isDisabled }"
                  to="/diaries"
                  >日記一覧</RouterLink
                >
              </li>
              <li class="header__pc-item">
                <button
                  class="header__pc-logout-button"
                  :class="{ 'is-disabled': isDisabled }"
                  @click="logout()"
                >
                  ログアウト
                </button>
              </li>
            </template>
            <template v-else>
              <li class="header__pc-item">
                <RouterLink class="header__pc-link" to="/home">Home</RouterLink>
              </li>
              <li class="header__pc-item">
                <RouterLink class="header__pc-link" to="/login"
                  >ログイン</RouterLink
                >
              </li>
              <li class="header__pc-item">
                <RouterLink class="header__pc-link" to="/register"
                  >ユーザー登録</RouterLink
                >
              </li>
            </template>
          </ul>
        </nav>
        <button
          v-else
          class="header__hamburger-button"
          :class="{ 'is-opened': isOpenedSpMenu, 'is-disabled': isDisabled }"
          @click="isOpenedSpMenu = !isOpenedSpMenu"
        >
          <span class="header__line top"></span>
          <span class="header__line middle"></span>
          <span class="header__line bottom"></span>
        </button>
      </div>
    </div>
    <nav
      v-if="!isPc"
      class="header__gnav-sp"
      :class="{ 'is-opened': isOpenedSpMenu }"
    >
      <ul class="header__sp-link-list">
        <template v-if="isLoggedIn">
          <li class="header__sp-item">
            <RouterLink
              class="header__sp-link"
              to="/home"
              @click="isOpenedSpMenu = false"
              >Home</RouterLink
            >
          </li>
          <li class="header__sp-item">
            <RouterLink
              class="header__sp-link"
              to="/diary/new"
              @click="isOpenedSpMenu = false"
              >日記作成</RouterLink
            >
          </li>
          <li class="header__sp-item">
            <RouterLink
              class="header__sp-link"
              to="/diaries"
              @click="isOpenedSpMenu = false"
              >日記一覧</RouterLink
            >
          </li>
          <li class="header__sp-item">
            <button
              class="header__sp-logout-button"
              @click="
                isOpenedSpMenu = false;
                logout();
              "
            >
              ログアウト
            </button>
          </li>
        </template>
        <template v-else>
          <li class="header__sp-item">
            <RouterLink
              class="header__sp-link"
              to="/home"
              @click="isOpenedSpMenu = false"
              >Home</RouterLink
            >
          </li>
          <li class="header__sp-item">
            <RouterLink
              class="header__sp-link"
              to="/login"
              @click="isOpenedSpMenu = false"
              >ログイン</RouterLink
            >
          </li>
          <li class="header__sp-item">
            <RouterLink
              class="header__sp-link"
              to="/register"
              @click="isOpenedSpMenu = false"
              >ユーザー登録</RouterLink
            >
          </li>
        </template>
      </ul>
    </nav>
  </header>
</template>
<style lang="scss" scoped>
.header {
  $parent: &;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $header-height-sp;
  display: flex;
  align-items: center;
  z-index: 100;

  @include tab {
    height: $header-height-tab;
  }

  @include pc {
    height: $header-height-pc;
  }

  &__inner {
    width: 100%;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include tab {
      padding: 0 3rem;
    }

    @include pc {
      padding: 0 4rem;
    }
  }

  &__home-link {
    padding: 10px 0;
    width: 110px;
    transition: opacity 0.3s ease-out;

    &.is-disabled {
      opacity: 0.33;
      pointer-events: none;
    }

    @include hover {
      opacity: 0.8;
    }

    @include tab {
      width: 120px;
    }

    @include pc {
      width: 150px;
    }
  }

  &__home-logo {
    width: 100%;
    object-fit: cover;
  }

  &__right-box {
    display: flex;
    align-items: center;
    gap: 2rem;

    @include tab {
      gap: 3rem;
    }

    @include tab {
      gap: 4rem;
    }
  }

  &__user-information {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  &__user-icon {
    width: 22px;
    aspect-ratio: 1;
    fill: $brown;

    @include tab {
      width: 23px;
    }

    @include pc {
      width: 25px;
    }
  }

  &__user-name {
    font-size: clamp(12px, 1.2rem, 13px);

    &::after {
      content: 'さん';
      margin-left: 0.5em;
      font-size: 0.75em;
    }

    @include tab {
      font-size: clamp(13px, 1.3rem, 14px);
    }

    @include pc {
      font-size: clamp(13px, 1.4rem, 14px);
    }
  }

  &__pc-link-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4rem;
  }

  &__pc-link,
  &__pc-logout-button {
    cursor: pointer;
    padding: 10px 0;
    font-weight: 700;
    font-size: clamp(14px, 1.6rem, 16px);
    letter-spacing: 0.1em;
    position: relative;
    transition: opacity 0.3s ease-out;

    &.is-disabled {
      opacity: 0.33;
      pointer-events: none;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 5px;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: $brown;
      transform: scaleX(0);
      transition: transform 0.3s ease-out;
    }

    @include hover {
      &::after {
        transform: scaleX(1);
      }
    }
  }

  &__hamburger-button {
    width: 48px;
    aspect-ratio: 1;
    border-radius: 100vmax;
    border: 1px solid $orange;
    background-color: $orange;
    position: relative;
    z-index: 10001;
    transition: background-color 0.3s ease-out, opacity 0.3s ease-out;

    &.is-disabled {
      opacity: 0.33;
      pointer-events: none;
    }

    &.is-opened {
      background-color: $white-brown;

      #{$parent}__line {
        background-color: $orange;
      }

      #{$parent}__line.top {
        top: 50%;
        transform: translateX(-50%) translateY(-50%) rotate(45deg);
      }

      #{$parent}__line.middle {
        opacity: 0;
        transform: translate(calc(-50% + 8px), -50%);
      }

      #{$parent}__line.bottom {
        top: 50%;
        transform: translateX(-50%) translateY(-50%) rotate(-45deg);
      }
    }

    @include tab {
      width: 52px;
    }
  }

  &__line {
    position: absolute;
    width: 46%;
    height: 2px;
    left: 50%;
    transform: translateX(-50%);
    background-color: $white-brown;
    transition: transform 0.3s ease-out, background-color 0.3s ease-out,
      opacity 0.3s ease-out, top 0.3s ease-out;

    &.top {
      top: 33%;
    }

    &.middle {
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
    }

    &.bottom {
      bottom: 33%;
    }
  }

  &__gnav-sp {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    place-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-out, background-color 0.3s ease-out;
    z-index: 10000;

    &.is-opened {
      opacity: 1;
      pointer-events: all;
      background-color: $white-brown;
    }
  }

  &__sp-link-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.4rem;

    @include tab {
      gap: 3.2rem;
    }
  }

  &__sp-link {
    padding: 10px 0;
    color: $brown;
    font-weight: 700;
    font-size: clamp(15px, 1.5rem, 18px);
    letter-spacing: 0.1em;

    @include tab {
      font-size: clamp(18px, 1.8rem, 20px);
    }
  }

  &__sp-logout-button {
    cursor: pointer;
    padding: 10px 0;
    color: $brown;
    font-weight: 700;
    font-size: clamp(15px, 1.5rem, 18px);
    letter-spacing: 0.1em;

    @include tab {
      font-size: clamp(18px, 1.8rem, 20px);
    }
  }
}
</style>