import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { isNativeApp } from '@/utils/platform'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app',
      component: () => import('@/views/MainView.vue'),
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
      // 초대 메일의 링크
      path: '/invitations/:token',
      name: 'invitation',
      component: () => import('@/views/InvitationView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/TermsView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
      meta: { requiresAuth: false },
    },
    {
      // 웹 애플 로그인(팝업)의 등록된 돌아올 주소. 팝업 방식이라 실제로는 거의 열리지 않는다
      path: '/oauth/apple',
      redirect: '/login',
    },
    {
      path: '/oauth/callback',
      name: 'oauth-callback',
      component: () => import('@/views/OAuthCallbackView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/app',
      name: 'app-redirect',
      redirect: '/',
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

  // 스토어 앱은 로그인 전에 빈 편집기 대신 시작(로그인·가입) 화면부터 보여준다. 웹은 둘러보기를 허용
  if (isNativeApp && to.name === 'app' && !authStore.isAuthenticated) {
    next({ name: 'login' })
  }
  // 인증이 필요한 페이지인 경우
  else if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
  // 비로그인 전용 페이지 (로그인/회원가입) - 이미 로그인된 경우 메인으로
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'app' })
  }
  // 그 외 (메인, 공개 페이지 등)
  else {
    next()
  }
})

export default router
