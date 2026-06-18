'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';

interface UserRow {
  id: string;
  email: string;
  name: string;
  isApproved: boolean;
  role: string;
  createdAt: string;
}

interface Props {
  users: UserRow[];
  currentUserId: string;
}

export function UserApprovalTable({ users, currentUserId }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (userId: string, approved: boolean) => {
    setLoadingId(userId);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json();
        alert(data.error ?? '오류가 발생했습니다.');
      } else {
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50 text-xs text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left font-medium">사용자</th>
            <th className="px-4 py-3 text-left font-medium">역할</th>
            <th className="px-4 py-3 text-left font-medium">승인 상태</th>
            <th className="px-4 py-3 text-left font-medium">가입일</th>
            <th className="px-4 py-3 text-left font-medium">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((u) => {
            const isMe = u.id === currentUserId;
            const isLoading = loadingId === u.id;
            return (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {u.name || <span className="text-gray-400">이름 없음</span>}
                  </p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  {u.role === 'admin' ? (
                    <Badge className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-100">
                      <ShieldCheck className="h-3 w-3" />
                      관리자
                    </Badge>
                  ) : (
                    <Badge variant="secondary">일반</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.isApproved ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" /> 승인됨
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <XCircle className="h-4 w-4" /> 미승인
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3">
                  {isMe ? (
                    <span className="text-xs text-gray-300">본인</span>
                  ) : isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : u.isApproved ? (
                    <button
                      onClick={() => handleApprove(u.id, false)}
                      className="rounded-md px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      승인 취소
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(u.id, true)}
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      승인
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
