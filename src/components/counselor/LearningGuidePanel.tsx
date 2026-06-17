'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { LearningGuide, Problem } from '@/types';
import {
  CheckCircle2,
  XCircle,
  Brain,
  Target,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Heart,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningGuidePanelProps {
  guide: LearningGuide;
  problem: Problem;
  studentAnswer: string;
  onNextProblem: () => void;
  onChangeDifficulty: () => void;
}

export function LearningGuidePanel({
  guide,
  problem,
  studentAnswer,
  onNextProblem,
  onChangeDifficulty,
}: LearningGuidePanelProps) {
  return (
    <div className="space-y-4">
      {/* 결과 헤더 */}
      <Card
        className={cn(
          'border-2',
          guide.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        )}
      >
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {guide.isCorrect ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <p
                className={cn(
                  'text-lg font-bold',
                  guide.isCorrect ? 'text-green-800' : 'text-red-800'
                )}
              >
                {guide.isCorrect ? '정답입니다!' : '아쉽게도 틀렸습니다'}
              </p>
              <p className="mt-0.5 text-sm text-gray-600">{guide.encouragement}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 정답·내 답 비교 */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-500" />
            정답 확인
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-400">내 답변</p>
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {studentAnswer}
            </p>
          </div>
          {!guide.isCorrect && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-400">모범 답안</p>
              <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                {problem.correctAnswer}
              </p>
            </div>
          )}
          <Separator />
          <div>
            <p className="mb-1 text-xs font-medium text-gray-400">해설</p>
            <p className="text-sm leading-relaxed text-gray-700">{problem.explanation}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI 카운슬러 분석 */}
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
            <Brain className="h-4 w-4 text-blue-600" />
            AI 카운슬러 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
              개념 이해도
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{guide.conceptAnalysis}</p>
          </div>

          {guide.mistakePattern && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3">
              <p className="mb-1 text-xs font-semibold text-red-600">오답 패턴 분석</p>
              <p className="text-sm leading-relaxed text-red-700">{guide.mistakePattern}</p>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
              강화 포인트
            </p>
            <div className="flex items-start gap-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-sm text-gray-700">{guide.reinforcement}</p>
            </div>
          </div>

          <Separator className="bg-blue-100" />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
              다음 학습 단계
            </p>
            <ol className="space-y-1.5">
              {guide.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* 학습 팁 */}
      {guide.studyTips.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              학습 팁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.studyTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  {tip}
                </li>
              ))}
            </ul>
            {guide.relatedTopics.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen className="h-3 w-3" />
                  연관 학습 키워드
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {guide.relatedTopics.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 다음 행동 버튼 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onChangeDifficulty}
          className="rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          난이도 변경
        </button>
        <button
          onClick={onNextProblem}
          className="rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          다음 문제 →
        </button>
      </div>
    </div>
  );
}
