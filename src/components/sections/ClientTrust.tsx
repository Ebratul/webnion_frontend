import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { ClientLogo, Project } from '@/lib/types';
import { ProjectMosaic } from './ProjectMosaic';

const VISIBLE_LOGOS = 5;

interface ClientTrustProps {
  locale: Locale;
  t: Dictionary['trust'];
  a11y: Dictionary['a11y'];
  projects: Project[];
  clients: ClientLogo[];
}

export const ClientTrust = ({ locale, t, a11y, projects, clients }: ClientTrustProps) => (
  <section aria-label={t.label}>
    {projects.length > 0 && <ProjectMosaic locale={locale} projects={projects} pauseLabel={a11y.pauseMotion} playLabel={a11y.playMotion} />}

    {clients.length > 0 && (
      <div className="container-page py-10 text-center lg:py-12">
        <h2 className="text-sm font-normal text-muted">{t.label}</h2>
        {/* Shown as one flat colour, so logos need a transparent background */}
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14">
          {clients.slice(0, VISIBLE_LOGOS).map((client) => (
            <li key={client.id} className="relative h-7 w-28 sm:h-9 sm:w-36">
              <Image src={client.logo} alt={client.name} fill sizes="144px" className="object-contain opacity-55 brightness-0 dark:opacity-60 dark:invert" />
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
);
