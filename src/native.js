import { watch } from 'vue'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useUiStore } from '@/stores/uiStore'

/**
 * 스토어 앱(Capacitor)에서만 실행하는 초기화
 * - 상태바 글자색을 다크/라이트 모드에 맞춤
 * - 안드로이드 뒤로가기: 열린 창·패널을 먼저 닫고, 없으면 이전 화면 또는 앱 최소화
 */
export function initNative(router) {
  const uiStore = useUiStore()

  const applyStatusBar = (dark) => {
    StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {})
  }
  applyStatusBar(uiStore.isDarkMode)
  watch(() => uiStore.isDarkMode, applyStatusBar)

  App.addListener('backButton', ({ canGoBack }) => {
    if (uiStore.handleBack()) return
    if (canGoBack && router.currentRoute.value.path !== '/') {
      router.back()
    } else {
      App.minimizeApp()
    }
  })
}
