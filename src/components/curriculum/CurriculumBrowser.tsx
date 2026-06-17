'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentStore } from '@/store/studentStore';
import {
  DIFFICULTY_LABELS,
  DOMAIN_LABELS,
  DOMAIN_COLORS,
  DOMAIN_ICON_COLORS,
} from '@/types';
import { getMasteryLabel, getMasteryColor } from '@/lib/utils';
import { Atom, Leaf, Globe, Zap, BookOpen, ChevronRight } from 'lucide-react';
import type { ScienceDomain } from '@/types';

const DOMAIN_ICONS: Record<ScienceDomain, React.ComponentType<{ className?: string }>> = {
  physics: Zap,
  chemistry: Atom,
  biology: Leaf,
  earth: Globe,
  integrated: BookOpen,
};

export function CurriculumBrowser() {
  const [activeSchool, setActiveSchool] = useState<'middle' | 'high'>('middle');
  const { getMasteryLevel, getTopicProgress } = useStudentStore();

  const filtered = CURRICULUM.filter((c) => c.schoolLevel === activeSchool);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">커리큘럼</h1>
        <p className="mt-1 text-sm text-gray-500">
          학년과 단원을 선택하여 학습을 시작하세요
        </p>
      </div>

      <Tabs value={activeSchool} onValueChange={(v) => setActiveSchool(v as 'middle' | 'high')}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="middle">중학교</TabsTrigger>
          <TabsTrigger value="high">고등학교</TabsTrigger>
        </TabsList>

        <TabsContent value={activeSchool} className="mt-4 space-y-6">
          {filtered.map((grade) => (
            <div key={grade.gradeLevel}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{grade.label}</h2>
                  <p className="text-xs text-gray-400">{grade.description}</p>
                </div>
                <Badge variant="secondary">{grade.topics.length}개 단원</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grade.topics.map((topic) => {
                  const mastery = getMasteryLevel(topic.id);
                  const progress = getTopicProgress(topic.id);
                  const totalAttempts =
                    progress.basicAttempts +
                    progress.advancedAttempts +
                    progress.appliedAttempts;
                  const DomainIcon = DOMAIN_ICONS[topic.domain];

                  return (
                    <Link key={topic.id} href={`/practice/${topic.id}`}>
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${DOMAIN_COLORS[topic.domain]} border`}
                      >
                        <CardHeader className="pb-2 pt-4">
                          <div className="flex items-start justify-between gap-2">
                            <DomainIcon
                              className={`mt-0.5 h-4 w-4 shrink-0 ${DOMAIN_ICON_COLORS[topic.domain]}`}
                            />
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {DOMAIN_LABELS[topic.domain]}
                            </Badge>
                          </div>
                          <CardTitle className="mt-1 text-sm font-semibold leading-tight text-gray-800">
                            {topic.subUnit}
                          </CardTitle>
                          <p className="text-xs text-gray-400">{topic.unit}</p>
                        </CardHeader>

                        <CardContent className="pb-4">
                          <div className="flex flex-wrap gap-1">
                            {topic.keywords.slice(0, 3).map((kw) => (
                              <span
                                key={kw}
                                className="rounded bg-white/60 px-1.5 py-0.5 text-xs text-gray-600"
                              >
                                {kw}
                              </span>
                            ))}
                            {topic.keywords.length > 3 && (
                              <span className="text-xs text-gray-400">+{topic.keywords.length - 3}</span>
                            )}
                          </div>

                          {totalAttempts > 0 && (
                            <div className="mt-3">
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-gray-500">습득도</span>
                                <span className={`font-medium ${getMasteryColor(mastery)}`}>
                                  {mastery}% ({getMasteryLabel(mastery)})
                                </span>
                              </div>
                              <Progress value={mastery} className="h-1.5" />
                              <div className="mt-1.5 flex gap-2 text-xs text-gray-400">
                                {(['basic', 'advanced', 'applied'] as const).map((d) => {
                                  const attempts =
                                    d === 'basic'
                                      ? progress.basicAttempts
                                      : d === 'advanced'
                                      ? progress.advancedAttempts
                                      : progress.appliedAttempts;
                                  if (!attempts) return null;
                                  const correct =
                                    d === 'basic'
                                      ? progress.basicCorrect
                                      : d === 'advanced'
                                      ? progress.advancedCorrect
                                      : progress.appliedCorrect;
                                  return (
                                    <span key={d}>
                                      {DIFFICULTY_LABELS[d]}: {correct}/{attempts}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-end text-xs text-gray-400">
                            <span>학습 시작</span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
