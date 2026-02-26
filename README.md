# Odza – 瞑想アプリ

目標・セッション・リマインダー・プッシュ通知を備えた React Native（Expo）の瞑想アプリです。このドキュメントでは、プロジェクトの起動方法、Android / iOS のビルド、プッシュ通知の仕組み、ビジネスロジックの実装について説明します。

**非エンジニアの方:** ZAF商品・名言・通知の更新や運用（コード不要）については、**[docs/operation-manual-ja.md](docs/operation-manual-ja.md)**（運用マニュアル）を参照してください。

---

## 目次

1. [プロジェクトの起動方法](#1-プロジェクトの起動方法)
2. [Android のビルド](#2-android-のビルド)
3. [iOS のビルド](#3-ios-のビルド)
4. [プッシュ通知（Android / iOS）](#4-プッシュ通知android--ios)
5. [ビジネスロジック（ステップ別）](#5-ビジネスロジックステップ別)

---

## 1. プロジェクトの起動方法

### 必要な環境

- **Node.js**（LTS、18 または 20 推奨）
- **npm** または **yarn**
- **Expo Go** アプリ（任意・実機での簡易テスト用）
- **EAS CLI**（任意・ビルド時のみ）: `npm install -g eas-cli`

### ステップ 1: 依存関係のインストール

プロジェクトのルートで（必要に応じてリポジトリをクローンしてから）:

```bash
cd <odzaプロジェクトのパス>
npm install
```

### ステップ 2: 開発サーバーの起動

```bash
npm start
```

`expo start` が実行され、ターミナルに Metro バンドラが表示されます。

### ステップ 3: 実機またはシミュレータで実行

- **Android:** ターミナルで `a` を押すか、`npm run android` を実行（Android エミュレータ／実機で Expo が開きます）。
- **iOS:** ターミナルで `i` を押すか、`npm run ios` を実行（iOS シミュレータで起動・Mac のみ）。
- **Web:** ターミナルで `w` を押すか、`npm run web` を実行。

### ステップ 4: Expo Go で開く（任意）

1. App Store（iOS）または Google Play（Android）から **Expo Go** をインストール。
2. スマートフォンとパソコンが**同じ Wi‑Fi** に接続されていることを確認。
3. ターミナルに表示された QR コードを、Expo Go（Android）またはカメラアプリ（iOS）でスキャン。

**注意:** 一部の機能（Android のプッシュ通知、Android のローカルリマインダー、バックグラウンドタスク）は **Expo Go では動作しません**。フル機能を使うには **開発ビルド** を使用してください（下記ビルドセクション参照）。

---

## 2. Android のビルド

ビルドは **EAS Build**（Expo Application Services）で行います。Android Studio はローカルに不要で、ビルドはクラウドで実行されます。

### 必要な環境

- **EAS CLI:** `npm install -g eas-cli`
- **Expo アカウント:** `eas login` でサインイン
- **Android:** EAS クラウドビルドのため、追加のローカル環境は不要

### ステップ 1: プロジェクト設定（済）

- `app.json` – Android の `package` は `com.odza.app`、`googleServicesFile` は `./google-services.json` を参照。
- `eas.json` – ビルドプロファイル: `development`、`preview`、`production`。

### ステップ 2: ビルドプロファイルの選択

| プロファイル   | 用途                                           | コマンド |
|----------------|------------------------------------------------|----------|
| **development** | 実機テスト、プッシュ、リマインダー、バックグラウンドタスク | `eas build --profile development --platform android` |
| **preview**     | 社内配布用（APK）、ストア提出なし             | `eas build --profile preview --platform android`     |
| **production**  | Google Play 提出用（AAB）                      | `eas build --profile production --platform android`   |

### ステップ 3: ビルドの実行

**開発ビルド（テスト推奨）:**

```bash
eas build --profile development --platform android
```

**本番ビルド:**

```bash
eas build --profile production --platform android
```

### ステップ 4: 完了後のインストール

1. 初回は EAS がキーストアなどの認証情報の設定を促します。
2. ビルドは Expo のサーバーで実行され、進捗がターミナルに表示されます。
3. 完了後、**APK**（preview/development）または **AAB**（production）のダウンロードリンクが発行されます。
4. APK を端末にインストールするか、AAB を Google Play Console に提出します。

### ステップ 5: （任意）既存ビルドの一覧

```bash
eas build:list --platform android
```

---

## 3. iOS のビルド

iOS も **EAS Build** でビルドします。**Mac は必須ではありません**。ビルドはクラウドで実行されます。

### 必要な環境

- **EAS CLI:** `npm install -g eas-cli`
- **Expo アカウント:** `eas login`
- **Apple Developer アカウント**（有料）– TestFlight / App Store 配布用
- 初回: [App Store Connect](https://appstoreconnect.apple.com) で Apple の利用規約に同意（案内があれば）

### ステップ 1: プロジェクト設定（済）

- `app.json` – iOS の `bundleIdentifier` は `com.odza.app`。
- `eas.json` – Android と同様のプロファイル: `development`、`preview`、`production`。

### ステップ 2: ビルドプロファイルの選択

| プロファイル   | 用途                               |
|----------------|------------------------------------|
| **development** | 実機テスト、プッシュ、リマインダー |
| **preview**     | 社内配布（TestFlight または ad-hoc） |
| **production**  | App Store 提出                     |

### ステップ 3: ビルドの実行

**開発ビルド:**

```bash
eas build --profile development --platform ios
```

**本番ビルド:**

```bash
eas build --profile production --platform ios
```

### ステップ 4: 認証情報とインストール

1. 初回: EAS が **Apple ID** でのサインインと、プロビジョニングプロファイル／証明書の作成・選択を案内します。
2. ビルドはクラウドで実行され、完了後に **.ipa** のリンクが発行されます。
3. リンク／QR コードでインストール（development/preview）、または App Store Connect にアップロード（production）。

### ステップ 5: （任意）既存ビルドの一覧

```bash
eas build:list --platform ios
```

---

## 4. プッシュ通知（Android / iOS）

アプリは **リモートプッシュ**（Expo Push）と **ローカルリマインダー通知** に対応しています。Android / iOS、および Expo Go と開発・本番ビルドで挙動が一部異なります。

### 4.1 概要

| 機能                 | Android（Expo Go） | Android（開発ビルド） | iOS（Expo Go） | iOS（開発ビルド） |
|----------------------|--------------------|-------------------------|----------------|---------------------|
| リモートプッシュ     | 非対応             | 対応                    | 対応           | 対応                |
| ローカルリマインダー | スケジュールされない | スケジュールされる      | スケジュールされる | スケジュールされる  |
| バックグラウンドプッシュ | 実行されない       | 実行される              | 実行される     | 実行される          |

- **Android の Expo Go:** プッシュとリマインダーは、ランタイムエラー回避のため意図的に無効化されています（SDK 53+）。
- **開発・本番ビルド:** プッシュとリマインダーは有効です。

### 4.2 プッシュの設定（ステップ別）

1. **アプリ起動時（`app/_layout.tsx`）**  
   - Android Expo Go 以外の場合:
     - **リモート**プッシュが**アプリ起動中**に届いたときに通知を表示するため、`setNotificationHandler` が設定されます。
     - `loadAndSyncReminderNotifications()` が実行され、権限・Android チャンネル・**ローカル**リマインダーのスケジュールがストレージと同期されます。
     - `registerForPushNotificationsAsync()` が実行され、権限要求（必要な場合）ののち **Expo Push トークン** が取得され、ローカル（`@zaf/expo_push_token`）に保存されます。UI には表示されず、自動で行われます。

2. **プッシュトークンの保存**  
   - 実装: `lib/push-notifications.ts`
     - `registerForPushNotificationsAsync()` … 権限要求、Expo Push トークン取得、AsyncStorage に保存。
     - `getStoredExpoPushToken()` … 保存されたトークンを返す（バックグラウンドタスクや将来のバックエンドで使用）。

3. **リモートプッシュ受信時**  
   - **フォアグラウンド:** 上記で設定したハンドラが通知を表示するか判定（本アプリでは表示）。
   - **バックグラウンド／終了時:** OS が通知を表示。  
   - **タップ時:** `_layout.tsx` の `addNotificationResponseReceivedListener` が実行され、ペイロードに `data.url` または `data.screen` があれば、その画面へ遷移します。

4. **リモートプッシュの送信**  
   - [Expo Push Tool](https://expo.dev/notifications) または Expo Push API を使用:
     - **POST** `https://exp.host/--/api/v2/push/send`
     - ボディ例: `{ "to": "ExponentPushToken[xxx]", "title": "...", "body": "...", "data": { "screen": "/(tabs)" } }`
   - `to` にはアプリが保存したトークン（例: `getStoredExpoPushToken()` やバックエンドから取得）を指定します。アプリの UI ではトークンは表示されず、内部（バックグラウンドタスクなど）でのみ使用されます。

### 4.3 ローカルリマインダー通知（Android / iOS）

- 実装: `lib/reminder-notifications.ts`。
- **Android の Expo Go:** このモジュールは**何もスケジュールしません**（未対応のネイティブコード読み込みを避けるため）。
- **開発・本番ビルド（および iOS の Expo Go）:**
  1. **権限とチャンネル:** `setupReminderNotifications()` が権限を要求し、Android チャンネル `zaf-reminders` を作成します。
  2. **ストレージ:** リマインダーは AsyncStorage（`@zaf/reminders`）に `{ id, time: "HH:mm", enabled }` の配列で保存されます。通知のタイトル・本文のカスタムは `@zaf/reminder_notification_title` と `@zaf/reminder_notification_body`（本文で `{time}` が使えます）。
  3. **スケジュール:** `syncReminderNotifications(reminders)` が既存のリマインダー通知をキャンセルし、有効なリマインダーごとに**ローカル**通知を 1 件、その時刻に**毎日**発火するようスケジュールします（例: 08:41）。タイトル・本文はストレージまたはデフォルト（例: 「ZAF リマインダー」「瞑想の時間です。（08:41）」）から取得します。
  4. **リマインダー変更時:** 設定画面で追加・編集・削除・ON/OFF したときに、Settings が `syncReminderNotifications` を呼び出します。

**ローカルリマインダー** = 端末側で毎日決まった時刻に発火する通知。**リモートプッシュ** = サーバーまたはバックグラウンドタスク（下記）から送信する通知。

### 4.4 リマインダー時刻にプッシュを送るバックグラウンドタスク（Android / iOS）

- 実装: `lib/background.ts`（**expo-background-task** 使用）。
- **Expo Go:** タスクは**登録されません**（「利用できません」警告を避けるため）。
- **開発・本番ビルド:**
  1. **登録:** アプリ起動時に `registerBackgroundFetchAsync()` が、**最低 15 分間隔**のタスクを 1 つ登録します（OS がより長い間隔にすることもあります）。
  2. **タスク実行時:**  
     - 現在時刻（HH:mm）を取得。  
     - ストレージからリマインダーを読み込み、**有効**なリマインダーのうち `time === 現在時刻` のものがあれば:  
       - 保存されている Expo Push トークン、リマインダーのタイトル・本文（`{time}` を置換）を読み込み。  
       - **POST** で `https://exp.host/--/api/v2/push/send` に `to`、`title`、`body`、`sound: 'default'`、Android の場合は `channelId: 'zaf-reminders'` を送信。  
     - この時点でアプリは Expo にリクエストを送り、Expo が**リモート**プッシュを同じ端末に配信します。
  3. **制限:** タスクは 15 分以上間隔で実行されるため、8:41 のリマインダーは**8:41 にタスクが実行された場合のみ**プッシュが送られます。**正確な毎日の時刻**には、**ローカル**リマインダー（4.3）の方が、Expo Go 以外では確実です。

### 4.5 まとめ

- **アプリ起動:** プッシュトークンは起動時に自動登録され、「トークン取得」ボタンはありません。
- **Android:** プッシュとリマインダーには**開発ビルド**を使用。Expo Go の Android では対応していません。
- **iOS:** プッシュとリマインダーは Expo Go およびビルドで動作。本番プッシュには EAS で APNs の認証情報が必要です。
- **リモートプッシュ:** 保存されたトークンを使って Expo Push API または Expo Push Tool から送信。
- **リマインダー:** 正確な時刻にはローカル通知（Expo Go Android 以外）。バックグラウンドタスクの実行がリマインダー時刻と重なった場合、リモートプッシュも送信されます。

---

## 5. ビジネスロジック（ステップ別）

永続データはすべて **AsyncStorage** に保存されています（バックエンドなし）。キーは `@zaf/` で始まります。

### 5.1 オンボーディングと初回起動

1. **スプラッシュ／ルーティング**  
   - `app/index.tsx`（またはエントリ）がストレージの `getOnboardingCompleted()` を参照します。
2. **false の場合:** オンボーディングへ: `splash` → `onboarding` → `goal-setup` → `goal-setup-step2` → `goal-setup-step3`。完了時に `setOnboardingCompleted(true)` と `setAppUsageStartDate(isoDate)` が呼ばれ、メインアプリ `(tabs)` へ遷移します。
3. **true の場合:** そのまま `(tabs)`（ホーム）へ遷移します。

### 5.2 ミッション目標（目標日数）と 1 日あたりの目標

- **目標日数:** 1 回の「ミッション」で達成したい日数（例: 20 日）。  
  - 保存先: `@zaf/goal_days`。  
  - 設定画面で変更可能。`lib/storage.ts` の `setGoalDays` / `getGoalDays`。
- **1 日あたりの瞑想目標（分）:** その日の合計瞑想時間がこの値以上の場合のみ、その日を「達成」とカウントします。  
  - 保存先: `@zaf/daily_meditation_target_minutes`。  
  - 設定で 1～1440 分を指定。`setDailyMeditationTargetMinutes` / `getDailyMeditationTargetMinutes`。

### 5.3 進捗（ホームの円グラフ）

1. **データ:** ホームは `getGoalDays()`、`getDailyMeditationTargetMinutes()`、`getSessions()` を読み込みます。
2. **達成日数:** `lib/storage.ts` の `getProgressDaysCount(sessions, targetMinutes)`:
   - セッションを `date`（ISO 日付）でグループ化。
   - 日ごとの分数を合計（セッションごとに `sessionMinutes(s)` を使用）。
   - 合計が `targetMinutes` 以上の日数をカウント。
3. **表示:** 進捗リングは `達成日数 / 目標日数` を表示（目標を超えないようキャップ）。進捗 = 「1 日目標を達成した日が何日か」を現在の目標に対して表示します。

### 5.4 今日の瞑想時間

- **計算:** `getMinutesForDate(sessions, todayISO)` … 今日の全セッションの分数の合計。
- **表示:** ホームに「今日の瞑想時間: X分 / Y分」（今日の分数 / 1 日目標）として表示。

### 5.5 セッションと履歴

- **モデル:** 各セッションは `SessionRecord`: `date`（ISO）、`durationMinutes`、任意で `durationSeconds`、`type`、`completedAt`。
- **保存先:** `@zaf/sessions` … セッションの配列。**直近 30 日分**のみ保持（`SESSION_HISTORY_RETENTION_DAYS`）。読み込み時に古い分は削除されます。
- **セッション追加:** ユーザーがセッションを終了したとき（セッションタイマーやガイダンスフローなど）、アプリが `addSession(...)`（または同等）を呼び、新規レコードを追加したあと**ミッション達成数**を更新します（下記参照）。

### 5.6 ミッション達成数

- **保存先:** `@zaf/missions_achieved` … ユーザーが目標を完全に達成したとき（例: 20 日）に**のみ**増える数値。
- **ロジック（`lib/storage.ts`）:** セッション更新時（例: セッション追加後）、アプリは:
  - `progressDays = getProgressDaysCount(sessions, targetMinutes)` と `goalDays = getGoalDays()` を計算。
  - 達成した**目標サイクル数**を計算: `newCycles = Math.floor(progressDays / goalDays)`。前回の状態（または 0）から `oldCycles` を取得。
  - `newCycles > oldCycles` なら `setMissionsAchieved(getMissionsAchieved() + (newCycles - oldCycles))` を呼びます。
- 「ミッション達成数」は、達成した目標の累積で、**減ることはありません**。後から目標日数を変えても減りません。

### 5.7 リマインダー

- **保存先:** `@zaf/reminders` … `{ id, time: "HH:mm", enabled }` の配列。任意: `@zaf/reminder_notification_title`、`@zaf/reminder_notification_body`（本文で `{time}` が使えます）。
- **UI:** 設定画面で一覧表示。追加（時刻ピッカー）、編集（時刻タップ）、削除、ON/OFF が可能。最大 10 件。
- **同期:** 変更のたびに Settings が `syncReminderNotifications(reminders)` を呼び、ローカルでスケジュールされている通知が一覧と一致するようにします（4.3 参照）。カスタムのタイトル・本文はストレージに保存され、スケジュール時およびバックグラウンドタスクがプッシュを送る際（4.4 参照）に使われます。

### 5.8 プロフィールとテーマ

- **プロフィール:** 表示名、アイコン（プリセットまたはカスタム画像）、カラー … `@zaf/display_name`、`@zaf/profile_icon`、`@zaf/color_scheme`、`@zaf/custom_profile_images` に保存。profile-settings および profile-edit-* 画面で編集。
- **テーマ:** ライト / ダーク / システム … `@zaf/color_scheme` に保存。`ThemePreferenceContext` とナビゲーションのテーマで適用されます。

### 5.9 セッションタイマーと BGM

- **タイマープリセット、BGM トラック、タイマー終了音、BGM ON/OFF:** `@zaf/timer_preset`、`@zaf/bgm_track`、`@zaf/timer_end_sound`、`@zaf/session_bgm_enabled` などに保存。セッション画面とタイマー画面で読み書きし、タイマーを開始。完了時にセッションレコードが追加され、5.5・5.6 と同様にミッション達成数が更新されます。

### 5.10 レコード／統計（プロフィールまたは目標詳細）

- **取得:** `lib/storage.ts` の `getRecordStats()` がアプリ開始日、セッション、目標日数、1 日目標、`getMissionsAchieved()` を読み込み、総瞑想日数・総回数・総分数を計算し、`missionsAchieved` とともに返します。レコードタブまたは goal-detail 画面で「DAYS」「HOURS」「MISSIONS」と履歴を表示するために使用されます。

---

## ファイル概要（ビジネスロジックの主な担当）

| 領域           | 主なファイル / モジュール |
|----------------|---------------------------|
| ストレージ     | `lib/storage.ts`（全キー、get/set、進捗・ミッションロジック） |
| プッシュトークン | `lib/push-notifications.ts` |
| リマインダー（ローカル） | `lib/reminder-notifications.ts` |
| バックグラウンドプッシュ | `lib/background.ts` |
| アプリ起動     | `app/_layout.tsx`（通知ハンドラ、リマインダー同期、プッシュ登録、バックグラウンドタスク登録） |
| ホーム進捗     | `app/(tabs)/index.tsx`（目標、1 日目標、セッション、進捗リング、今日の時間） |
| 設定           | `app/(tabs)/settings.tsx`（目標日数、1 日目標、リマインダー、通知タイトル・本文） |
| セッション / タイマー | `app/(tabs)/session.tsx`、`app/session-timer.tsx`（およびセッションを追加するガイダンスフロー） |

---

## コマンド早見表

```bash
# アプリの起動
npm install && npm start

# Android ビルド（開発用）
eas build --profile development --platform android

# Android ビルド（本番用）
eas build --profile production --platform android

# iOS ビルド（開発用）
eas build --profile development --platform ios

# iOS ビルド（本番用）
eas build --profile production --platform ios

# ビルド一覧
eas build:list --platform android
eas build:list --platform ios
```

EAS と認証情報の詳細は [Expo EAS Build](https://docs.expo.dev/build/introduction/) を参照してください。プッシュの詳細はリポジトリ内の `docs/push-notifications.md` を参照してください。
