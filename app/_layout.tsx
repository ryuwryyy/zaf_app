import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { ThemeAlertProvider } from '@/contexts/ThemeAlertContext';
import { ThemePreferenceProvider, useThemePreference } from '@/contexts/ThemePreferenceContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerBackgroundFetchAsync } from '@/lib/background';
import { registerForPushNotificationsAsync } from '@/lib/push-notifications';
import { loadAndSyncReminderNotifications } from '@/lib/reminder-notifications';

function ThemeResolver({ children }: { children: React.ReactNode }) {
  const { preference } = useThemePreference();
  const systemScheme = useColorScheme();
  const effective = preference === 'light' ? 'light' : preference === 'dark' ? 'dark' : systemScheme ?? 'light';
  return (
    <ThemeProvider value={effective === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeAlertProvider>
        <StatusBar style={effective === 'dark' ? 'light' : 'dark'} />
        {children}
      </ThemeAlertProvider>
    </ThemeProvider>
  );
}

/** Android Expo Go (SDK 53+) does not support push/remote notifications; avoid loading expo-notifications there. */
const isAndroidExpoGo = Platform.OS === 'android' && Constants.appOwnership === 'expo';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    registerBackgroundFetchAsync();
  }, []);

  useEffect(() => {
    if (isAndroidExpoGo) return;
    (async () => {
      const Notifications = await import('expo-notifications');
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      await loadAndSyncReminderNotifications();
      await registerForPushNotificationsAsync();
    })();
  }, []);

  const notificationSubRef = useRef<{ remove: () => void } | null>(null);
  useEffect(() => {
    if (isAndroidExpoGo) return;
    let cancelled = false;
    (async () => {
      const Notifications = await import('expo-notifications');
      if (cancelled) return;
      notificationSubRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as { url?: string; screen?: string };
        if (typeof data?.url === 'string') {
          router.push(data.url as any);
        } else if (typeof data?.screen === 'string') {
          router.push(data.screen as any);
        }
      });
    })();
    return () => {
      cancelled = true;
      notificationSubRef.current?.remove();
      notificationSubRef.current = null;
    };
  }, [router]);

  return (
    <ThemePreferenceProvider>
      <ThemeResolver>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="goal-setup" />
          <Stack.Screen name="goal-setup-step2" />
          <Stack.Screen name="goal-setup-step3" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session-timer" />
          <Stack.Screen name="guidance-video" />
          <Stack.Screen name="profile-settings" />
          <Stack.Screen name="profile-edit-name" />
          <Stack.Screen name="profile-edit-icon" />
          <Stack.Screen name="profile-edit-color" />
          <Stack.Screen name="goal-detail" />
          <Stack.Screen name="meditation-purpose" />
          <Stack.Screen name="zaf-product" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </ThemeResolver>
    </ThemePreferenceProvider>
  );
}
