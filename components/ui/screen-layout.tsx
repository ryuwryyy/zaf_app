import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ScaledSpacing } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ScreenLayoutProps = ViewProps & {
  /** Padding around content. Default: md. Uses responsive scaled spacing. */
  padding?: keyof ScaledSpacing;
  /** Use safe area insets (top/bottom). Default: true */
  safe?: boolean;
};

/**
 * Full-screen layout with optional safe area and responsive padding.
 * Adapts from iPhone SE2 to large Pro Max so margins don't crush.
 */
export function ScreenLayout({
  style,
  padding = 'md',
  safe = true,
  children,
  ...rest
}: ScreenLayoutProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const insets = useSafeAreaInsets();
  const { spacing } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        safe && {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        { paddingHorizontal: spacing[padding] },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
