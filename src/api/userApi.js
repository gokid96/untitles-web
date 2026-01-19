import apiClient from './axios'

// 백엔드 응답을 프론트엔드 형식으로 변환
function transformUser(user) {
  return {
    userId: user.userId || user.id,
    id: user.userId || user.id,
    email: user.email,
    loginId: user.loginId,
    nickname: user.nickname,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

// 로그인 응답 변환 (세션 방식 - 토큰 없음)
function transformLoginResponse(loginResponse) {
  return {
    userId: loginResponse.userId,
    id: loginResponse.userId,
    loginId: loginResponse.loginId,
    nickname: loginResponse.nickname,
  }
}

export const userApi = {

  // 회원가입 - /api/v1/auth/signup
  async register(userData) {
    const response = await apiClient.post('/auth/signup', userData)
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 로그인 - /api/v1/auth/login (세션 생성)
  async login(loginId, password) {
    const response = await apiClient.post('/auth/login', {
      loginId,
      password,
    })
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 로그아웃 - /api/v1/auth/logout (세션 무효화)
  async logout() {
    return apiClient.post('/auth/logout')
  },

  // 현재 로그인 상태 확인 - /api/v1/auth/me
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response
  },

  // 사용자 정보 조회 - /api/v1/users/me (세션 인증 사용)
  async getUserInfo() {
    const response = await apiClient.get('/users/me')
    response.data = transformUser(response.data)
    return response
  },

  // 사용자 정보 수정 - /api/v1/users/me (세션 인증 사용)
  async updateUser(data) {
    const response = await apiClient.patch('/users/me', data)
    response.data = transformUser(response.data)
    return response
  },

  // 회원 탈퇴 - /api/v1/users/me (세션 인증 사용)
  async deleteUser() {
    return apiClient.delete('/users/me')
  },

  // 사용자 검색 (이메일 또는 닉네임) - /api/v1/users/search
  async searchUsers(query) {
    const response = await apiClient.get('/users/search', {
      params: { query }
    })
    response.data = response.data.map(transformUser)
    return response
  },
}

export default userApi
