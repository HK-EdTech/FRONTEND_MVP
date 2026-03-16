import { HomeworkSubmissionsTable } from '@/components/class/HomeworkSubmissionsTable';
import { Button } from '@/components/ui/button';

interface HomeworkSubmissionsStubPageProps {
  params: Promise<{ id: string; homeworkId: string }>;
}

export default async function HomeworkSubmissionsStubPage({ params }: HomeworkSubmissionsStubPageProps) {
  const { id, homeworkId } = await params;

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg space-y-4">
      <div className='flex justify-between items-center'>
        <h2 className="text-xl text-gray-800 font-bold">Homework Submissions</h2>
        <Button
          size="sm"
          className="bg-linear-to-r from-purple-500 to-teal-500 text-white hover:shadow-lg"
        >
          Scan & Upload
        </Button>
      </div>

      <HomeworkSubmissionsTable classId={id} homeworkId={homeworkId} />
    </div>
  );
}
