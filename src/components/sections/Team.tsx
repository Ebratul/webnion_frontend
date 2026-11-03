import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { TeamMember } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';

const TECHNOLOGIES = ['Next.js', 'React.js', 'Node.js', 'Laravel', 'PHP', 'MySQL', 'MongoDB', 'WordPress', 'WooCommerce', 'Shopify', 'Webflow', 'Git & GitHub'];

export const Team = ({ t, members }: { t: Dictionary['team']; members: TeamMember[] }) => (
  <section id={SECTION_IDS.team} aria-labelledby="team-title" className="section-y bg-surface">
    <div className="container-page">
      <SectionHeading id="team-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
        {members.map((member) => (
          <li key={member.id} className="reveal">
            <Image
              src={member.photo}
              alt={member.name}
              width={560}
              height={700}
              sizes="(min-width: 1024px) 190px, (min-width: 768px) 30vw, 45vw"
              className="aspect-[4/5] w-full rounded-2xl bg-surface-2 object-cover"
            />
            <h3 className="mt-3 text-sm font-semibold">{member.name}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{member.role}</p>
          </li>
        ))}
      </ul>

      <div className="reveal mt-14 text-center">
        <p className="text-sm font-medium text-muted">{t.stackLabel}</p>
        <ul translate="no" className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
          {TECHNOLOGIES.map((technology) => (
            <li key={technology} className="rounded-full border border-line bg-bg px-3.5 py-1.5 text-xs font-medium">
              {technology}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
