import apiClient from './axios'

// 백엔드 응답을 프론트엔드 형식으로 변환
function transformFolder(folder) {
  return {
    id: folder.folderId,
    name: folder.name,
    description: folder.description,
    parentId: folder.parentId,
    orderIndex: folder.orderIndex,
    postCount: folder.postCount || 0,
    childCount: folder.childCount || 0,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
    children: folder.children || [],
    hasChildren: (folder.children?.length > 0) || (folder.childCount > 0) || false,
  }
}

export const folderApi = {
  // 루트 폴더 목록 조회
  async getRootFolders(workspaceId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/folders`)
    response.data = response.data.map(transformFolder)
    return response
  },

  // 하위 폴더 목록 조회
  async getChildFolders(workspaceId, folderId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/folders/${folderId}/children`)
    response.data = response.data.map(transformFolder)
    return response
  },

  // 폴더 생성
  async createFolder(workspaceId, data) {
    const response = await apiClient.post(`/workspaces/${workspaceId}/folders`, data)
    response.data = transformFolder(response.data)
    return response
  },

  // 폴더 수정
  async updateFolder(workspaceId, folderId, data) {
    const response = await apiClient.put(`/workspaces/${workspaceId}/folders/${folderId}`, data)
    response.data = transformFolder(response.data)
    return response
  },

  // 폴더 이동
  async moveFolder(workspaceId, folderId, data) {
    const response = await apiClient.put(`/workspaces/${workspaceId}/folders/${folderId}/move`, data)
    response.data = transformFolder(response.data)
    return response
  },

  // 폴더 삭제
  deleteFolder(workspaceId, folderId) {
    return apiClient.delete(`/workspaces/${workspaceId}/folders/${folderId}`)
  },
}

export default folderApi
