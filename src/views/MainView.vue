<template>
  <div class="main-view">
    <!-- <AppHeader /> -->
    <!-- <Splitter style="height: calc(100vh - 60px)"> -->
    <!-- 헤더 없을 때 -->
    <Splitter style="height: 100vh">
      <SplitterPanel :size="20" :minSize="15" :maxSize="30">
        <FolderSidebar @folder-selected="handleFolderSelected" @create-folder="handleCreateFolder"
          @edit-folder="handleEditFolder" @delete-folder="handleDeleteFolder" @create-post="handleCreatePost"
          @create-post-in-folder="handleCreatePostInFolder" @post-selected="handlePostSelected"
          @edit-post="handleEditPost" @delete-post="handleDeletePost" @move-post="handleMovePost"
          @move-folder="handleMoveFolder" />
      </SplitterPanel>

      <SplitterPanel :size="80">
        <EmptyContent v-if="contentMode === 'empty'" @create-post="handleCreatePost" />
        <PostViewer v-else-if="contentMode === 'view'" :post="selectedPost" @edit="handleEditPost"
          @delete="handleDeletePost" />
        <PostEditor v-else-if="contentMode === 'edit' || contentMode === 'create'" :post="selectedPostForEdit"
          @save="handleSavePost" @cancel="handleCancelEdit" />
      </SplitterPanel>
    </Splitter>

    <!-- 폴더 모달 -->
    <FolderModal v-model:visible="isFolderModalOpen" :folder="selectedFolderForEdit" :parentId="parentFolderId"
      @save="handleSaveFolder" />

    <!-- 삭제 확인 다이얼로그 -->
    <ConfirmDialog v-model:visible="isConfirmDialogOpen" :header="confirmDialogHeader" :message="confirmDialogMessage"
      @confirm="handleConfirmDelete" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import AppHeader from '@/components/layout/AppHeader.vue'
import FolderSidebar from '@/components/layout/FolderSidebar.vue'
import EmptyContent from '@/components/editor/EmptyContent.vue'
import PostViewer from '@/components/editor/PostViewer.vue'
import PostEditor from '@/components/editor/PostEditor.vue'
import FolderModal from '@/components/modals/FolderModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/authStore'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { TOAST_MESSAGES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/helpers'

const toast = useToast()
const authStore = useAuthStore()
const folderStore = useFolderStore()
const postStore = usePostStore()

// 컨텐츠 모드 상태
const contentMode = ref('empty')

// 모달 상태
const isFolderModalOpen = ref(false)
const isConfirmDialogOpen = ref(false)

// 선택된 항목
const selectedFolderForEdit = ref(null)
const selectedPostForEdit = ref(null)
const selectedPost = ref(null)
const parentFolderId = ref(null)

// 삭제 확인
//const confirmDialogHeader = ref('삭제 확인')
const confirmDialogMessage = ref('정말 삭제하시겠습니까?')
const deleteTarget = ref(null)
const deleteType = ref(null)

onMounted(async () => {
  await authStore.loadUserFromStorage()
})

// 폴더 생성 (JWT 인증 사용)
async function handleCreateFolder(parentId) {
  if (!authStore.isAuthenticated) {
    console.error('Not authenticated!')
    return
  }

  try {
    const newFolder = await folderStore.createFolder({
      name: '무제',
      parentId: parentId  // null이면 루트, 값 있으면 하위 폴더
    })

    console.log('생성된 폴더:', newFolder)

    // toast.add({
    //   severity: 'success',
    //   summary: '폴더 생성',
    //   detail: '새 폴더가 생성되었습니다.',
    //   life: 2000,
    // })
  } catch (error) {
    console.error('Failed to create folder:', error)
    toast.add({
      severity: 'error',
      summary: '생성 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  }
}

function handleEditFolder(folder) {
  selectedFolderForEdit.value = folder
  parentFolderId.value = folder.data?.parentFolderId || folder.parentId
  isFolderModalOpen.value = true
}

function handleDeleteFolder(folder) {
  deleteTarget.value = folder
  deleteType.value = 'folder'
  //confirmDialogHeader.value = '폴더 삭제'
  confirmDialogMessage.value = `폴더를 삭제하시겠습니까? 하위 폴더와 게시글도 함께 삭제됩니다.`
  isConfirmDialogOpen.value = true
}

async function handleSaveFolder(data) {
  if (!authStore.isAuthenticated) return

  try {
    if (selectedFolderForEdit.value) {
      // 수정
      await folderStore.updateFolder(data.id, { name: data.name })
      toast.add({
        severity: 'success',
        summary: '폴더 수정',
        detail: TOAST_MESSAGES.SUCCESS.FOLDER_UPDATED,
        life: 3000,
      })
    } else {
      // 생성
      await folderStore.createFolder(data)
      toast.add({
        severity: 'success',
        summary: '폴더 생성',
        detail: TOAST_MESSAGES.SUCCESS.FOLDER_CREATED,
        life: 3000,
      })
    }
  } catch (error) {
    console.error('Folder save error:', error)
    toast.add({
      severity: 'error',
      summary: '폴더 저장 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  }
}

// 게시글 이벤트 핸들러
function handlePostSelected(post) {
  console.log('[MainView] handlePostSelected - 받은 TreeNode:', post)

  const postData = {
    id: post.data.postId || post.id,
    title: post.data.title || post.label || '무제',
    content: post.data.content || '',
    folderId: post.data.folderId,
    status: post.data.status,
    visibility: post.data.visibility,
    createdAt: post.data.createdAt,
    updatedAt: post.data.updatedAt
  }

  console.log('[MainView] handlePostSelected - 추출된 postData:', postData)

  selectedPostForEdit.value = postData
  selectedPost.value = null
  postStore.setCurrentPost(postData)
  contentMode.value = 'edit'
}

async function handleCreatePost() {
  if (!authStore.isAuthenticated) {
    console.error('Not authenticated!')
    return
  }

  try {
    const newPost = await postStore.createPost({
      title: '무제',
      content: '',
      folderId: null,
      status: 'DRAFT',
      visibility: 'PRIVATE',
    })

    folderStore.updateFolderTree()

    selectedPostForEdit.value = newPost
    selectedPost.value = null
    contentMode.value = 'edit'

    // toast.add({
    //   severity: 'success',
    //   summary: '새 글 생성',
    //   detail: '새 글이 생성되었습니다.',
    //   life: 2000,
    // })
  } catch (error) {
    console.error('Failed to create post:', error)
    toast.add({
      severity: 'error',
      summary: '생성 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  }
}

async function handleCreatePostInFolder(folderId) {
  if (!authStore.isAuthenticated) {
    console.error('Not authenticated!')
    return
  }

  try {
    const newPost = await postStore.createPost({
      title: '무제',
      content: '',
      folderId: folderId,
      status: 'DRAFT',
      visibility: 'PRIVATE',
    })

    folderStore.updateFolderTree()

    selectedPostForEdit.value = newPost
    selectedPost.value = null
    contentMode.value = 'edit'

    toast.add({
      severity: 'success',
      summary: '새 글 생성',
      detail: '폴더에 새 글이 생성되었습니다.',
      life: 2000,
    })
  } catch (error) {
    console.error('Failed to create post in folder:', error)
    toast.add({
      severity: 'error',
      summary: '생성 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  }
}

function handleEditPost(post) {
  console.log('[MainView] handleEditPost - 받은 TreeNode:', post)

  const postData = {
    id: post.data.postId || post.id,
    title: post.data.title || post.label || '무제',
    content: post.data.content || '',
    folderId: post.data.folderId,
    status: post.data.status,
    visibility: post.data.visibility,
    createdAt: post.data.createdAt,
    updatedAt: post.data.updatedAt
  }

  console.log('[MainView] handleEditPost - 추출된 postData:', postData)

  selectedPostForEdit.value = postData
  selectedPost.value = null
  contentMode.value = 'edit'
}

function handleCancelEdit() {
  contentMode.value = 'empty'
  selectedPostForEdit.value = null
  selectedPost.value = null
}

function handleDeletePost(post) {
  deleteTarget.value = post
  deleteType.value = 'post'
  confirmDialogMessage.value = `게시글을 삭제하시겠습니까?`
  isConfirmDialogOpen.value = true
}

async function handleSavePost(data) {
  if (!authStore.isAuthenticated) {
    console.error('Not authenticated!')
    return
  }

  const silent = data.silent || false
  console.log('MainView - handleSavePost called with data:', data, 'silent:', silent)

  try {
    if (data.id) {
      console.log('MainView - Auto-saving post:', data.id)

      const saveData = { ...data }
      delete saveData.silent

      await postStore.updatePost(data.id, saveData)

      if (!silent) {
        toast.add({
          severity: 'success',
          summary: '게시글 저장',
          detail: TOAST_MESSAGES.SUCCESS.POST_UPDATED,
          life: 2000,
        })
      }
    } else {
      console.log('MainView - Creating new post (fallback)')

      const saveData = { ...data }
      delete saveData.silent

      await postStore.createPost(saveData)
      toast.add({
        severity: 'success',
        summary: '게시글 작성',
        detail: TOAST_MESSAGES.SUCCESS.POST_CREATED,
        life: 2000,
      })
    }

    folderStore.updateFolderTree()
  } catch (error) {
    console.error('Post save error:', error)
    toast.add({
      severity: 'error',
      summary: '게시글 저장 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  }
}

async function handleMoveFolder(folderId, targetFolderId) {
  console.log('=== MainView handleMoveFolder ===')
  console.log('folderId:', folderId)
  console.log('targetFolderId:', targetFolderId)

  try {
    await folderStore.moveFolder(folderId, targetFolderId)
    console.log('폴더 이동 완료')
  } catch (error) {
    console.error('폴더 이동 실패:', error)
  }
}

async function handleMovePost(postId, targetFolderId) {
  console.log('=== MainView handleMovePost 시작 ===')
  console.log('postId:', postId, 'targetFolderId:', targetFolderId)

  if (!authStore.isAuthenticated) {
    console.warn('Not authenticated')
    return
  }

  try {
    const post = postStore.posts.find(p => p.id === postId)

    if (!post) {
      console.warn('Post not found')
      return
    }

    const updatedPost = await postStore.movePost(postId, targetFolderId)
    console.log('이동 성공:', updatedPost)

    folderStore.updateFolderTree()

    toast.add({
      severity: 'success',
      summary: '이동 완료',
      detail: '게시글이 이동되었습니다.',
      life: 3000,
    })
  } catch (error) {
    console.error('Move post error:', error)
    toast.add({
      severity: 'error',
      summary: '이동 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  }
}

async function handleConfirmDelete() {
  if (!authStore.isAuthenticated) return

  try {
    if (deleteType.value === 'folder') {
      await folderStore.deleteFolder(deleteTarget.value.id)
      toast.add({
        severity: 'success',
        summary: '폴더 삭제',
        detail: TOAST_MESSAGES.SUCCESS.FOLDER_DELETED,
        life: 3000,
      })
    } else if (deleteType.value === 'post') {
      await postStore.deletePost(deleteTarget.value.id)

      folderStore.updateFolderTree()

      toast.add({
        severity: 'success',
        summary: '게시글 삭제',
        detail: TOAST_MESSAGES.SUCCESS.POST_DELETED,
        life: 3000,
      })

      contentMode.value = 'empty'
      selectedPost.value = null
      selectedPostForEdit.value = null
    }
  } catch (error) {
    console.error('Delete error:', error)
    toast.add({
      severity: 'error',
      summary: '삭제 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  }
}

function handleFolderSelected(folder) {
  // 폴더 선택 처리
  console.log('Folder selected:', folder)
}
</script>

<style scoped>
.main-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
