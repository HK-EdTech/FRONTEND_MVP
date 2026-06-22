import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/components/ui/utils';

export const defaultGlassStyle: CSSProperties = {
  backdropFilter: 'blur(16px)',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
};

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  style?: CSSProperties;
}

export function GlassPanel({ children, className, style, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn('rounded-2xl p-6 shadow-xl w-full', className)}
      style={{ ...defaultGlassStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
