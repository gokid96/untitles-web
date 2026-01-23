<template>
  <div class="login-view">
    <div class="login-container">
      <!-- 로고 영역 -->
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor"
                d="M50 8 C52 30 58 36 80 38 C58 40 52 46 50 68 C48 46 42 40 20 38 C42 36 48 30 50 8 Z" />
              <path fill="currentColor"
                d="M50 50 C51 62 54 65 66 66 C54 67 51 70 50 82 C49 70 46 67 34 66 C46 65 49 62 50 50 Z" />
              <path fill="currentColor" opacity="0.5"
                d="M78 70 C78.5 76 80 77.5 86 78 C80 78.5 78.5 80 78 86 C77.5 80 76 78.5 70 78 C76 77.5 77.5 76 78 70 Z" />
            </svg>
          </div>
          <h1 class="logo-text">Untitles</h1>
        </router-link>
      </div>

      <!-- 로그인 폼 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="loginId">아이디</label>
          <InputText
            id="loginId"
            v-model="loginId"
            placeholder="아이디를 입력하세요"
            autofocus
            :class="{ 'p-invalid': errors.loginId }"
          />
          <small v-if="errors.loginId" class="error-text">{{ errors.loginId }}</small>
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <Password
            id="password"
            v-model="password"
            placeholder="비밀번호를 입력하세요"
            :feedback="false"
            toggleMask
            :class="{ 'p-invalid': errors.password }"
          />
          <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
        </div>

        <Button
          type="submit"
          label="로그인"
          :loading="isLoading"
          :disabled="isLoading"
          class="login-button"
        />
      </form>

      <!-- 회원가입 링크 -->
      <div class="register-section">
        <span>계정이 없으신가요?</span>
        <router-link to="/register" class="register-link">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/helpers'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

const loginId = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = reactive({
  loginId: '',
  password: ''
})

function validate() {
  errors.loginId = ''
  errors.password = ''
  let isValid = true

  if (!loginId.value.trim()) {
    errors.loginId = '아이디를 입력해주세요'
    isValid = false
  }

  if (!password.value) {
    errors.password = '비밀번호를 입력해주세요'
    isValid = false
  }

  return isValid
}

async function handleLogin() {
  if (!validate()) return

  isLoading.value = true

  try {
    await authStore.login(loginId.value, password.value)
    // 리다이렉트 쿼리가 있으면 해당 경로로, 없으면 /app으로
    const redirectPath = route.query.redirect || '/app'
    router.push(redirectPath)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '로그인 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap');

.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a1020 100%);
  padding: 2rem;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

/* 로고 영역 */
.logo-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-link {
  text-decoration: none;
  color: inherit;
  display: inline-block;
}

.logo-link:hover {
  text-decoration: none;
}

.logo-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 0rem;
  color: #ffffff;
  opacity: 0.9;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 0 0 0.75rem;
}

/* 로그인 폼 */
.login-form {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.form-group :deep(.p-inputtext),
.form-group :deep(.p-password input) {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9375rem;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.2s ease;
}

.form-group :deep(.p-inputtext:hover),
.form-group :deep(.p-password input:hover) {
  border-color: rgba(255, 255, 255, 0.2);
}

.form-group :deep(.p-inputtext:focus),
.form-group :deep(.p-password input:focus) {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
  outline: none;
}

.form-group :deep(.p-inputtext::placeholder),
.form-group :deep(.p-password input::placeholder) {
  color: rgba(255, 255, 255, 0.3);
}

.form-group :deep(.p-inputtext.p-invalid),
.form-group :deep(.p-password input.p-invalid) {
  border-color: #ef4444;
}

.form-group :deep(.p-password) {
  width: 100%;
}

.form-group :deep(.p-password-toggle-icon) {
  color: rgba(255, 255, 255, 0.5);
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

/* 로그인 버튼 */
.login-button {
  width: 100%;
  padding: 0.875rem;
  margin-top: 0.5rem;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  color: #0a0a0f;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 회원가입 링크 */
.register-section {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.register-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: opacity 0.2s;
}

.register-link:hover {
  opacity: 0.8;
  text-decoration: none;
}

/* 반응형 */
@media (max-width: 480px) {
  .login-container {
    max-width: 100%;
  }

  .login-form {
    padding: 1.5rem;
  }

  .logo-text {
    font-size: 1.5rem;
  }
}
</style>
