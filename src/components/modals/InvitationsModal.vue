<template>
  <Dialog :visible="visible" header="받은 초대" modal :style="{ width: '440px' }" :breakpoints="{ '520px': '94vw' }"
    @update:visible="(v) => emit('update:visible', v)">
    <div v-if="invitations.length === 0" class="empty">
      <Mail class="empty-icon" />
      <p>받은 초대가 없어요</p>
    </div>
    <ul v-else class="list">
      <li v-for="invitation in invitations" :key="invitation.token" class="item">
        <div class="ws-icon"><Users class="icon" /></div>
        <div class="body">
          <strong class="ws-name">{{ invitation.workspaceName }}</strong>
          <span class="desc">
            {{ invitation.inviterNickname }}님이 <b>{{ roleLabel[invitation.role] || invitation.role }}</b>(으)로 초대했어요
          </span>
          <span class="expires">{{ expiresText(invitation.expiresAt) }}</span>
        </div>
        <div class="actions">
          <Button label="거절" severity="secondary" text size="small" :disabled="busy === invitation.token"
            @click="decline(invitation)" />
          <Button label="수락" size="small" :loading="busy === invitation.token" @click="accept(invitation)" />
        </div>
      </li>
    </ul>
    <p class="note">{{ roleHelp }}</p>
  </Dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { Mail, Users } from 'lucide-vue-next'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { getErrorMessage } from '@/utils/helpers'

defineProps({ visible: { type: Boolean, default: false } })
const emit = defineEmits(['update:visible', 'accepted'])

const toast = useToast()
const workspaceStore = useWorkspaceStore()
const invitations = computed(() => workspaceStore.myInvitations)
const busy = ref(null)

const roleLabel = { ADMIN: '관리자', MEMBER: '멤버', VIEWER: '뷰어' }
const roleHelp = '관리자는 멤버 초대·설정 변경, 멤버는 노트 작성·편집, 뷰어는 읽기만 할 수 있어요.'

function expiresText(expiresAt) {
  const days = Math.ceil((new Date(expiresAt) - Date.now()) / 86400000)
  return days <= 1 ? '오늘 만료돼요' : `${days}일 후 만료돼요`
}

async function accept(invitation) {
  busy.value = invitation.token
  try {
    const workspaceId = await workspaceStore.acceptInvitation(invitation.token)
    toast.add({ severity: 'success', summary: '참여 완료', detail: `${invitation.workspaceName}에 참여했어요.`, life: 3000 })
    emit('accepted', workspaceId)
    if (workspaceStore.myInvitations.length === 0) emit('update:visible', false)
  } catch (error) {
    toast.add({ severity: 'error', summary: '수락하지 못했어요', detail: getErrorMessage(error), life: 4000 })
    await workspaceStore.loadMyInvitations()
  } finally {
    busy.value = null
  }
}

async function decline(invitation) {
  busy.value = invitation.token
  try {
    await workspaceStore.declineInvitation(invitation.token)
    toast.add({ severity: 'info', summary: '초대 거절', detail: `${invitation.workspaceName} 초대를 거절했어요.`, life: 3000 })
    if (workspaceStore.myInvitations.length === 0) emit('update:visible', false)
  } catch (error) {
    toast.add({ severity: 'error', summary: '오류', detail: getErrorMessage(error), life: 4000 })
    await workspaceStore.loadMyInvitations()
  } finally {
    busy.value = null
  }
}
</script>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
}
.ws-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-hover);
  flex-shrink: 0;
}
.icon { width: 18px; height: 18px; color: var(--text-color-secondary); }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.125rem; }
.ws-name { font-size: 0.9375rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.desc { font-size: 0.8125rem; color: var(--text-color-secondary); word-break: keep-all; }
.expires { font-size: 0.75rem; color: var(--text-color-secondary); opacity: 0.8; }
.actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
.empty { text-align: center; padding: 1.5rem 0; color: var(--text-color-secondary); }
.empty-icon { width: 28px; height: 28px; opacity: 0.6; }
.note { margin: 1rem 0 0; font-size: 0.75rem; color: var(--text-color-secondary); line-height: 1.5; word-break: keep-all; }
@media (max-width: 420px) {
  .item { flex-wrap: wrap; }
  .actions { width: 100%; justify-content: flex-end; }
}
</style>
