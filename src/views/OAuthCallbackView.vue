<template>
  <div class="oauth-callback">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">로그인 처리 중...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

onMounted(async () => {
  try {
    // OAuth 로그인 후 세션이 이미 생성되어 있으므로
    // 서버에서 현재 사용자 정보를 가져옴
    const isAuthenticated = await authStore.checkAuthStatus()
    
    if (!isAuthenticated) {
      throw new Error('인증 실패')
    }
    
    toast.add({
      severity: 'success',
      summary: '로그인 성공',
      detail: '환영합니다!',
      life: 3000,
    })
    
    router.replace('/app')
  } catch (error) {
    console.error('OAuth 콜백 처리 실패:', error)
    toast.add({
      severity: 'error',
      summary: '로그인 실패',
      detail: '소셜 로그인 처리 중 오류가 발생했습니다.',
      life: 3000,
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
