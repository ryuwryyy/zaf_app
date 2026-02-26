import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ListRenderItem,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ONBOARDING_SLIDES, type OnboardingSlide } from '@/constants/onboarding';
import type { ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';

function createOnboardingStyles(
  spacing: ScaledSpacing,
  typography: ScaledTypography,
  scaleSize: (n: number) => number
) {
  return {
    slide: { flex: 1 as const },
    content: { flex: 1 as const, justifyContent: 'space-between' as const },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' as const },
    copy: { flex: 0 as const, paddingRight: spacing.lg },
    headline: {
      fontSize: scaleSize(26),
      fontWeight: '600' as const,
      color: '#fff' as const,
      lineHeight: scaleSize(36),
      letterSpacing: 2,
      marginBottom: scaleSize(24),
    },
    /** Two-line title (slide 2): same line spacing as section1Slide3 */
    headlineTwoLines: {
      fontSize: scaleSize(26),
      fontWeight: '600' as const,
      color: '#fff' as const,
      lineHeight: scaleSize(34),
      letterSpacing: 2,
      marginBottom: scaleSize(24),
    },
    section1Slide3: {
      fontSize: scaleSize(24),
      lineHeight: scaleSize(34),
      letterSpacing: 2.5,
      fontWeight: '600' as const,
      color: '#fff' as const,
      marginBottom: scaleSize(24),
    },
    redLabel: {
      fontSize: scaleSize(26),
      fontWeight: '700' as const,
      color: '#E53935' as const,
      marginBottom: scaleSize(6),
    },
    redLabelInline: { color: '#fff' as const, opacity: 0.95 },
    subhead: {
      fontSize: scaleSize(28),
      fontWeight: '600' as const,
      color: '#fff' as const,
      letterSpacing: 2.5,
      marginBottom: scaleSize(24),
    },
    body: {
      fontSize: scaleSize(20),
      color: '#fff' as const,
      lineHeight: scaleSize(34),
      letterSpacing: 2,
      opacity: 0.95,
      marginBottom: scaleSize(32),
    },
    spacer: { flex: 1 as const, minHeight: scaleSize(32) },
    footer: { alignItems: 'center' as const },
    pagination: { flexDirection: 'row' as const, gap: scaleSize(12), marginBottom: scaleSize(24) },
    dot: {
      width: scaleSize(9),
      height: scaleSize(9),
      borderRadius: scaleSize(5),
      backgroundColor: 'rgba(255,255,255,0.5)' as const,
    },
    dotActive: {
      backgroundColor: '#fff' as const,
      width: scaleSize(11),
      height: scaleSize(11),
      borderRadius: scaleSize(6),
    },
    nextButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: scaleSize(28),
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.8)' as const,
      backgroundColor: 'rgba(255,255,255,0.2)' as const,
    },
    nextButtonPressed: { opacity: 0.85 },
    nextButtonText: {
      fontSize: scaleSize(26),
      fontWeight: '700' as const,
      color: '#fff' as const,
    },
    nextButtonArrow: { marginLeft: spacing.sm },
  };
}

/**
 * Onboarding carousel (designs 2–4).
 * Three intro screens with full-bleed background, headline/body, pagination dots, NEXT.
 * Last NEXT → goal-setup (Step 5).
 */
export default function OnboardingScreen() {
  const { width, spacing, typography, scaleSize } = useResponsive();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createOnboardingStyles(spacing, typography, scaleSize),
    [spacing, typography, scaleSize]
  );
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      router.replace('/goal-setup');
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex((i) => i + 1);
  }, [index, isLast]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / width);
      if (i >= 0 && i < ONBOARDING_SLIDES.length && i !== index) setIndex(i);
    },
    [width, index]
  );

  const renderItem: ListRenderItem<OnboardingSlide> = useCallback(
    ({ item }) => (
      <View style={[styles.slide, { width }]}>
        <ImageBackground
          source={item.background}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.overlay} pointerEvents="none" />
          <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.xxl,
              paddingHorizontal: spacing.lg,
            },
          ]}>
          <View style={styles.copy}>
            {item.id === '3' ? (
              <>
                <Text style={styles.section1Slide3}>
                  {item.headline}
                </Text>
                {item.body ? (
                  <Text style={styles.body}>{item.body}</Text>
                ) : null}
              </>
            ) : (
              <>
                {item.subhead != null && item.redLabel == null ? (
                  <Text style={styles.headlineTwoLines}>
                    {item.headline}
                    {'\n'}
                    {item.subhead}
                  </Text>
                ) : (
                  <Text style={styles.headline}>
                    {item.headline}
                  </Text>
                )}
                {item.bodyBeforeRed != null && item.bodyAfterRed != null && item.redLabel != null ? (
                  <Text style={styles.body}>
                    {item.bodyBeforeRed}
                    <Text style={styles.redLabelInline}>{item.redLabel}</Text>
                    {item.bodyAfterRed}
                  </Text>
                ) : (
                  <>
                    {item.redLabel != null && (
                      <Text style={styles.redLabel}>{item.redLabel}</Text>
                    )}
                    {item.subhead != null && item.redLabel != null && (
                      <Text style={styles.subhead}>{item.subhead}</Text>
                    )}
                    {item.body ? (
                      <Text style={styles.body}>{item.body}</Text>
                    ) : null}
                  </>
                )}
              </>
            )}
          </View>
          <View style={styles.spacer} />
          <View style={styles.footer}>
            <View style={styles.pagination}>
              {ONBOARDING_SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === index && styles.dotActive]}
                />
              ))}
            </View>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                { width: Math.min(width * 0.6, scaleSize(280)) },
                pressed && styles.nextButtonPressed,
              ]}>
              <Text style={styles.nextButtonText}>NEXT</Text>
              <IconSymbol
                name="chevron.right"
                size={20}
                color="#fff"
                style={styles.nextButtonArrow}
              />
            </Pressable>
          </View>
        </View>
      </View>
    ),
    [index, insets, handleNext, width, spacing, styles]
  );

  return (
    <FlatList
      ref={listRef}
      data={ONBOARDING_SLIDES}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      getItemLayout={
        width > 0
          ? (_, i) => ({ length: width, offset: width * i, index: i })
          : undefined
      }
    />
  );
}
