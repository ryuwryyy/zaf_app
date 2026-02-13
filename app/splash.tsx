import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { SPLASH_VIDEO_SOURCE, SplashBackground } from '@/constants/assets';
import type { ScaledSpacing } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';
import { getOnboardingCompleted } from '@/lib/storage';

function createSplashStyles(spacing: ScaledSpacing, scaleSize: (n: number) => number) {
  return {
    container: { flex: 1 as const },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    designNote: {
      fontSize: scaleSize(25),
      fontWeight: '900' as const,
      color: '#E53935' as const,
      textAlign: 'center' as const,
    },
    center: {
      flex: 1 as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginTop: scaleSize(-320),
    },
    hero: {
      fontSize: scaleSize(76),
      fontWeight: '800' as const,
      color: '#fff' as const,
      letterSpacing: scaleSize(18),
    },
    tagline: {
      fontSize: scaleSize(22),
      fontWeight: '600' as const,
      color: '#fff' as const,
      letterSpacing: 3,
      marginTop: scaleSize(6),
    },
    buttonWrap: { width: '100%' as const, alignItems: 'center' as const },
    button: {
      width: '100%' as const,
      maxWidth: scaleSize(340),
      minHeight: scaleSize(52),
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)' as const,
    },
    spinner: { marginTop: spacing.md },
  };
}

/**
 * Optional video background (design1: "The background will be a video").
 */
function SplashVideoLayer({ source }: { source: string | number }) {
  const { useVideoPlayer, VideoView } = require('expo-video');
  const player = useVideoPlayer(source, (p: { loop: boolean; muted: boolean; play: () => void }) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

/**
 * Splash screen matching design1.png exactly:
 * Full-screen mountain background; red note overlaid top; Z A F + tagline center; white pill button bottom.
 */
export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { spacing, scaleSize } = useResponsive();
  const styles = useMemo(() => createSplashStyles(spacing, scaleSize), [spacing, scaleSize]);
  const [navigating, setNavigating] = useState(false);

  const handleStart = useCallback(async () => {
    setNavigating(true);
    const completed = await getOnboardingCompleted();
    if (completed) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
    setNavigating(false);
  }, []);

  const useVideo = SPLASH_VIDEO_SOURCE != null;

  return (
    <View style={styles.container}>
      {useVideo ? (
        <SplashVideoLayer source={SPLASH_VIDEO_SOURCE} />
      ) : (
        <ImageBackground
          source={SplashBackground}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      {/* All overlays on top of mountain — same layout as design1 */}
      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
            paddingHorizontal: spacing.xl,
          },
        ]}>
        {/* Red note: upper portion, over the background */}
        <Text style={styles.designNote}>背景が動画になります</Text>

        {/* Center: Z A F + ZEN IN THE LIFE */}
        <View style={styles.center}>
          <Text style={styles.hero}>Z A F</Text>
          <Text style={styles.tagline}>ZEN IN THE LIFE</Text>
        </View>

        {/* Bottom: white pill button with gray border */}
        <View style={styles.buttonWrap}>
          <Button
            title="はじめる"
            variant="inverse"
            onPress={handleStart}
            disabled={navigating}
            style={styles.button}
          />
          {navigating && (
            <ActivityIndicator size="small" color="#111" style={styles.spinner} />
          )}
        </View>
      </View>
    </View>
  );
}

