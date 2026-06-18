import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { UserApprovalTable } from '@/components/admin/UserApprovalTable';
import { Users } from 'lucide-react';

const dev = process.env.NODE_ENV === 'development';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    if (dev) console.log(`[admin/page] 권한 없음(${user?.email ?? '비로그인'}) → / 리다이렉트`);
    redirect('/');
  }

  if (dev) console.log(`[admin/page] 어드민(${user.email}) 페이지 진입 — 사용자 목록 조회 시작`);

  const adminClient = createAdminClient();
  const { data } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

  const users = (data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? '',
    name:
      (u.user_metadata?.full_name as string | undefined) ??
      (u.user_metadata?.name as string | undefined) ??
      '',
    isApproved:
      u.app_metadata?.role === 'admin' ||
      u.app_metadata?.is_approved === true,
    role: (u.app_metadata?.role as string | undefined) ?? 'user',
    createdAt: u.created_at,
  }));

  const pending = users.filter((u) => !u.isApproved).length;

  if (dev) console.log(`[admin/page] 사용자 목록 로드 완료 — 전체: ${users.length}, 승인 대기: ${pending}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
          <Users className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-sm text-gray-500">
            전체 {users.length}명
            {pending > 0 && (
              <span className="ml-2 text-yellow-600">· 승인 대기 {pending}명</span>
            )}
          </p>
        </div>
      </div>

      <UserApprovalTable users={users} currentUserId={user.id} />
    </div>
  );
}
