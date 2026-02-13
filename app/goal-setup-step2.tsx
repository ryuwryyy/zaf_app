import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GoalSetupStep2Background } from '@/constants/assets';
import type { ScaledSpacing } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';

const STEP2_ORANGE = Colors.light.accent; // #F18E34

function createGoalSetupStep2Styles(spacing: ScaledSpacing, scaleSize: (n: number) => number) {
  return {
    screen: { flex: 1 as const },
    content: { flex: 1 as const, alignItems: 'center' as const },
    stepLabel: {
      fontSize: scaleSize(56),
      fontWeight: '900' as const,
      letterSpacing: 2,
      color: STEP2_ORANGE,
      marginBottom: scaleSize(48),
    },
    section5: {
      flex: 1 as const,
      alignSelf: 'stretch' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: spacing.lg,
      marginTop: scaleSize(450),
    },
    textArea: { minHeight: scaleSize(40), justifyContent: 'center' as const, paddingVertical: scaleSize(12) },
    textAreaSpacer: { flex: 1 as const, minHeight: spacing.lg },
    title: {
      fontSize: scaleSize(32),
      fontWeight: '800' as const,
      color: STEP2_ORANGE,
      textAlign: 'center' as const,
    },
    bodyLine: {
      fontSize: scaleSize(20),
      lineHeight: scaleSize(28),
      fontWeight: '600' as const,
      color: STEP2_ORANGE,
      textAlign: 'center' as const,
    },
    spacer: { flex: 1 as const, minHeight: spacing.lg },
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
 * Goal-setup STEP 2 (design6).
 * Background: 6.png. No STEP 2 label, icon, or circle.
 * Content: text under the circle (main 2 lines + supporting 3 lines), same NEXT button as STEP 1.
 */
export default function GoalSetupStep2Screen() {
  const insets = useSafeAreaInsets();
  const { width, spacing, scaleSize } = useResponsive();
  const styles = useMemo(() => createGoalSetupStep2Styles(spacing, scaleSize), [spacing, scaleSize]);
  const colorScheme = useEffectiveColorScheme();
  const buttonBg = colorScheme === 'dark' ? Colors.dark.surface : '#9E9E9E';

  const handleNext = useCallback(() => {
    router.replace('/goal-setup-step3');
  }, []);

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={GoalSetupStep2Background}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
            paddingHorizontal: spacing.lg,
          },
        ]}>
        <Text style={styles.stepLabel}>STEP 2</Text>
        <View style={styles.section5}>
          <View style={styles.textArea}>
            <Text style={styles.title}>好きな場所で、好きな時間</Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.title}>瞑想に取り組む</Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              短時間から自由に瞑想の時間を設定。
            </Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              目標に向けて、毎日少しずつでも
            </Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              好きなタイミングで取り組むことができます。
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
      </View>
    </View>
  );
}
