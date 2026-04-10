/**
 * ZAF product detail screen.
 * Shown when user taps a product card on Mission Setting. Displays product info (placeholder content).
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getZafProductById, type ZafProduct } from '@/lib/zaf-products';

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
  const params = useLocalSearchParams<{ id?: string; title?: string; description?: string; imageUrl?: string }>();
  const id = params.id ?? '1';
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(() => createStyles(spacing, typography, scaleSize, borderRadius), [spacing, typography, scaleSize, borderRadius]);
  const initialProduct = useMemo<ZafProduct | null>(() => {
    if (!params.title || !params.description) return null;
    return {
      id: String(id),
      title: String(params.title),
      description: String(params.description),
      imageUrl: params.imageUrl ? String(params.imageUrl) : undefined,
      enabled: true,
      sortOrder: Number.MAX_SAFE_INTEGER,
    };
  }, [id, params.description, params.imageUrl, params.title]);
  const [product, setProduct] = useState<ZafProduct | null>(initialProduct);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setProduct(initialProduct);
    setIsLoading(!initialProduct);
    setImageFailed(false);
  }, [initialProduct]);

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const next = await getZafProductById(String(id));
      if (!cancelled) {
        setProduct(next);
        setImageFailed(false);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
          {isLoading && !product ? (
            <View style={[styles.productImage, { backgroundColor: borderColor }]} />
          ) : (
            <Image
              source={
                product?.imageUrl && !imageFailed
                  ? { uri: product.imageUrl }
                  : require('@/assets/images/01.png')
              }
              style={styles.productImage}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          )}
        </View>
        <Text style={[styles.productTitle, { color: textColor }]}>{product?.title ?? 'ZAF Product'}</Text>
        <Text style={[styles.productDescription, { color: textMuted }]}>
          {product?.description ?? 'Product details are not available yet.'}
        </Text>
      </ScrollView>
    </View>
  );
}

