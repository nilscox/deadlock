/* eslint-disable react-refresh/only-export-components */

import { defined } from '@deadlock/game';
import { createContext, useContext, useEffect, useState } from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';

import { getLocale } from './get-locale';
import { Locale, locales } from './locales';

declare global {
  interface Window {
    setLocale(locale: Locale): void;
  }
}

type LocaleContext = [locale: Locale, setLocale: (locale: Locale) => void];
const localeContext = createContext<LocaleContext>(null as never);

type I18nProps = {
  children: React.ReactNode;
};

export const IntlProvider = ({ children }: I18nProps) => {
  const [locale, setLocale] = useState<Locale>(getLocale);

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  useEffect(() => {
    window.setLocale = setLocale;
  }, []);

  return (
    <ReactIntlProvider locale={locale} messages={locales[locale]}>
      <localeContext.Provider value={[locale, setLocale]}>{children}</localeContext.Provider>
    </ReactIntlProvider>
  );
};

const useLocaleContext = () => {
  return defined(useContext(localeContext), 'missing IntlProvider');
};

export const useLocale = () => {
  const [locale] = useLocaleContext();
  return locale;
};

export const useSetLocale = () => {
  const [, setLocale] = useLocaleContext();
  return setLocale;
};
