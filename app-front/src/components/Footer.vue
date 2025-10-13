<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { isLoggedIn, logout } from '@/auth.js';
import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon.vue';
</script>
<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__logo-wrapper">
        <RouterLink class="footer__home-link" to="/home">
          <img
            class="footer__home-logo"
            src="@/assets/images/common/site-logo.svg"
            alt="Diary日記帳アプリロゴ"
          />
        </RouterLink>
      </div>
      <nav class="footer__gnav">
        <ul class="footer__link-list">
          <template v-if="isLoggedIn">
            <li class="footer__item">
              <RouterLink class="footer__link" to="/home">Home</RouterLink>
            </li>
            <li class="footer__item">
              <RouterLink class="footer__link" to="/diary/new"
                >日記作成</RouterLink
              >
            </li>
            <li class="footer__item">
              <RouterLink class="footer__link" to="/diaries"
                >日記一覧</RouterLink
              >
            </li>
            <li class="footer__item">
              <button class="footer__logout-button" @click="logout()">
                ログアウト
              </button>
            </li>
          </template>
          <template v-else>
            <li class="footer__item">
              <RouterLink class="footer__link" to="/home">Home</RouterLink>
            </li>
            <li class="footer__item">
              <RouterLink class="footer__link" to="/login">ログイン</RouterLink>
            </li>
            <li class="footer__item">
              <RouterLink class="footer__link" to="/register"
                >ユーザー登録</RouterLink
              >
            </li>
          </template>
        </ul>
      </nav>
      <div class="footer__external-link-wrapper">
        <ul class="footer__external-link-list">
          <li class="footer__external-link-item">
            <a
              href="https://portfolio.mikanbako.jp"
              class="footer__external-link"
              target="_blank"
              >ポートフォリオ<ExternalLinkIcon
                class="footer__external-link-icon"
            /></a>
          </li>
          <li class="footer__external-link-item">
            <a
              href="https://github.com/y-nagai0725"
              class="footer__external-link"
              target="_blank"
              >GitHub<ExternalLinkIcon class="footer__external-link-icon"
            /></a>
          </li>
          <li class="footer__external-link-item">
            <a
              href="https://blog.mikanbako.jp"
              class="footer__external-link"
              target="_blank"
              >技術ブログ<ExternalLinkIcon class="footer__external-link-icon"
            /></a>
          </li>
        </ul>
        <small class="footer__copyright">&copy; 2025 NAGAI YOSHITAKA</small>
      </div>
    </div>
  </footer>
</template>
<style lang="scss" scoped>
.footer {
  padding: 4rem 0 1.6rem;

  @include tab {
    padding: 4.8rem 0 2.4rem;
  }

  @include pc {
    padding: 5.6rem 0 3.2rem;
  }

  &__inner {
    @include contents-width;
  }

  &__logo-wrapper {
    margin-bottom: 4rem;
    display: grid;
    place-content: center;

    @include tab {
      margin-bottom: 4.8rem;
    }

    @include pc {
      margin-bottom: 5.6rem;
    }
  }

  &__home-link {
    width: 110px;
    padding: 10px 0;

    @include tab {
      width: 120px;
    }

    @include pc {
      width: 150px;
    }
  }

  &__gnav {
    margin-bottom: 3.2rem;

    @include tab {
      margin-bottom: 4rem;
    }

    @include pc {
      margin-bottom: 4.8rem;
    }
  }

  &__link-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-content: center;
    gap: 1.6rem;

    @include tab {
      gap: 2.4rem;
    }

    @include pc {
      grid-template-columns: repeat(auto-fit, minmax(200px, 275px));
      gap: 0;
    }
  }

  &__item {
    border-bottom: 1px solid $black;

    @include tab {
    }

    @include pc {
      border-bottom: none;
      text-align: center;
    }
  }

  &__link,
  &__logout-button {
    cursor: pointer;
    display: inline-block;
    padding: 10px 0;
    font-size: clamp(14px, 1.4rem, 16px);

    @include tab {
      font-size: clamp(16px, 1.6rem, 18px);
    }

    @include pc {
      font-size: clamp(16px, 1.8rem, 18px);
    }
  }

  &__external-link-wrapper {
    padding-top: 3.2rem;
    border-top: 1px solid $black;
    display: flex;
    flex-direction: column;
    gap: 3.2rem;

    @include tab {
      padding-top: 4rem;
      gap: 4rem;
    }

    @include pc {
      flex-direction: row;
      justify-content: space-between;
      padding-top: 4.8rem;
      gap: 4.8rem;
    }
  }

  &__external-link-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    @include tab {
      gap: 1.6rem;
    }

    @include pc {
      flex-direction: row;
      gap: 4rem;
    }
  }

  &__external-link {
    display: inline-flex;
    align-items: center;
    padding: 10px 0;
    font-size: clamp(12px, 1.2rem, 13px);

    @include tab {
      font-size: clamp(13px, 1.3rem, 14px);
    }

    @include pc {
      font-size: clamp(14px, 1.5rem, 15px);
    }
  }

  &__external-link-icon {
    margin-left: 0.3em;
    width: 1em;
    aspect-ratio: 1;
    fill: $black;
  }

  &__copyright {
    display: block;
    font-size: clamp(10px, 1rem, 11px);

    @include tab {
      font-size: clamp(11px, 1.1rem, 12px);
    }

    @include pc {
      padding-bottom: 10px;
      font-size: clamp(11px, 1.2rem, 12px);
      align-self: flex-end;
    }
  }
}
</style>