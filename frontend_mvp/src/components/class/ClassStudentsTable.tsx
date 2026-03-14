'use client';

import { CheckedState } from '@radix-ui/react-checkbox';
import { ArrowUpDown } from 'lucide-react';
import { ClassroomStudentResponse } from '@/lib/api';
import { StatusMessage } from '@/components/common/StatusMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type SortKey = 'name' | 'level' | 'status' | 'enrolled';

interface ClassStudentsTableProps {
  visibleStudents: ClassroomStudentResponse[];
  selectedIds: Set<string>;
  sortKey: SortKey;
  sortDirection: 'asc' | 'desc';
  toggleSort: (key: SortKey) => void;
  toggleSingleSelection: (studentId: string, checked: CheckedState) => void;
  toggleAllVisible: (checked: CheckedState) => void;
  allVisibleSelected: boolean;
  isLoading: boolean;
}

const columns = [
  {
    header: '',
    width: '40px',
    sortableKey: null as SortKey | null,
    cell: (
      row: ClassroomStudentResponse,
      isChecked: boolean,
      onToggle: (checked: CheckedState) => void,
      allChecked: boolean,
      onToggleAll: (checked: CheckedState) => void
    ) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={allChecked}
          onCheckedChange={onToggleAll}
          aria-label="Select all visible students"
        />
      </div>
    ),
  },
  {
    header: 'Name',
    width: 'auto',
    sortableKey: 'name' as SortKey,
    cell: (row: ClassroomStudentResponse) => (
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
          {row.full_name
            .split(' ')
            .map((p) => p[0] || '')
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-800">{row.full_name}</p>
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
    cell: (row: ClassroomStudentResponse) => {
      const date = new Date(row.enrolled_at);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
  },
];

export function ClassStudentsTable({
  visibleStudents,
  selectedIds,
  sortKey,
  sortDirection,
  toggleSort,
  toggleSingleSelection,
  toggleAllVisible,
  allVisibleSelected,
  isLoading,
}: ClassStudentsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/20 bg-white shadow-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} style={{ width: col.width }}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (visibleStudents.length === 0) {
    return <StatusMessage variant="empty" text="No students found." />;
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white shadow-lg p-2">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => {
              const sortKeyForCol = col.sortableKey;
              return (
                <TableHead key={i} style={{ width: col.width }}>
                  {sortKeyForCol ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-0 text-gray-800"
                      onClick={() => toggleSort(sortKeyForCol)}
                    >
                      {col.header}
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleStudents.map((student) => {
            const isSelected = selectedIds.has(student.id);

            return (
              <TableRow key={student.id}>
                {columns.map((col, i) => (
                  <TableCell key={i} style={{ width: col.width }}>
                    {col.cell(
                      student,
                      isSelected,
                      (checked) => toggleSingleSelection(student.id, checked),
                      allVisibleSelected,
                      toggleAllVisible
                    )}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}