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

export interface CreateClassDialogFormState {
  name: string;
  subject: string;
  targetLevel: string;
}

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateClassDialogFormState;
  onFormChange: (next: CreateClassDialogFormState) => void;
  onSubmit: (event: FormEvent) => void;
  isSubmitting: boolean;
}

export function CreateClassDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
}: CreateClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Classroom</DialogTitle>
          <DialogDescription>
            Enter classroom details to create a new class record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              value={form.name}
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
              placeholder="e.g. Sec 4 Science"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-subject">Subject</Label>
            <Input
              id="class-subject"
              value={form.subject}
              onChange={(event) => onFormChange({ ...form, subject: event.target.value })}
              placeholder="e.g. Physics"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-target-level">Target Level (Optional)</Label>
            <Input
              id="class-target-level"
              value={form.targetLevel}
              onChange={(event) => onFormChange({ ...form, targetLevel: event.target.value })}
              placeholder="e.g. Secondary 4"
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
              {isSubmitting ? 'Creating...' : 'Create Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
