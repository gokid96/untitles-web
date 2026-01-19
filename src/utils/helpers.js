// 날짜 포맷팅
export function formatDate(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now - date
  const diffInHours = diffInMs / (1000 * 60 * 60)

  // 24시간 이내면 상대 시간 표시
  if (diffInHours < 24) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    }
    return `${Math.floor(diffInHours)}시간 전`
  }

  // 그 외에는 날짜 표시
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // 올해면 년도 생략
  if (year === now.getFullYear()) {
    return `${month}-${day}`
  }

  return `${year}-${month}-${day}`
}

// 텍스트 미리보기 생성 (첫 N줄)
export function getPreview(text, lines = 3) {
  if (!text) return ''

  const lineArray = text.split('\n').filter((line) => line.trim() !== '')
  const previewLines = lineArray.slice(0, lines)

  return previewLines.join('\n')
}

// 정렬 함수 (게시글만 정렬, 폴더는 원래 순서 유지)
function sortNodes(nodes, sortOption) {
  // 날짜 파싱 헬퍼 함수
  const getTime = (dateValue) => {
    if (!dateValue) return 0
    const date = new Date(dateValue)
    return isNaN(date.getTime()) ? 0 : date.getTime()
  }

  const sortFunctions = {
    name_asc: (a, b) => (a.label || '').localeCompare(b.label || '', 'ko'),
    name_desc: (a, b) => (b.label || '').localeCompare(a.label || '', 'ko'),
    updated_desc: (a, b) => getTime(b.data?.updatedAt) - getTime(a.data?.updatedAt),
    updated_asc: (a, b) => getTime(a.data?.updatedAt) - getTime(b.data?.updatedAt),
    created_desc: (a, b) => getTime(b.data?.createdAt) - getTime(a.data?.createdAt),
    created_asc: (a, b) => getTime(a.data?.createdAt) - getTime(b.data?.createdAt)
  }

  const sortFn = sortFunctions[sortOption] || sortFunctions.name_asc

  // 폴더와 게시글을 분리
  const folders = nodes.filter(n => n.type === 'folder')
  const posts = nodes.filter(n => n.type === 'post')

  // 게시글만 정렬 (폴더는 원래 순서 유지)
  const sortedPosts = [...posts].sort(sortFn)

  // 폴더 먼저, 게시글 나중에
  return [...folders, ...sortedPosts]
}

// 폴더 트리를 계층 구조로 변환 (게시글 포함)
export function buildFolderTree(folders, parentId = null, posts = [], sortOption = 'name_asc') {
  console.log('[buildFolderTree] Building tree with folders:', folders.length, 'parentId:', parentId, 'posts:', posts.length, 'sortOption:', sortOption)

  // 중복된 폴더 ID 확인
  const folderIds = folders.map(f => f.id)
  const duplicates = folderIds.filter((id, index) => folderIds.indexOf(id) !== index)
  if (duplicates.length > 0) {
    console.warn('[buildFolderTree] Duplicate folder IDs found:', duplicates)
  }

  const tree = folders
    .filter((folder) => {
      // parentId가 null일 때는 undefined나 null인 폴더를 모두 매칭
      return parentId === null
        ? (folder.parentId === null || folder.parentId === undefined)
        : folder.parentId === parentId
    })
    .map((folder) => {
      // 해당 폴더에 속한 게시글 찾기
      const folderPosts = posts
        .filter((post) => post.folderId === folder.id)
        .map((post) => ({
          key: `post-${post.id}`,
          label: post.title || '제목 없음',
          icon: 'pi pi-file',
          type: 'post',
          id: post.id,
          data: {
            postId: post.id,
            title: post.title,
            folderId: post.folderId,
            content: post.content,
            status: post.status,
            visibility: post.visibility,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
          },
          children: [],
        }))

      // 하위 폴더 재귀적으로 생성
      const subFolders = buildFolderTree(folders, folder.id, posts, sortOption)

      // children 정렬 적용
      const sortedChildren = sortNodes([...subFolders, ...folderPosts], sortOption)

      return {
        key: `folder-${folder.id}`,
        label: folder.name,
        icon: 'pi pi-folder',
        type: 'folder',
        id: folder.id,
        data: {
          folderId: folder.id,
          name: folder.name,
          parentId: folder.parentId,
          hasChildren: folder.hasChildren,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt
        },
        children: sortedChildren,
      }
    })

  // 루트 레벨인 경우, 폴더가 없는 게시글 추가
  if (parentId === null) {
    const orphanPosts = posts
      .filter((post) => !post.folderId)
      .map((post) => ({
        key: `post-${post.id}`,
        label: post.title || '제목 없음',
        icon: 'pi pi-file',
        type: 'post',
        id: post.id,
        data: {
          postId: post.id,
          title: post.title,
          folderId: null,
          content: post.content,
          status: post.status,
          visibility: post.visibility,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        },
        children: [],
      }))

    console.log('[buildFolderTree] Root tree created with', tree.length, 'folders and', orphanPosts.length, 'orphan posts')

    // 루트 레벨도 정렬 적용
    return sortNodes([...tree, ...orphanPosts], sortOption)
  }

  return sortNodes(tree, sortOption)
}

// 에러 메시지 추출
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}

// 디바운스 함수
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
