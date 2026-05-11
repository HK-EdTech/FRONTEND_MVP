'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { ClassResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

export type HomeworkDialogMode = 'create' | 'assign';

export interface HomeworkAssignmentDialogFormState {
  title: string;
  subject: string;
  dueDate: string;
  fullScore: string;
  homeworkType: string | null;
  classIds: string[];
}

interface HomeworkAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: HomeworkDialogMode;
  form: HomeworkAssignmentDialogFormState;
  classes: ClassResponse[];
  errorMessage: string;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent) => void;
  onFormChange: (next: HomeworkAssignmentDialogFormState) => void;
  onToggleClass: (classId: string) => void;
  getClassSelectionLabel: (classIds: string[]) => string;
  assignableHomeworkTypeCode: string | null;
  oneTimeHomeworkTypeCode: string | null;
}

export function HomeworkAssignmentDialog({
  open,
  onOpenChange,
  mode,
  form,
  classes,
  errorMessage,
  isSubmitting,
  onSubmit,
  onFormChange,
  onToggleClass,
  getClassSelectionLabel,
  assignableHomeworkTypeCode,
  oneTimeHomeworkTypeCode,
}: HomeworkAssignmentDialogProps) {
  const [isClassPopoverOpen, setIsClassPopoverOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setIsClassPopoverOpen(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Homework' : 'Assign Homework to Classes'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Enter homework details and assign it to one or more classes.'
              : 'Select one or more classes for this homework assignment.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homework-title">Title</Label>
            <Input
              id="homework-title"
              value={form.title}
              onChange={(event) => onFormChange({ ...form, title: event.target.value })}
              placeholder="e.g. Math Exercise 2"
              disabled={mode === 'assign'}
              required={mode === 'create'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-subject">Subject (Optional)</Label>
            <Input
              id="homework-subject"
              value={form.subject}
              onChange={(event) => onFormChange({ ...form, subject: event.target.value })}
              placeholder="e.g. Mathematics"
              disabled={mode === 'assign'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-due-date">Due Date (Optional)</Label>
            <Input
              id="homework-due-date"
              type="date"
              value={form.dueDate}
              onChange={(event) => onFormChange({ ...form, dueDate: event.target.value })}
              disabled={mode === 'assign'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-full-score">Full Score / Total Points (Optional)</Label>
            <Input
              id="homework-full-score"
              type="number"
              min="0"
              step="1"
              value={form.fullScore}
              onChange={(event) => onFormChange({ ...form, fullScore: event.target.value })}
              placeholder="e.g. 100"
              disabled={mode === 'assign'}
            />
          </div>

          {mode === 'create' && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="homework-one-time-toggle">One time Upload</Label>
                <p className="text-xs text-gray-500">Use for single-upload homework without class assignment.</p>
              </div>
              <Switch
                id="homework-one-time-toggle"
                checked={oneTimeHomeworkTypeCode !== null && form.homeworkType === oneTimeHomeworkTypeCode}
                disabled={oneTimeHomeworkTypeCode === null || assignableHomeworkTypeCode === null}
                onCheckedChange={(checked) => {
                  if (checked) {
                    if (oneTimeHomeworkTypeCode !== null) {
                      onFormChange({ ...form, homeworkType: oneTimeHomeworkTypeCode, classIds: [] });
                    }
                    return;
                  }

                  if (assignableHomeworkTypeCode !== null) {
                    onFormChange({ ...form, homeworkType: assignableHomeworkTypeCode });
                  }
                }}
              />
            </div>
          )}

          {assignableHomeworkTypeCode !== null && form.homeworkType === assignableHomeworkTypeCode && (
            <div className="space-y-2">
              <Label>Classes to Assign</Label>
              <Popover open={isClassPopoverOpen} onOpenChange={setIsClassPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between cursor-pointer"
                  >
                    {getClassSelectionLabel(form.classIds)}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search classes..." />
                    <CommandList>
                      <CommandEmpty>No class found.</CommandEmpty>
                      <CommandGroup>
                        {classes.map((classroom) => (
                          <CommandItem
                            className='cursor-pointer'
                            key={classroom.id}
                            value={`${classroom.name} ${classroom.subject}`}
                            onSelect={() => {
                              onToggleClass(classroom.id);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${form.classIds.includes(classroom.id) ? 'opacity-100' : 'opacity-0'}`}
                            />
                            <span>{classroom.name}</span>
                            <span className="ml-auto text-xs text-gray-500">{classroom.subject}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              className="bg-linear-to-r from-[#5BDCE5] to-[#0552B0] text-white cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (mode === 'create' ? 'Creating...' : 'Saving...')
                : (mode === 'create' ? 'Create Homework' : 'Save Assignment')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
