<template>
  <div class="landing-page">
    <!-- Noise texture overlay -->
    <div class="noise-overlay"></div>

    <!-- Navigation -->
    <nav class="nav" :class="{ scrolled: isScrolled }">
      <a href="#" class="nav-logo" @click.prevent="scrollToTop">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M50 8 C52 30 58 36 80 38 C58 40 52 46 50 68 C48 46 42 40 20 38 C42 36 48 30 50 8 Z"/>
          <path fill="currentColor" d="M50 50 C51 62 54 65 66 66 C54 67 51 70 50 82 C49 70 46 67 34 66 C46 65 49 62 50 50 Z"/>
          <path fill="currentColor" opacity="0.5" d="M78 70 C78.5 76 80 77.5 86 78 C80 78.5 78.5 80 78 86 C77.5 80 76 78.5 70 78 C76 77.5 77.5 76 78 70 Z"/>
        </svg>
        <span>Untitles</span>
      </a>
      <div class="nav-links">
        <a href="#features" @click.prevent="scrollTo('features')">기능</a>
        <a href="#workflow" @click.prevent="scrollTo('workflow')">사용법</a>
        <router-link to="/login" class="nav-cta">시작하기</router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span>미니멀 노트 앱</span>
        </div>
        <h1>생각을 정리하는<br>가장 <em>단순한</em> 방법</h1>
        <p class="hero-subtitle">
      당신의 생각을 구조화하고 기록할 수 있는 미니멀한 노트
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="btn-primary">
            시작하기
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </router-link>
          <a href="#features" class="btn-secondary" @click.prevent="scrollTo('features')">
            더 알아보기
          </a>
        </div>
      </div>
    </section>

    <!-- Preview Section -->
    <section class="preview">
      <div class="preview-window">
        <div class="preview-header">
          <div class="preview-dot"></div>
          <div class="preview-dot"></div>
          <div class="preview-dot"></div>
        </div>
        <div class="preview-content">
          <div class="preview-sidebar">
            <div class="preview-sidebar-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              검색
            </div>
            <div class="preview-sidebar-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              프로젝트
            </div>
            <div class="preview-sidebar-item active">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              2026년 계획
            </div>
            <div class="preview-sidebar-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              아이디어 노트
            </div>
            <div class="preview-sidebar-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
              </svg>
              아카이브
            </div>
          </div>
          <div class="preview-editor">
            <h2 class="preview-editor-title">2026년 계획</h2>
            <div class="preview-editor-content">
              <p>올해는 <span class="highlight">집중</span>의 해로 삼기로 했다. 너무 많은 것을 동시에 하려다 보니 정작 중요한 것들이 뒤로 밀렸던 지난해의 실수를 반복하지 않으려 한다.</p>
              <p>첫 번째 목표는 <code>깊은 작업</code>에 더 많은 시간을 투자하는 것. 방해받지 않는 3시간의 집중 시간을 매일 확보하자.</p>
              <p>두 번째는 건강. 규칙적인 운동과 충분한 수면이 결국 모든 것의 기반이 된다는 걸 알면서도 쉽게 잊곤 했다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
      <div class="section-header animate-on-scroll">
        <p class="section-label">Features</p>
        <h2 class="section-title">생각에만 집중하세요</h2>
        <p class="section-subtitle">복잡한 기능은 뒤로, 핵심만 담았습니다</p>
      </div>
      <div class="features-grid">
        <div class="feature-card animate-on-scroll">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
            </svg>
          </div>
          <h3 class="feature-title">계층형 폴더 구조</h3>
          <p class="feature-desc">프로젝트, 주제, 카테고리별로 노트를 정리하세요. 드래그 앤 드롭으로 손쉽게 구조를 변경할 수 있습니다.</p>
        </div>
        <div class="feature-card animate-on-scroll">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
            </svg>
          </div>
          <h3 class="feature-title">강력한 에디터</h3>
          <p class="feature-desc">마크다운, 코드 블록, 표, 이미지 삽입 등 글쓰기에 필요한 모든 기능을 지원합니다.</p>
        </div>
        <div class="feature-card animate-on-scroll">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
            </svg>
          </div>
          <h3 class="feature-title">다크 모드</h3>
          <p class="feature-desc">눈의 피로를 줄이는 다크 모드를 지원합니다. 시스템 설정에 따라 자동으로 전환됩니다.</p>
        </div>
        <div class="feature-card animate-on-scroll">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"/>
            </svg>
          </div>
          <h3 class="feature-title">키보드 단축키</h3>
          <p class="feature-desc">Ctrl+Q로 새 노트 작성, 빠른 검색 등 키보드만으로 모든 작업을 수행할 수 있습니다.</p>
        </div>
        <div class="feature-card animate-on-scroll">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
            </svg>
          </div>
          <h3 class="feature-title">팀 워크스페이스</h3>
          <p class="feature-desc">팀 워크스페이스를 만들고 멤버를 초대하세요. 역할별 권한으로 세밀하게 관리할 수 있습니다.</p>
        </div>
        <div class="feature-card animate-on-scroll">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
          </div>
          <h3 class="feature-title">보안 & 프라이버시</h3>
          <p class="feature-desc">당신의 데이터는 암호화되어 안전하게 보관됩니다. 오직 당신만이 접근할 수 있습니다.</p>
        </div>
      </div>
    </section>

    <!-- Workflow Section -->
    <section class="workflow" id="workflow">
      <div class="workflow-grid">
        <div class="workflow-content animate-on-scroll">
          <h3>체계적으로 정리하고,<br>빠르게 찾으세요</h3>
          <p>
            폴더와 서브폴더로 노트를 계층적으로 관리하세요.
            드래그 앤 드롭으로 구조를 자유롭게 변경하고,
            팀 워크스페이스에서 멤버들과 함께 작업할 수 있습니다.
          </p>
          <ul class="workflow-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              드래그 앤 드롭으로 손쉬운 이동
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              팀 워크스페이스로 실시간 협업
            </li>
          </ul>
        </div>
        <div class="workflow-visual animate-on-scroll">
          <div class="workflow-card">
            <div class="folder-tree">
              <div class="folder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z"/>
                </svg>
                업무
              </div>
              <div class="indent">
                <div class="folder active">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z"/>
                  </svg>
                  2026 프로젝트
                </div>
                <div class="indent">
                  <div class="folder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                    </svg>
                    기획서.md
                  </div>
                  <div class="folder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                    </svg>
                    회의록.md
                  </div>
                </div>
                <div class="folder">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z"/>
                  </svg>
                  아카이브
                </div>
              </div>
              <div class="folder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z"/>
                </svg>
                개인
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content animate-on-scroll">
        <h2>지금 바로 시작하세요</h2>
        <p>당신만의 아이디어 공간을 만들어보세요.</p>
        <router-link to="/register" class="btn-primary">
          시작하기
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 Untitles</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

function scrollTo(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Intersection Observer for animations
let observer = null

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible')
        }, index * 100)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a1020 100%);
  color: #fafafa;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.7;
  overflow-x: hidden;
}

/* Noise texture overlay */
.noise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 1000;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  transition: background 0.3s ease, backdrop-filter 0.3s ease;
}

.nav.scrolled {
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #fafafa;
}

.nav-logo svg {
  width: 32px;
  height: 32px;
}

.nav-logo span {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #fafafa;
}

.nav-cta {
  padding: 0.625rem 1.5rem;
  background: #ffffff;
  color: #0a0a0f !important;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.15);
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8rem 2rem 4rem;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 60%, rgba(255, 255, 255, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  max-width: 900px;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2.5rem;
  animation: fadeInUp 0.8s ease forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.hero-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
}

.hero h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.8s ease forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

.hero h1 em {
  font-style: italic;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin: 0 auto 3rem;
  font-weight: 300;
  animation: fadeInUp 0.8s ease forwards;
  animation-delay: 0.6s;
  opacity: 0;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease forwards;
  animation-delay: 0.8s;
  opacity: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #ffffff;
  color: #0a0a0f;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(255, 255, 255, 0.2);
}

.btn-primary svg {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.btn-primary:hover svg {
  transform: translateX(3px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  color: #fafafa;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.15);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Preview Section */
.preview {
  padding: 0 4rem 8rem;
  display: flex;
  justify-content: center;
}

.preview-window {
  max-width: 1100px;
  width: 100%;
  background: #12121a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 50px 100px -20px rgba(0, 0, 0, 0.5),
    0 30px 60px -30px rgba(0, 0, 0, 0.4);
  animation: fadeInUp 1s ease forwards;
  animation-delay: 1s;
  opacity: 0;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 1rem 1.25rem;
  background: #1a1a28;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.preview-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.preview-dot:nth-child(1) { background: #ff5f57; }
.preview-dot:nth-child(2) { background: #febc2e; }
.preview-dot:nth-child(3) { background: #28c840; }

.preview-content {
  display: flex;
  min-height: 500px;
}

.preview-sidebar {
  width: 260px;
  background: #1a1a28;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
}

.preview-sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  transition: all 0.15s ease;
}

.preview-sidebar-item:hover,
.preview-sidebar-item.active {
  background: rgba(255, 255, 255, 0.05);
  color: #fafafa;
}

.preview-sidebar-item svg {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.preview-editor {
  flex: 1;
  padding: 2.5rem 3rem;
}

.preview-editor-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: #fafafa;
}

.preview-editor-content {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  line-height: 1.8;
}

.preview-editor-content p {
  margin-bottom: 1rem;
}

.preview-editor-content .highlight {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.preview-editor-content code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875em;
}

/* Features Section */
.features {
  padding: 8rem 4rem;
  background: #0d0d14;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 5rem;
}

.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 1rem;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  margin-bottom: 1rem;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
  font-weight: 300;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2.5rem;
  background: #0a0a0f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.feature-icon svg {
  width: 24px;
  height: 24px;
  color: #fafafa;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.feature-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9375rem;
  line-height: 1.7;
}

/* Workflow Section */
.workflow {
  padding: 8rem 4rem;
}

.workflow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
}

.workflow-content h3 {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.workflow-content p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.0625rem;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.workflow-list {
  list-style: none;
}

.workflow-list li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
}

.workflow-list li svg {
  width: 20px;
  height: 20px;
  color: #22c55e;
  flex-shrink: 0;
  margin-top: 2px;
}

.workflow-visual {
  position: relative;
}

.workflow-card {
  background: #12121a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
}

.workflow-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%);
  pointer-events: none;
}

.folder-tree {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.folder-tree .folder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.folder-tree .folder svg {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.35);
}

.folder-tree .folder.active {
  color: #fafafa;
}

.folder-tree .folder.active svg {
  color: #fbbf24;
}

.folder-tree .indent {
  padding-left: 1.5rem;
}

/* CTA Section */
.cta {
  padding: 10rem 4rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 60%);
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.cta h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 400;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.cta p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.25rem;
  margin-bottom: 3rem;
  font-weight: 300;
}

/* Footer */
.footer {
  padding: 3rem 4rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer p {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.875rem;
}

/* Scroll animations */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {
  .nav {
    padding: 1.25rem 2rem;
  }

  .nav-links {
    gap: 2rem;
  }

  .features {
    padding: 6rem 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr 1fr;
  }

  .workflow {
    padding: 6rem 2rem;
  }

  .workflow-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .preview {
    padding: 0 2rem 6rem;
  }
}

@media (max-width: 768px) {
  .nav-links a:not(.nav-cta) {
    display: none;
  }

  .hero {
    padding: 7rem 1.5rem 4rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .preview-content {
    flex-direction: column;
  }

  .preview-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .cta {
    padding: 6rem 1.5rem;
  }

  .footer {
    padding: 2rem 1.5rem;
  }
}
</style>
