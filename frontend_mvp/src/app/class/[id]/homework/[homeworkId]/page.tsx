import { HomeworkSubmissionsTable } from '@/components/class/HomeworkSubmissionsTable';

interface HomeworkSubmissionsStubPageProps {
  params: Promise<{ id: string; homeworkId: string }>;
}

export default async function HomeworkSubmissionsStubPage({ params }: HomeworkSubmissionsStubPageProps) {
  const { id, homeworkId } = await params;

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg space-y-4">
      <div>
        <h2 className="text-xl text-gray-800 font-bold">Homework Submissions</h2>
      </div>

      <HomeworkSubmissionsTable classId={id} homeworkId={homeworkId} />
    </div>
  );
}
