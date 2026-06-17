'use client';

import { create } from 'zustand';
import type { StudySession, Problem, LearningGuide, Attempt, Difficulty } from '@/types';

interface SessionState extends StudySession {
  startSession: (topicId: string, difficulty: Difficulty) => void;
  setCurrentProblem: (problem: Problem | null) => void;
  setCurrentGuide: (guide: LearningGuide | null) => void;
  setLoading: (loading: boolean) => void;
  setEvaluating: (evaluating: boolean) => void;
  addToHistory: (problem: Problem, attempt: Attempt, guide: LearningGuide) => void;
  resetSession: () => void;
}

const initialState: StudySession = {
  topicId: '',
  difficulty: 'basic',
  currentProblem: null,
  currentGuide: null,
  isLoading: false,
  isEvaluating: false,
  sessionHistory: [],
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  startSession: (topicId, difficulty) =>
    set({ ...initialState, topicId, difficulty }),

  setCurrentProblem: (problem) =>
    set({ currentProblem: problem, currentGuide: null }),

  setCurrentGuide: (guide) => set({ currentGuide: guide }),

  setLoading: (isLoading) => set({ isLoading }),

  setEvaluating: (isEvaluating) => set({ isEvaluating }),

  addToHistory: (problem, attempt, guide) =>
    set((state) => ({
      sessionHistory: [...state.sessionHistory, { problem, attempt, guide }],
    })),

  resetSession: () => set(initialState),
}));
