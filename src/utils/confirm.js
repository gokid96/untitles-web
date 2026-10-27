import { reactive, markRaw } from 'vue'

/**
 * 앱 안 확인창 (브라우저 기본 confirm 대신). App.vue의 확인창 하나를 같이 쓴다.
 *
 *   if (!(await askConfirm({ title: '멤버 내보내기', message: '...', confirmLabel: '내보내기' }))) return
 */
export const confirmState = reactive({
  visible: false,
  title: '',
  message: '',
  confirmLabel: '확인',
  cancelLabel: '취소',
  variant: 'danger',
  icon: null,
})

let pending = null

export function askConfirm({ title = '확인', message = '', confirmLabel = '확인', cancelLabel = '취소', variant = 'danger', icon = null } = {}) {
  // 이미 열린 확인창이 있으면 취소로 끝낸다
  if (pending) pending(false)
  Object.assign(confirmState, { title, message, confirmLabel, cancelLabel, variant, icon: icon ? markRaw(icon) : null, visible: true })
  return new Promise((resolve) => {
    pending = resolve
  })
}

export function resolveConfirm(result) {
  confirmState.visible = false
  const resolve = pending
  pending = null
  resolve?.(result)
}
