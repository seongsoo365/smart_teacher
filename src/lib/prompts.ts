import type { Difficulty, Topic, ProblemType } from '@/types';

export function buildLearningContentPrompt(topic: Topic): string {
  return `당신은 한국 중·고등학교 과학 교육 전문가입니다.
아래 단원의 학습 콘텐츠를 학생이 쉽게 이해할 수 있도록 생성해주세요.
문제 풀기 전 개념을 충분히 익힐 수 있는 수준으로 작성하세요.

[단원 정보]
- 학년: ${topic.gradeLevel}
- 과목 분야: ${topic.domain}
- 대단원: ${topic.unit}
- 소단원: ${topic.subUnit}
- 핵심 개념: ${topic.concepts.join(', ')}
- 키워드: ${topic.keywords.join(', ')}

[작성 지침]
- 교과서 수준의 정확한 내용을 학생 친화적 언어로 설명
- 실생활 예시를 반드시 포함
- 공식·법칙은 명확하게 표기 (없으면 null)
- 자주 틀리는 오개념을 짚어줄 것

[출력 형식] 반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이 순수 JSON):
{
  "summary": "단원 전체를 한 문장으로 요약",
  "introduction": "이 단원에서 배울 내용 도입 설명 (2~3문장, 흥미 유발)",
  "concepts": [
    {
      "name": "개념명",
      "explanation": "쉽고 명확한 개념 설명 (4~6문장, 교과서 수준)",
      "formula": "핵심 공식 또는 법칙 문자열 (없으면 null)",
      "examples": ["실생활 예시1", "실생활 예시2"]
    }
  ],
  "keyPoints": [
    "꼭 기억해야 할 핵심 포인트 (3~5개, 짧고 명확하게)"
  ],
  "commonMistakes": [
    "학생들이 자주 하는 실수 또는 오개념 (2~3개)"
  ]
}`;
}

const DIFFICULTY_GUIDE: Record<Difficulty, string> = {
  basic: `[기본 난이도]
- 목표: 핵심 개념과 용어의 정확한 이해 확인
- 유형: 개념 정의, 공식 적용, 단순 계산, 참/거짓 판단
- 수준: 교과서 개념을 그대로 적용할 수 있는 수준`,

  advanced: `[심화 난이도]
- 목표: 개념 간의 연결고리 이해 및 다단계 사고
- 유형: 다단계 계산, 그래프·도표 분석, 개념 비교, 원인-결과 분석
- 수준: 개념을 응용하여 비교·분석할 수 있는 수준`,

  applied: `[응용 난이도]
- 목표: 실생활 연계 문제 해결 및 창의적 융합 사고
- 유형: 실험 설계, 사회·환경과의 연결, 융합 문제, 서술·논술
- 수준: 새로운 상황에 개념을 창의적으로 적용하는 수준`,
};

export function buildProblemGenerationPrompt(
  topic: Topic,
  difficulty: Difficulty,
  problemType: ProblemType,
  excludeQuestions: string[] = []
): string {
  const excludeSection =
    excludeQuestions.length > 0
      ? `\n\n[제외할 문제 (중복 방지)]\n${excludeQuestions.slice(-3).map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

  return `당신은 한국 중·고등학교 과학 교육 전문가입니다.
아래 단원 정보와 난이도 기준에 맞는 과학 문제를 정확하게 1개 생성해주세요.

[단원 정보]
- 학년: ${topic.gradeLevel}
- 과목 분야: ${topic.domain}
- 대단원: ${topic.unit}
- 소단원: ${topic.subUnit}
- 핵심 개념: ${topic.concepts.join(', ')}
- 키워드: ${topic.keywords.join(', ')}

${DIFFICULTY_GUIDE[difficulty]}

[문제 유형]: ${problemType === 'multiple-choice' ? '5지선다형 객관식' : problemType === 'short-answer' ? '단답형' : '서술형'}${excludeSection}

[출력 형식] 반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이 순수 JSON):
{
  "question": "문제 내용 (구체적이고 명확하게)",
  "type": "${problemType}",
  "choices": ${problemType === 'multiple-choice' ? '[{"id":"1","text":"..."},{"id":"2","text":"..."},{"id":"3","text":"..."},{"id":"4","text":"..."},{"id":"5","text":"..."}]' : 'null'},
  "correctAnswer": "${problemType === 'multiple-choice' ? '정답 선택지 번호(1~5)' : '정답 텍스트'}",
  "explanation": "단계별 상세 해설 (300자 이상, 오개념 방지 설명 포함)",
  "concepts": ["관련 핵심 개념1", "관련 핵심 개념2"],
  "hints": ["1단계 힌트", "2단계 힌트", "3단계 힌트"]
}`;
}

export function buildEvaluationPrompt(
  question: string,
  correctAnswer: string,
  studentAnswer: string,
  explanation: string,
  problemType: ProblemType
): string {
  return `당신은 한국 중·고등학교 과학 교사입니다.
학생의 답변을 평가하고 학습 피드백을 제공해주세요.

[문제]: ${question}
[모범 답안]: ${correctAnswer}
[해설]: ${explanation}
[학생 답변]: ${studentAnswer}
[문제 유형]: ${problemType}

[평가 기준]
- 객관식: 정확히 일치해야 정답
- 단답형: 핵심 키워드 포함 여부 확인 (띄어쓰기·조사는 무시)
- 서술형: 핵심 개념 포함도와 논리적 구조 평가 (부분점수 없음, 70% 이상 충족 시 정답 처리)

[출력 형식] 반드시 아래 JSON 형식으로만 응답하세요:
{
  "isCorrect": true 또는 false,
  "feedback": "학생 답변에 대한 구체적인 평가 (정답이면 잘한 점 칭찬, 오답이면 어떤 부분이 틀렸는지 정확히 설명)"
}`;
}

export function buildCounselorPrompt(
  question: string,
  studentAnswer: string,
  correctAnswer: string,
  isCorrect: boolean,
  explanation: string,
  topicInfo: {
    unit: string;
    subUnit: string;
    concepts: string[];
    keywords: string[];
  },
  difficulty: Difficulty,
  recentHistory: Array<{ isCorrect: boolean; difficulty: Difficulty }>
): string {
  const historyText =
    recentHistory.length > 0
      ? `\n[최근 학습 이력 (최신순)]\n${recentHistory
          .slice(-5)
          .map(
            (h, i) =>
              `${i + 1}. ${h.difficulty === 'basic' ? '기본' : h.difficulty === 'advanced' ? '심화' : '응용'} - ${h.isCorrect ? '정답' : '오답'}`
          )
          .join('\n')}`
      : '';

  return `당신은 학생 1인 전담 과학 학습 카운슬러입니다.
학생의 문제풀이 결과를 분석하고 맞춤형 학습 가이드를 제공해주세요.

[단원]: ${topicInfo.unit} > ${topicInfo.subUnit}
[핵심 개념]: ${topicInfo.concepts.join(', ')}
[난이도]: ${difficulty === 'basic' ? '기본' : difficulty === 'advanced' ? '심화' : '응용'}
[결과]: ${isCorrect ? '✅ 정답' : '❌ 오답'}

[문제]: ${question}
[모범 답안]: ${correctAnswer}
[학생 답변]: ${studentAnswer}
[해설]: ${explanation}${historyText}

[카운슬러 역할]
1. 학생의 이해 상태를 정확히 진단
2. 오답이라면 구체적인 오개념 파악
3. 다음 학습 방향을 단계적으로 안내
4. 성장을 위한 진심 어린 격려

[출력 형식] 반드시 아래 JSON 형식으로만 응답하세요:
{
  "conceptAnalysis": "현재 개념 이해도 분석 (2~3문장, 구체적으로)",
  "mistakePattern": ${isCorrect ? 'null' : '"오답 패턴 또는 오개념 설명 (2~3문장)"'},
  "reinforcement": "강화해야 할 학습 포인트 (핵심 1가지)",
  "nextSteps": ["다음 학습 단계 1", "다음 학습 단계 2", "다음 학습 단계 3"],
  "relatedTopics": ["연관 학습 키워드1", "연관 학습 키워드2"],
  "studyTips": ["학습 팁 1", "학습 팁 2"],
  "encouragement": "개인화된 격려 메시지 (1~2문장, 진심을 담아)"
}`;
}
