# Requirement 1 – Screen size support (responsiveness) – Audit

**Client requirement:** Variable layout from smallest (iPhone SE2) to largest (large Pro Max) so margins don’t get crushed.

## What’s in place

- **`constants/responsive.ts`** – Scale factor (0.88–1.2), `getScaledSpacing()`, `getScaledTypography()`, `scaleSize()`.
- **`hooks/use-responsive.ts`** – `useResponsive()` returns `width`, `height`, `scale`, `spacing`, `typography`, `scaleSize`, `borderRadius`.
- **ScreenLayout** – Uses scaled `spacing` for horizontal padding.
- All main screens call `useResponsive()` and use `spacing` / `typography` / `scaleSize` in **inline styles** for header, scroll padding, and key layout.

## Fixes applied in this audit

1. **`app/(tabs)/settings.tsx`** – Replaced inline `Spacing.lg` with `spacing.lg` for “通知のタイトル・本文” section (so it scales and is consistent).
2. **`app/goal-setup.tsx`** – Replaced `Spacing.xl` and raw `32` / `24` with `spacing.xl` and `spacing.lg` in content padding (fixes possible ReferenceError and makes STEP 1 scale).

## Remaining gaps (design vs. implementation)

These don’t cause crashes but mean **not all layout scales** with screen size:

### 1. StyleSheet uses static values

- **Issue:** `StyleSheet.create({ ... })` runs at module load and can’t use hooks. Many screens still use **`Spacing.xxx`** and **fixed `fontSize`** in StyleSheets (e.g. settings, session, session-timer, goal-detail, profile-*, zaf-product, meditation-purpose, home).
- **Effect:** Only the parts that get **inline** `spacing` / `typography` / `scaleSize` scale. The rest use the same pixel values on SE2 and Pro Max.
- **Options for full responsiveness:**
  - **A)** Use a “dynamic styles” helper: e.g. `const styles = useMemo(() => createStyles(spacing, typography, scaleSize), [spacing, typography, scaleSize])` and pass scaled values into style creation.
  - **B)** Keep StyleSheets only for non-dimensional props (e.g. flexDirection, alignItems) and pass all spacing/font sizes as inline overrides from `useResponsive()`.

### 2. Hardcoded numbers in a few screens

- **Onboarding, goal-setup-step2, goal-setup-step3:** Some layout still uses raw numbers (e.g. marginBottom: 43, 48, marginTop: 450, 500, padding 24, 16). Replacing these with `spacing.xxx` or `scaleSize(n)` would make them scale.
- **Splash:** Fixed font sizes (e.g. 76, 25, 22) and margins (e.g. marginTop: 6) in StyleSheet; could be scaled via inline overrides or dynamic styles.

### 3. Session tab (`app/(tabs)/session.tsx`)

- Uses `useResponsive()` and `spacing` only in a few places (header, timer section, scroll padding). The rest of the screen (time picker, guidance list, BGM, recent items) still uses StyleSheet with `Spacing` and fixed font sizes.

## Summary

- **Crashes / obvious bugs:** Fixed (settings inline `Spacing.lg`, goal-setup content padding).
- **Full requirement 1 (everything scales):** Not fully met. Layout that uses **inline** responsive values scales; layout that lives only in **StyleSheets** with `Spacing` and fixed `fontSize` does not. To meet the requirement fully, either introduce dynamic styles or systematically add inline spacing/typography/scaleSize overrides (or a mix) on every screen.
