import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { ClientLogo, Project } from '@/lib/types';
import { ProjectMosaic } from './ProjectMosaic';

interface ClientTrustProps {
  t: Dictionary['trust'];
  a11y: Dictionary['a11y'];
  projects: Project[];
  clients: ClientLogo[];
}

export const ClientTrust = ({ t, a11y, projects, clients }: ClientTrustProps) => (
  <section aria-label={t.line}>
    {projects.length > 0 && <ProjectMosaic projects={projects} pauseLabel={a11y.pauseMotion} playLabel={a11y.playMotion} />}

    <div className="container-page grid items-center gap-8 py-14 lg:grid-cols-[15rem_1fr] lg:gap-12 lg:py-16">
      <a
        href={`#${SECTION_IDS.portfolio}`}
        className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors duration-200 hover:border-accent"
      >
        <span>
          <span className="block text-lg font-semibold text-accent">{t.count}</span>
          <span className="mt-1 block text-xs text-muted">{t.line}</span>
        </span>
        <ArrowRight aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
      </a>

      <ul aria-label={t.logosLabel} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {clients.map((client) => (
          <li key={client.id} className="grid h-20 place-items-center rounded-xl border border-line bg-white px-5">
            <Image src={client.logo} alt={client.name} width={160} height={56} sizes="160px" className="h-auto max-h-12 w-auto object-contain" />
          </li>
        ))}
      </ul>
    </div>
  </section>
);
