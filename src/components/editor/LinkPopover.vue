<template>
  <div 
    v-if="visible" 
    class="link-popover"
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
    ref="popoverRef"
  >
    <div class="link-input-wrapper">
      <i class="pi pi-link"></i>
      <input
        ref="inputRef"
        v-model="url"
        type="text"
        placeholder="URL을 입력하세요"
        @keydown.enter="handleSubmit"
        @keydown.escape="handleClose"
      />
      <button class="btn-submit" @click="handleSubmit" title="적용">
        <i class="pi pi-check"></i>
      </button>
    </div>
    <div class="link-actions" v-if="isEditing">
      <button class="btn-action" @click="handleOpen" title="새 탭에서 열기">
        <i class="pi pi-external-link"></i>
        <span>열기</span>
      </button>
      <button class="btn-action btn-danger" @click="handleRemove" title="링크 삭제">
        <i class="pi pi-trash"></i>
        <span>삭제</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialUrl: { type: String, default: '' },
  position: { type: Object, default: () => ({ top: 0, left: 0 }) }
})

const emit = defineEmits(['submit', 'remove', 'close'])

const url = ref('')
const inputRef = ref(null)
const popoverRef = ref(null)
const isEditing = ref(false)

// visible 변경 시 초기화
watch(() => props.visible, (newVal) => {
  if (newVal) {
    url.value = props.initialUrl || ''
    isEditing.value = !!props.initialUrl
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }
})

// 외부 클릭 감지
function handleClickOutside(e) {
  if (props.visible && popoverRef.value && !popoverRef.value.contains(e.target)) {
    handleClose()
  }
}

function handleSubmit() {
  if (url.value.trim()) {
    // http:// 또는 https:// 없으면 추가
    let finalUrl = url.value.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }
    emit('submit', finalUrl)
  }
  handleClose()
}

function handleRemove() {
  emit('remove')
  handleClose()
}

function handleOpen() {
  if (url.value) {
    let finalUrl = url.value.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }
    window.open(finalUrl, '_blank')
  }
}

function handleClose() {
  emit('close')
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.link-popover {
  position: fixed;
  z-index: 1000;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  min-width: 280px;
}

.link-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  background: var(--surface-ground);
  border-radius: 6px;
}

.link-input-wrapper i {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  padding-left: 0.25rem;
}

.link-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-color);
  padding: 0.5rem 0.25rem;
}

.link-input-wrapper input::placeholder {
  color: var(--text-color-secondary);
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-submit:hover {
  opacity: 0.9;
}

.link-actions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--surface-border);
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 0.8125rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-action:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.btn-action.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-action i {
  font-size: 0.8125rem;
}
</style>
