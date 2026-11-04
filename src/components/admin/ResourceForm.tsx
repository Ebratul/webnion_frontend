'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  getResource,
  slugify,
  toFormValues,
  toPayload,
  type Block,
  type Field,
  type LocalizedValue,
} from '@/lib/admin/resources';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { BlocksField, FeaturesField, ImageField, LocalizedField, VideoField, inputClass, labelClass } from './fields';

type Row = Record<string, unknown>;

interface ResourceFormProps {
  resourceKey: string;
  row?: Row;
  nextSortOrder?: number;
}

const groupedInputs = new Set<Field['type']>(['localized', 'localizedTextarea', 'blocks', 'features']);

export const ResourceForm = ({ resourceKey, row, nextSortOrder }: ResourceFormProps) => {
  const resource = getResource(resourceKey)!;
  const router = useRouter();
  const isNew = !row;
  const [values, setValues] = useState<Row>(() => toFormValues(resource, row));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // The address follows the name on a new record until someone edits it by hand
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const setValue = (field: Field, value: unknown) => {
    const slugField = resource.sections.flatMap((section) => section.fields).find((item) => item.type === 'slug');
    const fillsSlug = !slugTouched && slugField?.type === 'slug' && slugField.from === field.name;

    setSaved(false);
    setFormError(null);
    setErrors((current) => {
      const rest = { ...current };
      delete rest[field.name];
      if (fillsSlug) delete rest[slugField.name];
      return rest;
    });
    setValues((current) => {
      const next = { ...current, [field.name]: value };
      if (fillsSlug) {
        const source = typeof value === 'string' ? value : (value as LocalizedValue).en;
        next[slugField.name] = slugify(source);
      }
      return next;
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSaved(false);

    const { payload, errors: found } = toPayload(resource, values, isNew);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Please fix the highlighted fields.');
      return;
    }
    if (isNew && resource.sortable) payload.sortOrder = nextSortOrder ?? 0;

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

  const renderControl = (field: Field, id: string) => {
    const value = values[field.name];
    const text = String(value ?? '');
    const onText = (next: string) => setValue(field, next);

    switch (field.type) {
      case 'localized':
      case 'localizedTextarea':
        return <LocalizedField id={id} multiline={field.type === 'localizedTextarea'} value={value as LocalizedValue} onChange={(next) => setValue(field, next)} />;
      case 'blocks':
        return <BlocksField value={value as Record<'en' | 'bn', Block[]>} onChange={(next) => setValue(field, next)} />;
      case 'features':
        return <FeaturesField value={value as LocalizedValue[]} onChange={(next) => setValue(field, next)} />;
      case 'image':
        return <ImageField id={id} value={text} onChange={onText} />;
      case 'video':
        return <VideoField id={id} value={text} onChange={onText} />;
      case 'textarea':
        return <textarea id={id} rows={4} value={text} onChange={(event) => onText(event.target.value)} className={inputClass} />;
      case 'select':
        return (
          <select id={id} value={text} onChange={(event) => onText(event.target.value)} className={inputClass}>
            {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        );
      case 'readonly':
        return <p id={id} className="whitespace-pre-wrap text-sm text-muted">{text || '—'}</p>;
      case 'slug':
        return (
          <input
            id={id}
            value={text}
            spellCheck={false}
            onChange={(event) => {
              setSlugTouched(true);
              onText(event.target.value);
            }}
            className={inputClass}
          />
        );
      default:
        return (
          <input
            id={id}
            type={field.type}
            value={text}
            min={field.type === 'number' ? 0 : undefined}
            autoComplete={field.type === 'password' ? 'new-password' : undefined}
            onChange={(event) => onText(event.target.value)}
            className={inputClass}
          />
        );
    }
  };

  const renderField = (field: Field) => {
    if (field.showIf && !field.showIf(values)) return null;
    const id = `field-${field.name}`;
    const error = errors[field.name];

    if (field.type === 'checkbox') {
      return (
        <label key={field.name} className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => setValue(field, event.target.checked)} className="mt-0.5 size-4 accent-primary" />
          <span>
            <span className="block text-sm font-medium">{field.label}</span>
            {field.hint && <span className="mt-0.5 block text-xs text-muted">{field.hint}</span>}
          </span>
        </label>
      );
    }

    const Wrapper = groupedInputs.has(field.type) ? 'div' : 'label';
    return (
      <div key={field.name}>
        {field.type !== 'features' && (
          <Wrapper {...(Wrapper === 'label' ? { htmlFor: id } : {})} className={`${labelClass} mb-1.5`}>
            {field.label}
            {field.required && <span aria-hidden className="ml-1 text-accent">*</span>}
          </Wrapper>
        )}
        {renderControl(field, id)}
        {field.hint && <p className="mt-1.5 text-xs text-muted">{field.hint}</p>}
        {error && <p role="alert" className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 pb-24">
      {resource.sections.map((section) => (
        <section key={section.title} className="rounded-3xl border border-line bg-surface p-6 sm:p-7">
          <h2 className="text-base font-semibold">{section.title}</h2>
          {section.description && <p className="mt-1 text-sm text-muted">{section.description}</p>}
          <div className="mt-5 space-y-5">{section.fields.map(renderField)}</div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/85 backdrop-blur-xl lg:left-64">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-4 px-5 py-3 sm:px-8">
          {formError && <p role="alert" className="mr-auto text-xs text-red-400">{formError}</p>}
          {saved && (
            <p role="status" className="mr-auto inline-flex items-center gap-1.5 text-xs text-muted">
              <Check aria-hidden className="size-3.5 text-accent" />
              Saved. The website is updated.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-[background-color] duration-200 hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? 'Saving…' : isNew ? `Create ${resource.singular}` : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};
