<template>
  <div class="privacy-view">
    <article class="privacy">
      <router-link to="/" class="back">← Untitles</router-link>
      <h1>개인정보처리방침</h1>
      <p class="meta">시행일: {{ EFFECTIVE_DATE }}</p>

      <p>
        {{ OPERATOR }}(이하 "운영자")은 Untitles 서비스(웹사이트 untitles.net 및 Android·iOS 앱, 이하 "서비스")를
        이용하는 분의 개인정보를 소중히 다루며, 관련 법령에 따라 아래와 같이 처리합니다.
      </p>

      <h2>1. 수집하는 정보</h2>
      <table>
        <thead>
          <tr><th>구분</th><th>항목</th><th>수집 시점</th></tr>
        </thead>
        <tbody>
          <tr><td>필수</td><td>이메일, 비밀번호(암호화하여 저장), 닉네임</td><td>이메일로 회원가입</td></tr>
          <tr><td>선택</td><td>프로필 이미지</td><td>내 정보 수정</td></tr>
          <tr><td>소셜 로그인</td><td>Apple·Google·카카오가 제공하는 서비스 식별값, 이메일, 이름(닉네임), 프로필 이미지</td><td>소셜 로그인·계정 연결 시</td></tr>
          <tr><td>작성 내용</td><td>노트, 폴더, 노트에 첨부한 이미지, 워크스페이스 정보</td><td>서비스 이용 중</td></tr>
          <tr><td>자동 생성</td><td>접속 IP 주소, 접속 일시, 요청 기록</td><td>서비스 이용 중</td></tr>
        </tbody>
      </table>
      <p>
        서비스는 광고 식별자를 수집하지 않으며, 광고나 행동 추적 목적의 쿠키·SDK를 사용하지 않습니다.
        로그인 상태 유지를 위한 토큰은 이용자의 기기(브라우저·앱 저장소)에만 저장됩니다.
      </p>

      <h2>2. 이용 목적</h2>
      <ul>
        <li>회원 식별, 로그인, 계정 관리</li>
        <li>노트 작성·저장·공유·공개 등 서비스 기능 제공</li>
        <li>무차별 로그인 시도 등 부정 이용 방지와 보안, 장애 대응</li>
      </ul>

      <h2>3. 보관 기간과 파기</h2>
      <ul>
        <li>회원 정보와 작성 내용은 회원 탈퇴 시 지체 없이 삭제합니다.</li>
        <li>
          단, 다른 사람이 소유한 팀 워크스페이스에 작성한 글은 그 워크스페이스의 내용으로 남으며,
          작성자 정보는 삭제되어 "탈퇴한 사용자"로 표시됩니다.
        </li>
        <li>접속 기록 등 서버 로그는 보안·장애 대응을 위해 짧은 기간 보관한 뒤 자동으로 삭제합니다.</li>
        <li>법령에 따라 보관이 필요한 경우에는 해당 기간 동안 별도로 보관합니다.</li>
      </ul>

      <h2>4. 제3자 제공</h2>
      <p>운영자는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따른 요청이 있는 경우는 예외로 합니다.</p>

      <h2>5. 처리 위탁 및 국외 이전</h2>
      <p>서비스 운영을 위해 아래 업체의 인프라를 이용하며, 이 과정에서 정보가 해외 서버를 거치거나 저장될 수 있습니다.</p>
      <table>
        <thead>
          <tr><th>업체</th><th>위탁 내용</th><th>이전되는 정보</th></tr>
        </thead>
        <tbody>
          <tr><td>Cloudflare, Inc. (미국)</td><td>네트워크 보안·전송, 첨부 이미지 저장(R2)</td><td>접속 정보, 첨부 이미지</td></tr>
          <tr><td>Vercel Inc. (미국)</td><td>웹사이트 호스팅</td><td>웹사이트 접속 정보</td></tr>
          <tr><td>Google LLC (미국)</td><td>인증번호·초대 메일 발송(Gmail)</td><td>받는 사람 이메일, 메일 내용</td></tr>
          <tr><td>Functional Software, Inc. (Sentry, 미국)</td><td>서비스 오류 수집·분석</td><td>오류 내용, 기기·브라우저 종류, 회원 번호</td></tr>
        </tbody>
      </table>
      <p>이전은 서비스 이용 시 네트워크를 통해 수시로 이루어지며, 보관 기간은 위 3항과 같습니다.</p>

      <h2 id="delete-account">6. 계정 삭제 방법</h2>
      <ol>
        <li>앱 또는 웹사이트(untitles.net)에 로그인합니다.</li>
        <li>왼쪽 아래 내 이름을 눌러 <strong>내 정보</strong>를 엽니다.</li>
        <li>맨 아래 <strong>회원 탈퇴</strong>를 누르고 안내를 확인한 뒤 <strong>탈퇴하기</strong>를 누릅니다.</li>
      </ol>
      <p>
        탈퇴하면 3항에 따라 정보가 삭제됩니다. 다른 멤버가 있는 팀 워크스페이스의 소유자는 워크스페이스를 삭제하거나
        멤버를 내보낸 뒤 탈퇴할 수 있습니다. 로그인할 수 없는 경우 아래 문의처로 삭제를 요청할 수 있습니다.
      </p>

      <h2>7. 이용자의 권리</h2>
      <p>
        이용자는 언제든지 내 정보 화면에서 자신의 정보를 조회·수정할 수 있고, 회원 탈퇴로 삭제를 요청할 수 있습니다.
        그 밖의 열람·정정·삭제·처리정지 요청은 아래 문의처로 연락하면 지체 없이 처리합니다.
      </p>

      <h2>8. 만 14세 미만 아동</h2>
      <p>서비스는 만 14세 미만 아동의 회원가입을 받지 않습니다.</p>

      <h2>9. 안전성 확보 조치</h2>
      <ul>
        <li>비밀번호 일방향 암호화 저장, 전 구간 HTTPS 통신</li>
        <li>접근 권한 관리, 로그인 시도 횟수 제한</li>
      </ul>

      <h2>10. 개인정보 보호책임자 및 문의</h2>
      <p>
        책임자: {{ OPERATOR }}<br />
        문의: <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
      </p>

      <h2>11. 변경</h2>
      <p>이 방침을 변경하는 경우 시행 7일 전부터 서비스 공지 또는 이 페이지를 통해 알립니다.</p>
    </article>
  </div>
</template>

<script setup>
const OPERATOR = '고성민'
const CONTACT_EMAIL = 'sungmin360@nate.com'
const EFFECTIVE_DATE = '2026년 11월 1일'
</script>

<style scoped>
.privacy-view {
  min-height: 100vh;
  min-height: 100dvh;
  overflow-y: auto;
  height: 100dvh;
  background: var(--surface-ground);
  color: var(--text-color);
  padding: calc(env(safe-area-inset-top) + 2rem) 1rem calc(env(safe-area-inset-bottom) + 3rem);
}

.privacy {
  max-width: 720px;
  margin: 0 auto;
  font-size: 0.9375rem;
  line-height: 1.75;
}

.back {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: var(--text-color-secondary);
  text-decoration: none;
  font-size: 0.875rem;
}

h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.meta {
  color: var(--text-color-secondary);
  font-size: 0.8125rem;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.0625rem;
  margin: 2rem 0 0.75rem;
}

p,
ul,
ol {
  margin-bottom: 0.75rem;
}

ul,
ol {
  padding-left: 1.25rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

th,
td {
  border: 1px solid var(--surface-border);
  padding: 0.5rem 0.625rem;
  text-align: left;
  vertical-align: top;
}

th {
  background: var(--surface-hover);
  font-weight: 600;
}

a {
  color: var(--text-color);
}

@media (max-width: 560px) {
  table {
    display: block;
    overflow-x: auto;
  }
}
</style>
