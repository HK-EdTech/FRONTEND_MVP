'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api, ClassroomDetailResponse } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMockClassroomDetail } from './mockData';

interface ClassroomLayoutShellProps {
  classId: string;
  children: ReactNode;
}

const glassStyle = {
  backdropFilter: 'blur(16px)',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
};

function activeTabFromPath(pathname: string): 'homework' | 'students' | 'teachers' {
  if (pathname.includes('/students')) return 'students';
  if (pathname.includes('/teachers')) return 'teachers';
  return 'homework';
}

export function ClassroomLayoutShell({ classId, children }: ClassroomLayoutShellProps) {
  const pathname = usePathname();
  const [classDetail, setClassDetail] = useState<ClassroomDetailResponse>(getMockClassroomDetail(classId));
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        setDetailError('');
        const detail = await api.getClassById(classId);
        setClassDetail(detail);
      } catch (error: any) {
        setDetailError(error?.message || 'Failed to load classroom details');
      }
    };

    fetchClassDetail();
  }, [classId]);

  const activeTab = useMemo(() => activeTabFromPath(pathname), [pathname]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 shadow-xl w-full" style={glassStyle}>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl text-gray-800 font-bold">{classDetail.name}</h2>
          <p className="text-sm text-gray-600">
            {`Subject: ${classDetail.subject} • Target Level: ${classDetail.target_level || '-'} • Organization: ${classDetail.organization_name || '-'} • Teacher: ${classDetail.teacher_name} • Students: ${classDetail.num_students}`}
          </p>

          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="homework" asChild>
                <Link href={`/class/${classId}/homework`}>Homework</Link>
              </TabsTrigger>
              <TabsTrigger value="students" asChild>
                <Link href={`/class/${classId}/students`}>Students</Link>
              </TabsTrigger>
              <TabsTrigger value="teachers" asChild>
                <Link href={`/class/${classId}/teachers`}>Teachers</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {detailError && (
          <p className="text-sm text-red-600 mt-4">{detailError}</p>
        )}
      </div>

      {children}
    </div>
  );
}
