/**
 * 프로필 사진이 없을 때 쓰는 기본 색. 같은 사람은 어디서나(멤버 목록, 내 정보, 편집 중 표시, 커서) 같은 색이다.
 * 흰 글자가 잘 보이는 진한 색들.
 */
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#c026d3', '#db2777', '#e11d48', '#ea580c',
  '#d97706', '#16a34a', '#0d9488', '#0891b2', '#0284c7', '#2563eb',
]

/** @param seed 사용자 ID (없으면 이름·이메일) */
export function avatarColor(seed) {
  const n = Number(seed)
  if (Number.isFinite(n) && n > 0) return AVATAR_COLORS[n % AVATAR_COLORS.length]
  const text = String(seed || '?')
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function avatarInitial(name) {
  return (String(name || '').trim().charAt(0) || '?').toUpperCase()
}
