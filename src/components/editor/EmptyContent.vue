<template>
  <div class="empty-content">
    <div class="empty-illustration">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="30" width="120" height="150" rx="8" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <line x1="60" y1="60" x2="140" y2="60" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <line x1="60" y1="80" x2="120" y2="80" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <line x1="60" y1="100" x2="130" y2="100" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <line x1="60" y1="120" x2="100" y2="120" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <circle cx="150" cy="150" r="30" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <line x1="140" y1="150" x2="160" y2="150" stroke="currentColor" stroke-width="2" opacity="0.4"/>
        <line x1="150" y1="140" x2="150" y2="160" stroke="currentColor" stroke-width="2" opacity="0.4"/>
      </svg>
    </div>
    
    <h2 class="empty-title">시작하기</h2>
    <p class="empty-description">새 노트를 작성하거나 사이드바에서 기존 노트를 선택하세요</p>
    
    <button class="create-button" @click="handleCreatePost">
      <i class="pi pi-plus"></i>
      <span>새 노트 작성</span>
    </button>

    <div class="keyboard-hints">
      <div class="hint">
        <kbd>Ctrl</kbd> + <kbd>Q</kbd>
        <span>새 노트</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['createPost'])

function handleCreatePost() {
  emit('createPost')
}
</script>

<style scoped>
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--surface-card);
  padding: 2rem;
}

.empty-illustration {
  width: 160px;
  height: 160px;
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
  opacity: 0.6;
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  margin: 0 0 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.empty-description {
  margin: 0 0 2rem;
  font-size: 0.9375rem;
  color: var(--text-color-secondary);
  text-align: center;
  max-width: 300px;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  color: var(--primary-color-text);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.create-button:active {
  transform: translateY(0);
}

.create-button i {
  font-size: 0.875rem;
}

.keyboard-hints {
  display: flex;
  gap: 2rem;
  margin-top: 3rem;
}

.hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

kbd {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.6875rem;
  color: var(--text-color-secondary);
}
</style>
