import apiClient from './axios'

/**
 * 워크스페이스 초대 (깃허브 방식: 초대 → 받은 사람이 수락/거절, 7일 만료)
 */
export const invitationApi = {
  // 관리자: 초대 보내기 (가입한 사용자 userId 또는 이메일)
  invite(workspaceId, { userId, email, role }) {
    return apiClient.post(`/workspaces/${workspaceId}/invitations`, { userId, email, role })
  },
  // 관리자: 대기 중인 초대
  pending(workspaceId) {
    return apiClient.get(`/workspaces/${workspaceId}/invitations`)
  },
  // 관리자: 초대 취소
  cancel(workspaceId, invitationId) {
    return apiClient.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`)
  },
  // 나에게 온 초대
  mine() {
    return apiClient.get('/invitations')
  },
  accept(token) {
    return apiClient.post(`/invitations/${encodeURIComponent(token)}/accept`)
  },
  decline(token) {
    return apiClient.post(`/invitations/${encodeURIComponent(token)}/decline`)
  },
  // 초대 링크 미리보기 (로그인 전에도)
  preview(token) {
    return apiClient.get(`/public/invitations/${encodeURIComponent(token)}`)
  },
}
