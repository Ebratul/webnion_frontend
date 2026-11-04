'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS, sectionHref } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  locale: Locale;
  nav: Dictionary['nav'];
  a11y: Dictionary['a11y'];
}

export const Header = ({ locale, nav, a11y }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const links = [
    { href: `/${locale}`, label: nav.home },
    { href: `/${locale}/service`, label: nav.services },
    { href: `/${locale}/project`, label: nav.portfolio },
    { href: `/${locale}/products`, label: nav.products },
    { href: sectionHref(locale, SECTION_IDS.pricing), label: nav.pricing },
    { href: `/${locale}/case-studies`, label: nav.caseStudies },
    { href: sectionHref(locale, SECTION_IDS.contact), label: nav.contact },
    { href: sectionHref(locale, SECTION_IDS.team), label: nav.team },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="container-page flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-2 sm:gap-4">
        <Logo locale={locale} />

        <nav aria-label={a11y.primaryNav} className="hidden xl:block">
          <ul className="flex items-center gap-5 2xl:gap-7">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className="text-sm font-medium text-fg/85 transition-colors duration-200 hover:text-accent aria-[current=page]:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitch locale={locale} text={nav.switchLanguage} label={nav.switchLanguageLabel} />
          <ThemeToggle label={a11y.toggleTheme} />
          <div className="ml-1 hidden xl:block">
            <PrimaryLink href={sectionHref(locale, SECTION_IDS.contact)}>{nav.cta}</PrimaryLink>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? a11y.closeMenu : a11y.openMenu}
            className="grid size-9 place-items-center rounded-full border border-line text-fg sm:size-10 xl:hidden"
          >
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={a11y.primaryNav} className="border-t border-line bg-bg xl:hidden">
          <ul className="container-page flex flex-col py-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="block py-3 text-base font-medium text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};
