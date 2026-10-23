import { defineStore } from 'pinia'
import { ref } from 'vue'

function readFlag(key) {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function writeFlag(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 무시
  }
}

export const useUiStore = defineStore('ui', () => {
  // 다크모드 상태 (index.html에서 이미 클래스 적용됨)
  const isDarkMode = ref(localStorage.getItem('darkMode') !== 'false')

  // 인증 모달
  const authModalVisible = ref(false)
  const authModalMode = ref('login') // 'login' | 'register'

  function openAuthModal(mode = 'login') {
    authModalMode.value = mode
    authModalVisible.value = true
  }

  function closeAuthModal() {
    authModalVisible.value = false
  }

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

  // 오른쪽 연결 패널 (백링크 + 로컬 그래프)
  const isLinkPanelOpen = ref(readFlag('linkPanelOpen'))

  function toggleLinkPanel() {
    isLinkPanelOpen.value = !isLinkPanelOpen.value
    writeFlag('linkPanelOpen', isLinkPanelOpen.value)
  }

  // 노트 링크·그래프에서 다른 노트 열기 요청 (MainView가 처리)
  const openPostRequest = ref(null)

  function requestOpenPost(postId) {
    openPostRequest.value = { postId, at: Date.now() }
  }

  // 주의: 초기화 시 클래스 적용 제거
  // index.html에서 이미 적용되므로 여기서 중복 적용하지 않음

  return {
    isDarkMode,
    toggleDarkMode,
    authModalVisible,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    isLinkPanelOpen,
    toggleLinkPanel,
    openPostRequest,
    requestOpenPost,
  }
})
