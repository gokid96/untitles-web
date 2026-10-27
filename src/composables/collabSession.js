import { ref } from 'vue'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'

/** 실시간 편집 서버 주소. 비어 있으면 실시간 편집을 쓰지 않는다 */
export const COLLAB_URL = import.meta.env.VITE_COLLAB_URL || ''

const CARET_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#60a5fa', '#a78bfa', '#f472b6']

export function caretColorFor(userId) {
  const n = Number(userId) || 0
  return CARET_COLORS[Math.abs(n) % CARET_COLORS.length]
}

/**
 * 노트 하나에 대한 실시간 편집 연결.
 * Y 문서의 'default' 필드는 본문(Tiptap), 'title' 텍스트는 제목.
 *
 * @param {object} options
 * @param {number} options.workspaceId
 * @param {number} options.postId
 * @param {() => string} options.getToken 현재 액세스 토큰
 * @param {() => Promise<boolean>} options.refreshToken 토큰을 새로 받아 오면 true
 * @param {(title: string) => void} options.onRemoteTitle 다른 사람이 제목을 바꿨을 때
 */
export function createCollabSession({ workspaceId, postId, getToken, refreshToken, onRemoteTitle }) {
  const ydoc = new Y.Doc()
  const yTitle = ydoc.getText('title')

  const status = ref('connecting') // connecting | connected | disconnected
  const synced = ref(false)
  const unsynced = ref(0)
  const readOnly = ref(false)
  const authFailed = ref(false)
  const peers = ref([]) // 같은 노트를 보고 있는 다른 사람 [{ clientId, name, color }]

  let refreshing = false
  let destroyed = false
  let connectFailed = false

  const provider = new HocuspocusProvider({
    url: COLLAB_URL,
    name: `post:${workspaceId}:${postId}`,
    document: ydoc,
    token: () => getToken() || '',
    onStatus: ({ status: s }) => {
      status.value = s
    },
    // 첫 동기화 전에 연결이 끊기면(서버가 꺼져 있거나 막힘) 기다리지 않고 일반 저장으로 넘어가게 한다
    onClose: () => {
      if (!synced.value) connectFailed = true
    },
    onSynced: ({ state }) => {
      if (state) synced.value = true
    },
    onAuthenticated: (data) => {
      authFailed.value = false
      readOnly.value = data?.scope === 'readonly'
    },
    onAuthenticationFailed: async () => {
      // 액세스 토큰이 만료됐을 수 있다: 한 번 새로 받아서 다시 연결
      if (refreshing || destroyed) return
      refreshing = true
      try {
        if (await refreshToken()) {
          provider.disconnect()
          await provider.connect()
          return
        }
      } catch {
        // 아래에서 실패 처리
      } finally {
        refreshing = false
      }
      authFailed.value = true
    },
    onAwarenessUpdate: ({ states }) => {
      const me = ydoc.clientID
      peers.value = states
        .filter((s) => s.clientId !== me && s.user?.name)
        .map((s) => ({ clientId: s.clientId, name: s.user.name, color: s.user.color }))
    },
  })

  provider.on('unsyncedChanges', (data) => {
    unsynced.value = typeof data?.number === 'number' ? data.number : provider.unsyncedChanges
  })

  yTitle.observe((event) => {
    if (!event.transaction.local) onRemoteTitle?.(yTitle.toString())
  })

  /**
   * 첫 동기화를 기다린다. 시간 안에 안 되거나, 편집 서버에 연결이 거부되면(꺼져 있음 등) 바로 false
   */
  function waitForSync(timeoutMs) {
    if (synced.value) return Promise.resolve(true)
    return new Promise((resolve) => {
      const started = Date.now()
      const timer = setInterval(() => {
        const refused = connectFailed && Date.now() - started > 300
        if (synced.value || destroyed || authFailed.value || refused || Date.now() - started > timeoutMs) {
          clearInterval(timer)
          resolve(synced.value && !destroyed)
        }
      }, 50)
    })
  }

  /** 제목 변경: 바뀐 부분만 고쳐서 동시에 고친 내용이 덮이지 않게 한다 */
  function setTitle(next) {
    const current = yTitle.toString()
    if (next === current) return
    let start = 0
    while (start < current.length && start < next.length && current[start] === next[start]) start++
    let endCur = current.length
    let endNext = next.length
    while (endCur > start && endNext > start && current[endCur - 1] === next[endNext - 1]) {
      endCur--
      endNext--
    }
    ydoc.transact(() => {
      if (endCur > start) yTitle.delete(start, endCur - start)
      if (endNext > start) yTitle.insert(start, next.slice(start, endNext))
    })
  }

  /**
   * 연결을 닫는다. 서버에 아직 전달되지 않은 입력이 있으면 전달될 때까지(최대 maxWaitMs) 기다렸다가 닫는다.
   */
  function destroy(maxWaitMs = 60_000) {
    destroyed = true
    const finish = () => {
      provider.destroy()
      ydoc.destroy()
    }
    if (provider.unsyncedChanges === 0 || status.value === 'connecting' && !synced.value) {
      finish()
      return
    }
    const started = Date.now()
    const timer = setInterval(() => {
      if (provider.unsyncedChanges === 0 || Date.now() - started > maxWaitMs) {
        clearInterval(timer)
        finish()
      }
    }, 200)
  }

  return {
    ydoc,
    yTitle,
    provider,
    status,
    synced,
    unsynced,
    readOnly,
    authFailed,
    peers,
    waitForSync,
    setTitle,
    destroy,
    get title() {
      return yTitle.toString()
    },
  }
}
