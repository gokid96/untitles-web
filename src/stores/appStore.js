import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 글로벌 로딩 상태
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // 세션 만료 모달
  const isSessionExpired = ref(false)

  // 글로벌 에러
  const globalError = ref(null)

  // 로딩 시작
  function startLoading(message = '') {
    isLoading.value = true
    loadingMessage.value = message
  }

  // 로딩 종료
  function stopLoading() {
    isLoading.value = false
    loadingMessage.value = ''
  }

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

  // 상태 초기화
  function reset() {
    isLoading.value = false
    loadingMessage.value = ''
    isSessionExpired.value = false
    globalError.value = null
  }

  return {
    isLoading,
    loadingMessage,
    isSessionExpired,
    globalError,
    startLoading,
    stopLoading,
    showSessionExpired,
    hideSessionExpired,
    setError,
    clearError,
    reset
  }
})
