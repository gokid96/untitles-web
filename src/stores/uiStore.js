import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // 다크모드 상태 (index.html에서 이미 클래스 적용됨)
  const isDarkMode = ref(localStorage.getItem('darkMode') !== 'false')

  // 다크모드 토글
  function toggleDarkMode() {
    setDarkMode(!isDarkMode.value)
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

  // 주의: 초기화 시 클래스 적용 제거
  // index.html에서 이미 적용되므로 여기서 중복 적용하지 않음

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    enableDarkMode,
    disableDarkMode,
  }
})
