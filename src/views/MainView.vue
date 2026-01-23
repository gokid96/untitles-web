<template>
  <div class="main-layout">
    <!-- 사이드바 -->
    <aside 
      class="sidebar" 
      :class="{ collapsed: isSidebarCollapsed }"
      :style="{ width: isSidebarCollapsed ? '0px' : sidebarWidth + 'px' }"
    >
      <FolderSidebar 
        @folder-selected="handleFolderSelected" 
        @create-folder="handleCreateFolder"
        @edit-folder="handleEditFolder" 
        @delete-folder="handleDeleteFolder" 
        @create-post="handleCreatePost"
        @create-post-in-folder="handleCreatePostInFolder" 
        @post-selected="handlePostSelected"
        @edit-post="handleEditPost" 
        @delete-post="handleDeletePost" 
        @move-post="handleMovePost"
        @move-folder="handleMoveFolder" 
      />
    </aside>

    <!-- 리사이즈 핸들 -->
    <div 
      v-if="!isSidebarCollapsed"
      class="resize-handle"
      :style="{ left: sidebarWidth + 'px' }"
      @mousedown="startResize"
    ></div>

    <!-- 사이드바 토글 버튼 -->
    <button 
      class="sidebar-toggle" 
      :style="{ left: isSidebarCollapsed ? '0px' : sidebarWidth + 'px' }"
      @click="toggleSidebar" 
      :title="isSidebarCollapsed ? '사이드바 열기' : '사이드바 닫기'"
    >
      <i :class="isSidebarCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
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

    <!-- 모달들: 필요할 때만 렌더링 (lazy) -->
    <FolderModal 
      v-if="isFolderModalOpen"
      v-model:visible="isFolderModalOpen" 
      :folder="selectedFolderForEdit" 
      :parentId="parentFolderId"
      @save="handleSaveFolder" 
    />

    <ConfirmDialog 
      v-if="isConfirmDialogOpen"
      v-model:visible="isConfirmDialogOpen" 
      :message="confirmDialogMessage"
      @confirm="handleConfirmDelete" 
    />
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import FolderSidebar from '@/components/layout/FolderSidebar.vue'
import EmptyContent from '@/components/editor/EmptyContent.vue'
import PostEditor from '@/components/editor/PostEditor.vue'
import EditorSkeleton from '@/components/common/EditorSkeleton.vue'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { useAuthenticatedAction, useSidebarResize } from '@/composables'
import { getErrorMessage } from '@/utils/helpers'

// 모달 컴포넌트 lazy loading
const FolderModal = defineAsyncComponent(() => 
  import('@/components/modals/FolderModal.vue')
)
const ConfirmDialog = defineAsyncComponent(() => 
  import('@/components/common/ConfirmDialog.vue')
)

const toast = useToast()
const folderStore = useFolderStore()
const postStore = usePostStore()

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
const isLoadingPost = ref(false)

// 모달 상태
const isFolderModalOpen = ref(false)
const isConfirmDialogOpen = ref(false)

// 선택된 항목
const selectedFolderForEdit = ref(null)
const parentFolderId = ref(null)

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

function handleEditFolder(folder) {
  selectedFolderForEdit.value = folder
  parentFolderId.value = folder.data?.parentFolderId || folder.parentId
  isFolderModalOpen.value = true
}

function handleDeleteFolder(folder) {
  deleteTarget.value = folder
  deleteType.value = 'folder'
  confirmDialogMessage.value = '폴더를 삭제하시겠습니까?\n하위 폴더와 게시글도 함께 삭제됩니다.'
  isConfirmDialogOpen.value = true
}

async function handleSaveFolder(data) {
  const action = selectedFolderForEdit.value
    ? () => folderStore.updateFolder(data.id, { name: data.name })
    : () => folderStore.createFolder(data)

  await executeAuthenticated(action, { errorTitle: '폴더 저장 실패' })
}

async function handleMoveFolder(folderId, targetFolderId) {
  await executeAuthenticated(
    () => folderStore.moveFolder(folderId, targetFolderId),
    { errorTitle: '폴더 이동 실패' }
  )
}

// 게시글 이벤트
async function handlePostSelected(post) {
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

function handleEditPost(post) {
  handlePostSelected(post)
}

function handleCancelEdit() {
  contentMode.value = 'empty'
  postStore.clearCurrentPost()
}

function handleDeletePost(post) {
  deleteTarget.value = post
  deleteType.value = 'post'
  confirmDialogMessage.value = '노트를 삭제하시겠습니까?'
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

function handleFolderSelected(folder) {
  // 폴더 선택 시 처리
}

// 전역 단축키
function handleGlobalKeydown(e) {
  // Ctrl + Q: 새 노트
  if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
    e.preventDefault()
    handleCreatePost()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
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
</style>
