'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStudentStore } from '@/store/studentStore';
import { loadAllProgress, getProfile } from '@/lib/supabase/db';

/**
 * 로그인 상태 변경을 감지해 Supabase 진도 데이터를 Zustand 스토어에 동기화한다.
 * layout.tsx에 배치해 앱 전역에서 항상 실행된다.
 */
export function SupabaseSync() {
  const { loadFromSupabase, clearStore } = useStudentStore();

  useEffect(() => {
    const supabase = createClient();

    const sync = async (userId: string) => {
      const [profile, progress] = await Promise.all([
        getProfile(supabase, userId),
        loadAllProgress(supabase, userId),
      ]);
      loadFromSupabase(userId, profile ?? {}, progress);
    };

    // 앱 로드 시 현재 세션 확인
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) sync(data.user.id);
    });

    // 로그인 / 로그아웃 이벤트 구독
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        sync(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        clearStore();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadFromSupabase, clearStore]);

  return null;
}
