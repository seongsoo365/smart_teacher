'use client';

import { cn } from '@/lib/utils';
import type { Difficulty } from '@/types';
import { DIFFICULTY_LABELS } from '@/types';
import { CheckCircle2, Flame, Rocket } from 'lucide-react';

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (d: Difficulty) => void;
}

const OPTIONS: Array<{
  value: Difficulty;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}> = [
  {
    value: 'basic',
    description: '개념 이해 · 공식 적용',
    icon: CheckCircle2,
    bg: 'bg-green-50 hover:bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    iconColor: 'text-green-500',
  },
  {
    value: 'advanced',
    description: '개념 연결 · 다단계 분석',
    icon: Flame,
    bg: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
  {
    value: 'applied',
    description: '실생활 연계 · 융합 사고',
    icon: Rocket,
    bg: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-800',
    iconColor: 'text-purple-500',
  },
];

export function DifficultySelector({ selected, onChange }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all',
              opt.bg,
              isSelected ? `${opt.border} ring-2 ring-offset-1` : 'border-transparent',
              isSelected ? opt.border.replace('border-', 'ring-') : ''
            )}
          >
            <Icon className={cn('h-6 w-6', opt.iconColor)} />
            <span className={cn('mt-2 text-sm font-semibold', opt.text)}>
              {DIFFICULTY_LABELS[opt.value]}
            </span>
            <span className="mt-1 text-xs text-gray-500">{opt.description}</span>
          </button>
        );
      })}
    </div>
  );
}
