# 4. Firestore, backend scripts, and notifications

## 4.1 Architecture overview

```
モバイルアプリ（Expo）
  ├─ 読取: quotes, zaf_products（Firestore）
  ├─ 書込: push_tokens（Firestore、merge upsert）
  └─ 端末内: リマインダー（AsyncStorage、Firestore 外）

PC / サーバー（Node スクリプト + Firebase Admin SDK）
  ├─ import-quotes.mjs → quotes
  ├─ import-zaf-products.mjs → zaf_products
  └─ send-pending-campaigns.mjs → campaigns + push_tokens → Expo Push API
```

**Cloud Functions はデプロイしていません**（引き渡し時点）。

---

## 4.2 Firestore collections

### `quotes`

| フィールド | 型 | 備考 |
|-----------|-----|------|
| `text` | string | 必須 |
| `author` | string | 任意 |
| `profession` | string | 任意（出典表示） |
| `enabled` | boolean | false で非表示 |

**アプリ:** ホーム「今日の気づき」、約 **15分** ごとに切替。端末にキャッシュ。  
**登録:** `npm run import-quotes -- --file ファイル.csv`（`--merge` で追記）

CSV 列: `id,text,author,profession,enabled`  
サンプル: `scripts/quotes.sample.csv`

---

### `zaf_products`

| フィールド | 型 | 備考 |
|-----------|-----|------|
| `title` | string | 必須 |
| `description` | string | 必須 |
| `imageUrl` | string | 任意、公開 HTTPS |
| `enabled` | boolean | 既定 true |
| `sortOrder` | number | 表示順 |

**アプリ:** 設定画面グリッド + 商品詳細。AsyncStorage キャッシュあり。  
**登録:** `npm run import-zaf-products -- --file ファイル.csv`

CSV 列: `id,title,description,imageUrl,enabled,sortOrder`  
サンプル: `scripts/zaf-products.sample.csv`

---

### `push_tokens`

| フィールド | 型 | 備考 |
|-----------|-----|------|
| ドキュメント ID | string | Expo トークン文字列と同一 |
| `token` | string | Expo push token |
| `platform` | string | `ios` / `android` |
| `appVersion` | string | アプリバージョン |
| `updatedAt` | timestamp | upsert 時 |

**書込:** アプリ `lib/push-notifications.ts`  
**削除:** 送信スクリプト（無効トークン `DeviceNotRegistered` 時）

---

### `campaigns`

Console で作成 → `npm run send-campaigns` で送信。

| フィールド | タイミング | 備考 |
|-----------|-----------|------|
| `title` | 作成時 | 通知タイトル |
| `body` | 作成時 | 本文 |
| `status` | 作成時 → スクリプト更新 | 開始は `"pending"` |
| `scheduledAt` | 任意 | タイムスタンプ、時刻前は送信しない |
| `data` | 任意 | アプリ用 JSON |
| `sentAt`, `sentCount`, `errorCount` 等 | 送信後 | スクリプトが更新 |
| `receiptOkCount`, `deliveryOutcome` 等 | 送信後 | Expo レシート確認結果 |

---

## 4.3 Security rules

**雛形:** `docs/firestore.rules.production.example`

Firebase Console → Firestore → **ルール** に貼り付けて公開（本番前に要確認）。

概要:

- `quotes`, `zaf_products`: **読取のみ**（クライアントからの書込不可）
- `push_tokens`: 端末が自分のトークン doc のみ create/update
- `campaigns`: クライアントからアクセス不可（Console / Admin のみ）

---

## 4.4 Firebase Storage

**未使用。** 画像は Firestore の `imageUrl`（外部 URL）。

---

## 4.5 Scripts reference

| スクリプト | コマンド | 認証 |
|-----------|----------|------|
| キャンペーン送信 | `npm run send-campaigns` | `.env` + サービスアカウント |
| ログ付き送信 | `npm run send-campaigns:log` | 同上 |
| 名言インポート | `npm run import-quotes -- --file FILE [--merge]` | サービスアカウント |
| 商品インポート | `npm run import-zaf-products -- --file FILE [--merge]` | 同上 |

環境変数未設定時の既定パス: `./google-service-account-key.json`（ローカルのみ、gitignore）

---

## 4.6 Notification distribution mechanism

### A. Remote campaigns (Firestore + Expo Push)

1. ユーザーが **開発ビルド / 本番ビルド** でアプリ起動（Android Expo Go は非推奨）。
2. Expo トークン取得 → **`push_tokens`** に保存。
3. 運用担当が **`campaigns`** に `status: "pending"` で作成。
4. `npm run send-campaigns` 実行:
   - pending かつ期限到来分を Expo API へ送信
   - **getReceipts** で配信結果をポーリング
   - キャンペーン doc 更新、無効トークン削除

参照: `manual.md` 第5章、`docs/campaign-scheduling-windows.md`

### B. Local reminders (on-device)

- 設定画面で時刻・ON/OFF・文言を **端末内（AsyncStorage）** に保存
- **Firestore には保存しない**
- `expo-notifications` で端末ローカルスケジュール

---

## 4.7 Scheduled execution

**クラウドでは未設定。** Windows タスクスケジューラ等:

- `docs/campaign-scheduling-windows.md`

---

## 4.8 Key source files

| ファイル | 役割 |
|----------|------|
| `lib/firebase.ts` | クライアント Firestore 初期化 |
| `lib/quotes.ts` | 名言取得・15分ローテーション |
| `lib/zaf-products.ts` | 商品取得・キャッシュ |
| `lib/push-notifications.ts` | トークン + Firestore 同期 |
| `scripts/send-pending-campaigns.mjs` | キャンペーン送信 |
