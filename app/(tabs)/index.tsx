import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { ProfileIconView } from '@/components/ProfileIconView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  getDailyMeditationTargetMinutes,
  getGoalDays,
  getMinutesForDate,
  getProgressDaysCount,
  getSessions,
} from '@/lib/storage';

const DEFAULT_PROGRESS_TOTAL = 20;
/** Set true to preview progress (88/175); set false to use real storage data (goal from Mission Setting) */
const PREVIEW_PROGRESS = false;
const PREVIEW_DAYS = 88;
const PREVIEW_TOTAL = 175;
/** Full circle (no gap) for progress ring */
const ARC_TOTAL_DEG = 360;

/**
 * Padding configuration for client review.
 * 
 * To test different padding variations, change the values below:
 * - For iOS: Set CONTENT_WIDTH_PERCENT_IOS to 0.90 (10%), 0.86 (14%), or 0.84 (16%)
 * - For Android: Set CONTENT_WIDTH_PERCENT_ANDROID to 0.90 (10%), 0.86 (14%), or 0.84 (16%)
 * 
 * Variations requested:
 * 1. iOS 10% padding (90% width) = 0.90
 * 2. iOS 14% padding (86% width) = 0.86
 * 3. iOS 16% padding (84% width) = 0.84
 * 4. Android 10% padding (90% width) = 0.90
 * 5. Android 14% padding (86% width) = 0.86
 * 6. Android 16% padding (84% width) = 0.84
 */
const CONTENT_WIDTH_PERCENT_IOS = 0.84; // 84% width (client confirmed)
const CONTENT_WIDTH_PERCENT_ANDROID = 0.84; // 84% width (client confirmed)

function createHomeStyles(
  spacing: ScaledSpacing,
  typography: ScaledTypography,
  scaleSize: (n: number) => number,
  borderRadius: ScaledBorderRadius
) {
  return {
    screen: { flex: 1 as const },
    header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
    headerTitle: { fontSize: typography.largeTitle.fontSize, fontWeight: '800' as const, letterSpacing: 0.5, lineHeight: typography.largeTitle.lineHeight },
    profileButton: { padding: spacing.sm },
    profileIconCircle: { width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(22), borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
    profileButtonPressed: { opacity: 0.7 },
    scroll: { flex: 1 as const },
    scrollContent: { paddingTop: spacing.sm },
    section: { marginTop: spacing.xl },
    progressCircleOuter: { alignSelf: 'center' as const, alignItems: 'center' as const, justifyContent: 'center' as const },
    progressCircleRing: { position: 'absolute' as const },
    progressSvg: { position: 'absolute' as const },
    progressCircleContent: { flex: 1 as const, alignItems: 'center' as const, justifyContent: 'center' as const, paddingHorizontal: spacing.xl, paddingVertical: scaleSize(20) },
    progressCircleInner: { alignItems: 'center' as const, justifyContent: 'center' as const },
    progressLabel: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, letterSpacing: 0.3, lineHeight: scaleSize(24), marginBottom: scaleSize(4) },
    progressLine: { width: scaleSize(40), height: 1, marginBottom: scaleSize(8) },
    progressValue: { fontSize: typography.body.fontSize, fontWeight: '600' as const, letterSpacing: 0.5, lineHeight: typography.body.lineHeight },
    progressValueNumber: { fontSize: scaleSize(28), fontWeight: '800' as const },
    progressSubtext: { fontSize: typography.body.fontSize, lineHeight: scaleSize(24), letterSpacing: 0.2, fontWeight: '500' as const, marginTop: spacing.md, textAlign: 'center' as const, paddingHorizontal: spacing.sm },
    progressEncouragement: { fontSize: typography.body.fontSize + 2, lineHeight: scaleSize(27), letterSpacing: 0.2, fontWeight: '500' as const, textAlign: 'center' as const, paddingHorizontal: spacing.md, marginTop: spacing.sm, maxWidth: '100%' as const },
    todayMeditation: { fontSize: typography.label.fontSize, fontWeight: '600' as const, marginTop: spacing.sm, textAlign: 'center' as const },
    detailButton: { alignSelf: 'center' as const, marginTop: spacing.lg, paddingVertical: scaleSize(12), paddingHorizontal: spacing.xl, borderRadius: borderRadius.md, borderWidth: 1 },
    detailButtonPressed: { opacity: 0.85 },
    detailButtonText: { fontSize: typography.body.fontSize, fontWeight: '700' as const, letterSpacing: 0.3, lineHeight: scaleSize(20) },
    divider: { height: 1, marginTop: 0, marginBottom: spacing.sm },
    dividerAfterProgress: { marginTop: spacing.xl },
    sectionTitle: { fontSize: typography.title.fontSize, fontWeight: '700' as const, letterSpacing: 0.4, lineHeight: typography.title.lineHeight, marginBottom: spacing.md },
    menuSectionTitle: { marginBottom: spacing.sm },
    menuRow: { flexDirection: 'row' as const, alignItems: 'flex-end' as const, gap: spacing.lg, height: scaleSize(80), overflow: 'visible' as const },
    menuText: { flex: 1 as const, paddingBottom: scaleSize(2) },
    menuTitle: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, letterSpacing: 0.3, lineHeight: scaleSize(24), marginBottom: scaleSize(4) },
    menuDuration: { fontSize: typography.body.fontSize, fontWeight: '500' as const, letterSpacing: 0.2, lineHeight: scaleSize(20) },
    menuThumbWrap: { width: scaleSize(120), height: scaleSize(92), borderRadius: scaleSize(10), alignSelf: 'flex-end' as const, overflow: 'hidden' as const },
    menuThumb: { width: '100%' as const, height: '100%' as const, borderRadius: scaleSize(10) },
    menuPlayOverlay: { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center' as const, justifyContent: 'center' as const, borderRadius: scaleSize(10) },
    menuPlayCircle: { width: scaleSize(48), height: scaleSize(48), borderRadius: scaleSize(24), backgroundColor: 'rgba(0, 0, 0, 0.65)', alignItems: 'center' as const, justifyContent: 'center' as const },
    quoteText: { fontSize: typography.body.fontSize + 2, lineHeight: scaleSize(26), letterSpacing: 0.3, fontWeight: '500' as const, textAlign: 'left' as const, marginTop: spacing.xs },
    quoteAttributionRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'flex-end' as const, marginTop: spacing.xs, gap: spacing.sm },
    quoteDashLine: { width: scaleSize(40), height: 1 },
    quoteAttribution: { fontSize: typography.body.fontSize, lineHeight: scaleSize(26), letterSpacing: 0.3, fontWeight: '500' as const },
  };
}

/**
 * Home screen (design 8).
 * Header: HOME + profile icon.
 * Content: Goal achievement (from storage: goal days + session history), Today's menu, Today's quote.
 */
/** Tab bar height (must match app/(tabs)/_layout.tsx) */
const TAB_BAR_HEIGHT = 100;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height, spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(
    () => createHomeStyles(spacing, typography, scaleSize, borderRadius),
    [spacing, typography, scaleSize, borderRadius]
  );
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const progressRingRemaining = useThemeColor({}, 'progressRingRemaining');
  const progressRingCompleted = useThemeColor({}, 'progressRingCompleted');
  /** 詳しく見る: surface in dark (avoids bright white block), white in light */
  const detailButtonBg = colorScheme === 'dark' ? colors.surface : colors.white;

  // Calculate horizontal padding based on content width percentage
  const contentWidthPercent = Platform.OS === 'ios' ? CONTENT_WIDTH_PERCENT_IOS : CONTENT_WIDTH_PERCENT_ANDROID;
  const contentWidth = width * contentWidthPercent;
  const horizontalPadding = (width - contentWidth) / 2;

  const [progressDays, setProgressDays] = useState(0);
  const [progressTotal, setProgressTotal] = useState(DEFAULT_PROGRESS_TOTAL);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(10);

  /** Refetch goal, daily target, and sessions whenever Home gains focus. Progress = days where total meditation >= target. */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [goalDays, targetMinutes, sessions] = await Promise.all([
          getGoalDays(),
          getDailyMeditationTargetMinutes(),
          getSessions(),
        ]);
        if (cancelled) return;
        const completedDays = getProgressDaysCount(sessions, targetMinutes);
        const todayISO = new Date().toISOString().slice(0, 10);
        const todayTotal = getMinutesForDate(sessions, todayISO);
        setDailyTargetMinutes(targetMinutes);
        setProgressTotal(Math.max(1, goalDays));
        setProgressDays(Math.min(completedDays, Math.max(1, goalDays)));
        setTodayMinutes(todayTotal);
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const displayDays = PREVIEW_PROGRESS ? PREVIEW_DAYS : progressDays;
  const displayTotal = PREVIEW_PROGRESS ? PREVIEW_TOTAL : progressTotal;
  const progressPercent = displayTotal > 0 ? displayDays / displayTotal : 0;
  const COMPLETED_ARC_DEG = Math.min(ARC_TOTAL_DEG, ARC_TOTAL_DEG * progressPercent);
  const REMAINING_ARC_DEG = ARC_TOTAL_DEG - COMPLETED_ARC_DEG;
  // Progress circle: large enough so label, value, subtext, today's time, and button fit without overlap
  const HEIGHT_SCALE = 1.0;
  const progressSizeByWidth = contentWidth * HEIGHT_SCALE;
  const progressSize = Math.min(progressSizeByWidth, scaleSize(380));
  const progressStrokeThick = Math.round(progressSize * 0.1);
  const progressRadius = (progressSize - progressStrokeThick) / 2;
  const circumference = 2 * Math.PI * progressRadius;
  const completedLength = (COMPLETED_ARC_DEG / 360) * circumference;
  /** Full circle: draw entire ring first (light), then completed segment on top (dark) so ring is always closed */
  const ARC_START_DEG = 270; // start at 12 o'clock
  const dashOffsetStart = (ARC_START_DEG / 360) * circumference;

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.xl,
            paddingHorizontal: horizontalPadding,
            paddingBottom: spacing.md,
          },
        ]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>HOME</Text>
        <Pressable
          onPress={() => router.push('/profile-settings')}
          style={({ pressed }) => [styles.profileButton, pressed && styles.profileButtonPressed]}
          accessibilityLabel="Profile">
          <ProfileIconView size={44} borderColor={borderColor} backgroundColor={surfaceColor} iconColor={textColor} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + scaleSize(TAB_BAR_HEIGHT) + spacing.xl,
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Progress section */}
        <View style={[styles.section, { marginTop: spacing.lg }]}>
          <View style={[styles.progressCircleOuter, { width: progressSize, height: progressSize }]}>
            {/* Full circle ring (SVG) */}
            <View
              style={[
                styles.progressCircleRing,
                {
                  width: progressSize,
                  height: progressSize,
                },
              ]}>
              <Svg width={progressSize} height={progressSize} style={styles.progressSvg}>
                {/* 1) Full circle in light grey – always a closed ring, no gap */}
                <Circle
                  cx={progressSize / 2}
                  cy={progressSize / 2}
                  r={progressRadius}
                  stroke={progressRingRemaining}
                  strokeWidth={progressStrokeThick}
                  fill="none"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={0}
                  strokeLinecap="butt"
                />
                {/* 2) Completed segment on top, start at 12 o'clock */}
                <Circle
                  cx={progressSize / 2}
                  cy={progressSize / 2}
                  r={progressRadius}
                  stroke={progressRingCompleted}
                  strokeWidth={progressStrokeThick}
                  fill="none"
                  strokeDasharray={`${completedLength} ${circumference - completedLength}`}
                  strokeDashoffset={dashOffsetStart}
                  strokeLinecap="butt"
                />
              </Svg>
            </View>
            <View style={styles.progressCircleContent}>
              <View style={styles.progressCircleInner}>
                <Text style={[styles.progressLabel, { color: textMuted }]}>目標達成率</Text>
                <View style={[styles.progressLine, { backgroundColor: borderColor }]} />
                <Text style={[styles.progressValue, { color: textColor }]}>
                  <Text style={styles.progressValueNumber}>{displayDays}</Text>日目/
                  <Text style={styles.progressValueNumber}>{displayTotal}</Text>日
                </Text>
              </View>
              <Text
                style={[styles.progressEncouragement, { color: textMuted }]}
                numberOfLines={3}>
                You've made it this far with your meditation practice.{'\n'}
                Incredible work.
              </Text>
              <Text style={[styles.todayMeditation, { color: textMuted }]}>
                今日の瞑想時間: {todayMinutes}分 / {dailyTargetMinutes}分
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.detailButton,
                  { borderColor, backgroundColor: detailButtonBg },
                  pressed && styles.detailButtonPressed,
                ]}
                onPress={() => router.push('/goal-detail')}>
                <Text style={[styles.detailButtonText, { color: textColor }]}>詳しく見る</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.divider, styles.dividerAfterProgress, { backgroundColor: borderColor, marginTop: spacing.xl, marginBottom: spacing.md }]} />

        {/* Today's menu */}
        <View style={[styles.section, { marginTop: spacing.xl }]}>
          <Text style={[styles.sectionTitle, styles.menuSectionTitle, { color: textColor }]}>今日のメニュー</Text>
          <View style={styles.menuRow}>
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: textColor }]}>
                【ビギナー向け】 座禅のいろは
              </Text>
              <Text style={[styles.menuDuration, { color: textMuted }]}>12分</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.menuThumbWrap, pressed && { opacity: 0.9 }]}
              onPress={() => router.push('/guidance-video')}>
              <Image
                source={require('@/assets/images/8-1.png')}
                style={styles.menuThumb}
                resizeMode="cover"
              />
              <View style={styles.menuPlayOverlay}>
                <View style={styles.menuPlayCircle}>
                  <IconSymbol name="play.fill" size={scaleSize(28)} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor, marginTop: spacing.lg, marginBottom: spacing.md }]} />

        {/* Today's quote / 今日の気づき */}
        <View style={[styles.section, { marginTop: spacing.xl, marginBottom: spacing.xxl }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>今日の気づき</Text>
          <Text style={[styles.quoteText, { color: textMuted }]}>
            今あるものに満たされない者は{'\n'}
            これから欲しいものにも満たされない
          </Text>
          <View style={styles.quoteAttributionRow}>
            <View style={[styles.quoteDashLine, { backgroundColor: textMuted }]} />
            <Text style={[styles.quoteAttribution, { color: textMuted }]}>
              ソクラテス(古代ギリシャの哲学者)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

