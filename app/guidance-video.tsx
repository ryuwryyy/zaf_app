/**
 * Guidance video detail screen (design 13).
 * Video thumbnail, title, duration, description, はじめる (Start) and キャンセル (Cancel) buttons.
 */
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';

const DEFAULT_TITLE = '【ビギナー向け】 座禅のいろは';
const DEFAULT_DURATION = '12分';
const DEFAULT_DESCRIPTION =
  'これから坐禅を始める方や、坐禅のやり方をおさらいしたい方に向けて、丁寧にガイダンスを行います。';

function createStyles(spacing: ScaledSpacing, typography: ScaledTypography, scaleSize: (n: number) => number, borderRadius: ScaledBorderRadius) {
  return {
    screen: { flex: 1 as const },
    scroll: { flex: 1 as const },
    scrollContent: { paddingTop: spacing.lg, alignItems: 'center' as const },
    contentBlock: { alignSelf: 'center' as const, alignItems: 'stretch' as const },
    videoWrap: { alignSelf: 'center' as const, overflow: 'hidden' as const, borderRadius: borderRadius.md },
    videoThumb: { borderRadius: borderRadius.md },
    videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' as const, alignItems: 'flex-end' as const, padding: spacing.sm },
    fullscreenRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.pill,
    },
    fullscreenText: { fontSize: typography.label.fontSize, color: '#FFFFFF', fontWeight: '500' as const },
    videoTitle: { fontSize: typography.title.fontSize, fontWeight: '700' as const, marginBottom: spacing.xs, textAlign: 'left' as const },
    videoDuration: { fontSize: typography.body.fontSize, fontWeight: '500' as const, marginBottom: spacing.md, textAlign: 'left' as const },
    videoDescription: { fontSize: typography.body.fontSize, lineHeight: scaleSize(24), marginBottom: spacing.xl, textAlign: 'left' as const },
    startButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      gap: spacing.sm,
      alignSelf: 'stretch' as const,
    },
    startButtonText: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, color: '#FFFFFF' },
    cancelButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      alignSelf: 'stretch' as const,
    },
    cancelButtonText: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    buttonPressed: { opacity: 0.9 },
  };
}

export default function GuidanceVideoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(() => createStyles(spacing, typography, scaleSize, borderRadius), [spacing, typography, scaleSize, borderRadius]);
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = colors.surface;
  const accentOrange = colors.accent;

  /** Video thumbnail ~90–95% of content width (design 13) */
  const videoWidth = width - spacing.lg * 2;
  const videoHeight = videoWidth * (9 / 16);

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top + spacing.xl }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.xxl,
            paddingHorizontal: spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Video thumbnail (design 13) */}
        <View style={[styles.videoWrap, { width: videoWidth, height: videoHeight, marginBottom: spacing.lg }]}>
          <Image
            source={require('@/assets/images/8-1.png')}
            style={[styles.videoThumb, { width: videoWidth, height: videoHeight }]}
            resizeMode="cover"
          />
          <View style={styles.videoOverlay}>
            <View style={styles.fullscreenRow}>
              <IconSymbol name="fullscreen" size={scaleSize(18)} color="#FFFFFF" />
              <Text style={styles.fullscreenText}>全画面表示にする</Text>
            </View>
          </View>
        </View>

        {/* Content block: left-aligned text, full-width buttons (design 13) */}
        <View style={[styles.contentBlock, { width: videoWidth }]}>
          <Text style={[styles.videoTitle, { color: textColor }]}>{DEFAULT_TITLE}</Text>
          <Text style={[styles.videoDuration, { color: textMuted }]}>{DEFAULT_DURATION}</Text>
          <Text style={[styles.videoDescription, { color: textMuted }]}>{DEFAULT_DESCRIPTION}</Text>

          <Pressable
            style={({ pressed }) => [styles.startButton, { backgroundColor: accentOrange }, pressed && styles.buttonPressed]}
            onPress={() => router.push('/session-timer')}>
            <Text style={styles.startButtonText}>はじめる</Text>
            <IconSymbol name="play.fill" size={scaleSize(22)} color={colors.white} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelButton, { backgroundColor: surfaceColor }, pressed && styles.buttonPressed]}
            onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: textColor }]}>キャンセル</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

