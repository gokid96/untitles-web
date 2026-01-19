import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('@/views/MainView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 초기화 여부 플래그
let isInitialized = false

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth

  // 첫 로드 시 세션 확인 (한 번만)
  if (!isInitialized) {
    isInitialized = true
    await authStore.loadUserFromStorage()
  }

  // 인증이 필요한 페이지인 경우
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    // 이미 로그인된 상태에서 로그인/회원가입 페이지 접근 시 메인으로
    if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
      next({ name: 'main' })
    } else {
      next()
    }
  }
})

export default router
