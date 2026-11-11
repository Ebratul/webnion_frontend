import type { Metadata } from 'next';
import { AiStudio } from '@/components/admin/AiStudio';
import { PageHeader } from '@/components/admin/ui';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'AI Studio' };

interface StudioStatus {
  writing: boolean;
  image: boolean;
  blogWriter: boolean;
  pictures: boolean;
  maxPictures: number;
}

export default async function AiStudioPage() {
  const [user, status] = await Promise.all([getAdminUser(), adminFetch<StudioStatus>('/ai/studio/status')]);
  return (
    <>
      <PageHeader title="AI Studio" description="Give a topic, check the outline, and get a full blog draft with pictures in English and Bangla. Drafts are saved under Blog for you to review and publish." />
      <AiStudio ready={status} maxPictures={status.maxPictures} isAdmin={user.role === 'ADMIN'} />
    </>
  );
}
