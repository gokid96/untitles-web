import apiClient from './axios'

export const publishApi = {
  // 공개 설정 조회 (인증 필요)
  async getPublishSettings(workspaceId) {
    return await apiClient.get(`/workspaces/${workspaceId}/publish`)
  },

  // 공개 설정 저장 (인증 필요)
  async updatePublishSettings(workspaceId, data) {
    return await apiClient.put(`/workspaces/${workspaceId}/publish`, data)
  },

  // 공개 워크스페이스 조회 (비로그인)
  async getPublicWorkspace(slug) {
    return await apiClient.get(`/public/${slug}`)
  },

  // 공개 게시글 상세 (비로그인)
  async getPublicPost(slug, postId) {
    return await apiClient.get(`/public/${slug}/posts/${postId}`)
  },
}
