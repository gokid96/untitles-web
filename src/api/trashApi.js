import apiClient from './axios'

export const trashApi = {
  // 휴지통 목록 (최상위 폴더·글만)
  getTrash(workspaceId) {
    return apiClient.get(`/workspaces/${workspaceId}/trash`)
  },
  restorePost(workspaceId, postId) {
    return apiClient.post(`/workspaces/${workspaceId}/trash/posts/${postId}/restore`)
  },
  restoreFolder(workspaceId, folderId) {
    return apiClient.post(`/workspaces/${workspaceId}/trash/folders/${folderId}/restore`)
  },
  deletePost(workspaceId, postId) {
    return apiClient.delete(`/workspaces/${workspaceId}/trash/posts/${postId}`)
  },
  deleteFolder(workspaceId, folderId) {
    return apiClient.delete(`/workspaces/${workspaceId}/trash/folders/${folderId}`)
  },
  empty(workspaceId) {
    return apiClient.delete(`/workspaces/${workspaceId}/trash`)
  },
}
