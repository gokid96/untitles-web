import { ref, onUnmounted } from 'vue'

/**
 * 화면 오른쪽 패널 너비 조절 (왼쪽 경계를 드래그)
 * - 기본 너비는 화면의 약 38%, 최소·최대 범위 안에서만 조절
 * - 조절한 너비는 기억해 둔다
 */
export function usePanelResize(options = {}) {
  const { minWidth = 320, maxRatio = 0.6, defaultRatio = 0.38, storageKey = 'linkPanelWidth' } = options

  const clamp = (w) => Math.round(Math.min(Math.max(w, minWidth), Math.max(minWidth, window.innerWidth * maxRatio)))

  function initialWidth() {
    try {
      const saved = Number(localStorage.getItem(storageKey))
      if (saved > 0) return clamp(saved)
    } catch {
      // 저장소를 쓸 수 없으면 기본값
    }
    return clamp(window.innerWidth * defaultRatio)
  }

  const panelWidth = ref(initialWidth())
  const isResizingPanel = ref(false)

  function onMove(e) {
    panelWidth.value = clamp(window.innerWidth - e.clientX)
  }

  function stop() {
    if (!isResizingPanel.value) return
    isResizingPanel.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', stop)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    try {
      localStorage.setItem(storageKey, String(panelWidth.value))
    } catch {
      // 무시
    }
  }

  function startPanelResize(e) {
    e.preventDefault()
    isResizingPanel.value = true
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', stop)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  function onWindowResize() {
    panelWidth.value = clamp(panelWidth.value)
  }
  window.addEventListener('resize', onWindowResize)

  onUnmounted(() => {
    stop()
    window.removeEventListener('resize', onWindowResize)
  })

  return { panelWidth, isResizingPanel, startPanelResize }
}
