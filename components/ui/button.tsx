import {
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'inverse';

export type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  /** Show chevron-right arrow after title (e.g. NEXT, START) */
  showArrow?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Reusable button matching ZAF designs: primary (orange), secondary (grey), outline, ghost.
 * Optional right arrow for onboarding / CTA buttons.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  showArrow = false,
  disabled = false,
  style,
}: ButtonProps) {
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];

  const variantStyles = getVariantStyles(colors, variant);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, variantStyles.label]}>{title}</Text>
      {showArrow && (
        <IconSymbol
          name="chevron.right"
          size={20}
          color={variantStyles.label.color}
          style={styles.arrow}
        />
      )}
    </Pressable>
  );
}

function getVariantStyles(colors: typeof Colors.light, variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: colors.accent },
        label: { color: colors.white, ...styles.labelBold },
      };
    case 'secondary':
      return {
        container: { backgroundColor: colors.textMuted },
        label: { color: colors.white, ...styles.labelBold },
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        },
        label: { color: colors.text, ...styles.labelBold },
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        label: { color: colors.text },
      };
    case 'inverse':
      return {
        container: { backgroundColor: colors.white },
        label: { color: colors.black ?? '#111', fontWeight: '900' as const },
      };
    default:
      return getVariantStyles(colors, 'primary');
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.pill,
    minHeight: 52,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16 },
  labelBold: { fontWeight: '700' },
  arrow: { marginLeft: Spacing.sm },
});
