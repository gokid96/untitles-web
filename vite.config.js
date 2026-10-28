import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// 오류 추적에서 어느 배포의 오류인지 구분하는 이름 (Vercel·GitHub Actions의 커밋 번호)
process.env.VITE_APP_RELEASE ||= (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '').slice(0, 12)

// SENTRY_AUTH_TOKEN이 있는 빌드(배포)에서만: 소스맵을 Sentry에 올려 오류 위치를 원래 코드로 보여주고,
// 올린 뒤에는 배포 파일에서 소스맵을 지운다 (사용자에게 원본 코드가 공개되지 않게)
const uploadSourcemaps = !!process.env.SENTRY_AUTH_TOKEN && !!process.env.SENTRY_ORG && !!process.env.SENTRY_PROJECT

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    uploadSourcemaps && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: process.env.VITE_APP_RELEASE || undefined },
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
      telemetry: false,
    }),
  ].filter(Boolean),
  build: {
    sourcemap: uploadSourcemaps ? 'hidden' : false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
