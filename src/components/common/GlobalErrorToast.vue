<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="error" class="error-toast" @click="handleDismiss">
        <div class="toast-icon">
          <i class="pi pi-exclamation-circle"></i>
        </div>
        <div class="toast-content">
          <span class="toast-message">{{ error.message }}</span>
        </div>
        <button class="toast-close" @click.stop="handleDismiss">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const error = computed(() => appStore.globalError)

// 5초 후 자동 닫기
watch(error, (newError) => {
  if (newError) {
    setTimeout(() => {
      appStore.clearError()
    }, 5000)
  }
})

function handleDismiss() {
  appStore.clearError()
}
</script>

<style scoped>
.error-toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #dc2626;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
  z-index: 9998;
  max-width: 90%;
  cursor: pointer;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-icon i {
  font-size: 1.25rem;
  color: #ffffff;
}

.toast-content {
  flex: 1;
}

.toast-message {
  font-size: 0.9375rem;
  color: #ffffff;
  font-weight: 500;
}

.toast-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.15s;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.toast-close i {
  font-size: 0.75rem;
}

/* 트랜지션 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
