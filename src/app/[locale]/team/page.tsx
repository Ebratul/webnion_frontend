import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
import type { TeamMember } from '@/lib/types';
import { getSiteDictionary } from '@/lib/siteSettings';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getSiteDictionary(locale)).teamPage;

  return {
    title: t.metaTitle,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/team`, languages: { en: '/en/team', bn: '/bn/team', 'x-default': '/en/team' } },
    openGraph: { title: t.metaTitle, description: t.subtitle, url: `/${locale}/team`, siteName: 'Webnion', type: 'website' },
  };
};

const TeamCard = ({ member }: { member: TeamMember }) => (
  <article className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-transparent bg-surface-2 transition-[border-color] duration-300 hover:border-primary/40">
    <Image src={member.photo} alt={member.name} fill sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 pt-20 text-white md:p-6 md:pt-24">
      <h3 className="text-lg font-medium leading-snug md:text-xl [&:lang(en)]:tracking-[-0.02em]">{member.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/80">{member.role}</p>
    </div>
  </article>
);

export default async function TeamPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getSiteDictionary(locale);
  const t = dictionary.teamPage;
  const { team } = await getHomeData(locale);

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <section aria-labelledby="team-page-title" className="team-page section-y">
        <div className="container-page">
          <div className="reveal mx-auto mb-12 max-w-3xl text-center">
            <p className="team-kicker mb-3.5 inline-flex items-center gap-2 text-[13px] font-semibold uppercase leading-none text-accent [&:lang(en)]:tracking-[0.11em]">{t.kicker}</p>
            <h2 id="team-page-title" className="text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.12] [&:lang(en)]:tracking-[-0.035em]">{dictionary.team.title}</h2>
            <p className="mx-auto mt-[18px] max-w-[640px] text-[15px] leading-[1.75] text-muted md:text-base">{dictionary.team.subtitle}</p>
          </div>

          {team.length === 0 ? (
            <p className="py-16 text-center text-muted">{t.empty}</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <li key={member.id} className="reveal">
                  <TeamCard member={member} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}
