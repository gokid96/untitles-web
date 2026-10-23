# Google Play 등록 정보 (Untitles Android)

Play Console에 그대로 붙여넣을 수 있게 정리한 값입니다. `[ ]` 표시는 직접 채워야 하는 항목입니다.

## 0. 계정 만들 때 알아둘 것 (개인 계정)

- 등록비 US$25 (1회), 신분증으로 본인 인증
- **실제 Android 폰 인증**: Play Console 홈의 "Android 기기 액세스 확인" 작업. Android 10 이상 폰에 Play Console 앱을 깔고
  계정 소유자로 로그인해 "확인"을 누르면 1분 안에 끝납니다. 그 폰을 계속 가지고 있을 필요는 없습니다(가족·지인 폰 가능).
- **비공개 테스트**: 프로덕션 출시 전에 테스터 12명 이상이 14일 연속 참여해야 합니다. 테스터는 Android 폰과 Google 계정이 필요합니다.

## 1. 업로드 키 만들기 (Windows, 한 번만)

PowerShell에서 실행합니다. JDK에 들어 있는 `keytool`을 사용합니다.

```powershell
mkdir $HOME\keys -Force; cd $HOME\keys
keytool -genkeypair -v -keystore untitles-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

- 비밀번호를 정하고, 이름 등은 아무렇게나 입력해도 됩니다.
- **이 파일과 비밀번호는 저장소에 넣지 말고 따로 백업하세요.** (잃어버려도 Play Console에서 업로드 키 재설정은 가능)

GitHub Secrets에 넣을 base64 값 복사:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\keys\untitles-upload.jks")) | Set-Clipboard
```

## 2. GitHub Secrets (untitles-web 저장소 > Settings > Secrets and variables > Actions)

| 이름 | 값 |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | 위에서 복사한 값 |
| `ANDROID_KEYSTORE_PASSWORD` | 키스토어 비밀번호 |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | 키 비밀번호 (따로 안 정했으면 키스토어 비밀번호와 같음) |

## 3. AAB 만들기

GitHub > Actions > **Android** > Run workflow → 끝나면(약 5분) 실행 결과 페이지 아래 **Artifacts**에서
`untitles-android-번호`를 내려받아 압축을 풀면 `app-release.aab`가 나옵니다.

## 4. 앱 만들기

| 항목 | 값 |
|---|---|
| 앱 이름 | Untitles |
| 기본 언어 | 한국어 |
| 앱 또는 게임 | 앱 |
| 무료 또는 유료 | 무료 |
| 패키지 이름 | `net.untitles.app` (첫 AAB 업로드 시 고정) |

Play 앱 서명은 기본으로 켜져 있습니다(Google이 앱 서명 키를 관리하고, 우리가 만든 키는 업로드 키).

## 5. 앱 콘텐츠 (정책)

| 항목 | 답변 |
|---|---|
| 개인정보처리방침 | https://untitles.net/privacy |
| 앱 액세스 | 일부 기능 제한 → 데모 계정: 아이디 `[심사용 아이디]` / 비밀번호 `[심사용 비밀번호]` |
| 광고 | 광고 없음 |
| 콘텐츠 등급 | 카테고리 "기타(유틸리티·생산성)". 폭력·성적 내용 등 모두 없음. 사용자 간 콘텐츠 공유: **예**(초대한 워크스페이스 멤버와 노트 공유) |
| 타겟층 | 16~17세, 18세 이상 (만 14세 미만 가입 불가 정책과 일치, 아동 대상 아님) |
| 뉴스 앱 / 정부 앱 / 금융·건강 기능 | 아니요 |

### 데이터 보안 (Data safety)

- 데이터 수집: **예** / 데이터 공유(제3자): **아니요** (Cloudflare·Vercel은 서비스 제공업체로 처리 → 공유 아님)
- 전송 중 암호화: **예**
- 삭제 요청: **예** → 계정 삭제 URL `https://untitles.net/privacy#delete-account` (앱 안에서도 내 정보 > 회원 탈퇴)

| 데이터 유형 | 항목 | 필수/선택 | 목적 |
|---|---|---|---|
| 개인 정보 | 이메일 주소 | 선택 | 계정 관리 |
| 개인 정보 | 사용자 ID | 필수 | 앱 기능, 계정 관리 |
| 사진 및 동영상 | 사진 | 선택 | 앱 기능 (노트 첨부·프로필 이미지) |
| 앱 활동 | 기타 사용자 생성 콘텐츠 | 필수 | 앱 기능 (노트·폴더) |

모든 항목: 처리 방식 "수집됨", 일시적으로만 처리 아님, 사용자와 연결됨.

## 6. 기본 스토어 등록정보

**앱 이름 (30자)**: Untitles — 연결되는 노트

**간단한 설명 (80자)**: [[ 로 노트를 잇고 그래프로 한눈에 보는, 가장 단순한 메모 앱

**자세한 설명 (4000자)**: `store/app-store.md`의 "설명"과 같은 내용을 사용합니다.

**그래픽**

| 항목 | 파일 |
|---|---|
| 앱 아이콘 (512×512) | `store/google-play/icon-512.png` |
| 그래픽 이미지 (1024×500) | `store/google-play/feature-graphic.png` |
| 휴대전화 스크린샷 (1080×1920) | `store/screenshots/android-phone/` 4장 (순서대로) |

**카테고리**: 생산성 / **연락처 이메일**: sungmin360@nate.com / **웹사이트**: https://untitles.net

## 7. 비공개 테스트 → 프로덕션

1. 테스트 및 출시 > 테스트 > **비공개 테스트** > 트랙 만들기
2. 테스터: 이메일 목록 만들기(테스터 Google 계정 12개 이상)
3. 새 버전 만들기 > `app-release.aab` 업로드 > 출시 노트 입력 > 검토 후 출시
4. 테스터에게 **참여 링크**를 보내고, 각자 수락 후 Play 스토어에서 설치
5. **12명 이상이 14일 연속** 참여 유지 (중간에 줄면 기간이 처음부터 다시 시작)
6. 대시보드 > **프로덕션 액세스 신청** (테스트 내용 질문지 작성) → 승인 후 프로덕션 출시

새 버전을 올릴 때는 3번(AAB 만들기)부터 반복하면 됩니다. versionCode는 GitHub Actions 실행 번호로 자동 증가합니다.
