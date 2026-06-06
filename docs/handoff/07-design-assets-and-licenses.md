# 7. Design assets and licenses

## 7.1 In-repository assets

| Location | Contents |
|----------|----------|
| `assets/images/` | App icons, product placeholders (e.g. `01.png`), design images |
| `assets/images/design1.png` | App icon / adaptive icon (referenced in `app.json`) |
| `assets/screenshots/` | Screenshot captures for `manual.md` |
| `assets/home-padding-mockup.html` | Internal layout mockup (dev reference) |

## 7.2 Sample / operational data

| File | Purpose |
|------|---------|
| `scripts/quotes.sample.csv` | 100 sample quotes for import testing |
| `scripts/quotes.sample.json` | JSON format example |
| `scripts/zaf-products.sample.csv` | Sample products |
| `scripts/zaf-products.sample.json` | JSON format example |

Production content lives in **Firestore** (`quotes`, `zaf_products`), not only in repo samples.

## 7.3 External assets

- **Product images in app:** loaded from Firestore field `imageUrl` (HTTPS).  
  License and hosting are **client responsibility** for URLs they configure.
- **Fonts / Expo modules:** subject to respective open-source licenses (see `package-lock.json` / npm).

## 7.4 License attention (typical mobile app stack)

| Component | License note |
|-----------|--------------|
| React Native / Expo | MIT (Expo SDK) |
| Firebase SDK | Google terms of service |
| Third-party npm packages | See `package.json` / `node_modules` |
| Client-provided brand images | Confirm client owns or has license for meditation product photos, logos, copy |

## 7.5 What to confirm with client

- [ ] Who owns copyright for **design1.png** and in-app images?
- [ ] Are **quote texts** licensed for app use?
- [ ] Are **ZAF product photos** and descriptions client-owned?
- [ ] Any **stock photo** or **font** requiring attribution? (document if yes)

If unknown, state: *“Assets in repo were provided for this project; client should verify commercial use rights before public store release.”*
