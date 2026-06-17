import { PracticeSession } from '@/components/problem/PracticeSession';
import { getTopicById } from '@/lib/curriculum';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ topicId: string }>;
}

export default async function PracticeTopicPage({ params }: Props) {
  const { topicId } = await params;
  const topic = getTopicById(topicId);

  if (!topic) notFound();

  return <PracticeSession topicId={topicId} />;
}
