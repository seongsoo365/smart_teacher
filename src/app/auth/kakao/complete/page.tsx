'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function KakaoCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const redirectTo = searchParams.get('redirectTo') ?? '/';

    const handleAuth = async () => {
      // 현재 URL 상태 로깅
      console.log('[KakaoComplete] hash:', window.location.hash);
      console.log('[KakaoComplete] search:', window.location.search);
      console.log('[KakaoComplete] href:', window.location.href);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[KakaoComplete] getSession:', { session: !!session, sessionError });

      if (session) {
        router.replace(redirectTo);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      console.log('[KakaoComplete] code:', code);

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        console.log('[KakaoComplete] exchangeCodeForSession error:', error);
        router.replace(error ? '/auth?error=oauth' : redirectTo);
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      console.log('[KakaoComplete] accessToken:', !!accessToken, 'refreshToken:', !!refreshToken);

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        console.log('[KakaoComplete] setSession error:', error);
        router.replace(error ? '/auth?error=oauth' : redirectTo);
        return;
      }

      console.log('[KakaoComplete] no auth found, redirecting to error');
      router.replace('/auth?error=oauth');
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}
