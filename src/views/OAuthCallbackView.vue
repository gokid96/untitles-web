<template>
  <div class="oauth-callback">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const statusMessage = ref('로그인 처리 중...')

onMounted(async () => {
  const errorParam = route.query.error

  if (errorParam) {
    toast.add({
      severity: 'error',
      summary: '로그인 실패',
      detail: decodeURIComponent(errorParam),
      life: 5000,
    })
    router.replace('/login')
    return
  }

  // URL에서 JWT 토큰 추출 (?accessToken=xxx&refreshToken=xxx)
  const accessToken = route.query.accessToken
  const refreshToken = route.query.refreshToken

  if (!accessToken || !refreshToken) {
    toast.add({
      severity: 'error',
      summary: '로그인 실패',
      detail: '토큰을 받지 못했습니다. 다시 로그인해주세요.',
      life: 5000,
    })
    router.replace('/login')
    return
  }

  try {
    statusMessage.value = '사용자 정보 확인 중...'

    // 토큰 저장
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    // 사용자 정보 로드
    const success = await authStore.loadUserFromStorage()

    if (!success) {
      throw new Error('사용자 정보를 가져오지 못했습니다.')
    }

    toast.add({
      severity: 'success',
      summary: '로그인 성공',
      detail: `${authStore.currentUser?.nickname || ''}님 환영합니다!`,
      life: 3000,
    })

    router.replace('/app')
  } catch (error) {
    console.error('OAuth 콜백 처리 실패:', error)

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    toast.add({
      severity: 'error',
      summary: '로그인 실패',
      detail: '소셜 로그인 처리 중 오류가 발생했습니다.',
      life: 5000,
    })

    router.replace('/login')
  }
})
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a1020 100%);
}

.loading-container {
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
