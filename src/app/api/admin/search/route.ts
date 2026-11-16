import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDictionary } from '@/i18n';
import { ADMIN_COOKIE } from '@/lib/admin/constants';
import type { SearchIndex, SearchRecord, SearchText } from '@/lib/admin/search';
import { RESOURCES } from '@/lib/admin/resources';
import type { AdminUser } from '@/lib/admin/session';
import { TEXT_EDITED_ELSEWHERE } from '@/lib/admin/textGroups';
import { flattenText, type TextOverrides } from '@/lib/siteText';

type Row = Record<string, unknown> & { id: string };

// Everything the admin search looks through, fetched once when it opens: every record the signed-in user may edit, and
// the website's text as it shows now, so typing a sentence from the site finds where to change it.
export const GET = async () => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Please log in again' }, { status: 401 });

  const get = async <T,>(path: string): Promise<T> => {
    const response = await fetch(`${process.env.API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) throw Object.assign(new Error(`${path} responded with ${response.status}`), { status: response.status });
    return ((await response.json()) as { data: T }).data;
  };

  let user: AdminUser;
  try {
    user = await get<AdminUser>('/auth/me');
  } catch {
    return NextResponse.json({ message: 'Please log in again' }, { status: 401 });
  }

  const resources = RESOURCES.filter((resource) => !resource.adminOnly || user.role === 'ADMIN');
  const [lists, settings] = await Promise.all([
    // One list that fails to load leaves the others searchable
    Promise.allSettled(resources.map((resource) => get<Row[]>(resource.listPath))),
    get<{ text?: { en?: TextOverrides; bn?: TextOverrides } }>('/site-settings').catch(() => ({ text: undefined })),
  ]);

  const records: SearchRecord[] = resources.flatMap((resource, index) => {
    const result = lists[index];
    if (result?.status !== 'fulfilled') return [];
    return result.value.map((row) => ({
      resource: resource.key,
      title: resource.rowTitle(row) || resource.singular,
      subtitle: resource.rowSubtitle(row),
      href: `/admin/${resource.key}/${row.id}`,
      image: resource.rowImage?.(row) || null,
    }));
  });

  const en = flattenText(getDictionary('en'));
  const bn = flattenText(getDictionary('bn'));
  const texts: SearchText[] = Object.keys(en)
    .filter((path) => !TEXT_EDITED_ELSEWHERE.test(path))
    .map((path) => ({
      path,
      en: settings.text?.en?.[path] ?? String(en[path]),
      bn: settings.text?.bn?.[path] ?? String(bn[path] ?? ''),
    }));

  const index: SearchIndex = { records, texts, failed: lists.filter((result) => result.status === 'rejected').length };
  return NextResponse.json(index, { headers: { 'Cache-Control': 'no-store' } });
};
