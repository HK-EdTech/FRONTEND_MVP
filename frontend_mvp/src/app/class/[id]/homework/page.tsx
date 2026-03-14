'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { api, ClassroomHomeworkResponse } from '@/lib/api';
import { HomeworkSummaryCard } from '@/components/common/HomeworkSummaryCard';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import {
  CreateClassHomeworkDialog,
  CreateClassHomeworkDialogFormState,
} from '@/components/dialogs/CreateClassHomeworkDialog';
import { Button } from '@/components/ui/button';
import { mockHomeworkItems } from '@/components/class/mockData';

export default function ClassroomHomeworkPage() {
  const params = useParams();
  const router = useRouter();
  const classId = String(params.id || '');

  const [homeworkItems, setHomeworkItems] = useState<ClassroomHomeworkResponse[]>(mockHomeworkItems);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);
  const [homeworkError, setHomeworkError] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingHomework, setIsCreatingHomework] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState<CreateClassHomeworkDialogFormState>({
    title: '',
    subject: '',
    dueDate: '',
  });

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setIsLoadingHomework(true);
        setHomeworkError('');
        const response = await api.getClassHomework(classId);
        if (response.length > 0) {
          setHomeworkItems(response);
        }
      } catch (error: any) {
        setHomeworkError(error?.message || 'Failed to load class homework');
      } finally {
        setIsLoadingHomework(false);
      }
    };

    fetchHomework();
  }, [classId]);

  const sortedHomework = useMemo(
    () =>
      [...homeworkItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [homeworkItems]
  );

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return 'Due: Not set';
    return `Due: ${new Date(dueDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;
  };

  const handleCreateHomework = async (event: FormEvent) => {
    event.preventDefault();

    const title = homeworkForm.title.trim();
    const subject = homeworkForm.subject.trim();

    if (!title) {
      setHomeworkError('Homework title is required');
      return;
    }

    try {
      setIsCreatingHomework(true);
      setHomeworkError('');

      const created = await api.createClassHomework(classId, {
        title,
        subject: subject || undefined,
        due_date: homeworkForm.dueDate ? new Date(homeworkForm.dueDate).toISOString() : undefined,
      });

      setHomeworkItems((prev) => [created, ...prev]);
      setIsCreateDialogOpen(false);
      setHomeworkForm({ title: '', subject: '', dueDate: '' });
    } catch (error: any) {
      setHomeworkError(error?.message || 'Failed to create homework');
    } finally {
      setIsCreatingHomework(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg">
      <SectionHeaderBar
        title="Homework"
        titleClassName="font-bold"
        actions={(
          <Button
            size="sm"
            className="w-9 h-9 p-0 rounded-lg bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      />

      <div className="flex gap-4 pb-1 flex-wrap">
        {isLoadingHomework && (
          <StatusMessage variant="loading" text="Loading class homework..." />
        )}

        {!isLoadingHomework && sortedHomework.map((item) => (
          <HomeworkSummaryCard
            key={item.id}
            className="flex-none w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] lg:w-[calc(20%-0.8rem)] bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            title={item.title || item.subject || 'Untitled Homework'}
            assignedText={`Assigned to ${item.assigned_students} students`}
            dueText={formatDueDate(item.due_date)}
            onClick={() => router.push(`/class/${classId}/homework/${item.id}`)}
          />
        ))}
      </div>

      {homeworkError && (
        <StatusMessage variant="error" text={homeworkError} className="mt-4" />
      )}

      <CreateClassHomeworkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        form={homeworkForm}
        onFormChange={setHomeworkForm}
        onSubmit={handleCreateHomework}
        isSubmitting={isCreatingHomework}
      />
    </div>
  );
}
