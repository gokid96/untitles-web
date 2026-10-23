import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { VueRenderer } from '@tiptap/vue-3'
import NoteLinkList from './NoteLinkList.vue'

const MAX_ITEMS = 8

/**
 * 노트 링크: [[ 를 입력하면 노트를 골라 링크로 넣는다.
 * 저장 형식: <a class="note-link" data-note-id="12">제목</a>  (서버가 이 속성으로 링크를 추출)
 *
 * options
 * - getNotes(): [{ id, title }] 후보 목록 (Promise 가능)
 * - getCurrentPostId(): 지금 편집 중인 글 ID (후보에서 제외)
 * - onOpen(postId): 링크를 눌렀을 때
 */
export const NoteLink = Node.create({
  name: 'noteLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return {
      getNotes: () => [],
      getCurrentPostId: () => null,
      onOpen: () => {},
    }
  },

  addAttributes() {
    return {
      postId: {
        default: null,
        parseHTML: (el) => {
          const id = Number(el.getAttribute('data-note-id'))
          return Number.isFinite(id) && id > 0 ? id : null
        },
        renderHTML: (attrs) => ({ 'data-note-id': attrs.postId }),
      },
      label: {
        default: '',
        parseHTML: (el) => el.textContent || '',
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-note-id]', priority: 60 }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['a', mergeAttributes({ class: 'note-link' }, HTMLAttributes), node.attrs.label || '무제']
  },

  renderText({ node }) {
    return `[[${node.attrs.label}]]`
  },

  addProseMirrorPlugins() {
    const options = this.options
    return [
      // 링크 클릭 시 해당 노트 열기
      new Plugin({
        key: new PluginKey('noteLinkClick'),
        props: {
          handleClickOn(view, pos, node) {
            if (node.type.name !== 'noteLink' || !node.attrs.postId) return false
            options.onOpen(node.attrs.postId)
            return true
          },
        },
      }),
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey('noteLinkSuggestion'),
        char: '[[',
        allowSpaces: true,
        startOfLine: false,
        items: async ({ query }) => {
          const notes = (await options.getNotes()) || []
          const currentId = options.getCurrentPostId()
          const q = query.trim().toLowerCase()
          return notes
            .filter((n) => n.id !== currentId)
            .filter((n) => !q || (n.title || '').toLowerCase().includes(q))
            .slice(0, MAX_ITEMS)
        },
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'noteLink', attrs: { postId: props.id, label: props.title } },
              { type: 'text', text: ' ' },
            ])
            .run()
        },
        render: () => {
          let renderer
          let popup

          const place = (clientRect) => {
            const rect = clientRect?.()
            if (!rect || !popup) return
            const top = Math.min(rect.bottom + 6, window.innerHeight - 290)
            const left = Math.min(rect.left, window.innerWidth - 330)
            popup.style.top = `${Math.max(8, top)}px`
            popup.style.left = `${Math.max(8, left)}px`
          }

          return {
            onStart: (props) => {
              renderer = new VueRenderer(NoteLinkList, { props, editor: props.editor })
              popup = document.createElement('div')
              popup.style.position = 'fixed'
              popup.style.zIndex = '1000'
              popup.appendChild(renderer.element)
              document.body.appendChild(popup)
              place(props.clientRect)
            },
            onUpdate: (props) => {
              renderer?.updateProps(props)
              place(props.clientRect)
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.remove()
                popup = null
                return true
              }
              return renderer?.ref?.onKeyDown(props) ?? false
            },
            onExit: () => {
              popup?.remove()
              popup = null
              renderer?.destroy()
              renderer = null
            },
          }
        },
      }),
    ]
  },
})
