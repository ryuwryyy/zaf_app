/**
 * Settings screen (design 14): MISSION SETTING.
 * Header, mission goal (目標日数), reminder section with toggles, ZAF PRODUCTS grid.
 * Goal and reminders are loaded/saved from local storage.
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Image,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileIconView } from '@/components/ProfileIconView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useThemeAlert } from '@/contexts/ThemeAlertContext';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { syncReminderNotifications } from '@/lib/reminder-notifications';
import {
    getDailyMeditationTargetMinutes,
    getGoalDays,
    getReminderNotificationBody,
    getReminderNotificationTitle,
    getReminders,
    setGoalDays as persistGoalDays,
    setDailyMeditationTargetMinutes,
    setOnboardingCompleted,
    setReminderNotificationBody,
    setReminderNotificationTitle,
    setReminders,
    type ReminderItem,
} from '@/lib/storage';

const TAB_BAR_HEIGHT = 100;
const MAX_REMINDERS = 10;
const REMINDER_PICKER_ITEM_HEIGHT_BASE = 44;
const REMINDER_PICKER_VISIBLE_ROWS = 3;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function createSettingsStyles(
  spacing: ScaledSpacing,
  typography: ScaledTypography,
  scaleSize: (n: number) => number,
  borderRadius: ScaledBorderRadius
) {
  const pickerItemHeight = scaleSize(REMINDER_PICKER_ITEM_HEIGHT_BASE);
  return {
    screen: { flex: 1 as const },
    header: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
    headerTitle: { fontSize: typography.largeTitle.fontSize, fontWeight: '800' as const, letterSpacing: 0.5, lineHeight: scaleSize(30) },
    profileButton: { padding: spacing.sm },
    profileIconCircle: { width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(22), borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
    profileButtonPressed: { opacity: 0.7 },
    scroll: { flex: 1 as const },
    scrollContent: { paddingTop: spacing.md },
    sectionLabel: { fontSize: typography.body.fontSize, fontWeight: '600' as const, marginBottom: spacing.sm },
    sectionHint: { fontSize: typography.label.fontSize, fontWeight: '400' as const, marginBottom: spacing.sm },
    goalRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: spacing.md, gap: spacing.md },
    goalInput: { width: scaleSize(100), paddingVertical: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
    goalValue: { fontSize: typography.largeTitle.fontSize, fontWeight: '700' as const },
    goalValueInput: { fontSize: typography.largeTitle.fontSize, fontWeight: '700' as const, textAlign: 'center' as const },
    goalUnit: { fontSize: typography.subhead.fontSize, fontWeight: '600' as const },
    goalButtonsRow: { flexDirection: 'row' as const, justifyContent: 'center' as const, alignItems: 'center' as const, gap: spacing.sm, marginBottom: spacing.xl },
    goalActionButton: { flex: 1 as const, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, borderRadius: borderRadius.md, borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
    goalActionButtonWide: { minWidth: scaleSize(80) },
    goalActionText: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    reminderHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: spacing.sm },
    reminderRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.sm },
    reminderRowRight: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.md },
    reminderDeleteButton: { padding: spacing.xs },
    reminderTimeWrap: { flex: 1 as const, justifyContent: 'center' as const },
    reminderTime: { fontSize: typography.subhead.fontSize, fontWeight: '600' as const },
    reminderNotificationInputRow: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.sm },
    reminderNotificationLabel: { fontSize: typography.label.fontSize, fontWeight: '600' as const, marginBottom: spacing.xs },
    reminderNotificationInput: { fontSize: typography.body.fontSize, paddingVertical: spacing.xs },
    modalOverlay: { flex: 1 as const, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' as const, alignItems: 'center' as const, padding: spacing.xl },
    modalContent: { width: '100%' as const, maxWidth: scaleSize(340), borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.xl },
    modalTitle: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, textAlign: 'center' as const, marginBottom: spacing.sm },
    modalSubtitle: { fontSize: typography.label.fontSize, fontWeight: '500' as const, textAlign: 'center' as const, marginBottom: spacing.lg },
    reminderWheelRow: { flexDirection: 'row' as const, justifyContent: 'center' as const, alignItems: 'center' as const, gap: spacing.xl, marginBottom: spacing.lg },
    reminderWheelWrap: { flexDirection: 'row' as const, alignItems: 'center' as const },
    reminderWheelColumn: { width: scaleSize(64), overflow: 'hidden' as const, borderRadius: borderRadius.md },
    reminderWheelPill: { position: 'absolute' as const, left: 0, right: 0, top: pickerItemHeight, height: pickerItemHeight, borderRadius: scaleSize(12), borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
    reminderWheelScroll: { flex: 1 as const },
    reminderWheelItem: { height: pickerItemHeight, justifyContent: 'center' as const, alignItems: 'center' as const },
    reminderWheelItemSelected: { fontSize: typography.title.fontSize, fontWeight: '700' as const },
    reminderWheelItemUnselected: { fontSize: typography.body.fontSize, fontWeight: '500' as const, opacity: 0.45 },
    reminderWheelUnit: { marginLeft: spacing.xs, fontSize: typography.body.fontSize, fontWeight: '600' as const },
    timePreview: { fontSize: typography.body.fontSize, fontWeight: '600' as const, textAlign: 'center' as const, marginBottom: spacing.xl },
    modalButtons: { flexDirection: 'row' as const, gap: spacing.md },
    modalButton: { flex: 1 as const, paddingVertical: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, alignItems: 'center' as const },
    modalButtonPrimary: { borderWidth: 0 },
    modalButtonText: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    reminderLinkButton: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.xl },
    reminderLinkText: { fontSize: typography.body.fontSize, fontWeight: '600' as const, flex: 1 as const },
    productsTitle: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, letterSpacing: 0.5, marginBottom: spacing.lg },
    productsGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.md },
    productCard: { width: '47%' as const, aspectRatio: 1, borderRadius: borderRadius.md, overflow: 'hidden' as const },
    productImage: { width: '100%' as const, height: '100%' as const },
    resetOnboardingButton: { alignSelf: 'center' as const, marginTop: spacing.xl, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1 },
    resetOnboardingText: { fontSize: typography.label.fontSize, fontWeight: '500' as const },
  };
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Parse "HH:mm" or "H:mm" into hour and minute. */
function parseReminderTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map((s) => parseInt(s, 10));
  return {
    hour: Number.isFinite(h) ? Math.max(0, Math.min(23, h)) : 12,
    minute: Number.isFinite(m) ? Math.max(0, Math.min(59, m)) : 0,
  };
}

type SettingsStyles = ReturnType<typeof createSettingsStyles>;

/** Scrollable time wheel for reminder modal: scroll up/down to select hour or minute. */
function ReminderTimeWheel({
  values,
  selectedValue,
  onSelect,
  unit,
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
  textColor: string;
  textMuted: string;
  surfaceColor: string;
  itemHeight: number;
  screenStyles: SettingsStyles;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const index = Math.max(0, Math.min(values.indexOf(selectedValue), values.length - 1));
  const initialY = index * itemHeight;
  const hasInitialScroll = useRef(false);
  const lastScrolledIndex = useRef<number | null>(null);
  const isSnapping = useRef(false);

  useEffect(() => {
    if (index === lastScrolledIndex.current) return;
    lastScrolledIndex.current = index;
    scrollRef.current?.scrollTo({ y: index * itemHeight, animated: false });
  }, [index, itemHeight]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSnapping.current) return;
      const y = e.nativeEvent.contentOffset.y;
      const i = Math.round(y / itemHeight);
      const clamped = Math.max(0, Math.min(i, values.length - 1));
      const targetY = clamped * itemHeight;
      lastScrolledIndex.current = clamped;
      onSelect(values[clamped]);
      if (Math.abs(y - targetY) > 1) {
        isSnapping.current = true;
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
        setTimeout(() => {
          isSnapping.current = false;
        }, 350);
      }
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
        deltaY > 0 ? Math.min(currentIndex + 1, values.length - 1) : Math.max(currentIndex - 1, 0);
      if (newIndex === currentIndex) return;
      onSelect(values[newIndex]);
      scrollRef.current?.scrollTo({ y: newIndex * itemHeight, animated: true });
      e.preventDefault?.();
    },
    [values, selectedValue, onSelect, itemHeight]
  );

  return (
    <View
      style={[
        screenStyles.reminderWheelWrap,
        { height: itemHeight * REMINDER_PICKER_VISIBLE_ROWS },
      ]}
      onWheel={Platform.OS === 'web' ? handleWheel : undefined}>
      <View style={screenStyles.reminderWheelColumn}>
        <View style={[screenStyles.reminderWheelPill, { backgroundColor: surfaceColor }]} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          style={screenStyles.reminderWheelScroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
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
          }}>
          {values.map((v) => {
            const isSelected = v === selectedValue;
            return (
              <View key={v} style={screenStyles.reminderWheelItem}>
                <Text
                  style={[
                    isSelected ? screenStyles.reminderWheelItemSelected : screenStyles.reminderWheelItemUnselected,
                    isSelected ? { color: textColor } : { color: textMuted },
                  ]}>
                  {String(v).padStart(2, '0')}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <Text style={[styles.reminderWheelUnit, { color: textMuted }]}>{unit}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(
    () => createSettingsStyles(spacing, typography, scaleSize, borderRadius),
    [spacing, typography, scaleSize, borderRadius]
  );
  const pickerItemHeight = scaleSize(REMINDER_PICKER_ITEM_HEIGHT_BASE);
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const showAlert = useThemeAlert().showAlert;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = colors.surface;
  const modalOverlayBg = colorScheme === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.5)';

  const [goalDays, setGoalDays] = useState(20);
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(10);
  const [reminders, setRemindersState] = useState<ReminderItem[]>([
    { id: '1', time: '20:00', enabled: true },
    { id: '2', time: '6:00', enabled: false },
  ]);
  const [loaded, setLoaded] = useState(false);
  const [addReminderVisible, setAddReminderVisible] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [pickerHour, setPickerHour] = useState(12);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [reminderNotificationTitle, setReminderNotificationTitleState] = useState('');
  const [reminderNotificationBody, setReminderNotificationBodyState] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getGoalDays(),
      getDailyMeditationTargetMinutes(),
      getReminders(),
      getReminderNotificationTitle(),
      getReminderNotificationBody(),
    ]).then(([days, target, rem, title, body]) => {
      if (!cancelled) {
        setGoalDays(days);
        setDailyTargetMinutes(target);
        setRemindersState(rem);
        setReminderNotificationTitleState(title ?? '');
        setReminderNotificationBodyState(body ?? '');
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoalChange = useCallback(async (newDays: number) => {
    const value = Math.max(0, Math.floor(newDays));
    setGoalDays(value);
    await persistGoalDays(value);
  }, []);

  const handleDailyTargetChange = useCallback(async (minutes: number) => {
    const value = Math.max(1, Math.min(24 * 60, Math.floor(minutes)));
    setDailyTargetMinutes(value);
    await setDailyMeditationTargetMinutes(value);
  }, []);

  const handleReminderToggle = useCallback(
    async (id: string, enabled: boolean) => {
      const next = reminders.map((r) => (r.id === id ? { ...r, enabled } : r));
      setRemindersState(next);
      await setReminders(next);
      await syncReminderNotifications(next);
    },
    [reminders]
  );

  const openAddReminder = useCallback(() => {
    if (reminders.length >= MAX_REMINDERS) {
      showAlert('リマインダー', `最大${MAX_REMINDERS}件まで追加できます。`);
      return;
    }
    setEditingReminderId(null);
    setPickerHour(12);
    setPickerMinute(0);
    setAddReminderVisible(true);
  }, [reminders.length, showAlert]);

  const openEditReminder = useCallback((rem: ReminderItem) => {
    const { hour, minute } = parseReminderTime(rem.time);
    setEditingReminderId(rem.id);
    setPickerHour(hour);
    setPickerMinute(minute);
    setAddReminderVisible(true);
  }, []);

  const handleAddReminderConfirm = useCallback(async () => {
    const hour = Math.max(0, Math.min(23, pickerHour));
    const minute = Math.max(0, Math.min(59, pickerMinute));
    const time = formatTime(hour, minute);
    const isEditing = editingReminderId != null;
    const duplicate = reminders.some((r) => r.time === time && r.id !== editingReminderId);
    if (duplicate) {
      showAlert('リマインダー', 'この時刻はすでに登録されています。');
      return;
    }
    if (isEditing) {
      const next = reminders.map((r) =>
        r.id === editingReminderId ? { ...r, time } : r
      );
      setRemindersState(next);
      await setReminders(next);
      await syncReminderNotifications(next);
    } else {
      const id = `rem-${Date.now()}`;
      const next = [...reminders, { id, time, enabled: true }];
      setRemindersState(next);
      await setReminders(next);
      await syncReminderNotifications(next);
    }
    setAddReminderVisible(false);
    setEditingReminderId(null);
  }, [reminders, pickerHour, pickerMinute, editingReminderId, showAlert]);

  const handleAddReminderCancel = useCallback(() => {
    setAddReminderVisible(false);
    setEditingReminderId(null);
  }, []);

  const handleDeleteReminder = useCallback(
    (id: string) => {
      showAlert('リマインダーを削除', 'このリマインダーを削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const next = reminders.filter((r) => r.id !== id);
            setRemindersState(next);
            await setReminders(next);
            await syncReminderNotifications(next);
          },
        },
      ]);
    },
    [reminders, showAlert]
  );

  const handleReminderNotificationTitleBlur = useCallback(async () => {
    await setReminderNotificationTitle(reminderNotificationTitle);
    await syncReminderNotifications(reminders);
  }, [reminderNotificationTitle, reminders]);

  const handleReminderNotificationBodyBlur = useCallback(async () => {
    await setReminderNotificationBody(reminderNotificationBody);
    await syncReminderNotifications(reminders);
  }, [reminderNotificationBody, reminders]);

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      {/* Header: MISSION SETTING + profile */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.xl,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
          },
        ]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>MISSION SETTING</Text>
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
            paddingHorizontal: spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Mission goal: 瞑想を続ける目標日数 – editable by typing or buttons */}
        <Text style={[styles.sectionLabel, { color: textColor }]}>瞑想を続ける目標日数</Text>
        <View style={styles.goalRow}>
          <TextInput
            style={[styles.goalInput, styles.goalValueInput, { backgroundColor: surfaceColor, borderColor, color: textColor }]}
            value={loaded ? String(goalDays) : '—'}
            editable={loaded}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="0"
            placeholderTextColor={textMuted}
            onChangeText={(t) => {
              if (!loaded) return;
              const s = t.replace(/\D/g, '');
              if (s === '') {
                handleGoalChange(0);
                return;
              }
              const n = parseInt(s, 10);
              if (!Number.isNaN(n)) handleGoalChange(Math.min(365, Math.max(0, n)));
            }}
            onBlur={() => persistGoalDays(Math.max(0, Math.min(365, goalDays)))}
          />
          <Text style={[styles.goalUnit, { color: textColor }]}>日間</Text>
        </View>
        <View style={styles.goalButtonsRow}>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleGoalChange(Math.min(goalDays + 5, 365))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'+5'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleGoalChange(Math.min(goalDays + 1, 365))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'+1'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, styles.goalActionButtonWide, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleGoalChange(0)}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'0にリセット'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleGoalChange(Math.max(0, goalDays - 1))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'-1'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleGoalChange(Math.max(0, goalDays - 5))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'-5'}</Text>
          </Pressable>
        </View>

        {/* Daily meditation target: 1日の目標瞑想時間 – editable by typing or buttons */}
        <Text style={[styles.sectionLabel, { color: textColor }]}>1日の目標瞑想時間</Text>
        <Text style={[styles.sectionHint, { color: textMuted }]}>この時間に達した日だけ「達成」としてカウントされます</Text>
        <View style={styles.goalRow}>
          <TextInput
            style={[styles.goalInput, styles.goalValueInput, { backgroundColor: surfaceColor, borderColor, color: textColor }]}
            value={loaded ? String(dailyTargetMinutes) : '—'}
            editable={loaded}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="10"
            placeholderTextColor={textMuted}
            onChangeText={(t) => {
              if (!loaded) return;
              const s = t.replace(/\D/g, '');
              if (s === '') {
                handleDailyTargetChange(1);
                return;
              }
              const n = parseInt(s, 10);
              if (!Number.isNaN(n)) handleDailyTargetChange(Math.min(1440, Math.max(1, n)));
            }}
            onBlur={() => handleDailyTargetChange(Math.max(1, Math.min(1440, dailyTargetMinutes)))}
          />
          <Text style={[styles.goalUnit, { color: textColor }]}>分</Text>
        </View>
        <View style={styles.goalButtonsRow}>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleDailyTargetChange(Math.min(1440, dailyTargetMinutes + 5))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'+5'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleDailyTargetChange(Math.min(1440, dailyTargetMinutes + 1))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'+1'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleDailyTargetChange(Math.max(1, dailyTargetMinutes - 1))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'-1'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.goalActionButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
            onPress={() => loaded && handleDailyTargetChange(Math.max(1, dailyTargetMinutes - 5))}>
            <Text style={[styles.goalActionText, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>{'-5'}</Text>
          </Pressable>
        </View>

        {/* Reminder: リマインダー – from storage */}
        <View style={styles.reminderHeader}>
          <Text style={[styles.sectionLabel, { color: textColor }]}>リマインダー</Text>
          <Pressable onPress={openAddReminder} style={({ pressed }) => pressed && { opacity: 0.7 }}>
            <IconSymbol name="plus" size={24} color={textColor} />
          </Pressable>
        </View>
        {reminders.map((rem) => (
          <View key={rem.id} style={[styles.reminderRow, { backgroundColor: surfaceColor, borderColor }]}>
            <Pressable
              onPress={() => openEditReminder(rem)}
              style={({ pressed }) => [styles.reminderTimeWrap, pressed && { opacity: 0.7 }]}
              accessibilityLabel="リマインダーの時刻を変更">
              <Text style={[styles.reminderTime, { color: textColor }]}>{rem.time}</Text>
            </Pressable>
            <View style={styles.reminderRowRight}>
              <Switch
                value={rem.enabled}
                onValueChange={(enabled) => handleReminderToggle(rem.id, enabled)}
                trackColor={{ false: '#C3C3C3', true: colors.accent }}
                thumbColor="#FFFFFF"
              />
              <Pressable
                onPress={() => handleDeleteReminder(rem.id)}
                style={({ pressed: p }) => [styles.reminderDeleteButton, p && { opacity: 0.7 }]}
                hitSlop={8}
                accessibilityLabel="リマインダーを削除">
                <IconSymbol name="trash" size={22} color={textMuted} />
              </Pressable>
            </View>
          </View>
        ))}
        <Text style={[styles.sectionLabel, { color: textColor }, { marginTop: spacing.lg }]}>
          通知のタイトル・本文
        </Text>
        <Text style={[styles.sectionHint, { color: textMuted }]}>
          リマインダー通知に表示するタイトルと本文。空欄の場合はアプリのデフォルトを使用。本文で「{'{time}'}」と入力すると時刻（例：20:00）に置き換わります。
        </Text>
        <View style={[styles.reminderNotificationInputRow, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.reminderNotificationLabel, { color: textMuted }]}>タイトル</Text>
          <TextInput
            style={[styles.reminderNotificationInput, { color: textColor }]}
            value={reminderNotificationTitle}
            onChangeText={setReminderNotificationTitleState}
            onBlur={handleReminderNotificationTitleBlur}
            placeholder="ZAF リマインダー"
            placeholderTextColor={textMuted}
          />
        </View>
        <View style={[styles.reminderNotificationInputRow, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.reminderNotificationLabel, { color: textMuted }]}>本文</Text>
          <TextInput
            style={[styles.reminderNotificationInput, { color: textColor }]}
            value={reminderNotificationBody}
            onChangeText={setReminderNotificationBodyState}
            onBlur={handleReminderNotificationBodyBlur}
            placeholder="瞑想の時間です。（{time}）"
            placeholderTextColor={textMuted}
          />
        </View>
        <Pressable
          style={({ pressed }) => [styles.reminderLinkButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
          onPress={() => router.push('/meditation-purpose')}>
          <Text style={[styles.reminderLinkText, { color: textColor }]} numberOfLines={1}>
            目的に応じた瞑想の取り組み方
          </Text>
          <IconSymbol name="chevron.right" size={20} color={textMuted} />
        </Pressable>

        {/* ZAF PRODUCTS */}
        <Text style={[styles.productsTitle, { color: textColor }]}>ZAF PRODUCTS</Text>
        <View style={styles.productsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.productCard, { backgroundColor: surfaceColor }, pressed && { opacity: 0.9 }]}
              onPress={() => router.push(`/zaf-product?id=${i}`)}>
              <Image
                source={require('@/assets/images/01.png')}
                style={styles.productImage}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </View>

        {/* Reset onboarding – see splash and 3 steps again */}
        <Pressable
          style={({ pressed }) => [styles.resetOnboardingButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
          onPress={async () => {
            await setOnboardingCompleted(false);
            router.replace('/splash');
          }}>
          <Text style={[styles.resetOnboardingText, { color: textMuted }]}>オンボーディングをリセット</Text>
        </Pressable>
      </ScrollView>

      {/* Add reminder: time picker modal – any time (e.g. 11:45, 23:45) */}
      <Modal
        visible={addReminderVisible}
        transparent
        animationType="fade"
        onRequestClose={handleAddReminderCancel}>
        <Pressable style={[styles.modalOverlay, { backgroundColor: modalOverlayBg }]} onPress={handleAddReminderCancel}>
          <Pressable style={[styles.modalContent, { backgroundColor: surfaceColor, borderColor }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {editingReminderId ? '時刻を変更' : '時刻を選択'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: textMuted }]}>スクロールして時刻を選んでください</Text>
            <View style={styles.reminderWheelRow}>
              <ReminderTimeWheel
                values={HOURS}
                selectedValue={pickerHour}
                onSelect={setPickerHour}
                unit="時"
                textColor={textColor}
                textMuted={textMuted}
                surfaceColor={surfaceColor}
                itemHeight={pickerItemHeight}
                screenStyles={styles}
              />
              <ReminderTimeWheel
                values={MINUTES}
                selectedValue={pickerMinute}
                onSelect={setPickerMinute}
                unit="分"
                textColor={textColor}
                textMuted={textMuted}
                surfaceColor={surfaceColor}
                itemHeight={pickerItemHeight}
                screenStyles={styles}
              />
            </View>
            <Text style={[styles.timePreview, { color: textMuted }]}>
              {formatTime(Math.max(0, Math.min(23, pickerHour)), Math.max(0, Math.min(59, pickerMinute)))}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={handleAddReminderCancel}
                style={({ pressed }) => [styles.modalButton, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}>
                <Text style={[styles.modalButtonText, { color: textColor }]}>キャンセル</Text>
              </Pressable>
              <Pressable
                onPress={handleAddReminderConfirm}
                style={({ pressed }) => [styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.accent }, pressed && { opacity: 0.9 }]}>
                <Text style={[styles.modalButtonText, { color: colors.white }]}>
                  {editingReminderId ? '変更' : '追加'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

