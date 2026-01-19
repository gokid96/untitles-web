import apiClient from './axios'

// 백엔드 응답을 프론트엔드 형식으로 변환
function transformPost(post) {
  return {
    id: post.postId,
    title: post.title,
    content: post.content,
    summary: post.summary,
    thumbnailUrl: post.thumbnailUrl,
    slug: post.slug,
    status: post.status || 'DRAFT',
    visibility: post.visibility || 'PRIVATE',
    folderId: post.folderId || post.folder?.id,
    categoryId: post.categoryId || post.category?.id,
    seriesId: post.seriesId || post.series?.id,
    viewCount: post.viewCount || 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    category: post.category,
    series: post.series,
    folder: post.folder,
  }
}

export const postApi = {
  // 워크스페이스의 게시글 목록 조회
  async getPosts(workspaceId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/posts`)
    response.data = response.data.map(transformPost)
    return response
  },

  // 게시글 상세 조회
  async getPost(workspaceId, postId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/posts/${postId}`)
    response.data = transformPost(response.data)
    return response
  },

  // 게시글 생성
  async createPost(workspaceId, data) {
    console.log('postApi.createPost - workspaceId:', workspaceId, 'data:', JSON.stringify(data, null, 2))
    const response = await apiClient.post(`/workspaces/${workspaceId}/posts`, data)
    console.log('postApi.createPost - response:', JSON.stringify(response.data, null, 2))
    response.data = transformPost(response.data)
    return response
  },

  // 게시글 수정
  async updatePost(workspaceId, postId, data) {
    console.log('postApi.updatePost - workspaceId:', workspaceId, 'postId:', postId, 'data:', JSON.stringify(data, null, 2))
    const response = await apiClient.put(`/workspaces/${workspaceId}/posts/${postId}`, data)
    console.log('postApi.updatePost - response:', JSON.stringify(response.data, null, 2))
    response.data = transformPost(response.data)
    return response
  },

  // 게시글 삭제
  deletePost(workspaceId, postId) {
    return apiClient.delete(`/workspaces/${workspaceId}/posts/${postId}`)
  },

  // 게시글 폴더 이동
  async movePost(workspaceId, postId, folderId) {
    console.log('postApi.movePost - workspaceId:', workspaceId, 'postId:', postId, 'folderId:', folderId)
    const response = await apiClient.put(`/workspaces/${workspaceId}/posts/${postId}/move`, { folderId })
    console.log('postApi.movePost - response:', JSON.stringify(response.data, null, 2))
    response.data = transformPost(response.data)
    return response
  },
}

export default postApi
