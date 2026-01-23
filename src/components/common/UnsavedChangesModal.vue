<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container">
          <div class="modal-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <h3 class="modal-title">저장되지 않은 변경사항</h3>
          <p class="modal-message">
            변경사항이 저장되지 않았습니다.<br>
            저장하지 않고 나가시겠습니까?
          </p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="handleCancel">
              취소
            </button>
            <button class="btn btn-danger" @click="handleDiscard">
              저장 안 함
            </button>
            <button class="btn btn-primary" @click="handleSave">
              저장
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'save', 'discard', 'cancel'])

function handleSave() {
  emit('save')
}

function handleDiscard() {
  emit('discard')
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

// 키보드 이벤트
function handleKeydown(e) {
  if (!props.visible) return
  
  if (e.key === 'Escape') {
    handleCancel()
  } else if (e.key === 'Enter') {
    handleSave()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

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
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1.25rem;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .modal-icon {
  background: rgba(245, 158, 11, 0.2);
}

.modal-icon i {
  font-size: 1.5rem;
  color: #f59e0b;
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
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  padding: 0.625rem 1.25rem;
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
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-danger:hover {
  background: #ef4444;
  color: #ffffff;
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
