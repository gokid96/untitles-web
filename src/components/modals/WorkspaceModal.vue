<template>
  <Dialog v-model:visible="dialogVisible" :header="modalTitle" :style="{ width: '550px' }" modal :closable="true">
    <TabView v-model:activeIndex="activeTabIndex">
      <!-- 일반 탭 -->
      <TabPanel header="일반">
        <div class="tab-content">
          <div class="field">
            <!-- <label for="workspaceName">이름</label> -->
            <InputText id="workspaceName" v-model="workspaceName" placeholder="워크스페이스 이름" class="w-full"
              :disabled="isEditMode && !workspaceStore.isAdmin" />
          </div>
          <div class="field">
            <!-- <label for="workspaceDesc">설명</label> -->
            <InputText id="workspaceDesc" v-model="workspaceDesc" placeholder="워크스페이스 설명 (선택)" class="w-full"
              :disabled="isEditMode && !workspaceStore.isAdmin" />
          </div>
          <div class="tab-actions">
            <Button :label="isEditMode ? '저장' : '생성'" @click="handleSubmit"
              :disabled="!workspaceName.trim() || (isEditMode && !workspaceStore.isAdmin)" />
          </div>

          <!-- 워크스페이스 정보 (수정 모드에서만) -->
          <div class="workspace-info" v-if="isEditMode">
            <div class="info-item">
              <span class="info-label">내 역할</span>
              <span class="info-value">{{ getRoleLabel(workspaceStore.myRole) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">멤버 수</span>
              <span class="info-value">{{ workspaceStore.currentWorkspace?.memberCount || 1 }}명</span>
            </div>
            <div class="info-item">
              <span class="info-label">생성일</span>
              <span class="info-value">{{ formatDate(workspaceStore.currentWorkspace?.createdAt) }}</span>
            </div>
          </div>

          <!-- 워크스페이스 삭제/나가기 (수정 모드에서만) -->
          <div class="danger-zone" v-if="isEditMode && workspaceStore.isOwner">
            <div class="danger-item">
              <div class="danger-text">
                <strong>워크스페이스 삭제</strong>
                <p>이 워크스페이스와 모든 데이터가 영구적으로 삭제됩니다.</p>
              </div>
              <Button label="삭제" severity="danger" size="small" @click="confirmDeleteWorkspace" />
            </div>
          </div>

          <div class="danger-zone" v-else-if="isEditMode && !workspaceStore.isOwner">
            <div class="danger-item">
              <div class="danger-text">
                <strong>워크스페이스 나가기</strong>
                <p>다시 참여하려면 초대를 받아야 합니다.</p>
              </div>
              <Button label="나가기" severity="warning" size="small" @click="confirmLeaveWorkspace" />
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- 멤버 탭 -->
      <TabPanel header="멤버">
        <div class="tab-content">
          <!-- 멤버 검색 및 초대 -->
          <div class="invite-section" v-if="!isEditMode || workspaceStore.isAdmin">
            <div class="invite-form">
              <div class="search-container">
                <InputText v-model="searchEmail" placeholder="이메일 또는 닉네임으로 검색..." class="search-input"
                  @input="handleSearchInput" @focus="showSearchResults = true" />
                <Dropdown v-model="inviteRole" :options="availableRoles" optionLabel="label" optionValue="value"
                  class="invite-role-select" />
              </div>
              <!-- 검색 결과 드롭다운 -->
              <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
                <div v-for="user in searchResults" :key="user.userId" class="search-result-item">
                  <div class="result-avatar">{{ user.nickname?.charAt(0) || user.email.charAt(0) }}</div>
                  <div class="result-info">
                    <span class="result-name">{{ user.nickname || '사용자' }}</span>
                    <span class="result-email">{{ user.email }}</span>
                  </div>
                  <Button :label="isEditMode ? '초대' : '추가'" size="small" @click="handleAddMember(user)"
                    :loading="invitingUserId === user.userId" />
                </div>
              </div>
            </div>
          </div>

          <!-- 멤버 목록 -->
          <div class="member-list">
            <div class="member-list-header">
              <span>{{ isEditMode ? '멤버' : '초대 대기 멤버' }} ({{ memberList.length }}명)</span>
            </div>

            <div v-if="memberList.length === 0" class="empty-members">
              {{ isEditMode ? '멤버가 없습니다.' : '초대할 멤버를 검색해서 추가하세요.' }}
            </div>

            <div v-else class="member-items">
              <div v-for="member in memberList" :key="member.userId || member.memberId" class="member-item">
                <div class="member-avatar">{{ getMemberInitial(member) }}</div>
                <div class="member-info">
                  <span class="member-name">{{ member.nickname || member.email }}</span>
                  <span class="member-email">{{ member.email }}</span>
                </div>
                <div class="member-role">
                  <Dropdown v-if="canChangeRole(member)" :modelValue="member.role"
                    @update:modelValue="(val) => handleUpdateRole(member, val)" :options="availableRoles"
                    optionLabel="label" optionValue="value" class="role-dropdown" />
                  <span v-else class="role-badge">{{ getRoleLabel(member.role) }}</span>
                </div>
                <Button v-if="canRemoveMember(member)" icon="pi pi-times" severity="danger" text rounded
                  @click="handleRemoveMember(member)" />
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </Dialog>

  <!-- 삭제 확인 다이얼로그 -->
  <Dialog v-model:visible="isDeleteConfirmOpen" header="워크스페이스 삭제" :style="{ width: '450px' }" modal>
    <div class="confirm-content">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500);"></i>
      <p>정말로 <strong>{{ workspaceStore.currentWorkspace?.name }}</strong> 워크스페이스를 삭제하시겠습니까?</p>
      <div class="confirm-input">
        <label>확인을 위해 워크스페이스 이름 입력</label>
        <InputText v-model="deleteConfirmName" :placeholder="workspaceStore.currentWorkspace?.name" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="취소" severity="secondary" text @click="isDeleteConfirmOpen = false" />
      <Button label="삭제" severity="danger" @click="handleDeleteWorkspace"
        :disabled="deleteConfirmName !== workspaceStore.currentWorkspace?.name" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
    default: 'create', // 'create' | 'edit'
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
const modalTitle = computed(() => isEditMode.value ? '워크스페이스 설정' : '워크스페이스 추가')

// 폼 데이터
const workspaceName = ref('')
const workspaceDesc = ref('')
const activeTabIndex = ref(0)
const isSubmitting = ref(false)

// 멤버 관리
const members = ref([]) // 수정 모드: 실제 멤버
const pendingMembers = ref([]) // 생성 모드: 초대 대기 멤버

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

// 역할 우선순위
const rolePriority = {
  'OWNER': 0,
  'ADMIN': 1,
  'MEMBER': 2,
  'VIEWER': 3
}

// 멤버 목록 computed (역할 기준 정렬)
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

    if (isEditMode.value) {
      // 수정 모드: 현재 워크스페이스 정보 로드
      const workspace = workspaceStore.currentWorkspace
      workspaceName.value = workspace?.name || ''
      workspaceDesc.value = workspace?.description || ''
      await loadMembers()
    } else {
      // 생성 모드: 초기화
      workspaceName.value = ''
      workspaceDesc.value = ''
      pendingMembers.value = []
    }
  }
})

// 유틸 함수
function getMemberInitial(member) {
  const name = member.nickname || member.email || '?'
  return name.charAt(0).toUpperCase()
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
    month: 'long',
    day: 'numeric'
  })
}

function canChangeRole(member) {
  if (isEditMode.value) {
    if (member.role === 'OWNER') return false
    if (member.userId === authStore.userId) return false
    return workspaceStore.isAdmin
  }
  // 생성 모드: 항상 변경 가능
  return true
}

function canRemoveMember(member) {
  if (isEditMode.value) {
    if (member.role === 'OWNER') return false
    if (member.userId === authStore.userId) return false
    return workspaceStore.isAdmin
  }
  // 생성 모드: 항상 제거 가능
  return true
}

// 멤버 로드 (수정 모드)
async function loadMembers() {
  if (!workspaceStore.currentWorkspaceId) return

  try {
    const data = await workspaceStore.loadMembers(workspaceStore.currentWorkspaceId)
    members.value = data
  } catch (error) {
    console.error('Failed to load members:', error)
  }
}

// 제출 (생성/수정)
async function handleSubmit() {
  if (!workspaceName.value.trim()) return

  try {
    isSubmitting.value = true

    if (isEditMode.value) {
      // 수정
      await workspaceStore.updateWorkspace(workspaceStore.currentWorkspaceId, {
        name: workspaceName.value.trim(),
        description: workspaceDesc.value.trim() || null
      })
      emit('update:visible', false)
      toast.add({ severity: 'success', summary: '저장 완료', detail: '워크스페이스가 수정되었습니다.', life: 3000 })
    } else {
      // 생성
      const workspace = await workspaceStore.createWorkspace({
        name: workspaceName.value.trim(),
        description: workspaceDesc.value.trim() || null
      })

      // 대기 멤버 초대
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
      emit('created')  // 부모한테 생성 완료 알림
      emit('update:visible', false)  // 모달 닫기
      toast.add({ severity: 'success', summary: '생성 완료', detail: '워크스페이스가 생성되었습니다.', life: 3000 })
    }
  } catch (error) {
    console.error('Failed to submit:', error)
    toast.add({ severity: 'error', summary: '오류', detail: isEditMode.value ? '워크스페이스 수정에 실패했습니다.' : '워크스페이스 생성에 실패했습니다.', life: 3000 })
  } finally {
    isSubmitting.value = false
  }
}

// 사용자 검색
function handleSearchInput() {
  showSearchResults.value = true

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // 빈 값이면 검색 안 함
  if (!searchEmail.value.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true
      const response = await userApi.searchUsers(searchEmail.value)

      // 제외할 사용자 ID 목록
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

// 멤버 추가/초대
async function handleAddMember(user) {
  if (isEditMode.value) {
    // 수정 모드: 바로 초대
    try {
      invitingUserId.value = user.userId
      await workspaceStore.inviteMember(workspaceStore.currentWorkspaceId, user.email, inviteRole.value)
      searchResults.value = searchResults.value.filter(u => u.userId !== user.userId)
      await loadMembers()
      await workspaceStore.loadWorkspaces()
      toast.add({ severity: 'success', summary: '초대 완료', detail: `${user.nickname || user.email}님을 초대했습니다.`, life: 3000 })
    } catch (error) {
      console.error('Failed to invite member:', error)
      toast.add({ severity: 'error', summary: '오류', detail: '멤버 초대에 실패했습니다.', life: 3000 })
    } finally {
      invitingUserId.value = null
    }
  } else {
    // 생성 모드: 대기 목록에 추가
    if (pendingMembers.value.find(m => m.userId === user.userId)) return

    pendingMembers.value.push({
      ...user,
      role: inviteRole.value
    })
    searchResults.value = searchResults.value.filter(u => u.userId !== user.userId)
    searchEmail.value = ''
    showSearchResults.value = false
  }
}

// 권한 변경
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
    if (idx !== -1) {
      pendingMembers.value[idx].role = newRole
    }
  }
}

// 멤버 제거
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

// 워크스페이스 삭제
function confirmDeleteWorkspace() {
  deleteConfirmName.value = ''
  isDeleteConfirmOpen.value = true
}

async function handleDeleteWorkspace() {
  if (deleteConfirmName.value !== workspaceStore.currentWorkspace?.name) return

  try {
    isDeleting.value = true
    const workspaceId = workspaceStore.currentWorkspaceId

    // 모달 먼저 닫기
    isDeleteConfirmOpen.value = false
    dialogVisible.value = false

    // 그 다음 삭제 실행
    await workspaceStore.deleteWorkspace(workspaceId)

    toast.add({ severity: 'success', summary: '삭제 완료', detail: '워크스페이스가 삭제되었습니다.', life: 3000 })
    emit('deleted')
  } catch (error) {
    console.error('Failed to delete workspace:', error)
    toast.add({ severity: 'error', summary: '오류', detail: '워크스페이스 삭제에 실패했습니다.', life: 3000 })
  } finally {
    isDeleting.value = false
  }
}

// 워크스페이스 나가기
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
/* 탭 콘텐츠 */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.tab-content .field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tab-content label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

/* 워크스페이스 정보 */
.workspace-info {
  background-color: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

/* 멤버 초대
.invite-section {
  background-color: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
} */

.invite-form {
  position: relative;
}

.search-container {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
}

.invite-role-select {
  width: 111px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.search-loading,
.search-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.search-result-item:hover {
  background-color: var(--surface-hover);
}

.result-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}

.result-email {
  display: block;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

/* 멤버 목록 */
.member-list {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  overflow: hidden;
}

.member-list-header {
  padding: 0.75rem 1rem;
  background-color: var(--surface-ground);
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--surface-border);
}

.empty-members {
  padding: 2rem;
  text-align: center;
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.member-items {
  max-height: 250px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}

.member-email {
  display: block;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  min-width: 90px;
}

.role-dropdown {
  width: 111px;
}

.role-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--surface-ground);
  border-radius: 4px;
  color: var(--text-color-secondary);
}

/* 위험 구역 */
.danger-zone {
  border: 1px solid var(--red-200);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.dark-mode .danger-zone {
  border-color: var(--red-900);
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.danger-text {
  flex: 1;
}

.danger-text strong {
  font-size: 0.875rem;
  color: var(--text-color);
}

.danger-text p {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
}

/* 삭제 확인 */
.confirm-content {
  text-align: center;
  padding: 1rem 0;
}

.confirm-content p {
  margin: 1rem 0;
  color: var(--text-color);
}

.confirm-input {
  text-align: left;
  margin-top: 1.5rem;
}

.confirm-input label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}
</style>
