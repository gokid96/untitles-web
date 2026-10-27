<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container">
          <div class="modal-icon" :class="variant">
            <component :is="icon || Trash2" class="icon" />
          </div>
          <h3 class="modal-title">{{ title }}</h3>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="handleCancel">
              {{ cancelLabel }}
            </button>
            <button ref="confirmBtnRef" class="btn" :class="variant === 'danger' ? 'btn-danger' : 'btn-primary'"
              @click="handleConfirm">
              {{ confirmLabel }}
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
  message: {
    type: String,
    default: '정말 삭제하시겠습니까?',
  },
  title: { type: String, default: '삭제 확인' },
  confirmLabel: { type: String, default: '삭제' },
  cancelLabel: { type: String, default: '취소' },
  // danger(빨강) | primary
  variant: { type: String, default: 'danger' },
  icon: { type: [Object, Function], default: null },
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

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
  
  // 아래에 열린 다른 창(워크스페이스 설정 등)이 같은 키로 닫히지 않도록 여기서 멈춘다
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopImmediatePropagation()
    handleCancel()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    e.stopImmediatePropagation()
    handleConfirm()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    window.addEventListener('keydown', handleKeydown, true)
    // 모달이 열리면 확인 버튼에 포커스
    nextTick(() => {
      confirmBtnRef.value?.focus()
    })
  } else {
    window.removeEventListener('keydown', handleKeydown, true)
  }
}, { immediate: true })

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown, true)
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

.modal-icon.primary {
  background: var(--surface-hover);
}

.modal-icon.primary .icon {
  color: var(--text-color);
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

.btn-primary {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

.btn-primary:hover {
  opacity: 0.9;
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
