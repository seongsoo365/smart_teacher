import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai';
import { buildProblemGenerationPrompt } from '@/lib/prompts';
import { getTopicById } from '@/lib/curriculum';
import type { Difficulty, Problem, ProblemType } from '@/types';

const PROBLEM_TYPES_BY_DIFFICULTY: Record<Difficulty, ProblemType[]> = {
  basic: ['multiple-choice', 'short-answer'],
  advanced: ['multiple-choice', 'short-answer'],
  applied: ['short-answer', 'descriptive'],
};

function pickProblemType(difficulty: Difficulty): ProblemType {
  const types = PROBLEM_TYPES_BY_DIFFICULTY[difficulty];
  return types[Math.floor(Math.random() * types.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      topicId: string;
      difficulty: Difficulty;
      excludeQuestions?: string[];
    };

    const { topicId, difficulty, excludeQuestions = [] } = body;

    const topic = getTopicById(topicId);
    if (!topic) {
      return NextResponse.json({ error: '단원을 찾을 수 없습니다.' }, { status: 404 });
    }

    const problemType = pickProblemType(difficulty);
    const prompt = buildProblemGenerationPrompt(topic, difficulty, problemType, excludeQuestions);

    const responseText = await callGemini(prompt);
    const parsed = JSON.parse(responseText) as Omit<Problem, 'id' | 'topicId' | 'difficulty'>;

    const problem: Problem = {
      id: `prob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topicId,
      difficulty,
      ...parsed,
    };

    return NextResponse.json(problem);
  } catch (err) {
    console.error('[generate-problem] 오류:', err);
    return NextResponse.json(
      { error: '문제 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
