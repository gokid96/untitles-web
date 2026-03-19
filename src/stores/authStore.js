import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api/userApi'
import { useWorkspaceStore } from './workspaceStore'
import { useFolderStore } from './folderStore'
import { usePostStore } from './postStore'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isAuthenticated = computed(() => !!currentUser.value)
  const userId = computed(() => currentUser.value?.userId || currentUser.value?.id || null)

  // 토큰 저장
  function saveTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  // 토큰 삭제
  function clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // 앱 시작 시 토큰으로 로그인 상태 복원
  async function loadUserFromStorage() {
    const token = localStorage.getItem('accessToken')
    if (!token) return false

    try {
      const response = await userApi.getUserInfo()
      currentUser.value = {
        userId: response.data.userId,
        id: response.data.userId,
        email: response.data.email,
        loginId: response.data.loginId,
        nickname: response.data.nickname,
        profileImage: response.data.profileImage,
      }

      const workspaceStore = useWorkspaceStore()
      await workspaceStore.loadWorkspaces()
      return true
    } catch (error) {
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

  // 로그인
  async function login(loginId, password) {
    try {
      const response = await userApi.login(loginId, password)
      const userData = response.data

      saveTokens(userData.accessToken, userData.refreshToken)

      currentUser.value = {
        userId: userData.userId,
        id: userData.userId,
        loginId: userData.loginId,
        nickname: userData.nickname,
        profileImage: userData.profileImage,
      }

      const workspaceStore = useWorkspaceStore()
      await workspaceStore.loadWorkspaces()

      return userData
    } catch (error) {
      throw error
    }
  }

  // 회원가입
  async function register(userData) {
    try {
      const response = await userApi.register(userData)
      const data = response.data

      saveTokens(data.accessToken, data.refreshToken)

      currentUser.value = {
        userId: data.userId,
        id: data.userId,
        loginId: data.loginId,
        nickname: data.nickname,
        profileImage: data.profileImage,
      }

      const workspaceStore = useWorkspaceStore()
      await workspaceStore.loadWorkspaces()

      return data
    } catch (error) {
      throw error
    }
  }

  // 로그아웃
  async function logout() {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('Logout request failed:', error)
    }
    clearAuthData()
  }

  // 사용자 정보 수정
  async function updateUserInfo(data) {
    try {
      const response = await userApi.updateUser(data)
      const userData = response.data

      currentUser.value = {
        ...currentUser.value,
        userId: userData.userId,
        id: userData.userId,
        email: userData.email,
        loginId: userData.loginId,
        nickname: userData.nickname,
        profileImage: userData.profileImage,
      }

      return userData
    } catch (error) {
      throw error
    }
  }

  // 회원 탈퇴
  async function deleteAccount() {
    try {
      await userApi.deleteUser()
      clearAuthData()
    } catch (error) {
      throw error
    }
  }

  return {
    currentUser,
    userId,
    isAuthenticated,
    loadUserFromStorage,
    login,
    register,
    logout,
    updateUserInfo,
    deleteAccount,
  }
})
