import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'
import { isNativeApp } from './utils/platform'
import { watch } from 'vue'
import { initErrorTracking, setErrorUser } from './utils/errorTracking'
import { useAuthStore } from './stores/authStore'

// 블랙/화이트 모던 테마 프리셋 정의
const ModernPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{neutral.50}',
      100: '{neutral.100}',
      200: '{neutral.200}',
      300: '{neutral.300}',
      400: '{neutral.400}',
      500: '{neutral.500}',
      600: '{neutral.600}',
      700: '{neutral.700}',
      800: '{neutral.800}',
      900: '{neutral.900}',
      950: '{neutral.950}',
    },
  },
  components: {
    tabview: {
      tabPanel: {
        background: 'transparent',
      },
      tabList: {
        background: 'transparent',
      },
    },
  },
})

// PrimeIcons CSS
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: ModernPreset,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  },
})
app.use(ToastService)

// 오류 추적: 화면을 그리기 전에 켜서 시작 단계의 오류도 잡는다
initErrorTracking(app, router)
{
  const authStore = useAuthStore()
  watch(() => authStore.currentUser?.userId, (id) => setErrorUser(id), { immediate: true })
}

// 스토어 앱: 휴대폰 보안 저장소의 로그인 정보를 먼저 되살린 뒤 화면을 띄운다
if (isNativeApp) {
  // 저장된 로그인 정보를 되살린 뒤 화면을 그린다. 어떤 이유로든 늦어지면 2초 뒤에는 무조건 그린다
  let mounted = false
  const mount = () => {
    if (mounted) return
    mounted = true
    app.mount('#app')
  }
  setTimeout(mount, 2000)
  import('./utils/tokenStore')
    .then(({ restoreTokens }) => restoreTokens())
    .catch(() => {})
    .finally(mount)
} else {
  app.mount('#app')
}

// 스토어 앱으로 실행 중일 때만 네이티브 초기화 (웹에서는 불러오지 않음)
if (isNativeApp) {
  import('./native').then(({ initNative }) => initNative(router))
}
