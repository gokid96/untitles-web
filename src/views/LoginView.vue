<template>
  <div class="login-view">
    <!-- 배경 이미지 -->
    <div class="background-image"></div>
    <!-- 어두운 오버레이 -->
    <div class="background-overlay"></div>
    <!-- 타이핑 커서 -->
    <!-- <div class="typing-cursor"></div> -->

    <div class="login-container">
      <Card class="login-card">
        <template #title>
          <div class="login-title">
            <!-- 로고 추가 -->
            <div class="logo-container">
              <svg class="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor"
                  d="M50 8 C52 30 58 36 80 38 C58 40 52 46 50 68 C48 46 42 40 20 38 C42 36 48 30 50 8 Z" />
                <path fill="currentColor"
                  d="M50 50 C51 62 54 65 66 66 C54 67 51 70 50 82 C49 70 46 67 34 66 C46 65 49 62 50 50 Z" />
                <path fill="currentColor" opacity="0.5"
                  d="M78 70 C78.5 76 80 77.5 86 78 C80 78.5 78.5 80 78 86 C77.5 80 76 78.5 70 78 C76 77.5 77.5 76 78 70 Z" />
              </svg>
              <span class="logo-text">Untitles</span>
            </div>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="field">
              <InputText id="loginId" v-model="loginId" type="loginId" placeholder="아이디" required autofocus />
            </div>

            <div class="field">
              <Password id="password" v-model="password" placeholder="비밀번호" :feedback="false" required />
            </div>
            <div class="loginBtn">
              <Button type="submit" label="로그인" icon="pi pi-sign-in" severity="primary" :loading="isLoading"
                class="w-full" />
            </div>
          </form>
        </template>
      </Card>
      <div class="register-link">
        <span>계정이 없으신가요?</span>
        <router-link to="/register">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/authStore'
import { TOAST_MESSAGES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/helpers'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loginId = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin() {
  if (!loginId.value || !password.value) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '아이디와 비밀번호를 입력해주세요.',
      life: 3000,
    })
    return
  }

  isLoading.value = true

  try {
    await authStore.login(loginId.value, password.value)

    toast.add({
      severity: 'success',
      summary: '로그인 성공',
      detail: TOAST_MESSAGES.SUCCESS.LOGIN_SUCCESS,
      life: 3000,
    })

    router.push('/main')
  } catch (error) {
    console.error('Login error:', error)

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
/* 배경 이미지 */
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  filter: blur(2px);
  transform: scale(1.05);
}

/* 어두운 오버레이 */
.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* 타이핑 커서 */
/* .typing-cursor {
  position: fixed;
  top: 20%;
  left: 25%;
  width: 5px;
  height: 45px;
  background: #726d6c;
  z-index: 1;
  animation: blink 1s infinite;
  box-shadow: 0 0 10px rgba(245, 197, 24, 0.5);
} */

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

.login-card {
  border-radius: 5px;
  background: rgba(66, 66, 66, 0.25);
  backdrop-filter: blur(1px);
}

.login-card :deep(.p-card-body) {
  padding: 2.5rem 1.5rem 4.5rem 1.5rem;
}

.login-card :deep(.p-card-title) {
  padding: 0;
  margin-bottom: 1.5rem;
}

.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #141414;
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  position: relative;
  z-index: 2;
}

/* 로고 스타일 */
.login-title {
  margin: 0;
  padding: 0;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 70px;
  height: 70px;
  color: #ffffff;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.2em;
  color: #ffffff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #fff;
}

.field :deep(.p-inputtext) {
  background: rgba(51, 51, 51, 0.9);
  border: 1px solid rgba(128, 128, 128, 0.5);
  color: #fff;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 4px;
}

.field :deep(.p-inputtext:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.field :deep(.p-inputtext::placeholder) {
  color: #8c8c8c;
}

.field :deep(.p-password) {
  width: 100%;
}

.field :deep(.p-password input) {
  width: 100%;
  background: rgba(51, 51, 51, 0.9);
  border: 1px solid rgba(128, 128, 128, 0.5);
  color: #fff;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 4px;
}

.field :deep(.p-password input:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.field :deep(.p-password input::placeholder) {
  color: #8c8c8c;
}

.loginBtn {
  margin-top: 2.25rem;
}

.loginBtn :deep(.p-button) {
  font-weight: 700;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.register-link {
  text-align: center;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  color: #8c8c8c;
  margin-top: 1.875rem;
}

.register-link a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

.w-full {
  width: 100%;
}

/* 반응형 */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-text {
    font-size: 1.2rem;
  }
}
</style>
