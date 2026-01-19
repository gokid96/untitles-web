<template>
  <div class="user-menu-container">
    <!-- 사용자 버튼 -->
    <div class="user-button" @click="toggleMenu">
      <div class="user-avatar">
        {{ userInitial }}
      </div>
      <div class="user-info">
        <span class="user-nickname">{{ authStore.currentUser?.nickname }}</span>
        <span class="workspace-name">{{ currentWorkspaceName }}</span>
      </div>
      <i class="pi pi-chevron-up expand-icon"></i>
    </div>

    <!-- 팝업 메뉴 -->
    <div v-if="isMenuOpen" class="user-popup-menu" ref="menuRef">
      <!-- 워크스페이스 목록 -->
      <div class="menu-section">
        <div class="section-label">워크스페이스</div>
        <div v-for="workspace in workspaceStore.workspaces" :key="workspace.workspaceId" class="workspace-item"
          :class="{ active: workspace.workspaceId === workspaceStore.currentWorkspaceId }"
          @click="handleSelectWorkspace(workspace.workspaceId)">
          <div class="workspace-avatar" :class="{ 'team-workspace': isTeamWorkspace(workspace) }">
            <i :class="isTeamWorkspace(workspace) ? 'pi pi-users' : 'pi pi-user'"></i>
          </div>
          <div class="workspace-item-info">
            <span class="workspace-item-name">{{ workspace.name }}</span>
            <span v-if="isTeamWorkspace(workspace)" class="workspace-member-count">{{ workspace.memberCount }}명</span>
          </div>
          <i v-if="workspace.workspaceId === workspaceStore.currentWorkspaceId" class="pi pi-cog settings-icon"
            @click.stop="handleManageWorkspace(workspace)"></i>


        </div>
      </div>

      <div class="menu-divider"></div>

      <!-- 워크스페이스 관리 -->
      <div class="menu-section">
        <div class="menu-item" @click="handleAddWorkspace">
          <i class="pi pi-plus"></i>
          <span>워크스페이스 추가</span>
        </div>
      </div>

      <div class="menu-divider"></div>

      <!-- 설정 -->
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

      <!-- 로그아웃 -->
      <div class="menu-section">
        <div class="menu-item logout" @click="handleLogout">
          <i class="pi pi-sign-out"></i>
          <span>로그아웃</span>
        </div>
      </div>
    </div>

    <!-- 내 정보 모달 -->
    <ProfileModal v-model:visible="isProfileModalOpen" />

    <!-- 워크스페이스 모달 (추가/설정 공용) -->
    <WorkspaceModal v-model:visible="isWorkspaceModalOpen" :mode="workspaceModalMode" @created="handleWorkspaceCreated"
      @updated="handleWorkspaceUpdated" @deleted="handleWorkspaceDeleted" @left="handleWorkspaceLeft" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const isMenuOpen = ref(false)
const isProfileModalOpen = ref(false)
const isWorkspaceModalOpen = ref(false)
const workspaceModalMode = ref('create') // 'create' | 'edit'
const menuRef = ref(null)

const userInitial = computed(() => {
  const nickname = authStore.currentUser?.nickname
  return nickname.charAt(0).toUpperCase()
})

const currentWorkspaceName = computed(() => {
  return workspaceStore.currentWorkspace?.name
})

function isTeamWorkspace(workspace) {
  return workspace.memberCount && workspace.memberCount > 1
}

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

// 워크스페이스 선택
async function handleSelectWorkspace(workspaceId) {
  if (workspaceStore.currentWorkspaceId === workspaceId) {
    closeMenu()
    return
  }

  workspaceStore.selectWorkspace(workspaceId)

  folderStore.clearFolderData()
  postStore.clearPostData()

  await Promise.all([
    folderStore.loadAllFolders(),
    postStore.fetchPosts()
  ])

  folderStore.updateFolderTree()
  closeMenu()
}

// 워크스페이스 추가 모달 열기
function handleAddWorkspace() {
  workspaceModalMode.value = 'create'
  isWorkspaceModalOpen.value = true
  closeMenu()
}

// 워크스페이스 설정 모달 열기
async function handleManageWorkspace(workspace) {
  // 선택된 워크스페이스가 아니면 먼저 선택
  if (workspace.workspaceId !== workspaceStore.currentWorkspaceId) {
    await handleSelectWorkspace(workspace.workspaceId)
  }
  workspaceModalMode.value = 'edit'
  isWorkspaceModalOpen.value = true
  closeMenu()
}

// 워크스페이스 생성 완료
async function handleWorkspaceCreated(workspace) {
  await handleSelectWorkspace(workspace.workspaceId)
}

// 워크스페이스 수정 완료
function handleWorkspaceUpdated() {
  // 필요 시 추가 처리
}

// 워크스페이스 삭제 완료
async function handleWorkspaceDeleted() {
  if (workspaceStore.workspaces.length > 0) {
    await handleSelectWorkspace(workspaceStore.workspaces[0].workspaceId)
  }
}

// 워크스페이스 나가기 완료
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

// 외부 클릭 시 메뉴 닫기
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
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-button:hover {
  background-color: var(--surface-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-nickname {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-name {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-icon {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

/* 팝업 메뉴 */
.user-popup-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 4px;
  background-color: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}

.dark-mode .user-popup-menu {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.menu-section {
  padding: 0.5rem;
}

.section-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-divider {
  height: 1px;
  background-color: var(--surface-border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
  color: var(--text-color);
  font-size: 0.875rem;
  position: relative;
}

.menu-item:hover {
  background-color: var(--surface-hover);
}

.menu-item i {
  font-size: 1rem;
  color: var(--text-color-secondary);
  width: 1.25rem;
  text-align: center;
}

.menu-item .pi-check {
  margin-left: auto;
  color: var(--primary-color);
}

.menu-item.logout {
  color: var(--red-500);
}

.menu-item.logout i {
  color: var(--red-500);
}

/* 워크스페이스 아이템 */
.workspace-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  margin-bottom: 0.325rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
  color: var(--text-color);
  font-size: 0.875rem;
}

.workspace-item:hover {
  background-color: var(--surface-hover);
}

.workspace-item.active {
  background-color: var(--surface-hover);
}

.workspace-item .check-icon {
  color: var(--primary-color);
  font-size: 0.875rem;
}

.workspace-item .settings-icon {
  color: var(--primary-color);
  font-size: 0.875rem;
  padding: 0.25rem;
  border-radius: 4px;
}


.workspace-avatar {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.workspace-avatar i {
  font-size: 0.75rem;
}

.workspace-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.workspace-item-name {
  font-size: 0.875rem;
  color: var(--text-color);
}

.workspace-member-count {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
}
</style>
