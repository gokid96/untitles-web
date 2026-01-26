<template>
  <div class="folder-sidebar">
    <!-- 스켈레톤 로딩 -->
    <SidebarSkeleton v-if="isLoading" />

    <template v-else>
      <!-- 검색 (상단) -->
      <div class="search-box">
        <Search class="search-icon" />
       <input
          type="text"
          v-model="searchInput"
          placeholder="검색..."
          @input="handleSearchInput"
        />

        <button v-if="searchInput" class="clear-btn" @click="clearSearch">
          <X class="clear-icon" />
        </button>
      </div>

      <!-- 액션 버튼 -->
      <div class="sidebar-header">
        <div class="header-actions">
          <button class="action-btn" @click="handleCreatePost" title="새 노트">
            <FilePlus class="action-icon" />
          </button>
          <button class="action-btn" @click="handleCreateRootFolder" title="새 폴더">
            <FolderPlus class="action-icon" />
          </button>
          <button class="action-btn" @click="toggleAllFolders" :title="allExpanded ? '모두 접기' : '모두 펼치기'">
            <ChevronsUp v-if="allExpanded" class="action-icon" />
            <ChevronsDown v-else class="action-icon" />
          </button>
          <button class="action-btn" @click="toggleSortMenu" title="정렬">
            <ArrowUpDown class="action-icon" />
          </button>
        </div>
        <Menu ref="sortMenu" :model="sortMenuItems" :popup="true" />
      </div>

      <!-- 트리 컨텐츠 -->
      <div
        class="sidebar-content"
        @dragover.prevent="handleRootDragOver"
        @drop.prevent="handleRootDrop"
        @dragleave.prevent="handleRootDragLeave"
        @dragend="handleDragEnd"
        :class="{ 'root-drag-over': isRootDragOver }"
      >
        <div v-if="filteredTree.length === 0" class="empty-state">
          <FolderOpen class="empty-icon" />
          <p v-if="searchQuery">검색 결과가 없습니다</p>
          <p v-else>노트가 없습니다</p>
        </div>

        <TreeNode
          v-else
          v-for="node in filteredTree"
          :key="node.key"
          :node="node"
          :selected-key="selectedKey"
          :editing-key="editingKey"
          :expand-all="expandAllState"
          @node-click="handleNodeClick"
          @node-context-menu="handleNodeContextMenu"
          @node-drag-start="handleDragStart"
          @node-drop="handleDrop"
          @node-rename="handleNodeRename"
        />
      </div>

      <!-- 하단 사용자 메뉴 -->
      <UserMenu />
    </template>

    <ContextMenu ref="contextMenu" :model="contextMenuItems" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Search, X, FilePlus, FolderPlus, ChevronsUp, ChevronsDown, ArrowUpDown, FolderOpen, FilePen, FolderPlus as FolderPlusIcon, Pencil, Trash2, Check } from 'lucide-vue-next'
import TreeNode from './TreeNode.vue'
import UserMenu from './UserMenu.vue'
import SidebarSkeleton from '@/components/common/SidebarSkeleton.vue'
import ContextMenu from 'primevue/contextmenu'
import Menu from 'primevue/menu'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { debounce } from '@/utils/helpers'

const folderStore = useFolderStore()
const postStore = usePostStore()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

const selectedKey = ref(null)
const contextMenu = ref(null)
const contextMenuItems = ref([])
const isLoading = ref(true)
const selectedNode = ref(null)
const isLoadingData = ref(false)
const isRootDragOver = ref(false)
const sortMenu = ref(null)
const editingKey = ref(null)
const allExpanded = ref(true)
const expandAllState = ref(null)

// 검색: 입력값과 실제 필터링 쿼리 분리
const searchInput = ref('')
const searchQuery = ref('')

const folderTree = computed(() => folderStore.folderTree)

// 검색 필터링 (debounce된 searchQuery 사용)
const filteredTree = computed(() => {
  if (!searchQuery.value.trim()) {
    return folderTree.value
  }

  const query = searchQuery.value.toLowerCase()

  function filterNodes(nodes) {
    return nodes.reduce((acc, node) => {
      const matchesLabel = node.label?.toLowerCase().includes(query)
      const filteredChildren = node.children ? filterNodes(node.children) : []

      if (matchesLabel || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren
        })
      }

      return acc
    }, [])
  }

  return filterNodes(folderTree.value)
})

// debounce된 검색 함수 (200ms 대기)
const debouncedSearch = debounce((value) => {
  searchQuery.value = value
  if (value.trim()) {
    expandAllState.value = true
    allExpanded.value = true
  }
}, 200)

// 검색 입력 핸들러
function handleSearchInput() {
  debouncedSearch(searchInput.value)
}

// 검색 초기화
function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  debouncedSearch.cancel()
}

// 컴포넌트 언마운트 시 debounce 정리
onBeforeUnmount(() => {
  debouncedSearch.cancel()
})

// 정렬 메뉴
const sortMenuItems = computed(() => [
  {
    label: '이름순',
    icon: folderStore.sortOption === 'name_asc' ? 'pi pi-check' : 'pi pi-fw',
    command: () => changeSortOption('name_asc')
  },
  {
    label: '이름 역순',
    icon: folderStore.sortOption === 'name_desc' ? 'pi pi-check' : 'pi pi-fw',
    command: () => changeSortOption('name_desc')
  },
  { separator: true },
  {
    label: '최근 수정',
    icon: folderStore.sortOption === 'updated_desc' ? 'pi pi-check' : 'pi pi-fw',
    command: () => changeSortOption('updated_desc')
  },
  {
    label: '오래된 수정',
    icon: folderStore.sortOption === 'updated_asc' ? 'pi pi-check' : 'pi pi-fw',
    command: () => changeSortOption('updated_asc')
  },
  { separator: true },
  {
    label: '최근 생성',
    icon: folderStore.sortOption === 'created_desc' ? 'pi pi-check' : 'pi pi-fw',
    command: () => changeSortOption('created_desc')
  },
  {
    label: '오래된 생성',
    icon: folderStore.sortOption === 'created_asc' ? 'pi pi-check' : 'pi pi-fw',
    command: () => changeSortOption('created_asc')
  }
])

const emit = defineEmits([
  'folderSelected',
  'createFolder',
  'editFolder',
  'deleteFolder',
  'createPost',
  'createPostInFolder',
  'postSelected',
  'editPost',
  'deletePost',
  'movePost',
  'moveFolder'
])

onMounted(async () => {
  await loadData()
})

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated, wasAuthenticated) => {
    if (isAuthenticated && !wasAuthenticated && !isLoadingData.value) {
      loadData()
    }
  }
)

watch(
  () => workspaceStore.currentWorkspaceId,
  (newId, oldId) => {
    if (newId && newId !== oldId && authStore.isAuthenticated) {
      loadData()
    }
  }
)

async function loadData() {
  if (isLoadingData.value) return

  isLoading.value = true
  isLoadingData.value = true

  try {
    if (authStore.isAuthenticated) {
      await folderStore.loadWorkspaceTree()
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
    isLoadingData.value = false
  }
}

function toggleSortMenu(event) {
  sortMenu.value.toggle(event)
}

function changeSortOption(option) {
  folderStore.setSortOption(option)
}

function handleNodeClick(node) {
  selectedKey.value = node.key
  if (node.type === 'post') {
    emit('postSelected', node)
  } else {
    folderStore.selectFolder(node.id)
    emit('folderSelected', node)
  }
}

function handleNodeContextMenu(event) {
  selectedNode.value = event.node
  if (event.node.type === 'post') {
    contextMenuItems.value = getPostContextMenuItems(event.node)
  } else {
    contextMenuItems.value = getFolderContextMenuItems(event.node)
  }
  contextMenu.value.show(event.originalEvent)
}

function getFolderContextMenuItems(node) {
  return [
    {
      label: '새 노트',
      icon: 'pi pi-file-plus',
      command: () => emit('createPostInFolder', node.id)
    },
    {
      label: '하위 폴더',
      icon: 'pi pi-folder-plus',
      command: () => emit('createFolder', node.id)
    },
    { separator: true },
    {
      label: '이름 변경',
      icon: 'pi pi-pencil',
      command: () => startEditing(node)
    },
    {
      label: '삭제',
      icon: 'pi pi-trash',
      command: () => emit('deleteFolder', node)
    }
  ]
}

function getPostContextMenuItems(node) {
  return [
    {
      label: '이름 변경',
      icon: 'pi pi-pencil',
      command: () => startEditing(node)
    },
    {
      label: '삭제',
      icon: 'pi pi-trash',
      command: () => emit('deletePost', node)
    }
  ]
}

function startEditing(node) {
  editingKey.value = node.key
}

async function handleNodeRename({ node, newName }) {
  editingKey.value = null
  if (!newName) return

  try {
    if (node.type === 'folder') {
      await folderStore.updateFolder(node.id, { name: newName })
    } else if (node.type === 'post') {
      const postId = node.data?.postId || node.id
      await postStore.updatePost(postId, { title: newName })
      await folderStore.loadWorkspaceTree()
    }
  } catch (error) {
    console.error('이름 변경 실패:', error)
  }
}

function handleCreateRootFolder() {
  emit('createFolder', null)
}

function handleCreatePost() {
  emit('createPost')
}

function toggleAllFolders() {
  allExpanded.value = !allExpanded.value
  expandAllState.value = allExpanded.value
}

const draggedNode = ref(null)

function handleDragStart({ node, event }) {
  draggedNode.value = node
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', node.id)
}

function handleDrop({ targetNode }) {
  if (!draggedNode.value || targetNode.type !== 'folder') return

  if (draggedNode.value.type === 'post') {
    const postId = draggedNode.value.data?.postId || draggedNode.value.id
    const targetFolderId = targetNode.data?.folderId || targetNode.id
    const currentFolderId = draggedNode.value.data?.folderId

    if (!postId || !targetFolderId) return
    if (currentFolderId === targetFolderId) return

    emit('movePost', postId, targetFolderId)
  } else if (draggedNode.value.type === 'folder') {
    const folderId = draggedNode.value.id
    const targetFolderId = targetNode.id
    const currentParentId = draggedNode.value.data?.parentId

    if (folderId === targetFolderId) return
    if (currentParentId === targetFolderId) return

    emit('moveFolder', folderId, targetFolderId)
  }

  draggedNode.value = null
}

function handleRootDragOver(event) {
  if (!event.target.closest('.tree-node-item')) {
    isRootDragOver.value = true
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleRootDragLeave(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isRootDragOver.value = false
  }
}

function handleDragEnd() {
  isRootDragOver.value = false
  draggedNode.value = null
}

function handleRootDrop(event) {
  if (event.target.closest('.tree-node-item')) return

  isRootDragOver.value = false
  if (!draggedNode.value) return

  if (draggedNode.value.type === 'post') {
    const postId = draggedNode.value.data?.postId || draggedNode.value.id
    const currentFolderId = draggedNode.value.data?.folderId

    if (!postId || !currentFolderId) return
    emit('movePost', postId, null)
  } else if (draggedNode.value.type === 'folder') {
    const folderId = draggedNode.value.id
    const currentParentId = draggedNode.value.data?.parentId

    if (!currentParentId) return
    emit('moveFolder', folderId, null)
  }

  draggedNode.value = null
}
</script>

<style scoped>
.folder-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--surface-sidebar);
}

/* 검색 (상단) */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--focus-ring-alpha);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-size: 0.875rem;
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-color-secondary);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: var(--surface-hover);
  border-radius: 50%;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.clear-btn:hover {
  background: var(--surface-border);
  color: var(--text-color);
}

.clear-icon {
  width: 12px;
  height: 12px;
}

/* 액션 버튼 헤더 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.action-icon {
  width: 18px;
  height: 18px;
}

/* 컨텐츠 */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  border-top: 1px solid var(--surface-border);
  transition: background-color 0.2s;
}

.sidebar-content.root-drag-over {
  background-color: var(--highlight-bg);
}

/* 상태 표시 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 1rem;
  font-size: 0.875rem;
}

.create-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--surface-border);
  background: transparent;
  border-radius: 6px;
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.create-btn:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}
</style>
