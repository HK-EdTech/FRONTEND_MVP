'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { ArrowUpDown, Plus, Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api, ClassStudentCandidateResponse, ClassroomStudentResponse } from '@/lib/api';
import { PersonInfoCard } from '@/components/common/PersonInfoCard';
import { SectionHeaderBar } from '@/components/common/SectionHeaderBar';
import { StatusMessage } from '@/components/common/StatusMessage';
import { mockStudents } from '@/components/class/mockData';
import { AddStudentDialog } from '@/components/dialogs/AddStudentDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ClassStudentsTable } from '@/components/class/ClassStudentsTable';

type StudentViewMode = 'table' | 'list' | 'card';
type SortKey = 'name' | 'level' | 'status' | 'enrolled';
type SortOrder = 'asc' | 'desc';

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

// Column definition with sortableKey (same pattern as HomeworkSubmissionsTable)
const columns = [
  {
    header: '',
    width: '40px',
    sortableKey: null,
    cell: (row: ClassroomStudentResponse, isChecked: boolean, onToggle: (checked: CheckedState) => void) => (
      <Checkbox checked={isChecked} onCheckedChange={onToggle} />
    ),
  },
  {
    header: 'Name',
    width: 'auto',
    sortableKey: 'name' as SortKey,
    cell: (row: ClassroomStudentResponse) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={row.avatar_url || ''} alt={row.full_name} />
          <AvatarFallback>{initialsFromName(row.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-gray-800 font-bold">{row.full_name}</p>
          <p className="text-xs text-gray-600">@{row.username}</p>
        </div>
      </div>
    ),
  },
  {
    header: 'Level',
    width: '120px',
    sortableKey: 'level' as SortKey,
    cell: (row: ClassroomStudentResponse) => row.class_level || '-',
  },
  {
    header: 'Status',
    width: '140px',
    sortableKey: 'status' as SortKey,
    cell: (row: ClassroomStudentResponse) => (
      <span className="capitalize">{row.status}</span>
    ),
  },
  {
    header: 'Enrolled',
    width: '160px',
    sortableKey: 'enrolled' as SortKey,
    cell: (row: ClassroomStudentResponse) => formatDate(row.enrolled_at),
  },
];

export default function ClassroomStudentsPage() {
  const params = useParams();
  const classId = String(params.id || '');

  const [students, setStudents] = useState<ClassroomStudentResponse[]>(mockStudents);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [studentError, setStudentError] = useState('');
  const [viewMode, setViewMode] = useState<StudentViewMode>('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isLoadingCandidateStudents, setIsLoadingCandidateStudents] = useState(false);
  const [candidateStudents, setCandidateStudents] = useState<ClassStudentCandidateResponse[]>([]);
  const [addStudentError, setAddStudentError] = useState('');

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

  const fetchCandidateStudents = async () => {
    try {
      setIsLoadingCandidateStudents(true);
      setAddStudentError('');
      const response = await api.getClassStudentCandidates(classId);
      setCandidateStudents(response);
    } catch (error: any) {
      setCandidateStudents([]);
      setAddStudentError(error?.message || 'Failed to load available students');
    } finally {
      setIsLoadingCandidateStudents(false);
    }
  };

  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (open) {
      void fetchCandidateStudents();
      return;
    }
    setAddStudentError('');
  };

  const handleAddStudents = async (studentIds: string[]) => {
    if (studentIds.length === 0) {
      setAddStudentError('Please select at least one student');
      return;
    }

    try {
      setIsAddingStudent(true);
      setAddStudentError('');

      const created = await api.addClassStudents(classId, {
        student_ids: studentIds,
      });

      setStudents((prev) => {
        const existingIds = new Set(prev.map((student) => student.id));
        const nextItems = created.filter((student) => !existingIds.has(student.id));
        return [...nextItems, ...prev];
      });

      handleAddDialogOpenChange(false);
    } catch (error: any) {
      setAddStudentError(error?.message || 'Failed to add students');
    } finally {
      setIsAddingStudent(false);
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

      {!isLoadingStudents && viewMode === 'table' && (
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

      {!isLoadingStudents && viewMode === 'list' && (
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

      {!isLoadingStudents && viewMode === 'card' && (
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
        isLoading={isLoadingCandidateStudents}
        isSubmitting={isAddingStudent}
        errorMessage={addStudentError}
        onSubmit={handleAddStudents}
      />
    </div>
  );
}