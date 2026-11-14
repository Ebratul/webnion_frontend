'use client';

import { ArrowDown, ArrowUp, Heading2, ImagePlus, List, Pilcrow, Plus, Trash2, Upload, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { Block, LocalizedValue } from '@/lib/admin/resources';
import { inputClass } from './ui';

export { inputClass, labelClass } from './ui';

const iconButton =
  'grid size-10 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent';

const quietButton =
  'inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs font-medium text-fg transition-[border-color,color,background-color] duration-200 hover:border-accent/60 hover:bg-tint hover:text-white disabled:opacity-50';

// Uses XMLHttpRequest because fetch cannot report upload progress, which matters for large videos
const uploadFile = (file: File, onProgress: (percent: number) => void) =>
  new Promise<string>((resolve, reject) => {
    const body = new FormData();
    body.append('file', file);
    const request = new XMLHttpRequest();
    request.open('POST', '/api/admin/uploads');
    request.responseType = 'json';
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      const response = request.response as { message?: string; data?: { path: string } } | null;
      if (request.status === 201 && response?.data) resolve(response.data.path);
      else if (request.status === 413) reject(new Error('This file is too large. Keep it under 4 MB, or compress it first.'));
      else reject(new Error(response?.message ?? 'Upload failed. Please try again.'));
    };
    request.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    request.send(body);
  });

export const useUpload = (onUploaded: (path: string) => void) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      onUploaded(await uploadFile(file, setProgress));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setProgress(null);
    }
  };

  return { progress, error, upload };
};

interface ValueProps<T> {
  value: T;
  onChange: (value: T) => void;
}

// Images can only be uploaded, not linked: the site's image component rejects hosts it does not know,
// and a pasted link from elsewhere would break the page it appears on.
// A logo is wide and must show whole, on the background it is made for. Other images fill a square.
export const ImageField = ({ value, onChange, id, logoOn }: ValueProps<string> & { id: string; logoOn?: 'dark' | 'light' }) => {
  const input = useRef<HTMLInputElement>(null);
  const { progress, error, upload } = useUpload(onChange);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-line ${logoOn ? `h-20 w-52 px-4 ${logoOn === 'dark' ? 'bg-[#0e0e13]' : 'bg-white'}` : 'size-28 bg-surface-2'}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className={logoOn ? 'max-h-10 max-w-full object-contain' : 'size-full object-cover'} />
          ) : (
            <ImagePlus aria-hidden className="size-6 text-muted" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <button type="button" onClick={() => input.current?.click()} disabled={progress !== null} className={quietButton}>
            <Upload aria-hidden className="size-3.5" />
            {progress !== null ? `Uploading ${progress}%` : value ? 'Replace' : 'Upload Image'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className={quietButton}>
              <X aria-hidden className="size-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export const VideoField = ({ value, onChange, id }: ValueProps<string> & { id: string }) => {
  const input = useRef<HTMLInputElement>(null);
  const { progress, error, upload } = useUpload(onChange);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input id={id} type="url" value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://… or upload a file" className={`${inputClass} min-w-0 flex-1 basis-64`} />
        <input
          ref={input}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <button type="button" onClick={() => input.current?.click()} disabled={progress !== null} className={quietButton}>
          <Upload aria-hidden className="size-3.5" />
          {progress !== null ? `Uploading ${progress}%` : 'Upload Video'}
        </button>
      </div>
      {progress !== null && (
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full origin-left bg-primary transition-transform duration-200" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      )}
      {value && <video src={value} controls preload="metadata" className="max-h-64 rounded-xl bg-black" />}
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export const LocalizedField = ({ value, onChange, multiline, id, suggestions }: ValueProps<LocalizedValue> & { multiline?: boolean; id: string; suggestions?: LocalizedValue[] }) => {
  const Control = multiline ? 'textarea' : 'input';
  const extra = multiline ? { rows: 4 } : {};
  const lists = suggestions?.length && !multiline;
  const onEnglish = (en: string) => {
    // Picking a suggestion fills its Bangla too, unless the Bangla was typed by hand
    const picked = suggestions?.find((item) => item.en.toLowerCase() === en.trim().toLowerCase());
    const bnIsSuggested = !value.bn || suggestions?.some((item) => item.bn === value.bn);
    onChange({ en, bn: picked && bnIsSuggested ? picked.bn : value.bn });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-en`} className="mb-1.5 block text-xs text-muted">English</label>
        <Control id={`${id}-en`} value={value.en} list={lists ? `${id}-en-list` : undefined} onChange={(event) => onEnglish(event.target.value)} className={inputClass} {...extra} />
        {lists && (
          <datalist id={`${id}-en-list`}>
            {suggestions.map((item) => <option key={item.en} value={item.en} />)}
          </datalist>
        )}
      </div>
      <div>
        <label htmlFor={`${id}-bn`} className="mb-1.5 block text-xs text-muted">বাংলা</label>
        <Control
          id={`${id}-bn`}
          lang="bn"
          value={value.bn}
          onChange={(event) => onChange({ ...value, bn: event.target.value })}
          placeholder={value.en ? 'Empty uses the English text' : undefined}
          className={inputClass}
          {...extra}
        />
      </div>
    </div>
  );
};

export const FeaturesField = ({ value, onChange }: ValueProps<LocalizedValue[]>) => {
  const baseId = useId();
  const update = (index: number, row: LocalizedValue) => onChange(value.map((item, itemIndex) => (itemIndex === index ? row : item)));

  return (
    <div className="space-y-3">
      {value.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <LocalizedField id={`${baseId}-${index}`} value={row} onChange={(next) => update(index, next)} />
          </div>
          <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove feature" className={`${iconButton} mt-[1.625rem]`}>
            <Trash2 aria-hidden className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { en: '', bn: '' }])} className={quietButton}>
        <Plus aria-hidden className="size-3.5" />
        Add Feature
      </button>
    </div>
  );
};

const BLOCK_TYPES: { type: Block['type']; label: string; Icon: typeof Pilcrow }[] = [
  { type: 'heading', label: 'Heading', Icon: Heading2 },
  { type: 'paragraph', label: 'Paragraph', Icon: Pilcrow },
  { type: 'list', label: 'List', Icon: List },
  { type: 'image', label: 'Image', Icon: ImagePlus },
];

const emptyBlock = (type: Block['type']): Block => {
  if (type === 'list') return { type, items: [] };
  if (type === 'image') return { type, src: '' };
  return { type, text: '' };
};

const BlockBody = ({ block, onChange, id, lang }: { block: Block; onChange: (block: Block) => void; id: string; lang: 'en' | 'bn' }) => {
  if (block.type === 'image') {
    return (
      <div className="space-y-2">
        <ImageField id={id} value={block.src} onChange={(src) => onChange({ ...block, src })} />
        <input
          lang={lang}
          aria-label="Picture description"
          value={block.alt ?? ''}
          maxLength={300}
          onChange={(event) => onChange({ ...block, alt: event.target.value })}
          placeholder="Describe the picture for screen readers (optional)"
          className={inputClass}
        />
      </div>
    );
  }
  if (block.type === 'list') {
    return (
      <textarea
        id={id}
        lang={lang}
        aria-label="List items, one per line"
        rows={Math.max(block.items.length + 1, 3)}
        value={block.items.join('\n')}
        onChange={(event) => onChange({ type: 'list', items: event.target.value.split('\n') })}
        placeholder="One item per line"
        className={`${inputClass} min-h-[4.5rem] resize-none leading-relaxed [field-sizing:content]`}
      />
    );
  }
  if (block.type === 'heading') {
    return (
      <input
        id={id}
        lang={lang}
        aria-label="Heading"
        value={block.text}
        onChange={(event) => onChange({ type: 'heading', text: event.target.value })}
        placeholder="Heading"
        className={`${inputClass} font-semibold`}
      />
    );
  }
  return (
    <textarea
      id={id}
      lang={lang}
      aria-label="Paragraph"
      rows={Math.min(Math.max(Math.ceil(block.text.length / 80), 2), 10)}
      value={block.text}
      onChange={(event) => onChange({ type: 'paragraph', text: event.target.value })}
      placeholder="Write a paragraph"
      className={`${inputClass} min-h-[4.5rem] resize-none leading-relaxed [field-sizing:content]`}
    />
  );
};

export const BlocksField = ({ value, onChange }: ValueProps<Record<'en' | 'bn', Block[]>>) => {
  const baseId = useId();
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const blocks = value[lang];
  const setBlocks = (next: Block[]) => onChange({ ...value, [lang]: next });

  const swap = (index: number, other: number) => {
    const next = [...blocks];
    [next[index], next[other]] = [next[other]!, next[index]!];
    setBlocks(next);
  };

  return (
    <div>
      <div role="tablist" aria-label="Language" className="mb-4 inline-flex rounded-full border border-line p-1">
        {(['en', 'bn'] as const).map((code) => (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={lang === code}
            onClick={() => setLang(code)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${lang === code ? 'bg-primary text-white' : 'text-muted hover:text-fg'}`}
          >
            {code === 'en' ? `English (${value.en.length})` : `বাংলা (${value.bn.length})`}
          </button>
        ))}
      </div>

      {lang === 'bn' && value.bn.length === 0 && (
        <p className="mb-4 text-xs text-muted">Optional. While this is empty, the Bangla site shows the English article.</p>
      )}

      {blocks.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/15 px-5 py-8 text-center text-sm text-muted">
          {lang === 'en' ? 'Nothing written yet. Start with a heading or a paragraph below.' : 'No Bangla blocks yet.'}
        </p>
      )}

      <div className="space-y-2">
        {blocks.map((block, index) => {
          const kind = BLOCK_TYPES.find((item) => item.type === block.type)!;
          return (
            <div key={index} className="group flex items-start gap-2.5 rounded-xl p-1.5 transition-colors duration-200 focus-within:bg-white/[0.02] hover:bg-white/[0.02] sm:-mx-1.5">
              <span title={kind.label} className="mt-1 hidden size-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors duration-200 group-focus-within:border-accent/40 group-focus-within:text-accent sm:grid">
                <kind.Icon aria-hidden className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <BlockBody
                  id={`${baseId}-${lang}-${index}`}
                  lang={lang}
                  block={block}
                  onChange={(next) => setBlocks(blocks.map((item, itemIndex) => (itemIndex === index ? next : item)))}
                />
              </div>
              <div className="flex shrink-0 items-center">
                <button type="button" disabled={index === 0} onClick={() => swap(index, index - 1)} aria-label="Move up" className={iconButton}>
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button type="button" disabled={index === blocks.length - 1} onClick={() => swap(index, index + 1)} aria-label="Move down" className={iconButton}>
                  <ArrowDown aria-hidden className="size-4" />
                </button>
                <button type="button" onClick={() => setBlocks(blocks.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove block" className={`${iconButton} hover:text-red-400`}>
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-white/12 p-2.5">
        <span className="px-2 text-xs font-medium text-muted">
          <Plus aria-hidden className="mr-1 inline size-3.5 align-[-2px]" />
          Add
        </span>
        {BLOCK_TYPES.map(({ type, label, Icon }) => (
          <button key={type} type="button" onClick={() => setBlocks([...blocks, emptyBlock(type)])} className={quietButton}>
            <Icon aria-hidden className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
