import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GoalSetupStep1Background } from '@/constants/assets';
import type { ScaledSpacing } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';

const STEP1_ORANGE = Colors.light.accent; // #F18E34

function createGoalSetupStep1Styles(spacing: ScaledSpacing, scaleSize: (n: number) => number) {
  return {
    screen: { flex: 1 as const },
    content: { flex: 1 as const, alignItems: 'center' as const },
    stepLabel: {
      fontSize: scaleSize(56),
      fontWeight: '900' as const,
      letterSpacing: 2,
      color: STEP1_ORANGE,
      marginBottom: scaleSize(48),
    },
    section5: {
      alignSelf: 'stretch' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: spacing.lg,
    },
    textArea: { minHeight: scaleSize(40), justifyContent: 'center' as const, paddingVertical: scaleSize(12) },
    textAreaSpacer: { minHeight: spacing.lg },
    title: {
      fontSize: scaleSize(32),
      fontWeight: '800' as const,
      color: STEP1_ORANGE,
      textAlign: 'center' as const,
    },
    bodyLine: {
      fontSize: scaleSize(20),
      lineHeight: scaleSize(28),
      fontWeight: '600' as const,
      color: STEP1_ORANGE,
      textAlign: 'center' as const,
    },
    spacer: { flex: 1 as const, minHeight: spacing.xl },
    nextButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: scaleSize(28),
      overflow: 'hidden' as const,
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
 * Goal-setup STEP 1 (design5).
 * Background: 05-1.png. Content: STEP 1, flag icon, title, body (red letters = same as next).
 */
export default function GoalSetupScreen() {
  const insets = useSafeAreaInsets();
  const { width, height, spacing, scaleSize } = useResponsive();
  const styles = useMemo(() => createGoalSetupStep1Styles(spacing, scaleSize), [spacing, scaleSize]);
  const colorScheme = useEffectiveColorScheme();
  const buttonBg = colorScheme === 'dark' ? Colors.dark.surface : '#9E9E9E';
  // Space below STEP 1 so text block clears the icon circle (no overlap)
  const sectionTopMargin = Math.min(scaleSize(350), height * 0.34);

  const handleNext = useCallback(() => {
    router.replace('/goal-setup-step2');
  }, []);

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={GoalSetupStep1Background}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          {
            flexGrow: 1,
            paddingTop: Math.max(insets.top, scaleSize(28)) + spacing.xl,
            paddingBottom: insets.bottom + scaleSize(48),
            paddingHorizontal: spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>STEP 1</Text>
        <View style={[styles.section5, { marginTop: sectionTopMargin, paddingTop: scaleSize(36) }]}>
          <View style={styles.textArea}>
            <Text style={styles.title}>目標を決めましょう</Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              まずはじめに、瞑想を何日つづけるか
            </Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              無理のない範囲で目標を立てることで
            </Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              習慣化をサポートします。
            </Text>
          </View>
          <View style={styles.textAreaSpacer} />
        </View>
        <View style={styles.spacer} />
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            { width: Math.min(width * 0.6, scaleSize(280)), backgroundColor: buttonBg },
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
      </ScrollView>
    </View>
  );
}
