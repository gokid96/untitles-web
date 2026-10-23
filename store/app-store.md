# App Store 등록 정보 (Untitles iOS)

App Store Connect에 그대로 붙여넣을 수 있게 정리한 값입니다. `[ ]` 표시는 직접 채워야 하는 항목입니다.

## 기본 정보

| 항목 | 값 |
|---|---|
| 번들 ID | `net.untitles.app` |
| 앱 이름 (30자) | Untitles — 연결되는 노트 |
| 부제 (30자) | 생각을 잇는 가장 단순한 메모 |
| 기본 언어 | 한국어 |
| 카테고리 | 생산성 (보조: 유틸리티) |
| 가격 | 무료 |
| 지원 URL | https://untitles.net |
| 개인정보처리방침 URL | https://untitles.net/privacy |
| 저작권 | 2026 [운영자 이름] |

> 앱 이름이 이미 쓰이고 있다면 대안: `Untitles 노트`, `Untitles: 노트와 그래프`

## 프로모션 텍스트 (170자)

노트에 [[ 를 입력해 다른 노트를 바로 연결하세요. 그래프에서 생각이 어떻게 이어지는지 한눈에 볼 수 있습니다.

## 설명

Untitles는 생각을 정리하는 가장 단순한 노트 앱입니다.

군더더기 없는 화면에서 바로 쓰고, 노트끼리 연결해서 생각의 흐름을 따라가세요.

■ 노트 연결과 그래프
· 본문에 [[ 를 입력하면 다른 노트를 찾아 바로 링크할 수 있습니다.
· 이 노트를 링크한 노트(백링크)와 이 노트가 링크한 노트를 한눈에 확인합니다.
· 그래프 화면에서 노트들이 어떻게 이어져 있는지 볼 수 있습니다.

■ 편안한 글쓰기
· 제목, 목록, 체크리스트, 인용, 코드, 표, 이미지를 지원하는 에디터
· 입력하는 동안 자동 저장
· 다크 모드

■ 폴더와 워크스페이스
· 폴더로 노트를 정리하고 드래그로 옮길 수 있습니다.
· 팀 워크스페이스에 멤버를 초대해 함께 쓸 수 있습니다.
· 같은 노트를 동시에 고치면 충돌을 알려 다른 사람의 수정을 덮어쓰지 않습니다.

■ 공개 페이지
· 원하는 폴더와 노트만 골라 웹 페이지로 공개할 수 있습니다.

웹(untitles.net)과 앱에서 같은 계정으로 이용할 수 있습니다.

## 키워드 (100자, 쉼표로 구분, 공백 없이)

노트,메모,메모장,필기,기록,링크,백링크,그래프,세컨드브레인,지식관리,일기,체크리스트,생산성,할일

## 스크린샷 (iPhone 6.9형, 1290×2796)

`store/screenshots/iphone-6.9/` 의 4장을 순서대로 올립니다.
1. `1-editor.png` 글쓰기
2. `2-link.png` [[ 노트 링크
3. `3-graph.png` 그래프와 백링크
4. `4-list.png` 폴더와 노트 목록

앱을 아이폰 전용으로 설정해 두어 iPad 스크린샷은 필요 없습니다.

## 앱 개인정보 (App Privacy)

- 추적(Tracking): **아니요** (광고·추적 SDK 없음)
- 수집하는 데이터 (모두 "사용자와 연결됨", 목적은 "앱 기능")

| 데이터 유형 | 항목 | 비고 |
|---|---|---|
| 연락처 정보 | 이메일 주소 | 선택 입력 |
| 사용자 콘텐츠 | 사진 또는 비디오 | 노트에 첨부한 이미지, 프로필 이미지 |
| 사용자 콘텐츠 | 기타 사용자 콘텐츠 | 노트, 폴더 |
| 식별자 | 사용자 ID | 아이디 |

## 연령 등급

모든 질문 "없음"으로 답하면 4+ 입니다. 단, 사용자 생성 콘텐츠 관련 질문에는 아래처럼 답합니다.
- 공개 피드나 다른 사용자 검색·열람 기능 없음. 콘텐츠는 본인과 초대한 워크스페이스 멤버에게만 보이며, 웹 공개 페이지는 소유자가 직접 링크를 공유한 경우에만 열람 가능.

## 심사 메모 (App Review Information)

- 데모 계정: 아이디 `[심사용 아이디]` / 비밀번호 `[심사용 비밀번호]`
  - 출시 전에 운영 서버에서 이 계정을 만들고 샘플 노트 몇 개와 [[ 링크를 넣어 두세요.
- 메모:
  ```
  Untitles is a note-taking app. Notes can link to each other by typing "[[" in the editor,
  and the graph view (top-right icon in the side menu) shows how notes are connected.
  Account deletion: Side menu > tap your name > 내 정보 (My info) > 회원 탈퇴 (Delete account).
  The app uses its own ID/password sign-in only (no third-party login in the iOS app).
  ```
- 수출 규정(암호화): Info.plist에 `ITSAppUsesNonExemptEncryption = NO` 설정되어 있어 별도 질문 없음.

## 출시 절차 (계정 승인 후)

1. **번들 ID 등록**: developer.apple.com > Certificates, Identifiers & Profiles > Identifiers > `+` > App IDs > `net.untitles.app`
2. **앱 만들기**: App Store Connect > 앱 > `+` > 새로운 앱 (플랫폼 iOS, 번들 ID `net.untitles.app`, SKU `untitles-ios`)
3. **API 키**: App Store Connect > 사용자 및 액세스 > 통합 > App Store Connect API > 팀 키 생성 (액세스: **관리자**)
   - `.p8` 파일은 한 번만 내려받을 수 있습니다. Key ID, Issuer ID를 함께 적어 두세요.
   - 팀 ID: developer.apple.com > 멤버십 세부사항
4. **GitHub Secrets** (untitles-web 저장소 > Settings > Secrets and variables > Actions)
   - `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`(.p8 파일 내용 전체)
5. **빌드·업로드**: GitHub > Actions > iOS > Run workflow (업로드 체크) → 약 15분
6. **TestFlight**: App Store Connect에서 빌드 처리(10~30분) 후, 아이폰에 TestFlight 앱을 깔고 설치해 확인
7. **제출**: 위 등록 정보·스크린샷·개인정보·연령 등급 입력 → 빌드 선택 → 심사 제출
