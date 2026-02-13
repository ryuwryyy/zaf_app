/**
 * Hook for responsive layout. Use on screens that need to adapt from
 * iPhone SE2 (375) to large Pro Max / Android.
 */
import { useWindowDimensions } from 'react-native';

import {
    getScaleFactor,
    getScaledBorderRadius,
    getScaledSpacing,
    getScaledTypography,
    scaleSize as scaleSizeUtil,
    type ScaledBorderRadius,
    type ScaledSpacing,
    type ScaledTypography,
} from '@/constants/responsive';

export type UseResponsiveReturn = {
  width: number;
  height: number;
  scale: number;
  /** Scale a single value (e.g. icon size, stroke width) */
  scaleSize: (size: number) => number;
  /** Scaled spacing (xs, sm, md, lg, xl, xxl) */
  spacing: ScaledSpacing;
  /** Scaled typography (label, body, subhead, title, etc.) */
  typography: ScaledTypography;
  /** Scaled border radius (sm, md, lg; pill/circle unchanged) */
  borderRadius: ScaledBorderRadius;
};

export function useResponsive(): UseResponsiveReturn {
  const { width, height } = useWindowDimensions();
  const scale = getScaleFactor(width);
  return {
    width,
    height,
    scale,
    scaleSize: (size: number) => scaleSizeUtil(size, scale),
    spacing: getScaledSpacing(scale),
    typography: getScaledTypography(scale),
    borderRadius: getScaledBorderRadius(scale),
  };
}
