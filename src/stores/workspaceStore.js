import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { workspaceApi } from '@/api/workspaceApi'

export const useWorkspaceStore = defineStore('workspace', () => {
  // 상태
  const workspaces = ref([])
  const currentWorkspaceId = ref(null)
  const members = ref([])
  const isLoading = ref(false)

  // 현재 워크스페이스
  const currentWorkspace = computed(() => {
    return workspaces.value.find(w => w.workspaceId === currentWorkspaceId.value) || null
  })

  // 내 역할
  const myRole = computed(() => {
    return currentWorkspace.value?.myRole || null
  })

  // 권한 체크
  const isOwner = computed(() => myRole.value === 'OWNER')
  const isAdmin = computed(() => myRole.value === 'OWNER' || myRole.value === 'ADMIN')
  const canEdit = computed(() => myRole.value !== 'VIEWER')

  // 워크스페이스 목록 로드
  async function loadWorkspaces() {
    try {
      isLoading.value = true
      const response = await workspaceApi.getMyWorkspaces()
      workspaces.value = response.data

      // 워크스페이스가 없으면 기본 워크스페이스 생성
      if (workspaces.value.length === 0) {
        await createDefaultWorkspace()
      }

      // 현재 워크스페이스가 없으면 첫 번째 워크스페이스 선택
      if (!currentWorkspaceId.value && workspaces.value.length > 0) {
        currentWorkspaceId.value = workspaces.value[0].workspaceId
      }

      return workspaces.value
    } catch (error) {
      console.error('Failed to load workspaces:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 기본 워크스페이스 생성
  async function createDefaultWorkspace() {
    try {
      const response = await workspaceApi.createWorkspace({
        name: '내 노트',
        description: '개인 워크스페이스'
      })
      workspaces.value.push(response.data)
      currentWorkspaceId.value = response.data.workspaceId
      return response.data
    } catch (error) {
      console.error('Failed to create default workspace:', error)
      throw error
    }
  }

  // 워크스페이스 생성
  async function createWorkspace(data) {
    try {
      const response = await workspaceApi.createWorkspace(data)
      workspaces.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create workspace:', error)
      throw error
    }
  }

  // 워크스페이스 선택
  function selectWorkspace(workspaceId) {
    currentWorkspaceId.value = workspaceId
  }

  // 워크스페이스 수정
  async function updateWorkspace(workspaceId, data) {
    try {
      const response = await workspaceApi.updateWorkspace(workspaceId, data)
      const index = workspaces.value.findIndex(w => w.workspaceId === workspaceId)
      if (index !== -1) {
        workspaces.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to update workspace:', error)
      throw error
    }
  }

  // 워크스페이스 삭제
  async function deleteWorkspace(workspaceId) {
    try {
      await workspaceApi.deleteWorkspace(workspaceId)
      
      // 마지막 워크스페이스면 먼저 기본 워크스페이스 생성 (깜빡임 방지)
      if (workspaces.value.length === 1) {
        await createDefaultWorkspace()
      }
      
      // 그 다음 삭제된 워크스페이스 제거
      workspaces.value = workspaces.value.filter(w => w.workspaceId !== workspaceId)
      
      // 삭제된 워크스페이스가 현재 워크스페이스면 다른 워크스페이스 선택
      if (currentWorkspaceId.value === workspaceId) {
        currentWorkspaceId.value = workspaces.value[0]?.workspaceId || null
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error)
      throw error
    }
  }

  // 멤버 목록 로드
  async function loadMembers(workspaceId) {
    try {
      const response = await workspaceApi.getMembers(workspaceId)
      members.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to load members:', error)
      throw error
    }
  }

  // 멤버 초대
  async function inviteMember(workspaceId, email, role) {
    try {
      const response = await workspaceApi.inviteMember(workspaceId, { email, role })
      members.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to invite member:', error)
      throw error
    }
  }

  // 멤버 권한 변경
  async function updateMemberRole(workspaceId, memberId, role) {
    try {
      const response = await workspaceApi.updateMemberRole(workspaceId, memberId, { role })
      const index = members.value.findIndex(m => m.memberId === memberId)
      if (index !== -1) {
        members.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to update member role:', error)
      throw error
    }
  }

  // 멤버 제거
  async function removeMember(workspaceId, memberId) {
    try {
      await workspaceApi.removeMember(workspaceId, memberId)
      members.value = members.value.filter(m => m.memberId !== memberId)
    } catch (error) {
      console.error('Failed to remove member:', error)
      throw error
    }
  }

  // 워크스페이스 나가기
  async function leaveWorkspace(workspaceId) {
    try {
      await workspaceApi.leaveWorkspace(workspaceId)

      // 마지막 워크스페이스면 먼저 기본 워크스페이스 생성 (깜빡임 방지)
      if (workspaces.value.length === 1) {
        await createDefaultWorkspace()
      }
      
      // 그 다음 나간 워크스페이스 제거
      workspaces.value = workspaces.value.filter(w => w.workspaceId !== workspaceId)
      
      // 나간 워크스페이스가 현재 워크스페이스면 다른 워크스페이스 선택
      if (currentWorkspaceId.value === workspaceId) {
        currentWorkspaceId.value = workspaces.value[0]?.workspaceId || null
      }
    } catch (error) {
      console.error('Failed to leave workspace:', error)
      throw error
    }
  }

  // 상태 초기화 (로그아웃 시)
  function clearWorkspaceData() {
    workspaces.value = []
    currentWorkspaceId.value = null
    members.value = []
  }

  return {
    // 상태
    workspaces,
    currentWorkspaceId,
    members,
    isLoading,
    // computed
    currentWorkspace,
    myRole,
    isOwner,
    isAdmin,
    canEdit,
    // 액션
    loadWorkspaces,
    createWorkspace,
    selectWorkspace,
    updateWorkspace,
    deleteWorkspace,
    loadMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    clearWorkspaceData,
  }
})
