import type { ReactNode } from 'react';
import { ClassroomLayoutShell } from '@/components/class/ClassDetailPage';

interface ClassLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ClassLayout({ children, params }: ClassLayoutProps) {
  const { id } = await params;
  return <ClassroomLayoutShell classId={id}>{children}</ClassroomLayoutShell>;
}
