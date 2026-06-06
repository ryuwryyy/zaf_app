# 6. Known issues, unimplemented items, and future work

This section is factual for third-party review and client discussion. Update dates/status when resolved.

---

## 6.1 Known issues / limitations

| # | Area | Issue | Workaround / note |
|---|------|-------|-------------------|
| 1 | Push (Android) | **Expo Go** does not support reliable push token / delivery | Use **EAS development build** or production/preview APK |
| 2 | Push testing | **Emulators** (e.g. MuMu) often do not receive push | Test on **physical device** |
| 3 | Campaign status | `status: sent` means accepted by **Expo API**, not guaranteed device display | Check `deliveryOutcome` and receipts; see `manual.md` §5.3 |
| 4 | Receipt timing | Default receipt poll ~**2 minutes**; Expo may take longer | Increase `EXPO_RECEIPT_MAX_WAIT_MS` or re-run policy |
| 5 | Product images | `imageUrl` must be **valid public HTTPS**; broken URLs show fallback image | Host images on CDN/Storage URL client controls |
| 6 | Secrets | Service account key was **committed historically**; must be **rotated** | New key via GCP; never commit again |
| 7 | Campaign automation | No Cloud Function; script must run on **PC or scheduler** | See `docs/campaign-scheduling-windows.md` |
| 8 | Import scripts | `import-quotes` / `import-zaf-products` do **not** auto-load `.env` (unlike campaign script) | Set `GOOGLE_APPLICATION_CREDENTIALS` in shell or place key at default path |
| 9 | Git commit tool | Some Windows `git commit` wrappers fail with `trailer` error | Use `C:\Program Files\Git\bin\git.exe` directly if needed |
| 10 | i18n | App UI largely Japanese; no multi-language framework | Future feature if required |

---

## 6.2 Implemented at handover (reference)

- Firestore-backed **quotes** (15-min rotation)
- Firestore-backed **zaf_products** (list + detail, caching)
- **push_tokens** upsert from app
- **Campaign sender** with Expo receipts + metrics
- CSV/JSON **import** for quotes and products
- **Local reminders** (device storage)
- **manual.md** + handoff docs
- EAS **development / preview / production** build configs

---

## 6.3 Commonly expected but NOT implemented (confirm against original SOW)

| Item | Status | Notes |
|------|--------|-------|
| Firebase **Cloud Functions** for campaigns | **Not implemented** | Node scripts on PC instead |
| Firebase **Storage** for product images | **Not implemented** | External `imageUrl` only |
| **Automated** campaign scheduler in cloud | **Not implemented** | Windows Task Scheduler doc only |
| **Admin web UI** for content/campaigns | **Not implemented** | Firebase Console + scripts |
| **User authentication** / per-user Firestore rules | **Not implemented** | Public read; token write only |
| **Analytics dashboard** in app | **Not implemented** | Firebase Analytics may be partially configured in Console |
| **Domain / marketing website** | **Not in repo** | Mobile app scope |
| **Google Play / App Store** live release | **Client-dependent** | Builds exist via EAS; store submission not guaranteed |
| **Expo delivery guarantee** on all devices | **N/A** | Industry limitation; receipts improve visibility only |
| **Excel direct sync** | **Not implemented** | CSV export → import scripts |

*Align this table with the signed statement of work / initial agreement during refund discussion.*

---

## 6.4 Recommended future actions (for maintaining party)

1. Rotate Firebase service account key; store only in secret manager / `.env`.
2. Add client emails as Firebase **Owner**; transfer Expo project when ready.
3. Publish Firestore rules from `docs/firestore.rules.production.example` if not already.
4. Validate push end-to-end on **real Android + iOS** devices.
5. Set up **Task Scheduler** (or cloud VM cron) for `npm run send-campaigns`.
6. Host product images on stable CDN; update `zaf_products.imageUrl`.
7. Optional: migrate campaign sender to **Cloud Functions + Cloud Scheduler**.
8. Optional: add `dotenv` loading to import scripts for parity with campaign script.
9. Complete store listing and production release if not done.

---

## 6.5 QA checklist (suggested for acceptance)

- [ ] App installs from latest EAS build
- [ ] Home quote changes within 15 minutes (with multiple `quotes` in Firestore)
- [ ] Settings shows products from Firestore
- [ ] Product detail loads title/description/image
- [ ] Reminder fires at set time (24h format, e.g. 22:15 for 10:15 PM)
- [ ] Push token appears in `push_tokens` after opening app (dev build)
- [ ] Test campaign: `pending` → `npm run send-campaigns` → notification on device
- [ ] Import sample CSV for quotes and products succeeds
