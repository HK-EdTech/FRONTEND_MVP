'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { HomeworkSubmissionsTable } from '@/components/class/HomeworkSubmissionsTable';
import { AIMarkingDialog, type AIMarkingStudent } from '@/components/dialogs/AIMarkingDialog';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

export default function HomeworkSubmissionsStubPage() {
  const params = useParams();
  const id = String(params.id || '');
  const homeworkId = String(params.homeworkId || '');
  const submissionKey = `${id}:${homeworkId}`;
  const submissions = useAppSelector((state) => state.homeworkSubmissions.rowsByKey[submissionKey] || []);
  const [isAIMarkingOpen, setIsAIMarkingOpen] = useState(false);
  const [markingMode, setMarkingMode] = useState<'single' | 'all'>('single');
  const [selectedStudent, setSelectedStudent] = useState<AIMarkingStudent | null>(null);

  const enrolledCount = useMemo(() => submissions.length, [submissions]);

  const openMarkAllDialog = () => {
    setMarkingMode('all');
    setSelectedStudent(null);
    setIsAIMarkingOpen(true);
  };

  const openSingleDialog = (student: {
    student_id: string;
    full_name: string;
    submission_datetime: string | null;
  }) => {
    setMarkingMode('single');
    setSelectedStudent({
      studentId: student.student_id,
      name: student.full_name,
      submissionDate: student.submission_datetime,
    });
    setIsAIMarkingOpen(true);
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-gray-800 font-bold">Homework Submissions</h2>
        <div className='flex gap-3'>
          <Button
            size="sm"
            className="bg-white text-black border border-transparent hover:border-gray-300 hover:bg-white hover:shadow-lg [transition:all_0.3s]"
          >
            Scan & Upload
          </Button>
          <Button
          size="sm"
          onClick={openMarkAllDialog}
          className="bg-linear-to-r from-[#5BDCE5] to-[#0552B0] text-white hover:shadow-lg"
        >
          Mark all by AI
        </Button>
        </div>
        
      </div>

      {/* <div className="flex justify-end">
        
      </div> */}

      <HomeworkSubmissionsTable
        classId={id}
        homeworkId={homeworkId}
        onMarkByAI={(row) =>
          openSingleDialog({
            student_id: row.student_id,
            full_name: row.full_name,
            submission_datetime: row.submission_datetime,
          })
        }
      />

      <AIMarkingDialog
        open={isAIMarkingOpen}
        onOpenChange={setIsAIMarkingOpen}
        mode={markingMode}
        student={selectedStudent}
        totalStudents={enrolledCount}
      />
    </div>
  );
}
