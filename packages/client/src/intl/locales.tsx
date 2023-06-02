import en from '../../lang/en.json';
import fr from '../../lang/fr.json';
import { flattenObject } from '../utils/flatten-object';

export type Locale = keyof typeof locales;
export type SetLocale = (locale: Locale) => void;

export const locales = {
  en: flattenObject(en) as Record<string, string>,
  fr: flattenObject(fr) as Record<string, string>,
};

export const isLocale = (value: string): value is Locale => {
  return Object.keys(locales).includes(value);
};
