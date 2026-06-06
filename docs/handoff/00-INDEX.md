# Project handover index (Odza / ZAF)

**Purpose:** Map the client’s requested handover items to concrete files, URLs, and actions.  
**Project:** Odza meditation app (`com.odza.app`)  
**Firebase project ID:** `odza-1af37`  
**Expo EAS project ID:** `f75f4243-74a5-4f6c-a105-cea0c7eb5a2b`  
**Git remote:** https://github.com/ryuwryyy/zaf_app.git  
**Latest commit at handover prep:** `ca8fc24` (verify with `git log -1`)

---

## How to use this package

| # | Client request | Handover document | Your action (check when done) |
|---|----------------|-------------------|-------------------------------|
| 1 | Latest source code (Git or Zip) | [01-source-code-and-repository.md](./01-source-code-and-repository.md) | ☐ Grant GitHub access **or** send Zip |
| 2 | Accounts / permissions | [02-accounts-and-permissions.md](./02-accounts-and-permissions.md) | ☐ Add Owners / transfer where applicable |
| 3 | Environment setup | [03-environment-setup-and-deployment.md](./03-environment-setup-and-deployment.md) | ☐ Deliver `.env.example`; secrets via secure channel |
| 4 | Backend / Firestore / notifications | [04-firestore-backend-and-notifications.md](./04-firestore-backend-and-notifications.md) | ☐ Confirm Firestore data + rules in Console |
| 5 | Documentation | [05-documentation-index.md](./05-documentation-index.md) | ☐ Point client to `manual.md` + this folder |
| 6 | Known issues / gaps / future work | [06-known-issues-gaps-future-work.md](./06-known-issues-gaps-future-work.md) | ☐ Review with client honestly |
| 7 | Design assets & licenses | [07-design-assets-and-licenses.md](./07-design-assets-and-licenses.md) | ☐ Confirm asset ownership |
| 8 | Client reply template (① deadline) | [08-client-reply-template.md](./08-client-reply-template.md) | ☐ Send by agreed deadline |

**One-page summary (Japanese):** [`../client-handoff-onepager.md`](../client-handoff-onepager.md)

---

## Secrets — never put in Git or email body

Deliver separately (encrypted zip, password manager, or in-person):

- Firebase **service account** JSON (`google-service-account-key.json` or new rotated key)
- **`EXPO_ACCESS_TOKEN`**
- Any **EAS / Apple / Google Play** credentials managed in Expo or store consoles

Repository contains only **`.env.example`** (placeholders).

---

## Quick verification (before you tell the client “handover complete”)

```powershell
cd D:\projects\odza
npm install
npm start
# separate terminal:
npm run send-campaigns   # needs .env + service account file locally
```

- [ ] Client can open https://console.firebase.google.com/project/odza-1af37  
- [ ] Client can open https://expo.dev/accounts/[owner]/projects/odza  
- [ ] Client can clone https://github.com/ryuwryyy/zaf_app.git (or has Zip)  
- [ ] `manual.md` opens and section 5 (campaigns) is readable  
