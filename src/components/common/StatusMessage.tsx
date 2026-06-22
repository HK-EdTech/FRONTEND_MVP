import { cn } from '@/components/ui/utils';

type StatusVariant = 'loading' | 'empty' | 'error';

interface StatusMessageProps {
  variant: StatusVariant;
  text: string;
  className?: string;
}

export function StatusMessage({ variant, text, className }: StatusMessageProps) {
  const variantClass = variant === 'error' ? 'text-red-600' : 'text-gray-600';
  return <p className={cn('text-sm', variantClass, className)}>{text}</p>;
}
