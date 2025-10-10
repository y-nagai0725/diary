<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const isOpenedMenu = ref(false);
const logout = () => {};
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink class="header__home-link" to="/home">
        <img
          class="header__home-logo"
          src="@/assets/images/common/header_logo.svg"
          alt="Diary日記帳アプリロゴ"
        />
      </RouterLink>
      <nav class="header__gnav" :class="{ isOpened: isOpenedMenu }">
        <ul class="header__link-list">
          <li class="header__item">
            <RouterLink
              class="header__link"
              to="/diary/new"
              @click="isOpenedMenu = !isOpenedMenu"
              >日記作成</RouterLink
            >
          </li>
          <li class="header__item">
            <RouterLink
              class="header__link"
              to="/diaries"
              @click="isOpenedMenu = !isOpenedMenu"
              >日記一覧</RouterLink
            >
          </li>
          <li class="header__item">
            <button class="header__logout-button" @click="logout()">
              ログアウト
            </button>
          </li>
        </ul>
      </nav>
      <button
        class="header__hamburger-button"
        :class="{ isOpened: isOpenedMenu }"
        @click="isOpenedMenu = !isOpenedMenu"
      >
        <span class="header__line top"></span>
        <span class="header__line middle"></span>
        <span class="header__line bottom"></span>
      </button>
    </div>
  </header>
</template>
<style lang="scss" scoped>
.header {
  &__inner {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include tab {
      padding: 3rem;
    }

    @include pc {
      padding: 4rem;
    }
  }

  &__home-link {
    width: 140px;
  }

  &__home-logo {
    width: 100%;
    object-fit: cover;
  }

  &__gnav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    place-content: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease-out, background-color 0.3s ease-out;

    &.isOpened {
      z-index: 10000;
      background-color: aquamarine;
      opacity: 1;
      pointer-events: all;
    }

    @include pc {
      position: static;
      width: auto;
      height: auto;
    }
  }

  &__link-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;

    @include tab {
    }

    @include pc {
      flex-direction: row;
    }
  }

  &__hamburger-button {
    width: 40px;
    aspect-ratio: 1;
    position: relative;
    z-index: 10001;

    @include tab {
      width: 50px;
    }

    @include pc {
      display: none;
    }
  }

  &__line {
    position: absolute;
    left: 0;
    height: 2px;
    background-color: #000;

    &.top {
      width: 100%;
      top: 20%;
    }

    &.middle {
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }

    &.bottom {
      width: 80%;
      bottom: 20%;
    }
  }
}
</style>