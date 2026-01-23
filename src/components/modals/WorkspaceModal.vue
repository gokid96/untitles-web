<template>
  <Dialog v-model:visible="dialogVisible" :header="modalTitle" :style="{ width: '520px' }" modal :closable="true"
    class="workspace-modal">
    <TabView v-model:activeIndex="activeTabIndex" class="workspace-tabs">
      <!-- 일반 탭 -->
      <TabPanel header="일반">
        <div class="tab-content">
          <!-- 폼 영역 -->
          <div class="form-section">
            <div class="input-group">
              <label for="workspaceName">워크스페이스 이름</label>
              <InputText id="workspaceName" v-model="workspaceName" placeholder="내 노트" class="modern-input"
                :disabled="isEditMode && !workspaceStore.isAdmin" />
            </div>
            <div class="input-group">
              <label for="workspaceDesc">설명 <span class="optional">(선택)</span></label>
              <InputText id="workspaceDesc" v-model="workspaceDesc" placeholder="팀 워크스페이스" class="modern-input"
                :disabled="isEditMode && !workspaceStore.isAdmin" />
            </div>
            <Button :label="isEditMode ? '변경사항 저장' : '워크스페이스 생성'" @click="handleSubmit" class="submit-btn"
              :disabled="!workspaceName.trim() || (isEditMode && !workspaceStore.isAdmin) || (!isEditMode && !workspaceStore.canCreateWorkspace)" :loading="isSubmitting" />
            
            <!-- 생성 제한 안내 -->
            <div v-if="!isEditMode && !workspaceStore.canCreateWorkspace" class="limit-notice">
              <i class="pi pi-info-circle"></i>
              <span>워크스페이스는 최대 3개까지 생성할 수 있습니다.</span>
            </div>
          </div>

          <!-- 워크스페이스 정보 카드 (수정 모드) -->
          <div class="info-card" v-if="isEditMode">
            <div class="info-row">
              <div class="info-item">
                <i class="pi pi-user info-icon"></i>
                <div class="info-content">
                  <span class="info-label">내 역할</span>
                  <span class="info-value" :class="'role-' + workspaceStore.myRole?.toLowerCase()">
                    {{ getRoleLabel(workspaceStore.myRole) }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <i class="pi pi-users info-icon"></i>
                <div class="info-content">
                  <span class="info-label">멤버</span>
                  <span class="info-value">{{ workspaceStore.currentWorkspace?.memberCount || 1 }}명</span>
                </div>
              </div>
              <div class="info-item">
                <i class="pi pi-calendar info-icon"></i>
                <div class="info-content">
                  <span class="info-label">생성일</span>
                  <span class="info-value">{{ formatDate(workspaceStore.currentWorkspace?.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 위험 구역 -->
          <div class="danger-section" v-if="isEditMode">
            <div class="danger-card" v-if="workspaceStore.isOwner">
              <i class="pi pi-trash danger-icon"></i>
              <div class="danger-content">
                <strong>워크스페이스 삭제</strong>
                <p>모든 폴더와 노트가 영구적으로 삭제됩니다</p>
              </div>
              <Button label="삭제" severity="danger" outlined size="small" @click="confirmDeleteWorkspace" />
            </div>
            <div class="danger-card warning" v-else>
              <i class="pi pi-sign-out danger-icon"></i>
              <div class="danger-content">
                <strong>워크스페이스 나가기</strong>
                <p>다시 참여하려면 초대가 필요합니다</p>
              </div>
              <Button label="나가기" severity="warning" outlined size="small" @click="confirmLeaveWorkspace" />
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- 멤버 탭 -->
      <TabPanel header="멤버">
        <div class="tab-content">
          <!-- 멤버 검색 -->
          <div class="search-section" v-if="!isEditMode || workspaceStore.isAdmin">
            <div class="search-wrapper">
              <i class="pi pi-search search-icon"></i>
              <InputText v-model="searchEmail" placeholder="이메일 또는 닉네임으로 검색" class="search-input" @input="handleSearchInput"
                @focus="showSearchResults = true" />
              <Dropdown v-model="inviteRole" :options="availableRoles" optionLabel="label" optionValue="value"
                class="role-select" />
            </div>

            <!-- 멤버 제한 안내 -->
            <div v-if="isEditMode && members.length >= 5" class="limit-notice">
              <i class="pi pi-info-circle"></i>
              <span>워크스페이스 멤버는 최대 5명까지 초대할 수 있습니다.</span>
            </div>

            <!-- 검색 결과 -->
            <div v-if="showSearchResults && searchResults.length > 0 && (!isEditMode || members.length < 5)" class="search-dropdown">
              <div v-for="user in searchResults" :key="user.userId" class="search-item" @click="handleAddMember(user)">
                <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(user.nickname || user.email) }">
                  {{ (user.nickname || user.email).charAt(0).toUpperCase() }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user.nickname || '사용자' }}</span>
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <Button :label="isEditMode ? '초대' : '추가'" size="small" text class="add-btn"
                  :loading="invitingUserId === user.userId" />
              </div>
            </div>
          </div>

          <!-- 멤버 목록 -->
          <div class="members-section">
            <div class="members-header">
              <span class="members-title">
                {{ isEditMode ? '멤버' : '초대 대기' }}
                <span class="members-count">{{ memberList.length }}</span>
              </span>
            </div>

            <div v-if="memberList.length === 0" class="empty-state">
              <i class="pi pi-users empty-icon"></i>
              <p>{{ isEditMode ? '멤버가 없습니다' : '초대할 멤버를 검색해서 추가하세요' }}</p>
            </div>

            <div v-else class="members-list">
              <div v-for="member in memberList" :key="member.userId || member.memberId" class="member-card">
                <div class="member-avatar" :style="{ backgroundColor: getAvatarColor(member.nickname || member.email) }">
                  {{ getMemberInitial(member) }}
                </div>
                <div class="member-info">
                  <span class="member-name">{{ member.nickname || member.email }}</span>
                  <span class="member-email">{{ member.email }}</span>
                </div>
                <div class="member-actions">
                  <Dropdown v-if="canChangeRole(member)" :modelValue="member.role"
                    @update:modelValue="(val) => handleUpdateRole(member, val)" :options="availableRoles"
                    optionLabel="label" optionValue="value" class="role-dropdown" />
                  <span v-else class="role-tag" :class="'role-' + member.role?.toLowerCase()">
                    {{ getRoleLabel(member.role) }}
                  </span>
                  <Button v-if="canRemoveMember(member)" icon="pi pi-times" severity="secondary" text rounded size="small"
                    class="remove-btn" @click="handleRemoveMember(member)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </Dialog>

  <!-- 삭제 확인 다이얼로그 -->
  <Dialog v-model:visible="isDeleteConfirmOpen" :style="{ width: '400px' }" modal :closable="false"
    :showHeader="false" class="delete-modal" :pt="{ root: { class: 'delete-dialog-root' } }">
    <div class="delete-content">
      <div class="delete-icon-wrapper">
        <i class="pi pi-trash"></i>
      </div>
      <h3 class="delete-title">워크스페이스 삭제</h3>
      <p class="delete-message">
        <strong>{{ workspaceStore.currentWorkspace?.name }}</strong>을(를) 삭제하시겠습니까?
      </p>
      <p class="delete-submessage">모든 폴더와 노트가 영구적으로 삭제됩니다.</p>
      <div class="confirm-field">
        <label >확인을 위해 <strong>{{ workspaceStore.currentWorkspace?.name }}</strong> 입력</label>
        <InputText v-model="deleteConfirmName" :placeholder="workspaceStore.currentWorkspace?.name" class="w-full" />
      </div>
      <div class="delete-actions">
        <Button label="취소" severity="secondary" outlined @click="isDeleteConfirmOpen = false" class="flex-1" />
        <Button label="삭제" severity="danger" @click="handleDeleteWorkspace"
          :disabled="deleteConfirmName !== workspaceStore.currentWorkspace?.name" class="flex-1" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { userApi } from '@/api/userApi'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dropdown from 'primevue/dropdown'

const toast = useToast()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value)
  }
})

const emit = defineEmits(['update:visible', 'created', 'updated', 'deleted', 'left'])

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

// 다이얼로그 visible 양방향 바인딩
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isEditMode = computed(() => props.mode === 'edit')
const modalTitle = computed(() => isEditMode.value ? '워크스페이스 설정' : '새 워크스페이스')

// 폼 데이터
const workspaceName = ref('')
const workspaceDesc = ref('')
const activeTabIndex = ref(0)
const isSubmitting = ref(false)

// 멤버 관리
const members = ref([])
const pendingMembers = ref([])

// 검색
const searchEmail = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const showSearchResults = ref(false)
const inviteRole = ref('MEMBER')
const invitingUserId = ref(null)
let searchTimeout = null

// 삭제
const isDeleteConfirmOpen = ref(false)
const deleteConfirmName = ref('')
const isDeleting = ref(false)

// 권한 옵션
const availableRoles = [
  { label: '관리자', value: 'ADMIN' },
  { label: '멤버', value: 'MEMBER' },
  { label: '뷰어', value: 'VIEWER' }
]

const rolePriority = {
  'OWNER': 0,
  'ADMIN': 1,
  'MEMBER': 2,
  'VIEWER': 3
}

const memberList = computed(() => {
  const list = isEditMode.value ? members.value : pendingMembers.value
  return [...list].sort((a, b) => {
    return (rolePriority[a.role] ?? 99) - (rolePriority[b.role] ?? 99)
  })
})

// visible 변경 시 초기화
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    activeTabIndex.value = 0
    searchEmail.value = ''
    searchResults.value = []
    showSearchResults.value = false
    inviteRole.value = 'MEMBER'
    document.addEventListener('keydown', handleMainKeydown)

    if (isEditMode.value) {
      const workspace = workspaceStore.currentWorkspace
      workspaceName.value = workspace?.name || ''
      workspaceDesc.value = workspace?.description || ''
      await loadMembers()
    } else {
      workspaceName.value = ''
      workspaceDesc.value = ''
      pendingMembers.value = []
    }
  } else {
    document.removeEventListener('keydown', handleMainKeydown)
  }
})

// 삭제 모달 키보드 이벤트
watch(() => isDeleteConfirmOpen.value, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleDeleteKeydown)
  } else {
    document.removeEventListener('keydown', handleDeleteKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleMainKeydown)
  document.removeEventListener('keydown', handleDeleteKeydown)
})

// 메인 모달: ESC로 닫기
function handleMainKeydown(e) {
  if (!props.visible || isDeleteConfirmOpen.value) return
  
  if (e.key === 'Escape') {
    emit('update:visible', false)
  }
}

// 삭제 모달: ESC로 닫기, Enter로 삭제
function handleDeleteKeydown(e) {
  if (!isDeleteConfirmOpen.value) return
  
  if (e.key === 'Escape') {
    isDeleteConfirmOpen.value = false
  } else if (e.key === 'Enter') {
    if (deleteConfirmName.value === workspaceStore.currentWorkspace?.name) {
      handleDeleteWorkspace()
    }
  }
}

// 유틸 함수
function getMemberInitial(member) {
  const name = member.nickname || member.email || '?'
  return name.charAt(0).toUpperCase()
}

function getAvatarColor(str) {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#eab308', '#84cc16', '#22c55e', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6'
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getRoleLabel(role) {
  const labels = {
    'OWNER': '소유자',
    'ADMIN': '관리자',
    'MEMBER': '멤버',
    'VIEWER': '뷰어'
  }
  return labels[role] || role
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function canChangeRole(member) {
  if (isEditMode.value) {
    if (member.role === 'OWNER') return false
    if (member.userId === authStore.userId) return false
    return workspaceStore.isAdmin
  }
  return true
}

function canRemoveMember(member) {
  if (isEditMode.value) {
    if (member.role === 'OWNER') return false
    if (member.userId === authStore.userId) return false
    return workspaceStore.isAdmin
  }
  return true
}

async function loadMembers() {
  if (!workspaceStore.currentWorkspaceId) return
  try {
    const data = await workspaceStore.loadMembers(workspaceStore.currentWorkspaceId)
    members.value = data
  } catch (error) {
    console.error('Failed to load members:', error)
  }
}

async function handleSubmit() {
  if (!workspaceName.value.trim()) return

  try {
    isSubmitting.value = true

    if (isEditMode.value) {
      await workspaceStore.updateWorkspace(workspaceStore.currentWorkspaceId, {
        name: workspaceName.value.trim(),
        description: workspaceDesc.value.trim() || null
      })
      emit('update:visible', false)
      toast.add({ severity: 'success', summary: '저장 완료', detail: '워크스페이스가 수정되었습니다.', life: 3000 })
    } else {
      const workspace = await workspaceStore.createWorkspace({
        name: workspaceName.value.trim(),
        description: workspaceDesc.value.trim() || null
      })

      if (pendingMembers.value.length > 0) {
        for (const member of pendingMembers.value) {
          try {
            await workspaceStore.inviteMember(workspace.workspaceId, member.email, member.role)
          } catch (error) {
            console.error(`Failed to invite ${member.email}:`, error)
          }
        }
        await workspaceStore.loadWorkspaces()
      }
      emit('created', workspace)
      emit('update:visible', false)
      toast.add({ severity: 'success', summary: '생성 완료', detail: '워크스페이스가 생성되었습니다.', life: 3000 })
    }
  } catch (error) {
    console.error('Failed to submit:', error)
    const errorMessage = error.response?.data?.message || (isEditMode.value ? '수정에 실패했습니다.' : '생성에 실패했습니다.')
    toast.add({ severity: 'error', summary: '오류', detail: errorMessage, life: 3000 })
  } finally {
    isSubmitting.value = false
  }
}

function handleSearchInput() {
  showSearchResults.value = true

  if (searchTimeout) clearTimeout(searchTimeout)

  if (!searchEmail.value.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true
      const response = await userApi.searchUsers(searchEmail.value)

      const excludeIds = isEditMode.value
        ? members.value.map(m => m.userId)
        : [...pendingMembers.value.map(m => m.userId), authStore.userId]

      searchResults.value = response.data.filter(user => !excludeIds.includes(user.userId))
    } catch (error) {
      console.error('Failed to search users:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

async function handleAddMember(user) {
  if (isEditMode.value) {
    // 멤버 제한 체크
    if (members.value.length >= 5) {
      toast.add({ severity: 'warn', summary: '제한 초과', detail: '워크스페이스 멤버는 최대 5명까지 초대할 수 있습니다.', life: 3000 })
      return
    }

    try {
      invitingUserId.value = user.userId
      await workspaceStore.inviteMember(workspaceStore.currentWorkspaceId, user.email, inviteRole.value)
      searchResults.value = searchResults.value.filter(u => u.userId !== user.userId)
      await loadMembers()
      await workspaceStore.loadWorkspaces()
      toast.add({ severity: 'success', summary: '초대 완료', detail: `${user.nickname || user.email}님을 초대했습니다.`, life: 3000 })
    } catch (error) {
      console.error('Failed to invite member:', error)
      const errorMessage = error.response?.data?.message || '멤버 초대에 실패했습니다.'
      toast.add({ severity: 'error', summary: '오류', detail: errorMessage, life: 3000 })
    } finally {
      invitingUserId.value = null
    }
  } else {
    if (pendingMembers.value.find(m => m.userId === user.userId)) return
    pendingMembers.value.push({ ...user, role: inviteRole.value })
    searchResults.value = searchResults.value.filter(u => u.userId !== user.userId)
    searchEmail.value = ''
    showSearchResults.value = false
  }
}

async function handleUpdateRole(member, newRole) {
  if (isEditMode.value) {
    try {
      await workspaceStore.updateMemberRole(workspaceStore.currentWorkspaceId, member.memberId, newRole)
      await loadMembers()
      toast.add({ severity: 'success', summary: '권한 변경', detail: `${member.nickname || member.email}님의 권한이 변경되었습니다.`, life: 3000 })
    } catch (error) {
      console.error('Failed to update role:', error)
      toast.add({ severity: 'error', summary: '오류', detail: '권한 변경에 실패했습니다.', life: 3000 })
    }
  } else {
    const idx = pendingMembers.value.findIndex(m => m.userId === member.userId)
    if (idx !== -1) pendingMembers.value[idx].role = newRole
  }
}

async function handleRemoveMember(member) {
  if (isEditMode.value) {
    if (!confirm(`${member.nickname || member.email}님을 제거하시겠습니까?`)) return
    try {
      await workspaceStore.removeMember(workspaceStore.currentWorkspaceId, member.memberId)
      await loadMembers()
      await workspaceStore.loadWorkspaces()
      toast.add({ severity: 'success', summary: '제거 완료', detail: `${member.nickname || member.email}님을 제거했습니다.`, life: 3000 })
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.add({ severity: 'error', summary: '오류', detail: '멤버 제거에 실패했습니다.', life: 3000 })
    }
  } else {
    pendingMembers.value = pendingMembers.value.filter(m => m.userId !== member.userId)
  }
}

function confirmDeleteWorkspace() {
  deleteConfirmName.value = ''
  isDeleteConfirmOpen.value = true
}

async function handleDeleteWorkspace() {
  if (deleteConfirmName.value !== workspaceStore.currentWorkspace?.name) return

  try {
    isDeleting.value = true
    const workspaceId = workspaceStore.currentWorkspaceId

    isDeleteConfirmOpen.value = false
    dialogVisible.value = false

    await workspaceStore.deleteWorkspace(workspaceId)

    toast.add({ severity: 'success', summary: '삭제 완료', detail: '워크스페이스가 삭제되었습니다.', life: 3000 })
    emit('deleted')
  } catch (error) {
    console.error('Failed to delete workspace:', error)
    const errorMessage = error.response?.data?.message || '워크스페이스 삭제에 실패했습니다.'
    toast.add({ severity: 'error', summary: '오류', detail: errorMessage, life: 3000 })
  } finally {
    isDeleting.value = false
  }
}

async function confirmLeaveWorkspace() {
  if (!confirm('정말로 이 워크스페이스를 나가시겠습니까?')) return

  try {
    await workspaceStore.leaveWorkspace(workspaceStore.currentWorkspaceId)
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: '나가기 완료', detail: '워크스페이스에서 나갔습니다.', life: 3000 })
    emit('left')
  } catch (error) {
    console.error('Failed to leave workspace:', error)
    toast.add({ severity: 'error', summary: '오류', detail: '워크스페이스 나가기에 실패했습니다.', life: 3000 })
  }
}
</script>

<style scoped>
/* 모달 기본 스타일 */
:deep(.workspace-modal .p-dialog-header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.workspace-modal .p-dialog-content) {
  padding: 0;
}

:deep(.workspace-tabs .p-tabview-panels) {
  padding: 1.5rem;
}

:deep(.workspace-tabs .p-tabview-nav) {
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.workspace-tabs .p-tabview-nav-link) {
  padding: 1rem 1.25rem;
  font-weight: 500;
}

/* 탭 컨텐츠 */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 폼 섹션 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.input-group .optional {
  font-weight: 400;
  color: var(--text-color-secondary);
}

.modern-input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  transition: all 0.2s ease;
}

.modern-input:hover {
  border-color: var(--primary-color);
}

.modern-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
}

/* 제한 안내 */
.limit-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #f59e0b;
}

.limit-notice i {
  font-size: 1rem;
}

/* 정보 카드 */
.info-card {
  background: linear-gradient(135deg, var(--surface-ground) 0%, var(--surface-hover) 100%);
  border-radius: 12px;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-icon {
  font-size: 1.1rem;
  color: var(--text-color-secondary);
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
}

.info-value.role-owner {
  color: #f59e0b;
}

.info-value.role-admin {
  color: #8b5cf6;
}

/* 위험 섹션 */
.danger-section {
  margin-top: 0.5rem;
}

.danger-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.05);
}

.danger-card.warning {
  border-color: rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.05);
}

.danger-icon {
  font-size: 1.25rem;
  color: var(--text-color-secondary);
}

.danger-card:not(.warning) .danger-icon {
  color: #ef4444;
}

.danger-card.warning .danger-icon {
  color: #f59e0b;
}

.danger-content {
  flex: 1;
}

.danger-content strong {
  font-size: 0.875rem;
  color: var(--text-color);
  display: block;
}

.danger-content p {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
}

/* 검색 섹션 */
.search-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--surface-ground);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}

.search-icon {
  padding-left: 0.5rem;
  color: var(--text-color-secondary);
}

.search-wrapper .search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
}

.search-wrapper .search-input:focus {
  box-shadow: none;
}

.role-select {
  border: none;
  background: var(--surface-card);
  border-radius: 8px;
}

:deep(.role-select .p-dropdown-label) {
  padding: 0.5rem 0.75rem;
}

/* 검색 드롭다운 */
.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition:  0.15s ease;
}

.search-item:first-child {
  border-radius: 12px 12px 0 0;
}

.search-item:last-child {
  border-radius: 0 0 12px 12px;
}

.search-item:hover {
  background: var(--surface-hover);
}

.search-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

/* 아바타 */
.user-avatar,
.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
}

.user-info,
.member-info {
  flex: 1;
  min-width: 0;
}

.user-name,
.member-name {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}

.user-email,
.member-email {
  display: block;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-btn {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.search-item:hover .add-btn {
  opacity: 1;
}

/* 멤버 섹션 */
.members-section {
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  overflow: hidden;
}

.members-header {
  padding: 0.75rem 1rem;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
}

.members-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color);
}

.members-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 0.5rem;
  background: var(--surface-card);
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.empty-state {
  padding: 2.5rem;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: var(--text-color-secondary);
  opacity: 0.5;
}

.empty-state p {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.members-list {
  max-height: 280px;
  overflow-y: auto;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--surface-border);
  transition: background 0.15s ease;
}

.member-card:last-child {
  border-bottom: none;
}

.member-card:hover {
  background: var(--surface-hover);
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-dropdown {
  min-width: 100px;
}

:deep(.role-dropdown .p-dropdown-label) {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}

.role-tag {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 6px;
  background: var(--surface-ground);
  color: var(--text-color-secondary);
}

.role-tag.role-owner {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.role-tag.role-admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.remove-btn {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.member-card:hover .remove-btn {
  opacity: 1;
}

/* 삭제 모달 */
:deep(.delete-modal .p-dialog-content) {
  padding: 0;
  border-radius: 12px;
}

.delete-content {
  text-align: center;
  padding: 2rem;
}

.delete-icon-wrapper {
  width: 56px;
  height: 56px;
  margin: 0 auto 1.25rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon-wrapper i {
  font-size: 1.5rem;
  color: #ef4444;
}

.delete-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem;
}

.delete-message {
  font-size: 0.9375rem;
  color: var(--text-color);
  margin: 0 0 0.25rem;
}

.delete-message strong {
  color: #ef4444;
}

.delete-submessage {
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
  margin: 0 0 1.5rem;
}

.confirm-field {
  margin-bottom: 1.5rem;
}

.confirm-field label {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}

.confirm-field label strong {
  color: var(--text-color);
}

.delete-actions {
  display: flex;
  gap: 0.75rem;
}

.delete-actions .flex-1 {
  flex: 1;
}
</style>
