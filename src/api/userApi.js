import apiClient from './axios'

function transformUser(user) {
  return {
    userId: user.userId || user.id,
    id: user.userId || user.id,
    email: user.email,
    loginId: user.loginId,
    nickname: user.nickname,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

// JWT 로그인 응답 변환 (토큰 포함)
function transformLoginResponse(loginResponse) {
  return {
    userId: loginResponse.userId,
    id: loginResponse.userId,
    loginId: loginResponse.loginId,
    nickname: loginResponse.nickname,
    profileImage: loginResponse.profileImage,
    accessToken: loginResponse.accessToken,
    refreshToken: loginResponse.refreshToken,
  }
}

export const userApi = {

  // 회원가입
  async register(userData) {
    const response = await apiClient.post('/auth/signup', userData)
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 로그인
  async login(loginId, password) {
    const response = await apiClient.post('/auth/login', { loginId, password })
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 로그아웃
  async logout() {
    return apiClient.post('/auth/logout')
  },

  // 사용자 정보 조회
  async getUserInfo() {
    const response = await apiClient.get('/users/me')
    response.data = transformUser(response.data)
    return response
  },

  // 사용자 정보 수정
  async updateUser(data) {
    const response = await apiClient.patch('/users/me', data)
    response.data = transformUser(response.data)
    return response
  },

  // 회원 탈퇴
  async deleteUser() {
    return apiClient.delete('/users/me')
  },

  // 사용자 검색
  async searchUsers(query) {
    const response = await apiClient.get('/users/search', { params: { query } })
    response.data = response.data.map(transformUser)
    return response
  },
}

export default userApi
