<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <router-view />
    <Toast position="bottom-right" />

    <!-- 글로벌 컴포넌트: 필요할 때만 렌더링 -->
    <SessionExpiredModal v-if="isSessionExpired" />
    <GlobalErrorToast v-if="globalError" />
    <AuthModal
      :visible="uiStore.authModalVisible"
      :initial-mode="uiStore.authModalMode"
      @close="uiStore.closeAuthModal()"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import Toast from 'primevue/toast'
import { useUiStore } from '@/stores/uiStore'
import { useAppStore } from '@/stores/appStore'
import AuthModal from '@/components/modals/AuthModal.vue'

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
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

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
  --surface-ground: #f0f1f7;
  --surface-sidebar: #e8e9f2;
  --surface-card: #ffffff;
  --surface-border: #dcdee8;
  --surface-hover: #e8e9f2;
  --surface-overlay: #ffffff;
  --surface-section: #f0f1f7;

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
  --surface-ground: #0c0c14;
  --surface-sidebar: #08080f;
  --surface-card: #12121f;
  --surface-border: #1e1e32;
  --surface-hover: #1a1a2e;
  --surface-overlay: #151522;
  --surface-section: #0a0a12;

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

/* ============================================
   Typography System
   ============================================ */

/* 제목 스타일 */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--text-color);
}

h1 { font-size: 2rem; font-weight: 700; }
h2 { font-size: 1.5rem; font-weight: 600; }
h3 { font-size: 1.25rem; font-weight: 600; }
h4 { font-size: 1.125rem; font-weight: 500; }
h5, h6 { font-size: 1rem; font-weight: 500; }

/* 본문 스타일 */
p, span, li {
  font-weight: 400;
  line-height: 1.65;
  letter-spacing: -0.01em;
}

/* 작은 텍스트 */
small, .text-sm {
  font-size: 0.875rem;
  line-height: 1.5;
  letter-spacing: 0;
}

/* 아주 작은 텍스트 */
.text-xs {
  font-size: 0.75rem;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

/* 강조 텍스트 */
strong, b, .font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

/* 레이블/캡션 */
label, .label {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--text-color-secondary);
}

/* ============================================
   Icon System
   ============================================ */

svg[class*="lucide"] {
  stroke-width: 1.75;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 8px;
  color: var(--text-color-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.icon-btn:active {
  transform: scale(0.95);
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-text svg {
  flex-shrink: 0;
}

/* ============================================
   Base Styles
   ============================================ */

html, body {
  height: 100%;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  letter-spacing: -0.01em;
}

body {
  background-color: var(--surface-ground);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
}

/* Scrollbar */
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

/* Focus */
:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Links */
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
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

/* Text Button */
.p-button.p-button-text {
  color: var(--text-color);
}

.p-button.p-button-text:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--accent-color);
}

/* Input Fields */
.p-inputtext {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  color: var(--text-color);
  transition: all 0.2s ease;
  padding: 0.75rem 1rem;
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 1.5rem 1.75rem;
  color: var(--text-color);
}

.p-dialog .p-dialog-content {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--surface-card);
  padding: 1.75rem;
  color: var(--text-color);
}

.p-dialog .p-dialog-footer {
  background: var(--surface-section);
  border-top: 1px solid var(--surface-border);
  padding: 1.25rem 1.75rem;
}

/* Menu */
.p-menu {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
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

/* Toast variants */
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
