import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 세션 만료 모달
  const isSessionExpired = ref(false)

  // 글로벌 에러
  const globalError = ref(null)

  // 세션 만료 표시
  function showSessionExpired() {
    isSessionExpired.value = true
  }

  // 세션 만료 모달 닫기
  function hideSessionExpired() {
    isSessionExpired.value = false
  }

  // 글로벌 에러 설정
  function setError(error) {
    globalError.value = {
      message: error?.message || '알 수 없는 오류가 발생했습니다',
      code: error?.code || 'UNKNOWN_ERROR',
      timestamp: Date.now()
    }
  }

  // 에러 해제
  function clearError() {
    globalError.value = null
  }

  return {
    isSessionExpired,
    globalError,
    showSessionExpired,
    hideSessionExpired,
    setError,
    clearError
  }
})
