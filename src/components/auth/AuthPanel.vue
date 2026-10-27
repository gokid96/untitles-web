<template>
  <div class="auth-panel">
    <div class="panel-logo">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="currentColor" d="M50 8 C52 30 58 36 80 38 C58 40 52 46 50 68 C48 46 42 40 20 38 C42 36 48 30 50 8 Z"/>
        <path fill="currentColor" d="M50 50 C51 62 54 65 66 66 C54 67 51 70 50 82 C49 70 46 67 34 66 C46 65 49 62 50 50 Z"/>
        <path fill="currentColor" opacity="0.5" d="M78 70 C78.5 76 80 77.5 86 78 C80 78.5 78.5 80 78 86 C77.5 80 76 78.5 70 78 C76 77.5 77.5 76 78 70 Z"/>
      </svg>
      <span>Untitles</span>
    </div>

    <!-- 1. 시작: 소셜 로그인 + 이메일 -->
    <div v-if="step === 'start'" class="step">
      <h2 class="title">시작하기</h2>
      <p class="subtitle">로그인하거나 새 계정을 만들어요</p>

      <div class="buttons">
        <button v-for="provider in providers" :key="provider" type="button" class="social-btn" :class="provider"
          :disabled="busy" @click="social(provider)">
          <svg v-if="provider === 'apple'" viewBox="0 0 24 24" class="social-icon" aria-hidden="true">
            <path fill="currentColor" d="M16.37 12.62c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.86-.76-1.47.02-2.83.86-3.59 2.17-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.5zM14.2 6.15c.6-.73 1.01-1.75.9-2.77-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.69-.92 2.69.97.07 1.96-.5 2.56-1.23z"/>
          </svg>
          <svg v-else-if="provider === 'kakao'" viewBox="0 0 24 24" class="social-icon" aria-hidden="true">
            <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" class="social-icon" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ providerLabel[provider] }}
        </button>

        <button type="button" class="social-btn email" :disabled="busy" @click="goEmail">
          <svg viewBox="0 0 24 24" class="social-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
          이메일로 계속하기
        </button>
      </div>
    </div>

    <!-- 2. 이메일(또는 예전 아이디) 입력 → 가입 여부에 따라 로그인/가입으로 -->
    <form v-else-if="step === 'email'" class="step" @submit.prevent="submitEmail">
      <h2 class="title">이메일로 계속하기</h2>
      <p class="subtitle">가입한 적이 없으면 새 계정을 만들어요</p>
      <div class="form-group">
        <label for="auth-email">이메일</label>
        <input id="auth-email" ref="emailInput" v-model.trim="email" type="text" inputmode="email" autocomplete="username"
          autocapitalize="off" spellcheck="false" placeholder="example@email.com" />
        <small class="hint">예전에 아이디로 가입했다면 아이디를 입력하세요</small>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="submit-btn" :disabled="busy || !email">{{ busy ? '확인 중...' : '계속' }}</button>
      <button type="button" class="back-link" @click="reset">← 다른 방법으로 로그인</button>
    </form>

    <!-- 3a. 로그인 -->
    <form v-else-if="step === 'password'" class="step" @submit.prevent="submitLogin">
      <h2 class="title">로그인</h2>
      <p class="subtitle identity">{{ email }}</p>
      <div v-if="link" class="link-notice">
        이미 이 이메일로 가입한 계정이 있어요.<br />
        비밀번호로 로그인하면 <strong>{{ linkProviderName }}</strong> 계정이 연결되어, 다음부터 {{ linkProviderName }}로 바로 로그인할 수 있어요.
      </div>
      <div class="form-group">
        <label for="auth-password">비밀번호</label>
        <input id="auth-password" ref="passwordInput" v-model="password" type="password" autocomplete="current-password" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="submit-btn" :disabled="busy || !password">{{ busy ? '로그인 중...' : '로그인' }}</button>
      <button type="button" class="back-link" @click="isForgotOpen = true">비밀번호를 잊으셨나요?</button>
      <button type="button" class="back-link" @click="changeEmail">← 다른 이메일</button>
    </form>

    <!-- 3b. 가입: 인증 코드 -->
    <form v-else-if="step === 'verify'" class="step" @submit.prevent="submitCode">
      <h2 class="title">이메일 확인</h2>
      <p class="subtitle"><strong>{{ email }}</strong>(으)로 6자리 인증번호를 보냈어요. 메일이 오지 않으면 스팸함도 확인해 주세요.</p>
      <div class="form-group">
        <label for="auth-code">인증번호</label>
        <input id="auth-code" ref="codeInput" v-model.trim="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code"
          placeholder="6자리 숫자" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="submit-btn" :disabled="busy || code.length !== 6">{{ busy ? '확인 중...' : '확인' }}</button>
      <button type="button" class="back-link" :disabled="busy" @click="sendCode">인증번호 다시 받기</button>
      <button type="button" class="back-link" @click="step = 'email'">← 다른 이메일</button>
    </form>

    <!-- 3c. 가입: 비밀번호·닉네임 -->
    <form v-else-if="step === 'profile'" class="step" @submit.prevent="submitSignup">
      <h2 class="title">계정 만들기</h2>
      <p class="subtitle identity">{{ email }} ✓</p>
      <div class="form-group">
        <label for="auth-new-password">비밀번호</label>
        <input id="auth-new-password" ref="newPasswordInput" v-model="password" type="password" autocomplete="new-password"
          placeholder="영문과 숫자 포함 8자 이상" />
      </div>
      <div class="form-group">
        <label for="auth-nickname">닉네임</label>
        <input id="auth-nickname" v-model.trim="nickname" type="text" maxlength="50" autocomplete="nickname" placeholder="2자 이상" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="submit-btn" :disabled="busy">{{ busy ? '가입 중...' : '가입하고 시작하기' }}</button>
    </form>

    <p class="legal">
      계속하면 <router-link to="/terms" @click="$emit('navigate')">이용약관</router-link> 및
      <router-link to="/privacy" @click="$emit('navigate')">개인정보처리방침</router-link>에 동의하게 됩니다.
    </p>

    <ForgotPasswordModal v-model:visible="isForgotOpen" :initial-email="email" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal.vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/authStore'
import { usePostStore } from '@/stores/postStore'
import { emailApi } from '@/api/emailApi'
import { userApi } from '@/api/userApi'
import { availableProviders, startSocialLogin } from '@/utils/socialAuth'
import { getErrorMessage, restoreGuestDraft, isValidPassword, PASSWORD_RULE_TEXT } from '@/utils/helpers'

const props = defineProps({
  // 'start'(소셜 + 이메일) | 'email'(바로 이메일 입력)
  initialStep: { type: String, default: 'start' },
  // 웹 소셜 로그인이 기존 계정과 겹쳐 돌아온 연결 토큰 (/login?link=...)
  linkToken: { type: String, default: '' },
})
const emit = defineEmits(['done', 'navigate'])

const toast = useToast()
const authStore = useAuthStore()
const postStore = usePostStore()

const providers = availableProviders()
const providerLabel = { apple: 'Apple로 계속하기', kakao: '카카오로 계속하기', google: 'Google로 계속하기' }

const step = ref(providers.length ? props.initialStep : 'email')
const email = ref('')
const password = ref('')
const code = ref('')
const nickname = ref('')
const error = ref('')
const busy = ref(false)
const isForgotOpen = ref(false)

// 소셜 로그인 이메일이 기존 계정과 겹친 경우: { token, provider } → 비밀번호로 로그인하면 연결
const link = ref(null)
const providerNames = { KAKAO: '카카오', APPLE: 'Apple', GOOGLE: 'Google', NAVER: '네이버' }
const linkProviderName = computed(() => providerNames[link.value?.provider] || '소셜')

const emailInput = ref(null)
const passwordInput = ref(null)
const codeInput = ref(null)
const newPasswordInput = ref(null)

const focusTargets = { email: emailInput, password: passwordInput, verify: codeInput, profile: newPasswordInput }
watch(step, async (value) => {
  error.value = ''
  await nextTick()
  focusTargets[value]?.value?.focus()
})

async function enterLinkMode({ linkToken, email: knownEmail, provider }) {
  let target = knownEmail
  let linkProvider = provider
  if (!target) {
    const { data } = await userApi.getPendingLink(linkToken)
    target = data.email
    linkProvider = data.provider
  }
  link.value = { token: linkToken, provider: linkProvider }
  email.value = target || ''
  password.value = ''
  // 이메일을 모르면(예전 아이디 계정) 이메일 입력부터
  step.value = target ? 'password' : 'email'
}

onMounted(() => {
  if (props.linkToken) run(() => enterLinkMode({ linkToken: props.linkToken }))
})

function changeEmail() {
  link.value = null
  step.value = 'email'
}

function reset() {
  link.value = null
  step.value = providers.length ? 'start' : 'email'
  password.value = ''
  code.value = ''
  error.value = ''
}

function goEmail() {
  step.value = 'email'
}

async function run(task) {
  busy.value = true
  error.value = ''
  try {
    await task()
  } catch (e) {
    if (!e?.cancelled) error.value = getErrorMessage(e)
  } finally {
    busy.value = false
  }
}

async function finish() {
  await restoreGuestDraft(postStore)
  emit('done')
}

function social(provider) {
  return run(async () => {
    let loginResponse
    try {
      loginResponse = await startSocialLogin(provider)
    } catch (e) {
      if (e?.linkRequired) return enterLinkMode(e)
      throw e
    }
    await authStore.completeLogin(loginResponse)
    await finish()
  })
}

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

function submitEmail() {
  return run(async () => {
    const value = email.value
    if (!value.includes('@')) {
      // 예전 방식 아이디
      step.value = 'password'
      return
    }
    if (!isEmail(value)) throw new Error('이메일 형식이 올바르지 않습니다')
    const { data } = await emailApi.checkEmail(value)
    if (data?.available === false) {
      step.value = 'password'
    } else {
      await emailApi.sendCode(value)
      code.value = ''
      step.value = 'verify'
    }
  })
}

function sendCode() {
  return run(async () => {
    await emailApi.sendCode(email.value)
    code.value = ''
  })
}

function submitLogin() {
  return run(async () => {
    const linked = link.value
    await authStore.login(email.value, password.value, linked?.token)
    if (linked) {
      toast.add({ severity: 'success', summary: '연결 완료', detail: `다음부터 ${linkProviderName.value}로도 로그인할 수 있어요.`, life: 4000 })
      link.value = null
    }
    await finish()
  })
}

function submitCode() {
  return run(async () => {
    await emailApi.verifyCode(email.value, code.value)
    password.value = ''
    if (!nickname.value) nickname.value = email.value.split('@')[0].slice(0, 20)
    step.value = 'profile'
  })
}

function submitSignup() {
  return run(async () => {
    if (!isValidPassword(password.value)) throw new Error(PASSWORD_RULE_TEXT)
    if (nickname.value.length < 2) throw new Error('닉네임은 2자 이상이어야 합니다')
    await authStore.register({ email: email.value, password: password.value, nickname: nickname.value })
    await finish()
  })
}
</script>

<style scoped>
.auth-panel { display: flex; flex-direction: column; }

.panel-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  color: var(--text-color);
}
.panel-logo svg { width: 28px; height: 28px; }
.panel-logo span { font-size: 1.25rem; font-weight: 500; letter-spacing: 0.05em; }

.step { display: flex; flex-direction: column; gap: 0.875rem; }

.title { margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--text-color); text-align: center; }
.subtitle { margin: -0.375rem 0 0.25rem; font-size: 0.8125rem; color: var(--text-color-secondary); text-align: center; line-height: 1.5; word-break: keep-all; }
.subtitle.identity { word-break: break-all; }

.buttons { display: flex; flex-direction: column; gap: 0.625rem; }

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 46px;
  padding: 0.75rem 1rem;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}
.social-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.social-btn:hover:not(:disabled) { opacity: 0.9; }
.social-icon { width: 18px; height: 18px; flex-shrink: 0; }
.social-btn.apple { background: #000; color: #fff; border-color: #333; }
.social-btn.kakao { background: #FEE500; color: rgba(0, 0, 0, 0.85); }
.social-btn.google { background: #fff; color: #1f1f1f; border-color: #dadce0; }
.social-btn.email { background: transparent; color: var(--text-color); border-color: var(--surface-border); }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8125rem; font-weight: 500; color: var(--text-color-secondary); }
.form-group input {
  padding: 0.7rem 0.875rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  color: var(--text-color);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}
.form-group input:focus { border-color: var(--primary-color); }
.hint { font-size: 0.75rem; color: var(--text-color-secondary); }

.link-notice {
  padding: 0.75rem 0.875rem;
  border-radius: 10px;
  background: var(--surface-hover, rgba(127, 127, 127, 0.1));
  border: 1px solid var(--surface-border);
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--text-color);
  word-break: keep-all;
}

.error { margin: 0; font-size: 0.8125rem; color: #ef4444; line-height: 1.5; word-break: keep-all; }

.submit-btn {
  min-height: 46px;
  padding: 0.75rem;
  background: var(--primary-color);
  color: var(--primary-color-text);
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.submit-btn:hover:not(:disabled) { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.back-link {
  align-self: center;
  border: none;
  background: none;
  color: var(--text-color-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0.25rem;
}
.back-link:hover { color: var(--text-color); }

.legal { margin: 1.25rem 0 0; text-align: center; font-size: 0.75rem; color: var(--text-color-secondary); line-height: 1.5; }
.legal a { color: var(--text-color-secondary); text-decoration: underline; }
</style>
