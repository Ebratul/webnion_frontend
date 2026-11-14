'use client';

import { CalendarClock, Check, Circle, Eye, FileText, Globe, ImagePlus, Link2, Search, Sparkles, Tag, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { getResource, slugify, toFormValues, toPayload, type Block, type LocalizedValue } from '@/lib/admin/resources';
import { SITE_URL } from '@/lib/site';
import { BlocksField, useUpload } from './fields';
import { cardClass, inputClass, SaveBar } from './ui';

type Row = Record<string, unknown>;

interface PostValues {
  title: LocalizedValue;
  slug: string;
  excerpt: LocalizedValue;
  cover: string;
  coverAlt: LocalizedValue;
  tags: string;
  content: Record<'en' | 'bn', Block[]>;
  seoTitle: LocalizedValue;
  seoDescription: LocalizedValue;
  status: string;
  publishedAt: string;
  authorName: string;
}

const RESOURCE_KEY = 'blog-posts';
const SEO_TITLE = 60;
const SEO_DESCRIPTION = 155;
const SUMMARY_MAX = 400;
const WORDS_PER_MINUTE = 220;

const smallLabel = 'mb-1.5 block text-xs font-medium text-muted';
const quietButton =
  'inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs font-medium text-fg transition-[border-color,color,background-color] duration-200 hover:border-accent/60 hover:bg-tint hover:text-white disabled:opacity-50';

const blockWords = (blocks: Block[]) =>
  blocks
    .flatMap((block) => (block.type === 'list' ? block.items : block.type === 'image' ? [] : [block.text]))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

const splitTags = (value: string) => value.split(',').map((tag) => tag.trim()).filter(Boolean);

// One card of the editor: an icon, a title and an optional line on the right such as a counter
const Panel = ({ icon, title, description, aside, children, id }: { icon: ReactNode; title: string; description?: string; aside?: ReactNode; children: ReactNode; id?: string }) => (
  <section id={id} className={`${cardClass} overflow-hidden`}>
    <header className="flex items-start gap-3.5 border-b border-line px-6 py-4.5 sm:px-7">
      <span aria-hidden className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-tint text-accent ring-1 ring-inset ring-accent/20">{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[0.95rem] font-semibold leading-6">{title}</h2>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>}
      </div>
      {aside && <div className="shrink-0 self-center">{aside}</div>}
    </header>
    <div className="space-y-6 px-6 py-6 sm:px-7">{children}</div>
  </section>
);

const LangTag = ({ lang }: { lang: 'en' | 'bn' }) => (
  <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
    {lang === 'en' ? 'EN' : 'বাং'}
  </span>
);

// A counter that turns amber past the length search engines show
const Counter = ({ length, limit }: { length: number; limit: number }) => (
  <span className={`text-[0.7rem] tabular-nums ${length > limit ? 'text-amber-400' : 'text-muted'}`}>
    {length}/{limit}
  </span>
);

const FieldError = ({ message }: { message?: string }) => (message ? <p role="alert" className="mt-1.5 text-xs text-red-400">{message}</p> : null);

// English and Bangla, one above the other with a small language tag inside each box
const BilingualInput = ({
  id,
  value,
  onChange,
  multiline,
  large,
  placeholder,
  invalid,
  limit,
}: {
  id: string;
  value: LocalizedValue;
  onChange: (value: LocalizedValue) => void;
  multiline?: boolean;
  large?: boolean;
  placeholder: string;
  invalid?: boolean;
  limit?: number;
}) => {
  const box = `${inputClass} pl-14 ${large ? 'text-base font-semibold sm:text-lg' : ''} ${invalid ? 'border-red-400/70' : ''}`;
  const control = (lang: 'en' | 'bn') => {
    const common = {
      id: `${id}-${lang}`,
      lang,
      value: value[lang],
      'aria-label': lang === 'en' ? 'English' : 'Bangla',
      'aria-invalid': lang === 'en' && invalid ? true : undefined,
      placeholder: lang === 'en' ? placeholder : value.en ? 'বাংলা (optional, empty uses the English text)' : 'বাংলা (optional)',
      maxLength: limit,
      className: multiline ? `${box} min-h-[5.5rem] resize-none [field-sizing:content]` : box,
    };
    return multiline ? (
      <textarea {...common} rows={3} onChange={(event) => onChange({ ...value, [lang]: event.target.value })} />
    ) : (
      <input {...common} onChange={(event) => onChange({ ...value, [lang]: event.target.value })} />
    );
  };
  return (
    <div className="space-y-2.5">
      {(['en', 'bn'] as const).map((lang) => (
        <div key={lang} className="relative">
          <LangTag lang={lang} />
          {control(lang)}
        </div>
      ))}
    </div>
  );
};

// The wide cover: a 16:9 drop area that shows the picture as the blog will
const CoverField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const input = useRef<HTMLInputElement>(null);
  const { progress, error, upload } = useUpload(onChange);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <input
        ref={input}
        id="field-cover"
        type="file"
        aria-label="Upload cover picture"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          void upload(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <div
        id="post-cover"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files[0]);
        }}
        className={`group relative overflow-hidden rounded-2xl border transition-colors duration-200 ${value ? 'aspect-video' : 'h-52'} ${
          value ? 'border-line' : `border-dashed ${dragging ? 'border-accent bg-tint' : 'border-white/15 bg-surface-2 hover:border-accent/50'}`
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} disabled={progress !== null} className="flex size-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-tint text-accent ring-1 ring-inset ring-accent/20">
              <ImagePlus aria-hidden className="size-5" />
            </span>
            <span className="text-sm font-medium">{progress !== null ? `Uploading ${progress}%` : 'Drop a picture here or click to upload'}</span>
            <span className="text-xs text-muted">JPG, PNG or WebP · wide, at least 1200 × 675 px · up to 4 MB</span>
          </button>
        )}
        {progress !== null && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <div className="h-full origin-left bg-primary transition-transform duration-200" style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        )}
      </div>
      {value && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={progress !== null} className={quietButton}>
            <Upload aria-hidden className="size-3.5" />
            {progress !== null ? `Uploading ${progress}%` : 'Replace'}
          </button>
          <button type="button" onClick={() => onChange('')} className={quietButton}>
            <X aria-hidden className="size-3.5" />
            Remove
          </button>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
};

// Topics as chips: Enter or a comma adds one, Backspace on an empty box removes the last
const TopicsField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [draft, setDraft] = useState('');
  const tags = splitTags(value);

  const add = (raw: string) => {
    const next = raw.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (next.length === 0) return;
    const known = new Set(tags.map((tag) => tag.toLowerCase()));
    const merged = [...tags, ...next.filter((tag) => !known.has(tag.toLowerCase()))];
    const joined = merged.join(', ');
    if (joined.length <= 400) onChange(joined);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1).join(', '));
    }
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2 px-2.5 py-2 transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 hover:border-white/25">
      {tags.map((tag, index) => (
        <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-tint py-1 pl-3 pr-1 text-xs font-medium text-accent ring-1 ring-inset ring-accent/20">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((_, other) => other !== index).join(', '))} aria-label={`Remove topic ${tag}`} className="grid size-5 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white">
            <X aria-hidden className="size-3" />
          </button>
        </span>
      ))}
      <input
        id="field-tags"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        aria-label="Add a topic"
        placeholder={tags.length ? 'Add another…' : 'Type a topic and press Enter, e.g. website, seo, speed'}
        className="min-w-[10rem] flex-1 bg-transparent px-1.5 py-1 text-sm placeholder:text-muted/70 focus:outline-none"
      />
    </div>
  );
};

// What the post looks like as a Google result, from the search fields or the title and summary
const SearchPreview = ({ title, description, slug }: { title: string; description: string; slug: string }) => {
  const host = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <div className="rounded-xl border border-line bg-[#101016] p-4">
      <p className="flex items-center gap-2 text-xs text-muted">
        <span className="grid size-6 place-items-center rounded-full bg-white/[0.08]">
          <Globe aria-hidden className="size-3.5" />
        </span>
        <span className="truncate">
          {host} › en › blog › {slug || 'page-address'}
        </span>
      </p>
      <p className="mt-2 line-clamp-1 text-[1.05rem] font-medium text-[#99c3ff]">{title || 'The post title appears here'}</p>
      <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed text-white/60">{description || 'The short summary appears here. Write one or two sentences that make people want to read the article.'}</p>
    </div>
  );
};

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', description: 'Only visible here' },
  { value: 'PUBLISHED', label: 'Published', description: 'On the website' },
];

export const BlogPostForm = ({ row }: { row?: Row }) => {
  const resource = getResource(RESOURCE_KEY)!;
  const router = useRouter();
  const isNew = !row;
  const [values, setValues] = useState<PostValues>(() => toFormValues(resource, row) as unknown as PostValues);
  const [initial, setInitial] = useState(() => JSON.stringify(values));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // The address follows the title on a new post until someone edits it by hand
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const dirty = JSON.stringify(values) !== initial;

  // Leaving with unsaved edits asks first
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof PostValues>(name: K, value: PostValues[K]) => {
    setSaved(false);
    setFormError(null);
    setErrors((current) => {
      if (!(name in current) && !(name === 'title' && !slugTouched)) return current;
      const rest = { ...current };
      delete rest[name];
      if (name === 'title' && !slugTouched) delete rest.slug;
      return rest;
    });
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (name === 'title' && !slugTouched) next.slug = slugify((value as LocalizedValue).en);
      return next;
    });
  };

  const words = useMemo(() => blockWords(values.content.en), [values.content.en]);
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const tagCount = splitTags(values.tags).length;
  const today = new Date().toISOString().slice(0, 10);
  const scheduled = values.status === 'PUBLISHED' && values.publishedAt > today;

  const checklist = [
    { label: 'Title', done: Boolean(values.title.en.trim()), target: 'field-title-en' },
    { label: 'Short summary', done: Boolean(values.excerpt.en.trim()), target: 'field-excerpt-en' },
    { label: 'Cover picture', done: Boolean(values.cover), target: 'post-cover' },
    { label: 'Cover description', done: Boolean(values.cover && values.coverAlt.en.trim()), target: 'field-coverAlt-en' },
    { label: `Article, 300+ words (${words})`, done: words >= 300, target: 'post-article' },
    { label: 'At least one topic', done: tagCount > 0, target: 'field-tags' },
    { label: 'Bangla version (optional)', done: Boolean(values.title.bn.trim() && values.content.bn.length), target: 'field-title-bn' },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  const focusTarget = (target: string) => {
    const element = document.getElementById(target);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) element.focus({ preventScroll: true });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSaved(false);

    const { payload, errors: found } = toPayload(resource, values as unknown as Row, isNew);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Please fix the highlighted fields.');
      const first = ['title', 'slug', 'content'].find((name) => found[name]);
      if (first) focusTarget(first === 'title' ? 'field-title-en' : first === 'slug' ? 'field-slug' : 'post-article');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin${resource.apiPath}${isNew ? '' : `/${String(row.id)}`}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string; errors?: { path: string; message: string }[] } = await response.json();
      if (!response.ok) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of body.errors ?? []) {
          const name = issue.path.split('.')[0]!;
          fieldErrors[name] ??= issue.message;
        }
        setErrors(fieldErrors);
        setFormError(body.message ?? 'Could not save. Please try again.');
        return;
      }
      setInitial(JSON.stringify(values));
      if (isNew) {
        router.push(`/admin/${resource.key}`);
        router.refresh();
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setFormError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const submitLabel = isNew ? (values.status === 'PUBLISHED' ? (scheduled ? 'Schedule Post' : 'Publish Post') : 'Save Draft') : 'Save Changes';

  return (
    <form onSubmit={onSubmit} noValidate className="pb-28">
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19.5rem]">
        <div className="min-w-0 space-y-5">
          <Panel icon={<FileText className="size-4" />} title="Headline" description="Bangla is optional. Without it, Bangla readers see the English text.">
            <div>
              <label htmlFor="field-title-en" className="mb-2 block text-sm font-medium">
                Title<span aria-hidden className="ml-1 text-accent">*</span>
              </label>
              <BilingualInput id="field-title" large value={values.title} onChange={(next) => set('title', next)} placeholder="A clear title that says what the reader gets" invalid={Boolean(errors.title)} limit={200} />
              <FieldError message={errors.title} />
            </div>

            <div>
              <label htmlFor="field-slug" className="mb-2 flex items-center justify-between gap-3 text-sm font-medium">
                <span>
                  Page address<span aria-hidden className="ml-1 text-accent">*</span>
                </span>
                {!slugTouched && <span className="text-[0.7rem] font-normal text-muted">Follows the title</span>}
              </label>
              <div className={`flex min-h-11 items-stretch overflow-hidden rounded-xl border bg-surface-2 transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 hover:border-white/25 ${errors.slug ? 'border-red-400/70' : 'border-line'}`}>
                <span className="flex select-none items-center gap-1.5 border-r border-line bg-white/[0.03] px-3 text-xs text-muted">
                  <Link2 aria-hidden className="size-3.5" />
                  /blog/
                </span>
                <input
                  id="field-slug"
                  value={values.slug}
                  spellCheck={false}
                  maxLength={160}
                  aria-invalid={errors.slug ? true : undefined}
                  onChange={(event) => {
                    setSlugTouched(true);
                    set('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="this-text"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm focus:outline-none"
                />
              </div>
              {errors.slug ? <FieldError message={errors.slug} /> : <p className="mt-1.5 text-xs text-muted">Lowercase letters, numbers and hyphens.</p>}
            </div>

            <div>
              <label htmlFor="field-excerpt-en" className="mb-2 flex items-center justify-between gap-3 text-sm font-medium">
                Short summary
                <Counter length={values.excerpt.en.length} limit={SUMMARY_MAX} />
              </label>
              <BilingualInput id="field-excerpt" multiline value={values.excerpt} onChange={(next) => set('excerpt', next)} placeholder="One or two sentences shown on the blog list" limit={SUMMARY_MAX} />
              <FieldError message={errors.excerpt} />
            </div>
          </Panel>

          <Panel icon={<ImagePlus className="size-4" />} title="Cover picture" description="Shown at the top of the post and on the blog cards.">
            <CoverField value={values.cover} onChange={(next) => set('cover', next)} />
            <div>
              <label htmlFor="field-coverAlt-en" className="mb-2 block text-sm font-medium">
                Picture description
              </label>
              <BilingualInput id="field-coverAlt" value={values.coverAlt} onChange={(next) => set('coverAlt', next)} placeholder="What the picture shows, for screen readers and search engines" limit={300} />
              <FieldError message={errors.coverAlt} />
            </div>
          </Panel>

          <Panel
            id="post-article"
            icon={<Sparkles className="size-4" />}
            title="Article"
            description="Build the post from headings, paragraphs, lists and pictures."
            aside={
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[0.7rem] tabular-nums text-muted">
                {words.toLocaleString('en')} words
                <span aria-hidden className="size-1 rounded-full bg-white/25" />
                {minutes} min read
              </span>
            }
          >
            <BlocksField value={values.content} onChange={(next) => set('content', next)} />
            <FieldError message={errors.content} />
          </Panel>

          <Panel icon={<Search className="size-4" />} title="Search engines" description="Leave empty to use the title and the short summary.">
            <SearchPreview
              title={values.seoTitle.en.trim() || values.title.en.trim()}
              description={values.seoDescription.en.trim() || values.excerpt.en.trim()}
              slug={values.slug}
            />
            <div>
              <label htmlFor="field-seoTitle-en" className="mb-2 flex items-center justify-between gap-3 text-sm font-medium">
                Search title
                <Counter length={values.seoTitle.en.length} limit={SEO_TITLE} />
              </label>
              <BilingualInput id="field-seoTitle" value={values.seoTitle} onChange={(next) => set('seoTitle', next)} placeholder="About 60 characters" limit={200} />
              <FieldError message={errors.seoTitle} />
            </div>
            <div>
              <label htmlFor="field-seoDescription-en" className="mb-2 flex items-center justify-between gap-3 text-sm font-medium">
                Search description
                <Counter length={values.seoDescription.en.length} limit={SEO_DESCRIPTION} />
              </label>
              <BilingualInput id="field-seoDescription" multiline value={values.seoDescription} onChange={(next) => set('seoDescription', next)} placeholder="About 155 characters" limit={400} />
              <FieldError message={errors.seoDescription} />
            </div>
          </Panel>
        </div>

        {/* The checklist stays in view while the long article scrolls; the publishing card above it scrolls away */}
        <aside className="space-y-5 xl:self-stretch">
          <section className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.95rem] font-semibold">Publishing</h2>
              {Boolean(row?.aiGenerated) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-tint px-2.5 py-1 text-[0.65rem] font-semibold text-accent">
                  <Sparkles aria-hidden className="size-3" />
                  AI Studio
                </span>
              )}
            </div>

            <div role="radiogroup" aria-label="Status" className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1">
              {STATUS_OPTIONS.map((option) => {
                const active = values.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set('status', option.value)}
                    className={`rounded-lg px-3 py-2 text-left transition-[background-color,color,box-shadow] duration-200 ${active ? 'bg-primary text-white shadow-[0_8px_20px_-10px_var(--primary)]' : 'text-muted hover:bg-white/[0.04] hover:text-fg'}`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className={`block text-[0.68rem] ${active ? 'text-white/90' : 'text-muted'}`}>{option.description}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
              {scheduled ? <CalendarClock aria-hidden className="mt-px size-3.5 shrink-0 text-accent" /> : <Eye aria-hidden className="mt-px size-3.5 shrink-0 text-accent" />}
              {values.status === 'DRAFT'
                ? 'Hidden from visitors until you publish it.'
                : scheduled
                  ? `Scheduled: it appears on the website on ${values.publishedAt}.`
                  : 'Visible on the website once saved.'}
            </p>

            <div className="mt-5 space-y-4 border-t border-line pt-5">
              <div>
                <label htmlFor="field-publishedAt" className={smallLabel}>Publish date</label>
                <input id="field-publishedAt" type="date" value={values.publishedAt} onChange={(event) => set('publishedAt', event.target.value)} className={`${inputClass} [color-scheme:dark]`} />
                <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted">Empty means today. A future date schedules the post.</p>
              </div>
              <div>
                <label htmlFor="field-authorName" className={smallLabel}>Author</label>
                <input id="field-authorName" value={values.authorName} maxLength={120} onChange={(event) => set('authorName', event.target.value)} placeholder="Webnion Team" className={inputClass} />
              </div>
              <div>
                <label htmlFor="field-tags" className={`${smallLabel} flex items-center gap-1.5`}>
                  <Tag aria-hidden className="size-3" />
                  Topics
                </label>
                <TopicsField value={values.tags} onChange={(next) => set('tags', next)} />
                <FieldError message={errors.tags} />
              </div>
            </div>
          </section>

          <section className={`${cardClass} p-5 xl:sticky xl:top-6`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.95rem] font-semibold">Ready to publish</h2>
              <span className="text-xs tabular-nums text-muted">
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
            </div>
            <ul className="mt-4 space-y-0.5">
              {checklist.map((item) => (
                <li key={item.label}>
                  <button type="button" onClick={() => focusTarget(item.target)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors duration-200 hover:bg-white/[0.04]">
                    {item.done ? (
                      <span className="grid size-4.5 shrink-0 place-items-center rounded-full bg-accent text-white">
                        <Check aria-hidden className="size-3" strokeWidth={3} />
                      </span>
                    ) : (
                      <Circle aria-hidden className="size-4.5 shrink-0 text-white/25" />
                    )}
                    <span className={item.done ? 'text-fg' : 'text-muted'}>{item.label}</span>
                    <span className="sr-only">{item.done ? 'done' : 'not done'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={formError}
        label={submitLabel}
        note={
          dirty ? (
            <p className="inline-flex items-center gap-2 text-xs text-muted">
              <span aria-hidden className="size-2 rounded-full bg-amber-400" />
              Unsaved changes
            </p>
          ) : null
        }
      />
    </form>
  );
};
