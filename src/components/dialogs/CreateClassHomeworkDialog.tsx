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

export interface CreateClassHomeworkDialogFormState {
  title: string;
  subject: string;
  dueDate: string;
}

interface CreateClassHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateClassHomeworkDialogFormState;
  onFormChange: (next: CreateClassHomeworkDialogFormState) => void;
  onSubmit: (event: FormEvent) => void;
  isSubmitting: boolean;
}

export function CreateClassHomeworkDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
}: CreateClassHomeworkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Homework</DialogTitle>
          <DialogDescription>
            Enter homework details for this classroom.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homework-title">Title</Label>
            <Input
              id="homework-title"
              value={form.title}
              onChange={(event) => onFormChange({ ...form, title: event.target.value })}
              placeholder="e.g. Algebra Revision"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-subject">Subject (Optional)</Label>
            <Input
              id="homework-subject"
              value={form.subject}
              onChange={(event) => onFormChange({ ...form, subject: event.target.value })}
              placeholder="e.g. Mathematics"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-due-date">Due Date (Optional)</Label>
            <Input
              id="homework-due-date"
              type="date"
              value={form.dueDate}
              onChange={(event) => onFormChange({ ...form, dueDate: event.target.value })}
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
              {isSubmitting ? 'Creating...' : 'Create Homework'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
