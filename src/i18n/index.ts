import { bn } from './bn';
import type { Locale } from './config';
import { en } from './en';

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, bn };

export const getDictionary = (locale: Locale) => dictionaries[locale];
