/**
 * Goal / progress detail screen.
 * Shown when user taps "詳しく見る" on Home. Displays goal days, current progress, and summary.
 */
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    formatRecordDate,
    formatRecordDateTime,
    getDailyMeditationTargetMinutes,
    getGoalDays,
    getProgressDaysCount,
    getSessions,
    type SessionRecord,
} from '@/lib/storage';

/** Format session duration as "X時間 Y分" for history (seconds removed per requirement). */
function formatSessionDurationHm(totalSeconds: number): string {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}時間 ${mins}分`;
  if (hours > 0) return `${hours}時間`;
  return `${mins}分`;
}

function createStyles(spacing: ScaledSpacing, typography: ScaledTypography, scaleSize: (n: number) => number, borderRadius: ScaledBorderRadius) {
  return {
    screen: { flex: 1 as const },
    header: { flexDirection: 'row' as const, alignItems: 'center' as const },
    backButton: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: spacing.sm, paddingRight: spacing.md },
    backLabel: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    headerTitle: { fontSize: typography.title.fontSize, fontWeight: '800' as const, flex: 1 as const, textAlign: 'center' as const },
    headerSpacer: { width: scaleSize(44) },
    scroll: { flex: 1 as const },
    scrollContent: { paddingTop: spacing.lg },
    card: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      marginBottom: spacing.md,
    },
    cardLabel: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, marginBottom: spacing.xs },
    cardValue: { fontSize: scaleSize(24), fontWeight: '800' as const },
    sectionTitle: { fontSize: typography.title.fontSize, fontWeight: '800' as const, marginTop: spacing.xl, marginBottom: spacing.md },
    sectionSubtitle: { fontSize: typography.body.fontSize, fontWeight: '700' as const, marginBottom: spacing.md },
    historyHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 1,
      marginBottom: spacing.xs,
    },
    historyHeaderText: { fontSize: scaleSize(17), fontWeight: '700' as const },
    emptyHistory: { fontSize: typography.body.fontSize, paddingVertical: spacing.lg },
    historyRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    historyLeft: { flex: 1 as const },
    historyDate: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    historyTime: { fontSize: typography.label.fontSize, fontWeight: '500' as const, marginTop: scaleSize(2) },
    historyDuration: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
  };
}

export default function GoalDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(() => createStyles(spacing, typography, scaleSize, borderRadius), [spacing, typography, scaleSize, borderRadius]);
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const [goalDays, setGoalDays] = useState(0);
  const [progressDays, setProgressDays] = useState(0);
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [goal, targetMinutes, sessions] = await Promise.all([
        getGoalDays(),
        getDailyMeditationTargetMinutes(),
        getSessions(),
      ]);
      if (!cancelled) {
        setGoalDays(goal);
        setProgressDays(getProgressDaysCount(sessions, targetMinutes));
        const sorted = [...sessions].sort((a, b) => {
          const at = a.completedAt ?? `${a.date}T00:00:00`;
          const bt = b.completedAt ?? `${b.date}T00:00:00`;
          return bt.localeCompare(at);
        });
        setHistory(sorted);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = Math.max(0, goalDays - progressDays);
  const percent = goalDays > 0 ? Math.min(100, Math.round((progressDays / goalDays) * 100)) : 0;

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top + spacing.xl }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          accessibilityLabel="Back to Home">
          <IconSymbol name="chevron.left" size={scaleSize(24)} color={textColor} />
          <Text style={[styles.backLabel, { color: textColor }]}>戻る</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>目標達成の詳細</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl, paddingHorizontal: spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.cardLabel, { color: textMuted }]}>目標日数</Text>
          <Text style={[styles.cardValue, { color: textColor }]}>{goalDays}日間</Text>
        </View>
        <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.cardLabel, { color: textMuted }]}>達成日数</Text>
          <Text style={[styles.cardValue, { color: textColor }]}>{progressDays}日</Text>
        </View>
        <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.cardLabel, { color: textMuted }]}>残り</Text>
          <Text style={[styles.cardValue, { color: textColor }]}>{remaining}日</Text>
        </View>
        <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.cardLabel, { color: textMuted }]}>達成率</Text>
          <Text style={[styles.cardValue, { color: textColor }]}>{percent}%</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>進捗履歴</Text>
        <Text style={[styles.sectionSubtitle, { color: textMuted }]}>
          日付・時刻はその日に進捗を記録したときのものです
        </Text>
        {history.length === 0 ? (
          <Text style={[styles.emptyHistory, { color: textMuted, fontSize: typography.body.fontSize, paddingVertical: spacing.lg }]}>まだ記録がありません</Text>
        ) : (
          <>
            <View style={[styles.historyHeader, { borderBottomColor: borderColor, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, marginBottom: spacing.xs }]}>
              <Text style={[styles.historyHeaderText, { color: textMuted, fontSize: scaleSize(17) }]}>日付・時刻</Text>
              <Text style={[styles.historyHeaderText, { color: textMuted, fontSize: scaleSize(17) }]}>時間</Text>
            </View>
            {history.map((session, index) => {
              const hasTime = session.completedAt != null;
              const dateStr = hasTime
                ? formatRecordDateTime(session.completedAt!).dateStr
                : formatRecordDate(session.date);
              const timeStr = hasTime ? formatRecordDateTime(session.completedAt!).timeStr : '—';
              return (
                <View
                  key={`${session.date}-${session.completedAt ?? ''}-${index}`}
                  style={[styles.historyRow, index < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historyDate, { color: textColor }]}>{dateStr}</Text>
                    <Text style={[styles.historyTime, { color: textMuted }]}>
                      {hasTime ? timeStr : '時刻なし'}
                    </Text>
                  </View>
                  <Text style={[styles.historyDuration, { color: textMuted }]}>
                    {formatSessionDurationHm(session.durationSeconds ?? session.durationMinutes * 60)}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

