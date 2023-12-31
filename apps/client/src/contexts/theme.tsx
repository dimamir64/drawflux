import { useEffect, useState } from 'react';
import { LOCAL_STORAGE_THEME_KEY } from '@/constants/app';
import { storage } from '@/utils/storage';
import type { PropsWithChildren } from 'react';
import { createContext } from './createContext';

type ThemeValue = 'default' | 'dark';

type ThemeContextValue = {
  value: ThemeValue;
  set: (theme: ThemeValue) => void;
};

type Props = PropsWithChildren;

export const [ThemeContext, useTheme] =
  createContext<ThemeContextValue>('Theme');

export const ThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState<ThemeValue>(getDefaultTheme());

  useEffect(() => {
    if (storage.get<ThemeValue>(LOCAL_STORAGE_THEME_KEY)) {
      return;
    }

    const darkColorScheme = prefersDarkColorScheme();

    const handleColorSchemeChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setTheme('dark');
      } else {
        setTheme('default');
      }
    };

    darkColorScheme.addEventListener('change', handleColorSchemeChange);

    return () => {
      darkColorScheme.removeEventListener('change', handleColorSchemeChange);
    };
  }, []);

  const handleThemeChange = (value: ThemeValue) => {
    setTheme(value);
    storage.set(LOCAL_STORAGE_THEME_KEY, value);
  };

  return (
    <ThemeContext.Provider value={{ value: theme, set: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};

function getDefaultTheme(): ThemeValue {
  const storedThemeValue = storage.get<ThemeValue>(LOCAL_STORAGE_THEME_KEY);

  if (storedThemeValue) {
    return storedThemeValue;
  }

  return prefersDarkColorScheme().matches ? 'dark' : 'default';
}

function prefersDarkColorScheme() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}
