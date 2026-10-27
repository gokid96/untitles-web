<template>
  <Dialog
    :visible="visible"
    header="내 정보"
    :modal="true"
    :closable="true"
    :style="{ width: '440px' }"
    :breakpoints="{ '520px': '94vw' }"
    @update:visible="handleVisibleChange"
  >
    <div class="profile">
      <!-- 1. 프로필: 사진·닉네임 (다른 멤버에게 보이는 정보) -->
      <section class="section">
        <h3 class="section-title">프로필</h3>
        <div class="profile-row">
          <div class="avatar-wrapper" role="button" tabindex="0" aria-label="프로필 사진 변경"
            @click="triggerImageUpload" @keydown.enter.prevent="triggerImageUpload">
            <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필" class="avatar-image" />
            <div v-else class="avatar-placeholder">{{ userInitial }}</div>
            <div class="avatar-overlay">
              <Loader2 v-if="isUploading" class="overlay-icon spinning" />
              <Camera v-else class="overlay-icon" />
            </div>
          </div>
          <input ref="imageInput" type="file" accept="image/*" style="display: none" @change="handleImageUpload" />
          <div class="nickname-field">
            <label for="nickname">닉네임</label>
            <InputText id="nickname" v-model="profile.nickname" maxlength="50" class="w-full"
              @keydown.enter.prevent="saveProfile" />
          </div>
        </div>
        <div class="row-actions">
          <button v-if="profileImageUrl" type="button" class="text-btn" :disabled="isUploading" @click="removeImage">사진 삭제</button>
          <Button label="저장" size="small" :disabled="!profileChanged || isUploading" :loading="isSavingProfile" @click="saveProfile" />
        </div>
      </section>

      <!-- 2. 계정: 이메일(로그인 아이디), 비밀번호 -->
      <section class="section">
        <h3 class="section-title">계정</h3>

        <!-- 이메일 -->
        <div class="item">
          <div class="item-main">
            <span class="item-label">이메일</span>
            <span class="item-value">
              {{ currentUser?.email || '등록된 이메일 없음' }}
              <span v-if="currentUser?.email && currentUser?.emailVerified" class="badge ok">확인됨</span>
              <span v-else-if="currentUser?.email" class="badge warn">미확인</span>
            </span>
          </div>
          <div v-if="emailStep === 'idle'" class="item-actions">
            <button v-if="currentUser?.email && !currentUser?.emailVerified" type="button" class="text-btn"
              @click="startEmail(true)">인증하기</button>
            <button type="button" class="text-btn" @click="startEmail(false)">{{ currentUser?.email ? '변경' : '추가' }}</button>
          </div>
        </div>
        <div v-if="emailStep !== 'idle'" class="inline-form">
          <template v-if="emailStep === 'input'">
            <label for="new-email">{{ verifyingCurrent ? '확인할 이메일' : '새 이메일' }}</label>
            <InputText id="new-email" v-model="emailForm.email" type="email" autocomplete="email" class="w-full"
              :disabled="verifyingCurrent" placeholder="example@email.com" @keydown.enter.prevent="sendEmailCode" />
            <small class="hint">이 이메일로 로그인하게 돼요. 받은 인증번호를 입력하면 바뀌어요.</small>
          </template>
          <template v-else>
            <label for="email-code"><strong>{{ emailForm.email }}</strong>(으)로 보낸 인증번호</label>
            <InputText id="email-code" v-model="emailForm.code" inputmode="numeric" maxlength="6"
              autocomplete="one-time-code" placeholder="6자리 숫자" class="w-full" @keydown.enter.prevent="confirmEmail" />
            <small class="hint">메일이 오지 않으면 스팸함도 확인해 주세요.
              <button type="button" class="link-btn" :disabled="isEmailBusy" @click="sendEmailCode">다시 받기</button>
            </small>
          </template>
          <div class="row-actions">
            <button type="button" class="text-btn" @click="cancelEmail">취소</button>
            <Button v-if="emailStep === 'input'" label="인증번호 받기" size="small" :loading="isEmailBusy"
              :disabled="!isEmail(emailForm.email)" @click="sendEmailCode" />
            <Button v-else label="확인" size="small" :loading="isEmailBusy" :disabled="emailForm.code.length !== 6"
              @click="confirmEmail" />
          </div>
        </div>

        <!-- 예전 아이디 (로그인용으로 계속 쓸 수 있음) -->
        <div v-if="currentUser?.loginId" class="item">
          <div class="item-main">
            <span class="item-label">아이디</span>
            <span class="item-value">{{ currentUser.loginId }}</span>
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="item">
          <div class="item-main">
            <span class="item-label">비밀번호</span>
            <span class="item-value">{{ currentUser?.hasPassword ? '설정됨' : '설정 안 됨' }}</span>
          </div>
          <div v-if="!isPasswordOpen" class="item-actions">
            <button type="button" class="text-btn" @click="openPassword">{{ currentUser?.hasPassword ? '변경' : '설정' }}</button>
          </div>
        </div>
        <div v-if="isPasswordOpen" class="inline-form">
          <p v-if="!currentUser?.hasPassword" class="hint">비밀번호를 설정하면 이메일과 비밀번호로도 로그인할 수 있어요.</p>
          <template v-if="currentUser?.hasPassword">
            <label for="current-password">현재 비밀번호</label>
            <Password id="current-password" v-model="passwordForm.current" :feedback="false" toggleMask class="w-full"
              :inputStyle="{ width: '100%' }" autocomplete="current-password" />
          </template>
          <label for="new-password">새 비밀번호</label>
          <Password id="new-password" v-model="passwordForm.next" :feedback="false" toggleMask class="w-full"
            :inputStyle="{ width: '100%' }" autocomplete="new-password" :placeholder="PASSWORD_RULE_TEXT" />
          <label for="confirm-password">새 비밀번호 확인</label>
          <Password id="confirm-password" v-model="passwordForm.confirm" :feedback="false" toggleMask class="w-full"
            :inputStyle="{ width: '100%' }" autocomplete="new-password" />
          <small v-if="currentUser?.hasPassword" class="hint">바꾸면 보안을 위해 모든 기기에서 로그아웃돼요.</small>
          <div class="row-actions">
            <button type="button" class="text-btn" @click="isPasswordOpen = false">취소</button>
            <Button :label="currentUser?.hasPassword ? '비밀번호 변경' : '비밀번호 설정'" size="small"
              :loading="isSavingPassword" @click="savePassword" />
          </div>
        </div>
      </section>

      <!-- 3. 로그인 연결 -->
      <section class="section">
        <h3 class="section-title">로그인 연결</h3>
        <p class="section-desc">연결한 계정으로도 바로 로그인할 수 있어요.</p>
        <div v-for="p in providerRows" :key="p" class="item">
          <div class="item-main provider">
            <span class="provider-dot" :class="p.toLowerCase()"></span>
            <span class="item-value">{{ providerName[p] || p }}</span>
            <span v-if="linkedProviders.includes(p)" class="badge ok">연결됨</span>
          </div>
          <div class="item-actions">
            <button v-if="linkedProviders.includes(p)" type="button" class="text-btn" :disabled="busyProvider === p"
              @click="unlink(p)">해제</button>
            <button v-else-if="canLink(p)" type="button" class="text-btn strong" :disabled="busyProvider === p"
              @click="link(p)">{{ busyProvider === p ? '연결 중...' : '연결' }}</button>
          </div>
        </div>
      </section>

      <!-- 4. 회원 탈퇴 -->
      <section class="danger-zone">
        <template v-if="!confirmingDelete">
          <button type="button" class="danger-link" @click="confirmingDelete = true">회원 탈퇴</button>
        </template>
        <template v-else>
          <p class="danger-text">
            탈퇴하면 개인 워크스페이스의 모든 노트와 폴더가 삭제되며 되돌릴 수 없습니다.
            다른 워크스페이스에 작성한 글은 "탈퇴한 사용자"로 남습니다.
          </p>
          <div class="danger-actions">
            <Button label="취소" severity="secondary" text size="small" @click="confirmingDelete = false" />
            <Button label="탈퇴하기" severity="danger" size="small" :loading="isDeleting" @click="handleDeleteAccount" />
          </div>
        </template>
      </section>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { Camera, Loader2 } from 'lucide-vue-next'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { imageApi } from '@/api/imageApi'
import { userApi } from '@/api/userApi'
import { linkableProviders, startSocialLink } from '@/utils/socialAuth'
import { getErrorMessage, isValidPassword, PASSWORD_RULE_TEXT } from '@/utils/helpers'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible'])

const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim())

// ===== 프로필 =====
const imageInput = ref(null)
const isUploading = ref(false)
const isSavingProfile = ref(false)
const profile = reactive({ nickname: '', profileImage: '' })

const userInitial = computed(() => currentUser.value?.nickname?.charAt(0).toUpperCase() || 'U')
const profileImageUrl = computed(() => profile.profileImage)
const profileChanged = computed(() =>
  profile.nickname.trim() !== (currentUser.value?.nickname || '') ||
  (profile.profileImage || '') !== (currentUser.value?.profileImage || ''))

// ===== 계정 =====
const emailStep = ref('idle')  // idle | input | code
const verifyingCurrent = ref(false)
const isEmailBusy = ref(false)
const emailForm = reactive({ email: '', code: '' })

const isPasswordOpen = ref(false)
const isSavingPassword = ref(false)
const passwordForm = reactive({ current: '', next: '', confirm: '' })

// ===== 로그인 연결 =====
const providerName = { KAKAO: '카카오', APPLE: 'Apple', GOOGLE: 'Google', NAVER: '네이버' }
const available = linkableProviders().map((p) => p.toUpperCase())
const linkedProviders = computed(() => currentUser.value?.providers || [])
// 이 기기에서 연결할 수 있는 것 + 이미 연결된 것
const providerRows = computed(() => [...new Set([...available, ...linkedProviders.value])])
const canLink = (p) => available.includes(p)
const busyProvider = ref(null)

// ===== 탈퇴 =====
const confirmingDelete = ref(false)
const isDeleting = ref(false)

watch(() => props.visible, (open) => {
  if (!open) return
  profile.nickname = currentUser.value?.nickname || ''
  profile.profileImage = currentUser.value?.profileImage || ''
  cancelEmail()
  isPasswordOpen.value = false
  confirmingDelete.value = false
  // 다른 기기에서 바꾼 내용(연결 등)도 보이도록
  authStore.refreshUser().catch(() => {})
})

function handleVisibleChange(value) {
  emit('update:visible', value)
}

// ----- 프로필 -----
function triggerImageUpload() {
  if (!isUploading.value) imageInput.value?.click()
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
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
    profile.profileImage = response.data.url
  } catch (error) {
    toast.add({ severity: 'error', summary: '업로드 실패', detail: getErrorMessage(error), life: 4000 })
  } finally {
    isUploading.value = false
    event.target.value = ''
  }
}

function removeImage() {
  profile.profileImage = ''
}

async function saveProfile() {
  const nickname = profile.nickname.trim()
  if (nickname.length < 2) {
    toast.add({ severity: 'warn', summary: '입력 오류', detail: '닉네임은 2자 이상이어야 합니다.', life: 3000 })
    return
  }
  if (!profileChanged.value) return
  isSavingProfile.value = true
  try {
    const data = { nickname }
    if ((profile.profileImage || '') !== (currentUser.value?.profileImage || '')) {
      data.profileImage = profile.profileImage || ''  // 빈 문자열이면 서버에서 이미지 제거
    }
    await authStore.updateUserInfo(data)
    toast.add({ severity: 'success', summary: '저장 완료', detail: '프로필을 저장했어요.', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: '저장 실패', detail: getErrorMessage(error), life: 4000 })
  } finally {
    isSavingProfile.value = false
  }
}

// ----- 이메일 (변경·추가·인증은 모두 인증번호 확인 후 반영) -----
function startEmail(current) {
  verifyingCurrent.value = current
  emailForm.email = current ? currentUser.value?.email || '' : ''
  emailForm.code = ''
  emailStep.value = 'input'
  if (current) sendEmailCode()
}

function cancelEmail() {
  emailStep.value = 'idle'
  verifyingCurrent.value = false
  emailForm.email = ''
  emailForm.code = ''
}

async function sendEmailCode() {
  const email = emailForm.email.trim()
  if (!isEmail(email)) return
  if (!verifyingCurrent.value && email.toLowerCase() === (currentUser.value?.email || '').toLowerCase()
    && currentUser.value?.emailVerified) {
    toast.add({ severity: 'info', summary: '이메일', detail: '지금 쓰고 있는 이메일이에요.', life: 3000 })
    return
  }
  isEmailBusy.value = true
  try {
    await userApi.sendEmailChangeCode(email)
    emailForm.code = ''
    emailStep.value = 'code'
  } catch (error) {
    toast.add({ severity: 'error', summary: '인증번호 발송 실패', detail: getErrorMessage(error), life: 4000 })
  } finally {
    isEmailBusy.value = false
  }
}

async function confirmEmail() {
  if (emailForm.code.length !== 6) return
  isEmailBusy.value = true
  try {
    await authStore.changeEmail(emailForm.email.trim(), emailForm.code)
    toast.add({
      severity: 'success',
      summary: verifyingCurrent.value ? '이메일 확인 완료' : '이메일 변경 완료',
      detail: verifyingCurrent.value ? '이메일이 확인됐어요.' : '이제 새 이메일로 로그인해요.',
      life: 3000,
    })
    cancelEmail()
  } catch (error) {
    toast.add({ severity: 'error', summary: '확인 실패', detail: getErrorMessage(error), life: 4000 })
  } finally {
    isEmailBusy.value = false
  }
}

// ----- 비밀번호 -----
function openPassword() {
  passwordForm.current = ''
  passwordForm.next = ''
  passwordForm.confirm = ''
  isPasswordOpen.value = true
}

async function savePassword() {
  const hasPassword = currentUser.value?.hasPassword
  if (hasPassword && !passwordForm.current) {
    toast.add({ severity: 'warn', summary: '입력 오류', detail: '현재 비밀번호를 입력해주세요.', life: 3000 })
    return
  }
  if (!isValidPassword(passwordForm.next)) {
    toast.add({ severity: 'warn', summary: '입력 오류', detail: PASSWORD_RULE_TEXT, life: 3000 })
    return
  }
  if (passwordForm.next !== passwordForm.confirm) {
    toast.add({ severity: 'warn', summary: '입력 오류', detail: '새 비밀번호가 일치하지 않습니다.', life: 3000 })
    return
  }
  isSavingPassword.value = true
  try {
    const data = { newPassword: passwordForm.next }
    if (hasPassword) data.currentPassword = passwordForm.current
    await authStore.updateUserInfo(data)
    emit('update:visible', false)
    // 비밀번호를 바꾸면 서버가 모든 기기의 로그인을 끊으므로 다시 로그인하게 한다
    toast.add({
      severity: 'success',
      summary: hasPassword ? '비밀번호 변경 완료' : '비밀번호 설정 완료',
      detail: '보안을 위해 모든 기기에서 로그아웃되었습니다. 다시 로그인해주세요.',
      life: 5000,
    })
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    toast.add({ severity: 'error', summary: '변경 실패', detail: getErrorMessage(error), life: 4000 })
  } finally {
    isSavingPassword.value = false
  }
}

// ----- 로그인 연결 -----
async function link(provider) {
  busyProvider.value = provider
  try {
    // 웹의 리다이렉트 방식은 페이지가 이동했다가 돌아오며 결과를 알려준다
    const done = await startSocialLink(provider.toLowerCase())
    if (done) {
      await authStore.refreshUser()
      toast.add({ severity: 'success', summary: '연결 완료', detail: `이제 ${providerName[provider]}로도 로그인할 수 있어요.`, life: 3000 })
    }
  } catch (error) {
    if (!error?.cancelled) {
      toast.add({ severity: 'error', summary: '연결 실패', detail: getErrorMessage(error), life: 4000 })
    }
  } finally {
    busyProvider.value = null
  }
}

async function unlink(provider) {
  if (!confirm(`${providerName[provider] || provider} 연결을 해제할까요? 해제하면 이 방법으로는 로그인할 수 없어요.`)) return
  busyProvider.value = provider
  try {
    await userApi.unlinkSocial(provider.toLowerCase())
    await authStore.refreshUser()
    toast.add({ severity: 'success', summary: '연결 해제', detail: `${providerName[provider] || provider} 연결을 해제했어요.`, life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: '해제 실패', detail: getErrorMessage(error), life: 5000 })
  } finally {
    busyProvider.value = null
  }
}

// ----- 탈퇴 -----
async function handleDeleteAccount() {
  isDeleting.value = true
  try {
    await authStore.deleteAccount()
    emit('update:visible', false)
    toast.add({ severity: 'success', summary: '탈퇴 완료', detail: '회원 탈퇴가 완료되었습니다.', life: 3000 })
    router.push('/')
  } catch (error) {
    toast.add({ severity: 'error', summary: '탈퇴 실패', detail: getErrorMessage(error), life: 5000 })
  } finally {
    isDeleting.value = false
    confirmingDelete.value = false
  }
}
</script>

<style scoped>
.profile { display: flex; flex-direction: column; gap: 1.25rem; }

.section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--surface-border);
}
.section-title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  letter-spacing: 0.02em;
}
.section-desc { margin: -0.25rem 0 0; font-size: 0.75rem; color: var(--text-color-secondary); }

.profile-row { display: flex; align-items: center; gap: 1rem; }
.nickname-field { flex: 1; display: flex; flex-direction: column; gap: 0.375rem; min-width: 0; }
.nickname-field label, .inline-form label { font-size: 0.8125rem; font-weight: 500; color: var(--text-color); }

.avatar-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-image { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-700) 100%);
  color: var(--primary-color-text);
  font-size: 1.5rem;
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
.avatar-wrapper:hover .avatar-overlay, .avatar-wrapper:focus-visible .avatar-overlay { opacity: 1; }
.overlay-icon { width: 20px; height: 20px; color: white; }
.overlay-icon.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.25rem;
}
.item-main { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
.item-main.provider { flex-direction: row; align-items: center; gap: 0.5rem; }
.item-label { font-size: 0.75rem; color: var(--text-color-secondary); }
.item-value { font-size: 0.875rem; color: var(--text-color); word-break: break-all; }
.item-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }

.badge {
  display: inline-block;
  margin-left: 0.25rem;
  padding: 0 0.375rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  vertical-align: middle;
}
.badge.ok { color: #16a34a; background: rgba(34, 197, 94, 0.12); }
.badge.warn { color: #d97706; background: rgba(245, 158, 11, 0.14); }

.provider-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--surface-border); flex-shrink: 0; }
.provider-dot.kakao { background: #fee500; }
.provider-dot.apple { background: #000; border: 1px solid #555; }
.provider-dot.google { background: #4285f4; }

.inline-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  background: var(--surface-ground);
}

.row-actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; }

.text-btn {
  background: none;
  border: none;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
  cursor: pointer;
}
.text-btn:hover:not(:disabled) { background: var(--surface-hover); color: var(--text-color); }
.text-btn.strong { color: var(--primary-color); font-weight: 600; }
.text-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.link-btn {
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  font-size: inherit;
  color: var(--text-color);
  text-decoration: underline;
  cursor: pointer;
}

.w-full { width: 100%; }
:deep(.p-password) { width: 100%; }
:deep(.p-inputtext) { height: 2.5rem; }

.hint { font-size: 0.75rem; color: var(--text-color-secondary); margin: 0; line-height: 1.5; word-break: keep-all; }

.danger-zone { padding-top: 0.25rem; }
.danger-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
  text-decoration: underline;
  cursor: pointer;
}
.danger-link:hover { color: #ef4444; }
.danger-text { margin: 0 0 0.75rem; font-size: 0.8125rem; color: var(--text-color-secondary); line-height: 1.6; word-break: keep-all; }
.danger-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
