'use client';

import type { FormEvent } from 'react';
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

export interface AddStudentDialogFormState {
  studentId: string;
  username: string;
  fullName: string;
}

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: AddStudentDialogFormState;
  onFormChange: (next: AddStudentDialogFormState) => void;
  onSubmit: (event: FormEvent) => void;
  isSubmitting: boolean;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
}: AddStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>
            Enroll an existing student by username, or full name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* <div className="space-y-2">
            <Label htmlFor="student-id">Student ID (Optional)</Label>
            <Input
              id="student-id"
              value={form.studentId}
              onChange={(event) => onFormChange({ ...form, studentId: event.target.value })}
              placeholder="UUID from profile"
            />
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="student-username">Username (Optional)</Label>
            <Input
              id="student-username"
              value={form.username}
              onChange={(event) => onFormChange({ ...form, username: event.target.value })}
              placeholder="e.g. peterchan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-name">Full Name (Optional)</Label>
            <Input
              id="student-name"
              value={form.fullName}
              onChange={(event) => onFormChange({ ...form, fullName: event.target.value })}
              placeholder="e.g. Chan Tai Man"
            />
          </div>

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
              className="bg-linear-to-r from-purple-500 to-teal-500 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
