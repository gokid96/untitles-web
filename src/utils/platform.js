import { Capacitor } from '@capacitor/core'

// 스토어 앱(Capacitor)으로 실행 중인지 여부. 웹 브라우저에서는 false
export const isNativeApp = Capacitor.isNativePlatform()
export const nativePlatform = Capacitor.getPlatform() // 'android' | 'ios' | 'web'

// 소셜 로그인(구글·카카오·네이버) 버튼 표시 여부
// - 웹: VITE_SOCIAL_LOGIN_ENABLED=true 일 때만 (서버에 OAuth 키를 넣은 뒤 켠다)
// - 앱: 항상 숨김 (앱에 넣으려면 Apple 로그인과 딥링크 처리가 함께 필요)
export const socialLoginEnabled = !isNativeApp && import.meta.env.VITE_SOCIAL_LOGIN_ENABLED === 'true'
