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

      <p class="conflict-title">다른 곳에서 같은 부분을 수정했어요</p>
      <p>자동으로 합칠 수 없어서 선택이 필요해요.</p>

      <div class="conflict-actions">
        <button class="btn-primary" @click="handleKeepBoth">
          둘 다 보존
          <span class="btn-hint">내 내용은 사본 노트로 저장</span>
        </button>
        <button class="btn-secondary" @click="handleKeepMine">
          내 내용으로 덮어쓰기
        </button>
        <button class="btn-secondary" @click="handleLoadLatest">
          다른 곳의 내용 불러오기
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

const emit = defineEmits(['update:visible', 'keep-mine', 'load-latest', 'keep-both'])

function handleKeepMine() {
  emit('keep-mine')
  emit('update:visible', false)
}

function handleKeepBoth() {
  emit('keep-both')
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

.conflict-modal .conflict-title {
  margin: 0 0 0.375rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-color);
}

.conflict-modal p {
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.conflict-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-hint {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.85;
}

.conflict-actions button {
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
