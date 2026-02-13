/**
 * Session timer screen (design 11).
 * Circular progress ring (elapsed / remaining), "SESSION TIME" tag, time display, Pause and Complete/Cancel.
 * Ring animates smoothly with react-native-reanimated; display text still ticks every second.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';
import { addSession } from '@/lib/storage';

const DEFAULT_SESSION_MINUTES = 10;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Format seconds as M:SS or H:MM:SS for display */
function formatRemaining(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function createStyles(spacing: ScaledSpacing, scaleSize: (n: number) => number, borderRadius: ScaledBorderRadius) {
  return {
    screen: { flex: 1 as const },
    center: { flex: 1 as const, alignItems: 'center' as const, justifyContent: 'center' as const },
    ringWrap: { position: 'relative' as const },
    ringContent: { position: 'absolute' as const, alignItems: 'center' as const, justifyContent: 'center' as const },
    sessionTag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.pill,
      borderWidth: 1,
      marginBottom: spacing.sm,
    },
    sessionTagText: { fontSize: scaleSize(12), fontWeight: '700' as const, letterSpacing: 0.5 },
    timeDisplay: { fontSize: scaleSize(48), fontWeight: '700' as const, letterSpacing: 2 },
    pauseButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl * 1.5,
      borderRadius: borderRadius.pill,
      minWidth: scaleSize(240),
      gap: spacing.md,
      marginBottom: 0,
    },
    pauseButtonText: { fontSize: scaleSize(18), fontWeight: '700' as const },
    cancelButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.pill,
      minWidth: scaleSize(200),
    },
    cancelButtonText: { fontSize: scaleSize(16), fontWeight: '600' as const },
    buttonPressed: { opacity: 0.9 },
  };
}

export default function SessionTimerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, spacing, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(() => createStyles(spacing, scaleSize, borderRadius), [spacing, scaleSize, borderRadius]);
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const params = useLocalSearchParams<{ minutes?: string; seconds?: string }>();
  /** Prefer seconds (from time picker) so 1h 1m 7s is exact; fallback to minutes (e.g. recent items). */
  const totalSeconds =
    params.seconds != null
      ? Math.max(1, parseInt(params.seconds, 10) || 60)
      : (params.minutes != null ? Math.max(1, parseInt(params.minutes, 10) || DEFAULT_SESSION_MINUTES) : DEFAULT_SESSION_MINUTES) * 60;

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);

  const progress = useSharedValue(0);
  const remainingSecondsRef = useRef(remainingSeconds);
  remainingSecondsRef.current = remainingSeconds;
  const hasRecordedCompletionRef = useRef(false);

  const backgroundColor = colors.background;
  const textColor = colors.text;
  const surfaceColor = colors.surface;
  const progressRemaining = colors.progressRingRemaining;
  const progressCompleted = colors.progressRingCompleted;
  const sessionTagBg = colors.sessionTimerTagBg;
  const sessionTagTextColor = colors.sessionTimerTagText;

  /** Tick every second when not paused (for display text only) */
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setRemainingSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isPaused]);

  /** Smooth ring: run Reanimated timing when running, cancel when paused */
  useEffect(() => {
    if (isPaused) {
      cancelAnimation(progress);
      return;
    }
    const durationMs = remainingSecondsRef.current * 1000;
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.linear });
  }, [isPaused]);

  /** When timer reaches 0:00, record the full session once if >= 1 min. */
  useEffect(() => {
    if (remainingSeconds !== 0 || hasRecordedCompletionRef.current || totalSeconds < 60) return;
    hasRecordedCompletionRef.current = true;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    addSession({
      date: today,
      durationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
      durationSeconds: Math.max(1, totalSeconds),
      type: 'timer',
      completedAt: now.toISOString(),
    });
  }, [remainingSeconds, totalSeconds]);

  const elapsedSeconds = totalSeconds - remainingSeconds;

  const handleCancel = useCallback(async () => {
    if (remainingSeconds > 0 && elapsedSeconds >= 60) {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      await addSession({
        date: today,
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        durationSeconds: Math.max(1, elapsedSeconds),
        type: 'timer',
        completedAt: now.toISOString(),
      });
    }
    router.back();
  }, [remainingSeconds, elapsedSeconds, router]);

  const size = Math.min(width - spacing.lg * 2, scaleSize(320));
  const strokeThick = Math.round(size * 0.12);
  const radius = (size - strokeThick) / 2;
  const circumference = 2 * Math.PI * radius;
  /** Rotate circle so stroke starts at top (12 o'clock). */
  const rotate = `rotate(-90 ${size / 2} ${size / 2})`;

  const elapsedCircleAnimatedProps = useAnimatedProps(() => {
    const elapsedLength = circumference * progress.value;
    return {
      strokeDasharray: `${elapsedLength} ${circumference - elapsedLength}`,
    };
  });

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={[styles.center, { paddingHorizontal: spacing.lg }]}>
        {/* Circular timer ring: full circle (background) + elapsed segment on top */}
        <View style={[styles.ringWrap, { width: size, height: size, marginBottom: spacing.xxl }]}>
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            {/* Full circle background (lighter) – no gap */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={progressRemaining}
              strokeWidth={strokeThick}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              transform={rotate}
            />
            {/* Elapsed: smoother segment driven by Reanimated (60fps) */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={progressCompleted}
              strokeWidth={strokeThick}
              fill="none"
              strokeDashoffset={0}
              strokeLinecap="butt"
              transform={rotate}
              animatedProps={elapsedCircleAnimatedProps}
            />
          </Svg>
          <View style={[styles.ringContent, { width: size, height: size }]}>
            <View style={[styles.sessionTag, { backgroundColor: sessionTagBg, borderColor: sessionTagBg }]}>
              <Text style={[styles.sessionTagText, { color: sessionTagTextColor }]}>SESSION TIME</Text>
            </View>
            <Text style={[styles.timeDisplay, { color: textColor }]}>{formatRemaining(remainingSeconds)}</Text>
          </View>
        </View>

        {/* Action buttons with generous spacing */}
        <View style={{ width: '100%', maxWidth: scaleSize(320), gap: spacing.lg }}>
          <Pressable
            style={({ pressed }) => [styles.pauseButton, { backgroundColor: surfaceColor }, pressed && styles.buttonPressed]}
            onPress={() => {
              if (remainingSeconds === 0) {
                hasRecordedCompletionRef.current = false;
                remainingSecondsRef.current = totalSeconds;
                progress.value = 0;
                setRemainingSeconds(totalSeconds);
                progress.value = withTiming(1, { duration: totalSeconds * 1000, easing: Easing.linear });
                return;
              }
              setIsPaused((p) => !p);
            }}
          >
            <Text style={[styles.pauseButtonText, { color: textColor }]}>
              {isPaused || remainingSeconds === 0 ? '再開' : '一時停止'}
            </Text>
            <IconSymbol
              name={isPaused || remainingSeconds === 0 ? 'play.fill' : 'pause.fill'}
              size={scaleSize(24)}
              color={textColor}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelButton, { backgroundColor: surfaceColor }, pressed && styles.buttonPressed]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: textColor }]}>キャンセル</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

