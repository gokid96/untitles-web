<template>
  <div class="register-view">
    <div class="register-container">
      <!-- 로고 영역 -->
      <div class="logo-section">
        <router-link to="/" class="back-link">
          <ArrowLeft class="back-icon" />
        </router-link>
        <h1 class="logo-text">회원가입</h1>
        <p class="logo-tagline">Untitles와 함께 시작하세요</p>
      </div>

      <!-- 회원가입 폼 -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 이메일 인증 -->
        <div class="form-group">
          <label for="email">이메일</label>
          <div class="input-with-button">
            <InputText 
              id="email" 
              v-model="formData.email" 
              type="email" 
              placeholder="example@email.com"
              :disabled="emailVerified"
              :class="{ 'p-invalid': errors.email }"
            />
            <Button 
              type="button" 
              :label="codeSent ? '재발송' : '인증'" 
              :loading="isSending"
              :disabled="emailVerified || !formData.email"
              @click="sendVerificationCode"
              class="verify-button"
            />
          </div>
          <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
        </div>

        <!-- 인증번호 입력 -->
        <div class="form-group" v-if="codeSent && !emailVerified">
          <label for="verificationCode">인증번호</label>
          <div class="input-with-button">
            <InputText 
              id="verificationCode" 
              v-model="verificationCode" 
              placeholder="6자리 인증번호" 
              maxlength="6"
            />
            <Button 
              type="button" 
              label="확인"
              :loading="isVerifying"
              :disabled="!verificationCode || verificationCode.length !== 6"
              @click="verifyCode"
              class="verify-button"
            />
          </div>
          <small class="hint-text">이메일로 발송된 인증번호를 입력해주세요</small>
        </div>

        <!-- 인증 완료 -->
        <div class="form-group" v-if="emailVerified">
          <div class="verified-badge">
            <CheckCircle class="verified-icon" />
            <span>이메일 인증 완료</span>
          </div>
        </div>

        <div class="form-group">
          <label for="loginId">아이디</label>
          <InputText 
            id="loginId" 
            v-model="formData.loginId" 
            placeholder="영문 소문자, 숫자 4-20자"
            :class="{ 'p-invalid': errors.loginId }"
          />
          <small v-if="errors.loginId" class="error-text">{{ errors.loginId }}</small>
        </div>

        <div class="form-group">
          <label for="nickname">닉네임</label>
          <InputText 
            id="nickname" 
            v-model="formData.nickname" 
            placeholder="2-50자"
            :class="{ 'p-invalid': errors.nickname }"
          />
          <small v-if="errors.nickname" class="error-text">{{ errors.nickname }}</small>
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <Password 
            id="password" 
            v-model="formData.password" 
            placeholder="영문, 숫자, 특수문자 포함 8-20자"
            toggleMask
            :feedback="false"
            :class="{ 'p-invalid': errors.password }"
          />
          <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
        </div>

        <div class="form-group">
          <label for="passwordConfirm">비밀번호 확인</label>
          <Password 
            id="passwordConfirm" 
            v-model="passwordConfirm" 
            placeholder="비밀번호를 다시 입력하세요"
            :feedback="false"
            toggleMask
            :class="{ 'p-invalid': errors.passwordConfirm }"
          />
          <small v-if="errors.passwordConfirm" class="error-text">{{ errors.passwordConfirm }}</small>
        </div>

        <Button 
          type="submit" 
          label="가입하기" 
          :loading="isLoading"
          :disabled="!emailVerified || isLoading"
          class="submit-button"
        />
      </form>

      <!-- 로그인 링크 -->
      <div class="login-section">
        <span>이미 계정이 있으신가요?</span>
        <router-link to="/login" class="login-link">로그인</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { ArrowLeft, CheckCircle } from 'lucide-vue-next'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/authStore'
import { emailApi } from '@/api/emailApi'
import { getErrorMessage } from '@/utils/helpers'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const formData = reactive({
  loginId: '',
  nickname: '',
  email: '',
  password: '',
})

const passwordConfirm = ref('')
const isLoading = ref(false)
const errors = reactive({
  email: '',
  loginId: '',
  nickname: '',
  password: '',
  passwordConfirm: ''
})

// 이메일 인증
const emailVerified = ref(false)
const codeSent = ref(false)
const verificationCode = ref('')
const isSending = ref(false)
const isVerifying = ref(false)

function validate() {
  let isValid = true
  Object.keys(errors).forEach(key => errors[key] = '')

  if (!formData.loginId.trim()) {
    errors.loginId = '아이디를 입력해주세요'
    isValid = false
  } else if (!/^[a-z0-9_-]{4,20}$/.test(formData.loginId)) {
    errors.loginId = '4-20자의 영문 소문자, 숫자, 특수문자(_,-)만 사용 가능합니다'
    isValid = false
  }

  if (!formData.nickname.trim()) {
    errors.nickname = '닉네임을 입력해주세요'
    isValid = false
  } else if (formData.nickname.length < 2 || formData.nickname.length > 50) {
    errors.nickname = '닉네임은 2-50자여야 합니다'
    isValid = false
  }

  if (!formData.password) {
    errors.password = '비밀번호를 입력해주세요'
    isValid = false
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(formData.password)) {
    errors.password = '8-20자의 영문, 숫자, 특수문자를 포함해야 합니다'
    isValid = false
  }

  if (!passwordConfirm.value) {
    errors.passwordConfirm = '비밀번호 확인을 입력해주세요'
    isValid = false
  } else if (formData.password !== passwordConfirm.value) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    isValid = false
  }

  return isValid
}

async function sendVerificationCode() {
  if (!formData.email) {
    errors.email = '이메일을 입력해주세요'
    return
  }

  isSending.value = true
  errors.email = ''

  try {
    const checkResponse = await emailApi.checkEmail(formData.email)
    if (!checkResponse.data.available) {
      errors.email = '이미 사용중인 이메일입니다'
      return
    }

    await emailApi.sendCode(formData.email)
    codeSent.value = true
    verificationCode.value = ''
    
    toast.add({
      severity: 'success',
      summary: '발송 완료',
      detail: '인증번호가 발송되었습니다',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '발송 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  } finally {
    isSending.value = false
  }
}

async function verifyCode() {
  isVerifying.value = true

  try {
    await emailApi.verifyCode(formData.email, verificationCode.value)
    emailVerified.value = true
    
    toast.add({
      severity: 'success',
      summary: '인증 완료',
      detail: '이메일 인증이 완료되었습니다',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '인증 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  } finally {
    isVerifying.value = false
  }
}

async function handleRegister() {
  if (!emailVerified.value) {
    toast.add({
      severity: 'warn',
      summary: '인증 필요',
      detail: '이메일 인증을 완료해주세요',
      life: 3000,
    })
    return
  }

  if (!validate()) return

  isLoading.value = true

  try {
    await authStore.register(formData)
    router.push('/app')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '회원가입 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 2rem;
}

.register-container {
  width: 100%;
  max-width: 420px;
}

/* 로고 영역 */
.logo-section {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.back-link {
  position: absolute;
  left: 0;
  top: 0;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.back-link:hover {
  color: #ffffff;
  text-decoration: none;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 400;
  color: #ffffff;
  margin: 0 0 0.5rem;
}

.logo-tagline {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 폼 */
.register-form {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
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
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9375rem;
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
.form-group :deep(.p-password.p-invalid input) {
  border-color: #ef4444;
}

.form-group :deep(.p-password) {
  width: 100%;
}

.form-group :deep(.p-password-toggle-icon) {
  color: rgba(255, 255, 255, 0.5);
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button :deep(.p-inputtext) {
  flex: 1;
}

.verify-button {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 500;
  white-space: nowrap;
}

.verify-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #22c55e;
  font-size: 0.875rem;
  font-weight: 500;
}

.verified-icon {
  width: 18px;
  height: 18px;
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.375rem;
}

.hint-text {
  display: block;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  margin-top: 0.375rem;
}

.submit-button {
  width: 100%;
  padding: 0.875rem;
  margin-top: 0.5rem;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  color: #0a0a0a;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 로그인 링크 */
.login-section {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.login-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: opacity 0.2s;
}

.login-link:hover {
  opacity: 0.8;
  text-decoration: none;
}

@media (max-width: 480px) {
  .register-form {
    padding: 1.5rem;
  }
}
</style>
