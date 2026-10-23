import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { graphApi } from '@/api/graphApi'
import { useWorkspaceStore } from './workspaceStore'
import { usePostStore } from './postStore'
import { useAuthStore } from './authStore'
import { debounce } from '@/utils/helpers'

/**
 * 노트 그래프 상태
 * - [[ 링크 검색 후보, 백링크, 로컬 그래프가 모두 이 데이터를 사용한다
 * - 글이 생성·수정·삭제·이동되면 자동으로 다시 불러온다 (한 번이라도 불러온 경우에만)
 */
export const useGraphStore = defineStore('graph', () => {
  const workspaceStore = useWorkspaceStore()
  const postStore = usePostStore()
  const authStore = useAuthStore()

  const nodes = ref([])
  const links = ref([])
  const loadedWorkspaceId = ref(null)
  const isLoading = ref(false)

  async function load(force = false) {
    const workspaceId = workspaceStore.currentWorkspaceId
    if (!authStore.isAuthenticated || !workspaceId) {
      nodes.value = []
      links.value = []
      loadedWorkspaceId.value = null
      return
    }
    if (!force && loadedWorkspaceId.value === workspaceId) return

    isLoading.value = true
    try {
      const graph = await graphApi.getGraph(workspaceId)
      // 응답이 오는 사이 워크스페이스가 바뀌었으면 버린다
      if (workspaceStore.currentWorkspaceId !== workspaceId) return
      nodes.value = graph.nodes
      links.value = graph.links
      loadedWorkspaceId.value = workspaceId
    } catch (error) {
      console.error('Failed to load graph:', error)
    } finally {
      isLoading.value = false
    }
  }

  const refresh = debounce(() => {
    if (loadedWorkspaceId.value) load(true)
  }, 1000)

  // 글 변경 후 그래프 갱신
  postStore.$onAction(({ name, after }) => {
    if (['createPost', 'updatePost', 'deletePost', 'movePost'].includes(name)) {
      after(() => refresh())
    }
  })

  // 워크스페이스·로그인 상태가 바뀌면 비우고 다시 불러온다
  watch(
    () => [workspaceStore.currentWorkspaceId, authStore.isAuthenticated],
    () => {
      const wasLoaded = loadedWorkspaceId.value !== null
      nodes.value = []
      links.value = []
      loadedWorkspaceId.value = null
      if (wasLoaded) load()
    }
  )

  function titleOf(id) {
    return nodes.value.find((n) => n.id === id)?.title
  }

  // 이 노트를 링크하는 노트
  function backlinksOf(postId) {
    const ids = new Set(links.value.filter((l) => l.target === postId).map((l) => l.source))
    return nodes.value.filter((n) => ids.has(n.id))
  }

  // 이 노트가 링크하는 노트
  function outgoingOf(postId) {
    const ids = new Set(links.value.filter((l) => l.source === postId).map((l) => l.target))
    return nodes.value.filter((n) => ids.has(n.id))
  }

  // postId 중심으로 depth 단계까지 연결된 부분 그래프 (방향 무시)
  function localGraph(postId, depth = 2) {
    const visited = new Set([postId])
    let frontier = [postId]
    for (let d = 0; d < depth; d++) {
      const next = []
      for (const id of frontier) {
        for (const l of links.value) {
          const other = l.source === id ? l.target : l.target === id ? l.source : null
          if (other !== null && !visited.has(other)) {
            visited.add(other)
            next.push(other)
          }
        }
      }
      frontier = next
    }
    return {
      nodes: nodes.value.filter((n) => visited.has(n.id)),
      links: links.value.filter((l) => visited.has(l.source) && visited.has(l.target)),
    }
  }

  return { nodes, links, isLoading, load, titleOf, backlinksOf, outgoingOf, localGraph }
})
