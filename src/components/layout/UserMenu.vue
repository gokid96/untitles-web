<template>
  <div class="user-menu-container">
    <!-- 사용자 버튼 -->
    <div class="user-button" @click="toggleMenu">
      <div class="user-avatar">
        <UserAvatar :user-id="authStore.userId" :name="currentUser?.nickname" :image="userProfileImage" :size="32" />
        <span v-if="invitationCount" class="invite-dot" :aria-label="`받은 초대 ${invitationCount}건`"></span>
      </div>
      <div class="user-info">
        <span class="user-nickname">{{ currentUser?.nickname }}</span>
        <span class="workspace-name">{{ currentWorkspaceName }}</span>
      </div>
      <ChevronUp class="expand-icon" :class="{ rotated: isMenuOpen }" />
    </div>

    <!-- 팝업 메뉴 -->
    <Transition name="menu">
      <div v-if="isMenuOpen" class="popup-menu">
        <!-- 받은 초대 -->
        <template v-if="invitationCount">
          <div class="menu-section">
            <div class="menu-item invite-item" @click="openInvitations">
              <Mail class="menu-icon" />
              <span>받은 초대</span>
              <span class="count-badge">{{ invitationCount }}</span>
            </div>
          </div>
          <div class="menu-divider"></div>
        </template>

        <!-- 워크스페이스 -->
        <div class="menu-section">
          <div class="section-label">워크스페이스</div>
          <div
            v-for="workspace in workspaceStore.workspaces"
            :key="workspace.workspaceId"
            class="workspace-item"
            :class="{ active: workspace.workspaceId === workspaceStore.currentWorkspaceId }"
            @click="handleSelectWorkspace(workspace.workspaceId)"
          >
            <div class="workspace-icon" :class="{ team: workspace.type === 'TEAM' }">
              <Users v-if="workspace.type === 'TEAM'" class="ws-icon" />
              <User v-else class="ws-icon" />
            </div>
            <div class="workspace-details">
              <span class="workspace-name">{{ workspace.name }}</span>
              <span v-if="workspace.type === 'TEAM'" class="member-count">{{ workspace.memberCount }}/{{ workspace.memberLimit }}명</span>
            </div>
            <!-- 현재 워크스페이스 설정 (개인 워크스페이스는 일반·공개 탭만) -->
            <button
              v-if="workspace.workspaceId === workspaceStore.currentWorkspaceId"
              class="settings-btn"
              @click.stop="handleManageWorkspace(workspace)"
            >
              <Settings class="settings-icon" />
            </button>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-section">
          <div class="menu-item" :class="{ disabled: !workspaceStore.canCreateWorkspace }" @click="handleAddWorkspace">
            <Plus class="menu-icon" />
            <span>새 워크스페이스</span>
            <span class="limit-badge">{{ workspaceStore.workspaceLimit.count }}/{{ workspaceStore.workspaceLimit.limit }}</span>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-section">
          <div class="menu-item" @click="handleOpenProfile">
            <User class="menu-icon" />
            <span>내 정보</span>
          </div>
          <div class="menu-item" @click="toggleTheme">
            <Sun v-if="uiStore.isDarkMode" class="menu-icon" />
            <Moon v-else class="menu-icon" />
            <span>{{ uiStore.isDarkMode ? '라이트 모드' : '다크 모드' }}</span>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-section">
          <div class="menu-item danger" @click="handleLogout">
            <LogOut class="menu-icon" />
            <span>로그아웃</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 모달 -->
    <!-- 처음 열 때 불러오고, 한 번 연 뒤에는 닫는 애니메이션을 위해 남겨 둔다 -->
    <ProfileModal v-if="isProfileModalOpen || loaded.profile" v-model:visible="isProfileModalOpen" />
    <InvitationsModal v-if="isInvitationsOpen || loaded.invitations" v-model:visible="isInvitationsOpen"
      @accepted="handleInvitationAccepted" />
    <WorkspaceModal
      v-if="isWorkspaceModalOpen || loaded.workspace"
      v-model:visible="isWorkspaceModalOpen"
      :mode="workspaceModalMode"
      @created="handleWorkspaceCreated"
      @deleted="handleWorkspaceDeleted"
      @left="handleWorkspaceLeft"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ChevronUp, Users, User, Settings, Plus, Sun, Moon, LogOut, Mail } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
// 창 화면은 열 때 불러온다 (첫 화면을 가볍게)
const ProfileModal = defineAsyncComponent(() => import('@/components/modals/ProfileModal.vue'))
const WorkspaceModal = defineAsyncComponent(() => import('@/components/modals/WorkspaceModal.vue'))
const InvitationsModal = defineAsyncComponent(() => import('@/components/modals/InvitationsModal.vue'))
import UserAvatar from '@/components/common/UserAvatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const workspaceStore = useWorkspaceStore()
const folderStore = useFolderStore()
const postStore = usePostStore()

// storeToRefs로 반응성 유지
const { currentUser } = storeToRefs(authStore)

const isMenuOpen = ref(false)
const isProfileModalOpen = ref(false)
const isWorkspaceModalOpen = ref(false)
const workspaceModalMode = ref('create')
const isInvitationsOpen = ref(false)
const loaded = ref({ profile: false, invitations: false, workspace: false })
watch(isProfileModalOpen, (v) => { if (v) loaded.value.profile = true })
watch(isInvitationsOpen, (v) => { if (v) loaded.value.invitations = true })
watch(isWorkspaceModalOpen, (v) => { if (v) loaded.value.workspace = true })
const invitationCount = computed(() => workspaceStore.myInvitations.length)

function openInvitations() {
  isInvitationsOpen.value = true
  closeMenu()
}

async function handleInvitationAccepted(workspaceId) {
  if (workspaceId) await handleSelectWorkspace(workspaceId)
}

// 새 초대가 오면 한 번 알려준다 (같은 초대로는 다시 열지 않음)
const SEEN_KEY = 'untitles:seen-invitations'
function readSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'))
  } catch {
    return new Set()
  }
}
watch(() => workspaceStore.myInvitations, (list) => {
  const seen = readSeen()
  const fresh = list.filter((i) => !seen.has(i.token))
  if (fresh.length === 0) return
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...fresh.map((i) => i.token)].slice(-50)))
  } catch {
    // 저장소를 못 쓰면 다음에 다시 알려줄 수 있음
  }
  isInvitationsOpen.value = true
}, { immediate: true })

// 다른 탭·앱에서 돌아오면 초대를 다시 확인 (1분에 한 번까지)
let lastInvitationCheck = Date.now()
function handleVisibility() {
  if (document.visibilityState !== 'visible' || Date.now() - lastInvitationCheck < 60000) return
  lastInvitationCheck = Date.now()
  workspaceStore.loadMyInvitations()
}

const userInitial = computed(() => {
  return currentUser.value?.nickname?.charAt(0).toUpperCase() || 'U'
})

const userProfileImage = computed(() => {
  return currentUser.value?.profileImage || ''
})

const currentWorkspaceName = computed(() => {
  return workspaceStore.currentWorkspace?.name || ''
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleOpenProfile() {
  isProfileModalOpen.value = true
  closeMenu()
}

function toggleTheme() {
  uiStore.toggleDarkMode()
  closeMenu()
}

async function handleSelectWorkspace(workspaceId) {
  if (workspaceStore.currentWorkspaceId === workspaceId) {
    closeMenu()
    return
  }

  workspaceStore.selectWorkspace(workspaceId)
  folderStore.clearFolderData()
  postStore.clearPostData()

  // FolderSidebar의 watch가 트리거되어 자동으로 loadWorkspaceTree() 호출됨
  closeMenu()
}

function handleAddWorkspace() {
  // 생성 제한 체크
  if (!workspaceStore.canCreateWorkspace) {
    return
  }
  workspaceModalMode.value = 'create'
  isWorkspaceModalOpen.value = true
  closeMenu()
}

async function handleManageWorkspace(workspace) {
  if (workspace.workspaceId !== workspaceStore.currentWorkspaceId) {
    await handleSelectWorkspace(workspace.workspaceId)
  }
  workspaceModalMode.value = 'edit'
  isWorkspaceModalOpen.value = true
  closeMenu()
}

async function handleWorkspaceCreated(workspace) {
  await handleSelectWorkspace(workspace.workspaceId)
}

async function handleWorkspaceDeleted() {
  if (workspaceStore.workspaces.length > 0) {
    await handleSelectWorkspace(workspaceStore.workspaces[0].workspaceId)
  }
}

async function handleWorkspaceLeft() {
  if (workspaceStore.workspaces.length > 0) {
    await handleSelectWorkspace(workspaceStore.workspaces[0].workspaceId)
  }
}

async function handleLogout() {
  closeMenu()
  await authStore.logout()
  router.push('/')
}

function handleClickOutside(event) {
  const container = document.querySelector('.user-menu-container')
  if (container && !container.contains(event.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('visibilitychange', handleVisibility)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<style scoped>
.user-menu-container {
  position: relative;
  border-top: 1px solid var(--surface-border);
  height: 49px;
  flex-shrink: 0;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  transition: background-color 0.15s;
}

.invite-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid var(--surface-card, #fff);
}

.count-badge {
  margin-left: auto;
  min-width: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}

.user-button:hover {
  background-color: var(--surface-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.user-avatar .avatar-img {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.user-info {
  flex: 1;
  min-width: 0;
}

.user-nickname {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-name {
  display: block;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-icon {
  width: 14px;
  height: 14px;
  color: var(--text-color-secondary);
  transition: transform 0.2s;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* 팝업 메뉴 */
.popup-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 4px;
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}

.dark-mode .popup-menu {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.menu-section {
  padding: 0.5rem;
}

.section-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-divider {
  height: 1px;
  background: var(--surface-border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
  color: var(--text-color);
  font-size: 0.875rem;
}

.menu-item:hover {
  background: var(--surface-hover);
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.disabled:hover {
  background: transparent;
}

.menu-icon {
  width: 18px;
  height: 18px;
  color: var(--text-color-secondary);
}

.menu-item.danger {
  color: var(--red-500);
}

.menu-item.danger .menu-icon {
  color: var(--red-500);
}

.limit-badge {
  margin-left: auto;
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  background: var(--surface-border);
  border-radius: 4px;
  color: var(--text-color-secondary);
}

/* 워크스페이스 아이템 */
.workspace-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.workspace-item:hover {
  background: var(--surface-hover);
}

.workspace-item.active {
  background: var(--highlight-bg);
}

.workspace-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.workspace-icon.team {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

.ws-icon {
  width: 14px;
  height: 14px;
  color: var(--text-color-secondary);
}

.workspace-icon.team .ws-icon {
  color: inherit;
}

.workspace-details {
  flex: 1;
  min-width: 0;
}

.workspace-details .workspace-name {
  display: block;
  font-size: 0.875rem;
  color: var(--text-color);
}

.member-count {
  font-size: 0.6875rem;
  color: var(--text-color-secondary);
}

.settings-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.settings-btn:hover {
  background: var(--surface-border);
  color: var(--text-color);
}

.settings-icon {
  width: 14px;
  height: 14px;
}

/* 트랜지션 */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
