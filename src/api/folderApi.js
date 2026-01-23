import apiClient from './axios'

/**
 * 폴더 변환 (재귀적으로 children과 posts 포함)
 */
function transformFolder(folder) {
  return {
    folderId: folder.folderId,
    name: folder.name,
    parentId: folder.parentId,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
    children: (folder.children || []).map(transformFolder),
    posts: (folder.posts || []).map(post => ({
      postId: post.postId,
      title: post.title,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }))
  }
}

export const folderApi = {
  /**
   * 워크스페이스 트리 조회 (폴더 + 게시글)
   * 응답: { folders: [...], rootPosts: [...] }
   */
  async getWorkspaceTree(workspaceId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/folders`)
    return {
      data: {
        folders: (response.data.folders || []).map(transformFolder),
        rootPosts: (response.data.rootPosts || []).map(post => ({
          postId: post.postId,
          title: post.title,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }))
      }
    }
  },

  /**
   * 폴더 생성
   */
  async createFolder(workspaceId, data) {
    const response = await apiClient.post(`/workspaces/${workspaceId}/folders`, data)
    return {
      data: transformFolder(response.data)
    }
  },

  /**
   * 폴더 수정
   */
  async updateFolder(workspaceId, folderId, data) {
    const response = await apiClient.put(`/workspaces/${workspaceId}/folders/${folderId}`, data)
    return {
      data: transformFolder(response.data)
    }
  },

  /**
   * 폴더 이동
   */
  async moveFolder(workspaceId, folderId, data) {
    const response = await apiClient.put(`/workspaces/${workspaceId}/folders/${folderId}/move`, data)
    return {
      data: transformFolder(response.data)
    }
  },

  /**
   * 폴더 삭제
   */
  deleteFolder(workspaceId, folderId) {
    return apiClient.delete(`/workspaces/${workspaceId}/folders/${folderId}`)
  },
}

export default folderApi
