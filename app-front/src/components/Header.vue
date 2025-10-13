<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { isLoggedIn, logout, userName } from '@/auth.js';
import UserIcon from '@/components/icons/UserIcon.vue';

/**
 * 画面幅
 */
const windowWidth = ref(window.innerWidth);

/**
 * PC表示（画面幅1024px以上）かどうか
 */
const isPc = computed(() => windowWidth.value >= 1024);

/**
 * sp用ナビゲーションメニュー開閉状態
 */
const isOpenedSpMenu = ref(false);

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

watch(isPc, () => {
  //SP用メニューが開かれた状態で、PC表示になった場合はメニューを閉じる
  if (isOpenedSpMenu.value && isPc.value) {
    isOpenedSpMenu.value = false;
  }
});

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
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink class="header__home-link" to="/home">
        <img
          class="header__home-logo"
          src="@/assets/images/common/site-logo.svg"
          alt="Diary日記帳アプリロゴ"
        />
      </RouterLink>
      <div class="header__right-box">
        <div v-if="isLoggedIn" class="header__user-information">
          <UserIcon class="header__user-icon" />
          <span class="header__user-name">{{ userName }}</span>
        </div>
        <nav v-if="isPc" class="header__gnav-pc">
          <ul class="header__pc-link-list">
            <template v-if="isLoggedIn">
              <li class="header__pc-item">
                <RouterLink class="header__pc-link" to="/home">Home</RouterLink>
              </li>
              <li class="header__pc-item">
                <RouterLink class="header__pc-link" to="/diary/new"
                  >日記作成</RouterLink
                >
              </li>
              <li class="header__pc-item">
                <RouterLink class="header__pc-link" to="/diaries"
                  >日記一覧</RouterLink
                >
              </li>
              <li class="header__pc-item">
                <button class="header__pc-logout-button" @click="logout()">
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
          :class="{ isOpened: isOpenedSpMenu }"
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
      :class="{ isOpened: isOpenedSpMenu }"
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
  height: 70px;
  display: flex;
  align-items: center;
  z-index: 100;

  @include tab {
    height: 80px;
  }

  @include pc {
    height: 100px;
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
    gap: 4rem;
  }

  &__user-information {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  &__user-icon {
    width: 22px;
    aspect-ratio: 1;
    fill: $black;

    @include tab {
      width: 24px;
    }

    @include pc {
      width: 26px;
    }
  }

  &__user-name {
    font-size: clamp(12px, 1.2rem, 13px);

    &::after {
      content: "さん";
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

  &__gnav-pc {
  }

  &__pc-link-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4rem;
  }

  &__pc-link {
    padding: 10px 0;
    font-size: clamp(14px, 1.6rem, 16px);
  }

  &__pc-logout-button {
    cursor: pointer;
    padding: 10px 0;
    font-size: clamp(14px, 1.6rem, 16px);
  }

  &__hamburger-button {
    width: 40px;
    aspect-ratio: 1;
    position: relative;
    z-index: 10001;

    &.isOpened {
      #{$parent}__line {
        background-color: $white;
      }

      #{$parent}__line.top {
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
      }

      #{$parent}__line.middle {
        opacity: 0;
        transform: translate(10px, -50%);
      }

      #{$parent}__line.bottom {
        top: 50%;
        transform: translateY(-50%) rotate(-45deg);
      }
    }

    @include tab {
      width: 50px;
    }
  }

  &__line {
    width: 100%;
    position: absolute;
    left: 0;
    height: 2px;
    background-color: $black;
    transition: transform 0.3s ease-out, opacity 0.3s ease-out,
      background-color 0.3s ease-out, top 0.3s ease-out;

    &.top {
      top: 20%;
    }

    &.middle {
      top: 50%;
      transform: translateY(-50%);
    }

    &.bottom {
      bottom: 20%;
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

    &.isOpened {
      opacity: 1;
      pointer-events: all;
      background-color: $green;
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
    color: $white;
    font-size: clamp(15px, 1.5rem, 18px);

    @include tab {
      font-size: clamp(18px, 1.8rem, 20px);
    }
  }

  &__sp-logout-button {
    cursor: pointer;
    padding: 10px 0;
    color: $white;
    font-size: clamp(15px, 1.5rem, 18px);

    @include tab {
      font-size: clamp(18px, 1.8rem, 20px);
    }
  }
}
</style>