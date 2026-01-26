<template>
  <div class="tree-node">
    <div
      class="tree-node-item"
      :class="{
        'selected': isSelected,
        'folder': node.type === 'folder',
        'post': node.type === 'post',
        'drag-over': isDragOver
      }"
      :draggable="!isEditing"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu"
      @dragstart="handleDragStart"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
      @dragleave="handleDragLeave"
      @dragend="handleDragEnd"
    >
      <!-- 토글 아이콘 -->
      <span class="toggle-icon" @click.stop="toggleExpand" v-if="node.type === 'folder'">
        <ChevronDown v-if="isExpanded" class="toggle-chevron" />
        <ChevronRight v-else class="toggle-chevron" />
      </span>
      <span class="toggle-icon" v-else></span>

      <!-- 아이콘 -->
      <span class="node-icon">
        <FolderOpen v-if="node.type === 'folder' && isExpanded" class="folder-icon" />
        <Folder v-else-if="node.type === 'folder'" class="folder-icon" />
        <FileText v-else class="file-icon" />
      </span>

      <!-- 라벨 / 편집 -->
      <input
        v-if="isEditing"
        ref="editInput"
        v-model="editingName"
        class="edit-input"
        @blur="finishEditing"
        @keydown.enter="finishEditing"
        @keydown.escape="cancelEditing"
        @click.stop
      />
      <span v-else class="node-label">{{ node.label }}</span>
    </div>

    <!-- 하위 노드 -->
    <div class="tree-node-children" v-if="isExpanded && node.children && node.children.length > 0">
      <TreeNode
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :selected-key="selectedKey"
        :editing-key="editingKey"
        :expand-all="expandAll"
        :dragged-node="draggedNode"
        :folder-parent-map="folderParentMap"
        @node-click="$emit('node-click', $event)"
        @node-context-menu="$emit('node-context-menu', $event)"
        @node-drag-start="$emit('node-drag-start', $event)"
        @node-drop="$emit('node-drop', $event)"
        @node-rename="$emit('node-rename', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText } from 'lucide-vue-next'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  selectedKey: {
    type: String,
    default: null,
  },
  editingKey: {
    type: String,
    default: null,
  },
  expandAll: {
    type: Boolean,
    default: null,
  },
  draggedNode: {
    type: Object,
    default: null,
  },
  folderParentMap: {
    type: Map,
    default: () => new Map(),
  },
})

const emit = defineEmits(['node-click', 'node-context-menu', 'node-drag-start', 'node-drop', 'node-rename'])

const isExpanded = ref(true)
const isDragOver = ref(false)
const editInput = ref(null)
const editingName = ref('')

const isSelected = computed(() => props.selectedKey === props.node.key)
const isEditing = computed(() => props.editingKey === props.node.key)

watch(() => props.expandAll, (newVal) => {
  if (newVal !== null && props.node.type === 'folder') {
    isExpanded.value = newVal
  }
})

watch(isEditing, async (newVal) => {
  if (newVal) {
    editingName.value = props.node.label
    await nextTick()
    editInput.value?.focus()
    editInput.value?.select()
  }
})

function toggleExpand() {
  if (props.node.type === 'folder') {
    isExpanded.value = !isExpanded.value
  }
}

function handleClick() {
  emit('node-click', props.node)
}

function handleContextMenu(event) {
  emit('node-context-menu', { node: props.node, originalEvent: event })
}

function finishEditing() {
  const newName = editingName.value.trim()
  if (newName && newName !== props.node.label) {
    emit('node-rename', { node: props.node, newName })
  } else {
    emit('node-rename', { node: props.node, newName: null })
  }
}

function cancelEditing() {
  emit('node-rename', { node: props.node, newName: null })
}

function handleDragStart(event) {
  emit('node-drag-start', { node: props.node, event })
}

// 드롭 가능 여부 확인
function canDropHere() {
  if (props.node.type !== 'folder') return false
  if (!props.draggedNode) return true
  
  const targetFolderId = props.node.id
  
  // 게시글은 폴더로 이동 가능
  if (props.draggedNode.type === 'post') return true
  
  // 폴더인 경우
  const draggedFolderId = props.draggedNode.id
  const currentParentId = props.draggedNode.data?.parentId
  
  // 자기 자신
  if (draggedFolderId === targetFolderId) return false
  // 이미 같은 부모
  if (currentParentId === targetFolderId) return false
  // 하위 폴더인지 확인
  let currentId = targetFolderId
  const visited = new Set()
  while (currentId) {
    if (visited.has(currentId)) break
    visited.add(currentId)
    if (currentId === draggedFolderId) return false
    currentId = props.folderParentMap.get(currentId)
  }
  
  return true
}

function handleDragOver(event) {
  if (props.node.type === 'folder' && canDropHere()) {
    isDragOver.value = true
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(event) {
  if (props.node.type === 'folder') {
    isDragOver.value = false
    event.stopPropagation()
    emit('node-drop', { targetNode: props.node, event })
  }
}

function handleDragEnd() {
  isDragOver.value = false
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  margin: 0.5px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.tree-node-item:hover {
  background-color: var(--surface-hover);
}

.tree-node-item.selected {
  background-color: var(--highlight-bg);
}

.tree-node-item.drag-over {
  background-color: var(--primary-color);
  opacity: 0.2;
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 18px;
  flex-shrink: 0;
}

.toggle-chevron {
  width: 12px;
  height: 12px;
  color: var(--text-color-secondary);
  transition: transform 0.15s;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.folder-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.file-icon {
  width: 16px;
  height: 16px;
  color: var(--text-color-secondary);
}

.node-label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-input {
  flex: 1;
  padding: 0.125rem 0.375rem;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  background-color: var(--surface-ground);
  color: var(--text-color);
  font-size: 0.875rem;
  outline: none;
  min-width: 0;
}

.edit-input:focus {
  box-shadow: 0 0 0 2px var(--focus-ring-alpha);
}

.tree-node-children {
  margin-left: 1.25rem;
  position: relative;
}

.tree-node-children::before {
  content: '';
  position: absolute;
  left: -0.350rem;
  top: 0;
  bottom: 0.5rem;
  width: 1px;
  background-color: var(--surface-border);
}
</style>
