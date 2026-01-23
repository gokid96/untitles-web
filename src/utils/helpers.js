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

  // 폴더와 게시글 분리
  const folders = nodes.filter(n => n.type === 'folder')
  const posts = nodes.filter(n => n.type === 'post')

  // 게시글만 정렬 (폴더는 원래 순서 유지)
  const sortedPosts = [...posts].sort(sortFn)

  // 폴더 먼저, 게시글 나중에
  return [...folders, ...sortedPosts]
}

/**
 * 폴더 트리를 UI용 트리 구조로 변환
 * - 서버에서 이미 폴더 안에 posts가 포함되어 있음
 * - children도 서버에서 이미 구성되어 있음
 *
 * @param {Array} folders - 서버에서 받은 폴더 목록 (트리 구조, posts 포함)
 * @param {Array} rootPosts - 폴더 없는 게시글 목록
 * @param {string} sortOption - 정렬 옵션
 * @returns {Array} UI용 트리 구조
 */
export function buildFolderTree(folders, rootPosts = [], sortOption = 'name_asc') {

  /**
   * 폴더를 UI 노드로 변환 (재귀)
   */
  function transformFolder(folder) {
    // 폴더 안의 게시글을 UI 노드로 변환
    const folderPosts = (folder.posts || []).map((post) => ({
      key: `post-${post.postId}`,
      label: post.title || '제목 없음',
      icon: 'pi pi-file',
      type: 'post',
      id: post.postId,
      data: {
        postId: post.postId,
        title: post.title,
        folderId: folder.folderId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      },
      children: [],
    }))

    // 하위 폴더를 UI 노드로 변환 (재귀)
    const subFolders = (folder.children || []).map(transformFolder)

    // 정렬 적용 (폴더 먼저, 게시글 나중)
    const sortedChildren = sortNodes([...subFolders, ...folderPosts], sortOption)

    return {
      key: `folder-${folder.folderId}`,
      label: folder.name,
      icon: 'pi pi-folder',
      type: 'folder',
      id: folder.folderId,
      data: {
        folderId: folder.folderId,
        name: folder.name,
        parentId: folder.parentId,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt
      },
      children: sortedChildren,
    }
  }

  // 루트 폴더들을 UI 노드로 변환
  const tree = folders.map(transformFolder)

  // 루트 게시글 (폴더 없는 게시글)을 UI 노드로 변환
  const orphanPosts = rootPosts.map((post) => ({
    key: `post-${post.postId}`,
    label: post.title || '제목 없음',
    icon: 'pi pi-file',
    type: 'post',
    id: post.postId,
    data: {
      postId: post.postId,
      title: post.title,
      folderId: null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    },
    children: [],
  }))

  // 루트 레벨 정렬 적용
  return sortNodes([...tree, ...orphanPosts], sortOption)
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

  function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }

  // cancel 메서드 추가
  executedFunction.cancel = () => {
    clearTimeout(timeout)
    timeout = null
  }

  return executedFunction
}
