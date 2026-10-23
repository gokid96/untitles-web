<template>
  <div class="note-link-list" role="listbox">
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        type="button"
        class="note-link-item"
        :class="{ active: index === selectedIndex }"
        role="option"
        :aria-selected="index === selectedIndex"
        @mousedown.prevent="select(index)"
        @mouseenter="selectedIndex = index"
      >
        <FileText class="item-icon" />
        <span class="item-title">{{ item.title }}</span>
      </button>
    </template>
    <div v-else class="note-link-empty">{{ emptyText }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { FileText } from 'lucide-vue-next'

const props = defineProps({
  items: { type: Array, required: true },
  command: { type: Function, required: true },
  emptyText: { type: String, default: '일치하는 노트가 없습니다' },
})

const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

function select(index) {
  const item = props.items[index]
  if (item) props.command(item)
}

// TipTap Suggestion이 키 입력을 전달한다. 처리했으면 true
function onKeyDown({ event }) {
  if (!props.items.length) return false
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }
  if (event.key === 'Enter' || event.key === 'Tab') {
    select(selectedIndex.value)
    return true
  }
  return false
}

defineExpose({ onKeyDown })
</script>

<style scoped>
.note-link-list {
  min-width: 220px;
  max-width: 320px;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
  background: var(--surface-overlay, #1f1f1f);
  border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.note-link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-color, #e5e5e5);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
}

.note-link-item.active {
  background: var(--surface-hover, rgba(255, 255, 255, 0.08));
}

.item-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.6;
}

.item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-link-empty {
  padding: 8px;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #888);
}
</style>
