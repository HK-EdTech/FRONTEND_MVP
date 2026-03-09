'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, ClassResponse, TeacherHomeworkResponse } from '@/lib/api';
import { ClassSubjectButtonCard } from '@/components/common/ClassSubjectButtonCard';
import { GlassPanel } from '@/components/common/GlassPanel';
import { HomeworkSummaryCard } from '@/components/common/HomeworkSummaryCard';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { CreateClassDialog, CreateClassDialogFormState } from '@/components/dialogs/CreateClassDialog';
import {
  HomeworkAssignmentDialog,
  HomeworkAssignmentDialogFormState,
  HomeworkDialogMode,
} from '@/components/dialogs/HomeworkAssignmentDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RecentHomeworkItem {
  id: string;
  title: string;
  subject: string;
  classIds: string[];
  dueDateRaw: string | null;
  fullScore: number | null;
  assignedClasses: number;
  assignedStudents: number;
  dueDate: string;
}

export function AssignHomework() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classError, setClassError] = useState('');
  const [recentHomeworkItems, setRecentHomeworkItems] = useState<RecentHomeworkItem[]>([]);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);
  const [homeworkError, setHomeworkError] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isHomeworkDialogOpen, setIsHomeworkDialogOpen] = useState(false);
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);
  const [homeworkDialogMode, setHomeworkDialogMode] = useState<HomeworkDialogMode>('create');
  const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null);
  const [homeworkActionError, setHomeworkActionError] = useState('');
  const [homeworkForm, setHomeworkForm] = useState<HomeworkAssignmentDialogFormState>({
    title: '',
    subject: '',
    dueDate: '',
    fullScore: '',
    classIds: [],
  });
  const [createClassForm, setCreateClassForm] = useState<CreateClassDialogFormState>({
    name: '',
    subject: '',
    targetLevel: '',
  });

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      setClassError('');
      const teacherClasses = await api.getMyTeacherClasses();
      setClasses(teacherClasses || []);
    } catch (error: any) {
      setClasses([]);
      setClassError(error?.message || 'Failed to load classes');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const toRecentHomeworkItem = (item: TeacherHomeworkResponse): RecentHomeworkItem => {
    const dueDateLabel = item.due_date
      ? `Due: ${new Date(item.due_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}`
      : 'Due: Not set';

    return {
      id: item.id,
      title: item.title || item.subject || 'Untitled Homework',
      subject: item.subject || '',
      classIds: item.assigned_class_ids?.length ? item.assigned_class_ids : item.class_id ? [item.class_id] : [],
      dueDateRaw: item.due_date,
      fullScore: item.full_score,
      assignedClasses: item.assigned_classes,
      assignedStudents: item.assigned_students,
      dueDate: dueDateLabel,
    };
  };

  const fetchRecentHomework = async () => {
    try {
      setIsLoadingHomework(true);
      setHomeworkError('');
      const homework = await api.getMyTeacherHomework();
      setRecentHomeworkItems((homework || []).map(toRecentHomeworkItem));
    } catch (error: any) {
      setRecentHomeworkItems([]);
      setHomeworkError(error?.message || 'Failed to load homework');
    } finally {
      setIsLoadingHomework(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchRecentHomework();
  }, []);

  const filteredClasses = useMemo(() => {
    const query = classSearch.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        (item.target_level || '').toLowerCase().includes(query)
    );
  }, [classes, classSearch]);

  const getClassNameById = (classId: string) => {
    const matched = classes.find((item) => item.id === classId);
    return matched?.name || 'Selected class';
  };

  const getClassSelectionLabel = (classIds: string[]) => {
    if (!classIds.length) {
      return 'Select classes';
    }

    if (classIds.length > 3) {
      return `${classIds.length} classes selected`;
    }

    return classIds.map((id) => getClassNameById(id)).join(', ');
  };

  const toggleHomeworkClassSelection = (classId: string) => {
    setHomeworkForm((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId) ? prev.classIds.filter((id) => id !== classId) : [...prev.classIds, classId],
    }));
  };

  const resetHomeworkForm = () => {
    setHomeworkForm({
      title: '',
      subject: '',
      dueDate: '',
      fullScore: '',
      classIds: [],
    });
    setActiveHomeworkId(null);
    setHomeworkActionError('');
  };

  const openCreateHomeworkDialog = () => {
    setHomeworkDialogMode('create');
    resetHomeworkForm();
    setIsHomeworkDialogOpen(true);
  };

  const openAssignHomeworkDialog = (item: RecentHomeworkItem) => {
    setHomeworkDialogMode('assign');
    setActiveHomeworkId(item.id);
    setHomeworkActionError('');
    setHomeworkForm({
      title: item.title,
      subject: item.subject,
      dueDate: item.dueDateRaw ? new Date(item.dueDateRaw).toISOString().slice(0, 10) : '',
      fullScore: item.fullScore !== null ? String(item.fullScore) : '',
      classIds: item.classIds || [],
    });
    setIsHomeworkDialogOpen(true);
  };

  const handleHomeworkDialogOpenChange = (open: boolean) => {
    setIsHomeworkDialogOpen(open);
    if (!open) {
      resetHomeworkForm();
    }
  };

  const resetCreateClassForm = () => {
    setCreateClassForm({
      name: '',
      subject: '',
      targetLevel: '',
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateClassDialogOpen(open);
    if (!open) {
      resetCreateClassForm();
    }
  };

  const handleCreateClass = async (event: FormEvent) => {
    event.preventDefault();

    const name = createClassForm.name.trim();
    const subject = createClassForm.subject.trim();
    const targetLevel = createClassForm.targetLevel.trim();

    if (!name || !subject) {
      setClassError('Class name and subject are required');
      return;
    }

    try {
      setIsCreatingClass(true);
      setClassError('');

      const created = await api.createClass({
        name,
        subject,
        target_level: targetLevel || undefined,
      });

      setClasses((prev) => [created, ...prev]);
      handleDialogOpenChange(false);
    } catch (error: any) {
      setClassError(error?.message || 'Failed to create class');
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleSubmitHomework = async (event: FormEvent) => {
    event.preventDefault();

    const title = homeworkForm.title.trim();
    const subject = homeworkForm.subject.trim();

    if (!homeworkForm.classIds.length) {
      setHomeworkActionError('Please select at least one class');
      return;
    }

    if (homeworkDialogMode === 'create' && !title) {
      setHomeworkActionError('Homework title is required');
      return;
    }

    try {
      setIsSubmittingHomework(true);
      setHomeworkActionError('');

      if (homeworkDialogMode === 'create') {
        await api.createTeacherHomework({
          title,
          subject: subject || undefined,
          due_date: homeworkForm.dueDate ? new Date(homeworkForm.dueDate).toISOString() : undefined,
          full_score: homeworkForm.fullScore !== '' ? Number(homeworkForm.fullScore) : undefined,
          class_ids: homeworkForm.classIds,
        });
      } else if (activeHomeworkId) {
        await api.assignHomeworkToClasses(activeHomeworkId, {
          class_ids: homeworkForm.classIds,
        });
      }

      handleHomeworkDialogOpenChange(false);
      fetchRecentHomework();
    } catch (error: any) {
      setHomeworkActionError(error?.message || 'Failed to save homework assignment');
    } finally {
      setIsSubmittingHomework(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassPanel>
        <SectionHeaderBar
          title="Recent Homework"
          actions={(
            <>
              <Button variant="outline" size="sm">
                Show more
              </Button>
              <Button
                size="sm"
                className="w-9 h-9 p-0 rounded-lg bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer"
                onClick={openCreateHomeworkDialog}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </>
          )}
        />

        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-4 pb-1 w-full">
          {isLoadingHomework && <StatusMessage variant="loading" text="Loading recent homework..." />}

          {!isLoadingHomework && recentHomeworkItems.length === 0 && !homeworkError && (
            <StatusMessage variant="empty" text="No homework found." />
          )}

          {!isLoadingHomework &&
            recentHomeworkItems.map((item) => (
              <HomeworkSummaryCard
                key={item.id}
                className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] lg:w-[calc(20%-0.8rem)] cursor-pointer"
                title={item.title}
                assignedText={`Assigned to ${item.assignedClasses} classes • ${item.assignedStudents} students`}
                dueText={item.dueDate}
                menuLabel="Assign to Classes"
                onMenuClick={() => openAssignHomeworkDialog(item)}
              />
            ))}
        </div>

        {homeworkError && <StatusMessage variant="error" text={homeworkError} className="mt-4" />}
      </GlassPanel>

      <GlassPanel>
        <SectionHeaderBar
          title="Your Classroom"
          actions={(
            <>
              <div className="relative w-44 sm:w-52 md:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search classes..."
                  className="pl-10 bg-white/10 border-white/30 h-9"
                  value={classSearch}
                  onChange={(event) => setClassSearch(event.target.value)}
                />
              </div>
              <Button
                size="sm"
                className="bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer"
                onClick={() => handleDialogOpenChange(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Class
              </Button>
            </>
          )}
        />

        <div className="flex flex-wrap gap-3 w-full">
          {isLoadingClasses && <StatusMessage variant="loading" text="Loading classes..." />}

          {!isLoadingClasses && filteredClasses.length === 0 && (
            <StatusMessage
              variant="empty"
              text={classSearch ? 'No classes match your search.' : 'No classes found.'}
            />
          )}

          {!isLoadingClasses &&
            filteredClasses.map((classroom) => (
              <ClassSubjectButtonCard
                key={classroom.id}
                className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(20%-0.6rem)]"
                onClick={() => router.push(`/class/${classroom.id}/homework`)}
                label={`${classroom.name} - ${classroom.subject}`}
              />
            ))}
        </div>

        {classError && <StatusMessage variant="error" text={classError} className="mt-4" />}
      </GlassPanel>

      <CreateClassDialog
        open={isCreateClassDialogOpen}
        onOpenChange={handleDialogOpenChange}
        form={createClassForm}
        onFormChange={setCreateClassForm}
        onSubmit={handleCreateClass}
        isSubmitting={isCreatingClass}
      />

      <HomeworkAssignmentDialog
        open={isHomeworkDialogOpen}
        onOpenChange={handleHomeworkDialogOpenChange}
        mode={homeworkDialogMode}
        form={homeworkForm}
        classes={classes}
        errorMessage={homeworkActionError}
        isSubmitting={isSubmittingHomework}
        onSubmit={handleSubmitHomework}
        onFormChange={setHomeworkForm}
        onToggleClass={toggleHomeworkClassSelection}
        getClassSelectionLabel={getClassSelectionLabel}
      />
    </div>
  );
}
