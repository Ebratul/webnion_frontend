import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { clientIpHeader } from '@/lib/admin/clientIp';
import { ADMIN_COOKIE } from '@/lib/admin/constants';

const ALLOWED_RESOURCES = new Set([
  'projects',
  'case-studies',
  'testimonials',
  'services',
  'pricing-plans',
  'hero-backgrounds',
  'technologies',
  'site-settings',
  'activity-logs',
  'faqs',
  'team',
  'clients',
  'delivery-stories',
  'outcome-cards',
  'inquiries',
  'users',
  'uploads',
  'blog-posts',
  'ai',
]);

// AI Studio writes a long article in one streamed request
export const maxDuration = 300;

// An edit shows on the public site straight away instead of after the next 60 second refresh
const refreshPublicPages = () => {
  for (const tag of ['home', 'site', 'projects', 'case-studies', 'blog', 'blog-posts']) revalidateTag(tag, { expire: 0 });
  revalidatePath('/[locale]', 'layout');
};

type RouteContext = { params: Promise<{ path: string[] }> };

// Adds the login token from the httpOnly cookie and passes the request on to the API.
// The body is streamed, so a large video upload is not held in this server's memory.
const forward = async (request: NextRequest, { params }: RouteContext) => {
  const { path } = await params;
  if (!ALLOWED_RESOURCES.has(path[0] ?? '')) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Please log in again' }, { status: 401 });

  const headers = new Headers({ Authorization: `Bearer ${token}`, ...clientIpHeader(request) });
  for (const name of ['content-type', 'content-length', 'x-forwarded-for']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await fetch(`${process.env.API_URL}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    cache: 'no-store',
    ...(hasBody ? { body: request.body, duplex: 'half' } : {}),
  } as RequestInit);

  if (upstream.status === 401) store.delete(ADMIN_COOKIE);
  // Chats, tests and searches change nothing on the public site. AI settings do: they turn the chat button on or off.
  const changesSite = path[0] === 'ai' ? path[1] === 'settings' && path.length === 2 : path[0] !== 'uploads';
  if (hasBody && upstream.ok && changesSite) refreshPublicPages();

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  });
};

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
