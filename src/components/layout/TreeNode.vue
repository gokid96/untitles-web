<template>
  <div class="tree-node">
    <div class="tree-node-item" :class="{
      'tree-node-selected': isSelected,
      'tree-node-folder': node.type === 'folder',
      'tree-node-post': node.type === 'post',
      'tree-node-drag-over': isDragOver
    }" :draggable="!isEditing" @click="handleClick" @contextmenu.prevent="handleContextMenu"
      @dragstart="handleDragStart" @dragover.prevent="handleDragOver" @drop.prevent="handleDrop"
      @dragleave="handleDragLeave" @dragend="handleDragEnd">

      <span class="tree-node-toggle" @click.stop="toggleExpand" v-if="node.type === 'folder'">
        <i :class="isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
      </span>
      <span class="tree-node-icon"></span>

      <!-- 인라인 편집 모드 -->
      <input v-if="isEditing" ref="editInput" v-model="editingName" class="tree-node-edit-input" @blur="finishEditing"
        @keydown.enter="finishEditing" @keydown.escape="cancelEditing" @click.stop />
      <span v-else class="tree-node-label">{{ node.label }}</span>
    </div>

    <!-- 하위 노드 + 세로선 -->
    <div class="tree-node-children" v-if="isExpanded && node.children && node.children.length > 0">
      <TreeNode v-for="child in node.children" :key="child.key" :node="child" :selected-key="selectedKey"
        :editing-key="editingKey" :expand-all="expandAll" @node-click="$emit('node-click', $event)"
        @node-context-menu="$emit('node-context-menu', $event)" @node-drag-start="$emit('node-drag-start', $event)"
        @node-drop="$emit('node-drop', $event)" @node-rename="$emit('node-rename', $event)" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

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
})

const emit = defineEmits(['node-click', 'node-context-menu', 'node-drag-start', 'node-drop', 'node-rename'])

const isExpanded = ref(true)

// expandAll prop이 변경되면 모든 폴더 열기/닫기
watch(() => props.expandAll, (newVal) => {
  if (newVal !== null && props.node.type === 'folder') {
    isExpanded.value = newVal
  }
})
const isDragOver = ref(false)
const editInput = ref(null)
const editingName = ref('')

const isSelected = computed(() => props.selectedKey === props.node.key)
const isEditing = computed(() => props.editingKey === props.node.key)

// 편집 모드 진입 시 input에 포커스
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
    emit('node-rename', { node: props.node, newName: null }) // 취소
  }
}

function cancelEditing() {
  emit('node-rename', { node: props.node, newName: null })
}

function handleDragStart(event) {
  emit('node-drag-start', { node: props.node, event })
}

function handleDragOver(event) {
  if (props.node.type === 'folder') {
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
  position: relative;
  /* 👈 추가 */
}

.tree-node-children {
  margin-left: 1.5rem;
  position: relative;
  /* 👈 추가 */
}

/* 세로선 추가 */
.tree-node-children::before {
  content: '';
  position: absolute;
  left: -0.70rem;
  top: 0;
  bottom: 0.5rem;
  width: 1px;
  background-color: darkgray;
}

.tree-node-item {
  display: flex;
  align-items: center;
  padding: 0.2rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tree-node-item:hover {
  background-color: var(--surface-hover);
}

.tree-node-item.tree-node-selected {
  background-color: var(--highlight-bg);
  color: var(--highlight-text-color);
}

.tree-node-toggle {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.25rem;
  cursor: pointer;
}

.tree-node-toggle i {
  font-size: 0.75rem;
}

.tree-node-label {
  flex: 1;
}

.tree-node-drag-over {
  background-color: var(--primary-color) !important;
  opacity: 0.3;
}

.tree-node-edit-input {
  flex: 1;
  padding: 0.1rem 0.3rem;
  border: 1px solid var(--primary-color);
  border-radius: 3px;
  background-color: var(--surface-ground);
  color: var(--text-color);
  font-size: inherit;
  outline: none;
  min-width: 0;
}

.tree-node-edit-input:focus {
  box-shadow: 0 0 0 2px var(--primary-color-transparent, rgba(var(--primary-color), 0.2));
}
</style>
