import apiClient from './axios'

export const emailApi = {
  // 이메일 중복 확인
  async checkEmail(email) {
    const response = await apiClient.post('/email/check', { email })
    return response
  },

  // 인증번호 발송
  async sendCode(email) {
    const response = await apiClient.post('/email/send', { email })
    return response
  },

  // 인증번호 확인
  async verifyCode(email, code) {
    const response = await apiClient.post('/email/verify', { email, code })
    return response
  },
}

export default emailApi
