import { isNativeApp } from './platform'

/**
 * 로그인 토큰 보관.
 * - 실행 중에는 localStorage를 바로 읽는다 (요청마다 동기로 읽어야 하므로)
 * - 스토어 앱에서는 휴대폰 보안 저장소(iOS 키체인, 안드로이드 키스토어)에도 함께 저장하고,
 *   앱을 켤 때 되살린다. 웹뷰 저장소는 저장 공간이 부족하면 OS가 지울 수 있어서
 *   그 경우 갑자기 로그아웃되던 문제를 막는다.
 */
const KEYS = ['accessToken', 'refreshToken']

// 주의: Capacitor 플러그인 객체는 어떤 속성이든 응답하므로(then 포함) Promise 결과로 그대로 돌려주면
// "아직 안 끝난 작업"으로 취급되어 영원히 기다리게 된다. 반드시 다른 객체로 감싸서 돌려준다.
// async 함수의 반환값도 마찬가지라, { storage } 상태로 넘기고 쓰는 곳에서 꺼낸다.
let securePromise = null
function getSecureStorage() {
  if (!isNativeApp) return Promise.resolve({ storage: null })
  if (!securePromise) {
    securePromise = import('@aparajita/capacitor-secure-storage')
      .then((m) => ({ storage: m.SecureStorage }))
      .catch(() => ({ storage: null }))
  }
  return securePromise
}

/** 일정 시간 안에 끝나지 않으면 기다리지 않는다 (앱 시작이 저장소 때문에 멈추지 않게) */
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(undefined), ms))])
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
    const { storage } = await getSecureStorage()
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
  const { storage } = (await withTimeout(getSecureStorage(), 1500)) || {}
  if (!storage) return
  for (const key of KEYS) {
    if (safeLocal(() => localStorage.getItem(key))) continue
    try {
      const value = await withTimeout(storage.getItem(key), 1500)
      if (value) safeLocal(() => localStorage.setItem(key, value))
    } catch {
      // 무시
    }
  }
  // 예전 버전에서 웹뷰에만 저장돼 있던 토큰도 보안 저장소로 옮겨 둔다
  persist()
}
