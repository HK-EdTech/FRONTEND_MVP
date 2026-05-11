'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckedState } from '@radix-ui/react-checkbox';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface AddStudentDialogItem {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  class_level: string | null;
}

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: AddStudentDialogItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (studentIds: string[]) => void;
}

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function AddStudentDialog({
  open,
  onOpenChange,
  students,
  isLoading,
  isSubmitting,
  errorMessage,
  onSubmit,
}: AddStudentDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSelectedIds(new Set());
    }
  }, [open]);

  const visibleStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) =>
      student.full_name.toLowerCase().includes(query) ||
      student.username.toLowerCase().includes(query) ||
      (student.class_level || '').toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(Array.from(selectedIds));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Students</DialogTitle>
          <DialogDescription>
            Select one or more students from your organization to enroll in this class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, username, or level..."
            className="h-9"
          />

          {isLoading && (
            <p className="text-sm text-gray-600">Loading students...</p>
          )}

          {!isLoading && visibleStudents.length === 0 && (
            <p className="text-sm text-gray-600">No available students found.</p>
          )}

          {!isLoading && visibleStudents.length > 0 && (
            <div className="max-h-80 overflow-auto rounded-xl border border-white/20 bg-white shadow-lg p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={toggleAllVisible}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Level</TableHead>
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
                          <p className="text-gray-800 font-bold">{student.full_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">@{student.username}</TableCell>
                      <TableCell>{student.class_level || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-linear-to-r from-[#5BDCE5] to-[#0552B0] text-white"
              disabled={isSubmitting || isLoading || selectedIds.size === 0}
            >
              {isSubmitting ? 'Adding...' : `Add Selected (${selectedIds.size})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
