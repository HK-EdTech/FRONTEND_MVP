'use client';

import Link from 'next/link';
import { cn } from '@/components/ui/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('text-sm text-gray-600', className)} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-gray-800 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? 'font-semibold text-gray-800' : undefined)}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-gray-400">{'>'}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
