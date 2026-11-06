import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { ClientLogo, Project } from '@/lib/types';
import { DraggableMarquee } from '../ui/DraggableMarquee';
import { ProjectMosaic } from './ProjectMosaic';

interface ClientTrustProps {
  locale: Locale;
  t: Dictionary['trust'];
  projects: Project[];
  clients: ClientLogo[];
}

// The copies exist only to fill wide screens and make the loop seamless, so screen readers skip them
const LogoList = ({ clients, hidden }: { clients: ClientLogo[]; hidden?: boolean }) => (
  <ul aria-hidden={hidden || undefined} className="flex">
    {clients.map((client) => (
      <li key={client.id} className="mr-5 flex h-16 w-40 shrink-0 items-center justify-center rounded-2xl border border-line bg-white px-5 sm:h-24 sm:w-64 sm:px-6">
        <span className="relative block size-full">
          <Image src={client.logo} alt={hidden ? '' : client.name} fill sizes="(min-width: 640px) 208px, 160px" draggable={false} className="object-contain py-4 sm:py-5" />
        </span>
      </li>
    ))}
  </ul>
);

export const ClientTrust = ({ locale, t, projects, clients }: ClientTrustProps) => (
  <section aria-label={t.label}>
    {projects.length > 0 && <ProjectMosaic locale={locale} projects={projects} />}

    {clients.length > 0 && (
      <div className="section-y">
        <div className="container-page text-center">
          <h2 className="inline-block rounded-full border border-line px-6 py-1.5 text-sm font-medium tracking-normal">{t.label}</h2>
        </div>
        <DraggableMarquee className="mt-8">
          <div className="marquee-wrap fade-edges overflow-hidden">
            <div className="marquee-track marquee-logos">
              <LogoList clients={clients} />
              <LogoList clients={clients} hidden />
              <LogoList clients={clients} hidden />
              <LogoList clients={clients} hidden />
            </div>
          </div>
        </DraggableMarquee>
      </div>
    )}
  </section>
);
