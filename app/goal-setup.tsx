import { router } from 'expo-router';
import { useCallback } from 'react';
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GoalSetupStep1Background } from '@/constants/assets';
import { Colors } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';

const STEP1_ORANGE = Colors.light.accent; // #F18E34

/**
 * Goal-setup STEP 1 (design5).
 * Background: 05-1.png. Content: STEP 1, flag icon, title, body (red letters = same as next).
 */
export default function GoalSetupScreen() {
  const insets = useSafeAreaInsets();
  const { width, spacing, scaleSize } = useResponsive();
  const colorScheme = useEffectiveColorScheme();
  const buttonBg = colorScheme === 'dark' ? Colors.dark.surface : '#9E9E9E';

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
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
            paddingHorizontal: spacing.lg,
          },
        ]}>
        <Text style={styles.stepLabel}>STEP 1</Text>
        <View style={styles.section5}>
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
      </View>
    </View>
  );
}
