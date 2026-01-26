<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container" ref="modalRef">
          <div class="modal-icon">
            <Trash2 class="icon" />
          </div>
          <h3 class="modal-title">{{ header || '삭제 확인' }}</h3>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="handleCancel">
              취소
            </button>
            <button ref="confirmBtnRef" class="btn btn-danger" @click="handleConfirm">
              삭제
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  header: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '정말 삭제하시겠습니까?',
  },
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const modalRef = ref(null)
const confirmBtnRef = ref(null)

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

// 키보드 이벤트
function handleKeydown(e) {
  if (!props.visible) return
  
  if (e.key === 'Escape') {
    e.preventDefault()
    handleCancel()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    handleConfirm()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeydown)
    // 모달이 열리면 삭제 버튼에 포커스
    nextTick(() => {
      confirmBtnRef.value?.focus()
    })
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  padding: 2rem;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1.25rem;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .modal-icon {
  background: rgba(239, 68, 68, 0.2);
}

.modal-icon .icon {
  width: 24px;
  height: 24px;
  color: #ef4444;
}

.modal-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.modal-message {
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
  color: var(--text-color-secondary);
  line-height: 1.5;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  padding: 0.625rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: var(--surface-hover);
  color: var(--text-color);
}

.btn-secondary:hover {
  background: var(--surface-border);
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
}

.btn-danger:hover {
  background: #dc2626;
}

/* 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
