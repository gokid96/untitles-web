<template>
  <div class="invitation-view">
    <div class="card">
      <div v-if="loading" class="state">초대를 확인하는 중...</div>

      <div v-else-if="!preview" class="state">
        <Mail class="big-icon" />
        <h1>초대를 찾을 수 없어요</h1>
        <p>{{ loadError || '이미 수락·거절했거나, 취소되었거나, 만료된 초대예요.' }}</p>
        <router-link to="/" class="primary-link">Untitles로 가기</router-link>
      </div>

      <template v-else>
        <div class="ws-icon"><Users class="icon" /></div>
        <h1>{{ preview.workspaceName }}</h1>
        <p class="lead">
          <strong>{{ preview.inviterNickname }}</strong>님이 이 워크스페이스에
          <strong>{{ roleLabel[preview.role] || preview.role }}</strong>(으)로 초대했어요.
        </p>
        <p class="meta">
          <span v-if="preview.maskedEmail">받는 사람 {{ preview.maskedEmail }} · </span>{{ expiresText }}
        </p>

        <p v-if="error" class="error">{{ error }}</p>

        <div v-if="authStore.isAuthenticated" class="actions">
          <button type="button" class="btn secondary" :disabled="busy" @click="decline">거절</button>
          <button type="button" class="btn primary" :disabled="busy" @click="accept">{{ busy ? '처리 중...' : '수락하고 참여하기' }}</button>
        </div>
        <template v-else>
          <div class="actions">
            <button type="button" class="btn primary" @click="goLogin">로그인하고 수락하기</button>
          </div>
          <p class="hint">계정이 없다면 초대받은 이메일로 가입하면 돼요.</p>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Mail, Users } from 'lucide-vue-next'
import { invitationApi } from '@/api/invitationApi'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { getErrorMessage } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

const token = String(route.params.token || '')
const preview = ref(null)
const loading = ref(true)
const loadError = ref('')
const error = ref('')
const busy = ref(false)

const roleLabel = { ADMIN: '관리자', MEMBER: '멤버', VIEWER: '뷰어' }
const expiresText = computed(() => {
  if (!preview.value?.expiresAt) return ''
  const days = Math.ceil((new Date(preview.value.expiresAt) - Date.now()) / 86400000)
  return days <= 1 ? '오늘 만료' : `${days}일 후 만료`
})

onMounted(async () => {
  try {
    const { data } = await invitationApi.preview(token)
    preview.value = data
  } catch (e) {
    if (e.response?.status !== 404) loadError.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
})

function goLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

async function accept() {
  busy.value = true
  error.value = ''
  try {
    const workspaceId = await workspaceStore.acceptInvitation(token)
    if (workspaceId) workspaceStore.selectWorkspace(workspaceId)
    toast.add({ severity: 'success', summary: '참여 완료', detail: `${preview.value.workspaceName}에 참여했어요.`, life: 3000 })
    router.replace('/')
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    busy.value = false
  }
}

async function decline() {
  busy.value = true
  error.value = ''
  try {
    await workspaceStore.declineInvitation(token)
    toast.add({ severity: 'info', summary: '초대 거절', detail: '초대를 거절했어요.', life: 3000 })
    router.replace('/')
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.invitation-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  padding-top: max(1.5rem, env(safe-area-inset-top));
  background: var(--surface-ground);
  color: var(--text-color);
}
.card {
  width: 100%;
  max-width: 420px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  padding: 2rem 1.75rem;
  text-align: center;
}
.state { color: var(--text-color-secondary); }
.state h1 { color: var(--text-color); }
.big-icon { width: 32px; height: 32px; opacity: 0.6; }
.ws-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  background: var(--surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon { width: 24px; height: 24px; color: var(--text-color-secondary); }
h1 { font-size: 1.25rem; margin: 0.5rem 0; word-break: break-word; }
.lead { font-size: 0.9375rem; line-height: 1.6; margin: 0 0 0.5rem; word-break: keep-all; }
.meta { font-size: 0.8125rem; color: var(--text-color-secondary); margin: 0 0 1.25rem; }
.actions { display: flex; gap: 0.5rem; }
.btn {
  flex: 1;
  min-height: 44px;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.primary { background: var(--primary-color); color: var(--primary-color-text); }
.btn.secondary { background: transparent; color: var(--text-color); border-color: var(--surface-border); flex: 0 0 30%; }
.hint { margin: 0.75rem 0 0; font-size: 0.8125rem; color: var(--text-color-secondary); }
.error { color: #ef4444; font-size: 0.8125rem; margin: 0 0 0.75rem; word-break: keep-all; }
.primary-link { display: inline-block; margin-top: 0.75rem; color: var(--text-color); }
</style>
