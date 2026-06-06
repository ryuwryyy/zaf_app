# 2. Accounts and permissions

Fill in **Owner account** and **transfer status** when completing handover. Do not paste passwords or private keys in this document.

---

## 2.1 Firebase / Google Cloud

| Item | Value |
|------|--------|
| **Firebase project ID** | `odza-1af37` |
| **Console URL** | https://console.firebase.google.com/project/odza-1af37 |
| **GCP IAM URL** | https://console.cloud.google.com/iam-admin/iam?project=odza-1af37 |
| **Billing plan (at handover)** | Spark (free) — confirm in Console |
| **Registered apps** | Android `com.odza.app`, Web `odza-web` |

### Firestore (primary database)

https://console.firebase.google.com/project/odza-1af37/firestore

### Firebase Storage

**Not used by the app code at handover.** Product images use **external URLs** (`imageUrl` in Firestore), not Firebase Storage uploads.

### Service account (Admin SDK — for scripts)

- Used by: `scripts/send-pending-campaigns.mjs`, `import-quotes.mjs`, `import-zaf-products.mjs`
- **Not** the same as `google-services.json` (client Android config)
- Create/download: GCP → IAM → Service Accounts → Keys  
- Deliver to client **outside Git** (rotate if ever committed or pushed)

### Client emails requested as Owner (confirm all added)

| Email | Role | Status (you fill) |
|-------|------|-------------------|
| info@zaf-zen.jp | Owner | ☐ Pending / ☐ Active |
| ryuwryyy@gmail.com | Owner | ☐ Pending / ☐ Active |
| kgt.system.info@gmail.com | Owner | ☐ Pending / ☐ Active |

**How to add:** Firebase → Project settings (gear) → **Users and permissions** → Add member → **Owner**.  
Verify in GCP IAM if needed.

---

## 2.2 Expo / EAS

| Item | Value |
|------|--------|
| **Expo slug** | `odza` |
| **EAS project ID** | `f75f4243-74a5-4f6c-a105-cea0c7eb5a2b` (in `app.json`) |
| **Dashboard** | https://expo.dev (account: **fill owner username**, e.g. `trong198`) |
| **Build profiles** | `development`, `preview`, `production` (`eas.json`) |

### What you must do

1. Add client users to the **Expo organization/project** with appropriate role, **or** document how to transfer project ownership (Expo support / org settings).
2. Ensure **EAS credentials** (Android keystore, etc.) are visible to the client in Expo → Project → **Credentials**.
3. Provide **`EXPO_ACCESS_TOKEN`** securely (Expo account → Access tokens) for campaign sending scripts.

### Push notifications

- Tokens obtained via `expo-notifications` + EAS `projectId`
- Sending: Expo Push API (`scripts/send-pending-campaigns.mjs`)
- Details: `docs/push-notifications.md`

---

## 2.3 Domain / DNS / Hosting

| Service | Used? | Notes |
|---------|-------|-------|
| Custom domain for app | **No** | Mobile app only |
| Web hosting for production app | **No** | `expo web` is dev/static only unless separately deployed |
| Firebase Hosting | **Not configured** in this repo |
| App distribution | **EAS Build** + optional Google Play (production AAB) |

If the client expected a marketing website or custom API domain, note that as **out of current scope** (see gaps doc).

---

## 2.4 Other external services

| Service | Purpose |
|---------|---------|
| **GitHub** | Source repository |
| **Expo** | Builds, push infrastructure |
| **Firebase** | Firestore, Android `google-services.json` |
| **Google Play Console** | Only if/when production AAB is submitted (client-owned account) |
| **Apple Developer** | Only if/when iOS production build is submitted |

---

## 2.5 Handover checklist (permissions)

- [ ] Client can log into Firebase `odza-1af37`
- [ ] Client can view Firestore collections
- [ ] Client has Expo access to project `odza`
- [ ] Client has GitHub access to `zaf_app` (or received Zip)
- [ ] Client received service account JSON + Expo token via secure channel
- [ ] Old leaked keys rotated (if applicable)
