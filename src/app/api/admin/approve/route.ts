import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const dev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    if (dev) console.log(`[api/admin/approve] 권한 없음(${user?.email ?? '비로그인'}) — 403 반환`);
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const body: unknown = await request.json();
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).userId !== 'string' ||
    typeof (body as Record<string, unknown>).approved !== 'boolean'
  ) {
    if (dev) console.log(`[api/admin/approve] 잘못된 요청 body:`, body);
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const { userId, approved } = body as { userId: string; approved: boolean };

  if (userId === user.id) {
    if (dev) console.log(`[api/admin/approve] 자기 자신 승인 시도 차단 (${user.email})`);
    return NextResponse.json({ error: '자신의 승인 상태는 변경할 수 없습니다.' }, { status: 400 });
  }

  if (dev) console.log(`[api/admin/approve] 요청 — admin: ${user.email}, 대상 userId: ${userId}, approved: ${approved}`);

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { is_approved: approved },
  });

  if (error) {
    if (dev) console.log(`[api/admin/approve] Supabase 오류:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (dev) console.log(`[api/admin/approve] 성공 — userId: ${userId}, approved: ${approved}`);
  return NextResponse.json({ success: true });
}
