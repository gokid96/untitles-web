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
import { usePostStore } from '@/stores/postStore'
import { restoreGuestDraft, getErrorMessage } from '@/utils/helpers'
import { exchangeLoginCode } from '@/utils/socialAuth'
import { useToast } from 'primevue/usetoast'

/**
 * 웹 리다이렉트 방식 소셜 로그인(카카오·구글) 후 돌아오는 화면.
 * 서버가 준 1분짜리 일회용 코드(?code=)를 토큰으로 바꾼다. (토큰은 주소에 실리지 않는다)
 */
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const postStore = usePostStore()
const toast = useToast()

const statusMessage = ref('로그인 처리 중...')

function fail(message) {
  toast.add({ severity: 'error', summary: '로그인 실패', detail: message, life: 6000 })
  router.replace('/login')
}

onMounted(async () => {
  if (route.query.error) return fail(String(route.query.error))

  const code = route.query.code
  if (!code) return fail('로그인 정보를 받지 못했습니다. 다시 시도해주세요.')

  try {
    const loginResponse = await exchangeLoginCode(String(code))
    statusMessage.value = '사용자 정보 확인 중...'
    await authStore.completeLogin(loginResponse)
    await restoreGuestDraft(postStore)
    toast.add({
      severity: 'success',
      summary: '로그인 성공',
      detail: `${authStore.currentUser?.nickname || ''}님 환영합니다!`,
      life: 3000,
    })
    router.replace('/')
  } catch (error) {
    fail(getErrorMessage(error))
  }
})
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-ground);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--surface-border);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
