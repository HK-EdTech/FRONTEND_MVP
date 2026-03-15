'use client';

import { useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ClassManagementResponse } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ClassSubjectButtonCard } from '@/components/common/ClassSubjectButtonCard';
import { GlassPanel } from '@/components/common/GlassPanel';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClassManagement } from '@/store/slices/classManagementSlice';

const emptyGroupsResponse: ClassManagementResponse = [];

function formatDueDate(value: string | null) {
  if (!value) return 'No due date';

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ClassManagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { groups, status, error } = useAppSelector((state) => state.classManagement);
  const isLoading = status === 'loading' || status === 'idle';
  const errorMessage = error || '';
  const data = groups && groups.length ? groups : emptyGroupsResponse;

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchClassManagement());
    }
  }, [dispatch, status]);

  return (
    <div className="space-y-6">
      <GlassPanel>
        <Breadcrumb items={[{ label: 'Classes' }]} />
        <SectionHeaderBar
          title="Class Management"
          titleClassName="font-bold"
        />
        <p className="text-sm text-gray-600">
          Review your classes by class and subjects.
        </p>

        {isLoading && (
          <StatusMessage variant="loading" text="Loading class management..." className="mt-4" />
        )}

        {!isLoading && errorMessage && (
          <StatusMessage variant="error" text={errorMessage} className="mt-4" />
        )}

        {!isLoading && data.length === 0 && !errorMessage && (
          <StatusMessage variant="empty" text="No classes found." className="mt-4" />
        )}
      </GlassPanel>

      {!isLoading && data.map((group) => (
        <GlassPanel key={group.className}>
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{group.className}</h2>
              <p className="text-sm text-gray-600">
                {`${group.subjects.length} subject${group.subjects.length > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {group.subjects.map((subject) => (
                <div key={subject.id} className="space-y-3">
                  <ClassSubjectButtonCard
                    label={subject.subjectName}
                    className="min-h-14 justify-center px-4 text-base"
                    onClick={() => router.push(`/class/${subject.id}/homework`)}
                  />

                  <div className="overflow-hidden rounded-xl border border-white/20 bg-white/60">
                    {subject.homework.length === 0 && (
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-600">No homework assigned.</p>
                      </div>
                    )}

                    {subject.homework.map((homework, index) => (
                      <div
                        
                        key={homework.id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 ${
                          index !== subject.homework.length - 1 ? 'border-b border-white/30' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <a href={`/class/${subject.id}/homework/${homework.id}`} className="truncate text-sm font-medium text-gray-800 hover:underline">
                            {homework.title || 'Untitled Homework'}
                          </a>
                          <p className="text-xs text-gray-500">{formatDueDate(homework.due_date)}</p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0 bg-transparent"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
