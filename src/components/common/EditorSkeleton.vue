<template>
  <div class="skeleton-editor">
    <!-- 상단 바 스켈레톤 -->
    <div class="skeleton-topbar">
      <div class="skeleton-breadcrumb"></div>
      <div class="skeleton-indicator"></div>
    </div>

    <!-- 에디터 본문 스켈레톤 -->
    <div class="skeleton-body">
      <div class="skeleton-container">
        <div class="skeleton-title"></div>
        <div class="skeleton-content">
          <div class="skeleton-line" style="width: 90%"></div>
          <div class="skeleton-line" style="width: 75%"></div>
          <div class="skeleton-line" style="width: 85%"></div>
          <div class="skeleton-line" style="width: 60%"></div>
          <div class="skeleton-line" style="width: 80%"></div>
          <div class="skeleton-line" style="width: 70%"></div>
        </div>
      </div>
    </div>

    <!-- 툴바 스켈레톤 -->
    <div class="skeleton-toolbar">
      <div class="skeleton-btn-group">
        <div class="skeleton-btn"></div>
        <div class="skeleton-btn"></div>
        <div class="skeleton-btn"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-card);
}

.skeleton-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  min-height: 48px;
}

.skeleton-breadcrumb {
  width: 120px;
  height: 16px;
  background: var(--surface-hover);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-indicator {
  width: 80px;
  height: 16px;
  background: var(--surface-hover);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-body {
  flex: 1;
  overflow-y: auto;
}

.skeleton-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 3rem;
}

.skeleton-title {
  width: 60%;
  height: 40px;
  background: var(--surface-hover);
  border-radius: 6px;
  margin-bottom: 2rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-line {
  height: 18px;
  background: var(--surface-hover);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-toolbar {
  display: flex;
  align-items: center;
  padding: 0.625rem 1.5rem;
  border-top: 1px solid var(--surface-border);
}

.skeleton-btn-group {
  display: flex;
  gap: 0.5rem;
}

.skeleton-btn {
  width: 32px;
  height: 32px;
  background: var(--surface-hover);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
