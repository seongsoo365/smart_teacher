'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FlaskConical, Loader2 } from 'lucide-react';

// 카카오 아이콘 (SVG 인라인)
function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.736 1.618 5.14 4.073 6.573L4.9 21l4.618-2.476A11.64 11.64 0 0012 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
    </svg>
  );
}

// 구글 아이콘 (SVG 인라인)
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface AuthPageProps {
  redirectTo?: string;
  hasError?: boolean;
}

export function AuthPage({ redirectTo = '/', hasError = false }: AuthPageProps) {
  const [loadingProvider, setLoadingProvider] = useState<'kakao' | 'google' | null>(null);
  const supabase = createClient();

  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    setLoadingProvider(provider);

    if (provider === 'kakao') {
      // 이메일 동의 요청 없이 직접 카카오 OAuth 시작
      window.location.href = `/auth/kakao?redirectTo=${encodeURIComponent(redirectTo)}`;
      return;
    }

    const callbackUrl = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      {/* 로고 */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
          <FlaskConical className="h-9 w-9 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">스마트티처</h1>
          <p className="mt-1 text-sm text-gray-500">AI 기반 1:1 과학 학습 플랫폼</p>
        </div>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="mb-1 text-center text-lg font-bold text-gray-800">
          로그인 / 회원가입
        </h2>
        <p className="mb-6 text-center text-sm text-gray-400">
          소셜 계정으로 바로 시작하세요
        </p>

        {hasError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            로그인 중 오류가 발생했습니다. 다시 시도해주세요.
          </div>
        )}

        <div className="space-y-3">
          {/* 카카오 */}
          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={loadingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-gray-800 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#FEE500' }}
          >
            {loadingProvider === 'kakao' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <KakaoIcon />
            )}
            카카오로 계속하기
          </button>

          {/* 구글 */}
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loadingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {loadingProvider === 'google' ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <GoogleIcon />
            )}
            구글로 계속하기
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
          로그인하면 서비스 이용약관 및<br />개인정보 처리방침에 동의한 것으로 간주합니다.
        </p>
      </div>

      {/* 특징 소개 */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        {[
          { emoji: '🧪', label: '중·고 전 과목' },
          { emoji: '🤖', label: 'AI 맞춤 문제' },
          { emoji: '📈', label: '1:1 카운슬러' },
        ].map(({ emoji, label }) => (
          <div key={label} className="rounded-xl bg-white/70 px-3 py-3 shadow-sm">
            <div className="text-2xl">{emoji}</div>
            <p className="mt-1 text-xs font-medium text-gray-600">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
