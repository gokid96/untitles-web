<template>
  <div class="publish-folder-node">
    <!-- 폴더 헤더 -->
    <div class="folder-row">
      <div class="folder-left" @click="toggleExpand">
        <ChevronRight class="chevron" :class="{ rotated: isExpanded }" />
        <Folder class="folder-icon" />
        <span class="folder-name">{{ folder.name }}</span>
      </div>
      <div class="folder-right">
        <label class="mini-toggle">
          <input
            type="checkbox"
            :checked="currentSettings.publishAll"
            @change="toggleFolderPublishAll"
          />
          <span class="toggle-label">전체공개</span>
        </label>
      </div>
    </div>

    <!-- 폴더 내용 -->
    <div v-if="isExpanded" class="folder-children">
      <!-- 게시글 -->
      <div v-for="post in folder.posts" :key="post.postId" class="tree-item">
        <template v-if="currentSettings.publishAll">
          <!-- 전체공개 모드: 제외 체크박스 -->
          <Checkbox
            :modelValue="currentSettings.excludedPostIds"
            :value="post.postId"
            @update:modelValue="(val) => updateSetting('excludedPostIds', val)"
            :inputId="'ex-' + folder.folderId + '-' + post.postId"
          />
          <label :for="'ex-' + folder.folderId + '-' + post.postId" class="tree-label">
            <EyeOff class="tree-icon" />
            <span :class="{ excluded: currentSettings.excludedPostIds?.includes(post.postId) }">
              {{ post.title || '무제' }}
            </span>
            <span v-if="currentSettings.excludedPostIds?.includes(post.postId)" class="tag-excluded">제외됨</span>
          </label>
        </template>
        <template v-else>
          <!-- 개별 공개 모드 -->
          <Checkbox
            :modelValue="currentSettings.publicPostIds"
            :value="post.postId"
            @update:modelValue="(val) => updateSetting('publicPostIds', val)"
            :inputId="'pub-' + folder.folderId + '-' + post.postId"
          />
          <label :for="'pub-' + folder.folderId + '-' + post.postId" class="tree-label">
            <FileText class="tree-icon" />
            {{ post.title || '무제' }}
          </label>
        </template>
      </div>

      <!-- 하위 폴더 (재귀) -->
      <PublishFolderNode
        v-for="child in folder.children"
        :key="child.folderId"
        :folder="child"
        :folder-settings="folderSettings"
        :publish-all-mode="publishAllMode"
        @update:folder-setting="$emit('update:folder-setting', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronRight, Folder, FileText, EyeOff } from 'lucide-vue-next'
import Checkbox from 'primevue/checkbox'

const props = defineProps({
  folder: { type: Object, required: true },
  folderSettings: { type: Object, required: true },
  publishAllMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:folder-setting'])

const isExpanded = ref(false)

const currentSettings = computed(() => {
  return props.folderSettings[props.folder.folderId] || {
    publishAll: false,
    publicPostIds: [],
    excludedPostIds: [],
  }
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function toggleFolderPublishAll(e) {
  emit('update:folder-setting', {
    folderId: props.folder.folderId,
    key: 'publishAll',
    value: e.target.checked,
  })
}

function updateSetting(key, value) {
  emit('update:folder-setting', {
    folderId: props.folder.folderId,
    key,
    value,
  })
}
</script>

<style scoped>
.publish-folder-node {
  margin-top: 2px;
}

.folder-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.folder-row:hover {
  background: var(--surface-hover);
}

.folder-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.chevron {
  width: 14px;
  height: 14px;
  color: var(--text-color-secondary);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(90deg);
}

.folder-icon {
  width: 15px;
  height: 15px;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.folder-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-right {
  flex-shrink: 0;
}

.mini-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  font-size: 0.6875rem;
  color: var(--text-color-secondary);
}

.mini-toggle input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--accent-color);
  cursor: pointer;
}

.toggle-label {
  white-space: nowrap;
}

.folder-children {
  padding-left: 1.25rem;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.325rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.tree-item:hover {
  background: var(--surface-hover);
}

.tree-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-color);
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.tree-icon {
  width: 14px;
  height: 14px;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.excluded {
  color: var(--text-color-secondary);
  text-decoration: line-through;
}

.tag-excluded {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>
