import { isLocale } from './locales';

export const getLocale = () => {
  return getLocalStorageLocale() ?? getNavigatorLocale() ?? 'en';
};

const getLocalStorageLocale = () => {
  const locale = localStorage.getItem('locale')?.slice(0, 2);

  if (locale && isLocale(locale)) {
    return locale;
  }
};

const getNavigatorLocale = () => {
  const locale = navigator.language.slice(0, 2);

  if (isLocale(locale)) {
    return locale;
  }
};
