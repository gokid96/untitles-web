<template>
  <div class="terms-view">
    <article class="terms">
      <router-link to="/" class="back">← Untitles</router-link>
      <h1>이용약관</h1>
      <p class="meta">시행일: {{ EFFECTIVE_DATE }}</p>

      <h2>제1조 (목적)</h2>
      <p>
        이 약관은 {{ OPERATOR }}(이하 "운영자")이 제공하는 Untitles 서비스(웹사이트 untitles.net 및 Android·iOS 앱,
        이하 "서비스")의 이용 조건과 절차, 운영자와 이용자의 권리·의무를 정합니다.
      </p>

      <h2>제2조 (용어)</h2>
      <ul>
        <li>"이용자"는 이 약관에 따라 서비스를 이용하는 회원과 비회원을 말합니다.</li>
        <li>"회원"은 이메일 또는 소셜 계정(Apple·Google·카카오)으로 가입한 이용자를 말합니다.</li>
        <li>"콘텐츠"는 회원이 서비스에 작성·업로드한 노트, 폴더, 이미지 등을 말합니다.</li>
        <li>"워크스페이스"는 노트와 폴더를 담는 공간이며, 여러 회원이 함께 쓰는 팀 워크스페이스를 포함합니다.</li>
      </ul>

      <h2>제3조 (약관의 효력과 변경)</h2>
      <ul>
        <li>이 약관은 서비스 화면에 게시하며, 회원가입 또는 로그인을 계속하면 약관에 동의한 것으로 봅니다.</li>
        <li>
          운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행 7일 전(회원에게 불리한
          변경은 30일 전)부터 서비스 공지 또는 이 페이지로 알립니다.
        </li>
        <li>변경된 약관에 동의하지 않는 회원은 탈퇴할 수 있으며, 시행일 이후 계속 이용하면 동의한 것으로 봅니다.</li>
      </ul>

      <h2>제4조 (회원가입과 계정)</h2>
      <ul>
        <li>만 14세 미만은 회원가입을 할 수 없습니다.</li>
        <li>회원은 자신의 계정과 비밀번호를 안전하게 관리해야 하며, 타인에게 양도하거나 빌려줄 수 없습니다.</li>
        <li>다른 사람의 이메일이나 정보를 도용해 가입하거나 계정을 만들어서는 안 됩니다.</li>
        <li>회원은 언제든지 내 정보 화면에서 탈퇴할 수 있습니다.</li>
      </ul>

      <h2>제5조 (서비스의 제공과 변경)</h2>
      <ul>
        <li>서비스는 노트 작성·저장, 폴더 정리, 노트 연결, 워크스페이스 공유·초대, 웹 공개 등의 기능을 무료로 제공합니다.</li>
        <li>
          운영자는 서비스 개선이나 운영상 필요에 따라 기능, 이용 한도(워크스페이스·멤버·노트 수 등)를 변경할 수 있으며,
          중요한 변경은 사전에 알립니다.
        </li>
        <li>설비 점검, 장애, 천재지변 등 부득이한 경우 서비스가 일시 중단될 수 있습니다.</li>
      </ul>

      <h2>제6조 (콘텐츠의 권리와 책임)</h2>
      <ul>
        <li>회원이 작성한 콘텐츠의 권리는 회원에게 있으며, 그 내용에 대한 책임도 회원에게 있습니다.</li>
        <li>
          운영자는 서비스 제공(저장, 백업, 화면 표시, 회원이 공개로 설정한 내용의 게시)에 필요한 범위에서만 콘텐츠를
          이용하며, 다른 목적으로 사용하지 않습니다.
        </li>
        <li>회원이 공개로 설정한 노트·워크스페이스는 누구나 볼 수 있으므로, 공개 전에 내용을 확인해야 합니다.</li>
        <li>
          팀 워크스페이스에 작성한 콘텐츠는 그 워크스페이스의 내용으로 남으며, 탈퇴하거나 워크스페이스를 나가도
          다른 멤버가 계속 볼 수 있습니다.
        </li>
      </ul>

      <h2>제7조 (금지 행위)</h2>
      <p>이용자는 다음 행위를 해서는 안 되며, 위반 시 운영자는 해당 콘텐츠를 비공개 처리하거나 이용을 제한할 수 있습니다.</p>
      <ul>
        <li>법령에 위반되거나 타인의 권리(저작권, 초상권, 개인정보 등)를 침해하는 콘텐츠의 작성·공개</li>
        <li>음란물, 불법 정보, 악성 코드, 스팸 등의 게시 또는 유포</li>
        <li>타인을 사칭하거나, 원하지 않는 사람에게 초대를 반복해 보내는 등 다른 이용자를 괴롭히는 행위</li>
        <li>서비스의 정상 운영을 방해하거나, 허용되지 않은 방법으로 시스템에 접근·데이터를 수집하는 행위</li>
      </ul>

      <h2>제8조 (이용 제한과 계정 해지)</h2>
      <p>
        운영자는 이용자가 제7조를 위반한 경우 사전 통지 후(긴급한 경우 사후 통지) 서비스 이용을 제한하거나 계정을 해지할 수
        있습니다. 이용자는 이에 대해 아래 문의처로 이의를 제기할 수 있습니다.
      </p>

      <h2>제9조 (책임의 한계)</h2>
      <ul>
        <li>서비스는 무료로 제공되며, 운영자는 고의 또는 중대한 과실이 없는 한 서비스 이용으로 발생한 손해에 책임지지 않습니다.</li>
        <li>운영자는 데이터를 안전하게 보관하기 위해 노력하지만, 중요한 내용은 이용자도 별도로 보관할 것을 권장합니다.</li>
        <li>이용자 간 또는 이용자와 제3자 간에 콘텐츠로 발생한 분쟁에 운영자는 개입할 의무가 없습니다.</li>
      </ul>

      <h2>제10조 (개인정보 보호)</h2>
      <p>개인정보의 처리는 <router-link to="/privacy">개인정보처리방침</router-link>에 따릅니다.</p>

      <h2>제11조 (준거법과 분쟁 해결)</h2>
      <p>이 약관은 대한민국 법률에 따르며, 분쟁이 생기면 민사소송법상의 관할 법원에서 해결합니다.</p>

      <h2>문의</h2>
      <p>
        운영자: {{ OPERATOR }}<br />
        문의: <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
      </p>
    </article>
  </div>
</template>

<script setup>
const OPERATOR = '고성민'
const CONTACT_EMAIL = 'sungmin360@nate.com'
const EFFECTIVE_DATE = '2026년 11월 1일'
</script>

<style scoped>
.terms-view {
  min-height: 100vh;
  min-height: 100dvh;
  overflow-y: auto;
  height: 100dvh;
  background: var(--surface-ground);
  color: var(--text-color);
  padding: calc(env(safe-area-inset-top) + 2rem) 1rem calc(env(safe-area-inset-bottom) + 3rem);
}

.terms {
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
