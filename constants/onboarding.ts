/**
 * Onboarding carousel content (designs 2–4).
 */

import type { ImageSourcePropType } from 'react-native';

import { OnboardingSlide2Background, PlaceholderImages } from './assets';

export type OnboardingSlide = {
  id: string;
  headline: string;
  subhead?: string;
  /** Two red label letters (e.g. 瞑想) replacing the “letters with red mid line + signs” in design */
  redLabel?: string;
  /** When set with redLabel, body is rendered as bodyBeforeRed + redLabel + bodyAfterRed */
  bodyBeforeRed?: string;
  bodyAfterRed?: string;
  body: string;
  background: ImageSourcePropType;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    headline: 'マルチタスクに生きる時代、\n本当の意味でリフレッシュ\nできていますか？',
    redLabel: '瞑想',
    bodyBeforeRed: 'ZAFappでは',
    bodyAfterRed: 'を通して、\n自分らしく過ごせるように、\n日々のパフォーマンスを高める\n手助けをします。',
    body: '',
    background: PlaceholderImages.image04,
  },
  {
    id: '2',
    headline: '生活の中に瞑想を。',
    subhead: 'そのハードルを限りなく低く。',
    body:
      '通勤前や睡眠前など、あなたの\nライフスタイルに合わせたタイミングで\n好きな時間、自然な形で\n瞑想を取り入れることができます。',
    background: OnboardingSlide2Background,
  },
  {
    id: '3',
    headline: '瞑想を通して',
    subhead: '日々のパフォーマンスの向上を。',
    body:
      '瞑想のある日々は\n「いまここ」を感じやすくなり\nリフレッシュのルーティンをつくることで\n自分本来のコンディションへ導いてくれます。',
    background: PlaceholderImages.image03,
  },
];
