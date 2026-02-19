<template>
  <div class="public-post" v-if="post">
    <article>
      <h1 class="post-title">{{ post.title }}</h1>
      <div class="post-meta">
        <span class="meta-author">
          <User class="meta-icon" />
          {{ post.authorNickname }}
        </span>
        <span class="meta-date">
          <Calendar class="meta-icon" />
          {{ formatDate(post.createdAt) }}
        </span>
        <span v-if="post.updatedAt !== post.createdAt" class="meta-date">
          <Clock class="meta-icon" />
          수정 {{ formatDate(post.updatedAt) }}
        </span>
      </div>
      <div class="post-divider"></div>
      <div class="post-content tiptap-readonly" v-html="post.content"></div>
    </article>
  </div>

  <!-- 로딩 -->
  <div v-else-if="isLoading" class="post-loading">
    <Loader2 class="loading-spinner" />
  </div>

  <!-- 에러 -->
  <div v-else-if="error" class="post-error">
    <FileX class="error-icon" />
    <p>게시글을 찾을 수 없습니다.</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { User, Calendar, Clock, FileX, Loader2 } from 'lucide-vue-next'
import { publishApi } from '@/api/publishApi'

const route = useRoute()

const post = ref(null)
const isLoading = ref(true)
const error = ref(null)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function loadPost() {
  const slug = route.params.slug
  const postId = route.params.postId
  if (!slug || !postId) return

  isLoading.value = true
  error.value = null
  post.value = null

  try {
    const response = await publishApi.getPublicPost(slug, postId)
    post.value = response.data
  } catch (e) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

// postId 변경 시 다시 로드
watch(() => route.params.postId, loadPost, { immediate: true })
</script>

<style scoped>
.public-post {
  max-width: 800px;
}

.post-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.meta-author,
.meta-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.post-divider {
  height: 1px;
  background: var(--surface-border);
  margin: 1.25rem 0 2rem;
}

/* 에디터 콘텐츠 읽기 전용 스타일 */
.post-content {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-color);
}

:deep(.tiptap-readonly p) {
  margin: 0 0 0.5rem;
}

:deep(.tiptap-readonly h1) {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 2rem 0 1rem;
}

:deep(.tiptap-readonly h2) {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 1.75rem 0 0.875rem;
}

:deep(.tiptap-readonly h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
}

:deep(.tiptap-readonly ul),
:deep(.tiptap-readonly ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

:deep(.tiptap-readonly li) {
  margin: 0.375rem 0;
}

:deep(.tiptap-readonly blockquote) {
  border-left: 3px solid var(--surface-border);
  padding-left: 1rem;
  margin: 1.25rem 0;
  color: var(--text-color-secondary);
}

:deep(.tiptap-readonly hr) {
  border: none;
  border-top: 1px solid var(--surface-border);
  margin: 2rem 0;
}

:deep(.tiptap-readonly code) {
  background: var(--surface-ground);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

:deep(.tiptap-readonly pre) {
  background: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

:deep(.tiptap-readonly pre code) {
  background: none;
  padding: 0;
  font-size: 0.875rem;
}

:deep(.tiptap-readonly mark) {
  background-color: #fef08a;
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
}

:deep(.tiptap-readonly a) {
  color: var(--accent-color);
  text-decoration: underline;
}

:deep(.tiptap-readonly img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

:deep(.tiptap-readonly table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

:deep(.tiptap-readonly th),
:deep(.tiptap-readonly td) {
  border: 1px solid var(--surface-border);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

:deep(.tiptap-readonly th) {
  background: var(--surface-ground);
  font-weight: 600;
}

/* 로딩 */
.post-loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  color: var(--accent-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 에러 */
.post-error {
  text-align: center;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.error-icon {
  width: 40px;
  height: 40px;
  opacity: 0.4;
  margin-bottom: 0.75rem;
}
</style>
