import apiClient from './axios'

// 백엔드 응답을 프론트엔드 형식으로 변환
function transformPost(post) {
  return {
    id: post.postId,
    title: post.title,
    content: post.content,
    version: post.version,  // 추가
    folderId: post.folderId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorId: post.authorId,
    authorNickname: post.authNickname,
  }
}

export const postApi = {
  /**
   * 게시글 상세 조회 (클릭 시 content 포함)
   */
  async getPost(workspaceId, postId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/posts/${postId}`)
    response.data = transformPost(response.data)
    return response
  },

  /**
   * 게시글 생성
   */
  async createPost(workspaceId, data) {
    const response = await apiClient.post(`/workspaces/${workspaceId}/posts`, data)
    response.data = transformPost(response.data)
    return response
  },

  /**
   * 게시글 수정
   */
  async updatePost(workspaceId, postId, data) {
    const response = await apiClient.put(`/workspaces/${workspaceId}/posts/${postId}`, data)
    response.data = transformPost(response.data)
    return response
  },

  /**
   * 게시글 삭제
   */
  deletePost(workspaceId, postId) {
    return apiClient.delete(`/workspaces/${workspaceId}/posts/${postId}`)
  },

  /**
   * 게시글 폴더 이동
   */
  async movePost(workspaceId, postId, folderId) {
    const response = await apiClient.put(`/workspaces/${workspaceId}/posts/${postId}/move`, { folderId })
    response.data = transformPost(response.data)
    return response
  },
}

export default postApi
