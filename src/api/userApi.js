import apiClient from './axios'

function transformUser(user) {
  return {
    userId: user.userId || user.id,
    id: user.userId || user.id,
    email: user.email,
    loginId: user.loginId,
    nickname: user.nickname,
    profileImage: user.profileImage,
    emailVerified: !!user.emailVerified,
    hasPassword: user.hasPassword !== false,
    providers: user.providers || [],
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

  // 소셜 로그인: 앱(구글·애플)·웹(애플)은 ID 토큰, 웹 리다이렉트(카카오 등)는 일회용 코드
  async socialLogin(provider, payload) {
    const response = await apiClient.post(`/auth/social/${provider}`, payload)
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 소셜 로그인이 기존 계정과 겹쳤을 때 받은 연결 토큰의 정보 (이메일·제공자)
  async getPendingLink(token) {
    return apiClient.post('/auth/social/link', { token })
  },

  async exchangeLoginCode(code) {
    const response = await apiClient.post('/auth/social/exchange', { code })
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 회원가입
  async register(userData) {
    const response = await apiClient.post('/auth/signup', userData)
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 로그인
  // 비밀번호 재설정: 이메일로 인증번호 요청 → 인증번호와 새 비밀번호로 변경
  async requestPasswordReset(email) {
    return apiClient.post('/auth/password-reset/request', { email })
  },

  async confirmPasswordReset(email, code, newPassword) {
    return apiClient.post('/auth/password-reset/confirm', { email, code, newPassword })
  },

  async login(loginId, password, linkToken) {
    const response = await apiClient.post('/auth/login', { loginId, password, linkToken: linkToken || undefined })
    response.data = transformLoginResponse(response.data)
    return response
  },

  // 로그아웃
  // 이 기기의 리프레시 토큰을 서버에서도 무효화
  async logout(refreshToken) {
    return apiClient.post('/auth/logout', { refreshToken })
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

  // 이메일 변경: 새 이메일로 인증번호 받기
  async sendEmailChangeCode(email) {
    return apiClient.post('/users/me/email/code', { email })
  },

  // 이메일 변경: 인증번호 확인 후 변경
  async changeEmail(email, code) {
    const response = await apiClient.post('/users/me/email', { email, code })
    response.data = transformUser(response.data)
    return response
  },

  // 소셜 계정 연결 (리다이렉트 방식에 붙일 일회용 표시)
  async socialLinkIntent() {
    const response = await apiClient.post('/users/me/social/link-intent')
    return response.data.intent
  },

  // 소셜 계정 연결 (앱의 구글·애플: ID 토큰)
  async linkSocial(provider, payload) {
    return apiClient.post(`/users/me/social/${provider}`, payload)
  },

  // 소셜 계정 연결 해제
  async unlinkSocial(provider) {
    return apiClient.delete(`/users/me/social/${provider}`)
  },

  // 회원 탈퇴
  async deleteAccount() {
    return apiClient.delete('/users/me')
  },

  // 사용자 검색
  async searchUsers(query) {
    const response = await apiClient.get('/users/search', { params: { query } })
    response.data = response.data.map(transformUser)
    return response
  },
}
