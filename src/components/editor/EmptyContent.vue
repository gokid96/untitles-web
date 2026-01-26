<template>
  <div class="empty-content">
    <div class="empty-illustration">
      <FileText class="illustration-icon" />
    </div>

    <h2 class="empty-title">시작하기</h2>
    <p class="empty-description">새 노트를 작성하거나 사이드바에서 기존 노트를 선택하세요</p>

    <button class="create-button" @click="handleCreatePost">
      <Plus class="btn-icon" />
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
import { FileText, Plus } from 'lucide-vue-next'

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
  background-color: var(--surface-ground);
  padding: 2rem;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  margin-bottom: 0rem;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 24px;
}

.illustration-icon {
  width: 56px;
  height: 56px;
  color: var(--text-color-secondary);
  opacity: 0.5;
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

.btn-icon {
  width: 18px;
  height: 18px;
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
