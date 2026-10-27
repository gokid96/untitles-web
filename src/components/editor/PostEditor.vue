<template>
  <div class="post-editor">
    <!-- 상단 바 -->
    <div class="editor-topbar">
      <div class="topbar-left">
        <span class="breadcrumb" v-if="folderName">
          <Folder class="breadcrumb-icon" />
          <span>{{ folderName }}</span>
        </span>
      </div>
      <div class="topbar-right">
        <div v-if="collabPeers.length" class="collab-peers" :title="collabPeers.map((p) => p.name).join(', ') + ' 편집 중'">
          <UserAvatar v-for="peer in collabPeers.slice(0, 4)" :key="peer.clientId" class="peer-avatar"
            :user-id="peer.userId" :name="peer.name" :image="peer.avatar" :size="24" shape="circle" :title="peer.name" />
          <span v-if="collabPeers.length > 4" class="peer-more">+{{ collabPeers.length - 4 }}</span>
        </div>
        <span v-if="isReadOnly" class="readonly-badge">읽기 전용</span>
        <div v-if="authStore.isAuthenticated" class="save-indicator"
          :class="{ saving: showSaving || isConnecting, unsaved: (hasUnsavedChanges && !showSaving) || collabOffline }">
          <Loader2 v-if="showSaving || isConnecting" class="indicator-icon spinning" />
          <Circle v-else-if="hasUnsavedChanges" class="indicator-icon unsaved-dot" />
          <Check v-else class="indicator-icon" />
          <span>{{ saveIndicatorText }}</span>
        </div>
      </div>
    </div>

    <!-- 에디터 본문 -->
    <div class="editor-body">
      <div class="editor-container">
        <input type="text" v-model="formData.title" placeholder="제목 없음" class="title-input"
          :readonly="isReadOnly || isConnecting" @keydown.enter.prevent="focusEditor" />
        <div class="content-area" :class="{ connecting: isConnecting }">
          <EditorContent :editor="editor" class="tiptap-wrapper" />
        </div>
      </div>
    </div>

    <!-- 하단 툴바 -->
    <div class="editor-toolbar" v-if="editor">
      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"
          title="굵게"><strong>B</strong></button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"
          title="기울임"><em>I</em></button>
        <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }"
          title="밑줄"><u>U</u></button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }"
          title="취소선"><s>S</s></button>
        <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ active: editor.isActive('highlight') }"
          title="형광펜"><Highlighter class="toolbar-icon" /></button>
        <button @click="openLinkPopover" :class="{ active: editor.isActive('link') }"
          title="링크"><Link2 class="toolbar-icon" /></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ active: editor.isActive('heading', { level: 1 }) }" title="제목 1">H1</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ active: editor.isActive('heading', { level: 2 }) }" title="제목 2">H2</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ active: editor.isActive('heading', { level: 3 }) }" title="제목 3">H3</button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button @click="editor.chain().focus().setTextAlign('left').run()"
          :class="{ active: editor.isActive({ textAlign: 'left' }) }" title="왼쪽 정렬"><AlignLeft class="toolbar-icon" /></button>
        <button @click="editor.chain().focus().setTextAlign('center').run()"
          :class="{ active: editor.isActive({ textAlign: 'center' }) }" title="가운데 정렬"><AlignCenter class="toolbar-icon" /></button>
        <button @click="editor.chain().focus().setTextAlign('right').run()"
          :class="{ active: editor.isActive({ textAlign: 'right' }) }" title="오른쪽 정렬"><AlignRight class="toolbar-icon" /></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ active: editor.isActive('bulletList') }" title="불릿 리스트"><List class="toolbar-icon" /></button>
        <button @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ active: editor.isActive('orderedList') }" title="번호 리스트"><ListOrdered class="toolbar-icon" /></button>
        <button @click="editor.chain().focus().toggleTaskList().run()"
          :class="{ active: editor.isActive('taskList') }" title="체크리스트"><ListTodo class="toolbar-icon" /></button>
        <button @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ active: editor.isActive('blockquote') }" title="인용"><Quote class="toolbar-icon" /></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ active: editor.isActive('codeBlock') }" title="코드 블록"><Code class="toolbar-icon" /></button>
        <button @click="editor.chain().focus().setHorizontalRule().run()" title="구분선"><Minus class="toolbar-icon" /></button>
        <button @click="insertTable" title="테이블 삽입"><Table class="toolbar-icon" /></button>
        <button @click="triggerImageUpload" title="이미지 삽입"><ImageIcon class="toolbar-icon" /></button>
        <button @click="exportMarkdown" title="마크다운 내보내기"><Download class="toolbar-icon" /></button>
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleImageUpload"
        />
      </div>
      <div class="toolbar-spacer"></div>
      <span class="char-count">{{ charCount.toLocaleString() }}자</span>
    </div>

    <!-- 저장되지 않은 변경사항 확인 모달 -->
    <UnsavedChangesModal v-model:visible="showUnsavedModal" @save="handleSaveAndLeave" @discard="handleDiscardAndLeave"
      @cancel="handleCancelLeave" />

    <!-- 충돌 선택 모달 -->
    <ConflictModal
      v-model:visible="showConflictModal"
      @keep-mine="handleKeepMine"
      @load-latest="handleLoadLatest"
      @keep-both="handleKeepBoth"
    />

    <!-- 링크 팝오버 -->
    <LinkPopover
      :visible="showLinkPopover"
      :initial-url="linkPopoverUrl"
      :position="linkPopoverPosition"
      @submit="handleLinkSubmit"
      @remove="handleLinkRemove"
      @close="closeLinkPopover"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Editor, EditorContent } from '@tiptap/vue-3'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Table as TiptapTable } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import { common, createLowlight } from 'lowlight'
import TurndownService from 'turndown'
import { 
  Folder, Loader2, Circle, Check, Highlighter, Link2, 
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered, 
  ListTodo, Quote, Code, Minus, Table, Image as ImageIcon, Download 
} from 'lucide-vue-next'
import { debounce } from '@/utils/helpers'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useToast } from 'primevue/usetoast'
import { imageApi } from '@/api/imageApi'
import UnsavedChangesModal from '@/components/common/UnsavedChangesModal.vue'
import ConflictModal from '@/components/common/ConflictModal.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import LinkPopover from '@/components/editor/LinkPopover.vue'
import { NoteLink } from '@/components/editor/noteLinkExtension'
import { useGraphStore } from '@/stores/graphStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { postApi } from '@/api/postApi'
import { createNormalizer, mergeContent, mergeTitle } from '@/utils/noteMerge'
import { COLLAB_URL, createCollabSession, caretColorFor } from '@/composables/collabSession'
import { refreshAccessToken } from '@/api/axios'

const lowlight = createLowlight(common)
const folderStore = useFolderStore()
const postStore = usePostStore()
const authStore = useAuthStore()
const uiStore = useUiStore()
const graphStore = useGraphStore()
const toast = useToast()
const workspaceStore = useWorkspaceStore()

const GUEST_DRAFT_KEY = 'untitles_guest_draft'
const GUEST_MODAL_THRESHOLD = 50 // 50자 이상 입력하면 모달 표시

const props = defineProps({ post: { type: Object, default: null } })

const formData = ref({ title: '', content: '', folderId: null })
const originalData = ref({ title: '', content: '' })
const currentVersion = ref(null)
const isSaving = ref(false)
const showUnsavedModal = ref(false)
const showConflictModal = ref(false)
const pendingNavigation = ref(null)
const isInitializing = ref(false)

// 저장 직렬화를 위한 상태
const isSavingInProgress = ref(false)
const hasPendingSave = ref(false)

// 충돌 시 최신 데이터 임시 저장
const conflictLatestData = ref(null)
// 충돌 해결(사본 만들기 등) 중에는 자동 저장·원격 확인을 멈춘다
const isResolvingConflict = ref(false)

// 링크 팝오버 상태
const showLinkPopover = ref(false)
const linkPopoverUrl = ref('')
const linkPopoverPosition = ref({ top: 0, left: 0 })

// 이미지 업로드
const imageInput = ref(null)

// 변경사항 체크
const hasUnsavedChanges = computed(() => {
  if (!props.post?.id) return false
  // 실시간 편집: 편집 서버에 아직 전달되지 않은 입력이 있으면
  if (collabMode.value) return (collab.value?.unsynced.value || 0) > 0
  return formData.value.title !== originalData.value.title ||
    formData.value.content !== originalData.value.content
})

const collabOffline = computed(() => collabMode.value && collab.value?.status.value !== 'connected')
const showSaving = computed(() =>
  isSaving.value || (collabMode.value && !collabOffline.value && hasUnsavedChanges.value))

// 저장 상태 표시
const saveIndicatorText = computed(() => {
  if (isConnecting.value) return '불러오는 중'
  if (collabOffline.value) return hasUnsavedChanges.value ? '오프라인 · 연결되면 저장' : '오프라인'
  if (showSaving.value) return '저장 중'
  if (hasUnsavedChanges.value) return '저장되지 않음'
  return '저장됨'
})

const folderName = computed(() => {
  if (!formData.value.folderId) return ''

  // 재귀적으로 폴더 찾기
  function findFolder(folderList, id) {
    for (const folder of folderList) {
      if (folder.folderId === id) return folder
      if (folder.children?.length > 0) {
        const found = findFolder(folder.children, id)
        if (found) return found
      }
    }
    return null
  }

  const folder = findFolder(folderStore.folders, formData.value.folderId)
  return folder?.name || ''
})

const charCount = computed(() => {
  if (!editor.value) return 0
  // 공백 제외 글자 수
  return editor.value.getText().replace(/\s/g, '').length
})

// 편집기 확장 목록 (자동 병합용 정규화에도 같은 구성을 쓴다)
function buildEditorExtensions(session = null) {
  const extensions = [
    // 링크·밑줄은 아래에서 따로 설정한다. 실시간 편집 중에는 실행 취소를 Collaboration이 맡는다
    StarterKit.configure({ codeBlock: false, link: false, underline: false, ...(session ? { undoRedo: false } : {}) }),
    Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
    CodeBlockLowlight.configure({ lowlight }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' }
    }),
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    TiptapTable.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Image.configure({ inline: false, allowBase64: false }),
    NoteLink.configure({
      // [[ 입력 시 후보: 로그인한 경우 현재 워크스페이스의 노트
      getNotes: async () => {
        if (!authStore.isAuthenticated) return []
        await graphStore.load()
        return graphStore.nodes
      },
      getCurrentPostId: () => props.post?.id ?? null,
      onOpen: (postId) => uiStore.requestOpenPost(postId),
    }),
  ]
  if (session) {
    const user = authStore.currentUser
    extensions.push(
      Collaboration.configure({ document: session.ydoc, field: 'default' }),
      CollaborationCaret.configure({
        provider: session.provider,
        user: {
          userId: authStore.userId,
          name: user?.nickname || '익명',
          color: caretColorFor(authStore.userId),
          avatar: user?.profileImage || '',
        },
      }),
    )
  }
  return extensions
}

// 편집기는 노트마다 새로 만든다 (실시간 편집은 노트별 Y 문서에 묶여 있으므로)
const editor = shallowRef(null)

function mountEditor(session = null) {
  const previous = editor.value
  editor.value = new Editor({
    extensions: buildEditorExtensions(session),
    content: '',
    editable: !session, // 실시간 편집은 첫 동기화가 끝난 뒤에 편집을 연다
    onUpdate: ({ editor: ed }) => {
      formData.value.content = ed.getHTML()
      if (!isInitializing.value) {
        triggerAutoSave()
      }
    },
  })
  editor.value.isCollab = !!session
  previous?.destroy()
}
mountEditor()

function focusEditor() { editor.value?.commands.focus() }

// 링크 팝오버 열기
function openLinkPopover() {
  const previousUrl = editor.value?.getAttributes('link').href || ''
  linkPopoverUrl.value = previousUrl

  // 툴바 버튼 위치 기준으로 팝오버 위치 계산
  const toolbar = document.querySelector('.editor-toolbar')
  if (toolbar) {
    const rect = toolbar.getBoundingClientRect()
    linkPopoverPosition.value = {
      top: rect.top - 100,
      left: rect.left + 100
    }
  }

  showLinkPopover.value = true
}

// 링크 적용
function handleLinkSubmit(url) {
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// 링크 삭제
function handleLinkRemove() {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
}

// 링크 팝오버 닫기
function closeLinkPopover() {
  showLinkPopover.value = false
}

// 테이블 삽입
function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

// 이미지 업로드 트리거
function triggerImageUpload() {
  imageInput.value?.click()
}

// 이미지 업로드 처리
async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // 파일 검증
  if (!file.type.startsWith('image/')) {
    toast.add({ severity: 'error', summary: '오류', detail: '이미지 파일만 업로드 가능합니다.', life: 3000 })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.add({ severity: 'error', summary: '오류', detail: '파일 크기는 5MB 이하여야 합니다.', life: 3000 })
    return
  }

  try {
    const response = await imageApi.uploadPostImage(file)
    const url = response.data.url

    // 에디터에 이미지 삽입
    editor.value?.chain().focus().setImage({ src: url }).run()

    toast.add({ severity: 'success', summary: '완료', detail: '이미지가 업로드되었습니다.', life: 2000 })
  } catch (error) {
    console.error('Image upload failed:', error)
    toast.add({
      severity: 'error',
      summary: '업로드 실패',
      detail: error.response?.data?.message || '이미지 업로드에 실패했습니다.',
      life: 4000,
    })
  } finally {
    event.target.value = '' // input 초기화
  }
}

// 마크다운 내보내기
function exportMarkdown() {
  if (!editor.value) return

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  })

  // 체크리스트 변환 규칙 추가
  turndownService.addRule('taskList', {
    filter: (node) => {
      return node.nodeName === 'LI' && node.parentNode?.getAttribute('data-type') === 'taskList'
    },
    replacement: (content, node) => {
      const checked = node.getAttribute('data-checked') === 'true'
      return `- [${checked ? 'x' : ' '}] ${content.trim()}\n`
    }
  })

  // 형광펜 변환 규칙
  turndownService.addRule('highlight', {
    filter: 'mark',
    replacement: (content) => `==${content}==`
  })

  const html = editor.value.getHTML()
  const markdown = turndownService.turndown(html)

  // 제목 추가
  const title = formData.value.title || '무제'
  const fullContent = `# ${title}\n\n${markdown}`

  // 파일 다운로드
  const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  toast.add({
    severity: 'success',
    summary: '내보내기 완료',
    detail: '마크다운 파일이 다운로드되었습니다.',
    life: 2000,
  })
}

// 실제 저장 수행
async function performSave(forceVersion = null) {
  if (!props.post?.id || isInitializing.value) return

  const versionToUse = forceVersion !== null ? forceVersion : currentVersion.value

  const saveData = {
    title: formData.value.title.trim() || '무제',
    content: formData.value.content,
    version: versionToUse
  }

  // 저장 요청을 보낸 시점의 내용 (응답을 기다리는 동안 더 입력한 내용은 다음 저장에서 보낸다)
  const sent = { title: formData.value.title, content: formData.value.content }
  const postId = props.post.id

  try {
    const result = await postStore.updatePost(postId, saveData)
    if (props.post?.id !== postId) return  // 그 사이 다른 노트로 이동

    if (result.conflict) {
      // 다른 곳에서 먼저 저장함 - 서로 다른 부분이면 자동으로 합치고, 같은 부분이면 선택 창
      absorbRemoteChange(result.post)
    } else {
      // 저장 성공
      currentVersion.value = result.post.version
      originalData.value = sent
      clearUnsavedBackup(postId)
    }
  } catch (error) {
    // 저장 실패 시 작성 내용을 기기에 보관해 두고, 다음에 이 노트를 열 때 복구한다
    saveUnsavedBackup(props.post.id, saveData.title, saveData.content)
    toast.add({
      severity: 'error',
      summary: '저장 실패',
      detail: (error.response?.data?.message || error.message || '서버 오류가 발생했습니다.')
        + ' 작성한 내용은 이 기기에 임시 보관됩니다.',
      life: 4000,
    })
  }
}

// 저장 실패한 내용을 기기에 임시 보관 (노트별)
const UNSAVED_BACKUP_PREFIX = 'untitles:unsaved:'

function saveUnsavedBackup(postId, title, content) {
  try {
    localStorage.setItem(UNSAVED_BACKUP_PREFIX + postId, JSON.stringify({ title, content, savedAt: Date.now() }))
  } catch {
    // 저장 공간 부족 등은 무시
  }
}

function clearUnsavedBackup(postId) {
  try {
    localStorage.removeItem(UNSAVED_BACKUP_PREFIX + postId)
  } catch {
    // 무시
  }
}

// 서버 내용보다 나중에 보관된 미저장 내용이 있으면 편집기에 되살린다
function restoreUnsavedBackup() {
  const post = props.post
  if (!post?.id || !editor.value) return
  let backup = null
  try {
    backup = JSON.parse(localStorage.getItem(UNSAVED_BACKUP_PREFIX + post.id) || 'null')
  } catch {
    backup = null
  }
  if (!backup) return

  const serverTime = post.updatedAt ? new Date(post.updatedAt).getTime() : 0
  if (backup.savedAt <= serverTime || backup.content === (post.content || '')) {
    clearUnsavedBackup(post.id)
    return
  }

  formData.value.title = backup.title ?? formData.value.title
  editor.value.commands.setContent(backup.content || '')
  formData.value.content = editor.value.getHTML()
  toast.add({
    severity: 'info',
    summary: '저장되지 않은 내용 복구',
    detail: '이전에 저장하지 못한 내용을 불러왔습니다. 자동으로 다시 저장합니다.',
    life: 4000,
  })
  triggerAutoSave()
}

// ===== 다른 기기·탭의 수정 반영 =====
const normalizeHtml = createNormalizer(buildEditorExtensions)

// 내용을 바꿔도 커서가 멀리 튀지 않게 이전 위치 근처로 되돌린다
function setContentKeepingSelection(html) {
  const ed = editor.value
  const { from, to } = ed.state.selection
  ed.commands.setContent(html, { emitUpdate: false })
  const max = ed.state.doc.content.size
  try {
    ed.commands.setTextSelection({ from: Math.min(from, max), to: Math.min(to, max) })
  } catch {
    // 위치를 못 찾으면 그대로 둔다
  }
  formData.value.content = ed.getHTML()
}

/**
 * 서버에 더 새로운 버전이 있을 때 호출.
 * 마지막으로 맞춘 내용(originalData)을 기준으로 내 수정과 상대 수정을 블록 단위로 합친다.
 * 같은 부분을 둘 다 고쳤으면 선택 창을 띄운다.
 * @returns {boolean} 자동으로 반영했으면 true
 */
function absorbRemoteChange(latest) {
  if (!latest || !editor.value) return false

  const base = originalData.value
  const mineContent = formData.value.content
  const theirsContent = normalizeHtml(latest.content || '')
  const content = mergeContent(normalizeHtml(base.content), normalizeHtml(mineContent), theirsContent)
  const title = mergeTitle(base.title, formData.value.title, latest.title || '')

  if (!content.ok || !title.ok) {
    conflictLatestData.value = latest
    showConflictModal.value = true
    return false
  }

  const hadLocalChanges = hasUnsavedChanges.value
  isInitializing.value = true
  if (content.html !== normalizeHtml(mineContent)) {
    setContentKeepingSelection(content.html)
  }
  formData.value.title = title.value
  originalData.value = { title: latest.title || '', content: theirsContent }
  currentVersion.value = latest.version

  setTimeout(() => {
    isInitializing.value = false
    // 합친 결과에 내 수정이 들어 있으면 다시 저장. 표기만 다른 경우는 저장하지 않는다
    // (안 그러면 두 기기가 서로의 저장을 계속 다시 저장할 수 있다)
    if (normalizeHtml(formData.value.content) === originalData.value.content) {
      originalData.value = { ...originalData.value, content: formData.value.content }
    }
    if (hasUnsavedChanges.value) triggerAutoSave()
  }, 100)

  if (hadLocalChanges) {
    toast.add({
      severity: 'info',
      summary: '자동으로 합쳤어요',
      detail: '다른 곳에서 수정한 내용과 내 수정 내용을 함께 반영했습니다.',
      life: 3000,
    })
  }
  return true
}

/**
 * 탭·앱으로 돌아왔을 때나 주기적으로 서버 버전을 확인해, 저장 전에 미리 최신 내용을 반영한다.
 * (오래 열어 둔 화면에서 수정하다가 충돌하는 경우를 줄인다)
 */
let checkingRemote = false
async function checkForRemoteChanges() {
  const postId = props.post?.id
  const workspaceId = workspaceStore.currentWorkspaceId
  if (!postId || !workspaceId || !authStore.isAuthenticated || checkingRemote) return
  if (collabMode.value || isInitializing.value || showConflictModal.value || isSavingInProgress.value || isResolvingConflict.value) return
  if (document.visibilityState !== 'visible') return

  checkingRemote = true
  try {
    const { data: latest } = await postApi.getPost(workspaceId, postId)
    // 확인하는 동안 다른 노트로 이동했거나 저장이 시작됐으면 무시 (저장 쪽에서 처리)
    if (props.post?.id !== postId || isSavingInProgress.value || showConflictModal.value) return
    if (latest.version == null || currentVersion.value == null || latest.version <= currentVersion.value) return
    absorbRemoteChange(latest)
  } catch {
    // 네트워크 오류 등은 다음 확인 때 다시 시도
  } finally {
    checkingRemote = false
  }
}

const REMOTE_CHECK_INTERVAL = 30_000
let remoteCheckTimer = null

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') checkForRemoteChanges()
}

// 충돌 처리: 둘 다 보존 - 내 내용은 사본 노트로 저장하고, 이 노트는 최신 내용으로
async function handleKeepBoth() {
  const latest = conflictLatestData.value
  const workspaceId = workspaceStore.currentWorkspaceId
  if (!latest || !workspaceId) return

  isResolvingConflict.value = true
  const baseTitle = formData.value.title.trim() || '무제'
  const copyTitle = `${baseTitle} (내 수정본)`.slice(0, 200)
  try {
    const { data: copy } = await postApi.createPost(workspaceId, {
      title: copyTitle,
      content: formData.value.content,
      folderId: formData.value.folderId,
    })
    folderStore.addPostLocally({
      id: copy.id,
      title: copy.title,
      folderId: copy.folderId,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    })
    workspaceStore.updatePostCount(1)
    handleLoadLatest()
    toast.add({
      severity: 'success',
      summary: '둘 다 보존했어요',
      detail: `내 수정 내용은 '${copyTitle}' 노트로 저장했습니다.`,
      life: 4000,
    })
  } catch (error) {
    // 사본을 못 만들면 아무것도 잃지 않도록 선택 창을 다시 띄운다
    conflictLatestData.value = latest
    showConflictModal.value = true
    toast.add({
      severity: 'error',
      summary: '사본 저장 실패',
      detail: error.response?.data?.message || '사본 노트를 만들지 못했습니다. 다른 방법을 선택해주세요.',
      life: 4000,
    })
  } finally {
    isResolvingConflict.value = false
  }
}

// 충돌 처리: 내 변경사항 유지 (락 획득)
async function handleKeepMine() {
  const latest = conflictLatestData.value
  if (!latest) return
  conflictLatestData.value = null

  // 최신 version을 기준으로 내 내용을 덮어써 저장 (그 사이 또 바뀌었으면 다시 병합·선택)
  isResolvingConflict.value = true
  isSaving.value = true
  try {
    await performSave(latest.version)
    if (!showConflictModal.value && !hasUnsavedChanges.value) {
      toast.add({
        severity: 'success',
        summary: '저장 완료',
        detail: '내 변경사항이 저장되었습니다.',
        life: 2000,
      })
    }
  } finally {
    isSaving.value = false
    isResolvingConflict.value = false
  }
}

// 충돌 처리: 최신 버전 불러오기 (락 없이 보기만)
function handleLoadLatest() {
  if (!conflictLatestData.value) return

  // 에디터 내용을 서버 데이터로 교체하고, 이후 수정은 이 버전을 기준으로 저장
  isInitializing.value = true
  currentVersion.value = conflictLatestData.value.version

  formData.value = {
    title: conflictLatestData.value.title || '',
    content: conflictLatestData.value.content || '',
    folderId: conflictLatestData.value.folderId || null
  }
  originalData.value = {
    title: conflictLatestData.value.title || '',
    content: conflictLatestData.value.content || ''
  }
  if (editor.value) {
    loadIntoEditor(conflictLatestData.value.content || '')
  }

  conflictLatestData.value = null

  setTimeout(() => {
    isInitializing.value = false
  }, 100)
}

// 저장 직렬화: 저장 중이면 대기, 완료 후 재시도
const autoSave = debounce(async () => {
  if (!props.post?.id || isInitializing.value) return

  // 충돌 모달이 열려있거나 충돌을 정리하는 중이면 저장하지 않음
  if (showConflictModal.value || isResolvingConflict.value) return

  // 이미 저장 중이면 대기 예약
  if (isSavingInProgress.value) {
    hasPendingSave.value = true
    return
  }

  isSavingInProgress.value = true
  isSaving.value = true

  try {
    await performSave()
  } finally {
    isSavingInProgress.value = false
    isSaving.value = false

    // 대기 중인 저장이 있으면 재실행
    if (hasPendingSave.value) {
      hasPendingSave.value = false
      autoSave()
    }
  }
}, 1000)

function triggerAutoSave() {
  if (!authStore.isAuthenticated) {
    saveGuestDraft()
    // 50자 이상일 때만 모달 표시
    if (charCount.value >= GUEST_MODAL_THRESHOLD) {
      uiStore.openAuthModal('register')
    }
    return
  }
  if (collabMode.value) return // 실시간 편집 중에는 편집 서버가 저장한다
  if (props.post?.id && !isInitializing.value) autoSave()
}

function saveGuestDraft() {
  try {
    localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify({
      title: formData.value.title,
      content: formData.value.content,
      savedAt: new Date().toISOString()
    }))
  } catch (e) {
    console.warn('Guest draft save failed:', e)
  }
}

// 브라우저 새로고침/닫기 방지
function handleBeforeUnload(e) {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}

// 라우트 변경 방지
onBeforeRouteLeave((to, from, next) => {
  // 실시간 편집은 연결을 닫기 전에 남은 입력을 전달하므로 묻지 않는다
  if (hasUnsavedChanges.value && !collabMode.value) {
    pendingNavigation.value = next
    showUnsavedModal.value = true
    return false
  }
  next()
})

async function handleSaveAndLeave() {
  await performSave()
  showUnsavedModal.value = false
  if (pendingNavigation.value) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

function handleDiscardAndLeave() {
  showUnsavedModal.value = false
  formData.value = { ...originalData.value, folderId: formData.value.folderId }
  if (pendingNavigation.value) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

function handleCancelLeave() {
  showUnsavedModal.value = false
  pendingNavigation.value = null
}

// post.id 변경 시 (다른 게시글로 전환)
/**
 * 에디터에 내용을 넣고, 에디터가 정규화한 HTML을 "저장된 상태" 기준으로 삼는다.
 * 서버가 돌려준 HTML(정화 과정에서 체크리스트·표 마크업이 조금 달라짐)을 그대로 기준으로 쓰면
 * 노트를 열기만 해도 '저장되지 않음'으로 표시되던 문제 방지
 */
function loadIntoEditor(content) {
  editor.value.commands.setContent(content)
  const normalized = editor.value.getHTML()
  formData.value.content = normalized
  originalData.value = { ...originalData.value, content: normalized }
}

// ===== 실시간 편집 =====
const collab = shallowRef(null) // 지금 노트의 실시간 편집 연결
const collabMode = ref(false) // 실시간 편집으로 동작 중인지 (아니면 일반 저장 방식)
const isConnecting = ref(false)
const COLLAB_SYNC_TIMEOUT = 5000
let openSeq = 0

const collabPeers = computed(() => collab.value?.peers.value || [])
const isReadOnly = computed(() => collabMode.value && !!collab.value?.readOnly.value)

function teardownCollab() {
  collab.value?.destroy()
  collab.value = null
  collabMode.value = false
}

async function refreshTokenForCollab() {
  try {
    await refreshAccessToken()
    return true
  } catch {
    return false
  }
}

async function openPost(post) {
  const seq = ++openSeq
  autoSave.cancel()
  hasPendingSave.value = false
  showConflictModal.value = false
  conflictLatestData.value = null
  teardownCollab()
  isInitializing.value = true

  formData.value = {
    title: post?.title || '',
    content: post?.content || '',
    folderId: post?.folderId || null
  }
  originalData.value = { title: post?.title || '', content: post?.content || '' }
  currentVersion.value = post?.version ?? null

  const workspaceId = workspaceStore.currentWorkspaceId
  if (post?.id && COLLAB_URL && authStore.isAuthenticated && workspaceId) {
    const session = createCollabSession({
      workspaceId,
      postId: post.id,
      getToken: () => localStorage.getItem('accessToken'),
      refreshToken: refreshTokenForCollab,
      onRemoteTitle: (title) => {
        if (collab.value === session) formData.value.title = title
        if (props.post?.id === post.id) folderStore.updatePostLocally(post.id, { title: title.trim() || '무제' })
      },
    })
    collab.value = session
    mountEditor(session)
    isConnecting.value = true
    const ok = await session.waitForSync(COLLAB_SYNC_TIMEOUT)
    if (seq !== openSeq) return // 그사이 다른 노트를 열었음
    isConnecting.value = false

    if (ok) {
      collabMode.value = true
      formData.value.title = session.title || post.title || ''
      formData.value.content = editor.value.getHTML()
      originalData.value = { title: formData.value.title, content: formData.value.content }
      editor.value.setEditable(!session.readOnly.value)
      setTimeout(() => {
        if (seq === openSeq) isInitializing.value = false
      }, 0)
      return
    }
    // 실시간 편집 서버에 연결되지 않음 → 일반 저장 방식(자동 병합)으로 편집
    teardownCollab()
  }

  if (!editor.value || editor.value.isCollab) mountEditor()
  if (post) {
    loadIntoEditor(post.content || '')
  } else {
    editor.value.commands.setContent('')
  }

  setTimeout(() => {
    if (seq !== openSeq) return
    isInitializing.value = false
    restoreUnsavedBackup()
  }, 100)
}

watch(
  () => props.post?.id,
  (newId, oldId) => {
    if (newId !== oldId) openPost(props.post)
  },
  { immediate: true }
)

// title 변경 시 자동저장 (실시간 편집 중에는 Y 문서의 제목을 고친다)
watch(
  () => formData.value.title,
  (newTitle, oldTitle) => {
    if (isInitializing.value || oldTitle === undefined) return
    const session = collab.value
    if (collabMode.value && session) {
      session.setTitle(newTitle)
      if (props.post?.id) folderStore.updatePostLocally(props.post.id, { title: newTitle.trim() || '무제' })
      return
    }
    triggerAutoSave()
  }
)

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', checkForRemoteChanges)
  remoteCheckTimer = setInterval(checkForRemoteChanges, REMOTE_CHECK_INTERVAL)
})

onBeforeUnmount(() => {
  autoSave.cancel()
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', checkForRemoteChanges)
  clearInterval(remoteCheckTimer)
  normalizeHtml.destroy()
  teardownCollab()
  editor.value?.destroy()
})
</script>

<style scoped>
.post-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-ground);
}

.editor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  min-height: 48px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
}

.breadcrumb-icon {
  width: 14px;
  height: 14px;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.collab-peers {
  display: flex;
  align-items: center;
  margin-right: 0.75rem;
}

.peer-avatar {
  box-shadow: 0 0 0 2px var(--surface-ground);
  margin-left: -6px;
}

.peer-avatar:first-child {
  margin-left: 0;
}

.peer-more {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.readonly-badge {
  margin-right: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  border: 1px solid var(--surface-border);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
}

.content-area.connecting {
  opacity: 0.4;
  pointer-events: none;
}

/* 편집기가 줄 끝 커서 위치를 잡으려고 넣는 보이지 않는 이미지: 노트 사진 스타일이 적용되면 줄이 들썩인다 */
:deep(.ProseMirror img.ProseMirror-separator) {
  display: inline !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

/* 다른 사람의 커서 (CollaborationCaret) */
:deep(.collaboration-carets__caret) {
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

:deep(.collaboration-carets__label) {
  border-radius: 3px 3px 3px 0;
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 0.0625rem 0.3rem;
  position: absolute;
  top: -1.3em;
  user-select: none;
  white-space: nowrap;
}

.save-indicator {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
  transition: all 0.2s;
}

.save-indicator.saving {
  color: var(--primary-color);
}

.save-indicator.unsaved {
  color: #f59e0b;
}

.indicator-icon {
  width: 14px;
  height: 14px;
}

.indicator-icon.spinning {
  animation: spin 1s linear infinite;
}

.indicator-icon.unsaved-dot {
  width: 8px;
  height: 8px;
  fill: currentColor;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.editor-body {
  flex: 1;
  overflow-y: auto;
}

.editor-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 3rem;
}

.title-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.title-input::placeholder {
  color: var(--text-color-secondary);
  opacity: 0.4;
}

.content-area {
  min-height: 400px;
}

.tiptap-wrapper {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-color);
}

:deep(.tiptap) {
  outline: none;
  min-height: 400px;
}

:deep(.tiptap p) {
  margin: 0 0 0.25rem;
}

:deep(.tiptap h1) {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 2rem 0 1rem;
}

:deep(.tiptap h2) {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 1.75rem 0 0.875rem;
}

:deep(.tiptap h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
}

:deep(.tiptap ul),
:deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

:deep(.tiptap li) {
  margin: 0.375rem 0;
}

:deep(.tiptap ul[data-type="taskList"]) {
  list-style: none;
  padding-left: 0;
}

:deep(.tiptap ul[data-type="taskList"] li) {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

:deep(.tiptap ul[data-type="taskList"] li > label) {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

:deep(.tiptap ul[data-type="taskList"] li > label input[type="checkbox"]) {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--primary-color);
}

:deep(.tiptap ul[data-type="taskList"] li > div) {
  flex: 1;
}

:deep(.tiptap ul[data-type="taskList"] li[data-checked="true"] > div) {
  text-decoration: line-through;
  color: var(--text-color-secondary);
}

:deep(.tiptap mark) {
  background-color: #fef08a;
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
}

:deep(.tiptap a) {
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
}

:deep(.tiptap a:hover) {
  opacity: 0.8;
}

/* 노트 링크 ([[노트]]) */
:deep(.tiptap a.note-link) {
  display: inline-block;
  padding: 0 0.35em;
  border-radius: 4px;
  background: color-mix(in srgb, var(--primary-color) 14%, transparent);
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

:deep(.tiptap a.note-link::before) {
  content: '↗ ';
  opacity: 0.7;
  font-size: 0.85em;
}

:deep(.tiptap a.note-link:hover) {
  background: color-mix(in srgb, var(--primary-color) 24%, transparent);
  opacity: 1;
}

:deep(.tiptap blockquote) {
  border-left: 3px solid var(--surface-border);
  padding-left: 1rem;
  margin: 1.25rem 0;
  color: var(--text-color-secondary);
}

:deep(.tiptap hr) {
  border: none;
  border-top: 1px solid var(--surface-border);
  margin: 2rem 0;
}

:deep(.tiptap code) {
  background: var(--surface-ground);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

:deep(.tiptap pre) {
  background: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

:deep(.tiptap pre code) {
  background: none;
  padding: 0;
  font-size: 0.875rem;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--text-color-secondary);
  opacity: 0.4;
  pointer-events: none;
  height: 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 1.5rem;
  height: 49px;
  flex-shrink: 0;
  border-top: 1px solid var(--surface-border);
  background: var(--surface-ground);
  /* 에디터 영역이 좁아지면(연결 패널 등) 잘리지 않고 가로 스크롤 */
  overflow-x: auto;
  scrollbar-width: none;
}

.editor-toolbar::-webkit-scrollbar {
  display: none;
}

.toolbar-group,
.toolbar-divider,
.char-count {
  flex-shrink: 0;
}

.toolbar-group {
  display: flex;
  gap: 0.125rem;
}

.toolbar-group button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-color-secondary);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.15s;
}

.toolbar-group button:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.toolbar-group button.active {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

.toolbar-icon {
  width: 16px;
  height: 16px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--surface-border);
  margin: 0 0.5rem;
}

.toolbar-spacer {
  flex: 1;
}

.char-count {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

/* 테이블 스타일 */
:deep(.tiptap table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

:deep(.tiptap th),
:deep(.tiptap td) {
  border: 1px solid var(--surface-border);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

:deep(.tiptap th) {
  background: var(--surface-ground);
  font-weight: 600;
}

:deep(.tiptap tr:hover td) {
  background: var(--surface-hover);
}

/* 이미지 스타일 */
:deep(.tiptap img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

:deep(.tiptap img.ProseMirror-selectednode) {
  outline: 2px solid var(--primary-color);
}

/* ===== 모바일 (768px 이하) ===== */
@media (max-width: 768px) {
  .editor-topbar {
    padding: 0.75rem 1rem 0.75rem 3.25rem; /* 왼쪽은 메뉴 버튼 자리 */
  }

  .editor-container {
    padding: 1.25rem 1.1rem 2rem;
  }

  .title-input {
    font-size: 1.6rem;
  }

  .editor-toolbar {
    padding: 0 0.5rem;
  }
}
</style>
