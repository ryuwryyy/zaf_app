/**
 * ZAF (Zen in the Life) design system.
 * Colors, typography, spacing, and radii from app designs.
 */

import { Platform } from 'react-native';

// --- Brand & UI colors (from designs) ---
const accentOrange = '#F18E34';
const accentRed = '#C0392B'; // SESSION tab, key labels
const backgroundBeige = '#E7E4DF';
const backgroundBeigeLight = '#F5F3F0';
const textBrown = '#4A4039';
const textBrownLight = '#6B6159';
const textGrey = '#687076';
const white = '#FFFFFF';
const black = '#11181C';

const tintColorLight = accentOrange;
const tintColorDark = '#E8A055';

/** Surface for inputs, cards, reminder rows: light in light mode, dark in dark mode so text has contrast. */
const surfaceLight = '#E8E6E4';
const surfaceDark = '#2D2B28';
/** Progress ring: calm, sophisticated palette so the timer supports meditation without feeling dated or harsh. */
const progressRingRemainingLight = '#D8D4CE'; // soft warm gray track (light theme)
const progressRingCompletedLight = '#B8956E';  // warm taupe/sand for elapsed – gentle, not cold
const progressRingRemainingDark = '#424140';   // very soft track (dark) – visible but weak, non-distracting
const progressRingCompletedDark = '#9A8574';   // muted warm taupe for elapsed (dark) – much weaker, calm

/** Session timer "SESSION TIME" label: soft in both themes so it doesn’t pull focus during meditation. */
const sessionTimerTagBgLight = '#D4C8BC';     // soft warm beige – not strong orange
const sessionTimerTagTextLight = '#6B6159';   // muted brown – readable but gentle
const sessionTimerTagBgDark = '#3D3C3B';      // soft dark surface
const sessionTimerTagTextDark = '#B0ACA6';   // soft warm gray – not bright white

export const Colors = {
  light: {
    text: textBrown,
    textSecondary: textBrownLight,
    textMuted: textGrey,
    background: backgroundBeigeLight,
    backgroundAlt: backgroundBeige,
    surface: surfaceLight,
    progressRingRemaining: progressRingRemainingLight,
    progressRingCompleted: progressRingCompletedLight,
    sessionTimerTagBg: sessionTimerTagBgLight,
    sessionTimerTagText: sessionTimerTagTextLight,
    tint: tintColorLight,
    accent: accentOrange,
    session: accentRed, // SESSION tab and session-related highlights
    icon: textGrey,
    tabIconDefault: textGrey,
    tabIconSelected: tintColorLight,
    border: '#D4D0CA',
    white,
    black,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#B0B4B8',
    textMuted: '#B8BDC2',
    background: '#1A1918',
    backgroundAlt: '#252422',
    surface: surfaceDark,
    progressRingRemaining: progressRingRemainingDark,
    progressRingCompleted: progressRingCompletedDark,
    sessionTimerTagBg: sessionTimerTagBgDark,
    sessionTimerTagText: sessionTimerTagTextDark,
    tint: tintColorDark,
    accent: accentOrange,
    session: '#E0554A',
    icon: '#B8BDC2',
    tabIconDefault: '#B8BDC2',
    tabIconSelected: tintColorDark,
    border: '#4A4846',
    white,
    black,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/** Typography scale (sans-serif) */
export const Typography = {
  /** Small label, e.g. "meditation" tag */
  label: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  /** Body */
  body: { fontSize: 16, lineHeight: 24 },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  /** Subhead / card title */
  subhead: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  /** Section heading */
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  /** Large title */
  largeTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  /** Hero, e.g. "Z A F" */
  hero: { fontSize: 36, lineHeight: 42, fontWeight: '700' as const },
};

/** Spacing scale (px) */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/** Border radius from designs (rounded buttons, cards) */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
  circle: 9999,
};
