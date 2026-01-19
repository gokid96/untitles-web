<template>
  <div class="register-view">
    <div class="register-container">
      <Card>
        <template #title>
          <div class="register-title">
            <p>회원가입</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleRegister" class="register-form">

            <div class="field">
              <label for="loginId">아이디</label>
              <InputText id="loginId" v-model="formData.loginId" placeholder="아이디" required class="w-full" />
            </div>

            <div class="field">
              <label for="nickname">닉네임</label>
              <InputText id="nickname" v-model="formData.nickname" placeholder="닉네임" required class="w-full" />
            </div>

            <div class="field">
              <label for="password">비밀번호</label>
              <Password id="password" v-model="formData.password" placeholder="비밀번호" toggleMask required
                :inputStyle="{ width: '100%' }" class="w-full" />
            </div>

            <div class="field">
              <label for="passwordConfirm">비밀번호 확인</label>
              <Password id="passwordConfirm" v-model="passwordConfirm" placeholder="비밀번호 확인" :feedback="false"
                toggleMask required :inputStyle="{ width: '100%' }" class="w-full" />
            </div>

            <!-- 이메일 인증 -->
            <div class="field">
              <label for="email">이메일</label>
              <div class="input-with-button">
                <InputText id="email" v-model="formData.email" type="email" placeholder="example@email.com"
                  :disabled="emailVerified" required class="flex-1" />
                <Button type="button" :label="codeSent ? '재발송' : '인증번호 발송'"
                  :severity="codeSent ? 'secondary' : 'primary'"
                  :disabled="emailVerified || !formData.email || isSending" @click="sendVerificationCode" />
              </div>
            </div>

            <!-- 인증번호 입력 (발송 후 표시) -->
            <div class="field" v-if="codeSent && !emailVerified">
              <label for="verificationCode">인증번호</label>
              <div class="input-with-button">
                <InputText id="verificationCode" v-model="verificationCode" placeholder="6자리 인증번호" maxlength="6"
                  class="flex-1" />
                <Button type="button" label="확인" :disabled="!verificationCode || verificationCode.length !== 6"
                  @click="verifyCode" />
              </div>
              <small class="hint-text">이메일로 발송된 인증번호를 입력해주세요.</small>
            </div>

            <!-- 인증 완료 메시지 -->
            <div class="field" v-if="emailVerified">
              <small class="success-text">✓ 이메일 인증이 완료되었습니다.</small>
            </div>

            <Button type="submit" label="회원가입" icon="pi pi-user-plus" severity="primary" :disabled="!emailVerified"
              class="w-full" />

            <div class="login-link">
              <span>이미 계정이 있으신가요?</span>
              <router-link to="/">로그인</router-link>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/authStore'
import { emailApi } from '@/api/emailApi'
import { TOAST_MESSAGES } from '@/utils/constants'
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

// 이메일 인증 관련
const emailVerified = ref(false)
const codeSent = ref(false)
const verificationCode = ref('')
const isSending = ref(false)
const isVerifying = ref(false)

// 인증번호 발송
async function sendVerificationCode() {
  if (!formData.email) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '이메일을 입력해주세요.',
      life: 3000,
    })
    return
  }

  isSending.value = true
  try {
    // 중복 확인
    const checkResponse = await emailApi.checkEmail(formData.email)
    if (!checkResponse.data.available) {
      toast.add({
        severity: 'error',
        summary: '중복된 이메일',
        detail: '이미 사용중인 이메일입니다.',
        life: 3000,
      })
      return
    }

    // 인증번호 발송
    await emailApi.sendCode(formData.email)
    codeSent.value = true
    verificationCode.value = ''
    toast.add({
      severity: 'success',
      summary: '발송 완료',
      detail: '인증번호가 발송되었습니다. 이메일을 확인해주세요.',
      life: 5000,
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

// 인증번호 확인
async function verifyCode() {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '6자리 인증번호를 입력해주세요.',
      life: 3000,
    })
    return
  }

  isVerifying.value = true
  try {
    await emailApi.verifyCode(formData.email, verificationCode.value)
    emailVerified.value = true
    toast.add({
      severity: 'success',
      summary: '인증 완료',
      detail: '이메일 인증이 완료되었습니다.',
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

// 회원가입
async function handleRegister() {
  if (!emailVerified.value) {
    toast.add({
      severity: 'warn',
      summary: '인증 필요',
      detail: '이메일 인증을 완료해주세요.',
      life: 3000,
    })
    return
  }

  if (!formData.loginId || !formData.nickname || !formData.password) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '모든 필드를 입력해주세요.',
      life: 3000,
    })
    return
  }

  if (formData.password !== passwordConfirm.value) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '비밀번호가 일치하지 않습니다.',
      life: 3000,
    })
    return
  }

  if (formData.password.length < 6) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '비밀번호는 최소 6자 이상이어야 합니다.',
      life: 3000,
    })
    return
  }

  isLoading.value = true
  try {
    await authStore.register(formData)

    toast.add({
      severity: 'success',
      summary: '회원가입 성공',
      detail: TOAST_MESSAGES.SUCCESS.REGISTER_SUCCESS,
      life: 3000,
    })

    router.push('/main')
  } catch (error) {
    console.error('Register error:', error)

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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--surface-ground);
  transition: background var(--transition-duration);
}

.register-container {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

.register-title {
  text-align: center;
}

.register-title p {
  margin: 0.5rem 0 0 0;
  color: var(--text-color-secondary);
}

.register-form {
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
}

/* 입력 필드 크기 통일 */
.w-full {
  width: 100%;
}

.flex-1 {
  flex: 1;
}

/* Password 컴포넌트 wrapper 크기 통일 */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

/* 모든 input 높이 통일 */
:deep(.p-inputtext) {
  height: 2.75rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.hint-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.success-text {
  color: var(--green-500);
  font-weight: 600;
}

.login-link {
  text-align: center;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  color: var(--text-color-secondary);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
