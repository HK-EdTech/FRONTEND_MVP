'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Plus, Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PersonInfoCard } from '@/components/common/PersonInfoCard';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { AddStudentDialog } from '@/components/dialogs/AddStudentDialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ClassStudentsTable } from '@/components/class/ClassStudentsTable';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addClassStudents,
  fetchCandidateStudents,
  fetchClassStudents,
} from '@/store/slices/classStudentsSlice';

type StudentViewMode = 'table' | 'list' | 'card';
type SortKey = 'name' | 'level' | 'status' | 'enrolled';
type SortOrder = 'asc' | 'desc';

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
  const dispatch = useAppDispatch();
  const students = useAppSelector((state) => state.classStudents.studentsByClassId[classId] || []);
  const studentsStatus = useAppSelector((state) => state.classStudents.statusByClassId[classId] || 'idle');
  const studentError = useAppSelector((state) => state.classStudents.errorByClassId[classId] || '');
  const candidateStudents = useAppSelector((state) => state.classStudents.candidatesByClassId[classId] || []);
  const candidateStatus = useAppSelector((state) => state.classStudents.candidateStatusByClassId[classId] || 'idle');
  const candidateError = useAppSelector((state) => state.classStudents.candidateErrorByClassId[classId] || '');
  const addStatus = useAppSelector((state) => state.classStudents.addStatusByClassId[classId] || 'idle');
  const addStudentError = useAppSelector((state) => state.classStudents.addErrorByClassId[classId] || '');
  const isLoadingStudents = studentsStatus === 'loading' || studentsStatus === 'idle';

  const [viewMode, setViewMode] = useState<StudentViewMode>('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [localAddStudentError, setLocalAddStudentError] = useState('');

  useEffect(() => {
    if (studentsStatus === 'idle') {
      dispatch(fetchClassStudents(classId));
    }
  }, [classId, dispatch, studentsStatus]);

  const visibleStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered = [...students].filter((student) =>
      statusFilter === 'all' ? true : student.status.toLowerCase() === statusFilter
    );

    if (query) {
      filtered = filtered.filter(
        (student) =>
          student.full_name.toLowerCase().includes(query) ||
          student.username.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      switch (sortKey) {
        case 'name':
          return a.full_name.localeCompare(b.full_name) * direction;
        case 'level':
          return (a.class_level || '').localeCompare(b.class_level || '') * direction;
        case 'status':
          return a.status.localeCompare(b.status) * direction;
        case 'enrolled':
          return new Date(a.enrolled_at).getTime() - new Date(b.enrolled_at).getTime() * direction;
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, statusFilter, searchQuery, sortKey, sortDirection]);

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

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const loadCandidateStudents = async () => {
    setLocalAddStudentError('');
    await dispatch(fetchCandidateStudents(classId));
  };

  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (open) {
      void loadCandidateStudents();
      return;
    }
    setLocalAddStudentError('');
  };

  const handleAddStudents = async (studentIds: string[]) => {
    if (studentIds.length === 0) {
      setLocalAddStudentError('Please select at least one student');
      return;
    }

    try {
      setLocalAddStudentError('');
      await dispatch(addClassStudents({ classId, studentIds })).unwrap();
      handleAddDialogOpenChange(false);
    } catch (error: any) {
      setLocalAddStudentError(error?.message || 'Failed to add students');
    }
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg">
      <div className="flex flex-col gap-4 mb-6">
        <SectionHeaderBar
          title="Students"
          titleClassName="font-bold"
          actions={(
            <>
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
                onClick={() => handleAddDialogOpenChange(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </>
          )}
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <ToggleGroup
          className='border-2'
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (!value) return;
            setViewMode(value as StudentViewMode);
          }}
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

      {isLoadingStudents && (
        <StatusMessage variant="loading" text="Loading students..." />
      )}

      {!isLoadingStudents && viewMode === 'table' && visibleStudents.length > 0 && (
        <ClassStudentsTable
          visibleStudents={visibleStudents}
          selectedIds={selectedIds}
          sortKey={sortKey}
          sortDirection={sortDirection}
          toggleSort={toggleSort}
          toggleSingleSelection={toggleSingleSelection}
          toggleAllVisible={toggleAllVisible}
          allVisibleSelected={allVisibleSelected}
          isLoading={isLoadingStudents}
        />
      )}

      {!isLoadingStudents && viewMode === 'list' && visibleStudents.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleStudents.map((student) => (
            <PersonInfoCard
              key={student.id}
              name={student.full_name}
              subtitle={`@${student.username}`}
              avatarUrl={student.avatar_url}
              fallback={initialsFromName(student.full_name)}
            />
          ))}
        </div>
      )}

      {!isLoadingStudents && viewMode === 'card' && visibleStudents.length > 0 && (
        <div className="flex flex-wrap gap-3 w-full">
          {visibleStudents.map((student) => (
            <PersonInfoCard
              key={student.id}
              name={student.full_name}
              subtitle={`@${student.username}`}
              avatarUrl={student.avatar_url}
              fallback={initialsFromName(student.full_name)}
              className="w-[calc(50%-0.375rem)] md:w-[calc(25%-0.5625rem)] min-w-[180px]"
            />
          ))}
        </div>
      )}

      {!isLoadingStudents && visibleStudents.length === 0 && (
        <StatusMessage variant="empty" text="No students found." />
      )}

      {studentError && (
        <StatusMessage variant="error" text={studentError} className="mt-4" />
      )}

      <AddStudentDialog
        open={isAddDialogOpen}
        onOpenChange={handleAddDialogOpenChange}
        students={candidateStudents}
        isLoading={candidateStatus === 'loading'}
        isSubmitting={addStatus === 'loading'}
        errorMessage={localAddStudentError || candidateError || addStudentError}
        onSubmit={handleAddStudents}
      />
    </div>
  );
}
