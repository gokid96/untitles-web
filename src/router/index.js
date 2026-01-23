import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('@/views/MainView.vue'),
      meta: { requiresAuth: true },
    },
    // 기존 /main 경로 호환성 유지 (리다이렉트)
    {
      path: '/main',
      redirect: '/app',
    },
  ],
})

// 초기화 여부 플래그
let isInitialized = false

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 첫 로드 시 세션 확인 (한 번만)
  if (!isInitialized) {
    isInitialized = true
    await authStore.loadUserFromStorage()
  }

  // 인증이 필요한 페이지인 경우
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
  // 비로그인 전용 페이지 (로그인/회원가입)
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'app' })
  }
  // 그 외 (랜딩페이지 등)
  else {
    next()
  }
})

export default router
