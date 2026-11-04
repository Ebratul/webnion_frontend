import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { ClientLogo, Project } from '@/lib/types';
import { PausableMarquee } from '../ui/PausableMarquee';
import { ProjectMosaic } from './ProjectMosaic';

interface ClientTrustProps {
  locale: Locale;
  t: Dictionary['trust'];
  a11y: Dictionary['a11y'];
  projects: Project[];
  clients: ClientLogo[];
}

export const ClientTrust = ({ locale, t, a11y, projects, clients }: ClientTrustProps) => (
  <section aria-label={t.logosLabel}>
    {projects.length > 0 && <ProjectMosaic locale={locale} projects={projects} pauseLabel={a11y.pauseMotion} playLabel={a11y.playMotion} />}

    <div className="band-light">
      <div className="container-page grid items-center gap-8 py-12 lg:grid-cols-[14rem_1fr] lg:gap-12 lg:py-14">
        <a
          href={`#${SECTION_IDS.portfolio}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors duration-200 hover:border-accent"
        >
          <span>
            <span className="block text-lg font-semibold text-accent">{t.count}</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted">{t.line}</span>
          </span>
          <ArrowRight aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
        </a>

        <PausableMarquee pauseLabel={a11y.pauseMotion} playLabel={a11y.playMotion} className="min-w-0" buttonClassName="-right-3 top-1/2 size-8 -translate-y-1/2 sm:-right-5">
          <div className="fade-edges overflow-hidden">
            <div className="marquee-track items-center">
              {[...clients, ...clients].map((client, index) => {
                const isCopy = index >= clients.length;
                return (
                  <span key={`${client.id}-${index}`} aria-hidden={isCopy || undefined} className="relative mr-10 block h-14 w-44 shrink-0 sm:mr-14">
                    <Image src={client.logo} alt={isCopy ? '' : client.name} fill sizes="176px" draggable={false} className="object-contain" />
                  </span>
                );
              })}
            </div>
          </div>
        </PausableMarquee>
      </div>
    </div>
  </section>
);
