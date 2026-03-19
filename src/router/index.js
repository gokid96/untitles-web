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
      path: '/oauth/callback',
      name: 'oauth-callback',
      component: () => import('@/views/OAuthCallbackView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('@/views/MainView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/main',
      redirect: '/app',
    },
    {
      path: '/public/:slug',
      name: 'public-workspace',
      component: () => import('@/views/PublicWorkspaceView.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: 'posts/:postId',
          name: 'public-post',
          component: () => import('@/views/PublicPostView.vue'),
          meta: { requiresAuth: false },
        },
      ],
    },
  ],
})

// 초기화 여부 플래그
let isInitialized = false

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 항상 한 번만 초기화 (페이지 무관)
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
  // 비로그인 전용 페이지 (로그인/회원가입) - 이미 로그인된 경우 앱으로
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'app' })
  }
  // 그 외 (랜딩페이지 등)
  else {
    next()
  }
})

export default router
