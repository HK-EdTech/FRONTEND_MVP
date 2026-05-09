'use client';

import { AIMarking, type AIMarkingStudent } from '@/components/Scan_and_mark/Result/AIMarking';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AIMarkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: AIMarkingStudent | null;
  mode?: 'single' | 'all';
  totalStudents?: number;
}

export type { AIMarkingStudent };

export function AIMarkingDialog({
  open,
  onOpenChange,
  student,
  mode = 'single',
  totalStudents = 0,
}: AIMarkingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full max-h-[80vh] w-full !max-w-[60vw] gap-3 border p-3">
        <DialogHeader className="sr-only">
          <DialogTitle>AI Marking Simulation</DialogTitle>
          <DialogDescription>Visual demo of AI marking workflow</DialogDescription>
        </DialogHeader>
        <AIMarking student={student} mode={mode} totalStudents={totalStudents} />
      </DialogContent>
    </Dialog>
  );
}
