/**
 * App-wide constants: timer defaults, reminder times, API config.
 */

/** Default meditation duration in minutes (used when user hasn't set a preference) */
export const DEFAULT_MEDITATION_MINUTES = 20;

/** Default reminder times (spec: morning 6:00 AM, night 9:00 PM) */
export const DEFAULT_REMINDER_MORNING = { hour: 6, minute: 0 };
export const DEFAULT_REMINDER_NIGHT = { hour: 21, minute: 0 }; // 9 PM

/** Display strings for default reminders */
export const DEFAULT_REMINDER_MORNING_LABEL = '6:00';
export const DEFAULT_REMINDER_NIGHT_LABEL = '21:00';

/** API base URL (placeholder until backend is ready) */
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.example.com';

/** Approximate number of daily quotes in content (spec: ~100) */
export const QUOTE_POOL_SIZE = 100;
