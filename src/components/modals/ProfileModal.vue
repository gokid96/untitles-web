<template>
  <Dialog
    :visible="visible"
    header="내 정보"
    :modal="true"
    :closable="true"
    :style="{ width: '400px' }"
    @update:visible="handleVisibleChange"
  >
    <div class="profile-form">
      <!-- 닉네임 -->
      <div class="field">
        <label for="nickname">닉네임</label>
        <InputText
          id="nickname"
          v-model="formData.nickname"
          placeholder="닉네임"
          class="w-full"
        />
      </div>

      <!-- 현재 비밀번호 -->
      <div class="field">
        <label for="currentPassword">현재 비밀번호</label>
        <Password
          id="currentPassword"
          v-model="formData.currentPassword"
          placeholder="현재 비밀번호"
          :feedback="false"
          toggleMask
          class="w-full"
          :inputStyle="{ width: '100%' }"
        />
        <small class="hint">비밀번호 변경 시에만 입력하세요</small>
      </div>

      <!-- 새 비밀번호 -->
      <div class="field">
        <label for="newPassword">새 비밀번호</label>
        <Password
          id="newPassword"
          v-model="formData.newPassword"
          placeholder="새 비밀번호"
          :feedback="true"
          toggleMask
          class="w-full"
          :inputStyle="{ width: '100%' }"
        />
      </div>

      <!-- 새 비밀번호 확인 -->
      <div class="field">
        <label for="confirmPassword">새 비밀번호 확인</label>
        <Password
          id="confirmPassword"
          v-model="formData.confirmPassword"
          placeholder="새 비밀번호 확인"
          :feedback="false"
          toggleMask
          class="w-full"
          :inputStyle="{ width: '100%' }"
        />
      </div>
    </div>

    <template #footer>
      <Button label="취소" severity="secondary" @click="handleCancel" text />
      <Button label="저장" severity="primary" @click="handleSave" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/helpers'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible'])

const toast = useToast()
const authStore = useAuthStore()
const isSaving = ref(false)

const formData = reactive({
  nickname: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 모달이 열릴 때 현재 사용자 정보로 초기화
watch(() => props.visible, (newVal) => {
  if (newVal) {
    formData.nickname = authStore.currentUser?.nickname || ''
    formData.currentPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
  }
})

function handleVisibleChange(value) {
  emit('update:visible', value)
}

function handleCancel() {
  emit('update:visible', false)
}

async function handleSave() {
  // 유효성 검사
  if (!formData.nickname.trim()) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '닉네임을 입력해주세요.',
      life: 3000,
    })
    return
  }

  // 비밀번호 변경 시 유효성 검사
  if (formData.newPassword || formData.currentPassword) {
    if (!formData.currentPassword) {
      toast.add({
        severity: 'warn',
        summary: '입력 오류',
        detail: '현재 비밀번호를 입력해주세요.',
        life: 3000,
      })
      return
    }

    if (!formData.newPassword) {
      toast.add({
        severity: 'warn',
        summary: '입력 오류',
        detail: '새 비밀번호를 입력해주세요.',
        life: 3000,
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast.add({
        severity: 'warn',
        summary: '입력 오류',
        detail: '비밀번호는 최소 6자 이상이어야 합니다.',
        life: 3000,
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.add({
        severity: 'warn',
        summary: '입력 오류',
        detail: '새 비밀번호가 일치하지 않습니다.',
        life: 3000,
      })
      return
    }
  }

  isSaving.value = true
  try {
    const updateData = {
      nickname: formData.nickname,
    }

    // 비밀번호 변경이 있는 경우
    if (formData.newPassword && formData.currentPassword) {
      updateData.currentPassword = formData.currentPassword
      updateData.newPassword = formData.newPassword
    }

    await authStore.updateUserInfo(updateData)

    toast.add({
      severity: 'success',
      summary: '저장 완료',
      detail: '내 정보가 수정되었습니다.',
      life: 3000,
    })

    emit('update:visible', false)
  } catch (error) {
    console.error('Profile update error:', error)
    toast.add({
      severity: 'error',
      summary: '저장 실패',
      detail: getErrorMessage(error),
      life: 3000,
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color);
}

.w-full {
  width: 100%;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-inputtext) {
  height: 2.75rem;
}

.hint {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}
</style>
