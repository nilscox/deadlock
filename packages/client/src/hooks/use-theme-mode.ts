import { useCallback, useEffect, useState } from 'react';

import { useMutationObserver } from './use-mutation-observer';

export enum ThemeMode {
  light = 'light',
  dark = 'dark',
}

const isThemeMode = (value?: string): value is ThemeMode => {
  return Object.values(ThemeMode).includes(value as ThemeMode);
};

const html = document.documentElement;

const getThemeMode = () => {
  if (html.classList.contains('dark')) {
    return ThemeMode.dark;
  } else {
    return ThemeMode.light;
  }
};

export const useThemeMode = () => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme && isThemeMode(storedTheme)) {
      return storedTheme;
    }

    if (window.matchMedia('prefers-color-scheme: dark')) {
      return ThemeMode.dark;
    }

    return ThemeMode.light;
  });

  useMutationObserver(html, { attributes: true, attributeFilter: ['class'] }, () => {
    setTheme(getThemeMode());
  });

  return theme;
};

export const useSetThemeMode = () => {
  return useCallback((theme: ThemeMode) => {
    if (theme === ThemeMode.dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);
};

export const InitThemeMode = () => {
  const theme = useThemeMode();

  useEffect(() => {
    if (theme === ThemeMode.dark) {
      html.classList.add(theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return null;
};
