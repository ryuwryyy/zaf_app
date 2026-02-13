import { Link } from 'expo-router';
import { useMemo } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ScaledSpacing } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';

function createModalStyles(_spacing: ScaledSpacing) {
  return {
    container: {
      flex: 1 as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    link: {} as const,
  };
}

export default function ModalScreen() {
  const { spacing } = useResponsive();
  const styles = useMemo(() => createModalStyles(spacing), [spacing]);
  return (
    <ThemedView style={[styles.container, { padding: spacing.lg }]}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={[styles.link, { marginTop: spacing.lg, paddingVertical: spacing.lg }]}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}
