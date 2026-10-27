import { isNativeApp, nativePlatform } from './platform'
import { userApi } from '@/api/userApi'

/**
 * 소셜 로그인 (카카오·애플·구글)
 *
 * - 앱(iOS·Android)
 *   - 애플(iOS)·구글: 앱 안에서 바로 뜨는 로그인 창 → ID 토큰을 서버에 보내 로그인
 *   - 카카오: 카카오 로그인 페이지를 앱 안 브라우저로 열고, 끝나면 앱 전용 주소(net.untitles.app://oauth/callback)로
 *     돌아온 일회용 코드를 토큰으로 교환
 * - 웹
 *   - 카카오·구글: 서버를 거치는 리다이렉트 → /oauth/callback?code=... 에서 교환
 *   - 애플: 애플 JS 팝업 → ID 토큰
 *
 * 어떤 제공자를 보여줄지는 빌드 설정 VITE_SOCIAL_PROVIDERS(예: "kakao,apple,google")로 정한다.
 * 콘솔 설정을 마친 제공자만 켠다.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8070/api/v1'
const OAUTH_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
const APP_CALLBACK = 'net.untitles.app://oauth/callback'

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || ''
const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID || ''
const APPLE_WEB_CLIENT_ID = import.meta.env.VITE_APPLE_WEB_CLIENT_ID || ''  // 웹용 Services ID
// 애플이 로그인 결과를 보내는 우리 서버 주소 (애플 개발자 사이트의 Return URL과 같아야 함)
const APPLE_WEB_REDIRECT_URI = `${API_BASE_URL}/auth/social/apple/callback`

const enabled = new Set(
  (import.meta.env.VITE_SOCIAL_PROVIDERS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
)

/** 이 기기에서 보여줄 소셜 로그인 버튼 (순서대로) */
export function availableProviders() {
  const list = []
  // 애플: iPhone 앱과 웹. 안드로이드 앱에서는 숨김
  if (enabled.has('apple') && (nativePlatform === 'ios' || (!isNativeApp && APPLE_WEB_CLIENT_ID))) list.push('apple')
  if (enabled.has('kakao')) list.push('kakao')
  if (enabled.has('google') && (!isNativeApp || GOOGLE_WEB_CLIENT_ID)) list.push('google')
  return list
}

/**
 * 소셜 계정의 이메일로 이미 가입한 계정이 있음 → 그 계정 비밀번호로 로그인하면 연결된다.
 * 앱 로그인(409 응답)과 앱 카카오 로그인(돌아온 주소의 link) 모두 이 오류로 알린다.
 */
export class SocialLinkRequired extends Error {
  constructor({ linkToken, email, provider }) {
    super('이미 이 이메일로 가입한 계정이 있어요.')
    this.linkRequired = true
    this.linkToken = linkToken
    this.email = email
    this.provider = provider
  }
}

/** 응답 오류가 연결 필요(409 + linkToken)면 SocialLinkRequired로 바꾼다 */
function toLinkRequired(error) {
  const data = error?.response?.status === 409 ? error.response.data?.data : null
  return data?.linkToken ? new SocialLinkRequired(data) : error
}

export class SocialLoginCancelled extends Error {
  constructor() {
    super('로그인을 취소했습니다.')
    this.cancelled = true
  }
}

/**
 * 소셜 로그인을 시작한다.
 * @returns 로그인 응답(토큰 포함). 웹 리다이렉트 방식이면 페이지가 이동하므로 돌아오지 않는다.
 */
export async function startSocialLogin(provider) {
  if (isNativeApp) {
    if (provider === 'kakao') return loginWithBrowser('kakao')
    if (provider === 'apple' || provider === 'google') return loginNative(provider)
  } else {
    if (provider === 'apple') return loginWithAppleRedirect()
    // 카카오·구글: 서버 리다이렉트 (끝나면 /oauth/callback?code=...&state=...)
    window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}?client_state=${rememberOAuthState()}`
    return new Promise(() => {})
  }
  throw new Error('지원하지 않는 로그인 방법입니다.')
}

/** 웹 리다이렉트 로그인을 마치고 받은 일회용 코드를 토큰으로 교환 */
export async function exchangeLoginCode(code) {
  const response = await userApi.exchangeLoginCode(code)
  return response.data
}

// ===== 앱: 애플·구글 (앱 안 로그인 창) =====

let pluginPromise = null
function getSocialLogin() {
  if (!pluginPromise) {
    pluginPromise = import('@capgo/capacitor-social-login').then(async ({ SocialLogin }) => {
      const options = {}
      if (nativePlatform === 'ios') options.apple = { clientId: 'net.untitles.app', useProperTokenExchange: true }
      if (GOOGLE_WEB_CLIENT_ID) {
        options.google = {
          webClientId: GOOGLE_WEB_CLIENT_ID,
          iOSClientId: GOOGLE_IOS_CLIENT_ID || undefined,
          iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
          mode: 'online',
        }
      }
      await SocialLogin.initialize(options)
      return SocialLogin
    })
    pluginPromise.catch(() => {
      pluginPromise = null
    })
  }
  return pluginPromise
}

function randomNonce() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

function isCancel(error) {
  const message = `${error?.message || ''} ${error?.code || ''}`.toLowerCase()
  return /cancel|1001|12501|user denied|popup_closed/.test(message)
}

// 앱 안 로그인 창으로 제공자의 증명(ID 토큰 등)을 받는다
async function nativeCredential(provider) {
  const SocialLogin = await getSocialLogin()
  try {
    if (provider === 'apple') {
      // 애플은 nonce의 해시를 토큰에 넣는다. 서버는 원문으로 해시를 다시 계산해 확인한다
      const rawNonce = randomNonce()
      const { result } = await SocialLogin.login({
        provider: 'apple',
        options: { scopes: ['email', 'name'], nonce: await sha256Hex(rawNonce) },
      })
      const name = [result.profile?.familyName, result.profile?.givenName].filter(Boolean).join('') || undefined
      return { idToken: result.idToken, authorizationCode: result.authorizationCode, nonce: rawNonce, name }
    }
    const { result } = await SocialLogin.login({ provider: 'google', options: { scopes: ['email', 'profile'] } })
    if (!result?.idToken) throw new Error('구글 로그인 정보를 받지 못했습니다.')
    return { idToken: result.idToken }
  } catch (error) {
    if (isCancel(error)) throw new SocialLoginCancelled()
    throw error
  }
}

async function loginNative(provider) {
  const credential = await nativeCredential(provider)
  try {
    const response = await userApi.socialLogin(provider, credential)
    return response.data
  } catch (error) {
    throw toLinkRequired(error)
  }
}

// ===== 앱: 카카오 (앱 안 브라우저 → 앱 전용 주소로 복귀) =====

let pendingBrowserLogin = null

function loginWithBrowser(provider) {
  return openAppBrowser(`${OAUTH_BASE_URL}/oauth2/authorization/${provider}?target=app`, async (params) => {
    const link = params.get('link')
    if (link) throw new SocialLinkRequired({ linkToken: link, provider: provider.toUpperCase() })
    const error = params.get('error')
    if (error) throw new Error(error)
    return exchangeLoginCode(params.get('code'))
  })
}

// 앱 안 브라우저로 서버의 소셜 로그인 주소를 열고, 앱 전용 주소로 돌아오면 handle(주소의 파라미터)로 결과를 만든다
async function openAppBrowser(url, handle) {
  const [{ Browser }, { App }] = await Promise.all([import('@capacitor/browser'), import('@capacitor/app')])

  if (pendingBrowserLogin) pendingBrowserLogin.reject(new SocialLoginCancelled())

  return new Promise((resolve, reject) => {
    const handles = []
    let settled = false
    let callbackReceived = false
    const cleanup = () => {
      handles.forEach((h) => h?.remove?.())
      pendingBrowserLogin = null
    }
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      cleanup()
      fn(value)
    }
    pendingBrowserLogin = { reject: (e) => finish(reject, e) }

    App.addListener('appUrlOpen', async ({ url }) => {
      if (!url || !url.startsWith(APP_CALLBACK)) return
      callbackReceived = true
      Browser.close().catch(() => {})
      const params = new URL(url.replace('net.untitles.app://', 'https://app.local/')).searchParams
      try {
        finish(resolve, await handle(params))
      } catch (e) {
        finish(reject, e)
      }
    }).then((h) => handles.push(h))

    // 사용자가 브라우저를 그냥 닫으면 취소 (앱으로 돌아오는 주소가 오기 전에)
    Browser.addListener('browserFinished', () => {
      setTimeout(() => {
        if (!callbackReceived) finish(reject, new SocialLoginCancelled())
      }, 1500)
    }).then((h) => handles.push(h))

    Browser.open({ url, presentationStyle: 'popover' })
      .catch((e) => finish(reject, e))
  })
}

// ===== 웹: 애플 (애플 로그인 페이지로 이동 → 우리 서버가 결과를 받아 /oauth/callback 으로) =====

export const APPLE_STATE_KEY = 'untitles:apple-state'
export const OAUTH_STATE_KEY = 'untitles:oauth-state'

/**
 * 웹 소셜 로그인(카카오·구글)을 시작할 때 무작위 값을 기억해 두고 서버를 거쳐 돌려받는다.
 * 돌아온 값이 다르거나 없으면 이 탭에서 시작한 로그인이 아니므로 거부한다 (남의 계정으로 로그인시키는 위조 방지)
 */
function rememberOAuthState() {
  const state = randomNonce()
  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, state)
  } catch {
    // 저장소를 못 쓰면 돌아왔을 때 확인에 실패해 다시 시도하게 된다
  }
  return state
}

function loginWithAppleRedirect(linkIntent) {
  // 위조된 로그인 결과를 막기 위해 무작위 state를 기억해 두고, 돌아왔을 때 같은지 확인한다.
  // 내 정보에서 연결하기면 state 끝에 ".일회용표시"를 붙인다 (서버가 연결로 처리)
  const state = linkIntent ? `${randomNonce()}.${linkIntent}` : randomNonce()
  try {
    sessionStorage.setItem(APPLE_STATE_KEY, state)
  } catch {
    // 저장소를 못 쓰면 state 확인 없이 진행
  }
  const params = new URLSearchParams({
    client_id: APPLE_WEB_CLIENT_ID,
    redirect_uri: APPLE_WEB_REDIRECT_URI,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state,
  })
  window.location.href = `https://appleid.apple.com/auth/authorize?${params}`
  return new Promise(() => {})
}

// ===== 내 정보: 로그인한 상태에서 소셜 계정 연결 =====

/**
 * 소셜 계정을 지금 계정에 연결한다.
 * @returns true면 연결 완료. 웹 리다이렉트 방식은 페이지가 이동하므로 돌아오지 않는다 (/oauth/callback?linked=...)
 */
export async function startSocialLink(provider) {
  if (isNativeApp && (provider === 'apple' || provider === 'google')) {
    await userApi.linkSocial(provider, await nativeCredential(provider))
    return true
  }
  const intent = await userApi.socialLinkIntent()
  if (isNativeApp) {
    return openAppBrowser(`${OAUTH_BASE_URL}/oauth2/authorization/${provider}?target=app&link=${intent}`, async (params) => {
      const error = params.get('error')
      if (error) throw new Error(error)
      return true
    })
  }
  if (provider === 'apple') return loginWithAppleRedirect(intent)
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}?link=${intent}&client_state=${rememberOAuthState()}`
  return new Promise(() => {})
}

/** 연결할 수 있는 제공자 (이 기기에서 쓸 수 있는 것) */
export function linkableProviders() {
  return availableProviders()
}
