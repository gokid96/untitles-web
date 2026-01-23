<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="session-modal-overlay">
        <div class="session-modal">
          <div class="modal-icon">
            <i class="pi pi-clock"></i>
          </div>
          <h2 class="modal-title">세션이 만료되었습니다</h2>
          <p class="modal-message">
            보안을 위해 자동으로 로그아웃되었습니다.<br>
            계속하려면 다시 로그인해주세요.
          </p>
          <button class="login-button" @click="handleLogin">
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const visible = computed(() => appStore.isSessionExpired)

async function handleLogin() {
  appStore.hideSessionExpired()
  
  // 인증 데이터 클리어
  authStore.logout()
  
  // 로그인 페이지로 이동
  router.push('/')
}
</script>

<style scoped>
.session-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.session-modal {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: var(--surface-ground);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon i {
  font-size: 2rem;
  color: var(--text-color-secondary);
}

.modal-title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.modal-message {
  margin: 0 0 2rem;
  font-size: 0.9375rem;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.login-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  color: var(--primary-color-text);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .session-modal,
.modal-leave-to .session-modal {
  transform: scale(0.9);
}
</style>
