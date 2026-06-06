# 3. Environment setup, build, and deployment

## 3.1 Prerequisites

| Tool | Version / note |
|------|----------------|
| Node.js | 18 or 20 LTS recommended |
| npm | Comes with Node |
| EAS CLI | `npm install -g eas-cli` (for cloud builds only) |
| Expo account | Required for EAS builds |

---

## 3.2 Environment variables

**Template (committed):** `.env.example`  
**Local secrets (never commit):** copy to `.env` in project root.

| Variable | Required for | Description |
|----------|--------------|-------------|
| `EXPO_ACCESS_TOKEN` | Campaign send (recommended) | Expo access token |
| `GOOGLE_APPLICATION_CREDENTIALS` | Scripts → Firestore Admin | Full path to service account JSON |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | CI alternative | Raw JSON string (optional) |
| `CAMPAIGN_LOG_FILE` | Optional | e.g. `logs/campaign-run.log` |
| `EXPO_RECEIPT_POLL_INTERVAL_MS` | Optional | Default `4000` |
| `EXPO_RECEIPT_MAX_WAIT_MS` | Optional | Default `120000` |

**Campaign script loads `.env` automatically** when you run `npm run send-campaigns`.

Example `.env` (client fills real values):

```env
EXPO_ACCESS_TOKEN=your_token_here
GOOGLE_APPLICATION_CREDENTIALS=D:\secure\path\service-account.json
```

Place service account file **outside** the repo when possible.

---

## 3.3 Local startup

```powershell
cd D:\projects\odza
npm install
npm start
```

- Press `a` (Android emulator), `i` (iOS simulator), or scan QR with **development build** (not Expo Go for full push/reminders on Android).
- See `README.md` section 1 for details.

---

## 3.4 Build procedure (EAS)

Login once:

```powershell
eas login
```

| Profile | Use case | Command |
|---------|----------|---------|
| **development** | Dev client, push testing | `eas build --profile development --platform android` |
| **preview** | Internal APK | `eas build --profile preview --platform android` |
| **production** | Play Store (AAB) | `eas build --profile production --platform android` |

iOS: same profiles with `--platform ios`.

Download artifacts from the build URL in the terminal or https://expo.dev → project **odza** → **Builds**.

**Optional:** For guaranteed APK on preview, add to `eas.json` under `preview`:

```json
"android": { "buildType": "apk" }
```

---

## 3.5 Production deployment procedure

### Mobile app (Google Play)

1. `eas build --profile production --platform android`
2. Download **AAB** from Expo dashboard
3. Upload to **Google Play Console** (client account)
4. Complete store listing, testing track, release

### Mobile app (iOS App Store)

1. `eas build --profile production --platform ios`
2. Submit via EAS Submit or App Store Connect (Apple Developer account required)

### Content updates (no app rebuild)

These do **not** require a new store build if only data changes:

- Firestore `quotes`, `zaf_products`, `campaigns`
- Commands: `npm run import-quotes`, `npm run import-zaf-products`, `npm run send-campaigns`

### Backend / campaigns

There is **no** deployed Cloud Function. Campaign sending is a **local/scheduled script**:

- `npm run send-campaigns` or `npm run send-campaigns:log`
- Scheduling: `docs/campaign-scheduling-windows.md` (Windows Task Scheduler)

---

## 3.6 Firebase client config (in repo)

| File | Purpose |
|------|---------|
| `lib/firebase.ts` | Web SDK config (projectId `odza-1af37`) |
| `google-services.json` | Android Firebase client config |

These are **public client** identifiers, not Admin secrets.
