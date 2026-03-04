interface HomeworkSubmissionsStubPageProps {
  params: Promise<{ id: string; homeworkId: string }>;
}

export default async function HomeworkSubmissionsStubPage({ params }: HomeworkSubmissionsStubPageProps) {
  const { homeworkId } = await params;

  return (
    <div className="rounded-2xl p-6 shadow-xl w-full bg-white/10 border border-white/20 backdrop-blur-lg">
      <h2 className="text-xl text-gray-800 font-bold">Homework Submissions</h2>
      <p className="text-sm text-gray-600 mt-2">
        {`Submission list for homework ${homeworkId} will be added in the next iteration.`}
      </p>
    </div>
  );
}
