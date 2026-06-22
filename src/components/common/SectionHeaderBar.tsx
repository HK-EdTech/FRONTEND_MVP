import type { ReactNode } from 'react';
import { cn } from '@/components/ui/utils';

interface SectionHeaderBarProps {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
  actionsClassName?: string;
}

export function SectionHeaderBar({
  title,
  actions,
  className,
  titleClassName,
  actionsClassName,
}: SectionHeaderBarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-6', className)}>
      <h2 className={cn('text-xl text-gray-800', titleClassName)}>{title}</h2>
      {actions && <div className={cn('flex items-center gap-2', actionsClassName)}>{actions}</div>}
    </div>
  );
}
