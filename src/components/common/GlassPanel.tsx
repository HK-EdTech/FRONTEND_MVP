import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/components/ui/utils';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn('rounded-2xl p-6 shadow-xl w-full glass-style', className)}
      {...props}
    >
      {children}
    </div>
  );
}
