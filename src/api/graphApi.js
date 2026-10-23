import apiClient from './axios'

export const graphApi = {
  // 워크스페이스 노트 그래프 (글 목록 + 글 사이 링크)
  async getGraph(workspaceId) {
    const response = await apiClient.get(`/workspaces/${workspaceId}/graph`)
    const data = response.data
    return {
      nodes: (data.nodes || []).map((n) => ({ id: n.postId, title: n.title || '무제', folderId: n.folderId })),
      links: (data.links || []).map((l) => ({ source: l.source, target: l.target })),
    }
  },
}
