import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { folderApi } from '@/api/folderApi'
import { buildFolderTree } from '@/utils/helpers'
import { usePostStore } from './postStore'
import { useWorkspaceStore } from './workspaceStore'

export const useFolderStore = defineStore('folder', () => {
  // 상태
  const folders = ref([])
  const selectedFolderId = ref(null)
  const rootFolders = ref([])
  const folderTree = ref([])
  const sortOption = ref('name_asc')

  // 워크스페이스 스토어
  const workspaceStore = useWorkspaceStore()

  // 선택된 폴더
  const selectedFolder = computed(() => {
    return folders.value.find((f) => f.id === selectedFolderId.value) || null
  })

  // 폴더 트리 업데이트 함수
  function updateFolderTree() {
    const postStore = usePostStore()
    folderTree.value = buildFolderTree(folders.value, null, postStore.posts, sortOption.value)
  }

  // 정렬 옵션 설정 함수
  function setSortOption(option) {
    sortOption.value = option
    updateFolderTree()
  }

  // 루트 폴더 목록 조회
  async function fetchRootFolders() {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      console.warn('No workspace selected')
      return []
    }

    try {
      const response = await folderApi.getRootFolders(workspaceId)
      rootFolders.value = response.data
      folders.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch root folders:', error)
      throw error
    }
  }

  // 하위 폴더 목록 조회
  async function fetchChildFolders(folderId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      console.warn('No workspace selected')
      return []
    }

    try {
      const response = await folderApi.getChildFolders(workspaceId, folderId)
      const childFolders = response.data

      childFolders.forEach((child) => {
        const existingIndex = folders.value.findIndex((f) => f.id === child.id)
        if (existingIndex === -1) {
          folders.value.push(child)
        } else {
          folders.value[existingIndex] = child
        }
      })

      return childFolders
    } catch (error) {
      console.error('Failed to fetch child folders:', error)
      throw error
    }
  }

  // 모든 폴더 재귀적으로 로드
  async function loadAllFolders() {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      console.warn('No workspace selected')
      return
    }

    try {
      await fetchRootFolders()

      const loadChildren = async (folderId) => {
        const children = await fetchChildFolders(folderId)
        for (const child of children) {
          if (child.hasChildren) {
            await loadChildren(child.id)
          }
        }
      }

      for (const folder of rootFolders.value) {
        if (folder.hasChildren) {
          await loadChildren(folder.id)
        }
      }

      updateFolderTree()
    } catch (error) {
      console.error('Failed to load all folders:', error)
      throw error
    }
  }

  // 폴더 생성
  async function createFolder(data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      console.log('[FolderStore] Creating folder with data:', data)
      const response = await folderApi.createFolder(workspaceId, data)
      const newFolder = response.data

      console.log('[FolderStore] Created folder:', newFolder)

      const exists = folders.value.find(f => f.id === newFolder.id)
      if (!exists) {
        folders.value.push(newFolder)
      }

      if (!newFolder.parentId) {
        const rootExists = rootFolders.value.find(f => f.id === newFolder.id)
        if (!rootExists) {
          rootFolders.value.push(newFolder)
        }
      }

      updateFolderTree()
      return newFolder
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  }

  // 폴더 수정
  async function updateFolder(folderId, data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await folderApi.updateFolder(workspaceId, folderId, data)
      const updatedFolder = response.data

      const index = folders.value.findIndex((f) => f.id === folderId)
      if (index !== -1) {
        folders.value[index] = updatedFolder
      }

      const rootIndex = rootFolders.value.findIndex((f) => f.id === folderId)
      if (rootIndex !== -1) {
        rootFolders.value[rootIndex] = updatedFolder
      }

      updateFolderTree()
      return updatedFolder
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  }

  // 폴더 삭제
  async function deleteFolder(folderId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      await folderApi.deleteFolder(workspaceId, folderId)

      const removeFolder = (id) => {
        const children = folders.value.filter((f) => f.parentId === id)
        children.forEach((child) => removeFolder(child.id))
        folders.value = folders.value.filter((f) => f.id !== id)
      }

      removeFolder(folderId)
      rootFolders.value = rootFolders.value.filter((f) => f.id !== folderId)

      if (selectedFolderId.value === folderId) {
        selectedFolderId.value = null
      }

      updateFolderTree()
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  }

  // 폴더 선택
  function selectFolder(folderId) {
    selectedFolderId.value = folderId
  }

  // 폴더 선택 해제
  function clearSelection() {
    selectedFolderId.value = null
  }

  // 폴더 이동
  async function moveFolder(folderId, newParentId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      console.log('[FolderStore] moveFolder:', { folderId, newParentId })
      const response = await folderApi.moveFolder(workspaceId, folderId, { parentId: newParentId })
      const updatedFolder = response.data

      const index = folders.value.findIndex((f) => f.id === folderId)
      if (index !== -1) {
        folders.value[index] = updatedFolder
      }

      if (!updatedFolder.parentId) {
        const rootExists = rootFolders.value.find(f => f.id === folderId)
        if (!rootExists) {
          rootFolders.value.push(updatedFolder)
        }
      } else {
        rootFolders.value = rootFolders.value.filter(f => f.id !== folderId)
      }

      updateFolderTree()
      return updatedFolder
    } catch (error) {
      console.error('[FolderStore] Failed to move folder:', error)
      throw error
    }
  }

  // 폴더 데이터 초기화 (워크스페이스 변경 시)
  function clearFolderData() {
    folders.value = []
    rootFolders.value = []
    folderTree.value = []
    selectedFolderId.value = null
  }

  return {
    folders,
    selectedFolderId,
    rootFolders,
    folderTree,
    selectedFolder,
    sortOption,
    fetchRootFolders,
    fetchChildFolders,
    loadAllFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    selectFolder,
    clearSelection,
    updateFolderTree,
    moveFolder,
    setSortOption,
    clearFolderData,
  }
})
