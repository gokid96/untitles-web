import api from './axios'

export const imageApi = {
  // 게시글 이미지 업로드
  uploadPostImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/images/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 프로필 이미지 업로드
  uploadProfileImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/images/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
