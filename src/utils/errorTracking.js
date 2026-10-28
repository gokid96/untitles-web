import * as Sentry from '@sentry/vue'
import { isNativeApp, nativePlatform } from './platform'

/**
 * 오류 추적 (Sentry). VITE_SENTRY_DSN이 설정된 빌드에서만 켜진다.
 * - 화면에서 난 오류(처리되지 않은 오류, Vue 컴포넌트 오류, 처리되지 않은 Promise 거부)를 모은다
 * - 개인정보: 이메일·IP를 보내지 않고(sendDefaultPii: false) 사용자는 번호로만 구분한다.
 *   노트 내용이 섞이지 않도록 요청 본문과 입력 기록은 지운다
 * - 성능 측정·화면 녹화는 쓰지 않는다 (오류만)
 */
const DSN = import.meta.env.VITE_SENTRY_DSN || ''

export function initErrorTracking(app, router) {
  if (!DSN) return
  Sentry.init({
    app,
    dsn: DSN,
    environment: import.meta.env.PROD ? (isNativeApp ? `app-${nativePlatform}` : 'web') : 'development',
    release: import.meta.env.VITE_APP_RELEASE || undefined,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    // 방문 세션 집계는 쓰지 않는다 (IP를 서버가 추정해 붙이므로) — 오류만 보냄
    integrations: (defaults) => defaults.filter((i) => i.name !== 'BrowserSession'),
    // 사용자 환경 문제라 고칠 수 없는 흔한 소음
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network Error',
      'Request aborted',
      'Non-Error promise rejection captured',
    ],
    beforeSend(event) {
      if (event.request) {
        delete event.request.data
        delete event.request.cookies
        if (event.request.url) event.request.url = event.request.url.split('?')[0]
      }
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      // 입력·클릭한 요소의 글자(노트 내용일 수 있음)는 남기지 않는다
      if (breadcrumb.category === 'ui.input') return null
      if (breadcrumb.category === 'console' && breadcrumb.level !== 'error' && breadcrumb.level !== 'warning') return null
      if (breadcrumb.data?.url) breadcrumb.data.url = String(breadcrumb.data.url).split('?')[0]
      return breadcrumb
    },
  })
  Sentry.setTag('route', router?.currentRoute?.value?.name || '')
  router?.afterEach((to) => Sentry.setTag('route', String(to.name || to.path)))
}

/** 로그인한 사용자 번호를 오류에 붙인다 (이메일·닉네임은 보내지 않음) */
export function setErrorUser(userId) {
  if (!DSN) return
  Sentry.setUser(userId ? { id: String(userId) } : null)
}

/** 직접 잡은 오류를 보낸다 (예: 처리했지만 원인을 알고 싶은 오류) */
export function reportError(error, context) {
  if (!DSN) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
