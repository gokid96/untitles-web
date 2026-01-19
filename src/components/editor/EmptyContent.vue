<template>
  <div class="empty-content">
    <i class="pi pi-file-edit empty-icon"></i>
    <h2>노트가 선택되지 않았습니다</h2>
    <p>왼쪽 사이드바에서 노트를 선택하거나 새로 작성하세요.</p>
    <div class="empty-actions">
      <Button label="새 파일 생성하기" icon="pi pi-plus" @click="handleCreatePost" size="large" />
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'

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
  color: var(--text-color-secondary);
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-content h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.empty-content p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
}
</style>
