import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceList } from '@/components/admin/ResourceList';
import { PageHeader } from '@/components/admin/ui';
import { getResource } from '@/lib/admin/resources';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

type PageProps = { params: Promise<{ resource: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => ({
  title: getResource((await params).resource)?.label,
});

export default async function AdminResourcePage({ params }: PageProps) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();
  if (resource.adminOnly && (await getAdminUser()).role !== 'ADMIN') notFound();

  const rows = await adminFetch<(Record<string, unknown> & { id: string })[]>(resource.listPath);

  return (
    <>
      <PageHeader title={resource.label} description={resource.description} count={rows.length} />
      <ResourceList resourceKey={resource.key} rows={rows} />
    </>
  );
}
