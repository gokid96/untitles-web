import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postApi } from '@/api/postApi'
import { useFolderStore } from './folderStore'
import { useWorkspaceStore } from './workspaceStore'

export const usePostStore = defineStore('post', () => {
  // 상태
  const posts = ref([])
  const currentPost = ref(null)
  const pagination = ref({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  })

  // 스토어
  const folderStore = useFolderStore()
  const workspaceStore = useWorkspaceStore()

  // 선택된 폴더의 게시글 필터링
  const filteredPosts = computed(() => {
    if (!folderStore.selectedFolderId) {
      return posts.value
    }
    return posts.value.filter((post) => post.folderId === folderStore.selectedFolderId)
  })

  // 워크스페이스의 게시글 목록 조회
  async function fetchPosts() {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      console.warn('No workspace selected')
      return []
    }

    try {
      const response = await postApi.getPosts(workspaceId)
      posts.value = response.data
      pagination.value.totalElements = response.data.length
      return response.data
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      throw error
    }
  }

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

  // 게시글 생성
  async function createPost(data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await postApi.createPost(workspaceId, data)
      const newPost = response.data

      posts.value.unshift(newPost)
      pagination.value.totalElements += 1

      return newPost
    } catch (error) {
      console.error('Failed to create post:', error)
      throw error
    }
  }

  // 게시글 수정
  async function updatePost(postId, data) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await postApi.updatePost(workspaceId, postId, data)
      const updatedPost = response.data

      const index = posts.value.findIndex((p) => p.id === postId)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }

      if (currentPost.value?.id === postId) {
        currentPost.value = updatedPost
      }

      return updatedPost
    } catch (error) {
      console.error('Failed to update post:', error)
      throw error
    }
  }

  // 게시글 삭제
  async function deletePost(postId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      await postApi.deletePost(workspaceId, postId)

      posts.value = posts.value.filter((p) => p.id !== postId)
      pagination.value.totalElements = Math.max(0, pagination.value.totalElements - 1)

      if (currentPost.value?.id === postId) {
        currentPost.value = null
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      throw error
    }
  }

  // 현재 게시글 설정
  function setCurrentPost(post) {
    currentPost.value = post
  }

  // 현재 게시글 초기화
  function clearCurrentPost() {
    currentPost.value = null
  }

  // 게시글 폴더 이동
  async function movePost(postId, folderId) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) {
      throw new Error('No workspace selected')
    }

    try {
      const response = await postApi.movePost(workspaceId, postId, folderId)
      const updatedPost = response.data

      const index = posts.value.findIndex((p) => p.id === postId)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }

      if (currentPost.value?.id === postId) {
        currentPost.value = updatedPost
      }

      return updatedPost
    } catch (error) {
      console.error('Failed to move post:', error)
      throw error
    }
  }

  // 게시글 데이터 초기화 (워크스페이스 변경 시)
  function clearPostData() {
    posts.value = []
    currentPost.value = null
    pagination.value = {
      page: 0,
      size: 20,
      totalPages: 0,
      totalElements: 0,
    }
  }

  return {
    posts,
    currentPost,
    pagination,
    filteredPosts,
    fetchPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    setCurrentPost,
    clearCurrentPost,
    movePost,
    clearPostData,
  }
})
