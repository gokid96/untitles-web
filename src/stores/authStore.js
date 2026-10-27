import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api/userApi'
import { useWorkspaceStore } from './workspaceStore'
import { useFolderStore } from './folderStore'
import { usePostStore } from './postStore'
import { setTokens, clearTokens as clearStoredTokens } from '@/utils/tokenStore'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isAuthenticated = computed(() => !!currentUser.value)
  const userId = computed(() => currentUser.value?.userId || currentUser.value?.id || null)

  // 토큰 저장
  function saveTokens(accessToken, refreshToken) {
    setTokens(accessToken, refreshToken)
  }

  // 토큰 삭제
  function clearTokens() {
    clearStoredTokens()
  }

  // 앱 시작 시 토큰으로 로그인 상태 복원
  async function loadUserFromStorage() {
    const token = localStorage.getItem('accessToken')
    if (!token) return false

    try {
      const response = await userApi.getUserInfo()
      currentUser.value = { ...response.data }

      const workspaceStore = useWorkspaceStore()
      await workspaceStore.loadWorkspaces()
      return true
    } catch {
      clearTokens()
      currentUser.value = null
      return false
    }
  }

  // 인증 데이터 정리
  function clearAuthData() {
    currentUser.value = null
    clearTokens()

    const workspaceStore = useWorkspaceStore()
    const folderStore = useFolderStore()
    const postStore = usePostStore()

    workspaceStore.clearWorkspaceData()
    folderStore.clearFolderData()
    postStore.clearPostData()
  }

  // 로그인 (이메일 또는 아이디)
  async function login(loginId, password) {
    const response = await userApi.login(loginId, password)
    await completeLogin(response.data)
    return response.data
  }

  // 회원가입
  async function register(userData) {
    const response = await userApi.register(userData)
    await completeLogin(response.data)
    return response.data
  }

  /**
   * 로그인 응답(토큰)을 받은 뒤 공통 처리: 토큰 저장 → 내 정보(연결된 로그인 등) 불러오기 → 워크스페이스
   * 소셜 로그인·이메일 가입에서 쓴다
   */
  async function completeLogin(loginResponse) {
    saveTokens(loginResponse.accessToken, loginResponse.refreshToken)
    const ok = await loadUserFromStorage()
    if (!ok) throw new Error('사용자 정보를 가져오지 못했습니다.')
    return currentUser.value
  }

  // 로그아웃
  async function logout() {
    try {
      await userApi.logout(localStorage.getItem('refreshToken'))
    } catch (error) {
      console.error('Logout request failed:', error)
    }
    clearAuthData()
  }

  // 회원 탈퇴 (성공하면 로그아웃 상태로 전환)
  async function deleteAccount() {
    await userApi.deleteAccount()
    clearAuthData()
  }

  // 사용자 정보 수정
  async function updateUserInfo(data) {
    const response = await userApi.updateUser(data)
    const userData = response.data

    currentUser.value = { ...currentUser.value, ...userData }

    return userData
  }

  return {
    completeLogin,
    currentUser,
    userId,
    isAuthenticated,
    loadUserFromStorage,
    login,
    register,
    logout,
    deleteAccount,
    updateUserInfo,
  }
})
