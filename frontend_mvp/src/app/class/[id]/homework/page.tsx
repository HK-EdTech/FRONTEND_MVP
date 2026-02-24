'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Plus, Users } from 'lucide-react';
import { api, ClassroomHomeworkResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockHomeworkItems } from '@/components/classroom/mockData';

interface HomeworkFormState {
  title: string;
  subject: string;
  dueDate: string;
}

export default function ClassroomHomeworkPage() {
  const params = useParams();
  const router = useRouter();
  const classId = String(params.id || '');

  const [homeworkItems, setHomeworkItems] = useState<ClassroomHomeworkResponse[]>(mockHomeworkItems);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);
  const [homeworkError, setHomeworkError] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingHomework, setIsCreatingHomework] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState<HomeworkFormState>({
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
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-xl text-gray-800 font-bold">Homework</h2>
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm">
            Show more
          </Button> */}
          <Button
            size="sm"
            className="w-9 h-9 p-0 rounded-lg bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 pb-1 flex-wrap">
        {isLoadingHomework && (
          <p className="text-sm text-gray-600">Loading class homework...</p>
        )}

        {!isLoadingHomework && sortedHomework.map((item) => (
          <button
            key={item.id}
            type="button"
            className="flex-none w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] lg:w-[calc(20%-0.8rem)] bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => router.push(`/class/${classId}/homework/${item.id}`)}
          >
            <div className="w-full h-28 rounded-lg bg-gray-200/60 mb-3" />
            <h3 className="text-gray-800 font-bold">{item.title || item.subject || 'Untitled Homework'}</h3>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <Users className="w-4 h-4 text-purple-500" />
              {`Assigned to ${item.assigned_students} students`}
            </p>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-teal-500" />
              {formatDueDate(item.due_date)}
            </p>
          </button>
        ))}
      </div>

      {homeworkError && (
        <p className="text-sm text-red-600 mt-4">{homeworkError}</p>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Homework</DialogTitle>
            <DialogDescription>
              Enter homework details for this classroom.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHomework} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="homework-title">Title</Label>
              <Input
                id="homework-title"
                value={homeworkForm.title}
                onChange={(event) => setHomeworkForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="e.g. Algebra Revision"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homework-subject">Subject (Optional)</Label>
              <Input
                id="homework-subject"
                value={homeworkForm.subject}
                onChange={(event) => setHomeworkForm((prev) => ({ ...prev, subject: event.target.value }))}
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homework-due-date">Due Date (Optional)</Label>
              <Input
                id="homework-due-date"
                type="date"
                value={homeworkForm.dueDate}
                onChange={(event) => setHomeworkForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreatingHomework}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-purple-500 to-teal-500 text-white"
                disabled={isCreatingHomework}
              >
                {isCreatingHomework ? 'Creating...' : 'Create Homework'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
