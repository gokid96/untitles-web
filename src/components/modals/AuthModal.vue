<template>
  <Transition name="modal">
    <div v-if="visible" class="auth-modal-overlay" @click.self="$emit('close')">
      <div class="auth-modal">
          <button class="close-btn" @click="$emit('close')">✕</button>

          <div class="modal-logo">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M50 8 C52 30 58 36 80 38 C58 40 52 46 50 68 C48 46 42 40 20 38 C42 36 48 30 50 8 Z"/>
              <path fill="currentColor" d="M50 50 C51 62 54 65 66 66 C54 67 51 70 50 82 C49 70 46 67 34 66 C46 65 49 62 50 50 Z"/>
              <path fill="currentColor" opacity="0.5" d="M78 70 C78.5 76 80 77.5 86 78 C80 78.5 78.5 80 78 86 C77.5 80 76 78.5 70 78 C76 77.5 77.5 76 78 70 Z"/>
            </svg>
            <span>Untitles</span>
          </div>

          <div class="auth-tabs">
            <button :class="{ active: mode === 'login' }" @click="mode = 'login'">로그인</button>
            <button :class="{ active: mode === 'register' }" @click="mode = 'register'">회원가입</button>
          </div>

          <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label>아이디</label>
              <input v-model="loginForm.loginId" type="text" placeholder="아이디를 입력하세요" :class="{ invalid: loginErrors.loginId }" />
              <small v-if="loginErrors.loginId">{{ loginErrors.loginId }}</small>
            </div>
            <div class="form-group">
              <label>비밀번호</label>
              <input v-model="loginForm.password" type="password" placeholder="비밀번호를 입력하세요" :class="{ invalid: loginErrors.password }" />
              <small v-if="loginErrors.password">{{ loginErrors.password }}</small>
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? '로그인 중...' : '로그인' }}
            </button>
          </form>

          <form v-else @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label>아이디</label>
              <input v-model="registerForm.loginId" type="text" placeholder="아이디를 입력하세요" :class="{ invalid: registerErrors.loginId }" />
              <small v-if="registerErrors.loginId">{{ registerErrors.loginId }}</small>
            </div>
            <div class="form-group">
              <label>닉네임</label>
              <input v-model="registerForm.nickname" type="text" placeholder="닉네임을 입력하세요" :class="{ invalid: registerErrors.nickname }" />
              <small v-if="registerErrors.nickname">{{ registerErrors.nickname }}</small>
            </div>
            <div class="form-group">
              <label>비밀번호</label>
              <input v-model="registerForm.password" type="password" placeholder="비밀번호를 입력하세요" :class="{ invalid: registerErrors.password }" />
              <small v-if="registerErrors.password">{{ registerErrors.password }}</small>
            </div>
            <div class="form-group">
              <label>비밀번호 확인</label>
              <input v-model="registerForm.passwordConfirm" type="password" placeholder="비밀번호를 다시 입력하세요" :class="{ invalid: registerErrors.passwordConfirm }" />
              <small v-if="registerErrors.passwordConfirm">{{ registerErrors.passwordConfirm }}</small>
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? '가입 중...' : '회원가입' }}
            </button>
          </form>

          <div class="divider"><span>또는</span></div>

          <div class="social-login">
            <button @click="socialLogin('google')" class="social-btn google">
              <svg viewBox="0 0 24 24" class="social-icon">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속하기
            </button>
            <button @click="socialLogin('kakao')" class="social-btn kakao">
              <svg viewBox="0 0 24 24" class="social-icon">
                <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              카카오로 계속하기
            </button>
            <button @click="socialLogin('naver')" class="social-btn naver">
              <svg viewBox="0 0 24 24" class="social-icon">
                <path fill="#ffffff" d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 계속하기
            </button>
          </div>
        </div>
      </div>
    </Transition>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostStore } from '@/stores/postStore'
import { useToast } from 'primevue/usetoast'
import { getErrorMessage, restoreGuestDraft } from '@/utils/helpers'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialMode: { type: String, default: 'login' }
})

const emit = defineEmits(['close', 'success'])

const authStore = useAuthStore()
const postStore = usePostStore()
const toast = useToast()

const mode = ref(props.initialMode)
const isLoading = ref(false)

watch(() => props.initialMode, (val) => { mode.value = val })

const loginForm = reactive({ loginId: '', password: '' })
const loginErrors = reactive({ loginId: '', password: '' })

const registerForm = reactive({ loginId: '', nickname: '', password: '', passwordConfirm: '' })
const registerErrors = reactive({ loginId: '', nickname: '', password: '', passwordConfirm: '' })

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8070'
const OAUTH_BASE_URL = API_BASE_URL.replace('/api/v1', '')

function socialLogin(provider) {
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}`
}

function validateLogin() {
  loginErrors.loginId = ''
  loginErrors.password = ''
  let valid = true
  if (!loginForm.loginId.trim()) { loginErrors.loginId = '아이디를 입력해주세요'; valid = false }
  if (!loginForm.password) { loginErrors.password = '비밀번호를 입력해주세요'; valid = false }
  return valid
}

function validateRegister() {
  Object.keys(registerErrors).forEach(k => registerErrors[k] = '')
  let valid = true
  if (!registerForm.loginId.trim()) { registerErrors.loginId = '아이디를 입력해주세요'; valid = false }
  if (!registerForm.nickname.trim()) { registerErrors.nickname = '닉네임을 입력해주세요'; valid = false }
  if (!registerForm.password) { registerErrors.password = '비밀번호를 입력해주세요'; valid = false }
  if (registerForm.password !== registerForm.passwordConfirm) { registerErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'; valid = false }
  return valid
}

async function handleLogin() {
  if (!validateLogin()) return
  isLoading.value = true
  try {
    await authStore.login(loginForm.loginId, loginForm.password)
    await restoreGuestDraft(postStore)
    emit('success')
    emit('close')
  } catch (error) {
    toast.add({ severity: 'error', summary: '로그인 실패', detail: getErrorMessage(error), life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  if (!validateRegister()) return
  isLoading.value = true
  try {
    await authStore.register({
      loginId: registerForm.loginId,
      nickname: registerForm.nickname,
      password: registerForm.password,
    })
    await restoreGuestDraft(postStore)
    emit('success')
    emit('close')
  } catch (error) {
    toast.add({ severity: 'error', summary: '회원가입 실패', detail: getErrorMessage(error), life: 3000 })
  } finally {
    isLoading.value = false
  }
}
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
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.close-btn:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.modal-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.modal-logo svg { width: 28px; height: 28px; }
.modal-logo span { font-size: 1.25rem; font-weight: 500; letter-spacing: 0.05em; }

.auth-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.auth-tabs button {
  flex: 1;
  padding: 0.625rem;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.auth-tabs button.active {
  color: var(--text-color);
  border-bottom-color: var(--primary-color);
}

.auth-form { display: flex; flex-direction: column; gap: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }

.form-group label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.form-group input {
  padding: 0.625rem 0.875rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  color: var(--text-color);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}

.form-group input:focus { border-color: var(--primary-color); }
.form-group input.invalid { border-color: #ef4444; }
.form-group small { font-size: 0.75rem; color: #ef4444; }

.submit-btn {
  padding: 0.75rem;
  background: var(--primary-color);
  color: var(--primary-color-text);
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 0.25rem;
}

.submit-btn:hover:not(:disabled) { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.divider { display: flex; align-items: center; margin: 1.25rem 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--surface-border); }
.divider span { padding: 0 1rem; font-size: 0.8rem; color: var(--text-color-secondary); }

.social-login { display: flex; flex-direction: column; gap: 0.625rem; }

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.social-icon { width: 18px; height: 18px; flex-shrink: 0; }
.social-btn.google { background: #ffffff; color: #1f1f1f; }
.social-btn.kakao { background: #FEE500; color: #000; }
.social-btn.naver { background: #03C75A; color: #fff; }
.social-btn:hover { opacity: 0.9; }

.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .auth-modal, .modal-leave-to .auth-modal { transform: scale(0.95) translateY(10px); }
</style>
