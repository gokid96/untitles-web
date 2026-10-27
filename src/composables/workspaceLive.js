import { watch, onBeforeUnmount } from 'vue'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { useToast } from 'primevue/usetoast'
import { COLLAB_URL } from '@/composables/collabSession'
import { refreshAccessToken, getFreshAccessToken } from '@/api/axios'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { useGraphStore } from '@/stores/graphStore'
import { debounce } from '@/utils/helpers'

// 노트·폴더 목록이 바뀌는 동작 (서버의 메서드 이름 그대로)
const TREE_ACTIONS = new Set([
  'createPost', 'updatePost', 'deletePost', 'movePost',
  'createFolder', 'updateFolder', 'deleteFolder', 'moveFolder',
  'trashPost', 'trashFolder', 'restorePost', 'restoreFolder',
])
// 연결이 없을 때(편집 서버가 꺼짐 등) 다른 탭·앱에서 돌아오면 목록을 다시 받는 간격
const STALE_MS = 30_000

function postExistsInTree(folderStore, postId) {
  if (folderStore.rootPosts?.some((p) => p.id === postId || p.postId === postId)) return true
  const search = (folders) => (folders || []).some((f) =>
    (f.posts || []).some((p) => p.id === postId || p.postId === postId) || search(f.children))
  return search(folderStore.folders)
}

/**
 * 지금 보고 있는 워크스페이스의 변경(다른 멤버의 노트·폴더 생성/이름 변경/이동/삭제, 멤버 변경)을
 * 실시간으로 받아 목록을 갱신한다. 편집 서버의 "workspace:<id>" 채널을 쓴다.
 */
export function useWorkspaceLive() {
  const toast = useToast()
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()
  const folderStore = useFolderStore()
  const postStore = usePostStore()
  const graphStore = useGraphStore()

  let provider = null
  let ydoc = null
  let connected = false
  let lastTreeLoad = Date.now()
  let removedNoticeShown = false

  const reloadTree = debounce(async (closeCheck) => {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!workspaceId) return
    try {
      await folderStore.loadWorkspaceTree()
      lastTreeLoad = Date.now()
    } catch {
      return
    }
    if (workspaceStore.currentWorkspaceId !== workspaceId) return
    graphStore.refresh()
    // 노트·폴더 개수 표시도 갱신
    workspaceStore.loadWorkspaces().catch(() => {})
    // 열어 둔 노트가 다른 멤버의 삭제·휴지통 이동으로 사라졌으면 닫는다
    const open = postStore.currentPost
    if (closeCheck && open?.id && !postExistsInTree(folderStore, open.id)) {
      postStore.clearCurrentPost()
      toast.add({ severity: 'warn', summary: '노트가 삭제됨', detail: '다른 멤버가 이 노트를 삭제하거나 휴지통으로 옮겼어요.', life: 5000 })
    }
  }, 300)

  const reloadWorkspaces = debounce(async () => {
    const workspaceId = workspaceStore.currentWorkspaceId
    try {
      await workspaceStore.loadWorkspaces()
    } catch {
      return
    }
    workspaceStore.membersVersion++
    // 지금 워크스페이스에서 내보내졌거나 워크스페이스가 삭제됨
    if (workspaceId && !workspaceStore.workspaces.some((w) => w.workspaceId === workspaceId)) {
      if (!removedNoticeShown) {
        removedNoticeShown = true
        toast.add({ severity: 'warn', summary: '워크스페이스', detail: '이 워크스페이스에 더는 접근할 수 없어요. 다른 워크스페이스로 이동했어요.', life: 5000 })
      }
      postStore.clearPostData()
      folderStore.clearFolderData()
      workspaceStore.selectWorkspace(workspaceStore.workspaces[0]?.workspaceId ?? null)
    }
  }, 300)

  function handleMessage(payload) {
    let message
    try {
      message = JSON.parse(payload)
    } catch {
      return
    }
    if (message?.type !== 'workspace-change') return
    const mine = message.actorId != null && Number(message.actorId) === Number(authStore.userId)

    if (TREE_ACTIONS.has(message.action)) {
      // 내가 한 동작은 화면에 이미 반영돼 있다 (같은 계정의 다른 기기를 위해 목록만 다시 받는다)
      reloadTree(!mine)
    } else if (message.action === 'members') {
      reloadWorkspaces()
    } else if (message.action === 'updateWorkspace' || message.action === 'deleteWorkspace') {
      reloadWorkspaces()
    }
  }

  function disconnect() {
    provider?.destroy()
    ydoc?.destroy()
    provider = null
    ydoc = null
    connected = false
  }

  function connect(workspaceId) {
    disconnect()
    removedNoticeShown = false
    if (!COLLAB_URL || !workspaceId || !authStore.isAuthenticated) return
    ydoc = new Y.Doc()
    let refreshing = false
    const current = new HocuspocusProvider({
      url: COLLAB_URL,
      name: `workspace:${workspaceId}`,
      document: ydoc,
      token: () => getFreshAccessToken(),
      onStateless: ({ payload }) => handleMessage(payload),
      onStatus: ({ status }) => {
        const wasConnected = connected
        connected = status === 'connected'
        // 끊겼다 다시 연결되면 그사이 놓친 변경이 있을 수 있으므로 목록을 다시 받는다
        if (connected && !wasConnected && Date.now() - lastTreeLoad > 2000) reloadTree(true)
      },
      onAuthenticationFailed: async () => {
        if (refreshing || provider !== current) return
        refreshing = true
        try {
          await refreshAccessToken()
          if (provider === current) {
            current.disconnect()
            await current.connect()
          }
        } catch {
          // 다음 접속 때 다시 시도
        } finally {
          refreshing = false
        }
      },
    })
    provider = current
  }

  // 실시간 연결이 없으면, 다른 탭·앱에서 돌아왔을 때 목록을 새로 받는다
  function handleVisibility() {
    if (document.visibilityState !== 'visible' || connected) return
    if (!authStore.isAuthenticated || !workspaceStore.currentWorkspaceId) return
    if (Date.now() - lastTreeLoad > STALE_MS) reloadTree(true)
  }
  document.addEventListener('visibilitychange', handleVisibility)

  watch(
    () => [workspaceStore.currentWorkspaceId, authStore.isAuthenticated],
    ([workspaceId, authenticated]) => {
      lastTreeLoad = Date.now()
      if (authenticated && workspaceId) connect(workspaceId)
      else disconnect()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibility)
    disconnect()
  })
}
