'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PersonInfoCard } from '@/components/common/PersonInfoCard';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { AddTeacherDialog, AddTeacherDialogFormState } from '@/components/dialogs/AddTeacherDialog';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClassTeachers } from '@/store/slices/classTeachersSlice';

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function ClassroomTeachersPage() {
  const params = useParams();
  const classId = String(params.id || '');
  const dispatch = useAppDispatch();
  const teachers = useAppSelector((state) => state.classTeachers.teachersByClassId[classId] || []);
  const teachersStatus = useAppSelector((state) => state.classTeachers.statusByClassId[classId] || 'idle');
  const teacherError = useAppSelector((state) => state.classTeachers.errorByClassId[classId] || '');
  const isLoadingTeachers = teachersStatus === 'loading' || teachersStatus === 'idle';

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState<AddTeacherDialogFormState>({ fullName: '', username: '' });

  useEffect(() => {
    if (teachersStatus === 'idle') {
      dispatch(fetchClassTeachers(classId));
    }
  }, [classId, dispatch, teachersStatus]);

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg">
      <SectionHeaderBar
        title="Teachers"
        titleClassName="font-bold"
        actions={(
          <Button
            size="sm"
            className="w-9 h-9 p-0 rounded-lg bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      />

      {isLoadingTeachers && (
        <StatusMessage variant="loading" text="Loading teachers..." />
      )}

      {!isLoadingTeachers && (
        <div className="flex flex-col gap-3">
          {teachers.map((teacher) => (
            <PersonInfoCard
              key={teacher.id}
              name={teacher.full_name}
              subtitle={`@${teacher.username}`}
              avatarUrl={teacher.avatar_url}
              fallback={initialsFromName(teacher.full_name)}
            />
          ))}
        </div>
      )}

      {!isLoadingTeachers && teachers.length === 0 && (
        <StatusMessage variant="empty" text="No teachers found." />
      )}

      {teacherError && (
        <StatusMessage variant="error" text={teacherError} className="mt-4" />
      )}

      <AddTeacherDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        form={teacherForm}
        onFormChange={setTeacherForm}
      />
    </div>
  );
}
