<template>
  <div class="post-editor">
    <!-- 상단 바 -->
    <div class="editor-topbar">
      <div class="topbar-left">
        <span class="breadcrumb" v-if="folderName">
          <i class="pi pi-folder"></i>
          <span>{{ folderName }}</span>
        </span>
      </div>
      <div class="topbar-right">
        <div class="save-indicator" :class="{ saving: isSaving, unsaved: hasUnsavedChanges && !isSaving }">
          <i :class="saveIndicatorIcon"></i>
          <span>{{ saveIndicatorText }}</span>
        </div>
      </div>
    </div>

    <!-- 에디터 본문 -->
    <div class="editor-body">
      <div class="editor-container">
        <input type="text" v-model="formData.title" placeholder="제목 없음" class="title-input"
          @keydown.enter.prevent="focusEditor" />
        <div class="content-area">
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
          title="형광펜"><i class="pi pi-sun"></i></button>
        <button @click="openLinkPopover" :class="{ active: editor.isActive('link') }"
          title="링크"><i class="pi pi-link"></i></button>
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
          :class="{ active: editor.isActive({ textAlign: 'left' }) }" title="왼쪽 정렬"><i class="pi pi-align-left"></i></button>
        <button @click="editor.chain().focus().setTextAlign('center').run()"
          :class="{ active: editor.isActive({ textAlign: 'center' }) }" title="가운데 정렬"><i class="pi pi-align-center"></i></button>
        <button @click="editor.chain().focus().setTextAlign('right').run()"
          :class="{ active: editor.isActive({ textAlign: 'right' }) }" title="오른쪽 정렬"><i class="pi pi-align-right"></i></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ active: editor.isActive('bulletList') }" title="불릿 리스트"><i class="pi pi-list"></i></button>
        <button @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ active: editor.isActive('orderedList') }" title="번호 리스트"><i class="pi pi-sort-numeric-up"></i></button>
        <button @click="editor.chain().focus().toggleTaskList().run()"
          :class="{ active: editor.isActive('taskList') }" title="체크리스트"><i class="pi pi-check-square"></i></button>
        <button @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ active: editor.isActive('blockquote') }" title="인용"><i class="pi pi-comment"></i></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ active: editor.isActive('codeBlock') }" title="코드 블록"><i class="pi pi-code"></i></button>
        <button @click="editor.chain().focus().setHorizontalRule().run()" title="구분선"><i class="pi pi-minus"></i></button>
        <button @click="insertTable" title="테이블 삽입"><i class="pi pi-table"></i></button>
        <button @click="triggerImageUpload" title="이미지 삽입"><i class="pi pi-image"></i></button>
        <button @click="exportMarkdown" title="마크다운 내보내기"><i class="pi pi-download"></i></button>
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
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import { common, createLowlight } from 'lowlight'
import TurndownService from 'turndown'
import { debounce } from '@/utils/helpers'
import { useFolderStore } from '@/stores/folderStore'
import { usePostStore } from '@/stores/postStore'
import { useToast } from 'primevue/usetoast'
import { imageApi } from '@/api/imageApi'
import UnsavedChangesModal from '@/components/common/UnsavedChangesModal.vue'
import ConflictModal from '@/components/common/ConflictModal.vue'
import LinkPopover from '@/components/editor/LinkPopover.vue'

const lowlight = createLowlight(common)
const folderStore = useFolderStore()
const postStore = usePostStore()
const toast = useToast()

const props = defineProps({ post: { type: Object, default: null } })

const formData = ref({ title: '', content: '', folderId: null })
const originalData = ref({ title: '', content: '' })
const currentVersion = ref(null)
const currentPostId = ref(null)
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

// 링크 팝오버 상태
const showLinkPopover = ref(false)
const linkPopoverUrl = ref('')
const linkPopoverPosition = ref({ top: 0, left: 0 })

// 이미지 업로드
const imageInput = ref(null)
const isUploadingImage = ref(false)

// 변경사항 체크
const hasUnsavedChanges = computed(() => {
  if (!props.post?.id) return false
  return formData.value.title !== originalData.value.title ||
    formData.value.content !== originalData.value.content
})

// 저장 상태 표시
const saveIndicatorIcon = computed(() => {
  if (isSaving.value) return 'pi pi-spin pi-spinner'
  if (hasUnsavedChanges.value) return 'pi pi-circle-fill'
  return 'pi pi-check'
})

const saveIndicatorText = computed(() => {
  if (isSaving.value) return '저장 중'
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

const editor = useEditor({
  extensions: [
    StarterKit.configure({ codeBlock: false }),
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
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Image.configure({ inline: false, allowBase64: false }),
  ],
  content: '',
  onUpdate: ({ editor }) => {
    formData.value.content = editor.getHTML()
    if (!isInitializing.value) {
      triggerAutoSave()
    }
  },
})

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
    isUploadingImage.value = true
    const response = await imageApi.uploadPostImage(file)
    const url = response.data.url

    // 에디터에 이미지 삽입
    editor.value?.chain().focus().setImage({ src: url }).run()

    toast.add({ severity: 'success', summary: '완료', detail: '이미지가 업로드되었습니다.', life: 2000 })
  } catch (error) {
    console.error('Image upload failed:', error)
    toast.add({ severity: 'error', summary: '업로드 실패', detail: '이미지 업로드에 실패했습니다.', life: 3000 })
  } finally {
    isUploadingImage.value = false
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

  try {
    const result = await postStore.updatePost(props.post.id, saveData)

    if (result.conflict) {
      // 충돌 발생 - 모달 표시
      conflictLatestData.value = result.post
      showConflictModal.value = true
    } else {
      // 저장 성공
      currentVersion.value = result.post.version
      originalData.value = {
        title: formData.value.title,
        content: formData.value.content
      }
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '저장 실패',
      detail: error.message || '서버 오류가 발생했습니다.',
      life: 3000,
    })
  }
}

// 충돌 처리: 내 변경사항 유지 (락 획득)
async function handleKeepMine() {
  if (!conflictLatestData.value) return

  // 최신 version으로 내 내용 저장
  isSaving.value = true
  try {
    await performSave(conflictLatestData.value.version)
    toast.add({
      severity: 'success',
      summary: '저장 완료',
      detail: '내 변경사항이 저장되었습니다.',
      life: 2000,
    })
  } finally {
    isSaving.value = false
    conflictLatestData.value = null
  }
}

// 충돌 처리: 최신 버전 불러오기 (락 없이 보기만)
function handleLoadLatest() {
  if (!conflictLatestData.value) return

  // 에디터 내용을 서버 데이터로 교체
  // 단, currentVersion은 업데이트하지 않음 → 다시 수정하면 또 충돌
  isInitializing.value = true

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
    editor.value.commands.setContent(conflictLatestData.value.content || '')
  }

  conflictLatestData.value = null

  setTimeout(() => {
    isInitializing.value = false
  }, 100)
}

// 저장 직렬화: 저장 중이면 대기, 완료 후 재시도
const autoSave = debounce(async () => {
  if (!props.post?.id || isInitializing.value) return

  // 충돌 모달이 열려있으면 저장하지 않음
  if (showConflictModal.value) return

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
  if (props.post?.id && !isInitializing.value) autoSave()
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
  if (hasUnsavedChanges.value) {
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
watch(
  () => props.post?.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      autoSave.cancel()
      hasPendingSave.value = false
      showConflictModal.value = false
      conflictLatestData.value = null
      isInitializing.value = true
      currentPostId.value = newId

      if (props.post) {
        formData.value = {
          title: props.post.title || '',
          content: props.post.content || '',
          folderId: props.post.folderId || null
        }
        originalData.value = {
          title: props.post.title || '',
          content: props.post.content || ''
        }
        currentVersion.value = props.post.version

        if (editor.value) {
          editor.value.commands.setContent(props.post.content || '')
        }
      } else {
        formData.value = { title: '', content: '', folderId: null }
        originalData.value = { title: '', content: '' }
        currentVersion.value = null
        if (editor.value) {
          editor.value.commands.setContent('')
        }
      }

      setTimeout(() => {
        isInitializing.value = false
      }, 100)
    }
  },
  { immediate: true }
)

// editor 초기화 완료 후 content 설정
watch(
  () => editor.value,
  (newEditor) => {
    if (newEditor && formData.value.content) {
      isInitializing.value = true
      newEditor.commands.setContent(formData.value.content)
      setTimeout(() => {
        isInitializing.value = false
      }, 100)
    }
  }
)

// title 변경 시 자동저장
watch(
  () => formData.value.title,
  (newTitle, oldTitle) => {
    if (!isInitializing.value && oldTitle !== undefined) {
      triggerAutoSave()
    }
  }
)

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  autoSave.cancel()
  window.removeEventListener('beforeunload', handleBeforeUnload)
  editor.value?.destroy()
})
</script>

<style scoped>
.post-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-card);
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

.breadcrumb i {
  font-size: 0.75rem;
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

.save-indicator.unsaved i {
  font-size: 0.5rem;
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
  font-size: 1.0625rem;
  line-height: 1.5;
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
  padding: 0.625rem 1.5rem;
  border-top: 1px solid var(--surface-border);
  background: var(--surface-card);
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

.toolbar-group button i {
  font-size: 0.9375rem;
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
</style>
