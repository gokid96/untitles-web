<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :closable="false"
    :draggable="false"
    :showHeader="false"
    :style="{ width: '360px' }"
    :pt="{
      root: { class: 'conflict-dialog' }
    }"
  >
    <div class="conflict-modal">
      <div class="conflict-icon">
        <AlertTriangle class="icon" />
      </div>

      <!-- <h3>수정 충돌</h3> -->
      <p>다른 곳에서 이 문서를 수정했습니다.</p>

      <div class="conflict-actions">
        <button class="btn-secondary" @click="handleLoadLatest">
          최신 버전 불러오기
        </button>
        <button class="btn-primary" @click="handleKeepMine">
          내 변경사항 저장
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import { AlertTriangle } from 'lucide-vue-next'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'keep-mine', 'load-latest'])

function handleKeepMine() {
  emit('keep-mine')
  emit('update:visible', false)
}

function handleLoadLatest() {
  emit('load-latest')
  emit('update:visible', false)
}
</script>

<style scoped>
.conflict-modal {
  padding: 1.5rem;
  text-align: center;
}

.conflict-icon {
  margin-bottom: 1rem;
}

.conflict-icon .icon {
  width: 40px;
  height: 40px;
  color: #f59e0b;
}

.conflict-modal h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.conflict-modal p {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.conflict-actions {
  display: flex;
  gap: 0.75rem;
}

.conflict-actions button {
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary {
  background: #6366f1;
  color: #ffffff;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #3f3f46;
  color: #ffffff;
  border: none;
}

.btn-secondary:hover {
  opacity: 0.9;
}
</style>

<style>
.conflict-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  border: 1px solid var(--surface-border) !important;
}

.conflict-dialog .p-dialog-content {
  padding: 0 !important;
  background: var(--surface-card) !important;
}
</style>
