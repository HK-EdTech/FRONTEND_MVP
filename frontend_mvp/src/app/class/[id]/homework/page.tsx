'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { HomeworkSummaryCard } from '@/components/common/HomeworkSummaryCard';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import {
  CreateClassHomeworkDialog,
  CreateClassHomeworkDialogFormState,
} from '@/components/dialogs/CreateClassHomeworkDialog';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createClassHomework, fetchClassHomework } from '@/store/slices/classHomeworkSlice';

export default function ClassroomHomeworkPage() {
  const params = useParams();
  const router = useRouter();
  const classId = String(params.id || '');
  const dispatch = useAppDispatch();
  const homeworkItems = useAppSelector((state) => state.classHomework.itemsByClassId[classId] || []);
  const homeworkStatus = useAppSelector((state) => state.classHomework.statusByClassId[classId] || 'idle');
  const homeworkError = useAppSelector((state) => state.classHomework.errorByClassId[classId] || '');
  const createStatus = useAppSelector((state) => state.classHomework.createStatusByClassId[classId] || 'idle');
  const createError = useAppSelector((state) => state.classHomework.createErrorByClassId[classId] || '');
  const isLoadingHomework = homeworkStatus === 'loading' || homeworkStatus === 'idle';

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [homeworkForm, setHomeworkForm] = useState<CreateClassHomeworkDialogFormState>({
    title: '',
    subject: '',
    dueDate: '',
  });

  useEffect(() => {
    if (homeworkStatus === 'idle') {
      dispatch(fetchClassHomework(classId));
    }
  }, [classId, dispatch, homeworkStatus]);

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
      setFormError('Homework title is required');
      return;
    }

    try {
      setFormError('');
      await dispatch(
        createClassHomework({
          classId,
          data: {
            title,
            subject: subject || undefined,
            due_date: homeworkForm.dueDate ? new Date(homeworkForm.dueDate).toISOString() : undefined,
          },
        })
      ).unwrap();
      setIsCreateDialogOpen(false);
      setHomeworkForm({ title: '', subject: '', dueDate: '' });
    } catch (error: any) {
      setFormError(error?.message || 'Failed to create homework');
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

      {(formError || createError || homeworkError) && (
        <StatusMessage variant="error" text={formError || createError || homeworkError} className="mt-4" />
      )}

      <CreateClassHomeworkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        form={homeworkForm}
        onFormChange={setHomeworkForm}
        onSubmit={handleCreateHomework}
        isSubmitting={createStatus === 'loading'}
      />
    </div>
  );
}
