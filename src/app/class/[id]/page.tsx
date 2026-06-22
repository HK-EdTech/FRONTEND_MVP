import { redirect } from 'next/navigation';

interface ClassIndexPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassIndexPage({ params }: ClassIndexPageProps) {
  const { id } = await params;
  redirect(`/class/${id}/homework`);
}
