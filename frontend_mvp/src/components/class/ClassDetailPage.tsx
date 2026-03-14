'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { api, ClassroomDetailResponse } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { GlassPanel } from '@/components/common/GlassPanel';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [classDetail, setClassDetail] = useState<ClassroomDetailResponse>(getMockClassroomDetail(classId));
  const [detailError, setDetailError] = useState('');
  const [homeworkTitle, setHomeworkTitle] = useState('');

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

  const homeworkId = Array.isArray(params.homeworkId) ? params.homeworkId[0] : (params.homeworkId as string | undefined);
  const isHomeworkDetail = Boolean(homeworkId);

  useEffect(() => {
    if (!homeworkId) {
      setHomeworkTitle('');
      return;
    }

    const fetchHomeworkTitle = async () => {
      try {
        const homeworkList = await api.getClassHomework(classId);
        const match = homeworkList.find((item) => item.id === homeworkId);
        setHomeworkTitle(match?.title || match?.subject || 'Homework');
      } catch (error: any) {
        setHomeworkTitle('Homework');
      }
    };

    fetchHomeworkTitle();
  }, [classId, homeworkId]);

  const activeTab = useMemo(() => activeTabFromPath(pathname), [pathname]);
  const showClassDetailTabs = useMemo(() => {
    return (
      (pathname.includes('/homework') && !pathname.includes('/homework/')) ||
      (pathname.includes('/students') && !pathname.includes('/students/')) ||
      (pathname.includes('/teachers') && !pathname.includes('/teachers/'))
    );
  }, [isHomeworkDetail, pathname]);
  const classLabel = `${classDetail.name} - ${classDetail.subject}`;
  const headerTitle = isHomeworkDetail ? (homeworkTitle || 'Homework') : classDetail.name;

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
            {`Subject: ${classDetail.subject} • Target Level: ${classDetail.target_level || '-'} • Organization: ${classDetail.organization_name || '-'} • Teacher: ${classDetail.teacher_name} • Students: ${classDetail.num_students}`}
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
