'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FilePlus, Users, Calendar, Send, Search, Plus } from 'lucide-react';
import { api, ClassResponse, TeacherHomeworkResponse } from '@/lib/api';
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

interface RecentHomeworkItem {
  id: string;
  title: string;
  assignedClasses: number;
  assignedStudents: number;
  dueDate: string;
}

interface CreateClassFormState {
  name: string;
  subject: string;
  targetLevel: string;
}

export function AssignHomework() {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classError, setClassError] = useState('');
  const [recentHomeworkItems, setRecentHomeworkItems] = useState<RecentHomeworkItem[]>([]);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);
  const [homeworkError, setHomeworkError] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [createClassForm, setCreateClassForm] = useState<CreateClassFormState>({
    name: '',
    subject: '',
    targetLevel: '',
  });

  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

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
    return classes.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      (item.target_level || '').toLowerCase().includes(query)
    );
  }, [classes, classSearch]);

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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();

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

  return (
    <div className="space-y-6">
      {/* Content */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
            <FilePlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-800">Homework Assignment</h2>
            <p className="text-sm text-gray-600">Easily distribute homework to your classes</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            This module is currently under development. Features coming soon:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700">
            <li>• Create custom homework assignments</li>
            <li>• Assign to specific classes or students</li>
            <li>• Set deadlines and priorities</li>
            <li>• Track completion status</li>
          </ul>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Students</h3>
            <p className="text-sm text-gray-600">Manage student lists</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Calendar className="w-8 h-8 text-teal-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Schedule</h3>
            <p className="text-sm text-gray-600">Set due dates</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <Send className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-gray-800 font-medium">Distribute</h3>
            <p className="text-sm text-gray-600">Send assignments</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 shadow-xl w-full" style={glassStyle}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-xl text-gray-800">Recent Homework</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Show more
            </Button>
            <Button size="sm" className="bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer">
              <Plus className="w-4 h-4 mr-1" />
              New Homework
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-4 pb-1 w-full">
          {isLoadingHomework && (
            <p className="text-sm text-gray-600">Loading recent homework...</p>
          )}

          {!isLoadingHomework && recentHomeworkItems.length === 0 && !homeworkError && (
            <p className="text-sm text-gray-600">No homework found.</p>
          )}

          {!isLoadingHomework && recentHomeworkItems.map((item) => (
            <div
              key={item.id}
              className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] lg:w-[calc(20%-0.8rem)] bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-full h-28 rounded-lg bg-gray-200/60 mb-3" />
              <h3 className="text-gray-800 font-bold">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Users className="w-4 h-4 text-purple-500" />
                {`Assigned to ${item.assignedClasses} classes • ${item.assignedStudents} students`}
              </p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-teal-500" />
                {item.dueDate}
              </p>
            </div>
          ))}
        </div>

        {homeworkError && (
          <p className="text-sm text-red-600 mt-4">{homeworkError}</p>
        )}
      </div>

      <div className="rounded-2xl p-6 shadow-xl w-full" style={glassStyle}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-xl text-gray-800">Your Classroom</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-44 sm:w-52 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search classes..."
                className="pl-10 bg-white/10 border-white/30 h-9"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
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
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full">
          {isLoadingClasses && (
            <p className="text-sm text-gray-600">Loading classes...</p>
          )}

          {!isLoadingClasses && filteredClasses.length === 0 && (
            <p className="text-sm text-gray-600">
              {classSearch ? 'No classes match your search.' : 'No classes found.'}
            </p>
          )}

          {!isLoadingClasses && filteredClasses.map((classroom) => (
            <div
              key={classroom.id}
              className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(20%-0.6rem)] xl:w-[calc(10%-0.675rem)] min-h-12 min-w-[110px] bg-white border border-white/10 rounded-xl px-3 py-3 flex items-center justify-center text-sm font-bold text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {classroom.name}
            </div>
          ))}
        </div>

        {classError && (
          <p className="text-sm text-red-600 mt-4">{classError}</p>
        )}
      </div>

      <Dialog open={isCreateClassDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Classroom</DialogTitle>
            <DialogDescription>
              Enter classroom details to create a new class record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                value={createClassForm.name}
                onChange={(e) => setCreateClassForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sec 4 Science"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-subject">Subject</Label>
              <Input
                id="class-subject"
                value={createClassForm.subject}
                onChange={(e) => setCreateClassForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g. Physics"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-target-level">Target Level (Optional)</Label>
              <Input
                id="class-target-level"
                value={createClassForm.targetLevel}
                onChange={(e) => setCreateClassForm((prev) => ({ ...prev, targetLevel: e.target.value }))}
                placeholder="e.g. Secondary 4"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={isCreatingClass}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-purple-500 to-teal-500 text-white"
                disabled={isCreatingClass}
              >
                {isCreatingClass ? 'Creating...' : 'Create Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
