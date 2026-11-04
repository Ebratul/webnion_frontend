'use client';

import { ExternalLink, LayoutDashboard, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RESOURCES, type Resource } from '@/lib/admin/resources';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import type { AdminUser } from '@/lib/admin/session';

const GROUPS: Resource['group'][] = ['Content', 'Website', 'Leads', 'Settings'];

const linkClass = (active: boolean) =>
  `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${active ? 'bg-tint font-medium text-fg' : 'text-muted hover:bg-white/5 hover:text-fg'}`;

export const AdminNav = ({ user, newInquiries }: { user: AdminUser; newInquiries: number }) => {
  const pathname = usePathname();
  const router = useRouter();
  const available = RESOURCES.filter((resource) => !resource.adminOnly || user.role === 'ADMIN');

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push(ADMIN_LOGIN_PATH);
    router.refresh();
  };

  return (
    <aside className="border-b border-line bg-surface lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-4 lg:py-6">
        <Link href="/admin" aria-label="Webnion Admin" className="flex items-center gap-2.5">
          <Image src="/images/brand/logo-white.png" alt="" width={273} height={42} priority className="h-[1.125rem] w-auto" />
          <span className="rounded-full border border-line px-2 py-0.5 text-[0.625rem] font-medium uppercase text-muted">Admin</span>
        </Link>
      </div>

      <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:space-y-5 lg:overflow-y-auto lg:pb-6">
        <Link href="/admin" aria-current={pathname === '/admin' ? 'page' : undefined} className={linkClass(pathname === '/admin')}>
          <LayoutDashboard aria-hidden className="size-4 shrink-0" />
          Dashboard
        </Link>
        {GROUPS.map((group) => {
          const items = available.filter((resource) => resource.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="contents lg:block">
              <p className="mb-1 hidden px-3 text-[0.6875rem] font-medium uppercase text-muted/70 lg:block">{group}</p>
              <ul className="contents lg:block lg:space-y-0.5">
                {items.map((resource) => {
                  const href = `/admin/${resource.key}`;
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={resource.key} className="shrink-0">
                      <Link href={href} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                        {resource.label}
                        {resource.key === 'inquiries' && newInquiries > 0 && (
                          <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[0.625rem] font-semibold text-white">{newInquiries}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="hidden border-t border-line p-3 lg:block">
        <a href="/en" target="_blank" rel="noopener noreferrer" className={linkClass(false)}>
          <ExternalLink aria-hidden className="size-4" />
          View Website
        </a>
        <button type="button" onClick={() => void logout()} className={`${linkClass(false)} w-full`}>
          <LogOut aria-hidden className="size-4" />
          Log Out
        </button>
        <p className="mt-2 truncate px-3 text-xs text-muted">{user.email}</p>
      </div>
      <div className="flex justify-end gap-1 border-t border-line px-3 py-2 lg:hidden">
        <a href="/en" target="_blank" rel="noopener noreferrer" className={linkClass(false)}>View Website</a>
        <button type="button" onClick={() => void logout()} className={linkClass(false)}>Log Out</button>
      </div>
    </aside>
  );
};
