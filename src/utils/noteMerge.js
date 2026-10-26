import { Editor } from '@tiptap/core'
import { diffIndices } from 'node-diff3'

/**
 * 같은 노트를 두 곳에서 고쳤을 때 자동으로 합치는 도구.
 *
 * 마지막으로 서버와 맞춘 내용(base), 내 내용(mine), 서버의 최신 내용(theirs)을
 * 최상위 블록(문단·제목·목록·표 등) 단위로 3-way 병합한다.
 * 서로 다른 블록을 고쳤으면 둘 다 반영하고, 같은 블록을 둘 다 고쳤을 때만 충돌로 본다.
 */

/**
 * 편집기와 같은 확장으로 HTML을 정규화하는 함수를 만든다.
 * 서버가 돌려준 HTML은 정화 과정에서 마크업이 조금 달라지므로, 비교 전에 같은 형태로 맞춘다.
 */
export function createNormalizer(buildExtensions) {
  let editor = null
  const normalize = (html) => {
    if (!editor) {
      editor = new Editor({
        element: document.createElement('div'),
        extensions: buildExtensions(),
        content: '',
      })
    }
    editor.commands.setContent(html || '', { emitUpdate: false })
    return editor.getHTML()
  }
  normalize.destroy = () => {
    editor?.destroy()
    editor = null
  }
  return normalize
}

// template은 <tr>처럼 단독으로는 버려지는 조각도 그대로 파싱한다
function parseFragment(html) {
  const template = document.createElement('template')
  template.innerHTML = html || ''
  return template.content
}

function childBlocks(parent) {
  return Array.from(parent.childNodes)
    .map((node) => (node.nodeType === 1 ? node.outerHTML : node.textContent))
    .filter((block) => block && block.trim() !== '')
}

/** 정규화된 HTML을 최상위 블록 문자열 배열로 나눈다 */
export function splitBlocks(html) {
  if (!html) return []
  return childBlocks(parseFragment(html))
}

// 안쪽 항목 단위로 다시 병합해 볼 수 있는 블록 (목록·인용·표)
const CONTAINER_TAGS = new Set(['UL', 'OL', 'LI', 'BLOCKQUOTE', 'TABLE', 'THEAD', 'TBODY', 'TR'])

const shellOf = (el) => el.cloneNode(false).outerHTML

/**
 * 같은 목록·표를 양쪽에서 고친 경우, 서로 다른 항목(행)을 고쳤으면 항목 단위로 합친다.
 * 예: 한 기기에서 체크리스트 1번을 체크하고, 다른 기기에서 3번 문구를 고친 경우
 */
function mergeElement(baseHtml, mineHtml, theirsHtml) {
  const [b, m, t] = [baseHtml, mineHtml, theirsHtml].map((html) => parseFragment(html).firstElementChild)
  if (!b || !m || !t || !CONTAINER_TAGS.has(b.tagName)) return null
  if (shellOf(b) !== shellOf(m) || shellOf(b) !== shellOf(t)) return null

  const merged = mergeBlocks(childBlocks(b), childBlocks(m), childBlocks(t))
  if (!merged) return null
  const out = b.cloneNode(false)
  out.innerHTML = merged.join('')
  return out.outerHTML
}

// base 대비 바뀐 구간 목록: [start, end) 범위의 base 블록을 content로 바꾼다
function hunksOf(base, other) {
  return diffIndices(base, other).map((h) => ({
    start: h.buffer1[0],
    end: h.buffer1[0] + h.buffer1[1],
    content: h.buffer2Content,
  }))
}

const sameHunk = (x, y) =>
  x.start === y.start && x.end === y.end && x.content.join('\u0000') === y.content.join('\u0000')

// 두 변경이 base의 같은 블록을 건드리는지. 둘 다 같은 위치에 새 블록을 넣은 경우는 'insert'
function overlap(x, y) {
  const xInsert = x.start === x.end
  const yInsert = y.start === y.end
  if (xInsert && yInsert) return x.start === y.start ? 'insert' : false
  if (xInsert) return x.start > y.start && x.start < y.end
  if (yInsert) return y.start > x.start && y.start < x.end
  return x.start < y.end && y.start < x.end
}

/**
 * 블록 배열 3-way 병합. 서로 다른 블록(붙어 있어도)을 고쳤으면 둘 다 반영하고,
 * 같은 위치에 둘 다 새 블록을 넣었으면 상대 것 다음에 내 것을 둔다.
 * @returns {string[] | null} 같은 블록을 둘 다 다르게 고쳤으면 null
 */
export function mergeBlocks(base, mine, theirs) {
  const mineHunks = hunksOf(base, mine)
  const theirHunks = hunksOf(base, theirs)
  const kept = []

  for (const t of theirHunks) {
    let skip = false
    for (const m of mineHunks) {
      if (sameHunk(m, t)) { skip = true; break }
      const o = overlap(m, t)
      if (o === 'insert') {
        m.content = [...t.content, ...m.content.filter((block) => !t.content.includes(block))]
        skip = true
        break
      }
      if (o) {
        // 같은 블록 하나를 양쪽이 고쳤으면 그 안의 항목 단위로 다시 시도
        const single = m.start === t.start && m.end === t.end && m.end - m.start === 1 &&
          m.content.length === 1 && t.content.length === 1
        const inner = single ? mergeElement(base[m.start], m.content[0], t.content[0]) : null
        if (!inner) return null
        m.content = [inner]
        skip = true
        break
      }
    }
    if (!skip) kept.push(t)
  }

  const all = [...mineHunks, ...kept].sort((x, y) => x.start - y.start || (x.end - x.start) - (y.end - y.start))
  const result = []
  let index = 0
  for (const h of all) {
    result.push(...base.slice(index, h.start), ...h.content)
    index = h.end
  }
  result.push(...base.slice(index))
  return result
}

/**
 * 본문 3-way 병합. 입력은 모두 정규화된 HTML.
 * @returns {{ ok: true, html: string } | { ok: false }}
 */
export function mergeContent(base, mine, theirs) {
  if (mine === theirs || theirs === base) return { ok: true, html: mine }
  if (mine === base) return { ok: true, html: theirs }

  const merged = mergeBlocks(splitBlocks(base), splitBlocks(mine), splitBlocks(theirs))
  return merged ? { ok: true, html: merged.join('') } : { ok: false }
}

/** 제목 3-way 병합 */
export function mergeTitle(base, mine, theirs) {
  if (mine === theirs || theirs === base) return { ok: true, value: mine }
  if (mine === base) return { ok: true, value: theirs }
  return { ok: false }
}
