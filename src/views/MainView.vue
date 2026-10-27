<template>
  <div class="main-layout" :class="{ mobile: isMobile }">
    <!-- 모바일: 사이드바를 서랍으로, 바깥을 누르면 닫힘 -->
    <div v-if="isMobile && !isSidebarCollapsed" class="drawer-backdrop" @click="toggleSidebar"></div>

    <!-- 사이드바 -->
    <aside 
      class="sidebar" 
      :class="{ collapsed: isSidebarCollapsed, 'mobile-drawer': isMobile }"
      :style="isMobile ? null : { width: isSidebarCollapsed ? '0px' : sidebarWidth + 'px' }"
    >
      <FolderSidebar 
        @create-folder="handleCreateFolder"
        @delete-folder="handleDeleteFolder" 
        @create-post="handleCreatePost"
        @create-post-in-folder="handleCreatePostInFolder" 
        @post-selected="handlePostSelected"
        @delete-post="handleDeletePost" 
        @move-post="handleMovePost"
        @move-folder="handleMoveFolder" 
      />
    </aside>

    <!-- 리사이즈 핸들 -->
    <div 
      v-if="!isSidebarCollapsed && !isMobile"
      class="resize-handle"
      :style="{ left: sidebarWidth + 'px' }"
      @mousedown="startResize"
    ></div>

    <!-- 사이드바 토글 버튼 -->
    <button 
      v-if="!isMobile"
      class="sidebar-toggle" 
      :style="{ left: isSidebarCollapsed ? '0px' : sidebarWidth + 'px' }"
      @click="toggleSidebar" 
      :title="isSidebarCollapsed ? '사이드바 열기' : '사이드바 닫기'"
    >
      <i :class="isSidebarCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
    </button>

    <!-- 모바일 메뉴 버튼 -->
    <button v-if="isMobile" class="mobile-menu-btn" type="button" aria-label="메뉴 열기" @click="toggleSidebar">
      <i class="pi pi-bars"></i>
    </button>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <EditorSkeleton v-if="isLoadingPost" />
      <EmptyContent v-else-if="contentMode === 'empty'" @create-post="handleCreatePost" />
      <PostEditor 
        v-else-if="contentMode === 'edit' || contentMode === 'create'" 
        :post="currentPostForEditor"
        @cancel="handleCancelEdit" 
      />
    </main>

    <!-- 오른쪽 연결 패널 (백링크 + 로컬 그래프): 사이드바 정렬 버튼 옆 버튼으로 열고 닫음 -->
    <aside
      v-if="authStore.isAuthenticated && uiStore.isLinkPanelOpen"
      class="link-panel-aside"
      :class="{ 'mobile-sheet': isMobile }"
      :style="isMobile ? null : { width: panelWidth + 'px' }"
    >
      <div
        v-if="!isMobile"
        class="panel-resize-handle"
        :class="{ active: isResizingPanel }"
        title="드래그해서 너비 조절"
        @mousedown="startPanelResize"
      ></div>
      <LinkPanel />
    </aside>

    <!-- 모달들: 필요할 때만 렌더링 (lazy) -->
    <ConfirmDialog 
      v-if="isConfirmDialogOpen"
      v-model:visible="isConfirmDialogOpen" 
      :message="confirmDialogMessage"
      @confirm="handleConfirmDelete" 
    />
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import FolderSidebar from '@/components/layout/FolderSidebar.vue'
import EmptyContent from '@/components/editor/EmptyContent.vue'
import PostEditor from '@/components/editor/PostEditor.vue'
import EditorSkeleton from '@/components/common/EditorSkeleton.vue'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useAuthenticatedAction, useSidebarResize, usePanelResize } from '@/composables'
import { useWorkspaceLive } from '@/composables/workspaceLive'

// 같은 워크스페이스의 다른 멤버가 바꾼 노트·폴더 목록을 실시간으로 반영
useWorkspaceLive()
import { getErrorMessage } from '@/utils/helpers'

// 모달 컴포넌트 lazy loading
const LinkPanel = defineAsyncComponent(() => import('@/components/layout/LinkPanel.vue'))
const ConfirmDialog = defineAsyncComponent(() => 
  import('@/components/common/ConfirmDialog.vue')
)

const toast = useToast()
const folderStore = useFolderStore()
const postStore = usePostStore()
const uiStore = useUiStore()
const { panelWidth, isResizingPanel, startPanelResize } = usePanelResize()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

// 컴포저블 사용
const { executeAuthenticated } = useAuthenticatedAction()
const { 
  sidebarWidth, 
  isSidebarCollapsed, 
  startResize, 
  toggleSidebar 
} = useSidebarResize({
  minWidth: 200,
  maxWidth: 500,
  defaultWidth: 280,
  storageKey: 'sidebarWidth'
})

// 컨텐츠 모드
const contentMode = ref('empty')
// 열려 있던 노트가 사라지면(다른 멤버가 삭제 등) 빈 화면으로
watch(() => postStore.currentPost, (post) => {
  if (!post && contentMode.value === 'edit') contentMode.value = 'empty'
})
const isLoadingPost = ref(false)

// 모달 상태
const isConfirmDialogOpen = ref(false)

// 삭제 확인
const confirmDialogMessage = ref('')
const deleteTarget = ref(null)
const deleteType = ref(null)

// postStore.currentPost를 에디터용 형식으로 변환
const currentPostForEditor = computed(() => {
  const post = postStore.currentPost
  if (!post) return null
  return {
    id: post.id,
    title: post.title || '무제',
    content: post.content || '',
    version: post.version,
    folderId: post.folderId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }
})

// 폴더 이벤트
async function handleCreateFolder(parentId) {
  await executeAuthenticated(
    () => folderStore.createFolder({ name: '새 폴더', parentId }),
    { errorTitle: '폴더 생성 실패' }
  )
}

function handleDeleteFolder(folder) {
  deleteTarget.value = folder
  deleteType.value = 'folder'
  confirmDialogMessage.value = '폴더를 휴지통으로 옮길까요?\n하위 폴더와 노트도 함께 옮겨지며, 30일 안에 복구할 수 있습니다.'
  isConfirmDialogOpen.value = true
}

async function handleMoveFolder(folderId, targetFolderId) {
  await executeAuthenticated(
    () => folderStore.moveFolder(folderId, targetFolderId),
    { errorTitle: '폴더 이동 실패' }
  )
}

// 모바일(좁은 화면): 사이드바는 서랍, 그래프 패널은 전체 화면
const isMobile = ref(false)
let mobileQuery = null
let unregisterBack = null

function applyMobileLayout() {
  isMobile.value = mobileQuery.matches
  if (isMobile.value) isSidebarCollapsed.value = true
}

function closeDrawerOnMobile() {
  if (isMobile.value) isSidebarCollapsed.value = true
}

// 모바일에서 그래프 패널을 열면 서랍은 닫는다
watch(() => uiStore.isLinkPanelOpen, (open) => {
  if (open) closeDrawerOnMobile()
})

// 노트 링크·연결 패널에서 다른 노트 열기
watch(() => uiStore.openPostRequest, (request) => {
  if (request?.postId && request.postId !== postStore.currentPost?.id) {
    handlePostSelected({ id: request.postId })
  }
})

// 게시글 이벤트
async function handlePostSelected(post) {
  closeDrawerOnMobile()
  if (isMobile.value && uiStore.isLinkPanelOpen) uiStore.toggleLinkPanel()
  isLoadingPost.value = true
  contentMode.value = 'edit'
  
  try {
    const postId = post.data?.postId || post.id
    await postStore.getPostById(postId)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '노트 불러오기 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
    contentMode.value = 'empty'
  } finally {
    isLoadingPost.value = false
  }
}

async function handleCreatePost() {
  const result = await executeAuthenticated(
    () => postStore.createPost({
      title: '무제',
      content: '',
      folderId: null,
    }),
    { errorTitle: '노트 생성 실패' }
  )

  if (result.success) {
    contentMode.value = 'edit'
    closeDrawerOnMobile()
  }
}

async function handleCreatePostInFolder(folderId) {
  const result = await executeAuthenticated(
    () => postStore.createPost({
      title: '무제',
      content: '',
      folderId: folderId,
    }),
    { errorTitle: '노트 생성 실패' }
  )

  if (result.success) {
    contentMode.value = 'edit'
  }
}

function handleCancelEdit() {
  contentMode.value = 'empty'
  postStore.clearCurrentPost()
}

function handleDeletePost(post) {
  deleteTarget.value = post
  deleteType.value = 'post'
  confirmDialogMessage.value = '노트를 휴지통으로 옮길까요?\n30일 안에 휴지통에서 복구할 수 있습니다.'
  isConfirmDialogOpen.value = true
}

async function handleMovePost(postId, targetFolderId) {
  await executeAuthenticated(
    () => postStore.movePost(postId, targetFolderId),
    { errorTitle: '이동 실패' }
  )
}

async function handleConfirmDelete() {
  const isFolder = deleteType.value === 'folder'
  
  const result = await executeAuthenticated(
    async () => {
      if (isFolder) {
        await folderStore.deleteFolder(deleteTarget.value.id)
      } else {
        await postStore.deletePost(deleteTarget.value.id)
      }
    },
    { errorTitle: '삭제 실패' }
  )

  if (result.success) {
    if (!isFolder) {
      contentMode.value = 'empty'
    }
    toast.add({
      severity: 'success',
      summary: '삭제 완료',
      detail: isFolder ? '폴더가 삭제되었습니다' : '노트가 삭제되었습니다',
      life: 2000,
    })
  }
}

// 전역 단축키
function handleGlobalKeydown(e) {
  // Ctrl + Q: 새 노트
  if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
    e.preventDefault()
    handleCreatePost()
  }
}

// 워크스페이스 변경 감지 - 에디터 상태 초기화
watch(
  () => workspaceStore.currentWorkspaceId,
  (newId, oldId) => {
    if (newId !== oldId && oldId !== undefined) {
      // 워크스페이스가 변경되면 에디터 상태 초기화
      contentMode.value = 'empty'
      postStore.clearCurrentPost()
    }
  }
)

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  mobileQuery = window.matchMedia('(max-width: 768px)')
  applyMobileLayout()
  mobileQuery.addEventListener('change', applyMobileLayout)
  // 앱 뒤로가기: 열린 서랍부터 닫는다
  unregisterBack = uiStore.registerBackHandler(() => {
    if (isMobile.value && !isSidebarCollapsed.value) {
      isSidebarCollapsed.value = true
      return true
    }
    return false
  })

  // 비로그인 상태면 바로 빈 에디터 표시
  if (!authStore.isAuthenticated) {
    contentMode.value = 'create'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  mobileQuery?.removeEventListener('change', applyMobileLayout)
  unregisterBack?.()
})
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  /* 앱(노치·상태바·홈 표시줄) 안전 영역. 일반 브라우저에서는 0 */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  background-color: var(--surface-ground);
  overflow: hidden;
  position: relative;
}

.sidebar {
  height: 100%;
  background-color: var(--surface-sidebar);
  border-right: 1px solid var(--surface-border);
  transition: width 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 0 !important;
  border-right: none;
}

.resize-handle {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 101;
  transition: background-color 0.15s;
}

.resize-handle:hover {
  background-color: var(--primary-color);
}

.sidebar-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  width: 24px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-sidebar);
  border: 1px solid var(--surface-border);
  border-left: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: left 0.2s ease, opacity 0.15s;
  opacity: 0;
}

.main-layout:hover .sidebar-toggle {
  opacity: 1;
}

.sidebar-toggle:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.main-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background-color: var(--surface-ground);
}

.main-content {
  min-width: 360px;
}

.link-panel-aside {
  position: relative;
  height: 100%;
  flex-shrink: 0;
  border-left: 1px solid var(--surface-border);
  background: var(--surface-ground);
}

.panel-resize-handle {
  position: absolute;
  top: 0;
  left: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 5;
}

.panel-resize-handle:hover,
.panel-resize-handle.active {
  background: var(--primary-color);
  opacity: 0.35;
}

/* ===== 모바일 (768px 이하) ===== */
.main-layout.mobile .main-content {
  min-width: 0;
}

.mobile-menu-btn {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 6px);
  left: calc(env(safe-area-inset-left) + 6px);
  z-index: 150;
  width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-color);
  font-size: 1.1rem;
  cursor: pointer;
}

.mobile-menu-btn:active {
  background: var(--surface-hover);
}

.sidebar.mobile-drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 300;
  width: min(85vw, 320px);
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  transition: transform 0.22s ease;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
}

.sidebar.mobile-drawer.collapsed {
  width: min(85vw, 320px) !important;
  transform: translateX(-105%);
  box-shadow: none;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 290;
  background: rgba(0, 0, 0, 0.45);
}

.link-panel-aside.mobile-sheet {
  position: fixed;
  inset: 0;
  z-index: 280;
  border-left: none;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
