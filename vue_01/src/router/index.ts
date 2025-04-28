import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import Dashboard from '../views/Dashboard.vue';
import DashboardHome from '../views/DashboardHome.vue';
import VisualizationView from '../views/VisualizationView.vue';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: DashboardHome
      },
      {
        path: '/visualization/:id',
        name: 'Visualization',
        component: VisualizationView
      }
    ]
  },
  // 重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated;
  
  if (requiresAuth && !isAuthenticated) {
    // 需要登录但用户未登录，重定向到登录页
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;