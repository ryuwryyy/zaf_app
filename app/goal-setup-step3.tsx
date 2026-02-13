import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GoalSetupStep3Background } from '@/constants/assets';
import type { ScaledSpacing } from '@/constants/responsive';
import { Colors } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { getAppUsageStartDate, setAppUsageStartDate, setOnboardingCompleted } from '@/lib/storage';

const STEP3_ORANGE = Colors.light.accent; // #F18E34

function createGoalSetupStep3Styles(spacing: ScaledSpacing, scaleSize: (n: number) => number) {
  return {
    screen: { flex: 1 as const },
    content: { flex: 1 as const, alignItems: 'center' as const },
    stepLabel: {
      fontSize: scaleSize(56),
      fontWeight: '900' as const,
      letterSpacing: 2,
      color: STEP3_ORANGE,
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
      color: STEP3_ORANGE,
      textAlign: 'center' as const,
    },
    bodyLine: {
      fontSize: scaleSize(20),
      lineHeight: scaleSize(28),
      fontWeight: '600' as const,
      color: STEP3_ORANGE,
      textAlign: 'center' as const,
    },
    spacer: { flex: 1 as const, minHeight: spacing.lg },
    startButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: scaleSize(28),
      backgroundColor: STEP3_ORANGE,
      overflow: 'hidden' as const,
    },
    startButtonPressed: { opacity: 0.85 },
    startButtonText: {
      fontSize: scaleSize(26),
      fontWeight: '700' as const,
      color: '#fff' as const,
    },
    startButtonArrow: { marginLeft: spacing.sm },
  };
}

/**
 * Goal-setup STEP 3 (design 7.png).
 * Background: 7.png (bar chart icon in circle).
 * Content: STEP 3 label, Japanese copy below the icon, START button → tabs.
 */
export default function GoalSetupStep3Screen() {
  const insets = useSafeAreaInsets();
  const { width, spacing, scaleSize } = useResponsive();
  const styles = useMemo(() => createGoalSetupStep3Styles(spacing, scaleSize), [spacing, scaleSize]);

  const handleStart = useCallback(async () => {
    const existing = await getAppUsageStartDate();
    if (!existing) {
      await setAppUsageStartDate(new Date().toISOString().slice(0, 10));
    }
    await setOnboardingCompleted(true);
    router.replace('/(tabs)');
  }, []);

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={GoalSetupStep3Background}
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
        <Text style={styles.stepLabel}>STEP 3</Text>
        <View style={styles.section5}>
          <View style={styles.textArea}>
            <Text style={styles.title}>習慣を見える化して</Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.title}>次のモチベーションへ</Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              瞑想を通したあなたの習慣を記録します。
            </Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              客観的視点からの統計が、
            </Text>
          </View>
          <View style={styles.textArea}>
            <Text style={styles.bodyLine}>
              自分と向き合うバロメーターとなります。
            </Text>
          </View>
          <View style={styles.textAreaSpacer} />
        </View>
        <View style={styles.spacer} />
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startButton,
            { width: Math.min(width * 0.6, scaleSize(280)) },
            pressed && styles.startButtonPressed,
          ]}>
          <Text style={styles.startButtonText}>START</Text>
          <IconSymbol
            name="chevron.right"
            size={20}
            color="#fff"
            style={styles.startButtonArrow}
          />
        </Pressable>
      </View>
    </View>
  );
}
