/**
 * ZAF product detail screen.
 * Shown when user taps a product card on Mission Setting. Displays product info (placeholder content).
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';

const PRODUCTS: Record<string, { title: string; description: string }> = {
  '1': { title: 'ZAF Product 1', description: '瞑想とマインドフルネスをサポートする商品です。日々の練習にお役立てください。' },
  '2': { title: 'ZAF Product 2', description: '心地よい音や香りで、瞑想の環境を整えましょう。' },
  '3': { title: 'ZAF Product 3', description: '瞑想の記録や習慣づけをサポートするツールです。' },
  '4': { title: 'ZAF Product 4', description: 'より深い瞑想体験のためのアイテムをご紹介しています。' },
};

function createStyles(spacing: ScaledSpacing, typography: ScaledTypography, scaleSize: (n: number) => number, borderRadius: ScaledBorderRadius) {
  return {
    screen: { flex: 1 as const },
    header: { flexDirection: 'row' as const, alignItems: 'center' as const },
    backButton: { flexDirection: 'row' as const, alignItems: 'center' as const, marginRight: spacing.sm },
    backLabel: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const },
    headerTitle: { flex: 1 as const, fontSize: typography.title.fontSize, fontWeight: '800' as const, textAlign: 'center' as const },
    headerSpacer: { width: scaleSize(80) },
    scroll: { flex: 1 as const },
    scrollContent: { paddingTop: spacing.md },
    imageWrap: {
      width: '100%' as const,
      aspectRatio: 1,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      overflow: 'hidden' as const,
      marginBottom: spacing.lg,
    },
    productImage: { width: '100%' as const, height: '100%' as const },
    productTitle: { fontSize: typography.title.fontSize, fontWeight: '800' as const, marginBottom: spacing.sm },
    productDescription: { fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight },
  };
}

export default function ZafProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '1';
  const product = PRODUCTS[id] ?? PRODUCTS['1'];
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(() => createStyles(spacing, typography, scaleSize, borderRadius), [spacing, typography, scaleSize, borderRadius]);

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top + spacing.xl }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          accessibilityLabel="戻る">
          <IconSymbol name="chevron.left" size={scaleSize(24)} color={textColor} />
          <Text style={[styles.backLabel, { color: textColor }]}>戻る</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>ZAF PRODUCTS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.xxl, paddingHorizontal: spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.imageWrap, { backgroundColor: surfaceColor, borderColor }]}>
          <Image
            source={require('@/assets/images/01.png')}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
        <Text style={[styles.productTitle, { color: textColor }]}>{product.title}</Text>
        <Text style={[styles.productDescription, { color: textMuted }]}>{product.description}</Text>
      </ScrollView>
    </View>
  );
}

