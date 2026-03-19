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
  withCredentials: false,
})

const AUTH_PAGES = ['/login', '/register', '/']

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
  (error) => {
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

    switch (status) {
      case 401:
        if (!AUTH_PAGES.includes(currentPath)) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
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
