import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { PageHeader } from '@/components/admin/ui';
import { getResource } from '@/lib/admin/resources';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

type PageProps = { params: Promise<{ resource: string; id: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const resource = getResource((await params).resource);
  return { title: resource ? `Edit ${resource.singular}` : undefined };
};

export default async function AdminEditPage({ params }: PageProps) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();
  if (resource.adminOnly && (await getAdminUser()).role !== 'ADMIN') notFound();

  // The API has no single-record admin route: its lists are small enough to read whole
  const rows = await adminFetch<(Record<string, unknown> & { id: string })[]>(resource.listPath);
  const row = rows.find((item) => item.id === id);
  if (!row) notFound();

  return (
    <>
      <PageHeader title={resource.rowTitle(row)} back={{ href: `/admin/${resource.key}`, label: resource.label }} />
      <ResourceForm key={row.id} resourceKey={resource.key} row={row} />
    </>
  );
}
