/**
 * 개발/프로덕션 환경에 따라 로깅을 제어하는 유틸리티
 *
 * 개발 환경: 모든 로그 출력
 * 프로덕션 환경: error만 출력
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  /**
   * 일반 로그 (개발 환경에서만 출력)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * 정보성 로그 (개발 환경에서만 출력)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * 경고 로그 (개발 환경에서만 출력)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * 에러 로그 (모든 환경에서 출력)
   */
  error: (...args) => {
    console.error(...args)
  },

  /**
   * 디버그 로그 (개발 환경에서만 출력)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
}

export default logger
