<template>
  <ul class="public-folder-tree">
    <li v-for="folder in folders" :key="folder.folderId" class="folder-node">
      <div class="folder-header" @click="toggle(folder.folderId)">
        <ChevronRight
          class="folder-chevron"
          :class="{ rotated: isOpen(folder.folderId) }"
        />
        <FolderOpen v-if="isOpen(folder.folderId)" class="folder-icon" />
        <Folder v-else class="folder-icon" />
        <span class="folder-name">{{ folder.name }}</span>
      </div>

      <div v-if="isOpen(folder.folderId)" class="folder-children">
        <!-- 게시글 -->
        <router-link
          v-for="post in folder.posts"
          :key="post.postId"
          :to="{ name: 'public-post', params: { slug, postId: post.postId } }"
          class="post-link"
          active-class="post-link-active"
        >
          <FileText class="post-icon" />
          <span class="post-title">{{ post.title }}</span>
        </router-link>

        <!-- 하위 폴더 (재귀) -->
        <PublicFolderTree
          v-if="folder.children?.length"
          :folders="folder.children"
          :slug="slug"
        />
      </div>
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronRight, Folder, FolderOpen, FileText } from 'lucide-vue-next'

defineProps({
  folders: { type: Array, required: true },
  slug: { type: String, required: true },
})

const openSet = ref(new Set())

function toggle(id) {
  if (openSet.value.has(id)) {
    openSet.value.delete(id)
  } else {
    openSet.value.add(id)
  }
}

function isOpen(id) {
  return openSet.value.has(id)
}
</script>

<style scoped>
.public-folder-tree {
  list-style: none;
  padding: 0;
  margin: 0;
}

.folder-node {
  margin-bottom: 2px;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.625rem;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-color);
  transition: background 0.15s;
}

.folder-header:hover {
  background: var(--surface-hover);
}

.folder-chevron {
  width: 14px;
  height: 14px;
  color: var(--text-color-secondary);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.folder-chevron.rotated {
  transform: rotate(90deg);
}

.folder-icon {
  width: 16px;
  height: 16px;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.folder-name {
  font-size: 0.875rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-children {
  padding-left: 1.25rem;
}

.post-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.625rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-color-secondary);
  font-size: 0.8125rem;
  transition: all 0.15s;
}

.post-link:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.post-link-active {
  background: var(--highlight-bg);
  color: var(--primary-color);
}

.post-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.post-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
