import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 (반드시 getUser()로 확인)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const dev = process.env.NODE_ENV === 'development';

  // OAuth 콜백·카카오 인증 경로는 항상 통과
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/kakao')) {
    return supabaseResponse;
  }

  // 비로그인: / 와 /auth 만 허용
  if (!user) {
    const isPublic = pathname === '/' || pathname === '/auth' || pathname.startsWith('/auth/');
    if (!isPublic) {
      if (dev) console.log(`[middleware] 비로그인 → /auth 리다이렉트 (요청: ${pathname})`);
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth';
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // 로그인됨: app_metadata로 권한 확인 (추가 DB 쿼리 없음)
  const isAdmin = user.app_metadata?.role === 'admin';
  const isApproved = isAdmin || user.app_metadata?.is_approved === true;

  if (dev && pathname.startsWith('/admin')) {
    console.log(
      `[middleware] /admin 접근 시도 — email: ${user.email}, role: ${user.app_metadata?.role ?? '(없음)'}, is_approved: ${user.app_metadata?.is_approved ?? false}, isAdmin: ${isAdmin}`
    );
  }

  if (!isApproved) {
    // 미승인 사용자는 /pending 만 허용
    if (pathname !== '/pending') {
      if (dev) console.log(`[middleware] 미승인 사용자(${user.email}) → /pending 리다이렉트 (요청: ${pathname})`);
      return NextResponse.redirect(new URL('/pending', request.url));
    }
    return supabaseResponse;
  }

  // admin 전용 경로: admin이 아니면 홈으로
  if (pathname.startsWith('/admin') && !isAdmin) {
    if (dev) console.log(`[middleware] 비어드민 사용자(${user.email}) /admin 차단 → / 리다이렉트`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (dev && pathname.startsWith('/admin')) {
    console.log(`[middleware] 어드민(${user.email}) /admin 접근 허용`);
  }

  // 승인된 사용자가 /auth 또는 /pending 접근 → 홈으로
  if (pathname === '/auth' || pathname === '/pending') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
