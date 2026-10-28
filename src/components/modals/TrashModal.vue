<template>
  <Dialog
    :visible="visible"
    header="휴지통"
    :modal="true"
    :closable="true"
    :style="{ width: '440px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <p class="trash-hint">삭제한 폴더와 노트는 {{ retentionDays }}일 동안 보관된 뒤 자동으로 영구 삭제됩니다.</p>

    <div v-if="isLoading" class="trash-empty">불러오는 중...</div>
    <div v-else-if="isEmpty" class="trash-empty">휴지통이 비어 있습니다</div>

    <ul v-else class="trash-list">
      <li v-for="item in items" :key="item.type + item.id" class="trash-item">
        <component :is="item.type === 'folder' ? FolderIcon : FileText" class="trash-icon" />
        <div class="trash-info">
          <span class="trash-name">{{ item.name || '무제' }}</span>
          <span class="trash-meta">
            {{ formatDate(item.deletedAt) }} 삭제
            <template v-if="item.type === 'folder' && item.postCount"> · 노트 {{ item.postCount }}개 포함</template>
          </span>
        </div>
        <template v-if="canWrite">
          <button class="trash-btn" :disabled="busyKey === item.type + item.id" title="복구" @click="restore(item)">
            <RotateCcw class="btn-icon" />
          </button>
          <button
            class="trash-btn danger"
            :disabled="busyKey === item.type + item.id"
            :title="confirmKey === item.type + item.id ? '한 번 더 누르면 영구 삭제' : '영구 삭제'"
            @click="removeForever(item)"
          >
            <Trash2 class="btn-icon" />
            <span v-if="confirmKey === item.type + item.id" class="confirm-text">영구 삭제</span>
          </button>
        </template>
      </li>
    </ul>

    <template #footer>
      <Button
        v-if="!isEmpty && canWrite"
        :label="confirmEmpty ? '정말 비우기 (되돌릴 수 없음)' : '휴지통 비우기'"
        severity="danger"
        text
        :loading="isEmptying"
        @click="emptyTrash"
      />
      <Button label="닫기" text @click="emit('update:visible', false)" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { Folder as FolderIcon, FileText, RotateCcw, Trash2 } from 'lucide-vue-next'
import { trashApi } from '@/api/trashApi'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useFolderStore } from '@/stores/folderStore'
import { useGraphStore } from '@/stores/graphStore'
import { getErrorMessage } from '@/utils/helpers'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible'])

const toast = useToast()
const workspaceStore = useWorkspaceStore()
const folderStore = useFolderStore()
const graphStore = useGraphStore()

const folders = ref([])
const posts = ref([])
const retentionDays = ref(30)
const isLoading = ref(false)
const isEmptying = ref(false)
const busyKey = ref(null)
const confirmKey = ref(null)
const confirmEmpty = ref(false)

const canWrite = computed(() => workspaceStore.currentWorkspace?.myRole !== 'VIEWER')

const items = computed(() =>
  [
    ...folders.value.map((f) => ({ ...f, type: 'folder' })),
    ...posts.value.map((p) => ({ ...p, type: 'post' })),
  ].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
)
const isEmpty = computed(() => items.value.length === 0)

watch(
  () => props.visible,
  (open) => {
    if (open) {
      confirmKey.value = null
      confirmEmpty.value = false
      load()
    }
  },
  { immediate: true }, // 열 때 처음 불러와도(지연 로딩) 초기화되도록
)

async function load() {
  const workspaceId = workspaceStore.currentWorkspaceId
  if (!workspaceId) return
  isLoading.value = true
  try {
    const { data } = await trashApi.getTrash(workspaceId)
    folders.value = data.folders || []
    posts.value = data.posts || []
    retentionDays.value = data.retentionDays || 30
  } catch (error) {
    toast.add({ severity: 'error', summary: '휴지통을 불러오지 못했습니다', detail: getErrorMessage(error), life: 3000 })
  } finally {
    isLoading.value = false
  }
}

// 복구·영구 삭제 후 사이드바 트리, 개수, 그래프를 다시 불러온다
async function refreshWorkspace() {
  await Promise.allSettled([
    folderStore.loadWorkspaceTree(),
    workspaceStore.loadWorkspaces(),
    graphStore.load(true),
  ])
}

async function restore(item) {
  const workspaceId = workspaceStore.currentWorkspaceId
  busyKey.value = item.type + item.id
  try {
    if (item.type === 'folder') {
      await trashApi.restoreFolder(workspaceId, item.id)
    } else {
      await trashApi.restorePost(workspaceId, item.id)
    }
    toast.add({ severity: 'success', summary: '복구했습니다', detail: item.name || '무제', life: 2000 })
    await Promise.all([load(), refreshWorkspace()])
  } catch (error) {
    toast.add({ severity: 'error', summary: '복구 실패', detail: getErrorMessage(error), life: 3000 })
  } finally {
    busyKey.value = null
  }
}

async function removeForever(item) {
  const key = item.type + item.id
  // 실수 방지: 한 번 더 눌러야 영구 삭제
  if (confirmKey.value !== key) {
    confirmKey.value = key
    return
  }
  const workspaceId = workspaceStore.currentWorkspaceId
  busyKey.value = key
  try {
    if (item.type === 'folder') {
      await trashApi.deleteFolder(workspaceId, item.id)
    } else {
      await trashApi.deletePost(workspaceId, item.id)
    }
    confirmKey.value = null
    await load()
  } catch (error) {
    toast.add({ severity: 'error', summary: '삭제 실패', detail: getErrorMessage(error), life: 3000 })
  } finally {
    busyKey.value = null
  }
}

async function emptyTrash() {
  if (!confirmEmpty.value) {
    confirmEmpty.value = true
    return
  }
  isEmptying.value = true
  try {
    await trashApi.empty(workspaceStore.currentWorkspaceId)
    confirmEmpty.value = false
    await load()
  } catch (error) {
    toast.add({ severity: 'error', summary: '비우기 실패', detail: getErrorMessage(error), life: 3000 })
  } finally {
    isEmptying.value = false
  }
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.trash-hint {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
}

.trash-empty {
  padding: 2rem 0;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.trash-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 50vh;
  overflow-y: auto;
}

.trash-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid var(--surface-border);
}

.trash-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--text-color-secondary);
}

.trash-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.trash-name {
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trash-meta {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.trash-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
}

.trash-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text-color);
}

.trash-btn.danger:hover:not(:disabled),
.trash-btn.danger .confirm-text {
  color: var(--red-500, #ef4444);
}

.trash-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.confirm-text {
  font-size: 0.75rem;
}
</style>
