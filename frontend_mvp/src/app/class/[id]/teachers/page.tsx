'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api, ClassroomTeacherResponse } from '@/lib/api';
import { mockTeachers } from '@/components/classroom/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [teacherForm, setTeacherForm] = useState({ fullName: '', username: '' });

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
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-xl text-gray-800 font-bold">Teachers</h2>
        <Button
          size="sm"
          className="w-9 h-9 p-0 rounded-lg bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isLoadingTeachers && (
        <p className="text-sm text-gray-600">Loading teachers...</p>
      )}

      {!isLoadingTeachers && (
        <div className="flex flex-col gap-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="w-full min-w-[220px] bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={teacher.avatar_url || ''} alt={teacher.full_name} />
                  <AvatarFallback>{initialsFromName(teacher.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-800 font-bold">{teacher.full_name}</p>
                  <p className="text-sm text-gray-600">@{teacher.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoadingTeachers && teachers.length === 0 && (
        <p className="text-sm text-gray-600">No teachers found.</p>
      )}

      {teacherError && (
        <p className="text-sm text-red-600 mt-4">{teacherError}</p>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
            <DialogDescription>
              Teacher management flow will be added in the next iteration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-name">Full Name</Label>
              <Input
                id="teacher-name"
                value={teacherForm.fullName}
                onChange={(event) => setTeacherForm((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="e.g. Ms. Wong"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher-username">Username</Label>
              <Input
                id="teacher-username"
                value={teacherForm.username}
                onChange={(event) => setTeacherForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="e.g. mswong"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
