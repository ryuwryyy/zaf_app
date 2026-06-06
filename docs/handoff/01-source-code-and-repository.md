# 1. Source code and repository

## 1.1 Git repository (recommended)

| Item | Value |
|------|--------|
| **URL** | https://github.com/ryuwryyy/zaf_app.git |
| **Default branch** | `main` |
| **Package name** | `odza` (Expo app) |
| **Android package** | `com.odza.app` |
| **iOS bundle ID** | `com.odza.app` |

### What you must do (developer)

1. **Push latest code** so `main` on GitHub includes all handover commits.
2. **Grant access** to the client (or their agency):
   - GitHub → repository **Settings → Collaborators** (or transfer repo to their org).
   - Role: at least **Write** for maintenance; **Admin** if they should manage settings.
3. Confirm they can run:  
   `git clone https://github.com/ryuwryyy/zaf_app.git`

### What is intentionally NOT in Git

| File | Reason |
|------|--------|
| `.env` | Secrets |
| `google-service-account-key.json` | Firebase Admin key (gitignored) |
| `logs/` | May contain operational details |

---

## 1.2 Zip alternative

If the client cannot use Git immediately:

1. From project root, create an archive **excluding** `node_modules`, `.expo`, `logs`, `.env`, and `google-service-account-key.json`.
2. Example (PowerShell, from parent folder):

```powershell
# Adjust paths as needed; excludes heavy/sensitive folders
Compress-Archive -Path "D:\projects\odza\*" -DestinationPath "D:\odza-source-handoff.zip"
# Manually verify .env and service account JSON are NOT inside the zip
```

3. Send the Zip via agreed secure channel; send secrets separately.

---

## 1.3 Key directories (for third-party developers)

| Path | Purpose |
|------|---------|
| `app/` | Screens (Expo Router) |
| `lib/` | Firebase, quotes, products, push, storage |
| `scripts/` | Campaign sender, CSV/JSON import |
| `assets/` | Images, icons, screenshots |
| `docs/` | Technical and handover docs |
| `manual.md` | Non-engineer operation manual (Japanese) |
| `app.json` / `eas.json` | App and EAS build config |
| `google-services.json` | Firebase Android client config (safe in repo; not the Admin key) |

---

## 1.4 npm scripts (operations)

| Command | Purpose |
|---------|---------|
| `npm start` | Local dev server |
| `npm run android` / `ios` / `web` | Run on platform |
| `npm run send-campaigns` | Send pending Firestore campaigns via Expo Push |
| `npm run send-campaigns:log` | Same, append log to `logs/campaign-run.log` |
| `npm run import-quotes` | Bulk import quotes CSV/JSON → Firestore |
| `npm run import-zaf-products` | Bulk import products CSV/JSON → Firestore |
