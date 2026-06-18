@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npx tsc --noEmit # 타입 검사 (빌드 전 확인용)
```

테스트 프레임워크는 설정되어 있지 않다.

## 환경변수

`.env.local`에 아래 키가 모두 필요하다.

```
# AI (없으면 AI API 라우트 전체 500)
GOOGLE_GENERATIVE_AI_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # 서버 전용 (관리자 API, 카카오 인증)

# 카카오 OAuth (없으면 카카오 로그인 불가)
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...         # 선택 (카카오 앱 설정에 따라)
```

## 아키텍처 개요

### AI 호출 계층

모든 AI 호출은 `src/lib/ai.ts`의 `callGemini()` 단일 함수를 통한다. 모델(`gemini-2.5-flash`)과 마크다운 코드블록 제거 로직이 여기에 집중되어 있어, 모델 교체나 파라미터 변경은 이 파일 하나만 수정하면 된다.

```
src/lib/ai.ts          ← callGemini() 공통 래퍼
src/lib/prompts.ts     ← 프롬프트 빌더 4개 (문제생성·채점·카운슬러·학습콘텐츠)
src/app/api/
  generate-problem/    ← POST: topicId + difficulty → Problem JSON
  evaluate-answer/     ← POST: problem + studentAnswer → isCorrect + feedback
  counselor/           ← POST: problem + attempt → LearningGuide JSON
  generate-content/    ← POST: topicId → LearningContent JSON (개념 설명)
```

**객관식 채점은 AI를 쓰지 않는다.** `evaluate-answer` 라우트에서 문자열 일치로 서버에서 직접 판단한다. AI 채점은 단답형·서술형에만 사용한다.

모든 프롬프트는 순수 JSON만 반환하도록 강제한다. `callGemini()`가 코드블록을 제거하고 반환하면 라우트에서 `JSON.parse()`한다.

### 커리큘럼 데이터

`src/lib/curriculum.ts`는 한국 중·고등 과학 커리큘럼 전체를 **정적 배열**로 보유한다 (DB 없음). 총 8개 학년·과목, 52개 단원(`Topic`).

- Topic ID 패턴: `m1-phy-01`(중1 물리), `m2-chem-01`(중2 화학), `hi-01`(통합과학), `hp1-01`(물리1), `hc1-01`(화학1), `hb1-01`(생명1), `he1-01`(지구1)
- `getTopicById(id)`, `getCurriculumByGrade(gradeLevel)`, `getAllTopics()` 유틸 함수 제공
- 단원을 추가하려면 해당 배열에 `Topic` 객체를 추가하기만 하면 된다.

### Supabase 계층

```
src/lib/supabase/
  client.ts   ← 브라우저 클라이언트 (createBrowserClient)
  server.ts   ← 서버 컴포넌트 / Route Handler 클라이언트 (createServerClient + cookies())
  admin.ts    ← Service Role 클라이언트 (서버 전용, 사용자 관리)
  db.ts       ← DB 쿼리 함수 (getProfile, updateProfile, loadAllProgress, upsertTopicProgress)
```

DB 테이블: `profiles` (학생 프로필), `topic_progress` (단원별 진도). `upsertTopicProgress`는 `(user_id, topic_id)` 복합 키로 upsert한다.

`SupabaseSync` 컴포넌트(`src/components/auth/SupabaseSync.tsx`)가 `layout.tsx`에 전역 배치되어, `onAuthStateChange` 이벤트를 구독하고 로그인 시 DB 데이터를 Zustand 스토어로 동기화한다.

### 인증 흐름 (Kakao + Supabase)

카카오는 Supabase 기본 OAuth provider가 아니므로 직접 구현한다:

```
/auth/kakao (GET)
  → 카카오 OAuth URL로 redirect, state 쿠키 설정

/auth/callback/kakao (GET)
  → 카카오 토큰 교환 → 프로필 조회
  → Supabase admin.createUser() (이미 존재하면 무시)
  → admin.generateLink(magiclink) → action_link 서버에서 직접 fetch
  → access_token/refresh_token 추출 → supabase.auth.setSession()
  → 세션 쿠키를 redirect 응답에 직접 부착
```

**일반 소셜 로그인** (`/auth/callback`)은 Supabase 기본 `exchangeCodeForSession()`을 쓴다.

### 미들웨어

`src/proxy.ts`가 미들웨어로 동작한다 (파일명이 `middleware.ts`가 아님). 세션 갱신 + 라우트 보호:

- 비로그인 → `/`, `/auth` 외 모든 경로를 `/auth?redirectTo=...`로 리다이렉트
- 미승인 사용자 (`app_metadata.is_approved !== true`) → `/pending` 으로 강제
- `app_metadata.role === 'admin'`이면 승인 없이도 전체 접근 가능

### 사용자 승인 시스템

신규 가입자는 `app_metadata.is_approved`가 없어 `/pending`에 머문다. 관리자(`role: admin`)가 `/admin` 페이지에서 `POST /api/admin/approve`를 호출해 `is_approved: true`로 변경한다. 관리자 계정은 Supabase 대시보드에서 `app_metadata`를 직접 수정해 생성한다.

### 상태 관리 (Zustand)

| 스토어 | 파일 | 영속성 |
|--------|------|--------|
| `useStudentStore` | `src/store/studentStore.ts` | localStorage(`smart-teacher-student`) |
| `useSessionStore` | `src/store/sessionStore.ts` | 메모리(세션 중에만) |

`studentStore`의 `masteryLevel`은 문제 풀이 시 자동 재계산된다 (기본 40% + 심화 35% + 응용 25% 가중치). 취약 단원은 mastery < 60이고 시도 횟수 ≥ 3인 단원이다.

### 문제풀이 세션 흐름

`PracticeSession` 컴포넌트(`src/components/problem/PracticeSession.tsx`)가 세션 전체를 관리한다. 내부 `phase` 상태로 3단계를 전환한다:

```
setup → (AI 문제 생성) → problem → (답변 제출 + AI 채점 + AI 카운슬러) → feedback
                                                                          ↓
                                                              (다음 문제) setup/problem
```

중복 문제 방지를 위해 최근 5개 문제 텍스트를 `excludeQuestions` 배열로 프롬프트에 전달한다.

### 타입 시스템

`src/types/index.ts`에 모든 핵심 타입과 UI 상수 맵(레이블·색상)이 함께 정의되어 있다. `any` 타입은 사용하지 않는다.

```typescript
// 난이도별 문제 유형 매핑 (generate-problem/route.ts)
basic    → multiple-choice | short-answer
advanced → multiple-choice | short-answer
applied  → short-answer | descriptive
```

## 주요 확장 포인트

- **커리큘럼 단원 추가**: `src/lib/curriculum.ts`의 해당 학년 배열에 `Topic` 객체 추가
- **AI 모델 변경**: `src/lib/ai.ts`의 `google('gemini-2.5-flash')` 부분만 교체
- **프롬프트 수정**: `src/lib/prompts.ts`의 빌더 함수 수정. AI 응답 JSON 구조를 변경하면 `src/types/index.ts`의 인터페이스도 함께 수정해야 한다.
- **새 페이지 추가**: `src/app/` 하위에 라우트 추가, 컴포넌트는 `src/components/` 분리
