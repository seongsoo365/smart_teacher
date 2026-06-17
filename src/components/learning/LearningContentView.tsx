'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LearningContent, Topic } from '@/types';
import { DOMAIN_LABELS, DOMAIN_ICON_COLORS, DOMAIN_COLORS } from '@/types';
import {
  BookOpen, Lightbulb, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, FlaskConical, Zap, Atom, Leaf, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScienceDomain } from '@/types';

const DOMAIN_ICONS: Record<ScienceDomain, React.ComponentType<{ className?: string }>> = {
  physics: Zap, chemistry: Atom, biology: Leaf, earth: Globe, integrated: BookOpen,
};

interface LearningContentViewProps {
  content: LearningContent;
  topic: Topic;
  onStartPractice: () => void;
}

export function LearningContentView({ content, topic, onStartPractice }: LearningContentViewProps) {
  const [expandedConcepts, setExpandedConcepts] = useState<Set<number>>(
    new Set([0]) // 첫 번째 개념은 기본 펼침
  );

  const DomainIcon = DOMAIN_ICONS[topic.domain];

  const toggleConcept = (idx: number) => {
    setExpandedConcepts((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* 단원 헤더 */}
      <div className={cn('rounded-2xl border-2 p-5', DOMAIN_COLORS[topic.domain])}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm">
            <DomainIcon className={cn('h-5 w-5', DOMAIN_ICON_COLORS[topic.domain])} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {DOMAIN_LABELS[topic.domain]}
              </Badge>
              <span className="text-xs text-gray-400">{topic.unit}</span>
            </div>
            <h1 className="mt-1 text-lg font-bold text-gray-900">{topic.subUnit}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{content.summary}</p>
          </div>
        </div>
      </div>

      {/* 도입 */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-sm leading-relaxed text-blue-900">{content.introduction}</p>
          </div>
        </CardContent>
      </Card>

      {/* 핵심 개념 */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
          <FlaskConical className="h-4 w-4 text-gray-400" />
          핵심 개념
          <Badge variant="secondary" className="text-xs">{content.concepts.length}개</Badge>
        </h2>

        <div className="space-y-2">
          {content.concepts.map((concept, idx) => {
            const isOpen = expandedConcepts.has(idx);
            return (
              <Card key={idx} className="overflow-hidden border">
                {/* 개념 헤더 (클릭으로 펼침/접기) */}
                <button
                  onClick={() => toggleConcept(idx)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{concept.name}</span>
                    {concept.formula && (
                      <span className="hidden rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-700 sm:inline">
                        {concept.formula}
                      </span>
                    )}
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                    : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  }
                </button>

                {/* 개념 상세 */}
                {isOpen && (
                  <CardContent className="border-t bg-gray-50 pb-4 pt-3">
                    <p className="text-sm leading-relaxed text-gray-700">{concept.explanation}</p>

                    {concept.formula && (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
                        <p className="mb-0.5 text-xs font-medium text-amber-600">공식 · 법칙</p>
                        <p className="font-mono text-sm font-semibold text-amber-800">{concept.formula}</p>
                      </div>
                    )}

                    {concept.examples.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs font-medium text-gray-500">실생활 예시</p>
                        <ul className="space-y-1">
                          {concept.examples.map((ex, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* 핵심 포인트 */}
      {content.keyPoints.length > 0 && (
        <Card className="border-green-100">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              꼭 기억하세요
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ol className="space-y-2">
              {content.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    {i + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* 자주 하는 실수 */}
      {content.commonMistakes.length > 0 && (
        <Card className="border-orange-100 bg-orange-50">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              주의할 오개념
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ul className="space-y-2">
              {content.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-orange-800">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  {mistake}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* 키워드 */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-400">이 단원의 핵심 키워드</p>
        <div className="flex flex-wrap gap-1.5">
          {topic.keywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="text-xs">
              {kw}
            </Badge>
          ))}
        </div>
      </div>

      {/* 문제풀이 시작 CTA */}
      <button
        onClick={onStartPractice}
        className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
      >
        학습 완료 · 문제풀이 시작 →
      </button>
    </div>
  );
}
