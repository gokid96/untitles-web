<template>
  <div class="post-editor">
    <!-- 저장 상태 표시 -->
    <div class="editor-header">
      <div class="save-status">
        <template v-if="isSaving">
          <i class="pi pi-spin pi-spinner"></i>
          <span class="status-text">저장 중...</span>
        </template>
        <template v-else>
          <i class="pi pi-check"></i>
          <span class="status-text">저장됨</span>
        </template>
      </div>
    </div>

    <!-- 에디터 영역 -->
    <div class="editor-content">
      <!-- 제목 -->
      <div class="title-field">
        <input type="text" v-model="formData.title" placeholder="제목" class="title-input" autofocus />
      </div>

      <!-- TipTap 에디터 -->
      <div class="content-field">
        <EditorContent :editor="editor" class="tiptap-editor" />
      </div>
    </div>

    <!-- 툴바 (하단 고정) -->
    <div class="editor-toolbar" v-if="editor">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"
        title="굵게 (Ctrl+B)">
        <strong>B</strong>
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"
        title="기울임 (Ctrl+I)">
        <em>I</em>
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }"
        title="취소선">
        <s>S</s>
      </button>

      <div class="toolbar-divider"></div>

      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ active: editor.isActive('heading', { level: 1 }) }" title="제목 1">
        H1
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ active: editor.isActive('heading', { level: 2 }) }" title="제목 2">
        H2
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ active: editor.isActive('heading', { level: 3 }) }" title="제목 3">
        H3
      </button>

      <div class="toolbar-divider"></div>

      <button @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ active: editor.isActive('bulletList') }" title="글머리 기호">
        <i class="pi pi-list"></i>
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ active: editor.isActive('orderedList') }" title="번호 매기기">
        <i class="pi pi-sort-numeric-up"></i>
      </button>

      <div class="toolbar-divider"></div>

      <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ active: editor.isActive('codeBlock') }"
        title="코드 블록">
        <i class="pi pi-code"></i>
      </button>
      <button @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ active: editor.isActive('blockquote') }" title="인용">
        <i class="pi pi-comment"></i>
      </button>
      <button @click="editor.chain().focus().setHorizontalRule().run()" title="구분선">
        <i class="pi pi-minus"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import Collaboration from '@tiptap/extension-collaboration'
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { debounce } from '@/utils/helpers'

const lowlight = createLowlight(common)

const props = defineProps({
  post: {
    type: Object,
    default: null,
  },
})


const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  title: '',
  content: '',
  folderId: null,
})

const isEditMode = ref(false)
const isSaving = ref(false)

const ydoc = new Y.Doc()
const wsProvider = ref(null)



// TipTap 에디터 초기화
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      history: false,  // Yjs가 히스토리 관리하므로 비활성화
    }),
    Placeholder.configure({
      placeholder: '내용을 입력하세요...',
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Collaboration.configure({
      document: ydoc,
    }),
  ],
  // content 제거 - Yjs가 관리함
})

// 자동 저장 함수 (디바운스)
const autoSave = debounce(() => {
  if (!props.post?.id) {
    console.log('[PostEditor] No post ID, skipping auto-save')
    return
  }

  console.log('[PostEditor] Auto-saving...')
  isSaving.value = true

  const data = {
    id: props.post.id,
    title: formData.value.title.trim() || '무제',
    content: formData.value.content,
    folderId: formData.value.folderId,
    status: 'DRAFT',
    visibility: 'PRIVATE',
    silent: true,
  }

  emit('save', data)

  setTimeout(() => {
    isSaving.value = false
  }, 500)
}, 1000)

function triggerAutoSave() {
  if (props.post?.id) {
    autoSave()
  }
}

// post가 변경될 때 폼 초기화
watch(
  () => props.post,
  (newPost) => {
    // 기존 연결 정리
    if (wsProvider.value) {
      wsProvider.value.destroy()
    }

    if (newPost && newPost.id) {
      // 새 WebSocket 연결
      wsProvider.value = new WebsocketProvider(
        import.meta.env.VITE_WS_URL,
        `post-${newPost.id}`,
        ydoc
      )

      isEditMode.value = true
      formData.value = {
        title: newPost.title || '무제',
        content: newPost.content || '',
        folderId: newPost.folderId || null,
      }
    } else if (newPost && newPost.folderId) {
      isEditMode.value = false
      formData.value = {
        title: '무제',
        content: '',
        folderId: newPost.folderId,
      }
    } else {
      isEditMode.value = false
      formData.value = {
        title: '무제',
        content: '',
        folderId: null,
      }
    }
  },
  { immediate: true }
)

// 제목 변경 시 자동 저장
watch(
  () => formData.value.title,
  () => {
    triggerAutoSave()
  }
)

// 에디터 정리
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
  if (wsProvider.value) {
    wsProvider.value.destroy()
  }
})
</script>

<style scoped>
.post-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--surface-card);
}

/* 헤더 - 저장 상태 */
.editor-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--surface-border);
  min-height: 50px;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.save-status i {
  font-size: 1rem;
}

.status-text {
  font-weight: 500;
}

/* 에디터 컨텐츠 영역 */
.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 4rem;
  max-width: 1900px;
  margin: 0 auto;
  width: 100%;
}

/* 제목 입력 */
.title-field {
  margin-bottom: 2rem;
}

.title-input {
  border: none;
  outline: none;
  font-size: 2.5rem;
  font-weight: 700;
  padding: 0.5rem 0;
  background: transparent;
  width: 100%;
  color: var(--text-color);
}

.title-input::placeholder {
  color: var(--text-color-secondary);
  opacity: 0.4;
}

/* TipTap 에디터 */
.content-field {
  min-height: 500px;
}

.tiptap-editor {
  font-size: 1.1rem;
  line-height: 1.75;
  color: var(--text-color);
}

/* TipTap 기본 스타일 */
:deep(.tiptap) {
  outline: none;
  min-height: 500px;
}

:deep(.tiptap h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
}

:deep(.tiptap h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
}

:deep(.tiptap h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem 0;
}

:deep(.tiptap ul),
:deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(.tiptap li) {
  margin: 0.25rem 0;
}

:deep(.tiptap blockquote) {
  border-left: 3px solid var(--primary-color);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-color-secondary);
  font-style: italic;
}

:deep(.tiptap hr) {
  border: none;
  border-top: 1px solid var(--surface-border);
  margin: 2rem 0;
}

:deep(.tiptap code) {
  background-color: var(--surface-ground);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

:deep(.tiptap pre) {
  background-color: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

:deep(.tiptap pre code) {
  background: none;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* 플레이스홀더 */
:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--text-color-secondary);
  opacity: 0.4;
  pointer-events: none;
  height: 0;
}

/* 툴바 */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 2rem;
  border-top: 1px solid var(--surface-border);
  background-color: var(--surface-card);
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.15s;
}

.editor-toolbar button:hover {
  background-color: var(--surface-hover);
  color: var(--text-color);
}

.editor-toolbar button.active {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}

.editor-toolbar button i {
  font-size: 1rem;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--surface-border);
  margin: 0 0.5rem;
}

/* 코드 하이라이팅 */
:deep(.hljs-comment),
:deep(.hljs-quote) {
  color: #6a737d;
}

:deep(.hljs-keyword),
:deep(.hljs-selector-tag) {
  color: #d73a49;
}

:deep(.hljs-string),
:deep(.hljs-attr) {
  color: #032f62;
}

:deep(.hljs-number),
:deep(.hljs-literal) {
  color: #005cc5;
}

:deep(.hljs-function),
:deep(.hljs-title) {
  color: #6f42c1;
}

/* 다크모드 코드 하이라이팅 */
.dark-mode :deep(.hljs-comment),
.dark-mode :deep(.hljs-quote) {
  color: #8b949e;
}

.dark-mode :deep(.hljs-keyword),
.dark-mode :deep(.hljs-selector-tag) {
  color: #ff7b72;
}

.dark-mode :deep(.hljs-string),
.dark-mode :deep(.hljs-attr) {
  color: #a5d6ff;
}

.dark-mode :deep(.hljs-number),
.dark-mode :deep(.hljs-literal) {
  color: #79c0ff;
}

.dark-mode :deep(.hljs-function),
.dark-mode :deep(.hljs-title) {
  color: #d2a8ff;
}
</style>
