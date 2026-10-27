<template>
  <Dialog
    :visible="visible"
    header="비밀번호 찾기"
    :modal="true"
    :closable="true"
    :style="{ width: '380px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <form v-if="step === 'request'" class="forgot-form" @submit.prevent="requestCode">
      <p class="desc">가입할 때나 내 정보에서 등록한 이메일을 입력하면 인증번호를 보내드려요.</p>
      <label for="forgot-email">이메일</label>
      <InputText id="forgot-email" v-model="email" type="email" placeholder="example@email.com" autocomplete="email" />
      <Button type="submit" label="인증번호 받기" :loading="isLoading" :disabled="!email.trim()" />
      <p class="note">이메일을 등록하지 않은 계정은 비밀번호를 찾을 수 없어요. 문의: sungmin360@nate.com</p>
    </form>

    <form v-else class="forgot-form" @submit.prevent="confirmReset">
      <p class="desc"><strong>{{ email }}</strong>(으)로 인증번호를 보냈어요. 메일이 오지 않으면 스팸함도 확인해 주세요.</p>
      <label for="forgot-code">인증번호</label>
      <InputText id="forgot-code" v-model="code" inputmode="numeric" maxlength="6" placeholder="6자리 숫자" autocomplete="one-time-code" />
      <label for="forgot-new">새 비밀번호</label>
      <Password id="forgot-new" v-model="newPassword" :feedback="false" toggle-mask placeholder="영문과 숫자 포함 8자 이상" input-class="w-full" />
      <label for="forgot-confirm">새 비밀번호 확인</label>
      <Password id="forgot-confirm" v-model="confirmPassword" :feedback="false" toggle-mask placeholder="한 번 더 입력" input-class="w-full" />
      <Button type="submit" label="비밀번호 변경" :loading="isLoading" />
      <button type="button" class="link" :disabled="isLoading" @click="requestCode">인증번호 다시 받기</button>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { userApi } from '@/api/userApi'
import { getErrorMessage, isValidPassword, PASSWORD_RULE_TEXT } from '@/utils/helpers'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible'])

const toast = useToast()
const step = ref('request')
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

watch(
  () => props.visible,
  (open) => {
    if (open) {
      step.value = 'request'
      code.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    }
  }
)

async function requestCode() {
  if (!email.value.trim()) return
  isLoading.value = true
  try {
    await userApi.requestPasswordReset(email.value.trim())
    step.value = 'confirm'
  } catch (error) {
    toast.add({ severity: 'error', summary: '요청 실패', detail: getErrorMessage(error), life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function confirmReset() {
  if (!/^\d{6}$/.test(code.value)) {
    toast.add({ severity: 'warn', summary: '입력 오류', detail: '인증번호 6자리를 입력해주세요.', life: 3000 })
    return
  }
  if (!isValidPassword(newPassword.value)) {
    toast.add({ severity: 'warn', summary: '입력 오류', detail: PASSWORD_RULE_TEXT, life: 3000 })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.add({ severity: 'warn', summary: '입력 오류', detail: '새 비밀번호가 일치하지 않습니다.', life: 3000 })
    return
  }
  isLoading.value = true
  try {
    await userApi.confirmPasswordReset(email.value.trim(), code.value, newPassword.value)
    toast.add({ severity: 'success', summary: '비밀번호 변경 완료', detail: '새 비밀번호로 로그인해주세요.', life: 4000 })
    emit('update:visible', false)
  } catch (error) {
    toast.add({ severity: 'error', summary: '변경 실패', detail: getErrorMessage(error), life: 3000 })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.forgot-form label {
  font-size: 0.8125rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.forgot-form :deep(.p-password),
.forgot-form :deep(.p-password input) {
  width: 100%;
}

.forgot-form :deep(.p-button) {
  margin-top: 0.75rem;
}

.desc {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.note {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.link {
  align-self: center;
  border: none;
  background: none;
  color: var(--text-color-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  text-decoration: underline;
}
</style>
