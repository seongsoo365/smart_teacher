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

`.env.local`에 아래 키가 반드시 필요하다. 없으면 AI API 라우트 전체가 500 오류를 반환한다.

```
GOOGLE_GENERATIVE_AI_API_KEY=...
```

키 발급: https://aistudio.google.com/apikey

## 아키텍처 개요

### AI 호출 계층

모든 AI 호출은 `src/lib/ai.ts`의 `callGemini()` 단일 함수를 통한다. 모델(`gemini-2.5-flash`)과 마크다운 코드블록 제거 로직이 여기에 집중되어 있어, 모델 교체나 파라미터 변경은 이 파일 하나만 수정하면 된다.

```
src/lib/ai.ts          ← callGemini() 공통 래퍼
src/lib/prompts.ts     ← 프롬프트 빌더 3개 (문제생성·채점·카운슬러)
src/app/api/
  generate-problem/    ← POST: topicId + difficulty → Problem JSON
  evaluate-answer/     ← POST: problem + studentAnswer → isCorrect + feedback
  counselor/           ← POST: problem + attempt → LearningGuide JSON
```

**객관식 채점은 AI를 쓰지 않는다.** `evaluate-answer` 라우트에서 문자열 일치로 서버에서 직접 판단한다. AI 채점은 단답형·서술형에만 사용한다.

모든 프롬프트는 순수 JSON만 반환하도록 강제한다. `callGemini()`가 코드블록을 제거하고 반환하면 라우트에서 `JSON.parse()`한다.

### 커리큘럼 데이터

`src/lib/curriculum.ts`는 한국 중·고등 과학 커리큘럼 전체를 **정적 배열**로 보유한다 (DB 없음). 총 8개 학년·과목, 52개 단원(`Topic`).

- Topic ID 패턴: `m1-phy-01`(중1 물리), `m2-chem-01`(중2 화학), `hi-01`(통합과학), `hp1-01`(물리1), `hc1-01`(화학1), `hb1-01`(생명1), `he1-01`(지구1)
- `getTopicById(id)`, `getCurriculumByGrade(gradeLevel)`, `getAllTopics()` 유틸 함수 제공
- 단원을 추가하려면 해당 배열에 `Topic` 객체를 추가하기만 하면 된다.

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
