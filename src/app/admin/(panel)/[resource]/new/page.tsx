import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { PageHeader } from '@/components/admin/ui';
import { getResource } from '@/lib/admin/resources';
import { adminFetch, getAdminUser } from '@/lib/admin/session';

type PageProps = { params: Promise<{ resource: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const resource = getResource((await params).resource);
  return { title: resource ? `New ${resource.singular}` : undefined };
};

export default async function AdminNewPage({ params }: PageProps) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource?.canCreate) notFound();
  if (resource.adminOnly && (await getAdminUser()).role !== 'ADMIN') notFound();

  // A new record goes to the end of the list and can be moved from there
  const rows = resource.sortable ? await adminFetch<{ sortOrder: number }[]>(resource.listPath) : [];
  const nextSortOrder = rows.reduce((highest, row) => Math.max(highest, row.sortOrder + 1), 0);

  return (
    <>
      <PageHeader title={`New ${resource.singular}`} back={{ href: `/admin/${resource.key}`, label: resource.label }} />
      <ResourceForm resourceKey={resource.key} nextSortOrder={nextSortOrder} />
    </>
  );
}
