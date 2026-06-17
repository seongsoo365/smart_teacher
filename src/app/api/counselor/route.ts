import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai';
import { buildCounselorPrompt } from '@/lib/prompts';
import { getTopicById } from '@/lib/curriculum';
import type { Problem, Attempt, LearningGuide } from '@/types';

interface CounselorRequest {
  problem: Problem;
  attempt: Attempt;
  recentHistory: Array<{ isCorrect: boolean; difficulty: 'basic' | 'advanced' | 'applied' }>;
}

export async function POST(req: NextRequest) {
  try {
    const { problem, attempt, recentHistory } = await req.json() as CounselorRequest;

    const topic = getTopicById(problem.topicId);
    if (!topic) {
      return NextResponse.json({ error: '단원 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const prompt = buildCounselorPrompt(
      problem.question,
      attempt.studentAnswer,
      problem.correctAnswer,
      attempt.isCorrect,
      problem.explanation,
      {
        unit: topic.unit,
        subUnit: topic.subUnit,
        concepts: topic.concepts,
        keywords: topic.keywords,
      },
      problem.difficulty,
      recentHistory
    );

    const responseText = await callGemini(prompt);
    const parsed = JSON.parse(responseText) as Omit<LearningGuide, 'problemId' | 'isCorrect'>;

    const guide: LearningGuide = {
      problemId: problem.id,
      isCorrect: attempt.isCorrect,
      ...parsed,
    };

    return NextResponse.json(guide);
  } catch (err) {
    console.error('[counselor] 오류:', err);
    return NextResponse.json(
      { error: '학습 가이드 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
