/**
 * Displays the current profile icon (preset symbol or custom image).
 * Refetches when the screen is focused so changes from profile edit are reflected.
 */
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileIconDisplay } from '@/lib/storage';

type ProfileIconDisplay = { type: 'preset'; key: string } | { type: 'custom'; uri: string };

const PRESET_NAMES = ['person', 'self-improvement', 'settings', 'house.fill'] as const;

type Props = {
  size: number;
  borderColor?: string;
  backgroundColor?: string;
  iconColor?: string;
  style?: object;
};

export function ProfileIconView({
  size,
  borderColor,
  backgroundColor: backgroundColorProp,
  iconColor,
  style,
}: Props) {
  const defaultBorder = useThemeColor({}, 'border');
  const defaultIcon = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const backgroundColor = backgroundColorProp ?? surfaceColor;
  const [display, setDisplay] = useState<ProfileIconDisplay | null>(null);
  const isFocused = useIsFocused();

  const load = useCallback(async () => {
    const d = await getProfileIconDisplay();
    setDisplay(d);
  }, []);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const border = borderColor ?? defaultBorder;
  const icon = iconColor ?? defaultIcon;
  const presetKey = display?.type === 'preset' && PRESET_NAMES.includes(display.key as any) ? display.key : 'person';

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: border,
          backgroundColor,
          overflow: 'hidden',
        },
        style,
      ]}>
      {display?.type === 'custom' ? (
        <Image source={{ uri: display.uri }} style={{ width: size, height: size }} />
      ) : (
        <IconSymbol
          name={presetKey as 'person' | 'self-improvement' | 'settings' | 'house.fill'}
          size={Math.round(size * 0.55)}
          color={icon}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
