<template>
  <div class="post-viewer">
    <div class="viewer-header">
      <h1>{{ post?.title || '제목 없음' }}</h1>
      <div class="viewer-actions">
        <Button label="수정" @click="handleEdit" severity="secondary">
          <template #icon>
            <Pencil class="btn-icon" />
          </template>
        </Button>
        <Button label="삭제" @click="handleDelete" severity="danger">
          <template #icon>
            <Trash2 class="btn-icon" />
          </template>
        </Button>
      </div>
    </div>

    <div class="post-meta">
      <div class="meta-item">
        <Calendar class="meta-icon" />
        <span>작성: {{ formatDate(post?.createdAt) }}</span>
      </div>
      <div class="meta-item">
        <Clock class="meta-icon" />
        <span>수정: {{ formatDate(post?.updatedAt) }}</span>
      </div>
      <div v-if="post?.folderId" class="meta-item">
        <Folder class="meta-icon" />
        <span>{{ getFolderName(post.folderId) }}</span>
      </div>
      <div class="meta-item">
        <Globe v-if="post?.isPublic" class="meta-icon" />
        <Lock v-else class="meta-icon" />
        <span>{{ post?.isPublic ? '공개' : '비공개' }}</span>
      </div>
    </div>

    <Divider />

    <div class="post-content">
      <pre>{{ post?.content }}</pre>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Clock, Folder, Globe, Lock, Pencil, Trash2 } from 'lucide-vue-next'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import { useFolderStore } from '@/stores/folderStore'
import { formatDate } from '@/utils/helpers'

const props = defineProps({
  post: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['edit', 'delete'])

const folderStore = useFolderStore()

function handleEdit() {
  emit('edit', props.post)
}

function handleDelete() {
  emit('delete', props.post)
}

function getFolderName(folderId) {
  const folder = folderStore.folders.find((f) => f.id === folderId)
  return folder?.name || '알 수 없음'
}
</script>

<style scoped>
.post-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--surface-card);
  overflow-y: auto;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid var(--surface-border);
}

.viewer-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  flex: 1;
}

.viewer-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1rem 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.post-content {
  flex: 1;
  padding: 2rem;
  line-height: 1.8;
}

.post-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
  font-size: 1rem;
}
</style>
