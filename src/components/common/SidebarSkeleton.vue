<template>
  <div class="skeleton-sidebar">
    <!-- 검색 스켈레톤 (상단) -->
    <div class="skeleton-search"></div>

    <!-- 액션 버튼 스켈레톤 -->
    <div class="skeleton-header">
      <div class="skeleton-btn"></div>
      <div class="skeleton-btn"></div>
      <div class="skeleton-btn"></div>
      <div class="skeleton-btn"></div>
    </div>

    <!-- 트리 아이템 스켈레톤 -->
    <div class="skeleton-tree">
      <div class="skeleton-item">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text" style="width: 60%"></div>
      </div>
      <div class="skeleton-item indent">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text" style="width: 80%"></div>
      </div>
      <div class="skeleton-item indent">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text" style="width: 50%"></div>
      </div>
      <div class="skeleton-item">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text" style="width: 70%"></div>
      </div>
      <div class="skeleton-item indent">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text" style="width: 65%"></div>
      </div>
      <div class="skeleton-item">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text" style="width: 55%"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-sidebar {
  padding: 0.75rem;
}

.skeleton-search {
  height: 40px;
  background: var(--surface-hover);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  gap: 0.25rem;
  padding: 0 0 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.skeleton-btn {
  width: 32px;
  height: 32px;
  background: var(--surface-hover);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-tree {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
}

.skeleton-item.indent {
  margin-left: 1.25rem;
}

.skeleton-icon {
  width: 18px;
  height: 18px;
  background: var(--surface-hover);
  border-radius: 4px;
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text {
  height: 14px;
  background: var(--surface-hover);
  border-radius: 4px;
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
