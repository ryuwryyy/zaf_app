import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileIconView } from '@/components/ProfileIconView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeAlert } from '@/contexts/ThemeAlertContext';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { BgmFavourite } from '@/lib/storage';
import {
    addBgmFavourite,
    getBgmFavourites,
    getBgmTrack,
    getSessionBgmEnabled,
    getSessions,
    getTimerEndSound,
    getTimerPreset,
    setBgmTrack,
    setSessionBgmEnabled,
    setTimerEndSound,
    setTimerPreset,
} from '@/lib/storage';

const SEGMENT_TIMER = 'timer';
const SEGMENT_GUIDANCE = 'guidance';

const PICKER_ITEM_HEIGHT_BASE = 52;
const PICKER_VISIBLE_ROWS = 3;
/** Extra height for Section 1 (segmented + picker + buttons). */
const SECTION_1_EXTRA_HEIGHT = 100;
/** Tab bar height so Section 2 sits just above it. */
const TAB_BAR_HEIGHT = 100;
/** Approx height of Section 2 so scroll content can clear it when scrolled. */
const SECTION_2_APPROX_HEIGHT = 140;
/** 最近の項目: show only the last N session histories (most recent first). */
const RECENT_ITEMS_MAX = 10;

/** Format total seconds as "X時間 Y分" for session history (seconds removed per requirement). */
function formatDurationHm(totalSeconds: number): string {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}時間 ${mins}分`;
  if (hours > 0) return `${hours}時間`;
  return `${mins}分`;
}

/** Design 12: guidance video list */
const GUIDANCE_VIDEOS = [
  { tag: '【ビギナー向け】', title: '座禅のいろは', duration: '12分' },
  { tag: '【ビギナー向け】', title: '座禅のいろは', duration: '12分' },
  { tag: '【ビギナー向け】', title: '座禅のいろは', duration: '12分' },
];

const GUIDANCE_EXPLANATION =
  'ガイダンスの動画は瞑想のアカウトの\n回数と時間に含めるものとそうでない\nものを設定できるように。\n例えば動画30分の内、\nガイダンスが10分+瞑想20分の場合は\n  20分のみ時間を反映する';

function createSessionStyles(
  spacing: ScaledSpacing,
  typography: ScaledTypography,
  scaleSize: (n: number) => number,
  borderRadius: ScaledBorderRadius
) {
  const pickerItemHeight = scaleSize(PICKER_ITEM_HEIGHT_BASE);
  return {
    screen: { flex: 1 as const },
    header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
    headerTitle: { fontSize: typography.largeTitle.fontSize, fontWeight: '800' as const, letterSpacing: 0.5, lineHeight: scaleSize(30) },
    profileButton: { padding: spacing.sm },
    profileIconCircle: { width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(22), borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
    profileButtonPressed: { opacity: 0.7 },
    scroll: { flex: 1 as const },
    timerTopSection: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
    section1Content: { paddingTop: spacing.sm },
    section2Wrapper: { paddingTop: spacing.xl },
    section2InScroll: { marginBottom: 0 },
    segmentedWrap: { flexDirection: 'row' as const, alignSelf: 'stretch' as const, borderRadius: borderRadius.lg, borderWidth: 1, overflow: 'hidden' as const, marginTop: spacing.md },
    segmentedLeft: { flex: 1 as const, paddingVertical: spacing.md, alignItems: 'center' as const, justifyContent: 'center' as const, borderTopLeftRadius: borderRadius.lg, borderBottomLeftRadius: borderRadius.lg },
    segmentedRight: { flex: 1 as const, paddingVertical: spacing.md, alignItems: 'center' as const, justifyContent: 'center' as const, borderTopRightRadius: borderRadius.lg, borderBottomRightRadius: borderRadius.lg },
    segmentedText: { fontSize: typography.title.fontSize, fontWeight: '700' as const },
    timePickerRow: { flexDirection: 'row' as const, justifyContent: 'center' as const, marginTop: spacing.xxl },
    wheelRow: { alignItems: 'center' as const },
    wheelColumn: { flexDirection: 'row' as const, alignItems: 'center' as const, overflow: 'hidden' as const, borderRadius: borderRadius.md },
    wheelScroll: { flex: 1 as const },
    wheelPill: { position: 'absolute' as const, left: 0, right: 0, top: pickerItemHeight, height: pickerItemHeight, borderRadius: scaleSize(14), borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
    wheelItem: { height: pickerItemHeight, justifyContent: 'center' as const, paddingLeft: spacing.md, paddingRight: 0 },
    wheelItemTextSelected: { fontSize: scaleSize(28), fontWeight: '800' as const, lineHeight: scaleSize(34) },
    wheelItemTextUnselected: { fontSize: typography.body.fontSize, fontWeight: '500' as const, lineHeight: scaleSize(22), opacity: 0.45 },
    wheelUnitWrap: { height: pickerItemHeight * PICKER_VISIBLE_ROWS, justifyContent: 'center' as const, paddingLeft: 0 },
    wheelUnitFixed: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const },
    startButton: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: spacing.xl, paddingHorizontal: spacing.xl, borderRadius: borderRadius.lg, marginTop: spacing.xxl, minHeight: scaleSize(56), gap: spacing.sm },
    startButtonPressed: { opacity: 0.9 },
    startButtonText: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, color: '#FFFFFF' },
    optionRow: { flexDirection: 'row' as const, gap: spacing.xl, marginTop: spacing.xxl },
    optionButton: { flex: 1 as const, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md, borderWidth: 1, minHeight: scaleSize(52) },
    optionButtonText: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const },
    recentSection: { marginTop: spacing.xxl },
    recentTitle: { fontSize: typography.title.fontSize, fontWeight: '700' as const, textAlign: 'center' as const, marginBottom: spacing.xl },
    recentEmpty: { fontSize: typography.body.fontSize, textAlign: 'center' as const, paddingVertical: spacing.lg },
    recentCard: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, marginBottom: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1 },
    recentCardLeft: { flex: 1 as const },
    recentDurationRow: { flexDirection: 'row' as const, alignItems: 'baseline' as const, gap: scaleSize(4) },
    recentDuration: { fontSize: typography.subhead.fontSize, fontWeight: '500' as const, lineHeight: scaleSize(24) },
    recentDurationUnit: { fontSize: typography.label.fontSize, fontWeight: '400' as const },
    recentDescription: { fontSize: typography.label.fontSize, fontWeight: '400' as const, marginTop: spacing.sm },
    recentPlayButton: { width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(22), borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const, marginLeft: spacing.lg },
    guidanceSection: { marginTop: spacing.xl, alignItems: 'center' as const },
    guidanceVideoRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: spacing.xl, width: '92%' as const },
    guidanceThumb: { borderRadius: borderRadius.md, borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const, overflow: 'hidden' as const },
    guidanceThumbImage: { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 },
    guidancePlayOverlay: { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center' as const, justifyContent: 'center' as const },
    guidancePlayCircle: { width: scaleSize(56), height: scaleSize(56), borderRadius: scaleSize(28), backgroundColor: 'rgba(0, 0, 0, 0.65)', alignItems: 'center' as const, justifyContent: 'center' as const },
    guidanceVideoText: { flex: 1 as const, marginLeft: spacing.xl },
    guidanceTag: { fontSize: typography.body.fontSize, fontWeight: '600' as const, marginBottom: spacing.sm },
    guidanceTitle: { fontSize: scaleSize(22), fontWeight: '800' as const, marginBottom: spacing.sm },
    guidanceDuration: { fontSize: typography.subhead.fontSize, fontWeight: '600' as const },
    guidanceExplanationWrap: { alignSelf: 'stretch' as const, marginHorizontal: -spacing.md, marginTop: spacing.xl, marginBottom: spacing.xxl },
    guidanceExplanation: { fontSize: typography.subhead.fontSize, lineHeight: scaleSize(30), fontWeight: '600' as const, textAlign: 'center' as const, letterSpacing: 2 },
    settingsBlock: { borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' as const },
    settingsRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    settingsDivider: { height: 1, marginHorizontal: spacing.xl },
    settingsLabel: { fontSize: typography.subhead.fontSize, fontWeight: '600' as const },
    settingsValue: { fontSize: typography.subhead.fontSize, fontWeight: '600' as const },
    settingsValueRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: scaleSize(4) },
  };
}

type SessionStyles = ReturnType<typeof createSessionStyles>;

/** Single column of a wheel picker: scrollable list, center row highlighted (design9). */
function TimeWheelColumn({
  values,
  selectedValue,
  onSelect,
  unit,
  width,
  textColor,
  textMuted,
  surfaceColor,
  itemHeight,
  screenStyles,
}: {
  values: number[];
  selectedValue: number;
  onSelect: (v: number) => void;
  unit: string;
  width: number;
  textColor: string;
  textMuted: string;
  surfaceColor: string;
  itemHeight: number;
  screenStyles: SessionStyles;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const index = Math.max(0, Math.min(values.indexOf(selectedValue), values.length - 1));
  const initialY = index * itemHeight;
  const hasInitialScroll = useRef(false);
  const lastScrolledIndex = useRef<number | null>(null);

  useEffect(() => {
    if (index === lastScrolledIndex.current) return;
    lastScrolledIndex.current = index;
    scrollRef.current?.scrollTo({ y: index * itemHeight, animated: false });
  }, [index, itemHeight]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const i = Math.round(y / itemHeight);
      const clamped = Math.max(0, Math.min(i, values.length - 1));
      lastScrolledIndex.current = clamped;
      scrollRef.current?.scrollTo({ y: clamped * itemHeight, animated: true });
      onSelect(values[clamped]);
    },
    [values, onSelect, itemHeight]
  );

  const handleWheel = useCallback(
    (e: { nativeEvent?: { deltaY?: number }; preventDefault?: () => void }) => {
      if (Platform.OS !== 'web') return;
      const deltaY = e.nativeEvent?.deltaY ?? 0;
      if (deltaY === 0) return;
      const currentIndex = values.indexOf(selectedValue);
      const newIndex =
        deltaY > 0
          ? Math.min(currentIndex + 1, values.length - 1)
          : Math.max(currentIndex - 1, 0);
      if (newIndex === currentIndex) return;
      onSelect(values[newIndex]);
      scrollRef.current?.scrollTo({
        y: newIndex * itemHeight,
        animated: true,
      });
      e.preventDefault?.();
    },
    [values, selectedValue, onSelect, itemHeight]
  );

  return (
    <View
      style={[screenStyles.wheelColumn, { width, height: itemHeight * PICKER_VISIBLE_ROWS }]}
      onWheel={Platform.OS === 'web' ? handleWheel : undefined}
    >
      <View style={[screenStyles.wheelPill, { backgroundColor: surfaceColor }]} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        style={screenStyles.wheelScroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="center"
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: itemHeight }}
        onContentSizeChange={() => {
          if (!hasInitialScroll.current) {
            hasInitialScroll.current = true;
            scrollRef.current?.scrollTo({ y: initialY, animated: false });
          }
        }}
      >
        {values.map((v) => {
          const isSelected = v === selectedValue;
          return (
            <View key={v} style={screenStyles.wheelItem}>
              <Text
                style={[
                  isSelected ? screenStyles.wheelItemTextSelected : screenStyles.wheelItemTextUnselected,
                  isSelected ? { color: textColor } : { color: textMuted },
                ]}>
                {v}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={screenStyles.wheelUnitWrap} pointerEvents="none">
        <Text style={[screenStyles.wheelUnitFixed, { color: textColor }]}>{unit}</Text>
      </View>
    </View>
  );
}

/**
 * Session screen (design 9).
 * Header: SESSION (red) + profile icon.
 * Segmented: タイマー設定 | ガイダンス.
 * Time picker, Start button, ガイダンス有り / BGM有り, settings rows.
 */
export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(
    () => createSessionStyles(spacing, typography, scaleSize, borderRadius),
    [spacing, typography, scaleSize, borderRadius]
  );
  const pickerItemHeight = scaleSize(PICKER_ITEM_HEIGHT_BASE);
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const accentOrange = colors.accent;
  const surfaceColor = colors.surface;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const showAlert = useThemeAlert().showAlert;

  /** Guidance video thumbnail: 30% of full screen width (design 12) */
  const guidanceThumbWidth = screenWidth * 0.3;
  const guidanceThumbHeight = guidanceThumbWidth * (76 / 100);

  const router = useRouter();
  const [segment, setSegment] = useState<'timer' | 'guidance'>(SEGMENT_TIMER);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [bgmTrack, setBgmTrackState] = useState<{ name: string; uri: string } | null>(null);
  const [bgmFavourites, setBgmFavourites] = useState<BgmFavourite[]>([]);
  const [timerEndSound, setTimerEndSoundState] = useState('ヒルサイド');
  const [recentItems, setRecentItems] = useState<{ durationSeconds: number; label: string; id: string }[]>([]);

  /** Load session preferences, timer preset, and recent items when Timer tab is shown */
  useEffect(() => {
    if (segment !== SEGMENT_TIMER) return;
    let cancelled = false;
    (async () => {
      const [bgm, track, favourites, sound, sessions, preset] = await Promise.all([
        getSessionBgmEnabled(),
        getBgmTrack(),
        getBgmFavourites(),
        getTimerEndSound(),
        getSessions(),
        getTimerPreset(),
      ]);
      if (cancelled) return;
      setBgmEnabled(bgm);
      setBgmTrackState(track);
      setBgmFavourites(favourites);
      setTimerEndSoundState(sound);
      setHours(preset.hours);
      setMinutes(preset.minutes);
      /** Recent items = last RECENT_ITEMS_MAX completed sessions, most recent first. Label = short date (M月D日). */
      const sorted = [...sessions].sort((a, b) => {
        const ta = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.date).getTime();
        const tb = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.date).getTime();
        return tb - ta;
      });
      const items = sorted.slice(0, RECENT_ITEMS_MAX).map((s, i) => {
        const [y, m, d] = s.date.split('-');
        const month = parseInt(m ?? '0', 10);
        const day = parseInt(d ?? '0', 10);
        const durationSeconds = s.durationSeconds ?? s.durationMinutes * 60;
        return {
          durationSeconds,
          label: `${month}月${day}日`,
          id: `${s.date}-${s.completedAt ?? ''}-${i}`,
        };
      });
      setRecentItems(items);
    })();
    return () => {
      cancelled = true;
    };
  }, [segment]);

  /** When Session screen is focused, restore timer preset and refetch recent items so panel shows last set values. */
  useFocusEffect(
    useCallback(() => {
      if (segment !== SEGMENT_TIMER) return;
      let cancelled = false;
      (async () => {
        const [preset, sessions, track, favourites] = await Promise.all([
          getTimerPreset(),
          getSessions(),
          getBgmTrack(),
          getBgmFavourites(),
        ]);
        if (cancelled) return;
        setHours(preset.hours);
        setMinutes(preset.minutes);
        setBgmTrackState(track);
        setBgmFavourites(favourites);
        const sorted = [...sessions].sort((a, b) => {
          const ta = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.date).getTime();
          const tb = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.date).getTime();
          return tb - ta;
        });
        const items = sorted.slice(0, RECENT_ITEMS_MAX).map((s, i) => {
          const [y, m, d] = s.date.split('-');
          const month = parseInt(m ?? '0', 10);
          const day = parseInt(d ?? '0', 10);
          const durationSeconds = s.durationSeconds ?? s.durationMinutes * 60;
          return {
            durationSeconds,
            label: `${month}月${day}日`,
            id: `${s.date}-${s.completedAt ?? ''}-${i}`,
          };
        });
        setRecentItems(items);
      })();
      return () => {
        cancelled = true;
      };
    }, [segment])
  );

  /** Persist time picker when user changes a value so last status is preserved. */
  const handleHoursSelect = useCallback(
    (v: number) => {
      setHours(v);
      setTimerPreset({ hours: v, minutes, seconds: 0 });
    },
    [minutes]
  );
  const handleMinutesSelect = useCallback(
    (v: number) => {
      setMinutes(v);
      setTimerPreset({ hours, minutes: v, seconds: 0 });
    },
    [hours]
  );

  const openBgmFromDevice = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const name = asset.name || '音源';
      const uri = asset.uri;
      await addBgmFavourite(name, uri);
      setBgmFavourites(await getBgmFavourites());
      setBgmTrackState({ name, uri });
      await setBgmTrack({ name, uri });
      setBgmEnabled(true);
      await setSessionBgmEnabled(true);
    } catch {
      showAlert('エラー', '音源を追加できませんでした。');
    }
  }, [showAlert]);

  const handleBgmPress = useCallback(() => {
    const showBgmOptions = () => {
      const buttons: Array<{ text: string; onPress?: () => void }> = [
        {
          text: 'オフ',
          onPress: async () => {
            setBgmEnabled(false);
            await setSessionBgmEnabled(false);
          },
        },
        {
          text: '端末から音楽を追加',
          onPress: openBgmFromDevice,
        },
        ...bgmFavourites.slice(0, 8).map((f) => ({
          text: f.name,
          onPress: async () => {
            setBgmTrackState({ name: f.name, uri: f.uri });
            await setBgmTrack({ name: f.name, uri: f.uri });
            setBgmEnabled(true);
            await setSessionBgmEnabled(true);
          },
        })),
        { text: 'キャンセル', style: 'cancel' },
      ];
      showAlert(
        'BGMを設定',
        'お好きなBGMを選ぶか、端末に保存した音楽を追加してください。',
        buttons,
        { cancelable: true }
      );
    };
    if (bgmEnabled) {
      showBgmOptions();
    } else {
      setBgmEnabled(true);
      setSessionBgmEnabled(true);
      showBgmOptions();
    }
  }, [bgmEnabled, bgmFavourites, openBgmFromDevice, showAlert]);

  const handleTimerEndSoundPress = useCallback(() => {
    showAlert(
      'タイマー終了時',
      '終了時に再生するサウンドを選んでください',
      [
        {
          text: 'オフ',
          onPress: async () => {
            setTimerEndSoundState('オフ');
            await setTimerEndSound('オフ');
          },
        },
        {
          text: 'ヒルサイド',
          onPress: async () => {
            setTimerEndSoundState('ヒルサイド');
            await setTimerEndSound('ヒルサイド');
          },
        },
        {
          text: 'ベル',
          onPress: async () => {
            setTimerEndSoundState('ベル');
            await setTimerEndSound('ベル');
          },
        },
        { text: 'キャンセル', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [showAlert]);

  /** Fixed width per column so the three parts stay grouped in the middle */
  const pickerColumnWidth = 104;

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      {/* Header: SESSION (red) + profile */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.xl,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
          },
        ]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>SESSION</Text>
        <Pressable
          onPress={() => router.push('/profile-settings')}
          style={({ pressed }) => [styles.profileButton, pressed && styles.profileButtonPressed]}
          accessibilityLabel="Profile">
          <ProfileIconView size={44} borderColor={borderColor} backgroundColor={surfaceColor} iconColor={textColor} />
        </Pressable>
      </View>

      {/* Segmented + time picker outside ScrollView so each wheel column can receive vertical scroll */}
      <View style={[styles.timerTopSection, { paddingHorizontal: spacing.lg }]}>
        <View style={[styles.segmentedWrap, { borderColor }]}>
          <Pressable
            onPress={() => setSegment(SEGMENT_TIMER)}
            style={[
              styles.segmentedLeft,
              segment === SEGMENT_TIMER && { backgroundColor: accentOrange },
            ]}>
            <Text
              style={[
                styles.segmentedText,
                { color: segment === SEGMENT_TIMER ? colors.white : textMuted },
              ]}>
              タイマー設定
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSegment(SEGMENT_GUIDANCE)}
            style={[
              styles.segmentedRight,
              segment === SEGMENT_GUIDANCE && { backgroundColor: accentOrange },
            ]}>
            <Text
              style={[
                styles.segmentedText,
                { color: segment === SEGMENT_GUIDANCE ? colors.white : textMuted },
              ]}>
              ガイダンス
            </Text>
          </Pressable>
        </View>
        {segment === SEGMENT_TIMER && (
          <View style={[styles.timePickerRow, styles.wheelRow, { gap: spacing.xl + 4 }]}>
            <TimeWheelColumn
              values={Array.from({ length: 24 }, (_, i) => i)}
              selectedValue={hours}
              onSelect={handleHoursSelect}
              unit="時間"
              width={pickerColumnWidth}
              textColor={textColor}
              textMuted={textMuted}
              surfaceColor={surfaceColor}
              itemHeight={pickerItemHeight}
              screenStyles={styles}
            />
            <TimeWheelColumn
              values={Array.from({ length: 12 }, (_, i) => i * 5)}
              selectedValue={minutes}
              onSelect={handleMinutesSelect}
              unit="分"
              width={pickerColumnWidth}
              textColor={textColor}
              textMuted={textMuted}
              surfaceColor={surfaceColor}
              itemHeight={pickerItemHeight}
              screenStyles={styles}
            />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.section1Content,
          {
            paddingBottom:
              SECTION_1_EXTRA_HEIGHT + SECTION_2_APPROX_HEIGHT + TAB_BAR_HEIGHT + spacing.lg,
            paddingHorizontal: spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        {segment === SEGMENT_TIMER && (
          <>
            {/* Start button: はじめる (orange, arch state) -> design 11 timer */}
            <Pressable
              onPress={async () => {
                await setTimerPreset({ hours, minutes, seconds: 0 });
                const totalSeconds = Math.max(1, hours * 3600 + minutes * 60);
                router.push(`/session-timer?seconds=${totalSeconds}`);
              }}
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: accentOrange },
                pressed && styles.startButtonPressed,
              ]}>
              <Text style={styles.startButtonText}>はじめる</Text>
              <IconSymbol name="play.fill" size={22} color={colors.white} />
            </Pressable>

            {/* Option buttons: ガイダンス有り → Guidance tab | BGM有り/オフ → toggle and persist */}
            <View style={styles.optionRow}>
              <Pressable
                onPress={() => setSegment(SEGMENT_GUIDANCE)}
                style={({ pressed }) => [
                  styles.optionButton,
                  { backgroundColor: surfaceColor, borderColor },
                  pressed && { opacity: 0.85 },
                ]}>
                <Text style={[styles.optionButtonText, { color: textColor }]}>ガイダンス有り</Text>
                <IconSymbol name="chevron.right" size={16} color={textMuted} />
              </Pressable>
              <Pressable
                onPress={handleBgmPress}
                style={({ pressed }) => [
                  styles.optionButton,
                  { backgroundColor: surfaceColor, borderColor },
                  pressed && { opacity: 0.85 },
                ]}>
                <Text style={[styles.optionButtonText, { color: textColor }]}>
                  {bgmEnabled ? (bgmTrack ? `BGM有り ・ ${bgmTrack.name}` : 'BGM有り') : 'BGMオフ'}
                </Text>
                <IconSymbol name="chevron.right" size={16} color={textMuted} />
              </Pressable>
            </View>

            {/* Section 2: settings block (scrolls with content) */}
            <View style={[styles.section2InScroll, { marginTop: spacing.xl }]}>
              <View style={[styles.settingsBlock, { borderColor }]}>
                <View style={styles.settingsRow}>
                  <Text style={[styles.settingsLabel, { color: textMuted }]}>ラベル</Text>
                  <Text style={[styles.settingsValue, { color: textColor }]}>タイマー</Text>
                </View>
                <View style={[styles.settingsDivider, { backgroundColor: borderColor }]} />
                <Pressable style={styles.settingsRow} onPress={handleTimerEndSoundPress}>
                  <Text style={[styles.settingsLabel, { color: textMuted }]}>タイマー終了時</Text>
                  <View style={styles.settingsValueRow}>
                    <Text style={[styles.settingsValue, { color: textColor }]}>{timerEndSound === 'なし' ? 'オフ' : timerEndSound}</Text>
                    <IconSymbol name="chevron.right" size={16} color={textMuted} />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Design 10: 最近の項目 (Recent Items) – from completed sessions; play starts timer with that duration */}
            <View style={styles.recentSection}>
              <Text style={[styles.recentTitle, { color: textMuted }]}>最近の項目</Text>
              {recentItems.length === 0 ? (
                <Text style={[styles.recentEmpty, { color: textMuted }]}>まだ最近の項目はありません</Text>
              ) : (
                recentItems.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.recentCard,
                      { backgroundColor: surfaceColor, borderColor },
                      pressed && { opacity: 0.9 },
                    ]}>
                    <View style={styles.recentCardLeft}>
                      <Text style={[styles.recentDuration, { color: textColor }]} numberOfLines={1}>
                        {formatDurationHm(item.durationSeconds)}
                      </Text>
                      <Text style={[styles.recentDescription, { color: textColor }]} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </View>
                    <Pressable
                      style={({ pressed: p }) => [
                        styles.recentPlayButton,
                        { borderColor, backgroundColor: surfaceColor },
                        p && { opacity: 0.8 },
                      ]}
                      onPress={() => router.push(`/session-timer?seconds=${item.durationSeconds}`)}>
                      <IconSymbol name="play.fill" size={20} color={textColor} />
                    </Pressable>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}

        {/* Design 12: ガイダンス (Guidance) - video list + explanatory text */}
        {segment === SEGMENT_GUIDANCE && (
          <View style={styles.guidanceSection}>
            {GUIDANCE_VIDEOS.map((video, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [styles.guidanceVideoRow, pressed && { opacity: 0.9 }]}
                onPress={() => router.push('/guidance-video')}>
                <View
                  style={[
                    styles.guidanceThumb,
                    {
                      backgroundColor: surfaceColor,
                      borderColor,
                      width: guidanceThumbWidth,
                      height: guidanceThumbHeight,
                    },
                  ]}>
                  <Image
                    source={require('@/assets/images/8-1.png')}
                    style={[
                      styles.guidanceThumbImage,
                      { width: guidanceThumbWidth, height: guidanceThumbHeight },
                    ]}
                    resizeMode="cover"
                  />
                  <View style={styles.guidancePlayOverlay}>
                    <View style={styles.guidancePlayCircle}>
                      <IconSymbol name="play.fill" size={36} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
                <View style={styles.guidanceVideoText}>
                  <Text style={[styles.guidanceTag, { color: textColor }]}>{video.tag}</Text>
                  <Text style={[styles.guidanceTitle, { color: textColor }]}>{video.title}</Text>
                  <Text style={[styles.guidanceDuration, { color: textColor }]}>{video.duration}</Text>
                </View>
              </Pressable>
            ))}
            <View style={styles.guidanceExplanationWrap}>
              <Text style={[styles.guidanceExplanation, { color: textMuted }]}>
                {GUIDANCE_EXPLANATION}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

