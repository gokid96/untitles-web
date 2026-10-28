// 실시간 편집 설정 (가벼운 값만). 실제 연결 코드(yjs·hocuspocus)는 필요할 때 따로 불러온다
/** 실시간 편집 서버 주소. 비어 있으면 실시간 편집을 쓰지 않는다 */
export const COLLAB_URL = import.meta.env.VITE_COLLAB_URL || ''

// 커서 색은 프로필 기본 색과 같게 (같은 사람은 어디서나 같은 색)
export { avatarColor as caretColorFor } from '@/utils/avatar'
