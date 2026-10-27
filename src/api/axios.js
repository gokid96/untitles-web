import axios from 'axios'
import router from '@/router'
import { useAppStore } from '@/stores/appStore'
import { setTokens, clearTokens } from '@/utils/tokenStore'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8070/api/v1'

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

const AUTH_PAGES = ['/login', '/register', '/']

// 토큰 재발급을 시도하지 않는 요청 (로그인·가입·재발급 자체)
const NO_REFRESH_URLS = ['/auth/login', '/auth/signup', '/auth/refresh']

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 하도록 진행 중인 요청을 공유
let refreshPromise = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 다른 탭이 같은 리프레시 토큰으로 먼저 재발급하면 이 탭의 요청은 실패한다(쓴 토큰은 폐기되므로).
// 그 탭이 새 토큰을 저장할 때까지 잠깐 기다렸다가, 바뀌었으면 그 토큰을 쓴다.
async function tokenRotatedByOtherTab(usedRefreshToken) {
  for (let i = 0; i < 10; i++) {
    const current = localStorage.getItem('refreshToken')
    if (current && current !== usedRefreshToken) {
      return localStorage.getItem('accessToken')
    }
    await sleep(200)
  }
  return null
}

function tokenExpiresAt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return (payload.exp || 0) * 1000
  } catch {
    return 0
  }
}

/**
 * 곧 만료될(1분 이내) 액세스 토큰이면 먼저 새로 받아서 돌려준다.
 * 실시간 편집 연결처럼 401 응답으로 자동 재발급되지 않는 곳에서 쓴다.
 */
export async function getFreshAccessToken() {
  const token = localStorage.getItem('accessToken')
  if (token && tokenExpiresAt(token) - Date.now() > 60_000) return token
  try {
    return await refreshAccessToken()
  } catch {
    return localStorage.getItem('accessToken') || ''
  }
}

export function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken')
    refreshPromise = (refreshToken
      ? axios.post(`${baseURL}/auth/refresh`, { refreshToken }, { timeout: 15000 })
          .then((res) => {
            const tokens = res.data?.data ?? res.data
            setTokens(tokens.accessToken, tokens.refreshToken)
            return tokens.accessToken
          })
          .catch(async (err) => {
            if (err.response?.status === 401 || err.response?.status === 400) {
              const accessToken = await tokenRotatedByOtherTab(refreshToken)
              if (accessToken) return accessToken
            }
            throw err
          })
      : Promise.reject(new Error('리프레시 토큰 없음'))
    ).finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

// 요청 인터셉터 - 토큰 자동 주입
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.status === 'success' && response.data?.data !== undefined) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const appStore = useAppStore()

    if (!error.response) {
      appStore.setError({
        message: '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.',
        code: 'NETWORK_ERROR'
      })
      return Promise.reject(error)
    }

    const { status } = error.response
    const currentPath = router.currentRoute.value.path

    // 액세스 토큰 만료: 리프레시 토큰으로 재발급 후 원래 요청을 한 번 재시도
    const original = error.config
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_URLS.some((url) => original.url?.includes(url)) &&
      localStorage.getItem('refreshToken')
    ) {
      original._retry = true
      try {
        const newAccessToken = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(original)
      } catch {
        // 재발급 실패 시 아래의 세션 만료 처리로 진행
      }
    }

    switch (status) {
      case 401:
        if (!AUTH_PAGES.includes(currentPath)) {
          clearTokens()
          appStore.showSessionExpired()
        }
        break
      case 500:
        appStore.setError({
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          code: 'SERVER_ERROR'
        })
        break
      default:
        break
    }

    return Promise.reject(error)
  }
)

export default apiClient
