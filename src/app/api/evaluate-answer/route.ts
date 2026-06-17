import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai';
import { buildEvaluationPrompt } from '@/lib/prompts';
import type { Problem } from '@/types';

interface EvaluateRequest {
  problem: Problem;
  studentAnswer: string;
}

interface EvaluateResult {
  isCorrect: boolean;
  feedback: string;
}

export async function POST(req: NextRequest) {
  try {
    const { problem, studentAnswer } = await req.json() as EvaluateRequest;

    // 객관식은 서버에서 직접 판단
    if (problem.type === 'multiple-choice') {
      const isCorrect =
        studentAnswer.trim() === problem.correctAnswer.trim();
      return NextResponse.json({
        isCorrect,
        feedback: isCorrect
          ? '정확합니다! 정답을 맞혔습니다.'
          : `아쉽습니다. 정답은 ${problem.correctAnswer}번이었습니다.`,
      } satisfies EvaluateResult);
    }

    const prompt = buildEvaluationPrompt(
      problem.question,
      problem.correctAnswer,
      studentAnswer,
      problem.explanation,
      problem.type
    );

    const responseText = await callGemini(prompt);
    const result = JSON.parse(responseText) as EvaluateResult;

    return NextResponse.json(result);
  } catch (err) {
    console.error('[evaluate-answer] 오류:', err);
    return NextResponse.json(
      { error: '채점 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
