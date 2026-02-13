/**
 * Theme preference context: user's choice of light / dark / system.
 * Stored in AsyncStorage; root layout uses it for ThemeProvider.
 * useEffectiveColorScheme() returns the resolved theme (user preference or system).
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getColorSchemePreference, setColorSchemePreference, type ColorSchemePreference } from '@/lib/storage';

type ThemePreferenceContextValue = {
  preference: ColorSchemePreference | null;
  setPreference: (pref: ColorSchemePreference) => Promise<void>;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ColorSchemePreference | null>(null);

  useEffect(() => {
    let cancelled = false;
    getColorSchemePreference().then((pref) => {
      if (!cancelled) setPreferenceState(pref);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (pref: ColorSchemePreference) => {
    await setColorSchemePreference(pref);
    setPreferenceState(pref);
  }, []);

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    return {
      preference: null,
      setPreference: async () => {},
    };
  }
  return ctx;
}

/** Resolved color scheme: user preference if set, otherwise system. Use this for all UI colors. */
export function useEffectiveColorScheme(): 'light' | 'dark' {
  const { preference } = useThemePreference();
  const systemScheme = useColorScheme();
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return (systemScheme === 'dark' ? 'dark' : 'light');
}
