<template>
  <Dialog :visible="visible" :header="isEditMode ? '폴더 이름 변경' : '새 폴더'" :modal="true" :closable="true"
    :style="{ width: '450px' }" @update:visible="handleVisibleChange">
    <div class="folder-modal-content">
      <div class="field">
        <label for="folderName">폴더 이름</label>
        <InputText id="folderName" v-model="folderName" placeholder="폴더 이름을 입력하세요" autofocus
          @keyup.enter="handleSave" />
      </div>
    </div>

    <template #footer>
      <Button label="취소" @click="handleCancel" text :disabled="isSaving">
        <template #icon>
          <X class="btn-icon" />
        </template>
      </Button>
      <Button label="저장" @click="handleSave" :disabled="!folderName.trim() || isSaving">
        <template #icon>
          <Check class="btn-icon" />
        </template>
      </Button>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { X, Check } from 'lucide-vue-next'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  folder: {
    type: Object,
    default: null,
  },
  parentId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])

const folderName = ref('')
const isEditMode = ref(false)
const isSaving = ref(false)

// visible이 변경될 때 폼 초기화
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      isEditMode.value = !!props.folder
      folderName.value = props.folder?.name || ''
      isSaving.value = false
      document.addEventListener('keydown', handleKeydown)
    } else {
      folderName.value = ''
      isSaving.value = false
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  if (!props.visible) return
  
  if (e.key === 'Escape') {
    handleCancel()
  }
}

function handleVisibleChange(value) {
  emit('update:visible', value)
}

function handleSave() {
  if (!folderName.value.trim() || isSaving.value) {
    return
  }

  isSaving.value = true

  const data = {
    name: folderName.value.trim(),
    parentId: props.parentId,
  }

  if (isEditMode.value) {
    emit('save', {
      id: props.folder.id,
      name: folderName.value.trim(),
    })
  } else {
    emit('save', data)
  }

  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.folder-modal-content {
  padding: 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}
</style>
