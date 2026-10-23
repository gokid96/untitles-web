<template>
  <div class="link-panel">
    <div class="panel-header">
      <div class="scope-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          :class="{ active: scope === 'local' }"
          :disabled="!currentPostId"
          @click="scope = 'local'"
        >이 노트 주변</button>
        <button type="button" role="tab" :class="{ active: scope === 'all' }" @click="scope = 'all'">전체</button>
      </div>
      <button class="close-btn" type="button" title="패널 닫기" @click="uiStore.toggleLinkPanel()">
        <X class="close-icon" />
      </button>
    </div>

    <!-- 그래프 -->
    <div class="graph-wrap">
      <div ref="graphEl" class="graph-canvas"></div>
      <div v-if="graphData.nodes.length === 0" class="graph-empty">
        {{ graphStore.isLoading ? '불러오는 중…' : '노트가 없습니다' }}
      </div>
      <div v-else-if="scope === 'local' && graphData.links.length === 0" class="graph-hint">
        본문에 <code>[[</code>를 입력해 다른 노트를 링크해 보세요
      </div>
    </div>

    <!-- 백링크 / 나가는 링크 -->
    <div v-if="currentPostId" class="link-lists">
      <section>
        <h4>이 노트를 링크한 노트 <span class="count">{{ backlinks.length }}</span></h4>
        <ul v-if="backlinks.length">
          <li v-for="n in backlinks" :key="n.id">
            <button type="button" class="link-row" @click="open(n.id)">
              <FileText class="row-icon" />
              <span>{{ n.title }}</span>
            </button>
          </li>
        </ul>
        <p v-else class="empty">아직 없습니다</p>
      </section>
      <section>
        <h4>이 노트가 링크한 노트 <span class="count">{{ outgoing.length }}</span></h4>
        <ul v-if="outgoing.length">
          <li v-for="n in outgoing" :key="n.id">
            <button type="button" class="link-row" @click="open(n.id)">
              <FileText class="row-icon" />
              <span>{{ n.title }}</span>
            </button>
          </li>
        </ul>
        <p v-else class="empty">아직 없습니다</p>
      </section>
    </div>
    <p v-else class="no-post">노트를 열면 링크된 노트가 여기에 표시됩니다</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ForceGraph from 'force-graph'
import { X, FileText } from 'lucide-vue-next'
import { useGraphStore } from '@/stores/graphStore'
import { usePostStore } from '@/stores/postStore'
import { useUiStore } from '@/stores/uiStore'

const graphStore = useGraphStore()
const postStore = usePostStore()
const uiStore = useUiStore()

const graphEl = ref(null)
const scope = ref('local')
let graph = null
let resizeObserver = null

const currentPostId = computed(() => postStore.currentPost?.id ?? null)

const graphData = computed(() => {
  if (scope.value === 'local' && currentPostId.value) {
    return graphStore.localGraph(currentPostId.value, 2)
  }
  return { nodes: graphStore.nodes, links: graphStore.links }
})

const backlinks = computed(() => (currentPostId.value ? graphStore.backlinksOf(currentPostId.value) : []))
const outgoing = computed(() => (currentPostId.value ? graphStore.outgoingOf(currentPostId.value) : []))

function open(postId) {
  uiStore.requestOpenPost(postId)
}

function themeColors() {
  const css = getComputedStyle(document.documentElement)
  const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback
  return {
    primary: v('--primary-color', '#6366f1'),
    text: v('--text-color', '#e5e5e5'),
    muted: v('--text-color-secondary', '#8a8a8a'),
    line: v('--surface-border', 'rgba(255,255,255,0.15)'),
  }
}

// 전체가 보이게 맞추되, 노드가 적을 때 지나치게 확대되지 않게 제한
function fitView() {
  if (!graph) return
  graph.zoomToFit(0, 64)  // 라벨이 잘리지 않도록 여백
  if (graph.zoom() > 2.2) graph.zoom(2.2)
}

function renderGraph() {
  if (!graph) return
  const colors = themeColors()
  const degree = new Map()
  for (const l of graphData.value.links) {
    degree.set(l.source, (degree.get(l.source) || 0) + 1)
    degree.set(l.target, (degree.get(l.target) || 0) + 1)
  }
  // force-graph가 객체를 변형하므로 복사해서 넘긴다
  const data = {
    nodes: graphData.value.nodes.map((n) => ({ id: n.id, title: n.title, degree: degree.get(n.id) || 0 })),
    links: graphData.value.links.map((l) => ({ source: l.source, target: l.target })),
  }
  const showAllLabels = data.nodes.length <= 25

  graph
    .linkColor(() => colors.line)
    .linkDirectionalArrowColor(() => colors.muted)
    .nodeCanvasObject((node, ctx, scale) => {
      const isCurrent = node.id === currentPostId.value
      const r = 2.5 + Math.min(node.degree, 6) * 0.6
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      ctx.globalAlpha = isCurrent || node.degree > 0 ? 1 : 0.5
      ctx.fillStyle = isCurrent ? colors.text : colors.muted
      ctx.fill()
      ctx.globalAlpha = 1
      if (isCurrent) {
        // 지금 보고 있는 노트: 바깥 고리로 표시 (테마 기본색이 흰색이어도 구분되도록)
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 2.5 / scale + 1.5, 0, 2 * Math.PI)
        ctx.lineWidth = 1.5 / scale
        ctx.strokeStyle = colors.text
        ctx.stroke()
      }
      if (showAllLabels || isCurrent || scale > 1.6) {
        const fontSize = 11 / scale
        ctx.font = `${isCurrent ? '600 ' : ''}${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = isCurrent ? colors.text : colors.muted
        const label = node.title.length > 16 ? node.title.slice(0, 15) + '…' : node.title
        ctx.fillText(label, node.x, node.y + r + 1.5)
      }
    })
    .nodePointerAreaPaint((node, color, ctx) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
      ctx.fill()
    })
    .graphData(data)
}

onMounted(async () => {
  await graphStore.load()
  await nextTick()
  if (!graphEl.value) return

  graph = new ForceGraph(graphEl.value)
    .backgroundColor('rgba(0,0,0,0)')
    .nodeId('id')
    .nodeLabel((n) => n.title)
    .linkDirectionalArrowLength(3)
    .linkDirectionalArrowRelPos(1)
    .cooldownTicks(120)
    .onNodeClick((node) => open(node.id))
    .onEngineStop(() => fitView())

  // 노드가 모이는 거리 조정 (연결 없는 노드가 멀리 밀려나지 않게)
  graph.d3Force('charge')?.strength(-60).distanceMax(120)
  graph.d3Force('link')?.distance(45)

  const resize = () => {
    if (!graph || !graphEl.value) return
    graph.width(graphEl.value.clientWidth).height(graphEl.value.clientHeight)
  }
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(graphEl.value)
  resize()
  renderGraph()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  graph?._destructor?.()
  graph = null
})

watch(currentPostId, (id) => {
  if (!id) scope.value = 'all'
  else scope.value = 'local'
})
watch([graphData, () => uiStore.isDarkMode], () => renderGraph())
</script>

<style scoped>
.link-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  color: var(--text-color);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--surface-border);
}

.scope-toggle {
  display: flex;
  margin-left: auto;
  padding: 2px;
  border-radius: 6px;
  background: var(--surface-hover);
}

.scope-toggle button {
  padding: 3px 8px;
  border: none;
  border-radius: 4px;
  background: none;
  color: var(--text-color-secondary);
  font-size: 0.75rem;
  cursor: pointer;
}

.scope-toggle button.active {
  background: var(--surface-card, var(--surface-ground));
  color: var(--text-color);
}

.scope-toggle button:disabled {
  opacity: 0.4;
  cursor: default;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--text-color-secondary);
  cursor: pointer;
}

.close-btn:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.close-icon {
  width: 16px;
  height: 16px;
}

.graph-wrap {
  position: relative;
  flex: 0 0 58%;
  min-height: 300px;
  border-bottom: 1px solid var(--surface-border);
}

.graph-canvas {
  width: 100%;
  height: 100%;
}

.graph-empty,
.graph-hint {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  pointer-events: none;
}

.graph-empty {
  top: 50%;
  transform: translateY(-50%);
}

.graph-hint {
  bottom: 10px;
}

.graph-hint code {
  padding: 0 4px;
  border-radius: 3px;
  background: var(--surface-hover);
}

.link-lists {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px 16px;
}

section + section {
  margin-top: 12px;
}

h4 {
  margin: 0;
  padding: 6px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color-secondary);
}

.count {
  margin-left: 4px;
  font-weight: 400;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--text-color);
  font-size: 0.8125rem;
  text-align: left;
  cursor: pointer;
}

.link-row:hover {
  background: var(--surface-hover);
}

.link-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.6;
}

.empty,
.no-post {
  margin: 0;
  padding: 4px 10px;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.no-post {
  padding: 16px 12px;
}
</style>
