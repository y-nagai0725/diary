import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DiariesView from '../views/DiariesView.vue';
import DiaryDetailView from '../views/DiaryDetailView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // このページはログインが必要だよって印
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/diaries',
      name: 'diaries',
      component: DiariesView,
      meta: { requiresAuth: true }
    },
    {
      // 既存の日記を表示・編集するページ
      path: '/diary/:id',
      name: 'diary-detail',
      component: DiaryDetailView,
      meta: { requiresAuth: true },
      props: true // URLの:idをコンポーネントのpropsとして渡せるようにするよ
    },
    {
      // 新しい日記を作成するページ
      path: '/diary/new',
      name: 'diary-new',
      component: DiaryDetailView,
      meta: { requiresAuth: true }
    },
  ]
});

// ページを移動する直前に、毎回このチェックが入るよ！
router.beforeEach((to, from, next) => {
  // これから行こうとしてるページが、ログインが必要なページかどうか
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // ログインの証（トークン）が保存されているか
  const token = localStorage.getItem('token');

  // もしログインが必要なページに、トークン無しで行こうとしたら…
  if (requiresAuth && !token) {
    // ログインページに強制的に移動させちゃう！
    next('/login');
  } else {
    // それ以外の場合は、普通にページ移動してOK！
    next();
  }
});

export default router;
