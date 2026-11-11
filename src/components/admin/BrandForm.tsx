'use client';

import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { brandPalette, DEFAULT_PRIMARY } from '@/lib/brandColors';
import { DEFAULT_BRAND, type BrandSettings } from '@/lib/site';
import { ImageField } from './fields';
import { cardClass, cardPadding, inputClass, labelClass, quietButton, SaveBar } from './ui';

const HEX = /^#[0-9a-f]{6}$/i;

// A small copy of the site's own pieces, painted with the chosen colour, on a dark and a light background
const Preview = ({ colour, name, logoOnDark, logoOnLight }: { colour: string; name: string; logoOnDark: string; logoOnLight: string }) => {
  const palette = brandPalette(colour);
  const sample = (dark: boolean) => (
    <div className={`rounded-2xl border p-5 ${dark ? 'border-white/10 bg-[#0e0e13]' : 'border-black/10 bg-white'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dark ? logoOnDark : logoOnLight} alt={name} className="h-6 w-auto max-w-[10rem] object-contain" />
      <p className={`mt-4 text-sm ${dark ? 'text-white/75' : 'text-black/70'}`}>
        Text with a <span style={{ color: dark ? palette.accentDark : palette.accentLight }} className="font-semibold">highlighted link</span> in it.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <span style={{ backgroundColor: palette.primary }} className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white">
          Start Your Project <ArrowRight aria-hidden className="size-4" />
        </span>
        <span style={{ backgroundColor: palette.primaryHover }} className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-white">On hover</span>
        <span style={{ backgroundColor: `color-mix(in srgb, ${palette.primary} ${dark ? 16 : 8}%, transparent)`, color: dark ? palette.accentDark : palette.accentLight }} className="rounded-full px-3 py-1 text-xs font-semibold">Badge</span>
      </div>
    </div>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sample(true)}
      {sample(false)}
    </div>
  );
};

export const BrandForm = ({ initial }: { initial: BrandSettings }) => {
  const router = useRouter();
  const [brand, setBrand] = useState(initial);
  const [hexText, setHexText] = useState(initial.primaryColor);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) => {
    setDone(false);
    setError(null);
    setBrand((current) => ({ ...current, [key]: value }));
  };
  const setColour = (value: string) => {
    setHexText(value);
    if (HEX.test(value)) set('primaryColor', value.toLowerCase());
  };

  const colour = HEX.test(brand.primaryColor) ? brand.primaryColor : DEFAULT_PRIMARY;
  const buttonContrast = brandPalette(colour).buttonContrast;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});
    if (!HEX.test(hexText)) {
      setErrors({ primaryColor: 'Use a colour like #8224E3' });
      setError('Please check the highlighted fields');
      return;
    }
    setSaving(true);
    // A removed logo goes back to the original one
    const payload = {
      siteName: brand.siteName.trim() || DEFAULT_BRAND.siteName,
      primaryColor: colour,
      logoOnDark: brand.logoOnDark || DEFAULT_BRAND.logoOnDark,
      logoOnLight: brand.logoOnLight || DEFAULT_BRAND.logoOnLight,
      favicon: brand.favicon || null,
      shareImage: brand.shareImage || null,
      defaultTheme: brand.defaultTheme,
    };
    try {
      const response = await fetch('/api/admin/site-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand: payload }) });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string; errors?: { path: string; message: string }[] } = await response.json();
      if (!response.ok) {
        const found: Record<string, string> = {};
        for (const issue of body.errors ?? []) found[issue.path.split('.').at(-1)!] ??= issue.message;
        setErrors(found);
        setError(body.message ?? 'Could not save. Please try again.');
        return;
      }
      setBrand(payload);
      setDone(true);
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl space-y-5 pb-24">
      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Name</h2>
        <p className="mt-1 text-sm text-muted">Used for the logo's spoken name, the large name in the footer, search results and link previews. Sentences that mention the name are under Website Text.</p>
        <div className="mt-6 max-w-sm">
          <label htmlFor="siteName" className={`${labelClass} mb-1.5`}>Website name</label>
          <input id="siteName" value={brand.siteName} maxLength={40} onChange={(event) => set('siteName', event.target.value)} className={inputClass} />
          {errors.siteName && <p role="alert" className="mt-1.5 text-xs text-red-400">{errors.siteName}</p>}
        </div>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Brand Colour</h2>
            <p className="mt-1 text-sm text-muted">Buttons, links, badges and the glows across the site. Lighter and darker shades for text are worked out so they stay readable.</p>
          </div>
          {colour !== DEFAULT_PRIMARY && (
            <button type="button" onClick={() => setColour(DEFAULT_PRIMARY)} className={quietButton}>
              <RotateCcw aria-hidden className="size-4" />
              Original Purple
            </button>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="colourPicker" className={`${labelClass} mb-1.5`}>Pick</label>
            <input id="colourPicker" type="color" value={colour} onChange={(event) => setColour(event.target.value)} className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-surface-2 p-1" />
          </div>
          <div className="w-40">
            <label htmlFor="primaryColor" className={`${labelClass} mb-1.5`}>Or type it</label>
            <input id="primaryColor" value={hexText} spellCheck={false} onChange={(event) => setColour(event.target.value.trim())} className={`${inputClass} font-mono uppercase`} />
          </div>
        </div>
        {errors.primaryColor && <p role="alert" className="mt-2 text-xs text-red-400">{errors.primaryColor}</p>}
        {buttonContrast < 4.5 && (
          <p role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            White text on this colour is hard to read (contrast {buttonContrast.toFixed(1)}, at least 4.5 is needed). A darker shade works better for buttons.
          </p>
        )}
        <div className="mt-6">
          <Preview colour={colour} name={brand.siteName} logoOnDark={brand.logoOnDark || DEFAULT_BRAND.logoOnDark} logoOnLight={brand.logoOnLight || DEFAULT_BRAND.logoOnLight} />
        </div>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Logo</h2>
        <p className="mt-1 text-sm text-muted">Two versions, because the site has dark and light mode. A wide PNG or WebP with a transparent background works best, about 460 × 84 px. Removing one brings the original back when you save.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {([['logoOnDark', 'For dark backgrounds', 'Usually white or light'], ['logoOnLight', 'For light backgrounds', 'Usually dark']] as const).map(([key, label, hint]) => (
            <div key={key}>
              <label htmlFor={key} className={`${labelClass} mb-1.5`}>{label}</label>
              <ImageField id={key} logoOn={key === 'logoOnDark' ? 'dark' : 'light'} value={brand[key]} onChange={(value) => set(key, value)} />
              <p className="mt-1.5 text-xs text-muted">{hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">First Look</h2>
        <p className="mt-1 text-sm text-muted">Whether a first-time visitor sees the site dark or light. Visitors can still switch, and the site remembers their choice.</p>
        <fieldset className="mt-5 flex flex-wrap gap-3">
          <legend className="sr-only">Theme for new visitors</legend>
          {(['dark', 'light'] as const).map((theme) => (
            <label key={theme} className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-4 text-sm font-medium transition-colors duration-200 ${brand.defaultTheme === theme ? 'border-primary bg-tint text-white' : 'border-line text-muted hover:border-accent/60'}`}>
              <input type="radio" name="defaultTheme" value={theme} checked={brand.defaultTheme === theme} onChange={() => set('defaultTheme', theme)} className="size-4 accent-primary" />
              {theme === 'dark' ? 'Dark' : 'Light'}
            </label>
          ))}
        </fieldset>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Share Picture</h2>
        <p className="mt-1 text-sm text-muted">Optional. The picture shown when a link to the site is shared on Facebook, WhatsApp, LinkedIn or X. 1200 × 630 px works best.</p>
        <div className="mt-6">
          <label htmlFor="shareImage" className={`${labelClass} mb-1.5`}>Picture</label>
          <ImageField id="shareImage" value={brand.shareImage ?? ''} onChange={(value) => set('shareImage', value || null)} />
        </div>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Browser Tab Icon</h2>
        <p className="mt-1 text-sm text-muted">Optional. A square PNG, at least 192 × 192 px. Without one, the site keeps its current icon.</p>
        <div className="mt-6">
          <label htmlFor="favicon" className={`${labelClass} mb-1.5`}>Icon</label>
          <ImageField id="favicon" value={brand.favicon ?? ''} onChange={(value) => set('favicon', value || null)} />
        </div>
      </section>

      <SaveBar saving={saving} saved={done} error={error} label="Save Brand" />
    </form>
  );
};
