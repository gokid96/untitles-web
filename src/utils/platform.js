import { Capacitor } from '@capacitor/core'

// 스토어 앱(Capacitor)으로 실행 중인지 여부. 웹 브라우저에서는 false
export const isNativeApp = Capacitor.isNativePlatform()
export const nativePlatform = Capacitor.getPlatform() // 'android' | 'ios' | 'web'
