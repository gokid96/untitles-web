<template>
  <div class="login-view">
    <div class="login-card">
      <AuthPanel :initial-step="initialStep" :link-token="linkToken" @done="goNext" />
      <router-link to="/" class="back-home">← 둘러보기로 돌아가기</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import AuthPanel from '@/components/auth/AuthPanel.vue'

defineProps({
  initialStep: { type: String, default: 'start' },
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

// 웹 소셜 로그인이 같은 이메일의 기존 계정과 겹치면 ?link=연결토큰 으로 돌아온다
const linkToken = ref(typeof route.query.link === 'string' ? route.query.link : '')

// 웹 리다이렉트 소셜 로그인이 실패하면 ?error=메시지 로 돌아온다
onMounted(() => {
  if (linkToken.value) router.replace({ path: route.path, query: {} })
  const error = route.query.error
  if (error) {
    toast.add({ severity: 'error', summary: '로그인 실패', detail: String(error), life: 6000 })
    router.replace({ path: route.path, query: {} })
  }
})

function goNext() {
  const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
  router.replace(redirect)
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  padding-top: max(1.5rem, env(safe-area-inset-top));
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  background: var(--surface-ground);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  padding: 2rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.back-home {
  margin-top: 1rem;
  align-self: center;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
  text-decoration: none;
}
.back-home:hover { color: var(--text-color); }
</style>
