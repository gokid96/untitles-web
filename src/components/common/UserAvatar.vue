<template>
  <span class="user-avatar-x" :class="shape" :style="boxStyle" :title="title || undefined">
    <img v-if="image && !broken" :src="image" alt="" referrerpolicy="no-referrer" @error="broken = true" />
    <span v-else class="initial" :style="{ fontSize: Math.round(size * 0.42) + 'px' }">{{ avatarInitial(name) }}</span>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { avatarColor, avatarInitial } from '@/utils/avatar'

/**
 * 사용자 프로필 표시: 사진이 있으면 사진, 없으면 사용자별 기본 색 + 첫 글자
 */
const props = defineProps({
  userId: { type: [Number, String], default: null },
  name: { type: String, default: '' },
  image: { type: String, default: '' },
  size: { type: Number, default: 32 },
  shape: { type: String, default: 'rounded' }, // rounded | circle
  title: { type: String, default: '' },
})

const broken = ref(false)
watch(() => props.image, () => { broken.value = false })

const boxStyle = computed(() => ({
  width: props.size + 'px',
  height: props.size + 'px',
  background: props.image && !broken.value ? 'transparent' : avatarColor(props.userId ?? props.name),
}))
</script>

<style scoped>
.user-avatar-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  color: #fff;
  font-weight: 600;
  line-height: 1;
  user-select: none;
}
.user-avatar-x.rounded { border-radius: 28%; }
.user-avatar-x.circle { border-radius: 50%; }
.user-avatar-x img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
