import axios from 'axios'
import router from '@/router'
import { useAppStore } from '@/stores/appStore'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8070/api/v1'

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 401 처리가 필요 없는 경로들 (로그인/회원가입/랜딩 페이지)
const AUTH_PAGES = ['/login', '/register', '/']

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 새 API 응답 형식 처리
    if (response.data?.status === 'success' && response.data?.data !== undefined) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    const appStore = useAppStore()

    // 네트워크 에러
    if (!error.response) {
      appStore.setError({
        message: '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.',
        code: 'NETWORK_ERROR'
      })
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const errorMessage = data?.message || '오류가 발생했습니다'
    const currentPath = router.currentRoute.value.path

    switch (status) {
      case 401:
        // 인증 페이지에서의 401은 로그인 실패이므로 컴포넌트에서 처리하도록 pass
        // 그 외 페이지에서의 401은 세션 만료
        if (!AUTH_PAGES.includes(currentPath)) {
          appStore.showSessionExpired()
        }
        // 로그인/회원가입 페이지의 401은 reject만 하고 컴포넌트에서 처리
        break

      case 403:
        appStore.setError({
          message: '접근 권한이 없습니다.',
          code: 'FORBIDDEN'
        })
        break

      case 404:
        appStore.setError({
          message: '요청한 리소스를 찾을 수 없습니다.',
          code: 'NOT_FOUND'
        })
        break

      case 422:
        // 유효성 검사 에러는 각 컴포넌트에서 처리
        break

      case 409:
        // 충돌 에러는 PostEditor에서 처리
        break

      case 500:
        appStore.setError({
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          code: 'SERVER_ERROR'
        })
        break

      default:
        appStore.setError({
          message: errorMessage,
          code: `HTTP_${status}`
        })
    }

    return Promise.reject(error)
  }
)

export default apiClient
