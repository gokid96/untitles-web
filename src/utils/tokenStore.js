import { isNativeApp } from './platform'

/**
 * 로그인 토큰 보관.
 * - 실행 중에는 localStorage를 바로 읽는다 (요청마다 동기로 읽어야 하므로)
 * - 스토어 앱에서는 휴대폰 보안 저장소(iOS 키체인, 안드로이드 키스토어)에도 함께 저장하고,
 *   앱을 켤 때 되살린다. 웹뷰 저장소는 저장 공간이 부족하면 OS가 지울 수 있어서
 *   그 경우 갑자기 로그아웃되던 문제를 막는다.
 */
const KEYS = ['accessToken', 'refreshToken']

let securePromise = null
function getSecureStorage() {
  if (!isNativeApp) return Promise.resolve(null)
  if (!securePromise) {
    securePromise = import('@aparajita/capacitor-secure-storage')
      .then((m) => m.SecureStorage)
      .catch(() => null)
  }
  return securePromise
}

function safeLocal(fn) {
  try {
    return fn()
  } catch {
    return null
  }
}

// 보안 저장소 쓰기는 순서대로 (빠르게 연달아 바뀌어도 마지막 값이 남게)
let writeChain = Promise.resolve()
function persist() {
  const snapshot = Object.fromEntries(KEYS.map((key) => [key, safeLocal(() => localStorage.getItem(key))]))
  writeChain = writeChain.then(async () => {
    const storage = await getSecureStorage()
    if (!storage) return
    for (const key of KEYS) {
      try {
        if (snapshot[key]) await storage.setItem(key, snapshot[key])
        else await storage.removeItem(key)
      } catch {
        // 보안 저장소 오류는 무시 (localStorage에는 남아 있다)
      }
    }
  })
  return writeChain
}

export function setTokens(accessToken, refreshToken) {
  safeLocal(() => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  })
  persist()
}

export function clearTokens() {
  safeLocal(() => KEYS.forEach((key) => localStorage.removeItem(key)))
  persist()
}

/** 앱 시작 시 한 번: 웹뷰 저장소가 비었으면 보안 저장소의 토큰을 되살린다 */
export async function restoreTokens() {
  const storage = await getSecureStorage()
  if (!storage) return
  for (const key of KEYS) {
    if (safeLocal(() => localStorage.getItem(key))) continue
    try {
      const value = await storage.getItem(key)
      if (value) safeLocal(() => localStorage.setItem(key, value))
    } catch {
      // 무시
    }
  }
  // 예전 버전에서 웹뷰에만 저장돼 있던 토큰도 보안 저장소로 옮겨 둔다
  persist()
}
