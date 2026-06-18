import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('kakao_oauth_state')?.value;
  const redirectTo = request.cookies.get('kakao_redirect_to')?.value ?? '/';

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}/auth?error=oauth`);
  }

  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!clientId || !serviceRoleKey || !supabaseUrl || !supabaseAnonKey || !code) {
    return NextResponse.redirect(`${origin}/auth?error=oauth`);
  }

  try {
    // 1. 카카오 액세스 토큰 교환
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: `${origin}/auth/callback/kakao`,
      code,
    });
    if (clientSecret) tokenParams.set('client_secret', clientSecret);

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });
    const tokenData: KakaoTokenResponse = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(`${origin}/auth?error=oauth`);
    }

    // 2. 카카오 프로필 조회 (이메일 미동의 가능)
    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData: KakaoUserResponse = await profileRes.json();

    if (!profileData.id) {
      return NextResponse.redirect(`${origin}/auth?error=oauth`);
    }

    const kakaoId = String(profileData.id);
    const kakaoAccount = profileData.kakao_account;
    const email = (kakaoAccount?.email ?? `kakao_${kakaoId}@kakao.user`).toLowerCase();
    const name = kakaoAccount?.profile?.nickname ?? `사용자_${kakaoId.slice(-4)}`;
    const avatarUrl = kakaoAccount?.profile?.profile_image_url ?? null;

    // 3. Supabase admin API로 사용자 생성 또는 조회
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        avatar_url: avatarUrl,
        provider: 'kakao',
        kakao_id: kakaoId,
      },
    });

    // 4. Magic link 생성
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
      // 서버에서 직접 처리하므로 redirectTo는 Supabase가 인식 가능한 경로로 설정
      options: { redirectTo: `${origin}/auth/callback` },
    });

    if (linkError || !linkData.properties?.action_link) {
      return NextResponse.redirect(`${origin}/auth?error=oauth`);
    }

    // 5. 서버에서 action_link를 직접 호출해 세션 토큰 추출 (브라우저 우회)
    const verifyRes = await fetch(linkData.properties.action_link, {
      redirect: 'manual',
    });

    const location = verifyRes.headers.get('location') ?? '';

    // hash에서 토큰 추출 (Supabase implicit flow)
    const hashIdx = location.indexOf('#');
    const hashStr = hashIdx !== -1 ? location.substring(hashIdx + 1) : '';
    const hashParams = new URLSearchParams(hashStr);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(`${origin}/auth?error=oauth`);
    }

    // 6. 서버 측에서 세션을 쿠키에 저장
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return NextResponse.redirect(`${origin}/auth?error=oauth`);
    }

    const response = NextResponse.redirect(new URL(redirectTo, origin));
    response.cookies.delete('kakao_oauth_state');
    response.cookies.delete('kakao_redirect_to');
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/auth?error=oauth`);
  }
}
