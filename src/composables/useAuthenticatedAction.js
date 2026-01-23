import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import { getErrorMessage } from '@/utils/helpers'

/**
 * 인증이 필요한 액션을 래핑하는 컴포저블
 * - 인증 상태 체크를 중앙화
 * - 에러 처리 및 토스트 알림 자동화
 */
export function useAuthenticatedAction() {
  const authStore = useAuthStore()
  const toast = useToast()

  /**
   * 인증된 사용자만 실행할 수 있는 액션 래퍼
   * @param {Function} action - 실행할 비동기 함수
   * @param {Object} options - 옵션
   * @param {string} options.errorTitle - 에러 발생 시 토스트 제목
   * @param {string} options.successTitle - 성공 시 토스트 제목 (선택)
   * @param {string} options.successMessage - 성공 시 토스트 메시지 (선택)
   * @param {boolean} options.showSuccessToast - 성공 토스트 표시 여부 (기본: false)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async function executeAuthenticated(action, options = {}) {
    const {
      errorTitle = '오류',
      successTitle = '완료',
      successMessage = '',
      showSuccessToast = false
    } = options

    // 인증 체크
    if (!authStore.isAuthenticated) {
      toast.add({
        severity: 'warn',
        summary: '로그인 필요',
        detail: '이 작업을 수행하려면 로그인이 필요합니다.',
        life: 3000,
      })
      return { success: false, error: 'UNAUTHENTICATED' }
    }

    try {
      const result = await action()
      
      if (showSuccessToast && successMessage) {
        toast.add({
          severity: 'success',
          summary: successTitle,
          detail: successMessage,
          life: 2000,
        })
      }
      
      return { success: true, data: result }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: errorTitle,
        detail: getErrorMessage(error),
        life: 3000,
      })
      return { success: false, error }
    }
  }

  /**
   * 인증 상태만 체크 (액션 실행 없이)
   * @returns {boolean}
   */
  function checkAuth() {
    return authStore.isAuthenticated
  }

  return {
    executeAuthenticated,
    checkAuth,
    isAuthenticated: authStore.isAuthenticated
  }
}
