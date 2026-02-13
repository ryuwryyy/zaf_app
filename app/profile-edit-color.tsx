/**
 * Edit color/theme preference screen.
 * Used from Profile > カラーを設定する. Saves preference to storage and goes back.
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useThemePreference } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    getColorSchemePreference,
    setColorSchemePreference,
    type ColorSchemePreference,
} from '@/lib/storage';

const OPTIONS: { key: ColorSchemePreference; label: string }[] = [
  { key: 'light', label: 'ライト' },
  { key: 'dark', label: 'ダーク' },
  { key: 'system', label: 'システムに従う' },
];

function createProfileEditColorStyles(
  spacing: ScaledSpacing,
  typography: ScaledTypography,
  scaleSize: (n: number) => number,
  borderRadius: ScaledBorderRadius
) {
  return {
    screen: { flex: 1 as const },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.md,
    },
    backButton: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingRight: spacing.md },
    backLabel: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    headerTitle: {
      fontSize: typography.subhead.fontSize,
      fontWeight: '700' as const,
      flex: 1 as const,
      textAlign: 'center' as const,
    },
    headerSpacer: { width: scaleSize(80) },
    content: { paddingTop: spacing.xl },
    label: { fontSize: typography.label.fontSize, fontWeight: '500' as const, marginBottom: spacing.lg },
    optionRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      marginBottom: spacing.md,
    },
    optionLabel: { fontSize: typography.subhead.fontSize, fontWeight: '600' as const },
    checkIcon: { opacity: 0.8 },
  };
}

export default function ProfileEditColorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPreference } = useThemePreference();
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(
    () => createProfileEditColorStyles(spacing, typography, scaleSize, borderRadius),
    [spacing, typography, scaleSize, borderRadius]
  );
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const [selected, setSelected] = useState<ColorSchemePreference>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getColorSchemePreference().then((pref) => {
      if (!cancelled) {
        setSelected(pref);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = useCallback(
    async (pref: ColorSchemePreference) => {
      setSelected(pref);
      await setColorSchemePreference(pref);
      setPreference(pref);
      router.back();
    },
    [router, setPreference]
  );

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top + spacing.xl }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { paddingRight: spacing.md }, pressed && { opacity: 0.7 }]}
          accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={24} color={textColor} />
          <Text style={[styles.backLabel, { color: textColor, fontSize: typography.body.fontSize }]}>戻る</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor, fontSize: typography.subhead.fontSize }]}>カラーを設定する</Text>
        <View style={[styles.headerSpacer, { width: scaleSize(80) }]} />
      </View>

      <View style={[styles.content, { paddingHorizontal: spacing.lg, paddingTop: spacing.xl }]}>
        <Text style={[styles.label, { color: textMuted, fontSize: typography.label.fontSize, marginBottom: spacing.lg }]}>テーマを選んでください</Text>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => !loading && handleSelect(opt.key)}
            style={({ pressed }) => [
              styles.optionRow,
              { borderColor, backgroundColor: selected === opt.key ? surfaceColor : 'transparent', paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
              pressed && { opacity: 0.85 },
            ]}>
            <Text style={[styles.optionLabel, { color: textColor, fontSize: typography.subhead.fontSize }]}>{opt.label}</Text>
            {selected === opt.key && (
              <IconSymbol name="check" size={scaleSize(22)} color={textColor} style={styles.checkIcon} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
