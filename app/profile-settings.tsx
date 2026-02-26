/**
 * Profile / User settings screen (design 15 + design 16 Record tab).
 * Close button, profile icon, username (from storage), segmented (ユーザー設定 | レコード).
 * Record tab: badges and stats from local storage (session history + app start date).
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { ProfileIconView } from '@/components/ProfileIconView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    formatDuration,
    formatRecordDate,
    getDisplayName,
    getRecordStats,
    type RecordStats,
} from '@/lib/storage';

const TAB_USER = 'user';
const TAB_RECORD = 'record';

const SETTINGS_ITEMS = [
  { key: 'icon', label: 'アイコンを設定する' },
  { key: 'name', label: 'ユーザー名を設定する' },
  { key: 'color', label: 'カラーを設定する', showColorIcon: true },
];

const BADGE_SIZE = 80;
const RIBBON_HEIGHT = 14;

function createProfileSettingsStyles(
  spacing: ScaledSpacing,
  typography: ScaledTypography,
  scaleSize: (n: number) => number,
  borderRadius: ScaledBorderRadius
) {
  const badgeSize = scaleSize(BADGE_SIZE);
  const ribbonHeight = scaleSize(RIBBON_HEIGHT);
  const badgeTotalHeight = badgeSize + ribbonHeight;
  return {
    screen: { flex: 1 as const },
    headerRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'flex-end' as const },
    headerSpacer: { flex: 1 as const },
    closeButton: { padding: spacing.sm },
    scroll: { flex: 1 as const },
    scrollContent: { paddingTop: spacing.sm },
    profileWrap: { alignItems: 'center' as const, marginBottom: spacing.md },
    profileIconLarge: {
      width: scaleSize(120),
      height: scaleSize(120),
      borderRadius: scaleSize(60),
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    username: {
      fontSize: typography.title.fontSize,
      fontWeight: '600' as const,
      textAlign: 'center' as const,
      marginBottom: spacing.xl,
    },
    segmentedWrap: {
      flexDirection: 'row' as const,
      alignSelf: 'stretch' as const,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      overflow: 'hidden' as const,
      marginBottom: spacing.xl,
    },
    segmentedLeft: {
      flex: 1 as const,
      paddingVertical: spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderTopLeftRadius: borderRadius.lg,
      borderBottomLeftRadius: borderRadius.lg,
    },
    segmentedRight: {
      flex: 1 as const,
      paddingVertical: spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderTopRightRadius: borderRadius.lg,
      borderBottomRightRadius: borderRadius.lg,
    },
    segmentedText: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    settingsList: { borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' as const },
    settingsRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'transparent' as const,
    },
    settingsRowText: { flex: 1 as const, fontSize: typography.body.fontSize, fontWeight: '500' as const },
    colorIconWrap: {
      width: scaleSize(24),
      height: scaleSize(24),
      borderRadius: scaleSize(12),
      overflow: 'hidden' as const,
      flexDirection: 'row' as const,
      marginRight: spacing.sm,
    },
    colorIconHalf: { flex: 1 as const },
    recordContent: { marginTop: 0 },
    badgesRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.xl,
      gap: spacing.sm + scaleSize(25),
    },
    badgeWrapper: {
      width: badgeSize,
      height: badgeTotalHeight,
      alignItems: 'center' as const,
      justifyContent: 'flex-start' as const,
    },
    badgeSvg: { position: 'absolute' as const, left: 0, top: 0 },
    badgeTextWrap: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: badgeSize,
      height: badgeSize,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    badgeValue: {
      fontSize: scaleSize(26),
      fontWeight: '800' as const,
      lineHeight: scaleSize(32),
    },
    badgeUnit: {
      fontSize: typography.label.fontSize,
      fontWeight: '700' as const,
      marginTop: 2,
      letterSpacing: 0.5,
    },
    recordStatsList: { borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' as const },
    recordStatsRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    recordStatsLabel: { fontSize: typography.subhead.fontSize, fontWeight: '500' as const },
    recordStatsValue: { fontSize: typography.subhead.fontSize, fontWeight: '600' as const },
  };
}

/** Design 17: stat row config for レコード section. */
const RECORD_STAT_LABELS = [
  { key: 'appUsageStart', label: 'アプリ使用開始' },
  { key: 'totalDays', label: '総瞑想日数' },
  { key: 'totalCount', label: '総瞑想回数' },
  { key: 'totalTime', label: '総瞑想時間' },
  { key: 'missions', label: 'ミッション達成数' },
];

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(
    () => createProfileSettingsStyles(spacing, typography, scaleSize, borderRadius),
    [spacing, typography, scaleSize, borderRadius]
  );
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = colors.surface;
  const accentOrange = colors.accent;

  const badgeSize = scaleSize(BADGE_SIZE);
  const ribbonHeight = scaleSize(RIBBON_HEIGHT);
  const badgeTotalHeight = badgeSize + ribbonHeight;

  const [tab, setTab] = useState<'user' | 'record'>(TAB_USER);
  const [displayName, setDisplayName] = useState('');
  const [recordStats, setRecordStats] = useState<RecordStats | null>(null);

  /** Refetch profile data when screen is focused (e.g. returning from edit name/icon or after completing a session). */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [name, stats] = await Promise.all([getDisplayName(), getRecordStats()]);
        if (!cancelled) {
          setDisplayName(name);
          setRecordStats(stats);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  /** Refetch record stats when user switches to the レコード tab so numbers are always up to date. */
  useEffect(() => {
    if (tab !== TAB_RECORD) return;
    let cancelled = false;
    getRecordStats().then((stats) => {
      if (!cancelled) setRecordStats(stats);
    });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const badgeValues = recordStats
    ? [
        { value: String(recordStats.totalMeditationDays), unit: 'DAYS' },
        { value: String(Math.floor(recordStats.totalMeditationMinutes / 60)), unit: 'HOURS' },
        { value: String(recordStats.missionsAchieved), unit: 'MISSIONS' },
      ]
    : [
        { value: '0', unit: 'DAYS' },
        { value: '0', unit: 'HOURS' },
        { value: '0', unit: 'MISSIONS' },
      ];

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top + spacing.xl }]}>
      {/* Top right: Close button */}
      <View style={[styles.headerRow, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeButton, { padding: spacing.sm }, pressed && { opacity: 0.7 }]}
          accessibilityLabel="Close">
          <IconSymbol name="close" size={scaleSize(28)} color={textColor} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.xxl,
            paddingHorizontal: spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Profile icon (centered, from storage; preset or custom image) */}
        <View style={[styles.profileWrap, { marginBottom: spacing.md }]}>
          <ProfileIconView
            size={scaleSize(120)}
            borderColor={borderColor}
            backgroundColor={surfaceColor}
            iconColor={textMuted}
          />
        </View>
        {/* Username – from storage */}
        <Text style={[styles.username, { color: textColor, fontSize: typography.title.fontSize, marginBottom: spacing.xl }]}>{displayName || '—'}</Text>

        {/* Segmented: ユーザー設定 | レコード */}
        <View style={[styles.segmentedWrap, { borderColor, marginBottom: spacing.xl }]}>
          <Pressable
            onPress={() => setTab(TAB_USER)}
            style={[
              styles.segmentedLeft,
              { paddingVertical: spacing.md },
              tab === TAB_USER && { backgroundColor: accentOrange },
            ]}>
            <Text
              style={[
                styles.segmentedText,
                { color: tab === TAB_USER ? colors.white : textColor, fontSize: typography.body.fontSize },
              ]}>
              ユーザー設定
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab(TAB_RECORD)}
            style={[
              styles.segmentedRight,
              { paddingVertical: spacing.md },
              tab === TAB_RECORD && { backgroundColor: accentOrange },
            ]}>
            <Text
              style={[
                styles.segmentedText,
                { color: tab === TAB_RECORD ? colors.white : textColor, fontSize: typography.body.fontSize },
              ]}>
              レコード
            </Text>
          </Pressable>
        </View>

        {/* Settings list (when ユーザー設定 is active) */}
        {tab === TAB_USER && (
          <View style={[styles.settingsList, { borderColor }]}>
            {SETTINGS_ITEMS.map((item, index) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.settingsRow,
                  { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, borderBottomColor: index < SETTINGS_ITEMS.length - 1 ? borderColor : 'transparent' },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  if (item.key === 'name') {
                    router.push('/profile-edit-name');
                  } else if (item.key === 'icon') {
                    router.push('/profile-edit-icon');
                  } else if (item.key === 'color') {
                    router.push('/profile-edit-color');
                  }
                }}>
                <Text style={[styles.settingsRowText, { color: textColor, fontSize: typography.body.fontSize }]}>{item.label}</Text>
                {item.showColorIcon && (
                  <View style={styles.colorIconWrap}>
                    <View style={[styles.colorIconHalf, { backgroundColor: surfaceColor }]} />
                    <View style={[styles.colorIconHalf, { backgroundColor: colors.border }]} />
                  </View>
                )}
                <IconSymbol name="chevron.right" size={scaleSize(22)} color={textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Record tab content (design 16; Analysis section excluded) */}
        {tab === TAB_RECORD && (
          <View style={styles.recordContent}>
            {/* Progress badges: from storage (days, hours, missions) */}
            <View style={[styles.badgesRow, { marginBottom: spacing.xl, gap: spacing.sm + scaleSize(25) }]}>
              {badgeValues.map((badge) => (
                <View key={badge.unit} style={[styles.badgeWrapper, { width: badgeSize, height: badgeTotalHeight }]}>
                  <Svg width={badgeSize} height={badgeTotalHeight} style={styles.badgeSvg}>
                    <Defs>
                      <RadialGradient id={`badgeGrad-${badge.unit}`} cx="50%" cy="50%" r="50%" fx="45%" fy="45%">
                        <Stop offset="0%" stopColor="#F9A825" />
                        <Stop offset="70%" stopColor="#EF6C00" />
                        <Stop offset="100%" stopColor="#E65100" />
                      </RadialGradient>
                      <RadialGradient id={`ribbonGrad-${badge.unit}`} cx="50%" cy="0%" r="50%">
                        <Stop offset="0%" stopColor="#FFE082" />
                        <Stop offset="100%" stopColor="#FBC02D" />
                      </RadialGradient>
                    </Defs>
                    <Circle cx={badgeSize / 2} cy={badgeSize / 2} r={badgeSize / 2 - 1} fill={`url(#badgeGrad-${badge.unit})`} />
                    <Circle cx={badgeSize / 2} cy={badgeSize / 2} r={badgeSize / 2 - 1} fill="none" stroke="#FFE082" strokeWidth={1.5} opacity={0.9} />
                    <Path
                      d={`M ${badgeSize / 2 - ribbonHeight} ${badgeSize - 2} L ${badgeSize / 2} ${badgeTotalHeight - 1} L ${badgeSize / 2 + ribbonHeight} ${badgeSize - 2} Z`}
                      fill={`url(#ribbonGrad-${badge.unit})`}
                    />
                  </Svg>
                  <View style={[styles.badgeTextWrap, { width: badgeSize, height: badgeSize }]} pointerEvents="none">
                    <Text style={[styles.badgeValue, { color: colors.white, fontSize: scaleSize(26), lineHeight: scaleSize(32) }]}>{badge.value}</Text>
                    <Text style={[styles.badgeUnit, { color: colors.white, fontSize: typography.label.fontSize }]}>{badge.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
            {/* Bottom statistics – from storage (design 17) */}
            <View style={[styles.recordStatsList, { backgroundColor: surfaceColor, borderColor }]}>
              {RECORD_STAT_LABELS.map((config, index) => {
                const value =
                  recordStats &&
                  (config.key === 'appUsageStart'
                    ? formatRecordDate(recordStats.appUsageStartDate)
                    : config.key === 'totalDays'
                      ? `${recordStats.totalMeditationDays}日`
                      : config.key === 'totalCount'
                        ? `${recordStats.totalMeditationCount}回`
                        : config.key === 'totalTime'
                          ? formatDuration(recordStats.totalMeditationMinutes)
                          : config.key === 'missions'
                            ? `${recordStats.missionsAchieved}回`
                            : '—');
                return (
                  <View
                    key={config.label}
                    style={[
                      styles.recordStatsRow,
                      { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
                      index < RECORD_STAT_LABELS.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: borderColor,
                      },
                    ]}>
                    <Text style={[styles.recordStatsLabel, { color: textColor, fontSize: typography.subhead.fontSize }]}>
                      {config.label}
                    </Text>
                    <Text style={[styles.recordStatsValue, { color: textMuted, fontSize: typography.subhead.fontSize }]}>{value}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
