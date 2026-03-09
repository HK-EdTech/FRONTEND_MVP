'use client';

import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, ClassResponse, ClassroomHomeworkResponse } from '@/lib/api';
import { ClassSubjectButtonCard } from '@/components/common/ClassSubjectButtonCard';
import { GlassPanel } from '@/components/common/GlassPanel';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { Button } from '@/components/ui/button';

interface ClassManagementHomeworkItem {
  id: string;
  title: string;
  dueDate: string | null;
  createdAt: string;
}

interface ClassManagementSubject {
  id: string;
  subject: string;
  homework: ClassManagementHomeworkItem[];
}

interface ClassManagementGroup {
  subjects: ClassManagementSubject[];
}

interface ClassManagementGroupsResponse {
  groups: Record<string, ClassManagementGroup>;
}

const mockTeacherClasses: ClassResponse[] = [
  {
    id: 'mock-class-1a-chinese',
    name: '1A',
    subject: 'Chinese',
    target_level: 'Primary 1',
    teacher_id: 'mock-teacher-1',
    organization_id: 'mock-org-1',
    created_at: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'mock-class-1a-english',
    name: '1A',
    subject: 'English',
    target_level: 'Primary 1',
    teacher_id: 'mock-teacher-1',
    organization_id: 'mock-org-1',
    created_at: '2026-02-02T00:00:00.000Z',
  },
  {
    id: 'mock-class-1b-chinese',
    name: '1B',
    subject: 'Chinese',
    target_level: 'Primary 1',
    teacher_id: 'mock-teacher-1',
    organization_id: 'mock-org-1',
    created_at: '2026-02-03T00:00:00.000Z',
  },
];

const mockHomeworkByClassId: Record<string, ClassroomHomeworkResponse[]> = {
  'mock-class-1a-chinese': [
    {
      id: 'mock-hw-1',
      title: 'Chinese Worksheet 1',
      subject: 'Chinese',
      class_id: 'mock-class-1a-chinese',
      due_date: '2026-03-12T00:00:00.000Z',
      assigned_students: 28,
      created_at: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'mock-hw-2',
      title: 'Reading Comprehension',
      subject: 'Chinese',
      class_id: 'mock-class-1a-chinese',
      due_date: '2026-03-14T00:00:00.000Z',
      assigned_students: 28,
      created_at: '2026-03-03T00:00:00.000Z',
    },
    {
      id: 'mock-hw-3',
      title: 'Vocabulary Revision',
      subject: 'Chinese',
      class_id: 'mock-class-1a-chinese',
      due_date: null,
      assigned_students: 28,
      created_at: '2026-03-05T00:00:00.000Z',
    },
  ],
  'mock-class-1a-english': [
    {
      id: 'mock-hw-4',
      title: 'English Dictation',
      subject: 'English',
      class_id: 'mock-class-1a-english',
      due_date: '2026-03-11T00:00:00.000Z',
      assigned_students: 28,
      created_at: '2026-03-02T00:00:00.000Z',
    },
  ],
  'mock-class-1b-chinese': [
    {
      id: 'mock-hw-5',
      title: 'Character Practice',
      subject: 'Chinese',
      class_id: 'mock-class-1b-chinese',
      due_date: '2026-03-10T00:00:00.000Z',
      assigned_students: 27,
      created_at: '2026-03-01T00:00:00.000Z',
    },
  ],
};

const emptyGroupsResponse: ClassManagementGroupsResponse = { groups: {} };

function buildClassManagementGroups(
  classes: ClassResponse[],
  homeworkByClassId: Record<string, ClassroomHomeworkResponse[]>
): ClassManagementGroupsResponse {
  const groups: Record<string, ClassManagementGroup> = {};

  const sortedClasses = [...classes].sort((a, b) => {
    const classNameCompare = a.name.localeCompare(b.name);
    if (classNameCompare !== 0) return classNameCompare;
    return a.subject.localeCompare(b.subject);
  });

  for (const classroom of sortedClasses) {
    if (!groups[classroom.name]) {
      groups[classroom.name] = { subjects: [] };
    }

    const sortedHomework = [...(homeworkByClassId[classroom.id] || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    groups[classroom.name].subjects.push({
      id: classroom.id,
      subject: classroom.subject,
      homework: sortedHomework.map((item) => ({
        id: item.id,
        title: item.title || item.subject || 'Untitled Homework',
        dueDate: item.due_date,
        createdAt: item.created_at,
      })),
    });
  }

  return { groups };
}

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
  const [data, setData] = useState<ClassManagementGroupsResponse>(emptyGroupsResponse);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadClassManagement = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const teacherClasses = await api.getMyTeacherClasses();

        const homeworkEntries = await Promise.all(
          teacherClasses.map(async (classroom) => {
            const homework = await api.getClassHomework(classroom.id);
            return [classroom.id, homework] as const;
          })
        );

        if (isCancelled) return;

        setData(
          buildClassManagementGroups(
            teacherClasses,
            Object.fromEntries(homeworkEntries)
          )
        );
      } catch (error: any) {
        if (isCancelled) return;

        setData(buildClassManagementGroups(mockTeacherClasses, mockHomeworkByClassId));
        setErrorMessage(
          `${error?.message || 'Failed to load live class management data'}. Showing sample data instead.`
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadClassManagement();

    return () => {
      isCancelled = true;
    };
  }, []);

  const groupEntries = Object.entries(data.groups);

  return (
    <div className="space-y-6">
      <GlassPanel>
        <SectionHeaderBar
          title="Class Management"
          titleClassName="font-bold"
        />
        <p className="text-sm text-gray-600">
          Review your classes by form, switch between subjects, and prepare homework upload flows.
        </p>

        {isLoading && (
          <StatusMessage variant="loading" text="Loading class management..." className="mt-4" />
        )}

        {!isLoading && errorMessage && (
          <StatusMessage variant="error" text={errorMessage} className="mt-4" />
        )}

        {!isLoading && groupEntries.length === 0 && !errorMessage && (
          <StatusMessage variant="empty" text="No classes found." className="mt-4" />
        )}
      </GlassPanel>

      {!isLoading && groupEntries.map(([className, group]) => (
        <GlassPanel key={className}>
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{className}</h2>
              <p className="text-sm text-gray-600">
                {`${group.subjects.length} subject${group.subjects.length > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {group.subjects.map((subject) => (
                <div key={subject.id} className="space-y-3">
                  <ClassSubjectButtonCard
                    label={subject.subject}
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
                          <p className="truncate text-sm font-medium text-gray-800">{homework.title}</p>
                          <p className="text-xs text-gray-500">{formatDueDate(homework.dueDate)}</p>
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
