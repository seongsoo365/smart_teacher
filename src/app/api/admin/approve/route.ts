import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const body: unknown = await request.json();
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).userId !== 'string' ||
    typeof (body as Record<string, unknown>).approved !== 'boolean'
  ) {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const { userId, approved } = body as { userId: string; approved: boolean };

  if (userId === user.id) {
    return NextResponse.json({ error: '자신의 승인 상태는 변경할 수 없습니다.' }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { is_approved: approved },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
