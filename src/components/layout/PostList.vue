<template>
  <div class="post-list">
    <!-- <div class="post-list-header">
      <h3>{{ headerTitle }}</h3>
    </div> -->

    <div class="post-list-content" @contextmenu="handleEmptyContextMenu">
      <DataView :value="displayPosts" :loading="isLoading" layout="grid">
        <template #empty>
          <div empty-message=""></div>
        </template>

        <template #grid="slotProps">
          <div class="grid">
            <div v-for="post in slotProps.items" :key="post.id" class="col-12 md:col-6 lg:col-4">
              <div class="post-card" @click="handlePostClick(post)" @contextmenu="handlePostContextMenu($event, post)">
                <div class="post-card-header">
                  <h4>{{ post.title }}</h4>
                  <i v-if="post.isPublic" class="pi pi-globe" v-tooltip.left="'공개'"></i>
                  <i v-else class="pi pi-lock" v-tooltip.left="'비공개'"></i>
                </div>
                <div class="post-card-content">
                  <p>{{ getPreviewText(post.content) }}</p>
                </div>
                <div class="post-card-footer">
                  <small>{{ formatDate(post.updatedAt || post.createdAt) }}</small>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>

      <Paginator v-if="totalPages > 1" :rows="pageSize" :totalRecords="totalElements" :first="currentPage * pageSize"
        @page="handlePageChange" />
    </div>

    <ContextMenu ref="contextMenu" :model="contextMenuItems" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DataView from 'primevue/dataview'
import Paginator from 'primevue/paginator'
import ContextMenu from 'primevue/contextmenu'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, getPreview } from '@/utils/helpers'

const postStore = usePostStore()
const authStore = useAuthStore()

const isLoading = ref(false)
const contextMenu = ref(null)
const contextMenuItems = ref([])
const selectedPost = ref(null)

const emit = defineEmits(['postSelected', 'createPost', 'editPost', 'deletePost'])

const displayPosts = computed(() => postStore.filteredPosts)
const currentPage = computed(() => postStore.pagination.page)
const pageSize = computed(() => postStore.pagination.size)
const totalPages = computed(() => postStore.pagination.totalPages)
const totalElements = computed(() => postStore.pagination.totalElements)

onMounted(async () => {
  await loadPosts()
})

async function loadPosts(page = 0) {
  isLoading.value = true
  try {
    if (authStore.isAuthenticated) {
      await postStore.fetchMyPosts(page, pageSize.value)
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    isLoading.value = false
  }
}

function handlePageChange(event) {
  loadPosts(event.page)
}

function handlePostClick(post) {
  emit('postSelected', post)
}

function handleCreatePost() {
  emit('createPost')
}

function handlePostContextMenu(event, post) {
  event.preventDefault()
  selectedPost.value = post
  contextMenuItems.value = getPostContextMenuItems(post)
  contextMenu.value.show(event)
}

function handleEmptyContextMenu(event) {
  // 게시글이 아닌 빈 공간을 우클릭한 경우
  const target = event.target
  if (
    target.classList.contains('post-list-content') ||
    target.classList.contains('empty-message')
  ) {
    event.preventDefault()
    contextMenuItems.value = [
      {
        label: '새 글쓰기',
        icon: 'pi pi-plus',
        command: () => {
          handleCreatePost()
        },
      },
    ]
    contextMenu.value.show(event)
  }
}

function getPostContextMenuItems(post) {
  return [
    {
      label: '열기',
      icon: 'pi pi-eye',
      command: () => {
        emit('postSelected', post)
      },
    },
    {
      label: '수정',
      icon: 'pi pi-pencil',
      command: () => {
        emit('editPost', post)
      },
    },
    {
      separator: true,
    },
    {
      label: '삭제',
      icon: 'pi pi-trash',
      command: () => {
        emit('deletePost', post)
      },
    },
  ]
}

function getPreviewText(content) {
  return getPreview(content, 3)
}
</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--surface-ground);
}

.post-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.post-list-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.post-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.post-card {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.dark-mode .post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.post-card-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-card-header i {
  margin-left: 0.5rem;
  font-size: 1rem;
  color: var(--text-color-secondary);
}

.post-card-content {
  margin-bottom: 1rem;
}

.post-card-content p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-card-footer small {
  color: var(--text-color-secondary);
}

.empty-message {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color-secondary);
}
</style>
