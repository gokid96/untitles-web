import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postApi } from '@/api/postApi'
import { useFolderStore } from './folderStore'
import { useWorkspaceStore } from './workspaceStore'

export const usePostStore = defineStore('post', () => {
  // 상태
  const currentPost = ref(null)

  // 스토어
  const workspaceStore = useWorkspaceStore()

  // 게시글 상세 조회
  async function getPostById(postId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await postApi.getPost(workspaceId, postId)
      currentPost.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to get post by id:', error)
      throw error
    }
  }

  // 게시글 생성 (로컬 상태 업데이트)
  async function createPost(data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await postApi.createPost(workspaceId, data)
      const newPost = response.data
      currentPost.value = newPost

      // 로컬 상태 업데이트 (API 재호출 대신)
      const folderStore = useFolderStore()
      folderStore.addPostLocally({
        id: newPost.id,
        title: newPost.title,
        folderId: newPost.folderId,
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt
      })

      // 워크스페이스 게시글 count 업데이트
      workspaceStore.updatePostCount(1)

      return newPost
    } catch (error) {
      console.error('Failed to create post:', error)
      throw error
    }
  }

  // 게시글 수정 (충돌 시 최신 데이터 반환)
  async function updatePost(postId, data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await postApi.updatePost(workspaceId, postId, data)
      const updatedPost = response.data
      currentPost.value = updatedPost

      // 제목이 변경된 경우 로컬 상태 업데이트
      if (data.title) {
        const folderStore = useFolderStore()
        folderStore.updatePostLocally(postId, {
          title: updatedPost.title,
          updatedAt: updatedPost.updatedAt
        })
      }

      return { success: true, post: updatedPost }
    } catch (error) {
      // 409 Conflict - 동시 수정 충돌
      if (error.response?.status === 409) {
        console.warn('Conflict detected, reloading post...')
        
        try {
          const latestPost = await getPostById(postId)
          return { success: false, conflict: true, post: latestPost }
        } catch (reloadError) {
          console.error('Failed to reload post after conflict:', reloadError)
          throw reloadError
        }
      }
      
      console.error('Failed to update post:', error)
      throw error
    }
  }

  // 게시글 삭제 (로컬 상태 업데이트)
  async function deletePost(postId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      await postApi.deletePost(workspaceId, postId)

      if (currentPost.value?.id === postId) {
        currentPost.value = null
      }

      // 로컬 상태 업데이트 (API 재호출 대신)
      const folderStore = useFolderStore()
      folderStore.deletePostLocally(postId)

      // 워크스페이스 게시글 count 업데이트
      workspaceStore.updatePostCount(-1)
    } catch (error) {
      console.error('Failed to delete post:', error)
      throw error
    }
  }

  // 현재 게시글 초기화
  function clearCurrentPost() {
    currentPost.value = null
  }

  // 게시글 폴더 이동 (로컬 상태 업데이트)
  async function movePost(postId, folderId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await postApi.movePost(workspaceId, postId, folderId)
      const updatedPost = response.data
      currentPost.value = updatedPost

      // 로컬 상태 업데이트 (API 재호출 대신)
      const folderStore = useFolderStore()
      folderStore.movePostLocally(postId, folderId, {
        title: updatedPost.title,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt
      })

      return updatedPost
    } catch (error) {
      console.error('Failed to move post:', error)
      throw error
    }
  }

  // 게시글 데이터 초기화
  function clearPostData() {
    currentPost.value = null
  }

  return {
    currentPost,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    clearCurrentPost,
    movePost,
    clearPostData,
  }
})
