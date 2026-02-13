/**
 * Centralized image assets for ZAF.
 * Design images (design1–17) are UI references; 01–05 are placeholder backgrounds.
 */

import type { ImageSourcePropType } from 'react-native';

/** Onboarding slide 2 background (design3 – cushions image). */
export const OnboardingSlide2Background = require('@/assets/images/01.png') as ImageSourcePropType;

/** Goal-setup STEP 1 background (design5). */
export const GoalSetupStep1Background = require('@/assets/images/05-1.png') as ImageSourcePropType;

/** Goal-setup STEP 2 background (design6). */
export const GoalSetupStep2Background = require('@/assets/images/6.png') as ImageSourcePropType;

/** Goal-setup STEP 3 background (design 7.png). */
export const GoalSetupStep3Background = require('@/assets/images/7.png') as ImageSourcePropType;

/** Placeholder backgrounds for splash, onboarding, etc. (01–05.png). image01 uses 02.png (01.png invalid in bundle). */
export const PlaceholderImages = {
  image01: require('@/assets/images/02.png') as ImageSourcePropType,
  image02: require('@/assets/images/02.png') as ImageSourcePropType,
  image03: require('@/assets/images/03.png') as ImageSourcePropType,
  image04: require('@/assets/images/04.png') as ImageSourcePropType,
  image05: require('@/assets/images/05.png') as ImageSourcePropType,
} as const;

/** Design mockups (design1–17) for reference or placeholders */
export const DesignImages = {
  design1: require('@/assets/images/design1.png') as ImageSourcePropType,
  design2: require('@/assets/images/design2.png') as ImageSourcePropType,
  design3: require('@/assets/images/design3.png') as ImageSourcePropType,
  design4: require('@/assets/images/design4.png') as ImageSourcePropType,
  design5: require('@/assets/images/design5.png') as ImageSourcePropType,
  design6: require('@/assets/images/design6.png') as ImageSourcePropType,
  design7: require('@/assets/images/design7.png') as ImageSourcePropType,
  design8: require('@/assets/images/design8.png') as ImageSourcePropType,
  design9: require('@/assets/images/design9.png') as ImageSourcePropType,
  design10: require('@/assets/images/design10.png') as ImageSourcePropType,
  design11: require('@/assets/images/design11.png') as ImageSourcePropType,
  design12: require('@/assets/images/design12.png') as ImageSourcePropType,
  design13: require('@/assets/images/design13.png') as ImageSourcePropType,
  design14: require('@/assets/images/design14.png') as ImageSourcePropType,
  design15: require('@/assets/images/design15.png') as ImageSourcePropType,
  design16: require('@/assets/images/design16.png') as ImageSourcePropType,
  design17: require('@/assets/images/design17.png') as ImageSourcePropType,
} as const;

/** Splash background: mountain image (02.png). design1.png is the layout mockup, not the background. */
export const SplashBackground = require('@/assets/images/02.png') as ImageSourcePropType;

/**
 * Optional video source for splash background (design1: "The background becomes a video").
 * Set to a URI string or require() asset to enable video; null = use image only.
 */
export const SPLASH_VIDEO_SOURCE: string | number | null = null;

/** Onboarding screen backgrounds (design2–4 use full-bleed images) */
export const OnboardingBackgrounds = [
  PlaceholderImages.image02,
  PlaceholderImages.image03,
  PlaceholderImages.image04,
] as const;
