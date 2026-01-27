import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api/userApi'
import { useWorkspaceStore } from './workspaceStore'
import { useFolderStore } from './folderStore'
import { usePostStore } from './postStore'

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const currentUser = ref(null)
  const isAuthenticated = computed(() => !!currentUser.value)

  // userId를 일관되게 제공
  const userId = computed(() => currentUser.value?.userId || currentUser.value?.id || null)

  // 서버에서 현재 로그인 상태 확인 (세션 기반)
  async function checkAuthStatus() {
    try {
      const response = await userApi.getCurrentUser()
      
      if (response.data?.authenticated) {
        currentUser.value = {
          userId: response.data.userId,
          id: response.data.userId,
          email: response.data.email,
          loginId: response.data.loginId,
          nickname: response.data.nickname,
          profileImage: response.data.profileImage,
        }

        // 워크스페이스 로드
        const workspaceStore = useWorkspaceStore()
        await workspaceStore.loadWorkspaces()

        return true
      } else {
        currentUser.value = null
        return false
      }
    } catch (error) {
      currentUser.value = null
      return false
    }
  }

  // 앱 시작 시 로그인 상태 복원
  async function loadUserFromStorage() {
    await checkAuthStatus()
  }

  // 인증 데이터 정리
  function clearAuthData() {
    currentUser.value = null
    
    // 다른 스토어 데이터도 정리
    const workspaceStore = useWorkspaceStore()
    const folderStore = useFolderStore()
    const postStore = usePostStore()
    
    workspaceStore.clearWorkspaceData()
    folderStore.clearFolderData()
    postStore.clearPostData()
  }

  // 사용자 정보 조회 (세션 기반)
  async function getUserInfo() {
    try {
      const response = await userApi.getUserInfo()
      currentUser.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to get user info:', error)
      throw error
    }
  }

  // 로그인
  async function login(loginId, password) {
    try {
      const response = await userApi.login(loginId, password)
      const userData = response.data

      currentUser.value = {
        userId: userData.userId,
        id: userData.userId,
        email: userData.email,
        loginId: userData.loginId,
        nickname: userData.nickname,
        profileImage: userData.profileImage,
      }

      // 로그인 후 워크스페이스 로드
      const workspaceStore = useWorkspaceStore()
      await workspaceStore.loadWorkspaces()

      return userData
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // 회원가입
  async function register(userData) {
    try {
      const response = await userApi.register(userData)
      const data = response.data

      currentUser.value = {
        userId: data.userId,
        id: data.userId,
        email: data.email,
        loginId: data.loginId,
        nickname: data.nickname,
        profileImage: data.profileImage,
      }

      // 회원가입 후 워크스페이스 로드 (기본 워크스페이스 자동 생성됨)
      const workspaceStore = useWorkspaceStore()
      await workspaceStore.loadWorkspaces()

      return data
    } catch (error) {
      console.error('Registration failed:', error)
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
      
      // currentUser 업데이트
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
      console.error('Failed to update user info:', error)
      throw error
    }
  }

  // 회원 탈퇴
  async function deleteAccount() {
    try {
      await userApi.deleteUser()
      clearAuthData()
    } catch (error) {
      console.error('Failed to delete account:', error)
      throw error
    }
  }

  return {
    currentUser,
    userId,
    isAuthenticated,
    loadUserFromStorage,
    checkAuthStatus,
    getUserInfo,
    login,
    register,
    logout,
    updateUserInfo,
    deleteAccount,
  }
})
