import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/components/ui/utils';

interface ClassSubjectButtonCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: ReactNode;
}

export function ClassSubjectButtonCard({
  label,
  className,
  type = 'button',
  ...props
}: ClassSubjectButtonCardProps) {
  return (
    <button
      type={type}
      className={cn(
        'w-full min-h-12 min-w-[110px] bg-white border border-white/10 rounded-xl px-3 py-3 flex items-center justify-center text-sm font-bold text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}
