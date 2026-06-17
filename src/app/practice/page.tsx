'use client';

import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';
import { useStudentStore } from '@/store/studentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DOMAIN_LABELS, DOMAIN_COLORS, DOMAIN_ICON_COLORS } from '@/types';
import { getMasteryLabel } from '@/lib/utils';
import { Zap, Atom, Leaf, Globe, BookOpen, ChevronRight, FlaskConical } from 'lucide-react';
import type { ScienceDomain } from '@/types';

const DOMAIN_ICONS: Record<ScienceDomain, React.ComponentType<{ className?: string }>> = {
  physics: Zap, chemistry: Atom, biology: Leaf, earth: Globe, integrated: BookOpen,
};

export default function PracticePage() {
  const { getMasteryLevel, getTopicProgress } = useStudentStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">문제풀이</h1>
        <p className="mt-1 text-sm text-gray-500">단원을 선택하면 AI가 맞춤 문제를 생성합니다</p>
      </div>

      {CURRICULUM.map((grade) => (
        <div key={grade.gradeLevel}>
          <div className="mb-3 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-800">{grade.label}</h2>
            <Badge variant="secondary" className="text-xs">{grade.topics.length}단원</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grade.topics.map((topic) => {
              const mastery = getMasteryLevel(topic.id);
              const progress = getTopicProgress(topic.id);
              const totalAttempts =
                progress.basicAttempts + progress.advancedAttempts + progress.appliedAttempts;
              const DomainIcon = DOMAIN_ICONS[topic.domain];

              return (
                <Link key={topic.id} href={`/practice/${topic.id}`}>
                  <Card className={`cursor-pointer border transition-all hover:shadow-md hover:-translate-y-0.5 ${DOMAIN_COLORS[topic.domain]}`}>
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-center justify-between">
                        <DomainIcon className={`h-4 w-4 ${DOMAIN_ICON_COLORS[topic.domain]}`} />
                        <Badge variant="outline" className="text-xs">{DOMAIN_LABELS[topic.domain]}</Badge>
                      </div>
                      <CardTitle className="mt-1 text-sm font-semibold text-gray-800">
                        {topic.subUnit}
                      </CardTitle>
                      <p className="text-xs text-gray-400">{topic.unit}</p>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.slice(0, 3).map((kw) => (
                          <span key={kw} className="rounded bg-white/60 px-1.5 py-0.5 text-xs text-gray-500">
                            {kw}
                          </span>
                        ))}
                      </div>

                      {totalAttempts > 0 ? (
                        <div className="mt-3">
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-gray-400">습득도</span>
                            <span className="font-medium text-gray-600">
                              {mastery}% · {getMasteryLabel(mastery)}
                            </span>
                          </div>
                          <Progress value={mastery} className="h-1.5" />
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-gray-400">미학습</p>
                      )}

                      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-gray-400">
                        <span>시작하기</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
