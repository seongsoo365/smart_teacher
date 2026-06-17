'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudentProfile, TopicProgress, GradeLevel, SchoolLevel } from '@/types';

interface StudentState {
  userId: string | null;
  profile: StudentProfile;
  topicProgress: Record<string, TopicProgress>;

  // 프로필 업데이트
  setProfile: (updates: Partial<StudentProfile>) => void;
  setGrade: (schoolLevel: SchoolLevel, gradeLevel: GradeLevel) => void;

  // Supabase 로그인 후 데이터 로드 / 로그아웃 시 초기화
  loadFromSupabase: (
    userId: string,
    profile: Partial<StudentProfile>,
    progress: Record<string, TopicProgress>
  ) => void;
  clearStore: () => void;

  // 진도 기록 (Supabase 동기화는 호출측에서 처리)
  recordAttempt: (
    topicId: string,
    difficulty: 'basic' | 'advanced' | 'applied',
    isCorrect: boolean
  ) => void;

  // 진도 조회
  getTopicProgress: (topicId: string) => TopicProgress;
  getOverallAccuracy: () => number;
  getWeakTopics: () => string[];
  getMasteryLevel: (topicId: string) => number;
}

const DEFAULT_PROFILE: StudentProfile = {
  id: '',
  name: '학생',
  schoolLevel: 'middle',
  gradeLevel: 'middle-1',
  totalProblems: 0,
  totalCorrect: 0,
  streakDays: 0,
  lastStudied: null,
};

const DEFAULT_TOPIC_PROGRESS: Omit<TopicProgress, 'topicId'> = {
  basicAttempts: 0,
  basicCorrect: 0,
  advancedAttempts: 0,
  advancedCorrect: 0,
  appliedAttempts: 0,
  appliedCorrect: 0,
  lastStudied: null,
  masteryLevel: 0,
};

// 습득도 계산 (기본 40%, 심화 35%, 응용 25% 가중치)
function calcMastery(progress: TopicProgress): number {
  const basicRate =
    progress.basicAttempts > 0 ? progress.basicCorrect / progress.basicAttempts : 0;
  const advancedRate =
    progress.advancedAttempts > 0 ? progress.advancedCorrect / progress.advancedAttempts : 0;
  const appliedRate =
    progress.appliedAttempts > 0 ? progress.appliedCorrect / progress.appliedAttempts : 0;

  const hasAny =
    progress.basicAttempts + progress.advancedAttempts + progress.appliedAttempts > 0;
  if (!hasAny) return 0;

  let totalWeight = 0;
  let weightedScore = 0;
  if (progress.basicAttempts > 0) { weightedScore += basicRate * 40; totalWeight += 40; }
  if (progress.advancedAttempts > 0) { weightedScore += advancedRate * 35; totalWeight += 35; }
  if (progress.appliedAttempts > 0) { weightedScore += appliedRate * 25; totalWeight += 25; }

  return Math.round((weightedScore / totalWeight) * 100);
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      userId: null,
      profile: DEFAULT_PROFILE,
      topicProgress: {},

      setProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      setGrade: (schoolLevel, gradeLevel) =>
        set((state) => ({ profile: { ...state.profile, schoolLevel, gradeLevel } })),

      loadFromSupabase: (userId, profileData, progress) =>
        set((state) => ({
          userId,
          profile: { ...state.profile, ...profileData, id: userId },
          topicProgress: progress,
        })),

      clearStore: () =>
        set({ userId: null, profile: DEFAULT_PROFILE, topicProgress: {} }),

      recordAttempt: (topicId, difficulty, isCorrect) =>
        set((state) => {
          const existing = state.topicProgress[topicId] ?? {
            topicId,
            ...DEFAULT_TOPIC_PROGRESS,
          };
          const updated: TopicProgress = { ...existing };
          const now = new Date();
          updated.lastStudied = now;

          if (difficulty === 'basic') {
            updated.basicAttempts += 1;
            if (isCorrect) updated.basicCorrect += 1;
          } else if (difficulty === 'advanced') {
            updated.advancedAttempts += 1;
            if (isCorrect) updated.advancedCorrect += 1;
          } else {
            updated.appliedAttempts += 1;
            if (isCorrect) updated.appliedCorrect += 1;
          }
          updated.masteryLevel = calcMastery(updated);

          return {
            topicProgress: { ...state.topicProgress, [topicId]: updated },
            profile: {
              ...state.profile,
              totalProblems: state.profile.totalProblems + 1,
              totalCorrect: state.profile.totalCorrect + (isCorrect ? 1 : 0),
              lastStudied: now,
            },
          };
        }),

      getTopicProgress: (topicId) => {
        const { topicProgress } = get();
        return topicProgress[topicId] ?? { topicId, ...DEFAULT_TOPIC_PROGRESS };
      },

      getOverallAccuracy: () => {
        const { profile } = get();
        if (profile.totalProblems === 0) return 0;
        return Math.round((profile.totalCorrect / profile.totalProblems) * 100);
      },

      getWeakTopics: () => {
        const { topicProgress } = get();
        return Object.values(topicProgress)
          .filter(
            (p) =>
              p.masteryLevel < 60 &&
              p.basicAttempts + p.advancedAttempts + p.appliedAttempts >= 3
          )
          .sort((a, b) => a.masteryLevel - b.masteryLevel)
          .map((p) => p.topicId);
      },

      getMasteryLevel: (topicId) => {
        const { topicProgress } = get();
        return topicProgress[topicId]?.masteryLevel ?? 0;
      },
    }),
    { name: 'smart-teacher-student' }
  )
);
