# Odza – Meditation App

A React Native (Expo) meditation app with goals, sessions, reminders, and push notifications. This document explains how to run the project, build for Android and iOS, how push notifications work, and how the business logic is implemented.

---

## Table of Contents

1. [How to Run This Project](#1-how-to-run-this-project)
2. [How to Build Android](#2-how-to-build-android)
3. [How to Build iOS](#3-how-to-build-ios)
4. [Push Notifications (Android and iOS)](#4-push-notifications-android-and-ios)
5. [Business Logic (Step by Step)](#5-business-logic-step-by-step)

---

## 1. How to Run This Project

### Prerequisites

- **Node.js** (LTS, e.g. 18 or 20)
- **npm** or **yarn**
- **Expo Go** app on your phone (optional, for quick testing)
- **EAS CLI** (optional, only needed for building): `npm install -g eas-cli`

### Step 1: Install dependencies

From the project root (clone the repo first if needed):

```bash
cd <path-to-odza-project>
npm install
```

### Step 2: Start the development server

```bash
npm start
```

This runs `expo start` and opens the Metro bundler in the terminal.

### Step 3: Run on a device or simulator

- **Android:** Press `a` in the terminal, or run `npm run android` (opens Expo on Android emulator/device).
- **iOS:** Press `i` in the terminal, or run `npm run ios` (opens on iOS simulator; Mac only).
- **Web:** Press `w` in the terminal, or run `npm run web`.

### Step 4: Open in Expo Go (optional)

1. Install **Expo Go** from the App Store (iOS) or Google Play (Android).
2. Ensure your phone and computer are on the same Wi‑Fi network.
3. Scan the QR code shown in the terminal with Expo Go (Android) or the Camera app (iOS).

**Note:** Some features (push notifications on Android, local reminders on Android, background task) do **not** work in Expo Go. Use a **development build** for full functionality (see build sections below).

---

## 2. How to Build Android

Builds are done with **EAS Build** (Expo Application Services). You do not need Android Studio on your machine; the build runs in the cloud.

### Prerequisites

- **EAS CLI:** `npm install -g eas-cli`
- **Expo account:** Sign in with `eas login`
- **Android:** No extra local setup required for EAS cloud builds

### Step 1: Configure the project (already done)

- `app.json` – Android `package` is `com.odza.app`, `googleServicesFile` points to `./google-services.json`.
- `eas.json` – Build profiles: `development`, `preview`, `production`.

### Step 2: Choose a build profile

| Profile       | Use case                          | Command |
|---------------|-----------------------------------|---------|
| **development** | Testing on device, push, reminders, background task | `eas build --profile development --platform android` |
| **preview**     | Internal distribution (APK), no store | `eas build --profile preview --platform android`     |
| **production**  | Play Store (AAB)                 | `eas build --profile production --platform android` |

### Step 3: Run the build

**Development build (recommended for testing):**

```bash
eas build --profile development --platform android
```

**Production build:**

```bash
eas build --profile production --platform android
```

### Step 4: Wait and install

1. EAS will prompt for credentials/setup the first time (e.g. keystore).
2. The build runs on Expo’s servers; progress is shown in the terminal.
3. When finished, you get a link to download the **APK** (preview/development) or **AAB** (production).
4. Install the APK on your device, or submit the AAB to Google Play Console.

### Step 5: (Optional) List existing builds

```bash
eas build:list --platform android
```

---

## 3. How to Build iOS

iOS builds also use **EAS Build**. A Mac is **not** required; the build runs in the cloud.

### Prerequisites

- **EAS CLI:** `npm install -g eas-cli`
- **Expo account:** `eas login`
- **Apple Developer account** (paid) for distribution to TestFlight/App Store
- First-time setup: accept Apple’s agreements in [App Store Connect](https://appstoreconnect.apple.com) if prompted

### Step 1: Configure the project (already done)

- `app.json` – iOS `bundleIdentifier` is `com.odza.app`.
- `eas.json` – Same profiles as Android: `development`, `preview`, `production`.

### Step 2: Choose a build profile

| Profile       | Use case                          |
|---------------|-----------------------------------|
| **development** | Testing on device, push, reminders |
| **preview**     | Internal (TestFlight or ad-hoc)   |
| **production**  | App Store                         |

### Step 3: Run the build

**Development build:**

```bash
eas build --profile development --platform ios
```

**Production build:**

```bash
eas build --profile production --platform ios
```

### Step 4: Credentials and install

1. First run: EAS may ask you to sign in with your **Apple ID** and create or select provisioning profiles/certificates.
2. Build runs in the cloud; when it finishes you get a link to the **.ipa**.
3. Install via the link/QR code (development/preview) or upload to App Store Connect (production).

### Step 5: (Optional) List existing builds

```bash
eas build:list --platform ios
```

---

## 4. Push Notifications (Android and iOS)

The app supports **remote push notifications** (Expo Push) and **local reminder notifications**. Behaviour differs slightly on Android and iOS, and in Expo Go vs development/production builds.

### 4.1 Overview

| Feature              | Android (Expo Go)     | Android (Dev build) | iOS (Expo Go) | iOS (Dev build) |
|----------------------|-----------------------|----------------------|---------------|------------------|
| Remote push (Expo)   | Not supported         | Supported            | Supported     | Supported        |
| Local reminders      | Not scheduled         | Scheduled            | Scheduled     | Scheduled        |
| Background task push | Not run               | Run                  | Run           | Run              |

- **Expo Go on Android:** Push and reminder logic is intentionally skipped to avoid runtime errors (SDK 53+).
- **Development/production builds:** Full push and reminder behaviour is enabled.

### 4.2 How push is set up (step by step)

1. **On app launch (`app/_layout.tsx`)**  
   - If not Android Expo Go:
     - `setNotificationHandler` is called so that when a **remote** push arrives **while the app is open**, the notification is shown (banner, list, sound).
     - `loadAndSyncReminderNotifications()` runs: permission, Android channel, and **local** reminder schedules are synced from storage.
     - `registerForPushNotificationsAsync()` runs: permission is requested (if needed), and the **Expo Push Token** is obtained and stored locally (`@zaf/expo_push_token`). No UI is shown; this is automatic.

2. **Push token storage**  
   - Implemented in `lib/push-notifications.ts`:
     - `registerForPushNotificationsAsync()` – requests permission, gets Expo Push Token, saves it with AsyncStorage.
     - `getStoredExpoPushToken()` – returns the stored token (used by the background task and any future backend).

3. **When a remote push is received**  
   - **Foreground:** The handler set in step 1 decides whether to show the notification (we show it).
   - **Background/quit:** The system shows the notification.  
   - **Tap:** `addNotificationResponseReceivedListener` in `_layout.tsx` runs; if the payload has `data.url` or `data.screen`, the app navigates to that route.

4. **Sending a remote push**  
   - Use [Expo Push Tool](https://expo.dev/notifications) or the Expo Push API:
     - **POST** `https://exp.host/--/api/v2/push/send`
     - Body example: `{ "to": "ExponentPushToken[xxx]", "title": "...", "body": "...", "data": { "screen": "/(tabs)" } }`
   - The `to` value must be the token stored by the app (e.g. from `getStoredExpoPushToken()` or your backend). The app does not expose this token in the UI; it is used internally (e.g. by the background task).

### 4.3 Local reminder notifications (Android and iOS)

- Implemented in `lib/reminder-notifications.ts`.
- **Expo Go on Android:** This module does **not** schedule anything (to avoid loading unsupported native code).
- **Development/production (and iOS Expo Go):**
  1. **Permission and channel:** `setupReminderNotifications()` requests permission and creates the Android channel `zaf-reminders`.
  2. **Storage:** Reminders are stored in AsyncStorage (`@zaf/reminders`) as a list of `{ id, time: "HH:mm", enabled }`. Optional custom title/body for the notification are in `@zaf/reminder_notification_title` and `@zaf/reminder_notification_body` (body can use `{time}`).
  3. **Scheduling:** `syncReminderNotifications(reminders)` cancels existing reminder notifications and schedules one **local** notification per enabled reminder with a **daily** trigger at that time (e.g. 08:41). Title/body come from storage or defaults (e.g. "ZAF リマインダー", "瞑想の時間です。（08:41）").
  4. **When reminders change:** Settings screen calls `syncReminderNotifications` when the user adds, edits, deletes, or toggles reminders.

So: **local reminders** = device-side scheduling at a fixed time each day; **remote push** = sent by your server or by the background task (below).

### 4.4 Background task sending a push at reminder time (Android and iOS)

- Implemented in `lib/background.ts` using **expo-background-task**.
- **Expo Go:** The task is **not** registered (avoids “not available” warnings).
- **Development/production:**
  1. **Registration:** On app start, `registerBackgroundFetchAsync()` registers a single task with a **minimum interval of 15 minutes** (OS may enforce a longer interval).
  2. **When the task runs:**  
     - Reads current time (HH:mm).  
     - Loads reminders from storage; if any **enabled** reminder has `time === current HH:mm`:  
       - Loads stored Expo Push Token, reminder title, and body (with `{time}` replaced).  
       - **POSTs** to `https://exp.host/--/api/v2/push/send` with `to`, `title`, `body`, `sound: 'default'`, and on Android `channelId: 'zaf-reminders'`.  
     - So at that moment the app effectively “sends a request to Expo” and Expo delivers a **remote** push to the same device.
  3. **Limitation:** The task runs every 15+ minutes, so a reminder at 8:41 only triggers a push **if** the task run happens at 8:41. For **exact** daily times, **local** reminders (section 4.3) are more reliable when the app is not Expo Go.

### 4.5 Summary

- **Run the app:** Push token is registered automatically on launch; no “Get Token” button.
- **Android:** Use a **development build** for push and reminders; Expo Go on Android does not support them.
- **iOS:** Push and reminders work in Expo Go and in builds; production push needs APNs credentials in EAS.
- **Remote push:** Send via Expo Push API or Expo Push Tool using the stored token.
- **Reminders:** Local notifications for exact times (when not Expo Go Android); background task can additionally send a remote push when its run coincides with a reminder time.

---

## 5. Business Logic (Step by Step)

All persistent data is stored in **AsyncStorage** (no backend). Keys are prefixed with `@zaf/`.

### 5.1 Onboarding and first launch

1. **Splash / routing**  
   - `app/index.tsx` (or entry) checks `getOnboardingCompleted()` from storage.
  2. If **false:** User is sent to onboarding flow: `splash` → `onboarding` → `goal-setup` → `goal-setup-step2` → `goal-setup-step3`. On completion, `setOnboardingCompleted(true)` and `setAppUsageStartDate(isoDate)` are called, then user is sent to the main app `(tabs)`.
  3. If **true:** User goes directly to `(tabs)` (Home).

### 5.2 Mission goal (目標日数) and daily target

- **Goal days:** Number of days the user wants to complete per “mission” (e.g. 20).  
  - Stored: `@zaf/goal_days`.  
  - Settings screen: user can change value; `setGoalDays` / `getGoalDays` in `lib/storage.ts`.
- **Daily meditation target (minutes):** A calendar day counts as “completed” only if total meditation that day ≥ this value.  
  - Stored: `@zaf/daily_meditation_target_minutes`.  
  - Settings: user can set 1–1440; `setDailyMeditationTargetMinutes` / `getDailyMeditationTargetMinutes`.

### 5.3 Progress (circle on Home)

1. **Data:** Home loads `getGoalDays()`, `getDailyMeditationTargetMinutes()`, and `getSessions()`.
2. **Completed days:** `getProgressDaysCount(sessions, targetMinutes)` in `lib/storage.ts`:
   - Groups sessions by `date` (ISO date).
   - Sums minutes per day (using `sessionMinutes(s)` per session).
   - Counts days where sum ≥ `targetMinutes`.
3. **Display:** Progress ring shows `completedDays / goalDays` (capped so it doesn’t exceed the goal). So progress = “how many days reached the daily target” toward the current goal.

### 5.4 Today’s meditation time

- **Computation:** `getMinutesForDate(sessions, todayISO)` – sum of all session minutes for today.
- **Display:** Shown on Home as “今日の瞑想時間: X分 / Y分” (today’s minutes / daily target).

### 5.5 Sessions and history

- **Model:** Each session is `SessionRecord`: `date` (ISO), `durationMinutes`, optional `durationSeconds`, `type`, `completedAt`.
- **Storage:** `@zaf/sessions` – array of session records. Only the last **30 days** are kept (`SESSION_HISTORY_RETENTION_DAYS`); older ones are pruned when sessions are read.
- **Adding a session:** When the user finishes a session (e.g. in session timer or guidance flow), the app calls `addSession(...)` (or equivalent) which appends a new record and then **updates missions achieved** (see below).

### 5.6 Missions achieved (missions count)

- **Stored:** `@zaf/missions_achieved` – a single number that **only increases** when the user completes a full goal (e.g. 20 days).
- **Logic (in `lib/storage.ts`):** When sessions are updated (e.g. after adding a session), the app:
  - Computes `progressDays = getProgressDaysCount(sessions, targetMinutes)` and `goalDays = getGoalDays()`.
  - Computes how many **full goal cycles** are now completed: `newCycles = Math.floor(progressDays / goalDays)`, and previously `oldCycles` from the last stored state (or 0).
  - If `newCycles > oldCycles`, it calls `setMissionsAchieved(getMissionsAchieved() + (newCycles - oldCycles))`.
- So “missions achieved” is a persistent, non-decreasing count of completed goals; changing goal days later does not reduce it.

### 5.7 Reminders (リマインダー)

- **Storage:** `@zaf/reminders` – array of `{ id, time: "HH:mm", enabled }`. Optional: `@zaf/reminder_notification_title`, `@zaf/reminder_notification_body` (body can contain `{time}`).
- **UI:** Settings screen lists reminders; user can add (with time picker), edit (tap time), delete, or toggle enabled. Max 10 reminders.
- **Sync:** On any change, Settings calls `syncReminderNotifications(reminders)` so local scheduled notifications match the list (see section 4.3). Custom title/body are saved to storage and used when scheduling and when the background task sends a push (see section 4.4).

### 5.8 Profile and theme

- **Profile:** Display name, icon (preset or custom image), color – stored in `@zaf/display_name`, `@zaf/profile_icon`, `@zaf/color_scheme`, `@zaf/custom_profile_images`. Edited in profile-settings and profile-edit-* screens.
- **Theme:** Light / dark / system – stored in `@zaf/color_scheme`; applied via `ThemePreferenceContext` and navigation theme.

### 5.9 Session timer and BGM

- **Timer preset, BGM track, timer end sound, BGM on/off:** Stored in `@zaf/timer_preset`, `@zaf/bgm_track`, `@zaf/timer_end_sound`, `@zaf/session_bgm_enabled`, etc. Session screen and timer screen read/write these and start the timer; on completion, a session record is added and missions achieved are updated as in 5.5 and 5.6.

### 5.10 Record / stats (profile or goal detail)

- **Source:** `getRecordStats()` in `lib/storage.ts` loads app start date, sessions, goal days, daily target, and `getMissionsAchieved()`. It computes total meditation days, total count, total minutes, and returns them with `missionsAchieved`. Used by the Record tab or goal-detail screen to show “DAYS”, “HOURS”, “MISSIONS” and history.

---

## File overview (key pieces of business logic)

| Area              | Main files / modules |
|-------------------|----------------------|
| Storage           | `lib/storage.ts` (all keys, get/set, progress and missions logic) |
| Push token        | `lib/push-notifications.ts` |
| Reminders (local) | `lib/reminder-notifications.ts` |
| Background push   | `lib/background.ts` |
| App startup       | `app/_layout.tsx` (notification handler, reminder sync, push registration, background task registration) |
| Home progress     | `app/(tabs)/index.tsx` (goal, daily target, sessions, progress ring, today’s time) |
| Settings          | `app/(tabs)/settings.tsx` (goal days, daily target, reminders, notification title/body) |
| Session / timer   | `app/(tabs)/session.tsx`, `app/session-timer.tsx` (and any guidance flow that adds sessions) |

---

## Quick reference commands

```bash
# Run app
npm install && npm start

# Build Android (development)
eas build --profile development --platform android

# Build Android (production)
eas build --profile production --platform android

# Build iOS (development)
eas build --profile development --platform ios

# Build iOS (production)
eas build --profile production --platform ios

# List builds
eas build:list --platform android
eas build:list --platform ios
```

For more on EAS and credentials, see [Expo EAS Build](https://docs.expo.dev/build/introduction/). For push details, see `docs/push-notifications.md` in this repo.
