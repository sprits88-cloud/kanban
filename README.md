# 칸반 보드 (Kanban Board)

Material Design 기반의 드래그 앤 드롭 칸반보드 웹 애플리케이션

## 스크린샷

![Kanban Board](https://via.placeholder.com/800x400?text=Kanban+Board+Screenshot)

## 주요 기능

### 🎯 핵심 기능
- ✅ **3컬럼 칸반보드**: To-do, In-progress, Done
- ✅ **드래그 앤 드롭**: HTML5 Drag & Drop API를 사용한 직관적인 카드 이동
- ✅ **카드 관리**: 카드 생성, 삭제, 실시간 카드 개수 표시
- ✅ **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- ✅ **Material Design**: 일관된 디자인 시스템 적용
- ✅ **다크 모드**: 시스템 설정에 따른 자동 테마 전환
- ✅ **접근성**: 키보드 네비게이션, 포커스 스타일, Motion Reduction 지원
- ✅ **XSS 방어**: 사용자 입력 이스케이프 처리

### 🔐 인증 기능 (NEW)
- ✅ **이메일/비밀번호 인증**: 이메일 확인 기능 포함
- ✅ **Google OAuth**: Google 계정으로 간편 로그인
- ✅ **GitHub OAuth**: GitHub 계정으로 간편 로그인
- ✅ **세션 관리**: 자동 로그인 유지
- ✅ **로그아웃**: 안전한 세션 종료

## 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, CSS Variables, Media Queries
- **JavaScript (ES6+)**: Vanilla JS, HTML5 Drag & Drop API
- **Fonts**: Google Fonts (Roboto), Material Icons

### Backend & Authentication
- **BaaS**: Supabase (Backend as a Service)
- **인증**: Supabase Auth
  - 이메일/비밀번호 인증 (이메일 확인)
  - Google OAuth 2.0
  - GitHub OAuth

### Design System
- **Material Design 3**: 색상, 타이포그래피, 그림자, 간격 시스템
- **반응형 Breakpoints**: 
  - Mobile: < 600px
  - Tablet: 600px - 959px
  - Desktop: ≥ 960px

## 라이브 데모

🚀 **프로덕션**: [칸반보드 바로가기](https://sprits88-cloud.github.io/kanban/auth.html)

## 시작하기

### 요구사항
- 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 로컬 서버 (로컬 개발 시)
- Supabase 계정 (필수)

### 1. Supabase 설정 (필수)

**📖 자세한 설정 가이드**: [SETUP_GUIDE.md](SETUP_GUIDE.md) 파일을 참조하세요.

인증 및 데이터베이스 기능을 사용하려면 Supabase 설정이 필요합니다.

#### 빠른 시작:

1. ✅ **Supabase 설정 완료됨**
   - Project URL: `https://tmnchzyvehzctzlethcw.supabase.co`
   - `config.js`에 이미 반영됨

2. **데이터베이스 테이블 생성**
   - Supabase SQL Editor에서 `setup.sql` 실행
   - boards, cards 테이블 및 RLS 정책 생성

3. **Authentication 활성화**
   - Email/Password 인증 (기본 활성화)
   - Google/GitHub OAuth (선택사항)

📖 **자세한 단계**: [SETUP_GUIDE.md](SETUP_GUIDE.md) 참조

### 2. 애플리케이션 실행

#### 옵션 1: 프로덕션 (GitHub Pages)
```
https://sprits88-cloud.github.io/kanban/auth.html
```

#### 옵션 2: 로컬 서버 (개발용)

**방법 1: Python 3 내장 서버**
```bash
python3 -m http.server 8000

# 브라우저에서 접속
# http://localhost:8000/auth.html
```

**방법 2: VS Code Live Server**
1. VS Code에서 프로젝트 열기
2. Live Server 확장 설치
3. `auth.html`에서 우클릭 → "Open with Live Server"

## 사용 방법

### 1. 회원가입 및 로그인
1. `auth.html` 페이지 접속
2. **회원가입 탭**에서:
   - 이메일/비밀번호로 회원가입, 또는
   - Google/GitHub 계정으로 가입
3. 이메일 인증 (이메일/비밀번호 가입 시)
4. **로그인 탭**에서 로그인

### 2. 카드 추가
- 입력 필드에 작업 내용 입력
- "카드 추가" 버튼 클릭 또는 Enter 키
- 새 카드가 To-do 컬럼에 추가됩니다

### 3. 카드 이동
- 카드를 클릭하고 드래그
- 원하는 컬럼(To-do, In-progress, Done)으로 드롭
- 카드 개수가 자동으로 업데이트됩니다

### 4. 카드 삭제
- 카드에 마우스 호버
- 오른쪽 상단의 × 버튼 클릭
- 확인 다이얼로그에서 "확인" 선택

### 5. 로그아웃
- 우측 상단의 로그아웃 버튼 클릭

### 6. 키보드 단축키
- `Tab`: 다음 요소로 이동
- `Shift + Tab`: 이전 요소로 이동
- `Enter`: 버튼 클릭 / 카드 추가

## 프로젝트 구조

```
kanban/
├── index.html          # 메인 칸반보드 페이지
├── auth.html           # 로그인/회원가입 페이지 ✅
├── style.css           # 메인 스타일시트 (Material Design)
├── auth.css            # 인증 페이지 스타일 ✅
├── script.js           # 칸반보드 로직
├── auth.js             # 인증 로직 ✅
├── config.js           # Supabase 설정 ✅
├── setup.sql           # 데이터베이스 스키마 ✅
├── test.html           # 스크립트 로드 진단 페이지 ✅
├── SETUP_GUIDE.md      # Supabase 설정 가이드 ✅
├── DEPLOYMENT.md       # GitHub Pages 배포 가이드 ✅
├── TROUBLESHOOTING.md  # 문제 해결 가이드 ✅
├── WORKFLOW.md         # 개발 히스토리 ✅
├── AUTH_SETUP.md       # 인증 설정 가이드 ✅
├── README.md           # 프로젝트 소개 (본 문서)
├── CLAUDE.md           # Claude Code 가이드
├── plan.md             # 구현 계획
├── PRD.md              # 제품 요구사항 문서
├── TRD.md              # 기술 요구사항 문서
├── USER_FLOW.md        # 사용자 플로우
├── DATABASE_DESIGN.md  # 데이터베이스 설계
├── DESIGN_SYSTEM.md    # 디자인 시스템 가이드
└── TASKS.md            # 구현 작업 목록
```

## 브라우저 지원

| Browser | Version |
|---------|---------|
| Chrome  | ≥ 90    |
| Firefox | ≥ 88    |
| Safari  | ≥ 14    |
| Edge    | ≥ 90    |

## 개발 로드맵

### Phase 1: 기본 칸반보드 ✅ (완료)
- 3컬럼 칸반보드 UI
- 드래그 앤 드롭 기능
- 카드 CRUD
- 반응형 디자인

### Phase 1.5: 사용자 인증 ✅ (완료)
- 이메일/비밀번호 회원가입 및 로그인
- 이메일 인증 기능
- Google OAuth 로그인
- GitHub OAuth 로그인
- 세션 관리 및 로그아웃

### Phase 2: 데이터 영속성 ✅ (완료)
- 데이터베이스 연동 (Supabase PostgreSQL)
- 카드 데이터 CRUD API
- 사용자별 보드 관리
- 실시간 데이터 동기화

### Phase 3: 고급 기능 (향후)
- 카드 상세 정보 (설명, 담당자, 마감일)
- 라벨 및 태그
- 다중 보드 지원
- 검색 및 필터

### Phase 4: 협업 기능 (향후)
- 실시간 협업 (Supabase Realtime)
- 팀원 관리
- 댓글 및 활동 로그
- 알림

## 기여하기

이 프로젝트는 학습 목적으로 제작되었습니다.

## 라이선스

MIT License

## 배포

GitHub Pages에 배포하려면:

📖 **자세한 가이드**: [DEPLOYMENT.md](DEPLOYMENT.md) 참조

### 빠른 배포 단계

1. **Supabase Redirect URLs 설정**
   ```
   https://sprits88-cloud.github.io/kanban/index.html
   https://sprits88-cloud.github.io/kanban/auth.html
   ```

2. **Git 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat(kanban): Deploy to GitHub Pages"
   git push origin main
   ```

3. **GitHub Settings > Pages**에서 활성화

4. **배포 확인**: Actions 탭에서 진행 상황 확인

## 문제 해결

자세한 문제 해결 가이드: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### 인증 오류
- `config.js`의 Supabase 설정 확인
- Supabase 대시보드에서 Redirect URLs 설정 확인
- [SETUP_GUIDE.md](SETUP_GUIDE.md) 가이드 참조

### 데이터베이스 오류
- `setup.sql`이 제대로 실행되었는지 확인
- RLS (Row Level Security) 정책 확인
- Supabase Table Editor에서 테이블 생성 확인

### OAuth 로그인 오류
- Google/GitHub OAuth 설정 확인
- Authorized redirect URIs 확인
- 브라우저 쿠키 차단 설정 확인

### 카드 CRUD 오류
- 브라우저 콘솔에서 에러 메시지 확인
- 로그인 상태 확인
- Network 탭에서 Supabase API 요청 확인

### JavaScript 오류
- 브라우저 캐시 삭제 (Ctrl + Shift + R)
- 개발자 도구 콘솔 확인
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 참조

## 문의

프로젝트 관련 문의사항은 이슈로 남겨주세요.

---

**제작**: 2026-06-18  
**Phase 1 완료**: 2026-06-18  
**Phase 1.5 완료**: 2026-06-18  
**Phase 2 완료**: 2026-06-18
