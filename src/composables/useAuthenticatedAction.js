import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useToast } from 'primevue/usetoast'
import { getErrorMessage } from '@/utils/helpers'

export function useAuthenticatedAction() {
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  const toast = useToast()

  async function executeAuthenticated(action, options = {}) {
    const {
      errorTitle = '오류',
      successTitle = '완료',
      successMessage = '',
      showSuccessToast = false
    } = options

    if (!authStore.isAuthenticated) {
      uiStore.openAuthModal('login')
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

  function checkAuth() {
    return authStore.isAuthenticated
  }

  return {
    executeAuthenticated,
    checkAuth,
    isAuthenticated: authStore.isAuthenticated
  }
}
