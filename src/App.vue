<template>
  <div id="app">
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import Toast from 'primevue/toast'
import { useUiStore } from '@/stores/uiStore'

// UI Store 초기화 (다크모드 클래스 적용)
useUiStore()

// 인증 확인은 라우터 가드에서 처리
</script>

<style>
/* 기본 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 라이트 모드 (기본) - 모던 블랙/화이트 */
:root {
  /* PrimeVue Primary Colors Override - Black */
  --p-primary-50: #fafafa;
  --p-primary-100: #f5f5f5;
  --p-primary-200: #e5e5e5;
  --p-primary-300: #d4d4d4;
  --p-primary-400: #a3a3a3;
  --p-primary-500: #737373;
  --p-primary-600: #525252;
  --p-primary-700: #404040;
  --p-primary-800: #262626;
  --p-primary-900: #171717;
  --p-primary-950: #0a0a0a;

  /* Primary Colors - Modern Black */
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

  --primary-color: #171717;
  --primary-color-text: #ffffff;

  /* Surface Colors - Clean White */
  --surface-0: #ffffff;
  --surface-50: #fafafa;
  --surface-100: #f5f5f5;
  --surface-200: #e5e5e5;
  --surface-300: #d4d4d4;
  --surface-400: #a3a3a3;
  --surface-500: #737373;
  --surface-600: #525252;
  --surface-700: #404040;
  --surface-800: #262626;
  --surface-900: #171717;

  --surface-ground: #ffffff;
  --surface-section: #ffffff;
  --surface-card: #ffffff;
  --surface-overlay: #ffffff;
  --surface-border: #e5e5e5;
  --surface-hover: #f5f5f5;

  /* Text Colors - Black */
  --text-color: #171717;
  --text-color-secondary: #737373;

  /* Highlights */
  --highlight-bg: #f5f5f5;
  --highlight-text-color: #171717;

  /* Semantic Colors - Minimal */
  --success-color: #171717;
  --success-color-text: #ffffff;
  --info-color: #525252;
  --info-color-text: #ffffff;
  --warning-color: #737373;
  --warning-color-text: #ffffff;
  --danger-color: #171717;
  --danger-color-text: #ffffff;

  /* Focus States */
  --focus-ring: #171717;
  --focus-ring-alpha: rgba(23, 23, 23, 0.1);

  /* Transitions */
  --transition-duration: 0.2s;
}

/* 다크 모드 - 모던 블랙/화이트 */
.dark-mode {
  /* PrimeVue Primary Colors Override - White for Dark Mode */
  --p-primary-50: #0a0a0a;
  --p-primary-100: #171717;
  --p-primary-200: #262626;
  --p-primary-300: #404040;
  --p-primary-400: #525252;
  --p-primary-500: #737373;
  --p-primary-600: #a3a3a3;
  --p-primary-700: #d4d4d4;
  --p-primary-800: #e5e5e5;
  --p-primary-900: #f5f5f5;
  --p-primary-950: #fafafa;

  /* Primary Colors - White */
  --primary-50: #0a0a0a;
  --primary-100: #171717;
  --primary-200: #262626;
  --primary-300: #404040;
  --primary-400: #525252;
  --primary-500: #737373;
  --primary-600: #a3a3a3;
  --primary-700: #d4d4d4;
  --primary-800: #e5e5e5;
  --primary-900: #f5f5f5;

  --primary-color: #ffffff;
  --primary-color-text: #0a0a0a;

  /* Surface Colors - Dark */
  --surface-0: #0a0a0a;
  --surface-50: #171717;
  --surface-100: #262626;
  --surface-200: #404040;
  --surface-300: #525252;
  --surface-400: #737373;
  --surface-500: #a3a3a3;
  --surface-600: #d4d4d4;
  --surface-700: #e5e5e5;
  --surface-800: #f5f5f5;
  --surface-900: #fafafa;

  --surface-ground: #0a0a0a;
  --surface-section: #171717;
  --surface-card: #171717;
  --surface-overlay: #171717;
  --surface-border: #262626;
  --surface-hover: #262626;

  /* Text Colors - White */
  --text-color: #ffffff;
  --text-color-secondary: #a3a3a3;

  /* Highlights */
  --highlight-bg: #262626;
  --highlight-text-color: #ffffff;

  /* Semantic Colors - Dark Mode */
  --success-color: #ffffff;
  --success-color-text: #0a0a0a;
  --info-color: #d4d4d4;
  --info-color-text: #0a0a0a;
  --warning-color: #a3a3a3;
  --warning-color-text: #0a0a0a;
  --danger-color: #ffffff;
  --danger-color-text: #0a0a0a;

  /* Focus States */
  --focus-ring: #ffffff;
  --focus-ring-alpha: rgba(255, 255, 255, 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--surface-ground);
  color: var(--text-color);
  transition: background-color var(--transition-duration), color var(--transition-duration);
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 스크롤바 스타일 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--surface-ground);
}

::-webkit-scrollbar-thumb {
  background: var(--surface-400);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--surface-500);
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: var(--surface-300);
}

.dark-mode ::-webkit-scrollbar-thumb:hover {
  background: var(--surface-400);
}

/* PrimeVue 컴포넌트 커스텀 스타일 */

/* 버튼 스타일 */
:deep(.p-button) {
  transition: all 0.2s;
  font-weight: 500;
}

:deep(.p-button.p-button-primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--primary-color-text);
}

:deep(.p-button.p-button-primary:hover:not(:disabled)) {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.dark-mode :deep(.p-button.p-button-primary:hover:not(:disabled)) {
  background-color: var(--primary-500);
  border-color: var(--primary-500);
  box-shadow: 0 4px 8px rgba(96, 165, 250, 0.4);
}

:deep(.p-button.p-button-primary:active) {
  transform: translateY(0);
}

:deep(.p-button.p-button-secondary) {
  background-color: var(--surface-200);
  border-color: var(--surface-300);
  color: var(--text-color);
}

:deep(.p-button.p-button-secondary:hover:not(:disabled)) {
  background-color: var(--surface-300);
  border-color: var(--surface-400);
  transform: translateY(-1px);
}

:deep(.p-button.p-button-danger) {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  color: var(--danger-color-text);
}

:deep(.p-button.p-button-danger:hover:not(:disabled)) {
  background-color: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.dark-mode :deep(.p-button.p-button-danger:hover:not(:disabled)) {
  background-color: #f87171;
  border-color: #f87171;
  box-shadow: 0 4px 8px rgba(248, 113, 113, 0.4);
}

:deep(.p-button.p-button-text) {
  color: var(--text-color);
}

:deep(.p-button.p-button-text:hover:not(:disabled)) {
  background-color: var(--surface-hover);
}

:deep(.p-button-icon) {
  color: inherit;
}

:deep(.p-button:focus) {
  box-shadow: 0 0 0 3px var(--focus-ring-alpha);
}

/* Input 스타일 */
:deep(.p-inputtext),
:deep(.p-inputtextarea),
:deep(.p-dropdown) {
  background-color: var(--surface-card);
  border-color: var(--surface-border);
  color: var(--text-color);
  transition: all 0.2s;
}

:deep(.p-inputtext:enabled:hover),
:deep(.p-inputtextarea:enabled:hover) {
  border-color: var(--surface-400);
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-inputtextarea:enabled:focus) {
  border-color: var(--focus-ring) !important;
  box-shadow: 0 0 0 3px var(--focus-ring-alpha) !important;
  outline: none !important;
}

:deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: var(--surface-400);
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: var(--focus-ring) !important;
  box-shadow: 0 0 0 3px var(--focus-ring-alpha) !important;
}

/* Password Input */
:deep(.p-password-input:enabled:focus) {
  border-color: var(--focus-ring) !important;
  box-shadow: 0 0 0 3px var(--focus-ring-alpha) !important;
}

/* Card 스타일 */
:deep(.p-card) {
  background-color: var(--surface-card);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode :deep(.p-card) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

:deep(.p-card .p-card-title) {
  color: var(--text-color);
}

:deep(.p-card .p-card-content) {
  color: var(--text-color);
}

/* Dialog 스타일 */
:deep(.p-dialog) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border: 1px solid var(--surface-border);
}

:deep(.p-dialog .p-dialog-header) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-dialog .p-dialog-content) {
  background-color: var(--surface-card);
  color: var(--text-color);
}

:deep(.p-dialog .p-dialog-footer) {
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
}

/* Tree 스타일 */
:deep(.p-tree) {
  background-color: transparent;
  color: var(--text-color);
  border: none;
}

:deep(.p-tree .p-tree-container .p-treenode .p-treenode-content) {
  color: var(--text-color);
  transition: all 0.2s;
}

:deep(.p-tree .p-tree-container .p-treenode .p-treenode-content:hover) {
  background-color: var(--surface-hover);
}

:deep(.p-tree .p-tree-container .p-treenode .p-treenode-content.p-highlight) {
  background-color: var(--highlight-bg);
  color: var(--highlight-text-color);
}

:deep(.p-tree .p-treenode-icon) {
  color: var(--primary-color);
}

/* Menu 스타일 */
:deep(.p-menu) {
  background-color: var(--surface-overlay);
  border-color: var(--surface-border);
}

:deep(.p-menu .p-menuitem-link) {
  color: var(--text-color);
  transition: all 0.2s;
}

:deep(.p-menu .p-menuitem-link:hover) {
  background-color: var(--surface-hover);
}

:deep(.p-menu .p-menuitem-icon) {
  color: var(--text-color-secondary);
}

/* Context Menu 스타일 */
:deep(.p-contextmenu) {
  background-color: var(--surface-overlay);
  border-color: var(--surface-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark-mode :deep(.p-contextmenu) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

:deep(.p-contextmenu .p-menuitem-link) {
  color: var(--text-color);
}

:deep(.p-contextmenu .p-menuitem-link:hover) {
  background-color: var(--surface-hover);
}

/* Dropdown 스타일 */
:deep(.p-dropdown-panel) {
  background-color: var(--surface-overlay);
  border-color: var(--surface-border);
}

:deep(.p-dropdown-items .p-dropdown-item) {
  color: var(--text-color);
}

:deep(.p-dropdown-items .p-dropdown-item:hover) {
  background-color: var(--surface-hover);
}

:deep(.p-dropdown-items .p-dropdown-item.p-highlight) {
  background-color: var(--highlight-bg);
  color: var(--highlight-text-color);
}

/* Checkbox 스타일 */
:deep(.p-checkbox .p-checkbox-box) {
  border-color: var(--surface-border);
  background-color: var(--surface-card);
  transition: all 0.2s;
}

:deep(.p-checkbox .p-checkbox-box:hover) {
  border-color: var(--primary-color);
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
}

:deep(.p-checkbox:not(.p-disabled) .p-checkbox-box.p-focus) {
  border-color: var(--focus-ring);
  box-shadow: 0 0 0 3px var(--focus-ring-alpha);
}

/* Paginator 스타일 */
:deep(.p-paginator) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-color: var(--surface-border);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  color: var(--text-color);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:hover) {
  background-color: var(--surface-hover);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}

/* Toast 스타일 */
:deep(.p-toast) {
  opacity: 0.95;
}

:deep(.p-toast .p-toast-message) {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark-mode :deep(.p-toast .p-toast-message) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

:deep(.p-toast .p-toast-message .p-toast-message-content) {
  color: var(--text-color);
}

:deep(.p-toast .p-toast-message .p-toast-icon-close) {
  color: var(--text-color-secondary);
}

/* Toast severity 스타일 */
:deep(.p-toast .p-toast-message.p-toast-message-success .p-toast-message-icon),
:deep(.p-toast .p-toast-message.p-toast-message-success .p-toast-summary) {
  color: var(--success-color);
}

:deep(.p-toast .p-toast-message.p-toast-message-info .p-toast-message-icon),
:deep(.p-toast .p-toast-message.p-toast-message-info .p-toast-summary) {
  color: var(--info-color);
}

:deep(.p-toast .p-toast-message.p-toast-message-warn .p-toast-message-icon),
:deep(.p-toast .p-toast-message.p-toast-message-warn .p-toast-summary) {
  color: var(--warning-color);
}

:deep(.p-toast .p-toast-message.p-toast-message-error .p-toast-message-icon),
:deep(.p-toast .p-toast-message.p-toast-message-error .p-toast-summary) {
  color: var(--danger-color);
}

/* Divider 스타일 */
:deep(.p-divider) {
  border-color: var(--surface-border);
}

/* Password Input 스타일 */
:deep(.p-password-panel) {
  background-color: var(--surface-overlay);
  border-color: var(--surface-border);
  color: var(--text-color);
}

/* Splitter 스타일 */
:deep(.p-splitter) {
  border-color: var(--surface-border);
}

:deep(.p-splitter-gutter) {
  background-color: var(--surface-border);
  transition: background-color 0.2s;
}

:deep(.p-splitter-gutter:hover) {
  background-color: var(--surface-300);
}

:deep(.p-splitter-gutter-handle) {
  background-color: var(--surface-400);
}

/* Icon Colors */
:deep(.pi) {
  color: inherit;
}

:deep(.p-button .pi) {
  color: inherit;
}
</style>
