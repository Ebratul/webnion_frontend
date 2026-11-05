import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
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

// The copies exist only to fill wide screens and make the loop seamless, so screen readers skip them
const LogoList = ({ clients, hidden }: { clients: ClientLogo[]; hidden?: boolean }) => (
  <ul aria-hidden={hidden || undefined} className="flex">
    {clients.map((client) => (
      <li key={client.id} className="mr-5 flex h-20 w-52 shrink-0 items-center justify-center rounded-2xl border border-line bg-white px-6 sm:h-24 sm:w-64">
        <span className="relative block size-full">
          <Image src={client.logo} alt={hidden ? '' : client.name} fill sizes="208px" draggable={false} className="object-contain py-5" />
        </span>
      </li>
    ))}
  </ul>
);

export const ClientTrust = ({ locale, t, a11y, projects, clients }: ClientTrustProps) => (
  <section aria-label={t.label}>
    {projects.length > 0 && <ProjectMosaic locale={locale} projects={projects} pauseLabel={a11y.pauseMotion} playLabel={a11y.playMotion} />}

    {clients.length > 0 && (
      <div className="section-y">
        <div className="container-page text-center">
          <h2 className="inline-block rounded-full border border-line px-6 py-1.5 text-sm font-medium tracking-normal">{t.label}</h2>
        </div>
        <PausableMarquee pauseLabel={a11y.pauseMotion} playLabel={a11y.playMotion} className="mt-8" buttonClassName="right-5 top-1/2 -translate-y-1/2 sm:right-8">
          <div className="marquee-wrap fade-edges overflow-hidden">
            <div className="marquee-track marquee-logos">
              <LogoList clients={clients} />
              <LogoList clients={clients} hidden />
              <LogoList clients={clients} hidden />
              <LogoList clients={clients} hidden />
            </div>
          </div>
        </PausableMarquee>
      </div>
    )}
  </section>
);
