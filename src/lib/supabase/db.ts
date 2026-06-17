import type { SupabaseClient } from '@supabase/supabase-js';
import type { TopicProgress, StudentProfile } from '@/types';

// ── 프로필 ──────────────────────────────────────────────────

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Partial<StudentProfile> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, school_level, grade_level, total_problems, total_correct, last_studied')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: userId,
    name: data.name,
    schoolLevel: data.school_level,
    gradeLevel: data.grade_level,
    totalProblems: data.total_problems,
    totalCorrect: data.total_correct,
    streakDays: 0,
    lastStudied: data.last_studied ? new Date(data.last_studied) : null,
  };
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: {
    name?: string;
    schoolLevel?: string;
    gradeLevel?: string;
    totalProblems?: number;
    totalCorrect?: number;
    lastStudied?: Date | null;
  }
): Promise<void> {
  await supabase
    .from('profiles')
    .update({
      name: updates.name,
      school_level: updates.schoolLevel,
      grade_level: updates.gradeLevel,
      total_problems: updates.totalProblems,
      total_correct: updates.totalCorrect,
      last_studied: updates.lastStudied?.toISOString() ?? null,
    })
    .eq('id', userId);
}

// ── 학습 진도 ─────────────────────────────────────────────────

export async function loadAllProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, TopicProgress>> {
  const { data, error } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      row.topic_id,
      {
        topicId: row.topic_id,
        basicAttempts: row.basic_attempts,
        basicCorrect: row.basic_correct,
        advancedAttempts: row.advanced_attempts,
        advancedCorrect: row.advanced_correct,
        appliedAttempts: row.applied_attempts,
        appliedCorrect: row.applied_correct,
        masteryLevel: row.mastery_level,
        lastStudied: row.last_studied ? new Date(row.last_studied) : null,
      } satisfies TopicProgress,
    ])
  );
}

export async function upsertTopicProgress(
  supabase: SupabaseClient,
  userId: string,
  progress: TopicProgress
): Promise<void> {
  await supabase.from('topic_progress').upsert(
    {
      user_id: userId,
      topic_id: progress.topicId,
      basic_attempts: progress.basicAttempts,
      basic_correct: progress.basicCorrect,
      advanced_attempts: progress.advancedAttempts,
      advanced_correct: progress.advancedCorrect,
      applied_attempts: progress.appliedAttempts,
      applied_correct: progress.appliedCorrect,
      mastery_level: progress.masteryLevel,
      last_studied: progress.lastStudied?.toISOString() ?? null,
    },
    { onConflict: 'user_id,topic_id' }
  );
}
