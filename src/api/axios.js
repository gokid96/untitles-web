import axios from 'axios'
import router from '@/router'
import { logger } from '@/utils/logger'

// 환경에 따른 Base URL 설정 (개발: localhost, 프로덕션: api.untitles.net)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8070/api/v1'
const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 세션 쿠키(JSESSIONID) 자동 전송을 위해 필수
  withCredentials: true,
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 세션 방식은 별도 헤더 추가 불필요
    // 브라우저가 자동으로 쿠키 전송
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // 새 API 응답 형식: { status: "success", data: {...} }
    // data 필드를 response.data로 직접 반환
    if (response.data?.status === 'success' && response.data?.data !== undefined) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    if (error.response) {
      // 새 에러 형식: { status: "error", code: "ERROR_CODE", message: "..." }
      const errorData = error.response.data

      switch (error.response.status) {
        case 401:
          logger.error('Unauthorized - Redirecting to login')
          // 세션 만료 시 로그인 페이지로 이동
          router.push('/')
          break
        case 403:
          logger.error('Forbidden - Access denied:', errorData?.message)
          break
        case 404:
          logger.error('Not Found:', errorData?.message)
          break
        case 500:
          logger.error('Server Error:', errorData?.message)
          break
        default:
          logger.error('API Error:', errorData?.message || error.response.status)
      }
    } else if (error.request) {
      logger.error('Network Error - No response received')
    } else {
      logger.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
