<template>
  <div class="app-header">
    <div class="header-left">
      <!-- <h1 class="header-title">{{ blogTitle }}</h1> -->
    </div>

    <div class="header-center">
      <!-- <IconField iconPosition="left">
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchQuery" placeholder="검색..." @input="handleSearch" />
      </IconField> -->
    </div>
<!--
    <div class="header-right">
      <Button :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" text rounded @click="handleToggleDarkMode"
        v-tooltip.bottom="isDarkMode ? '라이트 모드' : '다크 모드'" />
      <Button :label="userName" icon="pi pi-user" text @click="toggleUserMenu" aria-haspopup="true"
        aria-controls="user_menu" />
      <Menu ref="userMenu" id="user_menu" :model="userMenuItems" :popup="true" />
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
// import InputText from 'primevue/inputtext'
// import IconField from 'primevue/iconfield'
// import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
//import { debounce } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

//const searchQuery = ref('')
const userMenu = ref(null)

// const blogTitle = computed(() => {
//   return authStore.currentUser?.blogTitle || 'untitles'
// })

const userName = computed(() => {
  return authStore.currentUser?.nickname || '사용자'
})

const isDarkMode = computed(() => uiStore.isDarkMode)

const userMenuItems = [
  {
    label: '내 정보',
    icon: 'pi pi-user',
    command: () => {
      // 사용자 정보 페이지로 이동 (추후 구현)
    },
  },
  {
    separator: true,
  },
  {
    label: '로그아웃',
    icon: 'pi pi-sign-out',
    command: () => {
      handleLogout()
    },
  },
]

function toggleUserMenu(event) {
  userMenu.value.toggle(event)
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

function handleToggleDarkMode() {
  uiStore.toggleDarkMode()
}

// const handleSearch = debounce((event) => {
//   const query = event.target.value
//   // 검색 기능 구현 (추후)
// }, 300)
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  height: 60px;
}

.header-left {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.header-center :deep(.p-inputtext) {
  width: 400px;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.header-right :deep(.p-button) {
  transition: all 0.2s;
}

.header-right :deep(.p-button:hover) {
  transform: scale(1.05);
}

.header-right :deep(.pi-sun) {
  color: #171717;
}

.dark-mode .header-right :deep(.pi-sun) {
  color: #ffffff;
}

.header-right :deep(.pi-moon) {
  color: #171717;
}

.dark-mode .header-right :deep(.pi-moon) {
  color: #ffffff;
}
</style>
