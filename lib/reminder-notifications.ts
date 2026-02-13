/**
 * Reminder notifications: schedule local notifications at reminder times when enabled.
 * Syncs with stored reminders (add/remove/toggle) so the device rings and shows a notification at each enabled time.
 * expo-notifications is loaded only when needed to avoid errors in Android Expo Go (SDK 53+).
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import {
  getReminderNotificationBody,
  getReminderNotificationTitle,
  getReminders,
} from '@/lib/storage';
import type { ReminderItem } from '@/lib/storage';

const REMINDER_ID_PREFIX = 'zaf-reminder-';

/** Android channel for reminder notifications (required on Android 8+). */
const REMINDER_CHANNEL_ID = 'zaf-reminders';

/**
 * Title and body for local reminder notifications (e.g. at 20:00).
 * These are used when scheduling reminders; change here to align with app requirements.
 */
const REMINDER_NOTIFICATION_TITLE = 'ZAF リマインダー';
const REMINDER_NOTIFICATION_BODY = (time: string) => `瞑想の時間です。（${time}）`;

/** Android Expo Go does not support notifications; avoid loading expo-notifications there. */
const isAndroidExpoGo = Platform.OS === 'android' && Constants.appOwnership === 'expo';

async function getNotifications(): Promise<typeof import('expo-notifications') | null> {
  if (Platform.OS === 'web') return null;
  if (isAndroidExpoGo) return null;
  return import('expo-notifications');
}

/** Request notification permission and set up Android channel. Call early (e.g. app load). */
export async function setupReminderNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
        name: 'リマインダー',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Parse "HH:mm" into hour and minute. */
function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map((s) => parseInt(s, 10));
  return {
    hour: Number.isFinite(h) ? Math.max(0, Math.min(23, h)) : 12,
    minute: Number.isFinite(m) ? Math.max(0, Math.min(59, m)) : 0,
  };
}

/**
 * Cancel all scheduled notifications that we created for reminders.
 */
async function cancelReminderNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const req of scheduled) {
      const id = req.identifier;
      if (id.startsWith(REMINDER_ID_PREFIX) && req.trigger) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Schedule a daily local notification for one reminder (when enabled).
 * Uses default sound and shows banner so the device "rings" at the set time.
 */
async function scheduleReminderNotification(rem: ReminderItem): Promise<void> {
  if (Platform.OS === 'web' || !rem.enabled) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  try {
    const { hour, minute } = parseTime(rem.time);
    /** Daily at hour:minute; use daily trigger for Android/iOS compatibility. */
    const trigger: Parameters<typeof Notifications.scheduleNotificationAsync>[0]['trigger'] = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' && { channelId: REMINDER_CHANNEL_ID }),
    };
    const customTitle = await getReminderNotificationTitle();
    const customBodyTemplate = await getReminderNotificationBody();
    const title = (customTitle?.trim() && customTitle) || REMINDER_NOTIFICATION_TITLE;
    const body =
      (customBodyTemplate?.trim() &&
        customBodyTemplate.replace(/\{time\}/g, rem.time)) ||
      REMINDER_NOTIFICATION_BODY(rem.time);
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID_PREFIX + rem.id,
      content: {
        title,
        body,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: REMINDER_CHANNEL_ID }),
      },
      trigger,
    });
    __DEV__ && console.log(`[Reminders] Scheduled ${rem.time} (${REMINDER_ID_PREFIX}${rem.id})`);
  } catch (e) {
    console.warn(`[Reminders] Failed to schedule ${rem.time}:`, e);
  }
}

/**
 * Sync scheduled notifications with the current reminder list.
 * Call after reminders are loaded or after user adds/removes/toggles reminders.
 * - Cancels all previously scheduled reminder notifications.
 * - Schedules one daily notification per enabled reminder at its time.
 */
export async function syncReminderNotifications(reminders: ReminderItem[]): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await cancelReminderNotifications();
    for (const rem of reminders) {
      if (rem.enabled) await scheduleReminderNotification(rem);
    }
  } catch (e) {
    console.warn('[Reminders] syncReminderNotifications failed:', e);
  }
}

/**
 * Load reminders from storage and sync scheduled notifications.
 * Call on app launch (after setupReminderNotifications) so reminders fire after app restart.
 */
let hasWarnedExpoGoReminders = false;
export async function loadAndSyncReminderNotifications(): Promise<void> {
  const ok = await setupReminderNotifications();
  if (!ok) {
    if (__DEV__ && isAndroidExpoGo && !hasWarnedExpoGoReminders) {
      hasWarnedExpoGoReminders = true;
      console.warn(
        '[Reminders] Local reminders are not available in Expo Go on Android. Use a development build for reminder times to fire.'
      );
    }
    return;
  }
  const reminders = await getReminders();
  await syncReminderNotifications(reminders);
}
