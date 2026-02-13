import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/contexts/ThemePreferenceContext';
import { useResponsive } from '@/hooks/use-responsive';

export default function TabLayout() {
  const colorScheme = useEffectiveColorScheme();
  const colors = Colors[colorScheme];
  const { spacing, scaleSize } = useResponsive();

  const tabActiveTint = '#2D2A26';
  const tabInactiveTint = '#A8ADB2';
  const tabIconSize = scaleSize(40);
  const tabLabelFontSize = scaleSize(16);
  const tabBarHeight = scaleSize(100);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabActiveTint,
        tabBarInactiveTintColor: tabInactiveTint,
        tabBarStyle: {
          backgroundColor: colors.background,
          height: tabBarHeight,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          overflow: 'visible',
        },
        tabBarItemStyle: { paddingVertical: spacing.xs, paddingHorizontal: spacing.xs, overflow: 'visible' },
        tabBarLabelStyle: { fontSize: tabLabelFontSize, fontWeight: '600', marginTop: spacing.xs },
        tabBarIconStyle: {
          marginBottom: 0,
          height: scaleSize(44),
          minWidth: tabIconSize + spacing.md,
          paddingHorizontal: spacing.sm,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: 'SESSION',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="self-improvement" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTING',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="settings" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
