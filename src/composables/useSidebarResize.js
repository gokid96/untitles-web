import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 사이드바 리사이즈 기능을 제공하는 컴포저블
 * - 이벤트 리스너 메모리 누수 방지
 * - 리사이즈 상태 관리 캡슐화
 */
export function useSidebarResize(options = {}) {
  const {
    minWidth = 200,
    maxWidth = 500,
    defaultWidth = 280,
    storageKey = 'sidebarWidth'
  } = options

  const sidebarWidth = ref(defaultWidth)
  const isResizing = ref(false)
  const isSidebarCollapsed = ref(false)

  // 이벤트 핸들러 참조 저장 (cleanup용)
  let mouseMoveHandler = null
  let mouseUpHandler = null

  function handleResize(e) {
    if (!isResizing.value) return
    
    const newWidth = e.clientX
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth
    }
  }

  function stopResize() {
    if (!isResizing.value) return
    
    isResizing.value = false
    
    // 이벤트 리스너 제거
    if (mouseMoveHandler) {
      document.removeEventListener('mousemove', mouseMoveHandler)
      mouseMoveHandler = null
    }
    if (mouseUpHandler) {
      document.removeEventListener('mouseup', mouseUpHandler)
      mouseUpHandler = null
    }
    
    // 스타일 복원
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    
    // 로컬스토리지에 저장
    localStorage.setItem(storageKey, sidebarWidth.value.toString())
  }

  function startResize(e) {
    // 이미 리사이징 중이면 무시
    if (isResizing.value) return
    
    isResizing.value = true
    
    // 핸들러 참조 저장
    mouseMoveHandler = handleResize
    mouseUpHandler = stopResize
    
    // 이벤트 리스너 등록
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
    
    // 리사이징 중 텍스트 선택 방지
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  // 저장된 너비 복원
  function loadSavedWidth() {
    const savedWidth = localStorage.getItem(storageKey)
    if (savedWidth) {
      const width = parseInt(savedWidth)
      if (width >= minWidth && width <= maxWidth) {
        sidebarWidth.value = width
      }
    }
  }

  // 컴포넌트 마운트 시 저장된 너비 복원
  onMounted(() => {
    loadSavedWidth()
  })

  // 컴포넌트 언마운트 시 이벤트 리스너 정리
  onUnmounted(() => {
    // 리사이징 중이었다면 정리
    if (mouseMoveHandler) {
      document.removeEventListener('mousemove', mouseMoveHandler)
      mouseMoveHandler = null
    }
    if (mouseUpHandler) {
      document.removeEventListener('mouseup', mouseUpHandler)
      mouseUpHandler = null
    }
    
    // 스타일 복원
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  })

  return {
    sidebarWidth,
    isResizing,
    isSidebarCollapsed,
    startResize,
    stopResize,
    toggleSidebar
  }
}
