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

      <!-- 구분선 -->
      <div class="divider">
        <span>또는</span>
      </div>

      <!-- 소셜 로그인 -->
      <div class="social-login">
        <button @click="socialLogin('google')" class="social-btn google">
          <svg class="social-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>

        <button @click="socialLogin('kakao')" class="social-btn kakao">
          <svg class="social-icon" viewBox="0 0 24 24">
            <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
          </svg>
          카카오로 계속하기
        </button>

        <button @click="socialLogin('naver')" class="social-btn naver">
          <svg class="social-icon" viewBox="0 0 24 24">
            <path fill="#ffffff" d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
          </svg>
          네이버로 계속하기
        </button>
      </div>

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8070'

// OAuth URL은 /api/v1 없이 직접 호출
const OAUTH_BASE_URL = API_BASE_URL.replace('/api/v1', '')

function socialLogin(provider) {
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}`
}

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

/* 구분선 */
.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider span {
  padding: 0 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8125rem;
}

/* 소셜 로그인 */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-btn .social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.social-btn.google {
  background: #ffffff;
  color: #1f1f1f;
}

.social-btn.google:hover {
  background: #f5f5f5;
}

.social-btn.kakao {
  background: #FEE500;
  color: #000000;
  border-color: #FEE500;
}

.social-btn.kakao:hover {
  background: #FFEB3B;
}

.social-btn.naver {
  background: #03C75A;
  color: #ffffff;
  border-color: #03C75A;
}

.social-btn.naver:hover {
  background: #02b351;
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
