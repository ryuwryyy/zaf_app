/**
 * Background task for Android (and iOS) using expo-background-task.
 * When it runs, checks if current time matches any enabled reminder; if so, sends a push
 * to this device via Expo Push API (title, body, push token, channel ID).
 * Task definition must be top-level so it is registered before the app tries to run it.
 */
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { getStoredExpoPushToken } from '@/lib/push-notifications';
import {
    getReminderNotificationBody,
    getReminderNotificationTitle,
    getReminders,
} from '@/lib/storage';

export const BACKGROUND_FETCH_TASK_NAME = 'BACKGROUND_FETCH';

const REMINDER_CHANNEL_ID = 'zaf-reminders';
const DEFAULT_TITLE = 'ZAF リマインダー';
const DEFAULT_BODY_TEMPLATE = '瞑想の時間です。（{time}）';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

TaskManager.defineTask(BACKGROUND_FETCH_TASK_NAME, async () => {
  try {
    const now = new Date();
    const currentTimeStr = formatTime(now.getHours(), now.getMinutes());
    console.log('[Background] Task ran at', currentTimeStr);

    const reminders = await getReminders();
    const hasMatchingReminder = reminders.some(
      (r) => r.enabled && r.time === currentTimeStr
    );
    if (!hasMatchingReminder) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const token = await getStoredExpoPushToken();
    if (!token) {
      console.log('[Background] No push token; skip sending to Expo');
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const customTitle = await getReminderNotificationTitle();
    const customBodyTemplate = await getReminderNotificationBody();
    const title = (customTitle?.trim() && customTitle) || DEFAULT_TITLE;
    const body =
      (customBodyTemplate?.trim() &&
        customBodyTemplate.replace(/\{time\}/g, currentTimeStr)) ||
      DEFAULT_BODY_TEMPLATE.replace(/\{time\}/g, currentTimeStr);

    const payload: Record<string, unknown> = {
      to: token,
      title,
      body,
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: REMINDER_CHANNEL_ID }),
    };

    console.log('[Background] Sending request to Expo Push API for', currentTimeStr, '→', EXPO_PUSH_URL);

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    if (res.ok) {
      console.log('[Background] Expo Push API response:', res.status, responseText);
    } else {
      console.warn('[Background] Expo Push API error:', res.status, responseText);
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    console.warn('[Background] Reminder push failed:', e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Register the background task. Call once when the app starts (e.g. in root layout).
 * Skips registration in Expo Go to avoid "not available" warnings; use a development build for real background runs.
 * minimumInterval is in minutes (Android typically enforces >= 15).
 * Note: The task runs every 15+ minutes, so a reminder at 8:41 will only trigger a push if the task runs at 8:41.
 * For exact-time reminders, keep using local scheduled notifications (reminder-notifications.ts) when possible.
 */
export async function registerBackgroundFetchAsync(): Promise<void> {
  // if (Constants.appOwnership === 'expo') {
  //   console.log(' I am here ++++++++')
  //   return; // Background task APIs are not fully available in Expo Go
  // }



  // const status = await BackgroundTask.getStatusAsync();
  // if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
  //   console.log('Background task is disabled');
  //   return;
  // }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK_NAME);
  if (isRegistered) {
    return;
  }

  await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK_NAME, {
    minimumInterval: 1, // minutes (Android usually clamps >= 15 min)
  });

  console.log('Background task registered!');
}
