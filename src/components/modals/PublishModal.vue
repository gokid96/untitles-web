<template>
  <Dialog v-model:visible="dialogVisible" header="공개 설정" :style="{ width: '560px' }" modal class="publish-modal">
    <div class="publish-content" v-if="settings">
      <!-- 전체공개 토글 -->
      <div class="setting-row">
        <div class="setting-info">
          <Globe class="setting-icon" />
          <div>
            <span class="setting-label">워크스페이스 전체 공개</span>
            <span class="setting-desc">모든 게시글이 공개됩니다</span>
          </div>
        </div>
        <InputSwitch v-model="publishAll" />
      </div>

      <!-- 공개 URL -->
      <div v-if="publicUrl" class="url-section">
        <label class="section-label">공개 URL</label>
        <div class="url-row">
          <InputText :value="publicUrl" readonly class="url-input" />
          <Button icon="pi pi-copy" @click="copyUrl" severity="secondary" size="small" title="URL 복사" />
          <Button icon="pi pi-external-link" @click="openUrl" severity="secondary" size="small" title="새 탭에서 열기" />
        </div>
      </div>

      <!-- 개별 설정 (전체공개 아닐 때) -->
      <div v-if="!publishAll" class="individual-section">
        <label class="section-label">공개할 항목 선택</label>

        <div class="tree-container">
          <!-- 루트 게시글 -->
          <div v-for="post in settings.rootPosts" :key="post.postId" class="tree-item">
            <Checkbox
              v-model="selectedRootPostIds"
              :value="post.postId"
              :inputId="'root-' + post.postId"
            />
            <label :for="'root-' + post.postId" class="tree-label">
              <FileText class="tree-icon" />
              {{ post.title || '무제' }}
            </label>
          </div>

          <!-- 폴더 트리 -->
          <PublishFolderNode
            v-for="folder in settings.folders"
            :key="folder.folderId"
            :folder="folder"
            :folder-settings="folderSettingsMap"
            :publish-all-mode="publishAll"
            @update:folder-setting="handleFolderSettingUpdate"
          />
        </div>
      </div>

      <!-- 전체공개 모드일 때 제외 설정 -->
      <div v-if="publishAll" class="exclude-section">
        <label class="section-label">공개에서 제외할 항목</label>
        <p class="section-hint">선택된 항목은 전체공개에서 제외됩니다</p>

        <div class="tree-container">
          <!-- 루트 게시글 제외 -->
          <div v-for="post in settings.rootPosts" :key="'ex-' + post.postId" class="tree-item">
            <Checkbox
              v-model="excludedRootPostIds"
              :value="post.postId"
              :inputId="'ex-root-' + post.postId"
            />
            <label :for="'ex-root-' + post.postId" class="tree-label excluded">
              <EyeOff class="tree-icon" />
              {{ post.title || '무제' }}
            </label>
          </div>

          <!-- 폴더별 제외 -->
          <template v-for="folder in flatFolders" :key="'exf-' + folder.folderId">
            <div class="folder-exclude-header">
              <Folder class="tree-icon" />
              <span>{{ folder.name }}</span>
            </div>
            <div v-for="post in folder.posts" :key="'ex-' + post.postId" class="tree-item indent">
              <Checkbox
                v-model="excludedPostIdsMap[folder.folderId]"
                :value="post.postId"
                :inputId="'ex-' + folder.folderId + '-' + post.postId"
              />
              <label :for="'ex-' + folder.folderId + '-' + post.postId" class="tree-label excluded">
                <EyeOff class="tree-icon" />
                {{ post.title || '무제' }}
              </label>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-else class="loading-state">
      <Loader2 class="loading-spinner" />
      <span>설정을 불러오는 중...</span>
    </div>

    <template #footer>
      <div class="modal-footer">
        <Button label="취소" severity="secondary" outlined @click="dialogVisible = false" />
        <Button label="저장" @click="save" :loading="isSaving" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Globe, FileText, EyeOff, Folder, Loader2 } from 'lucide-vue-next'
import Dialog from 'primevue/dialog'
import InputSwitch from 'primevue/inputswitch'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { publishApi } from '@/api/publishApi'
import PublishFolderNode from '@/components/publish/PublishFolderNode.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible'])

const toast = useToast()
const workspaceStore = useWorkspaceStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const settings = ref(null)
const publishAll = ref(false)
const publicUrl = ref(null)
const selectedRootPostIds = ref([])
const excludedRootPostIds = ref([])
const folderSettingsMap = reactive({})
const excludedPostIdsMap = reactive({})
const isSaving = ref(false)

// 폴더를 플랫하게 펼침 (전체공개 모드 제외 설정용)
const flatFolders = computed(() => {
  if (!settings.value?.folders) return []
  const result = []
  function flatten(folders) {
    for (const f of folders) {
      if (f.posts?.length) result.push(f)
      if (f.children?.length) flatten(f.children)
    }
  }
  flatten(settings.value.folders)
  return result
})

// 모달 열릴 때 데이터 로드
watch(() => props.visible, async (val) => {
  if (!val) return
  settings.value = null

  try {
    const response = await publishApi.getPublishSettings(workspaceStore.currentWorkspaceId)
    const data = response.data
    settings.value = data
    publishAll.value = data.publishAll || false
    publicUrl.value = data.publicUrl

    // 루트 게시글 설정 복원
    selectedRootPostIds.value = data.rootPosts
      ?.filter(p => p.isPublic)
      .map(p => p.postId) || []

    excludedRootPostIds.value = data.rootPosts
      ?.filter(p => p.isExcluded)
      .map(p => p.postId) || []

    // 폴더 설정 복원
    restoreFolderSettings(data.folders)
  } catch {
    toast.add({ severity: 'error', summary: '설정 로드 실패', life: 3000 })
    dialogVisible.value = false
  }
})

function restoreFolderSettings(folders) {
  if (!folders) return
  for (const folder of folders) {
    folderSettingsMap[folder.folderId] = {
      publishAll: folder.publishAll || false,
      publicPostIds: folder.posts?.filter(p => p.isPublic).map(p => p.postId) || [],
      excludedPostIds: folder.posts?.filter(p => p.isExcluded).map(p => p.postId) || [],
    }
    excludedPostIdsMap[folder.folderId] =
      folder.posts?.filter(p => p.isExcluded).map(p => p.postId) || []

    if (folder.children) restoreFolderSettings(folder.children)
  }
}

function handleFolderSettingUpdate({ folderId, key, value }) {
  if (!folderSettingsMap[folderId]) {
    folderSettingsMap[folderId] = { publishAll: false, publicPostIds: [], excludedPostIds: [] }
  }
  folderSettingsMap[folderId][key] = value
}

async function save() {
  isSaving.value = true
  try {
    const folders = buildFolderRequest(settings.value?.folders || [])
    const request = {
      publishAll: publishAll.value,
      publicPostIds: publishAll.value ? [] : selectedRootPostIds.value,
      excludedRootPostIds: publishAll.value ? excludedRootPostIds.value : [],
      folders,
    }

    const response = await publishApi.updatePublishSettings(
      workspaceStore.currentWorkspaceId,
      request,
    )
    publicUrl.value = response.data.publicUrl

    toast.add({ severity: 'success', summary: '공개 설정이 저장되었습니다.', life: 2000 })
    dialogVisible.value = false
  } catch {
    toast.add({ severity: 'error', summary: '저장 실패', life: 3000 })
  } finally {
    isSaving.value = false
  }
}

function buildFolderRequest(folders) {
  const result = []
  for (const folder of folders) {
    const fs = folderSettingsMap[folder.folderId] || {}
    const exMap = excludedPostIdsMap[folder.folderId] || []

    result.push({
      folderId: folder.folderId,
      publishAll: publishAll.value ? false : (fs.publishAll || false),
      publicPostIds: publishAll.value ? [] : (fs.publishAll ? [] : (fs.publicPostIds || [])),
      excludedPostIds: publishAll.value ? exMap : (fs.publishAll ? (fs.excludedPostIds || []) : []),
    })

    if (folder.children?.length) {
      result.push(...buildFolderRequest(folder.children))
    }
  }
  return result
}

function copyUrl() {
  if (!publicUrl.value) return
  navigator.clipboard.writeText(publicUrl.value)
  toast.add({ severity: 'info', summary: 'URL이 복사되었습니다.', life: 1500 })
}

function openUrl() {
  if (!publicUrl.value) return
  window.open(publicUrl.value, '_blank')
}
</script>

<style scoped>
:deep(.publish-modal .p-dialog-content) {
  padding: 0;
}

.publish-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 전체공개 토글 */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 10px;
  border: 1px solid var(--surface-border);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-icon {
  width: 20px;
  height: 20px;
  color: var(--accent-color);
}

.setting-label {
  display: block;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-color);
}

.setting-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin-top: 2px;
}

/* URL */
.url-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-color);
}

.section-hint {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin: -0.25rem 0 0.25rem;
}

.url-row {
  display: flex;
  gap: 0.375rem;
}

.url-input {
  flex: 1;
  font-size: 0.8125rem;
}

/* 트리 */
.tree-container {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 0.5rem;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.tree-item:hover {
  background: var(--surface-hover);
}

.tree-item.indent {
  padding-left: 1.75rem;
}

.tree-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-color);
  cursor: pointer;
}

.tree-label.excluded {
  color: var(--text-color-secondary);
}

.tree-icon {
  width: 14px;
  height: 14px;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.folder-exclude-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-color);
  margin-top: 0.25rem;
}

/* 로딩 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 푸터 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* 개별/제외 섹션 */
.individual-section,
.exclude-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
