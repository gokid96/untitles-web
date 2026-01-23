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
      <!-- 프로필 이미지 -->
      <div class="profile-avatar-section">
        <div class="avatar-wrapper" @click="triggerImageUpload">
          <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" class="avatar-image" />
          <div v-else class="avatar-placeholder">{{ userInitial }}</div>
          <div class="avatar-overlay">
            <i v-if="isUploading" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-camera"></i>
          </div>
        </div>
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleImageUpload"
        />
        <span class="avatar-hint">클릭하여 이미지 변경</span>
      </div>

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
      <Button label="저장" severity="primary" @click="handleSave" :disabled="isUploading" :loading="isSaving" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/authStore'
import { imageApi } from '@/api/imageApi'
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
const { currentUser } = storeToRefs(authStore)

const isSaving = ref(false)
const isUploading = ref(false)
const imageInput = ref(null)

const formData = reactive({
  nickname: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  profileImage: '',
})

const userInitial = computed(() => {
  return currentUser.value?.nickname?.charAt(0).toUpperCase() || 'U'
})

const profileImageUrl = computed(() => {
  return formData.profileImage || currentUser.value?.profileImage || ''
})

// 모달이 열릴 때 현재 사용자 정보로 초기화
watch(() => props.visible, (newVal) => {
  if (newVal) {
    formData.nickname = currentUser.value?.nickname || ''
    formData.currentPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
    formData.profileImage = currentUser.value?.profileImage || ''
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  if (!props.visible) return
  
  if (e.key === 'Escape') {
    handleCancel()
  } else if (e.key === 'Enter' && !e.shiftKey) {
    handleSave()
  }
}

function handleVisibleChange(value) {
  emit('update:visible', value)
}

function handleCancel() {
  emit('update:visible', false)
}

function triggerImageUpload() {
  if (!isUploading.value) {
    imageInput.value?.click()
  }
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // 파일 검증
  if (!file.type.startsWith('image/')) {
    toast.add({ severity: 'error', summary: '오류', detail: '이미지 파일만 업로드 가능합니다.', life: 3000 })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.add({ severity: 'error', summary: '오류', detail: '파일 크기는 5MB 이하여야 합니다.', life: 3000 })
    return
  }

  try {
    isUploading.value = true
    const response = await imageApi.uploadProfileImage(file)
    formData.profileImage = response.data.url
  } catch (error) {
    console.error('Image upload failed:', error)
    toast.add({ severity: 'error', summary: '업로드 실패', detail: '이미지 업로드에 실패했습니다.', life: 3000 })
  } finally {
    isUploading.value = false
    event.target.value = ''
  }
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

    // profileImage가 변경된 경우에만 포함
    if (formData.profileImage !== currentUser.value?.profileImage) {
      updateData.profileImage = formData.profileImage || null
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

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-700) 100%);
  color: var(--primary-color-text);
  font-size: 2rem;
  font-weight: 600;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  color: white;
  font-size: 1.5rem;
}

.avatar-hint {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
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
