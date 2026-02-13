/**
 * Edit profile icon screen.
 * Used from Profile > アイコンを設定する. Preset icons + add/delete custom images.
 */
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useThemeAlert } from '@/contexts/ThemeAlertContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    addCustomProfileImage,
    getCustomProfileImages,
    getProfileIcon,
    removeCustomProfileImage,
    setProfileIcon,
    type CustomProfileImage,
} from '@/lib/storage';

const PRESET_OPTIONS = [
  { key: 'person', label: '人物' },
  { key: 'self-improvement', label: '瞑想' },
  { key: 'settings', label: '設定' },
  { key: 'house.fill', label: 'ホーム' },
] as const;

const CUSTOM_PREFIX = 'custom:';

function createProfileEditIconStyles(
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
    scroll: { flex: 1 as const },
    content: { paddingTop: spacing.xl },
    label: { fontSize: typography.label.fontSize, fontWeight: '500' as const, marginBottom: spacing.lg },
    sectionLabel: {
      fontSize: typography.label.fontSize,
      fontWeight: '500' as const,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.lg },
    iconCell: {
      width: '45%' as const,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      padding: spacing.lg,
      alignItems: 'center' as const,
    },
    iconCircle: {
      width: scaleSize(72),
      height: scaleSize(72),
      borderRadius: scaleSize(36),
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: spacing.sm,
      overflow: 'hidden' as const,
    },
    iconCircleImage: { padding: 0 },
    customImage: {
      width: scaleSize(72),
      height: scaleSize(72),
      borderRadius: scaleSize(36),
    },
    iconLabel: { fontSize: typography.label.fontSize, fontWeight: '600' as const },
    deleteButton: {
      position: 'absolute' as const,
      top: spacing.sm,
      right: spacing.sm,
      width: scaleSize(28),
      height: scaleSize(28),
      borderRadius: scaleSize(14),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      zIndex: 1,
    },
    addCell: {
      width: '100%' as const,
      maxWidth: scaleSize(200),
      alignSelf: 'center' as const,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      padding: spacing.xl,
      alignItems: 'center' as const,
    },
    addCircle: { borderStyle: 'dashed' as const },
  };
}

export default function ProfileEditIconScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(
    () => createProfileEditIconStyles(spacing, typography, scaleSize, borderRadius),
    [spacing, typography, scaleSize, borderRadius]
  );
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const showAlert = useThemeAlert().showAlert;

  const [selectedKey, setSelectedKey] = useState<string>('person');
  const [customImages, setCustomImages] = useState<CustomProfileImage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [icon, custom] = await Promise.all([getProfileIcon(), getCustomProfileImages()]);
    setCustomImages(custom);
    const validPreset = PRESET_OPTIONS.some((o) => o.key === icon);
    const validCustom = icon.startsWith(CUSTOM_PREFIX) && custom.some((img) => `custom:${img.id}` === icon);
    if (validPreset) setSelectedKey(icon);
    else if (validCustom) setSelectedKey(icon);
    else setSelectedKey('person');
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    load().then(() => {
      if (!cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleSelectPreset = useCallback(
    async (key: string) => {
      setSelectedKey(key);
      await setProfileIcon(key);
      router.back();
    },
    [router]
  );

  const handleSelectCustom = useCallback(
    async (id: string) => {
      const key = `${CUSTOM_PREFIX}${id}`;
      setSelectedKey(key);
      await setProfileIcon(key);
      router.back();
    },
    [router]
  );

  const handleAddImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('アクセスできません', 'フォトライブラリへのアクセスを許可してください。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    await addCustomProfileImage(asset.uri);
    await load();
  }, [load, showAlert]);

  const handleDeleteCustom = useCallback(
    (id: string, e?: { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
      showAlert('画像を削除', 'この画像を削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await removeCustomProfileImage(id);
            await load();
          },
        },
      ]);
    },
    [load, showAlert]
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
        <Text style={[styles.headerTitle, { color: textColor, fontSize: typography.subhead.fontSize }]}>アイコンを設定する</Text>
        <View style={[styles.headerSpacer, { width: scaleSize(80) }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: textMuted, fontSize: typography.label.fontSize, marginBottom: spacing.lg }]}>アイコンを選んでください</Text>

        {/* Preset icons */}
        <View style={[styles.grid, { gap: spacing.lg }]}>
          {PRESET_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => !loading && handleSelectPreset(option.key)}
              style={({ pressed }) => [
                styles.iconCell,
                { borderColor, backgroundColor: selectedKey === option.key ? surfaceColor : 'transparent', padding: spacing.lg },
                pressed && { opacity: 0.85 },
              ]}>
              <View style={[styles.iconCircle, { borderColor, width: scaleSize(72), height: scaleSize(72), borderRadius: scaleSize(36), marginBottom: spacing.sm }]}>
                <IconSymbol
                  name={option.key as 'person' | 'self-improvement' | 'settings' | 'house.fill'}
                  size={scaleSize(36)}
                  color={textColor}
                />
              </View>
              <Text style={[styles.iconLabel, { color: textColor, fontSize: typography.label.fontSize }]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Custom images */}
        {customImages.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: textMuted, fontSize: typography.label.fontSize, marginTop: spacing.xl, marginBottom: spacing.md }]}>追加した画像</Text>
            <View style={[styles.grid, { gap: spacing.lg }]}>
              {customImages.map((img) => (
                <Pressable
                  key={img.id}
                  onPress={() => !loading && handleSelectCustom(img.id)}
                  style={({ pressed }) => [
                    styles.iconCell,
                    { borderColor, backgroundColor: selectedKey === `custom:${img.id}` ? surfaceColor : 'transparent', padding: spacing.lg },
                    pressed && { opacity: 0.85 },
                  ]}>
                  <Pressable
                    style={[styles.deleteButton, { backgroundColor: 'rgba(0,0,0,0.5)', top: spacing.sm, right: spacing.sm, width: scaleSize(28), height: scaleSize(28), borderRadius: scaleSize(14) }]}
                    onPress={(e) => handleDeleteCustom(img.id, e)}
                    hitSlop={8}>
                    <IconSymbol name="close" size={scaleSize(18)} color="#fff" />
                  </Pressable>
                  <View style={[styles.iconCircle, styles.iconCircleImage, { borderColor, width: scaleSize(72), height: scaleSize(72), borderRadius: scaleSize(36), marginBottom: spacing.sm }]}>
                    <Image source={{ uri: img.uri }} style={[styles.customImage, { width: scaleSize(72), height: scaleSize(72), borderRadius: scaleSize(36) }]} />
                  </View>
                  <Text style={[styles.iconLabel, { color: textColor, fontSize: typography.label.fontSize }]} numberOfLines={1}>画像</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Add image card */}
        <Text style={[styles.sectionLabel, { color: textMuted, fontSize: typography.label.fontSize, marginTop: spacing.xl, marginBottom: spacing.md }]}>
          {customImages.length > 0 ? '画像を追加' : '画像を追加する'}
        </Text>
        <Pressable
          onPress={() => !loading && handleAddImage()}
          style={({ pressed }) => [
            styles.addCell,
            { borderColor, borderStyle: 'dashed', backgroundColor: 'transparent', padding: spacing.xl },
            pressed && { opacity: 0.85 },
          ]}>
          <View style={[styles.iconCircle, styles.addCircle, { borderColor, width: scaleSize(72), height: scaleSize(72), borderRadius: scaleSize(36), marginBottom: spacing.sm }]}>
            <IconSymbol name="plus" size={scaleSize(40)} color={textMuted} />
          </View>
          <Text style={[styles.iconLabel, { color: textMuted, fontSize: typography.label.fontSize }]}>画像を追加</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
