import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DiariesView from '../views/DiariesView.vue';
import DiaryDetailView from '../views/DiaryDetailView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      //ホームへリダイレクト
      path: '/',
      redirect: '/home'
    },
    {
      //ホーム
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      //ログイン
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      //ユーザー登録
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      //日記一覧表示
      path: '/diaries',
      name: 'diaries',
      component: DiariesView,
      meta: { requiresAuth: true }
    },
    {
      // 既存の日記を表示・編集
      path: '/diary/:id',
      name: 'diary-detail',
      component: DiaryDetailView,
      meta: { requiresAuth: true },
      props: true // URLの:idをコンポーネントのpropsとして渡せるようにするよ
    },
    {
      //日記の新規作成
      path: '/diary/new',
      name: 'diary-new',
      component: DiaryDetailView,
      meta: { requiresAuth: true }
    },
    {
      //404
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView
    },
  ]
});

//ページを移動する直前の処理
router.beforeEach((to, from, next) => {
  //行き先が、ログインが必要なページかどうか
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // ログイン時に発行されたトークン
  const token = localStorage.getItem('token');

  if (requiresAuth && !token) {
    // ログインページに強制的に移動
    next('/login');
  } else {
    next();
  }
});

export default router;
