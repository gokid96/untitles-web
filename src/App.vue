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
/* Reset */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* CSS Variables - Light Mode */
:root {
  --primary-color: #171717;
  --primary-color-text: #ffffff;
  --primary-50: #fafafa;
  --primary-100: #f5f5f5;
  --primary-200: #e5e5e5;
  --primary-300: #d4d4d4;
  --primary-400: #a3a3a3;
  --primary-500: #737373;
  --primary-600: #525252;
  --primary-700: #404040;
  --primary-800: #262626;
  --primary-900: #171717;

  --surface-ground: #fafafa;
  --surface-card: #ffffff;
  --surface-border: #e5e5e5;
  --surface-hover: #f5f5f5;
  --surface-overlay: #ffffff;

  --text-color: #171717;
  --text-color-secondary: #737373;

  --highlight-bg: #f0f0f0;
  --highlight-text-color: #171717;

  --focus-ring: rgba(23, 23, 23, 0.15);
  --focus-ring-alpha: rgba(23, 23, 23, 0.1);

  --red-500: #ef4444;
  --green-500: #22c55e;
}

/* Dark Mode */
.dark-mode {
  --primary-color: #ffffff;
  --primary-color-text: #0a0a0a;

  --surface-ground: #0a0a0a;
  --surface-card: #141414;
  --surface-border: #262626;
  --surface-hover: #1f1f1f;
  --surface-overlay: #1a1a1a;

  --text-color: #fafafa;
  --text-color-secondary: #a3a3a3;

  --highlight-bg: #262626;
  --highlight-text-color: #fafafa;

  --focus-ring: rgba(255, 255, 255, 0.15);
  --focus-ring-alpha: rgba(255, 255, 255, 0.1);
}

/* Base */
html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--surface-ground);
  color: var(--text-color);
  transition: background-color 0.2s, color 0.2s;
}

#app {
  height: 100vh;
  overflow: hidden;
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
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-color-secondary);
}

/* Selection */
::selection {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

/* Focus */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Links */
a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* PrimeVue Overrides */
.p-button {
  font-weight: 500;
  transition: all 0.2s;
}

.p-button.p-button-primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--primary-color-text);
}

.p-button.p-button-primary:hover:not(:disabled) {
  background: var(--primary-800);
  border-color: var(--primary-800);
}

.dark-mode .p-button.p-button-primary:hover:not(:disabled) {
  background: var(--primary-200);
  border-color: var(--primary-200);
}

.p-inputtext {
  background: var(--surface-card);
  border-color: var(--surface-border);
  color: var(--text-color);
}

.p-inputtext:enabled:hover {
  border-color: var(--text-color-secondary);
}

.p-inputtext:enabled:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--focus-ring-alpha);
}

.p-dialog {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.dark-mode .p-dialog {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.p-dialog .p-dialog-header {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 1.25rem 1.5rem;
}

.p-dialog .p-dialog-content {
  background: var(--surface-card);
  padding: 1.5rem;
}

.p-dialog .p-dialog-footer {
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  padding: 1rem 1.5rem;
}

.p-menu {
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.dark-mode .p-menu {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.p-menu .p-menuitem-link {
  color: var(--text-color);
  padding: 0.625rem 1rem;
  border-radius: 4px;
  margin: 2px 4px;
}

.p-menu .p-menuitem-link:hover {
  background: var(--surface-hover);
}

.p-contextmenu {
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.dark-mode .p-contextmenu {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.p-contextmenu .p-menuitem-link {
  color: var(--text-color);
  padding: 0.5rem 0.75rem;
}

.p-contextmenu .p-menuitem-link:hover {
  background: var(--surface-hover);
}

.p-toast {
  opacity: 0.98;
}

.p-toast .p-toast-message {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.dark-mode .p-toast .p-toast-message {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.p-toast .p-toast-message-content {
  color: var(--text-color);
}
</style>
