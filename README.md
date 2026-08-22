# 하루의 선택

특수교육 대상 학생이 일상 및 돌발 상황에서 적절한 행동을 연습하는 반응형 웹게임입니다. 교사는 학생 특성에 맞는 시나리오를 만들고 링크로 공유할 수 있습니다.

## 기술 스택

- Next.js App Router: 페이지와 서버 기능을 구성합니다.
- Tailwind CSS: 큰 버튼, 고대비, 반응형 화면을 빠르게 만듭니다.
- Supabase: 교사 로그인, PostgreSQL 데이터베이스, RLS 권한을 담당합니다.
- Vercel: 완성된 Next.js 앱을 웹에 배포합니다.
- Web Speech API: 브라우저의 음성 읽기 기능을 사용합니다.

## 로컬 실행

1. [Node.js LTS](https://nodejs.org/)를 설치합니다.
2. `.env.example`을 복사해 `.env.local`을 만듭니다.
3. Supabase 프로젝트의 URL과 anon key를 `.env.local`에 입력합니다.
4. 패키지를 설치하고 개발 서버를 실행합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## Supabase 설정

Supabase SQL Editor에서 `supabase/migrations` 폴더의 SQL 파일을 파일명 순서대로 실행합니다. 첫 파일은 `profiles`, `scenarios`, `steps`, `choices` 테이블과 RLS(Row Level Security, 행마다 접근 권한을 검사하는 보안 규칙)를 만들고, 이후 파일은 기존 데이터를 보존하면서 구조를 개선합니다.

현재 공개 시나리오는 로그인 없이 읽을 수 있고, 비공개 시나리오의 작성·수정·삭제는 작성한 교사에게만 허용됩니다.

## 개발 로드맵

- [x] Next.js + Tailwind 기본 화면
- [x] Supabase 브라우저/서버 클라이언트
- [x] 이메일 로그인 UI
- [x] 이메일 회원가입 및 로그아웃
- [x] 비밀번호 확인 및 이메일 인증 결과 화면
- [x] Supabase 기본 이메일 템플릿용 인증 콜백
- [x] 중복 이메일 가입 안내
- [x] 아이디 안내 및 비밀번호 재설정
- [x] 다른 브라우저에서도 작동하는 비밀번호 복구 링크
- [x] 세션 유지와 교사 전용 대시보드 보호
- [x] 초기 DB 및 RLS 설계
- [ ] Google 로그인
- [ ] 교사 대시보드와 시나리오 편집기
- [x] 교사 시나리오 목록 및 기본 정보 생성
- [x] 고정 모드를 활용 대상·복수 태그 구조로 개선
- [ ] 동적 학생 플레이 엔진과 TTS
- [ ] 공유 URL과 QR 코드
- [ ] 접근성 테스트 및 Vercel 배포

## Git 작업 방식

기능마다 `feat/auth`, `feat/scenario-editor` 같은 브랜치를 만들고 Pull Request로 `main`에 합치는 방식을 권장합니다. 커밋 메시지는 `feat: add teacher login form`처럼 Conventional Commits 형식을 사용합니다.
