'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, BarChart3, FlaskConical, GraduationCap } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: GraduationCap },
  { href: '/curriculum', label: '커리큘럼', icon: BookOpen },
  { href: '/practice', label: '문제풀이', icon: FlaskConical },
  { href: '/progress', label: '학습진도', icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">스마트티처</span>
            <span className="hidden text-xs text-gray-400 sm:inline">과학 AI 학습</span>
          </Link>

          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              ))}
            </nav>
            <div className="ml-2 border-l pl-2">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
