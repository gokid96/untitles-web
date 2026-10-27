<template>
  <Transition name="modal">
    <div v-if="visible" class="auth-modal-overlay" @click.self="$emit('close')">
      <div class="auth-modal" role="dialog" aria-modal="true" aria-label="로그인">
        <button class="close-btn" type="button" aria-label="닫기" @click="$emit('close')">✕</button>
        <!-- 열 때마다 처음 화면부터 -->
        <AuthPanel :key="openCount" initial-step="start"
          @done="$emit('close')" @navigate="$emit('close')" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import AuthPanel from '@/components/auth/AuthPanel.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialMode: { type: String, default: 'login' },
})
defineEmits(['close'])

const openCount = ref(0)
watch(() => props.visible, (value) => {
  if (value) openCount.value++
})
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.auth-modal {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: var(--surface-overlay, #1a1a28);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  padding: 2rem 1.75rem 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 6px;
}
.close-btn:hover { background: var(--surface-hover); color: var(--text-color); }

.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .auth-modal, .modal-leave-to .auth-modal { transform: scale(0.95) translateY(10px); }
</style>
