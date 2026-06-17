'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types';
import type { Problem } from '@/types';
import { Lightbulb, Send, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const answerSchema = z.object({
  answer: z.string().min(1, '답을 입력해주세요'),
});

type AnswerForm = z.infer<typeof answerSchema>;

interface ProblemCardProps {
  problem: Problem;
  onSubmit: (answer: string, timeSpent: number) => void;
  isEvaluating: boolean;
}

export function ProblemCard({ problem, onSubmit, isEvaluating }: ProblemCardProps) {
  const [hintsShown, setHintsShown] = useState(0);
  const startTime = useRef(Date.now());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnswerForm>({ resolver: zodResolver(answerSchema) });

  const selectedChoice = watch('answer');

  useEffect(() => {
    startTime.current = Date.now();
    setHintsShown(0);
  }, [problem.id]);

  const handleFormSubmit = (data: AnswerForm) => {
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    onSubmit(data.answer, timeSpent);
  };

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={cn('text-xs font-medium', DIFFICULTY_COLORS[problem.difficulty])}>
            {DIFFICULTY_LABELS[problem.difficulty]}
          </Badge>
          <span className="text-xs text-gray-400">
            {problem.type === 'multiple-choice'
              ? '5지선다'
              : problem.type === 'short-answer'
              ? '단답형'
              : '서술형'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* 문제 본문 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
            {problem.question}
          </p>
        </div>

        {/* 답변 영역 */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {problem.type === 'multiple-choice' && problem.choices ? (
            <RadioGroup
              value={selectedChoice}
              onValueChange={(v) => setValue('answer', v)}
              className="space-y-2"
            >
              {problem.choices.map((choice) => (
                <div
                  key={choice.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors',
                    selectedChoice === choice.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  )}
                  onClick={() => setValue('answer', choice.id)}
                >
                  <RadioGroupItem value={choice.id} id={`choice-${choice.id}`} className="mt-0.5" />
                  <Label
                    htmlFor={`choice-${choice.id}`}
                    className="cursor-pointer text-sm leading-relaxed"
                  >
                    <span className="font-medium text-gray-500">{choice.id}.</span>{' '}
                    {choice.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div>
              <Textarea
                {...register('answer')}
                placeholder={
                  problem.type === 'short-answer'
                    ? '답을 입력하세요'
                    : '서술형 답안을 작성하세요 (핵심 개념을 포함하여 설명해주세요)'
                }
                rows={problem.type === 'descriptive' ? 5 : 2}
                className="resize-none text-sm"
              />
              {errors.answer && (
                <p className="mt-1 text-xs text-red-500">{errors.answer.message}</p>
              )}
            </div>
          )}

          {/* 힌트 영역 */}
          {problem.hints && problem.hints.length > 0 && (
            <div className="space-y-2">
              {hintsShown > 0 && (
                <div className="space-y-1.5">
                  {problem.hints.slice(0, hintsShown).map((hint, i) => (
                    <div
                      key={i}
                      className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
                    >
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span>
                        <span className="font-medium">힌트 {i + 1}:</span> {hint}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {hintsShown < problem.hints.length && (
                <button
                  type="button"
                  onClick={() => setHintsShown((n) => n + 1)}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                >
                  <ChevronDown className="h-3 w-3" />
                  힌트 보기 ({hintsShown}/{problem.hints.length})
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isEvaluating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isEvaluating ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  채점 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  제출하기
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
