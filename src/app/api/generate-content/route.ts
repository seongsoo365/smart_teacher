import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai';
import { buildLearningContentPrompt } from '@/lib/prompts';
import { getTopicById } from '@/lib/curriculum';
import type { LearningContent } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { topicId } = await req.json() as { topicId: string };

    const topic = getTopicById(topicId);
    if (!topic) {
      return NextResponse.json({ error: '단원을 찾을 수 없습니다.' }, { status: 404 });
    }

    const prompt = buildLearningContentPrompt(topic);
    const responseText = await callGemini(prompt);
    const parsed = JSON.parse(responseText) as Omit<LearningContent, 'topicId'>;

    const content: LearningContent = { topicId, ...parsed };
    return NextResponse.json(content);
  } catch (err) {
    console.error('[generate-content] 오류:', err);
    return NextResponse.json(
      { error: '학습 콘텐츠 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
