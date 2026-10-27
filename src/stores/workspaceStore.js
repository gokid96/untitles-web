import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { workspaceApi } from '@/api/workspaceApi'
import { invitationApi } from '@/api/invitationApi'

export const useWorkspaceStore = defineStore('workspace', () => {
  // 상태
  const workspaces = ref([])
  const currentWorkspaceId = ref(null)
  
  // 워크스페이스 생성 제한 정보
  const workspaceLimit = ref({ count: 0, limit: 3 })

  // 나에게 온 대기 중인 초대
  const myInvitations = ref([])

  // 멤버 구성이 바뀔 때마다 올라간다 (열려 있는 멤버 목록이 다시 불러오게)
  const membersVersion = ref(0)

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

  // 워크스페이스 생성 가능 여부 (백엔드에서 받은 제한 정보 사용)
  const canCreateWorkspace = computed(() => {
    return workspaceLimit.value.count < workspaceLimit.value.limit
  })

  // 워크스페이스 제한 정보 로드
  async function loadWorkspaceLimit() {
    try {
      const response = await workspaceApi.getWorkspaceLimit()
      workspaceLimit.value = response.data
    } catch (error) {
      console.error('Failed to load workspace limit:', error)
    }
  }

  // 워크스페이스 목록 로드
  async function loadWorkspaces() {
    try {
      const response = await workspaceApi.getMyWorkspaces()
      workspaces.value = response.data

      // 현재 워크스페이스가 없으면 첫 번째 워크스페이스 선택
      if (!currentWorkspaceId.value && workspaces.value.length > 0) {
        currentWorkspaceId.value = workspaces.value[0].workspaceId
      }

      // 워크스페이스 제한 정보와 받은 초대도 함께 로드
      await Promise.all([loadWorkspaceLimit(), loadMyInvitations()])

      return workspaces.value
    } catch (error) {
      console.error('Failed to load workspaces:', error)
      throw error
    }
  }

  // 워크스페이스 생성
  async function createWorkspace(data) {
    try {
      const response = await workspaceApi.createWorkspace(data)
      workspaces.value.push(response.data)
      
      // 제한 정보 갱신
      await loadWorkspaceLimit()
      
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
      
      // 삭제된 워크스페이스 제거
      workspaces.value = workspaces.value.filter(w => w.workspaceId !== workspaceId)
      
      // 삭제된 워크스페이스가 현재 워크스페이스면 다른 워크스페이스 선택
      if (currentWorkspaceId.value === workspaceId) {
        currentWorkspaceId.value = workspaces.value[0]?.workspaceId || null
      }

      // 제한 정보 갱신
      await loadWorkspaceLimit()
    } catch (error) {
      console.error('Failed to delete workspace:', error)
      throw error
    }
  }

  // 멤버 목록 로드
  async function loadMembers(workspaceId) {
    try {
      const response = await workspaceApi.getMembers(workspaceId)
      return response.data
    } catch (error) {
      console.error('Failed to load members:', error)
      throw error
    }
  }

  // 초대 보내기: 가입한 사용자는 userId, 아직 가입하지 않은 사람은 이메일로.
  // 받은 사람이 수락해야 멤버가 된다
  async function inviteMember(workspaceId, { userId, email, role }) {
    const response = await invitationApi.invite(workspaceId, { userId, email, role })
    return response.data
  }

  async function loadInvitations(workspaceId) {
    const response = await invitationApi.pending(workspaceId)
    return response.data
  }

  async function cancelInvitation(workspaceId, invitationId) {
    await invitationApi.cancel(workspaceId, invitationId)
  }

  async function loadMyInvitations() {
    try {
      const response = await invitationApi.mine()
      myInvitations.value = response.data || []
    } catch (error) {
      // 예전 서버 등에서 실패해도 다른 화면에는 영향 없게
      console.error('Failed to load invitations:', error)
    }
    return myInvitations.value
  }

  // 수락하면 그 워크스페이스로 이동할 수 있도록 목록을 새로 받는다
  async function acceptInvitation(token) {
    const response = await invitationApi.accept(token)
    myInvitations.value = myInvitations.value.filter((i) => i.token !== token)
    await loadWorkspaces()
    return response.data?.workspaceId
  }

  async function declineInvitation(token) {
    await invitationApi.decline(token)
    myInvitations.value = myInvitations.value.filter((i) => i.token !== token)
  }

  // 멤버 권한 변경
  async function updateMemberRole(workspaceId, memberId, role) {
    try {
      const response = await workspaceApi.updateMemberRole(workspaceId, memberId, { role })
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
      
      // 워크스페이스 목록 갱신 (memberCount 업데이트)
      await loadWorkspaces()
    } catch (error) {
      console.error('Failed to remove member:', error)
      throw error
    }
  }

  // 워크스페이스 나가기
  async function leaveWorkspace(workspaceId) {
    try {
      await workspaceApi.leaveWorkspace(workspaceId)

      // 나간 워크스페이스 제거
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
    workspaceLimit.value = { count: 0, limit: 3 }
    myInvitations.value = []
  }

  // 폴더 count 로컬 업데이트
  function updateFolderCount(delta) {
    const workspace = workspaces.value.find(w => w.workspaceId === currentWorkspaceId.value)
    if (workspace) {
      workspace.folderCount = (workspace.folderCount || 0) + delta
    }
  }

  // 게시글 count 로컬 업데이트
  function updatePostCount(delta) {
    const workspace = workspaces.value.find(w => w.workspaceId === currentWorkspaceId.value)
    if (workspace) {
      workspace.postCount = (workspace.postCount || 0) + delta
    }
  }

  return {
    // 상태
    workspaces,
    currentWorkspaceId,
    workspaceLimit,
    myInvitations,
    membersVersion,
    // computed
    currentWorkspace,
    myRole,
    isOwner,
    isAdmin,
    canCreateWorkspace,
    // 액션
    loadWorkspaces,
    createWorkspace,
    selectWorkspace,
    updateWorkspace,
    deleteWorkspace,
    loadMembers,
    inviteMember,
    loadInvitations,
    cancelInvitation,
    loadMyInvitations,
    acceptInvitation,
    declineInvitation,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    clearWorkspaceData,
    updateFolderCount,
    updatePostCount,
  }
})
