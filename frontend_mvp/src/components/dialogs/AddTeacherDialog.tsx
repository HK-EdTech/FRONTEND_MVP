'use client';

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

export interface AddTeacherDialogFormState {
  fullName: string;
  username: string;
}

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: AddTeacherDialogFormState;
  onFormChange: (next: AddTeacherDialogFormState) => void;
}

export function AddTeacherDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
}: AddTeacherDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={form.fullName}
              onChange={(event) => onFormChange({ ...form, fullName: event.target.value })}
              placeholder="e.g. Ms. Wong"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-username">Username</Label>
            <Input
              id="teacher-username"
              value={form.username}
              onChange={(event) => onFormChange({ ...form, username: event.target.value })}
              placeholder="e.g. mswong"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
