import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // 다크모드 상태
  const isDarkMode = ref(localStorage.getItem('darkMode') !== 'false')

  // 다크모드 토글
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', isDarkMode.value.toString())

    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }

  // 다크모드 설정
  function setDarkMode(value) {
    isDarkMode.value = value
    localStorage.setItem('darkMode', value.toString())

    if (value) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }

  // 다크모드 활성화
  function enableDarkMode() {
    setDarkMode(true)
  }

  // 다크모드 비활성화
  function disableDarkMode() {
    setDarkMode(false)
  }

  // 초기화 시 다크모드 클래스 적용
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode')
  }

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    enableDarkMode,
    disableDarkMode,
  }
})
