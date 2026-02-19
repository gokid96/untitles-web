<template>
  <div class="public-workspace" v-if="!isLoading">
    <!-- 에러 -->
    <div v-if="error" class="public-error">
      <div class="error-content">
        <FileX class="error-icon" />
        <h2>페이지를 찾을 수 없습니다</h2>
        <p>공개된 워크스페이스가 아니거나, 주소가 잘못되었습니다.</p>
        <router-link to="/" class="back-home">홈으로 돌아가기</router-link>
      </div>
    </div>

    <!-- 콘텐츠 -->
    <template v-else-if="workspace">
      <div class="public-body">
        <!-- 사이드 네비게이션 -->
        <aside class="public-nav">
          <nav>
            <!-- 루트 게시글 -->
            <router-link
              v-for="post in workspace.rootPosts"
              :key="post.postId"
              :to="{ name: 'public-post', params: { slug, postId: post.postId } }"
              class="nav-post-link"
              active-class="nav-active"
            >
              <FileText class="nav-icon" />
              <span>{{ post.title }}</span>
            </router-link>

            <!-- 폴더 트리 -->
            <PublicFolderTree
              v-if="workspace.folders?.length"
              :folders="workspace.folders"
              :slug="slug"
            />
          </nav>
        </aside>

        <!-- 메인 영역 -->
        <main class="public-main">
          <router-view />
          <div v-if="!$route.params.postId" class="welcome-message">
            <BookOpen class="welcome-icon" />
            <h2>{{ workspace.workspaceName }}</h2>
            <p>왼쪽 목록에서 게시글을 선택해주세요.</p>
          </div>
        </main>
      </div>
    </template>
  </div>

  <!-- 로딩 -->
  <div v-else class="public-loading">
    <Loader2 class="loading-spinner" />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { FileText, FileX, BookOpen, Loader2 } from 'lucide-vue-next'
import { publishApi } from '@/api/publishApi'
import PublicFolderTree from '@/components/public/PublicFolderTree.vue'

const route = useRoute()
const slug = route.params.slug

const workspace = ref(null)
const isLoading = ref(true)
const error = ref(null)

// 하위 라우트에서 workspace 접근 가능하도록 provide
provide('publicWorkspace', workspace)
provide('publicSlug', slug)

onMounted(async () => {
  try {
    const response = await publishApi.getPublicWorkspace(slug)
    workspace.value = response.data
  } catch (e) {
    error.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.public-workspace {
  min-height: 100vh;
  background: var(--surface-ground);
}

/* 헤더 */
.public-header {
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-card);
}

.header-inner {
  padding: 2rem 2.5rem;
}

.workspace-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.workspace-desc {
  font-size: 0.9375rem;
  color: var(--text-color-secondary);
  margin: 0;
}

/* 본문 레이아웃 */
.public-body {
  display: flex;
  min-height: 100vh;
}

/* 사이드 네비게이션 */
.public-nav {
  width: 260px;
  flex-shrink: 0;
  padding: 1.25rem 1rem;
  border-right: 1px solid var(--surface-border);
  background: var(--surface-sidebar);
  overflow-y: auto;
}

.nav-post-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  transition: all 0.15s;
}

.nav-post-link:hover {
  background: var(--surface-hover);
  color: var(--text-color);
  text-decoration: none;
}

.nav-active {
  background: var(--highlight-bg);
  color: var(--accent-color);
}

.nav-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* 메인 영역 */
.public-main {
  flex: 1;
  min-width: 0;
  padding: 2rem 2.5rem;
  background: var(--surface-card);
}

/* 환영 메시지 */
.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-color-secondary);
}

.welcome-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1.25rem;
  opacity: 0.4;
}

.welcome-message h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.welcome-message p {
  font-size: 0.9375rem;
  margin: 0;
}

/* 에러 */
.public-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  width: 56px;
  height: 56px;
  color: var(--text-color-secondary);
  opacity: 0.4;
  margin-bottom: 1.5rem;
}

.error-content h2 {
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: var(--text-color-secondary);
  margin-bottom: 1.5rem;
}

.back-home {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  background: var(--accent-color);
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background 0.2s;
}

.back-home:hover {
  background: var(--accent-color-hover);
  text-decoration: none;
  color: #fff;
}

/* 로딩 */
.public-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  color: var(--accent-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 반응형 */
@media (max-width: 768px) {
  .public-body {
    flex-direction: column;
  }

  .public-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--surface-border);
    max-height: 240px;
  }

  .public-main {
    padding: 1.5rem;
  }

  .header-inner {
    padding: 1.5rem;
  }
}
</style>
