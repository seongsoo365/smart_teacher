'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function KakaoCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const redirectTo = searchParams.get('redirectTo') ?? '/';

    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace(redirectTo);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        router.replace(error ? '/auth?error=oauth' : redirectTo);
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        router.replace(error ? '/auth?error=oauth' : redirectTo);
        return;
      }

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

export default function KakaoCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">카카오 로그인 처리 중...</p>
          </div>
        </div>
      }
    >
      <KakaoCompleteInner />
    </Suspense>
  );
}
