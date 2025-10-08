<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api';

const diaries = ref([]);
const currentPage = ref(1);
const totalDiaries = ref(0);
const sortOrder = ref('desc');
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(totalDiaries.value / itemsPerPage));

/**
 * 指定されたページの日記を取得
 */
const fetchDiaries = async (page) => {
  try {
    const response = await apiClient.get('/api/diaries', {
      params: {
        page,
        limit: itemsPerPage,
        order: sortOrder.value,
      },
    });
    diaries.value = response.data.diaries;
    totalDiaries.value = response.data.totalDiaries;
    currentPage.value = page;
  } catch (error) {
    console.error('日記一覧の取得に失敗しました。', error);
  }
};

/**
 * 並び順を切り替える
 */
const toggleSortOrder = () => {
  //現在の反対の並び順に
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';

  // 並び順を変えたら、1ページ目からデータを取り直す
  fetchDiaries(1);
};

onMounted(() => {
  //初期表示は、1ページ目のデータを表示
  fetchDiaries(1);
});
</script>

<template>
  <div>
    <h1>日記一覧</h1>

    <table>
      <tbody>
        <tr v-for="diary in diaries" :key="diary.id">
          <td>{{ diary.date }}</td>
          <td>{{ diary.text }}</td>
        </tr>
      </tbody>
    </table>

    <button @click="toggleSortOrder">
      並び替え: {{ sortOrder === 'desc' ? '新しい順' : '古い順' }}
    </button>

    <div class="pagination">
      <button
        @click="fetchDiaries(currentPage - 1)"
        :disabled="currentPage === 1"
      >
        前へ
      </button>
      <span>{{ currentPage }} / {{ totalPages }} ページ</span>
      <button
        @click="fetchDiaries(currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        次へ
      </button>
    </div>
  </div>
</template>