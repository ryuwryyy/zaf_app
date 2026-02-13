/**
 * Edit display name screen.
 * Used from Profile > ユーザー名を設定する. Saves to storage and goes back.
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getDisplayName, setDisplayName } from '@/lib/storage';

function createProfileEditNameStyles(
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
    label: { fontSize: typography.label.fontSize, fontWeight: '500' as const, marginBottom: spacing.sm },
    input: {
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      fontSize: typography.subhead.fontSize,
      marginBottom: spacing.xl,
    },
    saveButton: {
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center' as const,
    },
    saveButtonText: {
      fontSize: typography.subhead.fontSize,
      fontWeight: '700' as const,
      color: '#FFFFFF' as const,
    },
  };
}

export default function ProfileEditNameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(
    () => createProfileEditNameStyles(spacing, typography, scaleSize, borderRadius),
    [spacing, typography, scaleSize, borderRadius]
  );
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDisplayName().then((value) => {
      if (!cancelled) {
        setName(value);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = useCallback(async () => {
    await setDisplayName(name.trim() || 'S.TAROU');
    router.back();
  }, [name, router]);

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
        <Text style={[styles.headerTitle, { color: textColor, fontSize: typography.subhead.fontSize }]}>ユーザー名を設定</Text>
        <View style={[styles.headerSpacer, { width: scaleSize(80) }]} />
      </View>

      <View style={[styles.content, { paddingHorizontal: spacing.lg, paddingTop: spacing.xl }]}>
        <Text style={[styles.label, { color: textMuted, fontSize: typography.label.fontSize, marginBottom: spacing.sm }]}>表示名</Text>
        <TextInput
          style={[styles.input, { color: textColor, borderColor, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, fontSize: typography.subhead.fontSize, marginBottom: spacing.xl }]}
          value={name}
          onChangeText={setName}
          placeholder="名前を入力"
          placeholderTextColor={textMuted}
          editable={!loading}
          autoCapitalize="words"
        />
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: '#E65100' },
            pressed && { opacity: 0.9 },
          ]}>
          <Text style={[styles.saveButtonText, { fontSize: typography.subhead.fontSize }]}>保存</Text>
        </Pressable>
      </View>
    </View>
  );
}
