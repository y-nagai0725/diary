<script setup>
import { RouterLink } from 'vue-router';
import HomeIcon from '@/components/icons/HomeIcon.vue';
</script>

<template>
  <div class="not-found">
    <div class="not-found__image-wrapper">
      <img src="@/assets//images/not-found/404.png" alt="404" />
    </div>
    <h1 class="not-found__title">404 Not Found</h1>
    <p class="not-found__message">
      お探しのページは見つかりませんでした。移動した可能性があります。
    </p>
    <RouterLink class="not-found__home-link" to="/home"
      ><HomeIcon class="not-found__home-icon" />Home</RouterLink
    >
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.4rem;

  @include tab {
    gap: 2.8rem;
  }

  @include pc {
    gap: 3.2rem;
  }

  &__image-wrapper {
    width: 66%;
    border-radius: 10px;
    overflow: hidden;

    @include tab {
      width: 50%;
    }

    @include pc {
      width: 33%;
    }
  }

  &__title {
    @include sub-title-style;
  }

  &__message {
    font-size: clamp(14px, 1.4rem, 15px);
    line-height: 1.8;

    @include tab {
      font-size: clamp(15px, 1.5rem, 16px);
    }

    @include pc {
      font-size: clamp(15px, 1.6rem, 16px);
    }
  }

  &__home-link {
    @include button-style-fill($brown, $white-brown);
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

  &__home-icon {
    height: 1.5em;
    fill: $white-brown;
  }
}
</style>