import { useCallback } from 'react';
import { type IntlShape, IntlProvider as ReactIntlProvider, useIntl } from 'react-intl';

import en from '../lang/en.json';
import fr from '../lang/fr.json';

import type { Prefix, Suffix } from './types';

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const messages = flatten({ fr, en }[locale]);

  return (
    <ReactIntlProvider locale={locale} messages={messages}>
      {children}
    </ReactIntlProvider>
  );
}

function getLocale() {
  const locale = localStorage.getItem('locale') ?? navigator.language.slice(0, 2);

  if (locale === 'fr' || locale === 'en') {
    return locale;
  }

  return 'en';
}

function flatten(obj: object, prefix = '') {
  let result: Record<PropertyKey, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[`${prefix !== '' ? `${prefix}.` : ''}${key}`] = value;
    } else if (typeof value === 'object' && value !== null) {
      result = {
        ...result,
        ...flatten(value as object, `${prefix}.${key}`.replace(/^\./, '')),
      };
    } else {
      throw new Error(`Cannot flatten value of type "${typeof value}"`);
    }
  }

  return result;
}

type Messages = typeof en;
type Values = Parameters<IntlShape['formatMessage']>[1];

type TranslateProps<Id extends string = string> = {
  id: Id;
  values?: Values;
};

interface TranslateFn<Id> {
  (id: Id): string;
  (id: Id, values: Values): React.ReactNode[];
}

interface Translate<T, P extends Prefix<T> | null = null> {
  (props: TranslateProps<Suffix<T, P>>): React.ReactNode;
  useTranslate(): TranslateFn<Suffix<T, P>>;
}

export function createTranslate(): Translate<Messages>;
export function createTranslate<P extends Prefix<Messages>>(prefix: P): Translate<Messages, P>;

export function createTranslate(prefix?: string): Translate<object> {
  const useTranslate = () => {
    const intl = useIntl();

    const translate = (suffix: string, values?: Values) => {
      return intl.formatMessage({ id: [prefix, suffix].filter(Boolean).join('.') }, values);
    };

    return useCallback(translate as TranslateFn<string>, [intl]);
  };

  function Translate({ id, values }: TranslateProps) {
    return useTranslate()(id, values);
  }

  Translate.useTranslate = useTranslate;

  return Translate;
}
