<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <router-view />
    <Toast position="bottom-right" />
    
    <!-- 글로벌 컴포넌트: 필요할 때만 렌더링 -->
    <SessionExpiredModal v-if="isSessionExpired" />
    <GlobalErrorToast v-if="globalError" />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import Toast from 'primevue/toast'
import { useUiStore } from '@/stores/uiStore'
import { useAppStore } from '@/stores/appStore'

// 글로벌 모달 lazy loading
const SessionExpiredModal = defineAsyncComponent(() => 
  import('@/components/common/SessionExpiredModal.vue')
)
const GlobalErrorToast = defineAsyncComponent(() => 
  import('@/components/common/GlobalErrorToast.vue')
)

const uiStore = useUiStore()
const appStore = useAppStore()

const isDarkMode = computed(() => uiStore.isDarkMode)
const isSessionExpired = computed(() => appStore.isSessionExpired)
const globalError = computed(() => appStore.globalError)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');

/* Reset */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ============================================
   🌌 Midnight Aurora Theme
   깊은 밤하늘의 인디고 블루와 은은한 바이올렛
   ============================================ */

/* CSS Variables - Light Mode */
:root {
  /* Primary - 인디고 계열 */
  --primary-color: #1a1a2e;
  --primary-color-text: #ffffff;
  --primary-50: #f8f9fc;
  --primary-100: #f0f1f7;
  --primary-200: #e0e2ed;
  --primary-300: #c5c8d8;
  --primary-400: #9a9eb8;
  --primary-500: #6e7394;
  --primary-600: #525678;
  --primary-700: #3d4160;
  --primary-800: #2a2a4a;
  --primary-900: #1a1a2e;
  --primary-950: #0f0f1a;

  /* Accent - 바이올렛 (버튼, 링크 등) */
  --accent-color: #6366f1;
  --accent-color-hover: #4f46e5;
  --accent-color-light: #a5b4fc;

  /* Surface - 라이트 모드 (부위별 톤 차이) */
  --surface-ground: #f0f1f7;           /* 본문 배경 - 살짝 밝게 */
  --surface-sidebar: #e8e9f2;          /* 사이드바 - 살짝 어둡게 */
  --surface-card: #ffffff;             /* 카드/에디터 - 가장 밝게 */
  --surface-border: #dcdee8;           /* 테두리 */
  --surface-hover: #e8e9f2;            /* 호버 상태 */
  --surface-overlay: #ffffff;          /* 오버레이/모달 */
  --surface-section: #f0f1f7;          /* 섹션 구분 */

  /* Text */
  --text-color: #1a1a2e;
  --text-color-secondary: #6e7394;
  --text-color-muted: #9a9eb8;

  /* Highlight */
  --highlight-bg: #eef0f7;
  --highlight-text-color: #1a1a2e;

  /* Focus */
  --focus-ring: rgba(99, 102, 241, 0.25);
  --focus-ring-alpha: rgba(99, 102, 241, 0.15);

  /* Status Colors */
  --red-500: #ef4444;
  --green-500: #22c55e;
  --yellow-500: #eab308;
  --blue-500: #3b82f6;
}

/* Dark Mode - 🌌 Midnight Aurora (Deeper) */
.dark-mode {
  /* Primary */
  --primary-color: #e8eaf0;
  --primary-color-text: #08080f;

  /* Accent - 밝은 바이올렛 */
  --accent-color: #818cf8;
  --accent-color-hover: #a5b4fc;
  --accent-color-light: #4f46e5;

  /* Surface - 다크 모드 (부위별 톤 차이) */
  --surface-ground: #0c0c14;           /* 본문 배경 - 살짝 밝게 */
  --surface-sidebar: #08080f;          /* 사이드바 - 살짝 어둡게 */
  --surface-card: #12121f;             /* 카드/에디터 - 살짝 밝게 */
  --surface-border: #1e1e32;           /* 테두리 */
  --surface-hover: #1a1a2e;            /* 호버 상태 */
  --surface-overlay: #151522;          /* 오버레이/모달 */
  --surface-section: #0a0a12;          /* 섹션 구분 */

  /* Text */
  --text-color: #e8eaf0;
  --text-color-secondary: #a0a4c0;
  --text-color-muted: #6e7394;

  /* Highlight */
  --highlight-bg: #2a2a4a;
  --highlight-text-color: #e8eaf0;

  /* Focus */
  --focus-ring: rgba(129, 140, 248, 0.3);
  --focus-ring-alpha: rgba(129, 140, 248, 0.2);
}

/* Base */
html, body {
  height: 100%;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--surface-ground);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
}

/* Scrollbar - 테마에 맞게 스타일링 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--surface-border);
  border-radius: 4px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-color-secondary);
}

/* Selection - 액센트 컬러 사용 */
::selection {
  background: var(--accent-color);
  color: #ffffff;
}

/* Focus */
:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Links - 액센트 컬러 */
a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--accent-color-hover);
  text-decoration: underline;
}

/* ============================================
   PrimeVue Component Overrides
   ============================================ */

/* Buttons */
.p-button {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.p-button.p-button-primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--primary-color-text);
}

.p-button.p-button-primary:hover:not(:disabled) {
  background: var(--primary-800);
  border-color: var(--primary-800);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 26, 46, 0.2);
}

.dark-mode .p-button.p-button-primary {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
}

.dark-mode .p-button.p-button-primary:hover:not(:disabled) {
  background: var(--accent-color-hover);
  border-color: var(--accent-color-hover);
  box-shadow: 0 4px 16px rgba(129, 140, 248, 0.3);
}

/* Text Button (outlined/text style) */
.p-button.p-button-text {
  color: var(--text-color);
}

.p-button.p-button-text:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--accent-color);
}

/* Input Fields */
.p-inputtext {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  color: var(--text-color);
  transition: all 0.2s ease;
}

.p-inputtext::placeholder {
  color: var(--text-color-muted);
}

.p-inputtext:enabled:hover {
  border-color: var(--text-color-secondary);
}

.p-inputtext:enabled:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--focus-ring-alpha);
}

/* Dialog */
.p-dialog {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(26, 26, 46, 0.25);
  overflow: hidden;
}

.dark-mode .p-dialog {
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
}

.p-dialog .p-dialog-header {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 1.25rem 1.5rem;
  color: var(--text-color);
}

.p-dialog .p-dialog-content {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-card);
  padding: 1.5rem;
  color: var(--text-color);
}

.p-dialog .p-dialog-footer {
  background: var(--surface-section);
  border-top: 1px solid var(--surface-border);
  padding: 1rem 1.5rem;
}

/* Menu */
.p-menu {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(26, 26, 46, 0.15);
  padding: 6px;
}

.dark-mode .p-menu {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.p-menu .p-menuitem-link {
  color: var(--text-color);
  padding: 0.625rem 1rem;
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.15s ease;
}

.p-menu .p-menuitem-link:hover {
  background: var(--surface-hover);
  color: var(--accent-color);
}

/* Context Menu */
.p-contextmenu {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(26, 26, 46, 0.15);
  padding: 6px;
}

.dark-mode .p-contextmenu {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.p-contextmenu .p-menuitem-link {
  color: var(--text-color);
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.p-contextmenu .p-menuitem-link:hover {
  background: var(--surface-hover);
  color: var(--accent-color);
}

/* Toast */
.p-toast {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  opacity: 0.98;
}

.p-toast .p-toast-message {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(26, 26, 46, 0.15);
}

.dark-mode .p-toast .p-toast-message {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.p-toast .p-toast-message-content {
  color: var(--text-color);
}

/* Toast variants - 왼쪽 컬러바 제거 */
.p-toast .p-toast-message.p-toast-message-success,
.p-toast .p-toast-message.p-toast-message-error,
.p-toast .p-toast-message.p-toast-message-warn,
.p-toast .p-toast-message.p-toast-message-info {
  border-left: none;
}

/* ============================================
   Utility Classes
   ============================================ */

.text-accent {
  color: var(--accent-color);
}

.bg-accent {
  background-color: var(--accent-color);
}

.border-accent {
  border-color: var(--accent-color);
}
</style>
