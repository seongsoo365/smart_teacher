import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getMasteryColor(level: number): string {
  if (level >= 80) return 'text-green-600';
  if (level >= 60) return 'text-blue-600';
  if (level >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

export function getMasteryLabel(level: number): string {
  if (level >= 80) return '우수';
  if (level >= 60) return '보통';
  if (level >= 40) return '미흡';
  if (level > 0) return '부족';
  return '미학습';
}

export function getMasteryBgColor(level: number): string {
  if (level >= 80) return 'bg-green-500';
  if (level >= 60) return 'bg-blue-500';
  if (level >= 40) return 'bg-yellow-500';
  return 'bg-red-400';
}
