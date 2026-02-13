/**
 * Responsive layout: base range from iPhone SE2 (375pt) to large Pro Max (~430pt).
 * Prevents crushed margins and keeps balance across screen sizes.
 */

/** Reference width (iPhone SE 2nd gen logical width) */
export const BASE_WIDTH = 375;

/** Typical large phone (e.g. iPhone 14 Pro Max) */
export const REFERENCE_MAX_WIDTH = 430;

/** Scale factor limits so layout doesn't crush on small or blow up on large */
const MIN_SCALE = 0.88;
const MAX_SCALE = 1.2;

/**
 * Scale factor for the current window width.
 * 375 → 1, 320 → ~0.88, 430 → ~1.15
 */
export function getScaleFactor(width: number): number {
  const scale = width / BASE_WIDTH;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
}

/**
 * Scale a single dimension (spacing, size, etc.).
 */
export function scaleSize(size: number, scale: number): number {
  return Math.round(size * scale);
}

/** Spacing keys we scale */
export const SPACING_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

/** Base spacing values (must match theme.ts Spacing) */
const BASE_SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export type ScaledSpacing = Record<(typeof SPACING_KEYS)[number], number>;

export function getScaledSpacing(scale: number): ScaledSpacing {
  return SPACING_KEYS.reduce(
    (acc, key) => {
      acc[key] = scaleSize(BASE_SPACING[key], scale);
      return acc;
    },
    {} as ScaledSpacing
  );
}

/** Typography keys we scale (fontSize and lineHeight) */
const TYPOGRAPHY_KEYS = ['label', 'body', 'bodyBold', 'subhead', 'title', 'largeTitle', 'hero'] as const;

const BASE_TYPOGRAPHY: Record<
  (typeof TYPOGRAPHY_KEYS)[number],
  { fontSize: number; lineHeight: number; fontWeight?: string }
> = {
  label: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  body: { fontSize: 16, lineHeight: 24 },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  subhead: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  largeTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  hero: { fontSize: 36, lineHeight: 42, fontWeight: '700' },
};

export type ScaledTypography = Record<
  (typeof TYPOGRAPHY_KEYS)[number],
  { fontSize: number; lineHeight: number; fontWeight?: string }
>;

/** Slightly gentler scale for fonts so they don't get too large on big screens (cap ~1.12) */
const FONT_SCALE_CAP = 1.12;

export function getScaledTypography(scale: number): ScaledTypography {
  const fontScale = Math.min(scale, FONT_SCALE_CAP);
  return TYPOGRAPHY_KEYS.reduce(
    (acc, key) => {
      const base = BASE_TYPOGRAPHY[key];
      acc[key] = {
        fontSize: scaleSize(base.fontSize, fontScale),
        lineHeight: scaleSize(base.lineHeight, fontScale),
        ...(base.fontWeight != null && { fontWeight: base.fontWeight as '500' | '600' | '700' }),
      };
      return acc;
    },
    {} as ScaledTypography
  );
}

/** Border radius keys */
const RADIUS_KEYS = ['sm', 'md', 'lg', 'pill', 'circle'] as const;
const BASE_RADIUS = { sm: 8, md: 12, lg: 16, pill: 9999, circle: 9999 } as const;

export type ScaledBorderRadius = Record<(typeof RADIUS_KEYS)[number], number>;

export function getScaledBorderRadius(scale: number): ScaledBorderRadius {
  return RADIUS_KEYS.reduce(
    (acc, key) => {
      const v = BASE_RADIUS[key];
      acc[key] = v >= 9999 ? v : scaleSize(v, scale);
      return acc;
    },
    {} as ScaledBorderRadius
  );
}
