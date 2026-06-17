'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTopicById } from '@/lib/curriculum';
import { useStudentStore } from '@/store/studentStore';
import { createClient } from '@/lib/supabase/client';
import { upsertTopicProgress } from '@/lib/supabase/db';
import { DifficultySelector } from './DifficultySelector';
import { ProblemCard } from './ProblemCard';
import { LearningGuidePanel } from '@/components/counselor/LearningGuidePanel';
import { LearningContentView } from '@/components/learning/LearningContentView';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DOMAIN_LABELS, DOMAIN_ICON_COLORS } from '@/types';
import type { Difficulty, Problem, LearningGuide, Attempt, LearningContent } from '@/types';
import { ArrowLeft, Loader2, Zap, Atom, Leaf, Globe, BookOpen, RotateCcw } from 'lucide-react';
import type { ScienceDomain } from '@/types';

const DOMAIN_ICONS: Record<ScienceDomain, React.ComponentType<{ className?: string }>> = {
  physics: Zap,
  chemistry: Atom,
  biology: Leaf,
  earth: Globe,
  integrated: BookOpen,
};

// 학습 흐름: content → setup → problem → feedback
type SessionPhase = 'content' | 'setup' | 'problem' | 'feedback';

interface PracticeSessionProps {
  topicId: string;
}

export function PracticeSession({ topicId }: PracticeSessionProps) {
  const router = useRouter();
  const topic = getTopicById(topicId);
  const { userId, recordAttempt, getTopicProgress } = useStudentStore();

  const [phase, setPhase] = useState<SessionPhase>('content');
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');

  // 학습 콘텐츠
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  // 문제풀이
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [currentGuide, setCurrentGuide] = useState<LearningGuide | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [isProblemLoading, setIsProblemLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<
    Array<{ problem: Problem; attempt: Attempt; guide: LearningGuide }>
  >([]);
  const [excludeQuestions, setExcludeQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 학습 콘텐츠 자동 생성
  useEffect(() => {
    const fetchContent = async () => {
      setIsContentLoading(true);
      setContentError(null);
      try {
        const res = await fetch('/api/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId }),
        });
        if (!res.ok) throw new Error('콘텐츠 생성 실패');
        const data: LearningContent = await res.json();
        setLearningContent(data);
      } catch {
        setContentError('학습 콘텐츠를 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        setIsContentLoading(false);
      }
    };
    fetchContent();
  }, [topicId]);

  if (!topic) {
    return (
      <div className="py-20 text-center text-gray-400">단원 정보를 찾을 수 없습니다.</div>
    );
  }

  const DomainIcon = DOMAIN_ICONS[topic.domain];
  const topicProgress = getTopicProgress(topicId);
  const totalAttempts =
    topicProgress.basicAttempts + topicProgress.advancedAttempts + topicProgress.appliedAttempts;

  const generateProblem = useCallback(async (diff: Difficulty) => {
    setIsProblemLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, difficulty: diff, excludeQuestions }),
      });
      if (!res.ok) throw new Error('문제 생성 실패');
      const problem: Problem = await res.json();
      setCurrentProblem(problem);
      setCurrentGuide(null);
      setCurrentAttempt(null);
      setPhase('problem');
      setExcludeQuestions((prev) => [...prev.slice(-4), problem.question]);
    } catch {
      setError('문제를 생성하지 못했습니다. GOOGLE_GENERATIVE_AI_API_KEY를 확인해주세요.');
    } finally {
      setIsProblemLoading(false);
    }
  }, [topicId, excludeQuestions]);

  const handleStartPractice = () => setPhase('setup');

  const handleStartSession = async () => {
    await generateProblem(difficulty);
  };

  const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
    if (!currentProblem) return;
    setIsEvaluating(true);
    setError(null);

    try {
      const evalRes = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: currentProblem, studentAnswer: answer }),
      });
      if (!evalRes.ok) throw new Error('채점 실패');
      const { isCorrect } = await evalRes.json();

      const attempt: Attempt = {
        problemId: currentProblem.id,
        studentAnswer: answer,
        isCorrect,
        submittedAt: new Date(),
        timeSpent,
      };

      recordAttempt(topicId, difficulty, isCorrect);

      // 로그인 상태면 Supabase에 진도 동기화 (비동기, 오류 무시)
      if (userId) {
        const supabase = createClient();
        const updatedProgress = getTopicProgress(topicId);
        upsertTopicProgress(supabase, userId, { ...updatedProgress, topicId }).catch(
          (err) => console.error('[진도 동기화 오류]', err)
        );
      }

      const recentHistory = sessionHistory.slice(-5).map((h) => ({
        isCorrect: h.attempt.isCorrect,
        difficulty: h.problem.difficulty,
      }));

      const counselorRes = await fetch('/api/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: currentProblem, attempt, recentHistory }),
      });
      if (!counselorRes.ok) throw new Error('가이드 생성 실패');
      const guide: LearningGuide = await counselorRes.json();

      setCurrentAttempt(attempt);
      setCurrentGuide(guide);
      setSessionHistory((prev) => [...prev, { problem: currentProblem, attempt, guide }]);
      setPhase('feedback');
    } catch {
      setError('처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextProblem = async () => {
    await generateProblem(difficulty);
  };

  const handleChangeDifficulty = () => {
    setPhase('setup');
    setCurrentProblem(null);
    setCurrentGuide(null);
    setCurrentAttempt(null);
  };

  const handleReviewContent = () => {
    setPhase('content');
  };

  const sessionCorrect = sessionHistory.filter((h) => h.attempt.isCorrect).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <DomainIcon className={`h-5 w-5 ${DOMAIN_ICON_COLORS[topic.domain]}`} />
          <div>
            <p className="text-xs text-gray-400">{topic.unit}</p>
            <h1 className="text-base font-bold text-gray-900">{topic.subUnit}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {phase !== 'content' && learningContent && (
            <button
              onClick={handleReviewContent}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <BookOpen className="h-3.5 w-3.5" />
              개념 복습
            </button>
          )}
          <Badge variant="outline">{DOMAIN_LABELS[topic.domain]}</Badge>
        </div>
      </div>

      {/* 세션 진행 현황 (문제풀이 시작 후) */}
      {sessionHistory.length > 0 && phase !== 'content' && (
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2 text-sm">
          <span className="text-gray-500">이번 세션</span>
          <span className="font-semibold text-gray-800">
            {sessionCorrect}/{sessionHistory.length} 정답
          </span>
          <Progress
            value={(sessionCorrect / sessionHistory.length) * 100}
            className="h-1.5 flex-1"
          />
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── 학습 콘텐츠 단계 ── */}
      {phase === 'content' && (
        <>
          {isContentLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-3 text-sm text-gray-500">AI가 학습 콘텐츠를 준비하고 있습니다…</p>
            </div>
          )}

          {!isContentLoading && contentError && (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="text-sm text-red-600">{contentError}</p>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 mx-auto text-xs text-red-500 hover:text-red-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                다시 시도
              </button>
            </div>
          )}

          {!isContentLoading && !contentError && learningContent && (
            <LearningContentView
              content={learningContent}
              topic={topic}
              onStartPractice={handleStartPractice}
            />
          )}
        </>
      )}

      {/* ── 난이도 선택 단계 ── */}
      {phase === 'setup' && !isProblemLoading && (
        <div className="space-y-4">
          <div>
            <h2 className="mb-1 text-sm font-semibold text-gray-700">난이도를 선택하세요</h2>
            <p className="text-xs text-gray-400">{topic.concepts.join(' · ')}</p>
          </div>

          <DifficultySelector selected={difficulty} onChange={setDifficulty} />

          {totalAttempts > 0 && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="mb-2 text-xs font-medium text-blue-700">이 단원 학습 이력</p>
              <div className="flex gap-4 text-xs text-blue-600">
                {topicProgress.basicAttempts > 0 && (
                  <span>기본: {topicProgress.basicCorrect}/{topicProgress.basicAttempts}</span>
                )}
                {topicProgress.advancedAttempts > 0 && (
                  <span>심화: {topicProgress.advancedCorrect}/{topicProgress.advancedAttempts}</span>
                )}
                {topicProgress.appliedAttempts > 0 && (
                  <span>응용: {topicProgress.appliedCorrect}/{topicProgress.appliedAttempts}</span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleStartSession}
            className="w-full rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            문제 시작하기
          </button>
        </div>
      )}

      {/* ── 문제 생성 로딩 ── */}
      {isProblemLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-gray-500">AI가 문제를 생성하고 있습니다…</p>
        </div>
      )}

      {/* ── 문제 풀이 단계 ── */}
      {!isProblemLoading && phase === 'problem' && currentProblem && (
        <ProblemCard
          problem={currentProblem}
          onSubmit={handleAnswerSubmit}
          isEvaluating={isEvaluating}
        />
      )}

      {/* ── 피드백 단계 ── */}
      {phase === 'feedback' && currentProblem && currentGuide && currentAttempt && (
        <LearningGuidePanel
          guide={currentGuide}
          problem={currentProblem}
          studentAnswer={currentAttempt.studentAnswer}
          onNextProblem={handleNextProblem}
          onChangeDifficulty={handleChangeDifficulty}
        />
      )}
    </div>
  );
}
