import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/components/ui/utils';
import { actionPrimaryStyle } from '@/theme/statusColors';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading icon (e.g. a lucide icon element). */
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Primary action button — the deep-blue gradient pill from the design.
 * Standardizes structure + look; the gradient/shadow come from CSS-var tokens
 * (see `actionPrimaryStyle`), so the color stays reusable elsewhere too.
 * Pass any <button> prop (onClick, disabled, type…); className/style merge on top.
 */
export function ActionButton({ icon, children, className, style, ...props }: ActionButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 px-4 py-[9px] rounded-[12px] text-white text-[12.5px] font-bold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      )}
      style={{ ...actionPrimaryStyle, ...style }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
