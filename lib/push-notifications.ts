/**
 * Push notifications: register for Expo Push, get and store the token.
 * Use the stored token (or send to your backend) to send pushes via Expo Push API.
 * expo-notifications is loaded only when needed to avoid errors in Android Expo Go (SDK 53+).
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const PUSH_TOKEN_KEY = '@zaf/expo_push_token';

/** Get EAS project ID from app config (required for Expo Push Token). */
function getProjectId(): string | null {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null;
  return projectId;
}

/**
 * Request notification permission and get Expo Push Token.
 * Returns the token string, or null if not available (e.g. web, simulator, permission denied).
 * The token is also stored locally; send it to your backend to target this device for push.
 * On Android, Expo Go (SDK 53+) no longer supports push; use a development build to get a token.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    console.warn('[Push] No EAS projectId in app config; cannot get Expo push token.');
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      if (status !== 'granted') return null;
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenResult?.data ?? null;
    if (token) {
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    }
    return token;
  } catch (e) {
    console.warn('[Push] Failed to get Expo push token:', e);
    return null;
  }
}

/** Get the last stored Expo Push Token (from a previous successful registration). */
export async function getStoredExpoPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}
