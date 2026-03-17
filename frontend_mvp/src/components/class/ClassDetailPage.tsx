'use client';

import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { GlassPanel } from '@/components/common/GlassPanel';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClassDetail } from '@/store/slices/classDetailSlice';
import { fetchClassHomework } from '@/store/slices/classHomeworkSlice';
import { getMockClassroomDetail } from './mockData';

interface ClassDetailPageProps {
  classId: string;
  children: ReactNode;
}

function activeTabFromPath(pathname: string): 'homework' | 'students' | 'teachers' {
  if (pathname.includes('/students')) return 'students';
  if (pathname.includes('/teachers')) return 'teachers';
  return 'homework';
}

export function ClassDetailPage({ classId, children }: ClassDetailPageProps) {
  const params = useParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const classDetail = useAppSelector((state) => state.classDetail.entities[classId]);
  const classDetailStatus = useAppSelector((state) => state.classDetail.statusById[classId] || 'idle');
  const detailError = useAppSelector((state) => state.classDetail.errorById[classId] || '');
  const homeworkItems = useAppSelector((state) => state.classHomework.itemsByClassId[classId] || []);
  const homeworkStatus = useAppSelector((state) => state.classHomework.statusByClassId[classId] || 'idle');

  useEffect(() => {
    if (classDetailStatus === 'idle') {
      dispatch(fetchClassDetail(classId));
    }
  }, [classDetailStatus, classId, dispatch]);

  const homeworkId = Array.isArray(params.homeworkId) ? params.homeworkId[0] : (params.homeworkId as string | undefined);
  const isHomeworkDetail = Boolean(homeworkId);

  useEffect(() => {
    if (!homeworkId) return;
    if (homeworkStatus === 'idle') {
      dispatch(fetchClassHomework(classId));
    }
  }, [classId, dispatch, homeworkId, homeworkStatus]);

  const activeTab = useMemo(() => activeTabFromPath(pathname), [pathname]);
  const showClassDetailTabs = useMemo(() => {
    return (
      (pathname.includes('/homework') && !pathname.includes('/homework/')) ||
      (pathname.includes('/students') && !pathname.includes('/students/')) ||
      (pathname.includes('/teachers') && !pathname.includes('/teachers/'))
    );
  }, [isHomeworkDetail, pathname]);
  const resolvedDetail = classDetail || getMockClassroomDetail(classId);
  const homeworkTitle = useMemo(() => {
    if (!homeworkId) return '';
    const match = homeworkItems.find((item) => item.id === homeworkId);
    return match?.title || match?.subject || 'Homework';
  }, [homeworkId, homeworkItems]);
  const classLabel = `${resolvedDetail.name} - ${resolvedDetail.subject}`;
  const headerTitle = isHomeworkDetail ? (homeworkTitle || 'Homework') : resolvedDetail.name;

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'Classes', href: '/class' },
      { label: classLabel, href: `/class/${classId}/homework` },
    ];

    if (pathname.includes('/students')) {
      items.push({ label: 'Students', href: `/class/${classId}/students` });
    } else if (pathname.includes('/teachers')) {
      items.push({ label: 'Teachers', href: `/class/${classId}/teachers` });
    } else if (pathname.includes('/homework')) {
      items.push({ label: 'Homework', href: `/class/${classId}/homework` });
      if (isHomeworkDetail) {
        items.push({ label: homeworkTitle || 'Homework', href: `/class/${classId}/homework/${homeworkId}` });
      }
    }

    return items;
  }, [classId, classLabel, homeworkTitle, isHomeworkDetail, pathname]);

  return (
    <div className="space-y-6">
      <GlassPanel>
        <div className="flex flex-col gap-3">
          <Breadcrumb items={breadcrumbItems} />
          <SectionHeaderBar
            title={headerTitle}
            className="mb-0"
            titleClassName="font-bold"
          />
          <p className="text-sm text-gray-600">
            {`Subject: ${resolvedDetail.subject} • Target Level: ${resolvedDetail.target_level || '-'} • Organization: ${resolvedDetail.organization_name || '-'} • Teacher: ${resolvedDetail.teacher_name} • Students: ${resolvedDetail.num_students}`}
          </p>

          {showClassDetailTabs && (
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
          )}
        </div>

        {detailError && (
          <StatusMessage variant="error" text={detailError} className="mt-4" />
        )}
      </GlassPanel>

      {children}
    </div>
  );
}
