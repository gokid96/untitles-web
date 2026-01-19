<template>
  <div class="folder-sidebar">
    <div class="sidebar-header">
      <Button icon="pi pi-pen-to-square" severity="primary" @click="handleCreatePost" v-tooltip.bottom="'새 노트'" text />
      <Button icon="pi pi-folder-plus" severity="secondary" @click="handleCreateRootFolder" v-tooltip.bottom="'새 폴더'"
        text />
      <Button :icon="allExpanded ? 'pi pi-angle-double-up' : 'pi pi-angle-double-down'" severity="secondary"
        @click="toggleAllFolders" v-tooltip.bottom="allExpanded ? '모두 접기' : '모두 펼치기'" text />
      <Button icon="pi pi-sort-alt" severity="secondary" @click="toggleSortMenu" v-tooltip.bottom="'정렬 순서'" text
        aria-haspopup="true" aria-controls="sort_menu" />
      <Menu ref="sortMenu" id="sort_menu" :model="sortMenuItems" :popup="true" />
    </div>

    <!-- 전체 영역을 드롭 존으로 -->
    <div class="sidebar-content" @dragover.prevent="handleRootDragOver" @drop.prevent="handleRootDrop"
      @dragleave="handleRootDragLeave" :class="{ 'root-drag-over': isRootDragOver }">

      <div v-if="folderTree.length === 0" class="empty-message">
        <p>폴더가 없습니다</p>
      </div>
      <TreeNode v-else v-for="node in folderTree" :key="node.key" :node="node" :selected-key="selectedKey"
        :editing-key="editingKey" :expand-all="expandAllState" @node-click="handleNodeClick"
        @node-context-menu="handleNodeContextMenu" @node-drag-start="handleDragStart" @node-drop="handleDrop"
        @node-rename="handleNodeRename" />
    </div>

    <!-- 하단 사용자 메뉴 -->
    <UserMenu />

    <ContextMenu ref="contextMenu" :model="contextMenuItems" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TreeNode from './TreeNode.vue'
import UserMenu from './UserMenu.vue'
import Button from 'primevue/button'
import ContextMenu from 'primevue/contextmenu'
import Menu from 'primevue/menu'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const folderStore = useFolderStore()
const postStore = usePostStore()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

const selectedKey = ref(null)
const contextMenu = ref(null)
const contextMenuItems = ref([])
const isLoading = ref(false)
const selectedNode = ref(null)
const isLoadingData = ref(false)
const isRootDragOver = ref(false)
const sortMenu = ref(null)
const editingKey = ref(null)
const allExpanded = ref(true)
const expandAllState = ref(null)

const folderTree = computed(() => folderStore.folderTree)

// 정렬 메뉴 아이템
const sortMenuItems = computed(() => [
  {
    label: '이름 (알파벳순)',
    icon: folderStore.sortOption === 'name_asc' ? 'pi pi-check' : '',
    command: () => changeSortOption('name_asc')
  },
  {
    label: '이름 (알파벳 역순)',
    icon: folderStore.sortOption === 'name_desc' ? 'pi pi-check' : '',
    command: () => changeSortOption('name_desc')
  },
  { separator: true },
  {
    label: '업데이트 날짜 (최신순)',
    icon: folderStore.sortOption === 'updated_desc' ? 'pi pi-check' : '',
    command: () => changeSortOption('updated_desc')
  },
  {
    label: '업데이트 날짜 (오래된순)',
    icon: folderStore.sortOption === 'updated_asc' ? 'pi pi-check' : '',
    command: () => changeSortOption('updated_asc')
  },
  { separator: true },
  {
    label: '생성일 (최신순)',
    icon: folderStore.sortOption === 'created_desc' ? 'pi pi-check' : '',
    command: () => changeSortOption('created_desc')
  },
  {
    label: '생성일 (오래된순)',
    icon: folderStore.sortOption === 'created_asc' ? 'pi pi-check' : '',
    command: () => changeSortOption('created_asc')
  }
])

function toggleSortMenu(event) {
  sortMenu.value.toggle(event)
}

function changeSortOption(option) {
  folderStore.setSortOption(option)
}

const emit = defineEmits(['folderSelected', 'createFolder', 'editFolder', 'deleteFolder', 'createPost', 'createPostInFolder', 'postSelected', 'editPost', 'deletePost', 'movePost', 'moveFolder'])

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

// 워크스페이스 변경 감지
watch(
  () => workspaceStore.currentWorkspaceId,
  (newId, oldId) => {
    if (newId && newId !== oldId && authStore.isAuthenticated) {
      loadData()
    }
  }
)

async function loadData() {
  if (isLoadingData.value) {
    return
  }

  isLoading.value = true
  isLoadingData.value = true
  try {
    if (authStore.isAuthenticated) {
      await Promise.all([
        folderStore.loadAllFolders(),
        postStore.fetchPosts()
      ])
      folderStore.updateFolderTree()
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
    isLoadingData.value = false
  }
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
      command: () => {
        emit('createPostInFolder', node.id)
      },
    },
    {
      label: '하위 폴더 생성',
      icon: 'pi pi-folder-plus',
      command: () => {
        emit('createFolder', node.id)
      },
    },
    {
      separator: true,
    },
    {
      label: '이름 변경',
      icon: 'pi pi-pencil',
      command: () => {
        startEditing(node)
      },
    },
    {
      label: '삭제',
      icon: 'pi pi-trash',
      command: () => {
        emit('deleteFolder', node)
      },
    },
  ]
}

function getPostContextMenuItems(node) {
  return [
    {
      label: '이름 변경',
      icon: 'pi pi-pencil',
      command: () => {
        startEditing(node)
      },
    },
    {
      label: '삭제',
      icon: 'pi pi-trash',
      command: () => {
        emit('deletePost', node)
      },
    },
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
      folderStore.updateFolderTree()
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
  if (!draggedNode.value || targetNode.type !== 'folder') {
    return
  }

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
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isRootDragOver.value = false
  }
}

function handleRootDrop(event) {
  if (event.target.closest('.tree-node-item')) return

  isRootDragOver.value = false

  if (!draggedNode.value) return

  if (draggedNode.value.type === 'post') {
    const postId = draggedNode.value.data?.postId || draggedNode.value.id
    const currentFolderId = draggedNode.value.data?.folderId

    if (!postId) return
    if (!currentFolderId || currentFolderId === null) return

    emit('movePost', postId, null)
  } else if (draggedNode.value.type === 'folder') {
    const folderId = draggedNode.value.id
    const currentParentId = draggedNode.value.data?.parentId

    if (!currentParentId || currentParentId === null) return

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
  background-color: var(--surface-card);
  border-right: 1px solid var(--surface-border);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.9rem;
  position: relative;
  transition: background-color 0.2s;
}

.sidebar-content.root-drag-over::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--primary-color);
  opacity: 0.05;
  pointer-events: none;
  z-index: 1;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}
</style>
