# 4. Firestore, backend scripts, and notifications

## 4.1 Architecture overview

```
Mobile app (Expo)
  ├─ reads: quotes, zaf_products (Firestore)
  ├─ writes: push_tokens (Firestore, merge upsert)
  └─ local: reminders (AsyncStorage, not Firestore)

PC / server (Node scripts + Firebase Admin SDK)
  ├─ import-quotes.mjs → quotes
  ├─ import-zaf-products.mjs → zaf_products
  └─ send-pending-campaigns.mjs → reads campaigns + push_tokens → Expo Push API
```

**No Cloud Functions** are deployed in this project at handover.

---

## 4.2 Firestore collections

### `quotes`

| Field | Type | Notes |
|-------|------|-------|
| `text` | string | Required |
| `author` | string | Optional |
| `profession` | string | Optional (attribution) |
| `enabled` | boolean | Default true; false hides |

**App behavior:** Home screen “今日の気づき”; rotates every **15 minutes**; cached locally.  
**Import:** `npm run import-quotes -- --file path/to.csv` (`--merge` to upsert)

CSV columns: `id,text,author,profession,enabled`  
Sample: `scripts/quotes.sample.csv`

---

### `zaf_products`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required |
| `description` | string | Required |
| `imageUrl` | string | Optional; public HTTPS URL |
| `enabled` | boolean | Default true |
| `sortOrder` | number | Optional sort |

**App behavior:** Settings grid + product detail; AsyncStorage cache.  
**Import:** `npm run import-zaf-products -- --file path/to.csv`

CSV columns: `id,title,description,imageUrl,enabled,sortOrder`  
Sample: `scripts/zaf-products.sample.csv`

---

### `push_tokens`

| Field | Type | Notes |
|-------|------|-------|
| Document ID | string | Same as Expo push token string |
| `token` | string | Expo push token |
| `platform` | string | `ios` / `android` |
| `appVersion` | string | From app config |
| `updatedAt` | timestamp | Server timestamp on upsert |

**Written by app:** `lib/push-notifications.ts`  
**Deleted by script:** invalid tokens (`DeviceNotRegistered`)

---

### `campaigns`

**Create manually in Firebase Console** (or Admin script), then send via `npm run send-campaigns`.

| Field | When set | Notes |
|-------|----------|-------|
| `title` | You create | Notification title |
| `body` | You create | Notification body |
| `status` | You create → script updates | Start with `"pending"` |
| `scheduledAt` | Optional | Timestamp; send only when due |
| `data` | Optional | JSON object for app deep link data |
| `sentAt`, `sentCount`, `errorCount`, … | Script | After send |
| `receiptOkCount`, `receiptErrorCount`, `receiptPendingCount` | Script | Expo receipt polling |
| `deliveryOutcome` | Script | `delivered`, `partially_delivered`, `failed`, `receipts_pending`, etc. |

---

## 4.3 Security rules

**Example (production-oriented):** `docs/firestore.rules.production.example`

Summary:

- `quotes`, `zaf_products`: public **read**, no client **write**
- `push_tokens`: client **create/update** own token doc only
- `campaigns`: no client access (Admin / Console only)

**Action:** Paste into Firebase Console → Firestore → **Rules** and publish (verify against current rules in Console).

---

## 4.4 Firebase Storage

**Not used** by application code. Images are external URLs in `zaf_products.imageUrl`.

---

## 4.5 Scripts reference

| Script | Command | Credentials |
|--------|---------|-------------|
| Send campaigns | `npm run send-campaigns` | `.env` + service account |
| Send with log | `npm run send-campaigns:log` | Same |
| Import quotes | `npm run import-quotes -- --file FILE [--merge]` | Service account JSON path |
| Import products | `npm run import-zaf-products -- --file FILE [--merge]` | Same |

Default service account path if env unset: `./google-service-account-key.json` (local only, gitignored).

---

## 4.6 Notification distribution mechanism

### A. Remote campaigns (Firestore + Expo Push)

1. User opens **development/production build** (not Expo Go on Android for reliable push).
2. App registers Expo push token → upserts `push_tokens`.
3. Operator creates `campaigns` doc with `status: "pending"`.
4. Operator runs `npm run send-campaigns`:
   - Queries pending due campaigns
   - Sends batches to `https://exp.host/--/api/v2/push/send`
   - Polls `getReceipts` for delivery metrics
   - Updates campaign doc; removes dead tokens

See: `docs/push-notifications.md`, `manual.md` section 5, `docs/campaign-scheduling-windows.md`

### B. Local reminders (on-device)

- Configured in app Settings; stored in **AsyncStorage**
- **Not** stored in Firestore
- Uses `expo-notifications` scheduled locally

---

## 4.7 Scheduled execution

**Not pre-configured on client machines.** Options documented in:

- `docs/campaign-scheduling-windows.md` (Windows Task Scheduler + wrapper `.cmd` pattern)

Recommended: run every 5–15 minutes if scheduled campaigns are used.

---

## 4.8 Key source files

| File | Role |
|------|------|
| `lib/firebase.ts` | Client Firestore init |
| `lib/quotes.ts` | Quote fetch + 15-min rotation |
| `lib/zaf-products.ts` | Products + cache |
| `lib/push-notifications.ts` | Token + Firestore sync |
| `scripts/send-pending-campaigns.mjs` | Campaign sender |
