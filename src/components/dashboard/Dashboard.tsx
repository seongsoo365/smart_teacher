'use client';

import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';
import { useStudentStore } from '@/store/studentStore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DOMAIN_LABELS, DOMAIN_COLORS, DOMAIN_ICON_COLORS } from '@/types';
import { getMasteryLabel } from '@/lib/utils';
import {
  BookOpen, FlaskConical, BarChart3, ChevronRight,
  Zap, Atom, Leaf, Globe, Trophy, Target, Sparkles,
} from 'lucide-react';
import type { ScienceDomain } from '@/types';

const DOMAIN_ICONS: Record<ScienceDomain, React.ComponentType<{ className?: string }>> = {
  physics: Zap, chemistry: Atom, biology: Leaf, earth: Globe, integrated: BookOpen,
};

export function Dashboard() {
  const { profile, getTopicProgress, getMasteryLevel, getOverallAccuracy } = useStudentStore();

  const overallAccuracy = getOverallAccuracy();

  const recentTopics = CURRICULUM.flatMap((g) =>
    g.topics.map((t) => ({ topic: t, progress: getTopicProgress(t.id) }))
  )
    .filter((x) => x.progress.lastStudied)
    .sort(
      (a, b) =>
        new Date(b.progress.lastStudied!).getTime() -
        new Date(a.progress.lastStudied!).getTime()
    )
    .slice(0, 4);

  const weakTopics = CURRICULUM.flatMap((g) =>
    g.topics.map((t) => ({ topic: t, mastery: getMasteryLevel(t.id), progress: getTopicProgress(t.id) }))
  )
    .filter(
      (x) =>
        x.mastery < 60 &&
        x.progress.basicAttempts + x.progress.advancedAttempts + x.progress.appliedAttempts >= 3
    )
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* 히어로 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">AI 기반 1:1 맞춤형 과학 학습</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight">
            {profile.name}님의<br />스마트티처
          </h1>
          <p className="mt-2 text-sm text-blue-200">
            중·고등 과학 전 단원 · 난이도별 문제 · AI 카운슬러
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/practice">
              <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50">
                <FlaskConical className="h-4 w-4" />
                문제 풀기
              </button>
            </Link>
            <Link href="/curriculum">
              <button className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                <BookOpen className="h-4 w-4" />
                커리큘럼 보기
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 right-12 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* 통계 */}
      {profile.totalProblems > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center py-5">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <p className="mt-2 text-2xl font-bold text-gray-900">{overallAccuracy}%</p>
              <p className="text-xs text-gray-400">전체 정답률</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-5">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <p className="mt-2 text-2xl font-bold text-gray-900">{profile.totalProblems}</p>
              <p className="text-xs text-gray-400">풀이 문제</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-5">
              <Target className="h-6 w-6 text-green-500" />
              <p className="mt-2 text-2xl font-bold text-gray-900">{profile.totalCorrect}</p>
              <p className="text-xs text-gray-400">정답 수</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 최근 학습 */}
      {recentTopics.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">최근 학습</h2>
            <Link href="/progress" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              전체보기 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recentTopics.map(({ topic, progress }) => {
              const mastery = getMasteryLevel(topic.id);
              const DomainIcon = DOMAIN_ICONS[topic.domain];
              return (
                <Link key={topic.id} href={`/practice/${topic.id}`}>
                  <Card className={`cursor-pointer border transition-all hover:shadow-md hover:-translate-y-0.5 ${DOMAIN_COLORS[topic.domain]}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <DomainIcon className={`mt-0.5 h-4 w-4 shrink-0 ${DOMAIN_ICON_COLORS[topic.domain]}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800">{topic.subUnit}</p>
                          <p className="text-xs text-gray-400">{DOMAIN_LABELS[topic.domain]}</p>
                          <div className="mt-2">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-gray-400">습득도</span>
                              <span className="font-medium text-gray-600">{mastery}% · {getMasteryLabel(mastery)}</span>
                            </div>
                            <Progress value={mastery} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 취약 단원 */}
      {weakTopics.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">집중 보완 단원</h2>
            <Badge variant="secondary" className="text-xs">AI 추천</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {weakTopics.map(({ topic, mastery }) => {
              const DomainIcon = DOMAIN_ICONS[topic.domain];
              return (
                <Link key={topic.id} href={`/practice/${topic.id}`}>
                  <Card className="cursor-pointer border-orange-200 bg-orange-50 transition-all hover:shadow-md">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-2">
                        <DomainIcon className="h-4 w-4 text-orange-500" />
                        <p className="truncate text-sm font-medium text-gray-800">{topic.subUnit}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-orange-600">{mastery}% 습득</span>
                        <span className="text-gray-400">복습 필요</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 커리큘럼 바로가기 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">전체 커리큘럼</h2>
          <Link href="/curriculum" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
            전체보기 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CURRICULUM.slice(0, 4).map((grade) => (
            <Link key={grade.gradeLevel} href="/curriculum">
              <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="py-4">
                  <p className="text-sm font-semibold text-gray-800">{grade.label}</p>
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">{grade.description}</p>
                  <Badge variant="secondary" className="mt-3 text-xs">
                    {grade.topics.length}개 단원
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
