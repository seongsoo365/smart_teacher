import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PendingLogout } from '@/components/auth/PendingLogout';
import { ShieldAlert } from 'lucide-react';

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const isApproved =
    user.app_metadata?.role === 'admin' ||
    user.app_metadata?.is_approved === true;

  if (isApproved) redirect('/');

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
          <ShieldAlert className="h-7 w-7 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">미승인 사용자입니다.</h1>
          <p className="mt-1 text-sm text-gray-500">
            관리자의 승인 후 서비스를 이용하실 수 있습니다.
          </p>
        </div>
        <p className="rounded-lg bg-gray-50 px-4 py-2 text-xs text-gray-400">
          {user.email}
        </p>
        <PendingLogout />
      </div>
    </div>
  );
}
