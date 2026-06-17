'use client';

import { CURRICULUM } from '@/lib/curriculum';
import { useStudentStore } from '@/store/studentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DIFFICULTY_LABELS, DOMAIN_LABELS, DOMAIN_COLORS } from '@/types';
import { getMasteryLabel, getMasteryColor, getMasteryBgColor, formatDate } from '@/lib/utils';
import { Trophy, Target, Flame, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function ProgressDashboard() {
  const { profile, getTopicProgress, getMasteryLevel, getOverallAccuracy, getWeakTopics } =
    useStudentStore();

  const overallAccuracy = getOverallAccuracy();
  const weakTopicIds = getWeakTopics();

  const studiedTopics = CURRICULUM.flatMap((g) =>
    g.topics.filter((t) => {
      const p = getTopicProgress(t.id);
      return p.basicAttempts + p.advancedAttempts + p.appliedAttempts > 0;
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">학습 진도</h1>
        <p className="mt-1 text-sm text-gray-500">나의 과학 학습 현황을 확인하세요</p>
      </div>

      {/* 총괄 통계 */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">총 문제 수</p>
                <p className="text-2xl font-bold text-gray-900">{profile.totalProblems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">정답률</p>
                <p className="text-2xl font-bold text-gray-900">{overallAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">학습 단원</p>
                <p className="text-2xl font-bold text-gray-900">{studiedTopics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">마지막 학습</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(profile.lastStudied)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 취약 단원 알림 */}
      {weakTopicIds.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm text-orange-800">
              <AlertCircle className="h-4 w-4" />
              집중 보완이 필요한 단원
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {weakTopicIds.slice(0, 5).map((id) => {
                const allTopics = CURRICULUM.flatMap((g) => g.topics);
                const topic = allTopics.find((t) => t.id === id);
                if (!topic) return null;
                return (
                  <Link key={id} href={`/practice/${id}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer border-orange-300 bg-white text-orange-700 hover:bg-orange-100"
                    >
                      {topic.subUnit}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 학년별 단원 진도 */}
      {CURRICULUM.map((grade) => {
        const gradeTopics = grade.topics.filter((t) => {
          const p = getTopicProgress(t.id);
          return p.basicAttempts + p.advancedAttempts + p.appliedAttempts > 0;
        });
        if (gradeTopics.length === 0) return null;

        return (
          <div key={grade.gradeLevel}>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-800">{grade.label}</h2>
            </div>

            <div className="space-y-3">
              {grade.topics.map((topic) => {
                const progress = getTopicProgress(topic.id);
                const totalAttempts =
                  progress.basicAttempts +
                  progress.advancedAttempts +
                  progress.appliedAttempts;

                if (totalAttempts === 0) return null;

                const mastery = getMasteryLevel(topic.id);

                return (
                  <Link key={topic.id} href={`/practice/${topic.id}`}>
                    <Card className={`cursor-pointer hover:shadow-sm ${DOMAIN_COLORS[topic.domain]} border transition-shadow`}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-gray-800">
                                {topic.subUnit}
                              </p>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {DOMAIN_LABELS[topic.domain]}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-gray-400">{topic.unit}</p>

                            <div className="mt-2">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-xs text-gray-500">습득도</span>
                                <span
                                  className={`text-xs font-semibold ${getMasteryColor(mastery)}`}
                                >
                                  {mastery}% ({getMasteryLabel(mastery)})
                                </span>
                              </div>
                              <Progress value={mastery} className="h-1.5" />
                            </div>

                            <div className="mt-2 flex gap-3 text-xs text-gray-400">
                              {(['basic', 'advanced', 'applied'] as const).map((d) => {
                                const attempts =
                                  d === 'basic'
                                    ? progress.basicAttempts
                                    : d === 'advanced'
                                    ? progress.advancedAttempts
                                    : progress.appliedAttempts;
                                const correct =
                                  d === 'basic'
                                    ? progress.basicCorrect
                                    : d === 'advanced'
                                    ? progress.advancedCorrect
                                    : progress.appliedCorrect;
                                if (!attempts) return null;
                                return (
                                  <span key={d}>
                                    {DIFFICULTY_LABELS[d]}: {correct}/{attempts}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${getMasteryBgColor(mastery)}`}
                          >
                            {mastery}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {studiedTopics.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">아직 학습한 단원이 없습니다</p>
            <Link href="/curriculum">
              <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                커리큘럼 시작하기
              </button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
