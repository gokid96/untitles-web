import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { folderApi } from '@/api/folderApi'
import { buildFolderTree } from '@/utils/helpers'
import { useWorkspaceStore } from './workspaceStore'

export const useFolderStore = defineStore('folder', () => {
  // 상태
  const folders = ref([])       // 폴더 목록 (트리 구조, posts 포함)
  const rootPosts = ref([])     // 폴더 없는 게시글
  const selectedFolderId = ref(null)
  const folderTree = ref([])    // UI용 트리 구조
  const sortOption = ref('name_asc')

  // 워크스페이스 스토어
  const workspaceStore = useWorkspaceStore()

  // 선택된 폴더
  const selectedFolder = computed(() => {
    function findFolder(folderList, id) {
      for (const folder of folderList) {
        if (folder.folderId === id) return folder
        if (folder.children?.length > 0) {
          const found = findFolder(folder.children, id)
          if (found) return found
        }
      }
      return null
    }
    return findFolder(folders.value, selectedFolderId.value)
  })

  /**
   * 폴더 트리 업데이트 (UI용 트리 구조 생성)
   */
  function updateFolderTree() {
    folderTree.value = buildFolderTree(folders.value, rootPosts.value, sortOption.value)
  }

  /**
   * 정렬 옵션 설정
   */
  function setSortOption(option) {
    sortOption.value = option
    updateFolderTree()
  }

  /**
   * 워크스페이스 트리 로드 (폴더 + 게시글 한 번에)
   */
  async function loadWorkspaceTree() {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      console.warn('No workspace selected')
      return
    }

    try {
      const response = await folderApi.getWorkspaceTree(workspaceId)
      folders.value = response.data.folders
      rootPosts.value = response.data.rootPosts
      updateFolderTree()
    } catch (error) {
      console.error('Failed to load workspace tree:', error)
      throw error
    }
  }

  // ========== 헬퍼 함수들 ==========

  /**
   * 폴더 목록에서 특정 폴더 찾기 (재귀)
   */
  function findFolderInList(folderList, folderId) {
    for (const folder of folderList) {
      if (folder.folderId === folderId) return folder
      if (folder.children?.length > 0) {
        const found = findFolderInList(folder.children, folderId)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 폴더 목록에서 특정 폴더 제거 (재귀)
   */
  function removeFolderFromList(folderList, folderId) {
    const index = folderList.findIndex(f => f.folderId === folderId)
    if (index !== -1) {
      folderList.splice(index, 1)
      return true
    }
    for (const folder of folderList) {
      if (folder.children?.length > 0) {
        if (removeFolderFromList(folder.children, folderId)) return true
      }
    }
    return false
  }

  /**
   * 폴더 목록에서 특정 폴더 업데이트 (재귀)
   */
  function updateFolderInList(folderList, folderId, updates) {
    for (const folder of folderList) {
      if (folder.folderId === folderId) {
        Object.assign(folder, updates)
        return true
      }
      if (folder.children?.length > 0) {
        if (updateFolderInList(folder.children, folderId, updates)) return true
      }
    }
    return false
  }

  /**
   * 게시글을 폴더에서 제거 (재귀)
   */
  function removePostFromFolders(folderList, postId) {
    for (const folder of folderList) {
      if (folder.posts) {
        const index = folder.posts.findIndex(p => p.postId === postId)
        if (index !== -1) {
          folder.posts.splice(index, 1)
          return true
        }
      }
      if (folder.children?.length > 0) {
        if (removePostFromFolders(folder.children, postId)) return true
      }
    }
    return false
  }

  /**
   * 게시글을 폴더에 추가
   */
  function addPostToFolder(folderList, folderId, post) {
    const folder = findFolderInList(folderList, folderId)
    if (folder) {
      if (!folder.posts) folder.posts = []
      folder.posts.push(post)
      return true
    }
    return false
  }

  /**
   * 폴더 내 게시글 업데이트 (재귀)
   */
  function updatePostInFolders(folderList, postId, updates) {
    for (const folder of folderList) {
      if (folder.posts) {
        const post = folder.posts.find(p => p.postId === postId)
        if (post) {
          Object.assign(post, updates)
          return true
        }
      }
      if (folder.children?.length > 0) {
        if (updatePostInFolders(folder.children, postId, updates)) return true
      }
    }
    return false
  }

  // ========== 폴더 CRUD ==========

  /**
   * 폴더 생성 (로컬 상태 업데이트)
   */
  async function createFolder(data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await folderApi.createFolder(workspaceId, data)
      const newFolder = response.data

      // 로컬 상태 업데이트
      if (data.parentId) {
        // 부모 폴더에 추가
        const parent = findFolderInList(folders.value, data.parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(newFolder)
        }
      } else {
        // 루트에 추가
        folders.value.push(newFolder)
      }

      updateFolderTree()

      // 워크스페이스 폴더 count 업데이트
      workspaceStore.updateFolderCount(1)

      return newFolder
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  }

  /**
   * 폴더 수정 (로컬 상태 업데이트)
   */
  async function updateFolder(folderId, data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await folderApi.updateFolder(workspaceId, folderId, data)
      const updatedFolder = response.data

      // 로컬 상태 업데이트
      updateFolderInList(folders.value, folderId, {
        name: updatedFolder.name,
        updatedAt: updatedFolder.updatedAt
      })

      updateFolderTree()
      return updatedFolder
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  }

  /**
   * 폴더 삭제 (로컬 상태 업데이트)
   */
  async function deleteFolder(folderId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      await folderApi.deleteFolder(workspaceId, folderId)

      // 로컬 상태 업데이트
      removeFolderFromList(folders.value, folderId)

      if (selectedFolderId.value === folderId) {
        selectedFolderId.value = null
      }

      updateFolderTree()

      // 워크스페이스 폴더 count 업데이트
      workspaceStore.updateFolderCount(-1)
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  }

  /**
   * 폴더 이동 (로컬 상태 업데이트)
   */
  async function moveFolder(folderId, newParentId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await folderApi.moveFolder(workspaceId, folderId, { parentId: newParentId })
      const movedFolder = response.data

      // 기존 위치에서 제거
      const folder = findFolderInList(folders.value, folderId)
      if (folder) {
        // 폴더 데이터 복사 (children, posts 포함)
        const folderData = { ...folder }
        removeFolderFromList(folders.value, folderId)

        // 새 위치에 추가
        folderData.parentId = newParentId
        if (newParentId) {
          const newParent = findFolderInList(folders.value, newParentId)
          if (newParent) {
            if (!newParent.children) newParent.children = []
            newParent.children.push(folderData)
          }
        } else {
          folders.value.push(folderData)
        }
      }

      updateFolderTree()
      return movedFolder
    } catch (error) {
      console.error('Failed to move folder:', error)
      throw error
    }
  }

  // ========== 게시글 관련 (folderStore에서 트리 업데이트용) ==========

  /**
   * 게시글 추가 (로컬 상태 업데이트)
   */
  function addPostLocally(post) {
    const postData = {
      postId: post.id || post.postId,
      title: post.title,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }

    if (post.folderId) {
      addPostToFolder(folders.value, post.folderId, postData)
    } else {
      rootPosts.value.push(postData)
    }

    updateFolderTree()
  }

  /**
   * 게시글 수정 (로컬 상태 업데이트 - 제목만)
   */
  function updatePostLocally(postId, updates) {
    // rootPosts에서 찾기
    const rootPost = rootPosts.value.find(p => p.postId === postId)
    if (rootPost) {
      Object.assign(rootPost, updates)
      updateFolderTree()
      return
    }

    // folders에서 찾기
    if (updatePostInFolders(folders.value, postId, updates)) {
      updateFolderTree()
    }
  }

  /**
   * 게시글 삭제 (로컬 상태 업데이트)
   */
  function deletePostLocally(postId) {
    // rootPosts에서 제거
    const rootIndex = rootPosts.value.findIndex(p => p.postId === postId)
    if (rootIndex !== -1) {
      rootPosts.value.splice(rootIndex, 1)
      updateFolderTree()
      return
    }

    // folders에서 제거
    if (removePostFromFolders(folders.value, postId)) {
      updateFolderTree()
    }
  }

  /**
   * 게시글 이동 (로컬 상태 업데이트)
   */
  function movePostLocally(postId, newFolderId, postData) {
    // 기존 위치에서 제거
    let post = null

    // rootPosts에서 찾기
    const rootIndex = rootPosts.value.findIndex(p => p.postId === postId)
    if (rootIndex !== -1) {
      post = rootPosts.value.splice(rootIndex, 1)[0]
    } else {
      // folders에서 찾기 및 제거
      for (const folder of folders.value) {
        if (folder.posts) {
          const idx = folder.posts.findIndex(p => p.postId === postId)
          if (idx !== -1) {
            post = folder.posts.splice(idx, 1)[0]
            break
          }
        }
      }
      // 재귀적으로 찾기
      if (!post) {
        function findAndRemove(folderList) {
          for (const folder of folderList) {
            if (folder.posts) {
              const idx = folder.posts.findIndex(p => p.postId === postId)
              if (idx !== -1) {
                return folder.posts.splice(idx, 1)[0]
              }
            }
            if (folder.children?.length > 0) {
              const found = findAndRemove(folder.children)
              if (found) return found
            }
          }
          return null
        }
        post = findAndRemove(folders.value)
      }
    }

    // 새 위치에 추가
    const postToAdd = post || {
      postId: postId,
      title: postData?.title || '무제',
      createdAt: postData?.createdAt,
      updatedAt: postData?.updatedAt
    }

    if (newFolderId) {
      addPostToFolder(folders.value, newFolderId, postToAdd)
    } else {
      rootPosts.value.push(postToAdd)
    }

    updateFolderTree()
  }

  /**
   * 폴더 선택
   */
  function selectFolder(folderId) {
    selectedFolderId.value = folderId
  }

  /**
   * 폴더 선택 해제
   */
  function clearSelection() {
    selectedFolderId.value = null
  }

  /**
   * 폴더 데이터 초기화 (워크스페이스 변경 시)
   */
  function clearFolderData() {
    folders.value = []
    rootPosts.value = []
    folderTree.value = []
    selectedFolderId.value = null
  }

  return {
    // 상태
    folders,
    rootPosts,
    selectedFolderId,
    folderTree,
    selectedFolder,
    sortOption,
    // 액션
    loadWorkspaceTree,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    selectFolder,
    clearSelection,
    updateFolderTree,
    setSortOption,
    clearFolderData,
    // 게시글 로컬 업데이트용
    addPostLocally,
    updatePostLocally,
    deletePostLocally,
    movePostLocally,
  }
})
