'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { ArrowUpDown, Plus, Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api, ClassroomStudentResponse } from '@/lib/api';
import { mockStudents } from '@/components/classroom/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type StudentViewMode = 'table' | 'list' | 'card';
type SortOrder = 'asc' | 'desc';

interface AddStudentFormState {
  studentId: string;
  username: string;
  fullName: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function ClassroomStudentsPage() {
  const params = useParams();
  const classId = String(params.id || '');

  const [students, setStudents] = useState<ClassroomStudentResponse[]>(mockStudents);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [studentError, setStudentError] = useState('');
  const [viewMode, setViewMode] = useState<StudentViewMode>('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState<AddStudentFormState>({
    studentId: '',
    username: '',
    fullName: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        setStudentError('');
        const response = await api.getClassStudents(classId);
        if (response.length > 0) {
          setStudents(response);
        }
      } catch (error: any) {
        setStudentError(error?.message || 'Failed to load students');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [classId]);

  const visibleStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...students]
      .filter((student) => (statusFilter === 'all' ? true : student.status.toLowerCase() === statusFilter))
      .filter((student) => {
        if (!query) return true;
        return (
          student.full_name.toLowerCase().includes(query) ||
          student.username.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const compare = a.full_name.localeCompare(b.full_name);
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [students, statusFilter, searchQuery, sortOrder]);

  const allVisibleSelected = visibleStudents.length > 0 && visibleStudents.every((student) => selectedIds.has(student.id));

  const toggleAllVisible = (checked: CheckedState) => {
    const next = new Set(selectedIds);
    if (checked) {
      visibleStudents.forEach((student) => next.add(student.id));
    } else {
      visibleStudents.forEach((student) => next.delete(student.id));
    }
    setSelectedIds(next);
  };

  const toggleSingleSelection = (studentId: string, checked: CheckedState) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(studentId);
    } else {
      next.delete(studentId);
    }
    setSelectedIds(next);
  };

  const handleAddStudent = async (event: FormEvent) => {
    event.preventDefault();

    const studentId = addStudentForm.studentId.trim();
    const username = addStudentForm.username.trim();
    const fullName = addStudentForm.fullName.trim();

    if (!studentId && !username && !fullName) {
      setStudentError('Provide at least one of student ID, username, or full name');
      return;
    }

    try {
      setIsAddingStudent(true);
      setStudentError('');

      const created = await api.addClassStudent(classId, {
        student_id: studentId || undefined,
        username: username || undefined,
        full_name: fullName || undefined,
      });

      setStudents((prev) => [created, ...prev]);
      setIsAddDialogOpen(false);
      setAddStudentForm({ studentId: '', username: '', fullName: '' });
    } catch (error: any) {
      setStudentError(error?.message || 'Failed to add student');
    } finally {
      setIsAddingStudent(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl text-gray-800 font-bold">Students</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-44 sm:w-52 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                className="pl-10 bg-white/10 border-white/30 h-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="w-9 h-9 p-0 rounded-lg bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg cursor-pointer"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => {
              if (!value) return;
              setViewMode(value as StudentViewMode);
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="table">Table</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
            <ToggleGroupItem value="card">Card</ToggleGroupItem>
          </ToggleGroup>

          <div className="w-36">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoadingStudents && (
        <p className="text-sm text-gray-600">Loading students...</p>
      )}

      {!isLoadingStudents && viewMode === 'table' && (
        <div className="rounded-xl border border-white/20 bg-white shadow-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAllVisible} />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-gray-800"
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  >
                    Name
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(student.id)}
                      onCheckedChange={(checked) => toggleSingleSelection(student.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={student.avatar_url || ''} alt={student.full_name} />
                        <AvatarFallback>{initialsFromName(student.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-gray-800 font-bold">{student.full_name}</p>
                        <p className="text-xs text-gray-600">@{student.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.class_level || '-'}</TableCell>
                  <TableCell className="capitalize">{student.status}</TableCell>
                  <TableCell>{formatDate(student.enrolled_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoadingStudents && viewMode === 'list' && (
        <div className="flex flex-col gap-3">
          {visibleStudents.map((student) => (
            <div
              key={student.id}
              className="w-full min-w-[220px] bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={student.avatar_url || ''} alt={student.full_name} />
                  <AvatarFallback>{initialsFromName(student.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-800 font-bold">{student.full_name}</p>
                  <p className="text-sm text-gray-600">@{student.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoadingStudents && viewMode === 'card' && (
        <div className="flex flex-wrap gap-3 w-full">
          {visibleStudents.map((student) => (
            <div
              key={student.id}
              className="w-[calc(50%-0.375rem)] md:w-[calc(25%-0.5625rem)] min-w-[180px] bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={student.avatar_url || ''} alt={student.full_name} />
                  <AvatarFallback>{initialsFromName(student.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-800 font-bold">{student.full_name}</p>
                  <p className="text-sm text-gray-600">@{student.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoadingStudents && visibleStudents.length === 0 && (
        <p className="text-sm text-gray-600">No students found.</p>
      )}

      {studentError && (
        <p className="text-sm text-red-600 mt-4">{studentError}</p>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>
              Enroll an existing student by ID, username, or full name.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID (Optional)</Label>
              <Input
                id="student-id"
                value={addStudentForm.studentId}
                onChange={(event) => setAddStudentForm((prev) => ({ ...prev, studentId: event.target.value }))}
                placeholder="UUID from profile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-username">Username (Optional)</Label>
              <Input
                id="student-username"
                value={addStudentForm.username}
                onChange={(event) => setAddStudentForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="e.g. wingyan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-name">Full Name (Optional)</Label>
              <Input
                id="student-name"
                value={addStudentForm.fullName}
                onChange={(event) => setAddStudentForm((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="e.g. Lee Wing Yan"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isAddingStudent}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-purple-500 to-teal-500 text-white"
                disabled={isAddingStudent}
              >
                {isAddingStudent ? 'Adding...' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
