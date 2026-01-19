<template>
  <Dialog
    :visible="visible"
    :header="header"
    :modal="true"
    :closable="false"
    :style="{ width: '450px' }"
    @update:visible="handleVisibleChange"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500)"></i>
      <span>{{ message }}</span>
    </div>

    <template #footer>
      <Button label="취소" icon="pi pi-times" @click="handleCancel" text />
      <Button label="삭제" icon="pi pi-check" @click="handleConfirm" severity="danger" autofocus />
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  header: {
    type: String,
    //default: '삭제 확인',
  },
  message: {
    type: String,
    default: '정말 삭제하시겠습니까?',
  },
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

function handleVisibleChange(value) {
  emit('update:visible', value)
}

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
