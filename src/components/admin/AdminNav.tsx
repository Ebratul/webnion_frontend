'use client';

import { ExternalLink, FileText, LayoutDashboard, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RESOURCES, type Resource } from '@/lib/admin/resources';
import { ADMIN_SCREENS, RESOURCE_ICONS } from '@/lib/admin/screens';
import { AdminSearch, AdminSearchButton } from './AdminSearch';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import type { AdminUser } from '@/lib/admin/session';

const GROUPS: Resource['group'][] = ['Content', 'Website', 'Leads', 'Settings'];

const linkClass = (active: boolean) =>
  `group/link relative flex min-h-10 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm transition-colors duration-200 ${
    active ? 'bg-primary/20 font-medium text-white' : 'text-muted hover:bg-white/[0.05] hover:text-white'
  }`;

const iconClass = (active: boolean) => `size-4 shrink-0 transition-colors duration-200 ${active ? 'text-accent' : 'group-hover/link:text-accent'}`;

export const AdminNav = ({ user, newInquiries, brand }: { user: AdminUser; newInquiries: number; brand: { siteName: string; logoOnDark: string } }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user.role === 'ADMIN';
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push(ADMIN_LOGIN_PATH);
    router.refresh();
  };

  const sections = GROUPS.map((group) => ({
    group,
    items: [
      ...ADMIN_SCREENS.filter((link) => link.group === group && !link.last && (!link.adminOnly || isAdmin)).map((link) => ({ ...link, badge: null })),
      ...RESOURCES.filter((resource) => resource.group === group && (!resource.adminOnly || isAdmin)).map((resource) => ({
        href: `/admin/${resource.key}`,
        label: resource.label,
        Icon: RESOURCE_ICONS[resource.key] ?? FileText,
        badge: resource.key === 'inquiries' && newInquiries > 0 ? newInquiries : null,
      })),
      ...ADMIN_SCREENS.filter((link) => link.group === group && link.last && (!link.adminOnly || isAdmin)).map((link) => ({ ...link, badge: null })),
    ],
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="relative z-30 border-b border-line bg-surface lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[17rem] lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-5 py-4 lg:px-6 lg:py-7">
        <Link href="/admin" aria-label={`${brand.siteName} Admin`} className="flex min-h-10 items-center gap-3">
          <Image src={brand.logoOnDark} alt="" width={229} height={42} priority unoptimized className="h-5 w-auto max-w-[9rem] object-contain" />
          <span className="rounded-full bg-tint px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-accent">Admin</span>
        </Link>
        <div className="flex items-center gap-1 lg:hidden">
          <AdminSearchButton compact />
          <a href="/en" target="_blank" rel="noopener noreferrer" aria-label="View Website" className="grid size-10 place-items-center rounded-xl text-muted transition-colors duration-200 hover:bg-white/[0.05] hover:text-white">
            <ExternalLink aria-hidden className="size-4" />
          </a>
          <button type="button" onClick={() => void logout()} aria-label="Log Out" className="grid size-10 place-items-center rounded-xl text-muted transition-colors duration-200 hover:bg-white/[0.05] hover:text-white">
            <LogOut aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      <div className="hidden px-4 pb-4 lg:block">
        <AdminSearchButton />
      </div>
      <AdminSearch isAdmin={isAdmin} />

      <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:space-y-6 lg:overflow-y-auto lg:px-4 lg:pb-6">
        <Link href="/admin" aria-current={pathname === '/admin' ? 'page' : undefined} className={linkClass(pathname === '/admin')}>
          <LayoutDashboard aria-hidden className={iconClass(pathname === '/admin')} />
          Dashboard
        </Link>
        {sections.map(({ group, items }) => (
          <div key={group} className="contents lg:block">
            <p className="mb-2 hidden px-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted/80 lg:block">{group}</p>
            <ul className="contents lg:block lg:space-y-1">
              {items.map(({ href, label, Icon, badge }) => {
                const active = isActive(href);
                return (
                  <li key={href} className="shrink-0">
                    <Link href={href} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                      <Icon aria-hidden className={iconClass(active)} />
                      {label}
                      {badge !== null && <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums text-white">{badge}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="hidden border-t border-line p-4 lg:block">
        <div className="flex items-center gap-3 px-2 pb-3">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted">{user.email}</span>
          </span>
        </div>
        <a href="/en" target="_blank" rel="noopener noreferrer" className={linkClass(false)}>
          <ExternalLink aria-hidden className={iconClass(false)} />
          View Website
        </a>
        <button type="button" onClick={() => void logout()} className={`${linkClass(false)} w-full`}>
          <LogOut aria-hidden className={iconClass(false)} />
          Log Out
        </button>
      </div>
    </aside>
  );
};
