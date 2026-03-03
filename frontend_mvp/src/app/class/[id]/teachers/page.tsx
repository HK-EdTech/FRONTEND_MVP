'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api, ClassroomTeacherResponse } from '@/lib/api';
import { PersonInfoCard } from '@/components/common/PersonInfoCard';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { mockTeachers } from '@/components/classroom/mockData';
import { AddTeacherDialog, AddTeacherDialogFormState } from '@/components/dialogs/AddTeacherDialog';
import { Button } from '@/components/ui/button';

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

  const [teachers, setTeachers] = useState<ClassroomTeacherResponse[]>(mockTeachers);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [teacherError, setTeacherError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState<AddTeacherDialogFormState>({ fullName: '', username: '' });

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        setTeacherError('');
        const response = await api.getClassTeachers(classId);
        if (response.length > 0) {
          setTeachers(response);
        }
      } catch (error: any) {
        setTeacherError(error?.message || 'Failed to load teachers');
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [classId]);

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
