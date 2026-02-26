import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@zaf/';

/** Keys */
export const ONBOARDING_COMPLETED_KEY = PREFIX + 'onboarding_completed';
const GOAL_DAYS_KEY = PREFIX + 'goal_days';
const REMINDERS_KEY = PREFIX + 'reminders';
const REMINDER_NOTIFICATION_TITLE_KEY = PREFIX + 'reminder_notification_title';
const REMINDER_NOTIFICATION_BODY_KEY = PREFIX + 'reminder_notification_body';
const DISPLAY_NAME_KEY = PREFIX + 'display_name';
const PROFILE_ICON_KEY = PREFIX + 'profile_icon';
const CUSTOM_PROFILE_IMAGES_KEY = PREFIX + 'custom_profile_images';
const COLOR_SCHEME_KEY = PREFIX + 'color_scheme';
const APP_USAGE_START_KEY = PREFIX + 'app_usage_start';
const SESSIONS_KEY = PREFIX + 'sessions';
/** Keep only the last N days of session history to limit storage size. */
const SESSION_HISTORY_RETENTION_DAYS = 30;
const MISSIONS_ACHIEVED_KEY = PREFIX + 'missions_achieved';
const SESSION_BGM_ENABLED_KEY = PREFIX + 'session_bgm_enabled';
const BGM_TRACK_KEY = PREFIX + 'bgm_track';
const BGM_FAVOURITES_KEY = PREFIX + 'bgm_favourites';
const TIMER_END_SOUND_KEY = PREFIX + 'timer_end_sound';
const TIMER_PRESET_KEY = PREFIX + 'timer_preset';
const DAILY_MEDITATION_TARGET_MINUTES_KEY = PREFIX + 'daily_meditation_target_minutes';

/** Types */
export interface ReminderItem {
  id: string;
  time: string; // "HH:mm"
  enabled: boolean;
}

export interface SessionRecord {
  date: string; // ISO date "YYYY-MM-DD"
  durationMinutes: number;
  /** Total duration in seconds (for display as hour/minute/second). If missing, derived from durationMinutes. */
  durationSeconds?: number;
  type?: 'timer' | 'guidance';
  /** When the session was completed (ISO datetime); used for progress history */
  completedAt?: string;
}

export interface RecordStats {
  appUsageStartDate: string;
  totalMeditationDays: number;
  totalMeditationCount: number;
  totalMeditationMinutes: number;
  missionsAchieved: number;
}

/** Onboarding */
export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, completed ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/** Mission goal (目標日数) */
const DEFAULT_GOAL_DAYS = 20;

export async function getGoalDays(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(GOAL_DAYS_KEY);
    if (value == null) return DEFAULT_GOAL_DAYS;
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_GOAL_DAYS;
  } catch {
    return DEFAULT_GOAL_DAYS;
  }
}

export async function setGoalDays(days: number): Promise<void> {
  try {
    await AsyncStorage.setItem(GOAL_DAYS_KEY, String(Math.max(0, Math.floor(days))));
  } catch {
    // ignore
  }
}

/** Reminders */
const DEFAULT_REMINDERS: ReminderItem[] = [
  { id: '1', time: '20:00', enabled: true },
  { id: '2', time: '6:00', enabled: false },
];

export async function getReminders(): Promise<ReminderItem[]> {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_KEY);
    if (!raw) return DEFAULT_REMINDERS;
    const parsed = JSON.parse(raw) as ReminderItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REMINDERS;
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export async function setReminders(reminders: ReminderItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch {
    // ignore
  }
}

/** Optional custom title/body for local reminder notifications. If not set, app uses defaults. */
export async function getReminderNotificationTitle(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REMINDER_NOTIFICATION_TITLE_KEY);
  } catch {
    return null;
  }
}

export async function setReminderNotificationTitle(value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDER_NOTIFICATION_TITLE_KEY, value);
  } catch {
    // ignore
  }
}

export async function getReminderNotificationBody(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REMINDER_NOTIFICATION_BODY_KEY);
  } catch {
    return null;
  }
}

/** Body template: use {time} as placeholder for the reminder time (e.g. "瞑想の時間です。（{time}）"). */
export async function setReminderNotificationBody(value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDER_NOTIFICATION_BODY_KEY, value);
  } catch {
    // ignore
  }
}

/** User display name */
const DEFAULT_DISPLAY_NAME = 'S.TAROU';

export async function getDisplayName(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(DISPLAY_NAME_KEY);
    return value ?? DEFAULT_DISPLAY_NAME;
  } catch {
    return DEFAULT_DISPLAY_NAME;
  }
}

export async function setDisplayName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISPLAY_NAME_KEY, name.trim() || DEFAULT_DISPLAY_NAME);
  } catch {
    // ignore
  }
}

/** Profile icon key (e.g. 'person', 'self-improvement') – must match IconSymbol name */
const DEFAULT_PROFILE_ICON = 'person';

export async function getProfileIcon(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(PROFILE_ICON_KEY);
    return value ?? DEFAULT_PROFILE_ICON;
  } catch {
    return DEFAULT_PROFILE_ICON;
  }
}

export async function setProfileIcon(iconKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_ICON_KEY, iconKey || DEFAULT_PROFILE_ICON);
  } catch {
    // ignore
  }
}

/** Custom profile images (user-added). Profile icon can be preset key or "custom:${id}". */
export interface CustomProfileImage {
  id: string;
  uri: string;
}

export async function getCustomProfileImages(): Promise<CustomProfileImage[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_PROFILE_IMAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomProfileImage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCustomProfileImages(images: CustomProfileImage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_PROFILE_IMAGES_KEY, JSON.stringify(images));
  } catch {
    // ignore
  }
}

export async function addCustomProfileImage(uri: string): Promise<CustomProfileImage> {
  const list = await getCustomProfileImages();
  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const item: CustomProfileImage = { id, uri };
  await setCustomProfileImages([...list, item]);
  return item;
}

export async function removeCustomProfileImage(id: string): Promise<void> {
  const list = await getCustomProfileImages();
  const next = list.filter((img) => img.id !== id);
  await setCustomProfileImages(next);
  const current = await getProfileIcon();
  if (current === `custom:${id}`) {
    await setProfileIcon(DEFAULT_PROFILE_ICON);
  }
}

/** Resolve profile icon to display: preset key or custom image URI. */
export async function getProfileIconDisplay(): Promise<{ type: 'preset'; key: string } | { type: 'custom'; uri: string }> {
  const key = await getProfileIcon();
  if (key.startsWith('custom:')) {
    const list = await getCustomProfileImages();
    const id = key.slice(7);
    const found = list.find((img) => img.id === id);
    if (found) return { type: 'custom', uri: found.uri };
    return { type: 'preset', key: DEFAULT_PROFILE_ICON };
  }
  return { type: 'preset', key };
}

/** Preferred color scheme: 'light' | 'dark' | 'system' */
export type ColorSchemePreference = 'light' | 'dark' | 'system';

const DEFAULT_COLOR_SCHEME: ColorSchemePreference = 'system';

export async function getColorSchemePreference(): Promise<ColorSchemePreference> {
  try {
    const value = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
    return DEFAULT_COLOR_SCHEME;
  } catch {
    return DEFAULT_COLOR_SCHEME;
  }
}

export async function setColorSchemePreference(pref: ColorSchemePreference): Promise<void> {
  try {
    await AsyncStorage.setItem(COLOR_SCHEME_KEY, pref);
  } catch {
    // ignore
  }
}

/** App usage start date (set once when onboarding completes) */
export async function getAppUsageStartDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(APP_USAGE_START_KEY);
  } catch {
    return null;
  }
}

export async function setAppUsageStartDate(isoDate: string): Promise<void> {
  try {
    await AsyncStorage.setItem(APP_USAGE_START_KEY, isoDate);
  } catch {
    // ignore
  }
}

/** Daily meditation target in minutes. A day counts as "completed" only when total meditation that day >= this. */
const DEFAULT_DAILY_MEDITATION_TARGET_MINUTES = 10;

export async function getDailyMeditationTargetMinutes(): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(DAILY_MEDITATION_TARGET_MINUTES_KEY);
    if (v == null) return DEFAULT_DAILY_MEDITATION_TARGET_MINUTES;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(24 * 60, n) : DEFAULT_DAILY_MEDITATION_TARGET_MINUTES;
  } catch {
    return DEFAULT_DAILY_MEDITATION_TARGET_MINUTES;
  }
}

export async function setDailyMeditationTargetMinutes(minutes: number): Promise<void> {
  try {
    const n = Math.max(1, Math.min(24 * 60, Math.floor(minutes)));
    await AsyncStorage.setItem(DAILY_MEDITATION_TARGET_MINUTES_KEY, String(n));
  } catch {
    // ignore
  }
}

/** Minutes for a session (from durationSeconds or durationMinutes). */
function sessionMinutes(s: SessionRecord): number {
  if (s.durationSeconds != null) return Math.ceil(s.durationSeconds / 60);
  return s.durationMinutes;
}

/** Count days where total meditation time that day >= targetMinutes (used for progress). */
export function getProgressDaysCount(sessions: SessionRecord[], targetMinutes: number): number {
  if (targetMinutes <= 0) return 0;
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    const d = s.date;
    const prev = byDate.get(d) ?? 0;
    byDate.set(d, prev + sessionMinutes(s));
  }
  let count = 0;
  for (const total of byDate.values()) {
    if (total >= targetMinutes) count += 1;
  }
  return count;
}

/** Sum meditation minutes for a given date (e.g. today). */
export function getMinutesForDate(sessions: SessionRecord[], dateISO: string): number {
  return sessions
    .filter((s) => s.date === dateISO)
    .reduce((sum, s) => sum + sessionMinutes(s), 0);
}

/** Session history: only the last SESSION_HISTORY_RETENTION_DAYS are kept; older ones are pruned automatically. */
export async function getSessions(): Promise<SessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionRecord[];
    const list = Array.isArray(parsed) ? parsed : [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - SESSION_HISTORY_RETENTION_DAYS);
    const cutoffTime = cutoff.getTime();
    const pruned = list.filter((s) => {
      const t = s.completedAt ? new Date(s.completedAt).getTime() : new Date(s.date).getTime();
      return t >= cutoffTime;
    });
    if (pruned.length < list.length) {
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(pruned));
    }
    return pruned;
  } catch {
    return [];
  }
}

export async function addSession(record: SessionRecord): Promise<void> {
  try {
    const list = await getSessions();
    const [goalDays, targetMinutes] = await Promise.all([getGoalDays(), getDailyMeditationTargetMinutes()]);

    /** Progress days *before* adding this session (to detect if a new mission was just completed). */
    const oldProgressDays = getProgressDaysCount(list, targetMinutes);
    const oldCycles = goalDays > 0 ? Math.floor(oldProgressDays / goalDays) : 0;

    const entry: SessionRecord = {
      ...record,
      completedAt: record.completedAt ?? new Date().toISOString(),
    };
    list.push(entry);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(list));

    /** Only increment missions when user completes one more full goal cycle; never decrease (e.g. when goal days change). */
    if (goalDays > 0) {
      const newProgressDays = getProgressDaysCount(list, targetMinutes);
      const newCycles = Math.floor(newProgressDays / goalDays);
      if (newCycles > oldCycles) {
        const current = await getMissionsAchieved();
        await setMissionsAchieved(current + (newCycles - oldCycles));
      }
    }
  } catch {
    // ignore
  }
}

export async function setSessions(sessions: SessionRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

/** Missions achieved count */
export async function getMissionsAchieved(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(MISSIONS_ACHIEVED_KEY);
    if (value == null) return 0;
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function setMissionsAchieved(count: number): Promise<void> {
  try {
    await AsyncStorage.setItem(MISSIONS_ACHIEVED_KEY, String(Math.max(0, Math.floor(count))));
  } catch {
    // ignore
  }
}

/** Session page: BGM on/off for timer (persisted). Default true = "BGM有り". */
export async function getSessionBgmEnabled(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(SESSION_BGM_ENABLED_KEY);
    if (v == null) return true;
    return v === 'true';
  } catch {
    return true;
  }
}

export async function setSessionBgmEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_BGM_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/** User-selected BGM from device (saved in phone). */
export interface BgmFavourite {
  id: string;
  name: string;
  uri: string;
}

/** Session page: current BGM track (user-picked from device). null = none selected. */
export async function getBgmTrack(): Promise<{ name: string; uri: string } | null> {
  try {
    const v = await AsyncStorage.getItem(BGM_TRACK_KEY);
    if (v == null) return null;
    const parsed = JSON.parse(v) as { name: string; uri: string };
    return parsed?.name && parsed?.uri ? parsed : null;
  } catch {
    return null;
  }
}

export async function setBgmTrack(track: { name: string; uri: string } | null): Promise<void> {
  try {
    if (track == null) {
      await AsyncStorage.removeItem(BGM_TRACK_KEY);
    } else {
      await AsyncStorage.setItem(BGM_TRACK_KEY, JSON.stringify(track));
    }
  } catch {
    // ignore
  }
}

/** Session page: list of BGM tracks the user saved from their device. */
export async function getBgmFavourites(): Promise<BgmFavourite[]> {
  try {
    const v = await AsyncStorage.getItem(BGM_FAVOURITES_KEY);
    if (v == null) return [];
    const parsed = JSON.parse(v) as BgmFavourite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addBgmFavourite(name: string, uri: string): Promise<BgmFavourite> {
  const list = await getBgmFavourites();
  const id = uri; // use uri as id to avoid duplicates
  if (list.some((f) => f.uri === uri)) return list.find((f) => f.uri === uri)!;
  const entry: BgmFavourite = { id, name, uri };
  list.push(entry);
  await AsyncStorage.setItem(BGM_FAVOURITES_KEY, JSON.stringify(list));
  return entry;
}

export async function removeBgmFavourite(id: string): Promise<void> {
  const list = (await getBgmFavourites()).filter((f) => f.id !== id);
  await AsyncStorage.setItem(BGM_FAVOURITES_KEY, JSON.stringify(list));
}

/** Session page: sound when timer ends (e.g. ヒルサイド, ベル, オフ). */
const DEFAULT_TIMER_END_SOUND = 'ヒルサイド';

export async function getTimerEndSound(): Promise<string> {
  try {
    const v = await AsyncStorage.getItem(TIMER_END_SOUND_KEY);
    return v ?? DEFAULT_TIMER_END_SOUND;
  } catch {
    return DEFAULT_TIMER_END_SOUND;
  }
}

export async function setTimerEndSound(sound: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TIMER_END_SOUND_KEY, sound || DEFAULT_TIMER_END_SOUND);
  } catch {
    // ignore
  }
}

/** Session page: last time picker values (hours, minutes, seconds) so the panel preserves state when returning. */
export interface TimerPreset {
  hours: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_TIMER_PRESET: TimerPreset = { hours: 0, minutes: 0, seconds: 0 };

export async function getTimerPreset(): Promise<TimerPreset> {
  try {
    const raw = await AsyncStorage.getItem(TIMER_PRESET_KEY);
    if (!raw) return DEFAULT_TIMER_PRESET;
    const parsed = JSON.parse(raw) as TimerPreset;
    const h = Math.max(0, Math.min(23, Number(parsed.hours) || 0));
    const m = Math.max(0, Math.min(59, Number(parsed.minutes) || 0));
    const s = Math.max(0, Math.min(59, Number(parsed.seconds) || 0));
    return { hours: h, minutes: m, seconds: s };
  } catch {
    return DEFAULT_TIMER_PRESET;
  }
}

export async function setTimerPreset(preset: TimerPreset): Promise<void> {
  try {
    const h = Math.max(0, Math.min(23, Math.floor(Number(preset.hours) || 0)));
    const m = Math.max(0, Math.min(59, Math.floor(Number(preset.minutes) || 0)));
    const s = Math.max(0, Math.min(59, Math.floor(Number(preset.seconds) || 0)));
    await AsyncStorage.setItem(TIMER_PRESET_KEY, JSON.stringify({ hours: h, minutes: m, seconds: s }));
  } catch {
    // ignore
  }
}

/** Compute Record stats from storage (progress = days where total meditation >= daily target). */
export async function getRecordStats(): Promise<RecordStats> {
  const [appStart, sessions, goalDays, targetMinutes, missionsAchieved] = await Promise.all([
    getAppUsageStartDate(),
    getSessions(),
    getGoalDays(),
    getDailyMeditationTargetMinutes(),
    getMissionsAchieved(),
  ]);

  const progressDays = getProgressDaysCount(sessions, targetMinutes);
  const totalMinutes = sessions.reduce((sum, s) => sum + sessionMinutes(s), 0);
  /** Use stored missions count (only ever increases when a mission is completed); never recompute from goal days. */

  const appUsageStartDate =
    appStart ?? (sessions.length > 0 ? sessions[0].date : new Date().toISOString().slice(0, 10));

  return {
    appUsageStartDate,
    totalMeditationDays: progressDays,
    totalMeditationCount: sessions.length,
    totalMeditationMinutes: totalMinutes,
    missionsAchieved,
  };
}

/** Format date for display (e.g. 2026年2月2日) */
export function formatRecordDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  const month = parseInt(m ?? '0', 10);
  const day = parseInt(d ?? '0', 10);
  return `${y}年${month}月${day}日`;
}

/** Format duration for display (e.g. 36時間26分) */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}時間${mins}分`;
  if (hours > 0) return `${hours}時間`;
  return `${mins}分`;
}

/** Format completedAt for display (e.g. 2026年2月2日 14:30:45) */
export function formatRecordDateTime(isoDateTime: string): { dateStr: string; timeStr: string } {
  const d = new Date(isoDateTime);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours();
  const min = d.getMinutes();
  const sec = d.getSeconds();
  const dateStr = `${y}年${m}月${day}日`;
  const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return { dateStr, timeStr };
}
