// 학교급
export type SchoolLevel = 'middle' | 'high';

// 학년
export type GradeLevel =
  | 'middle-1' | 'middle-2' | 'middle-3'
  | 'high-integrated' | 'high-physics1' | 'high-physics2'
  | 'high-chemistry1' | 'high-chemistry2'
  | 'high-biology1' | 'high-biology2'
  | 'high-earth1' | 'high-earth2';

// 과학 분야
export type ScienceDomain = 'physics' | 'chemistry' | 'biology' | 'earth' | 'integrated';

// 문제 난이도
export type Difficulty = 'basic' | 'advanced' | 'applied';

// 문제 유형
export type ProblemType = 'multiple-choice' | 'short-answer' | 'descriptive';

// 커리큘럼 단원
export interface Topic {
  id: string;
  gradeLevel: GradeLevel;
  domain: ScienceDomain;
  unit: string;          // 대단원
  subUnit: string;       // 소단원
  concepts: string[];    // 핵심 개념 목록
  keywords: string[];    // 주요 키워드
  prerequisites: string[]; // 선수학습 단원 id
}

// 커리큘럼 단원 그룹 (학년별)
export interface CurriculumGrade {
  gradeLevel: GradeLevel;
  schoolLevel: SchoolLevel;
  label: string;
  description: string;
  topics: Topic[];
}

// 문제 선택지 (객관식)
export interface Choice {
  id: string;
  text: string;
}

// 생성된 문제
export interface Problem {
  id: string;
  topicId: string;
  difficulty: Difficulty;
  type: ProblemType;
  question: string;
  choices?: Choice[];       // 객관식일 경우
  correctAnswer: string;    // 정답 (객관식: 선택지 id, 나머지: 텍스트)
  explanation: string;      // 해설
  concepts: string[];       // 관련 개념
  hints: string[];          // 단계별 힌트
}

// 학습 콘텐츠 개념 설명
export interface ConceptExplanation {
  name: string;
  explanation: string;
  formula: string | null;   // 공식·법칙 (없으면 null)
  examples: string[];       // 실생활 예시
}

// AI 생성 학습 콘텐츠
export interface LearningContent {
  topicId: string;
  summary: string;              // 단원 한 줄 요약
  introduction: string;         // 도입 설명
  concepts: ConceptExplanation[]; // 핵심 개념별 설명
  keyPoints: string[];          // 꼭 기억할 포인트
  commonMistakes: string[];     // 자주 하는 실수
}

// 학생 답변 시도
export interface Attempt {
  problemId: string;
  studentAnswer: string;
  isCorrect: boolean;
  submittedAt: Date;
  timeSpent: number; // 초 단위
}

// AI 카운슬러 학습 가이드
export interface LearningGuide {
  problemId: string;
  isCorrect: boolean;
  conceptAnalysis: string;   // 개념 이해도 분석
  mistakePattern?: string;   // 오답 패턴 (오답 시)
  reinforcement: string;     // 강화 학습 포인트
  nextSteps: string[];       // 다음 학습 추천 단계
  relatedTopics: string[];   // 연관 단원 id
  studyTips: string[];       // 학습 팁
  encouragement: string;     // 격려 메시지
}

// 단원별 학습 진도
export interface TopicProgress {
  topicId: string;
  basicAttempts: number;
  basicCorrect: number;
  advancedAttempts: number;
  advancedCorrect: number;
  appliedAttempts: number;
  appliedCorrect: number;
  lastStudied: Date | null;
  masteryLevel: number; // 0~100
}

// 학생 프로필
export interface StudentProfile {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
  gradeLevel: GradeLevel;
  totalProblems: number;
  totalCorrect: number;
  streakDays: number;
  lastStudied: Date | null;
}

// 학습 세션 (현재 진행 중인 문제풀이)
export interface StudySession {
  topicId: string;
  difficulty: Difficulty;
  currentProblem: Problem | null;
  currentGuide: LearningGuide | null;
  isLoading: boolean;
  isEvaluating: boolean;
  sessionHistory: Array<{
    problem: Problem;
    attempt: Attempt;
    guide: LearningGuide;
  }>;
}

// 난이도 레이블 맵
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: '기본',
  advanced: '심화',
  applied: '응용',
};

// 난이도 색상 맵
export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  basic: 'bg-green-100 text-green-800 border-green-200',
  advanced: 'bg-blue-100 text-blue-800 border-blue-200',
  applied: 'bg-purple-100 text-purple-800 border-purple-200',
};

// 도메인 레이블 맵
export const DOMAIN_LABELS: Record<ScienceDomain, string> = {
  physics: '물리',
  chemistry: '화학',
  biology: '생물',
  earth: '지구과학',
  integrated: '통합과학',
};

// 도메인 색상 맵
export const DOMAIN_COLORS: Record<ScienceDomain, string> = {
  physics: 'bg-orange-50 border-orange-200',
  chemistry: 'bg-blue-50 border-blue-200',
  biology: 'bg-green-50 border-green-200',
  earth: 'bg-amber-50 border-amber-200',
  integrated: 'bg-purple-50 border-purple-200',
};

export const DOMAIN_ICON_COLORS: Record<ScienceDomain, string> = {
  physics: 'text-orange-600',
  chemistry: 'text-blue-600',
  biology: 'text-green-600',
  earth: 'text-amber-600',
  integrated: 'text-purple-600',
};
