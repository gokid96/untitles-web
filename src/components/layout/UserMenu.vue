<template>
  <div class="user-menu-container">
    <!-- 사용자 버튼 -->
    <div class="user-button" @click="toggleMenu">
      <div class="user-avatar">
        <img v-if="userProfileImage" :src="userProfileImage" alt="프로필" class="avatar-img" />
        <span v-else>{{ userInitial }}</span>
      </div>
      <div class="user-info">
        <span class="user-nickname">{{ currentUser?.nickname }}</span>
        <span class="workspace-name">{{ currentWorkspaceName }}</span>
      </div>
      <i class="pi pi-chevron-up expand-icon" :class="{ rotated: isMenuOpen }"></i>
    </div>

    <!-- 팝업 메뉴 -->
    <Transition name="menu">
      <div v-if="isMenuOpen" class="popup-menu" ref="menuRef">
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
              <i :class="workspace.type === 'TEAM' ? 'pi pi-users' : 'pi pi-user'"></i>
            </div>
            <div class="workspace-details">
              <span class="workspace-name">{{ workspace.name }}</span>
              <span v-if="workspace.type === 'TEAM'" class="member-count">{{ workspace.memberCount }}명</span>
            </div>
            <!-- 개인 워크스페이스는 설정 버튼 숨김 -->
            <button
              v-if="workspace.workspaceId === workspaceStore.currentWorkspaceId && workspace.type === 'TEAM'"
              class="settings-btn"
              @click.stop="handleManageWorkspace(workspace)"
            >
              <i class="pi pi-cog"></i>
            </button>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-section">
          <div class="menu-item" :class="{ disabled: !workspaceStore.canCreateWorkspace }" @click="handleAddWorkspace">
            <i class="pi pi-plus"></i>
            <span>새 워크스페이스</span>
            <span v-if="!workspaceStore.canCreateWorkspace" class="limit-badge">3/3</span>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-section">
          <div class="menu-item" @click="handleOpenProfile">
            <i class="pi pi-user"></i>
            <span>내 정보</span>
          </div>
          <div class="menu-item" @click="toggleTheme">
            <i :class="uiStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
            <span>{{ uiStore.isDarkMode ? '라이트 모드' : '다크 모드' }}</span>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-section">
          <div class="menu-item danger" @click="handleLogout">
            <i class="pi pi-sign-out"></i>
            <span>로그아웃</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 모달 -->
    <ProfileModal v-model:visible="isProfileModalOpen" />
    <WorkspaceModal
      v-model:visible="isWorkspaceModalOpen"
      :mode="workspaceModalMode"
      @created="handleWorkspaceCreated"
      @updated="handleWorkspaceUpdated"
      @deleted="handleWorkspaceDeleted"
      @left="handleWorkspaceLeft"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import ProfileModal from '@/components/modals/ProfileModal.vue'
import WorkspaceModal from '@/components/modals/WorkspaceModal.vue'

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
const menuRef = ref(null)

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
  // 개인 워크스페이스는 설정 불가
  if (workspace.type === 'PERSONAL') {
    return
  }

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

function handleWorkspaceUpdated() {}

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
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-menu-container {
  position: relative;
  border-top: 1px solid var(--surface-border);
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.47rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.user-button:hover {
  background-color: var(--surface-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-700) 100%);
  color: var(--primary-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  overflow: hidden;
}

.user-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dark-mode .user-avatar {
  background: linear-gradient(135deg, var(--primary-300) 0%, var(--primary-400) 100%);
  color: var(--surface-ground);
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
  color: var(--text-color-secondary);
  font-size: 0.75rem;
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

.menu-item i {
  font-size: 1rem;
  color: var(--text-color-secondary);
  width: 1.25rem;
  text-align: center;
}

.menu-item.danger {
  color: var(--red-500);
}

.menu-item.danger i {
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

.workspace-icon i {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.workspace-icon.team i {
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
