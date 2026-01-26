import apiClient from './axios'

export const workspaceApi = {
  // 내 워크스페이스 목록 조회
  async getMyWorkspaces() {
    const response = await apiClient.get('/workspaces')
    return response
  },

  // 워크스페이스 생성
  async createWorkspace(data) {
    const response = await apiClient.post('/workspaces', data)
    return response
  },

  // 워크스페이스 상세 조회
  async getWorkspace(workspaceId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}`)
    return response
  },

  // 워크스페이스 수정
  async updateWorkspace(workspaceId, data) {
    const response = await apiClient.put(`/workspaces/${workspaceId}`, data)
    return response
  },

  // 워크스페이스 삭제
  async deleteWorkspace(workspaceId) {
    const response = await apiClient.delete(`/workspaces/${workspaceId}`)
    return response
  },

  // 멤버 목록 조회
  async getMembers(workspaceId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/members`)
    return response
  },

  // 멤버 초대
  async inviteMember(workspaceId, data) {
    const response = await apiClient.post(`/workspaces/${workspaceId}/members`, data)
    return response
  },

  // 멤버 권한 변경
  async updateMemberRole(workspaceId, memberId, data) {
    const response = await apiClient.put(`/workspaces/${workspaceId}/members/${memberId}`, data)
    return response
  },

  // 멤버 제거
  async removeMember(workspaceId, memberId) {
    const response = await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`)
    return response
  },

  // 워크스페이스 나가기
  async leaveWorkspace(workspaceId) {
    const response = await apiClient.post(`/workspaces/${workspaceId}/leave`)
    return response
  },

  // 워크스페이스 생성 제한 정보
  async getWorkspaceLimit() {
    const response = await apiClient.get('/workspaces/limit')
    return response
  },
}

export default workspaceApi
