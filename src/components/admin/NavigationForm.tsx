'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import type { LocalizedValue } from '@/lib/admin/resources';
import { SOCIAL_LABELS, SOCIAL_NETWORKS, type NavigationSettings, type NavLink, type SocialNetwork } from '@/lib/navigation';
import { SITE_URL } from '@/lib/site';
import { SocialIcon } from '../ui/SocialIcon';
import { cardClass, cardPadding, inputClass, labelClass, quietButton, SaveBar } from './ui';

const iconButton =
  'grid size-10 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent';
const smallLabel = 'mb-1.5 block text-xs text-muted';

const move = <T,>(list: T[], index: number, delta: number) => {
  const next = [...list];
  [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
  return next;
};

const RowButtons = ({ index, count, onMove, onRemove, name }: { index: number; count: number; onMove: (delta: number) => void; onRemove: () => void; name: string }) => (
  <div className="flex shrink-0 items-center self-end">
    <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${name} up`} className={iconButton}><ArrowUp aria-hidden className="size-4" /></button>
    <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${name} down`} className={iconButton}><ArrowDown aria-hidden className="size-4" /></button>
    <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className={`${iconButton} hover:text-red-400`}><Trash2 aria-hidden className="size-4" /></button>
  </div>
);

const Section = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <section className={`${cardClass} ${cardPadding}`}>
    <h2 className="text-base font-semibold">{title}</h2>
    <p className="mt-1 text-sm text-muted">{description}</p>
    <div className="mt-6">{children}</div>
  </section>
);

const LinkList = ({ id, links, onChange, addLabel }: { id: string; links: NavLink[]; onChange: (links: NavLink[]) => void; addLabel: string }) => {
  const update = (index: number, link: NavLink) => onChange(links.map((item, at) => (at === index ? link : item)));
  return (
    <div className="space-y-4">
      {links.map((link, index) => {
        const name = link.label.en || `link ${index + 1}`;
        return (
          <div key={index} className="flex flex-wrap items-end gap-3 rounded-xl border border-line p-4 sm:flex-nowrap">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor={`${id}-${index}-en`} className={smallLabel}>Label, English</label>
                <input id={`${id}-${index}-en`} value={link.label.en} onChange={(event) => update(index, { ...link, label: { ...link.label, en: event.target.value } })} className={inputClass} />
              </div>
              <div>
                <label htmlFor={`${id}-${index}-bn`} className={smallLabel}>লেবেল, বাংলা</label>
                <input id={`${id}-${index}-bn`} lang="bn" value={link.label.bn} placeholder={link.label.en ? 'Empty uses English' : undefined} onChange={(event) => update(index, { ...link, label: { ...link.label, bn: event.target.value } })} className={inputClass} />
              </div>
              <div>
                <label htmlFor={`${id}-${index}-href`} className={smallLabel}>Link</label>
                <input id={`${id}-${index}-href`} dir="ltr" spellCheck={false} value={link.href} placeholder="/contact" onChange={(event) => update(index, { ...link, href: event.target.value })} className={inputClass} />
              </div>
            </div>
            <RowButtons index={index} count={links.length} name={name} onMove={(delta) => onChange(move(links, index, delta))} onRemove={() => onChange(links.filter((_, at) => at !== index))} />
          </div>
        );
      })}
      <button type="button" onClick={() => onChange([...links, { label: { en: '', bn: '' }, href: '' }])} className={quietButton}>
        <Plus aria-hidden className="size-4" />
        {addLabel}
      </button>
    </div>
  );
};

const linkHint = 'Links: a page such as /contact or /project, a homepage section such as #pricing, or a full address starting with https://';

// A full address of this site, or a path with the language in it, becomes a plain path like /blog. The site then adds the
// visitor's language, so Bangla readers stay in Bangla and the link still works if the domain changes.
const ownSite = (href: string) => {
  const value = href.trim();
  let path = value;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const own = [window.location.host, new URL(SITE_URL).host].includes(url.host);
      if (!own) return value;
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return value;
    }
  }
  if (!path.startsWith('/')) return value;
  const withoutLanguage = path.replace(/^\/(en|bn)(?=\/|#|\?|$)/, '');
  return withoutLanguage === '' ? '/' : withoutLanguage;
};

const cleanLabel = (label: LocalizedValue) => ({ en: label.en.trim() || label.bn.trim(), bn: label.bn.trim() || label.en.trim() });

export const NavigationForm = ({ initial, services }: { initial: NavigationSettings; services: { slug: string; title: LocalizedValue }[] }) => {
  const router = useRouter();
  const [nav, setNav] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const set = <K extends keyof NavigationSettings>(key: K, value: NavigationSettings[K]) => {
    setDone(false);
    setError(null);
    setNav((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setProblems([]);
    // Empty rows are dropped, and a missing Bangla label uses the English one
    const links = (list: NavLink[]) => list.filter((link) => (link.label.en.trim() || link.label.bn.trim()) && link.href.trim()).map((link) => ({ label: cleanLabel(link.label), href: ownSite(link.href) }));
    const payload: NavigationSettings = {
      header: links(nav.header),
      headerButton: { href: ownSite(nav.headerButton.href) || '/contact' },
      footerQuick: links(nav.footerQuick),
      footerCompany: links(nav.footerCompany ?? []),
      footerServices: links(nav.footerServices),
      socials: nav.socials.filter((social) => social.url.trim()).map((social) => ({ network: social.network, url: social.url.trim() })),
      offices: nav.offices.filter((office) => office.name.en.trim() || office.name.bn.trim()).map((office) => ({ name: cleanLabel(office.name), address: cleanLabel(office.address) })),
    };
    setSaving(true);
    try {
      const response = await fetch('/api/admin/site-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ navigation: payload }) });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string; errors?: { path: string; message: string }[] } = await response.json();
      if (!response.ok) {
        const names: Record<string, string> = { header: 'Header menu', headerButton: 'Header button', footerQuick: 'Quick Links', footerCompany: 'Company column', footerServices: 'Services column', socials: 'Social links', offices: 'Offices' };
        setProblems((body.errors ?? []).map((issue) => {
          const [, group, row] = issue.path.split('.');
          return `${names[group ?? ''] ?? group}${row && /^\d+$/.test(row) ? `, row ${Number(row) + 1}` : ''}: ${issue.message}`;
        }));
        setError(body.message ?? 'Could not save. Please try again.');
        return;
      }
      setNav(payload);
      setDone(true);
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-5xl space-y-5 pb-24">
      {problems.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          {problems.map((problem) => <li key={problem}>{problem}</li>)}
        </ul>
      )}

      <Section title="Header Menu" description={`The links in the top bar and the phone menu, in this order. ${linkHint}`}>
        <LinkList id="header" links={nav.header} onChange={(value) => set('header', value)} addLabel="Add Menu Link" />
        <div className="mt-6 max-w-sm border-t border-line pt-6">
          <label htmlFor="headerButton" className={`${labelClass} mb-1.5`}>Header button link</label>
          <input id="headerButton" dir="ltr" spellCheck={false} value={nav.headerButton.href} onChange={(event) => set('headerButton', { href: event.target.value })} className={inputClass} />
          <p className="mt-1.5 text-xs text-muted">Where "Schedule a Meeting" leads. Its words are under Website Text, Menu.</p>
        </div>
      </Section>

      <Section title="Footer: Quick Links" description="The first link column in the footer.">
        <LinkList id="quick" links={nav.footerQuick} onChange={(value) => set('footerQuick', value)} addLabel="Add Link" />
      </Section>

      <Section title="Footer: Company" description="The column beside Quick Links: your brands and company pages. A brand with its own website takes its full address, starting with https://. Leave the list empty to hide the column.">
        <LinkList id="company" links={nav.footerCompany ?? []} onChange={(value) => set('footerCompany', value)} addLabel="Add Link" />
      </Section>

      <Section title="Footer: Services" description="The last link column. Fill it from your Services list, or set the links by hand.">
        <div className="mb-5">
          <button type="button" onClick={() => set('footerServices', services.map((service) => ({ label: service.title, href: `/services/${service.slug}` })))} className={quietButton}>
            Use All {services.length} Services
          </button>
        </div>
        <LinkList id="services" links={nav.footerServices} onChange={(value) => set('footerServices', value)} addLabel="Add Link" />
      </Section>

      <Section title="Social Links" description="Round buttons under the footer text, in this order. Each needs a full address starting with https://">
        <div className="space-y-4">
          {nav.socials.map((social, index) => (
            <div key={index} className="flex flex-wrap items-end gap-3 rounded-xl border border-line p-4 sm:flex-nowrap">
              <span aria-hidden className="mb-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-line"><SocialIcon network={social.network} /></span>
              <div className="w-full sm:w-48">
                <label htmlFor={`social-${index}-network`} className={smallLabel}>Network</label>
                <select id={`social-${index}-network`} value={social.network} onChange={(event) => set('socials', nav.socials.map((item, at) => (at === index ? { ...item, network: event.target.value as SocialNetwork } : item)))} className={inputClass}>
                  {SOCIAL_NETWORKS.map((network) => <option key={network} value={network}>{SOCIAL_LABELS[network]}</option>)}
                </select>
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor={`social-${index}-url`} className={smallLabel}>Address</label>
                <input id={`social-${index}-url`} type="url" dir="ltr" spellCheck={false} placeholder="https://" value={social.url} onChange={(event) => set('socials', nav.socials.map((item, at) => (at === index ? { ...item, url: event.target.value } : item)))} className={inputClass} />
              </div>
              <RowButtons index={index} count={nav.socials.length} name={SOCIAL_LABELS[social.network]} onMove={(delta) => set('socials', move(nav.socials, index, delta))} onRemove={() => set('socials', nav.socials.filter((_, at) => at !== index))} />
            </div>
          ))}
          <button type="button" onClick={() => set('socials', [...nav.socials, { network: 'linkedin', url: '' }])} className={quietButton}>
            <Plus aria-hidden className="size-4" />
            Add Social Link
          </button>
        </div>
      </Section>

      <Section title="Offices" description="Shown in the footer's contact row, each with its address. Phone numbers and email are under Contact & Links.">
        <div className="space-y-4">
          {nav.offices.map((office, index) => {
            const update = (field: 'name' | 'address', language: 'en' | 'bn', value: string) => set('offices', nav.offices.map((item, at) => (at === index ? { ...item, [field]: { ...item[field], [language]: value } } : item)));
            return (
              <div key={index} className="flex flex-wrap items-end gap-3 rounded-xl border border-line p-4 sm:flex-nowrap">
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`office-${index}-name-en`} className={smallLabel}>Name, English</label>
                    <input id={`office-${index}-name-en`} value={office.name.en} onChange={(event) => update('name', 'en', event.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor={`office-${index}-name-bn`} className={smallLabel}>নাম, বাংলা</label>
                    <input id={`office-${index}-name-bn`} lang="bn" value={office.name.bn} onChange={(event) => update('name', 'bn', event.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor={`office-${index}-address-en`} className={smallLabel}>Address, English</label>
                    <input id={`office-${index}-address-en`} value={office.address.en} onChange={(event) => update('address', 'en', event.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor={`office-${index}-address-bn`} className={smallLabel}>ঠিকানা, বাংলা</label>
                    <input id={`office-${index}-address-bn`} lang="bn" value={office.address.bn} onChange={(event) => update('address', 'bn', event.target.value)} className={inputClass} />
                  </div>
                </div>
                <RowButtons index={index} count={nav.offices.length} name={office.name.en || `office ${index + 1}`} onMove={(delta) => set('offices', move(nav.offices, index, delta))} onRemove={() => set('offices', nav.offices.filter((_, at) => at !== index))} />
              </div>
            );
          })}
          <button type="button" onClick={() => set('offices', [...nav.offices, { name: { en: '', bn: '' }, address: { en: '', bn: '' } }])} className={quietButton}>
            <Plus aria-hidden className="size-4" />
            Add Office
          </button>
        </div>
      </Section>

      <SaveBar saving={saving} saved={done} error={error} label="Save Menu & Footer" />
    </form>
  );
};
