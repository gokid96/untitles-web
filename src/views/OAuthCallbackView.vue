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
import { exchangeLoginCode, APPLE_STATE_KEY, OAUTH_STATE_KEY } from '@/utils/socialAuth'
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

const providerNames = { KAKAO: '카카오', APPLE: 'Apple', GOOGLE: 'Google', NAVER: '네이버' }

// 로그인·연결은 이 탭에서 떠날 때 기억한 state와 돌아온 state가 같아야 한다.
// 남이 만든 로그인 주소(자기 계정의 일회용 코드)를 눌러 그 사람 계정으로 로그인되는 위조를 막는다
function stateOk() {
  const key = route.query.provider === 'apple' ? APPLE_STATE_KEY : OAUTH_STATE_KEY
  let expected = null
  try {
    expected = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
  } catch {
    expected = null
  }
  return !!expected && route.query.state === expected
}

// 내 정보에서 소셜 계정 연결을 마치고 돌아온 경우 (이미 로그인한 상태)
async function finishLink() {
  const valid = route.query.error ? true : stateOk()
  if (route.query.error || !valid) {
    toast.add({ severity: 'error', summary: '연결 실패', detail: route.query.error ? String(route.query.error) : '요청이 올바르지 않습니다. 다시 시도해주세요.', life: 6000 })
  } else if (route.query.linked) {
    const name = providerNames[String(route.query.linked)] || String(route.query.linked)
    try {
      await authStore.refreshUser()
    } catch {
      // 다음 새로고침 때 반영됨
    }
    toast.add({ severity: 'success', summary: '연결 완료', detail: `이제 ${name}로도 로그인할 수 있어요.`, life: 4000 })
  }
  router.replace('/')
}

onMounted(async () => {
  if (route.query.mode === 'link' || route.query.linked) return finishLink()
  if (route.query.error) return fail(String(route.query.error))

  const code = route.query.code
  if (!code) return fail('로그인 정보를 받지 못했습니다. 다시 시도해주세요.')

  if (!stateOk()) return fail('로그인 요청이 올바르지 않습니다. 다시 시도해주세요.')

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
