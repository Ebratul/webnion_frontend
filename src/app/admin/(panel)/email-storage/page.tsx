import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmailStorageForm } from '@/components/admin/EmailStorageForm';
import { PageHeader } from '@/components/admin/ui';
import type { IntegrationsData } from '@/lib/admin/integrations';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'Email & Storage' };

export default async function EmailStoragePage() {
  const user = await getAdminUser();
  if (user.role !== 'ADMIN') notFound();
  const data = await adminFetch<IntegrationsData>('/integrations');

  return (
    <>
      <PageHeader
        title="Email & Storage"
        description="The email server that sends you inquiry emails, and where uploaded pictures and videos are kept. Each is checked before it is saved, and passwords are stored encrypted."
      />
      <EmailStorageForm initial={data} adminEmail={user.email} />
    </>
  );
}
