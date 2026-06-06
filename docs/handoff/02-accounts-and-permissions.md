# 2. Accounts and permissions

**Owner アカウント**と**移管状況**は引き渡し時に記入してください。パスワードや秘密鍵はこの文書に書かないでください。

---

## 2.1 Firebase / Google Cloud

| 項目 | 値 |
|------|-----|
| **Firebase プロジェクト ID** | `odza-1af37` |
| **Firebase Console** | https://console.firebase.google.com/project/odza-1af37 |
| **GCP IAM** | https://console.cloud.google.com/iam-admin/iam?project=odza-1af37 |
| **料金プラン（引き渡し時）** | Spark（無料）— Console で要確認 |
| **登録アプリ** | Android `com.odza.app`、Web `odza-web` |

### Firestore（メインデータベース）

https://console.firebase.google.com/project/odza-1af37/firestore

### Firebase Storage

**アプリコードでは未使用。** 商品画像は Firestore の **`imageUrl`**（外部 HTTPS URL）を使用。

### Service account (Admin SDK — for scripts)

- 使用箇所: `scripts/send-pending-campaigns.mjs`、`import-quotes.mjs`、`import-zaf-products.mjs`
- **`google-services.json`（Android 用）とは別物**
- 作成: GCP → IAM → サービスアカウント → 鍵  
- **Git 以外**の安全な経路でクライアントへ渡す（漏洩歴がある場合はローテーション）

### Client emails requested as Owner (confirm all added)

| メール | ロール | 状態（記入） |
|--------|--------|-------------|
| info@zaf-zen.jp | Owner | ☐ 招待中 / ☐ 有効 |
| ryuwryyy@gmail.com | Owner | ☐ 招待中 / ☐ 有効 |
| kgt.system.info@gmail.com | Owner | ☐ 招待中 / ☐ 有効 |

**追加手順:** Firebase → 歯車 **プロジェクトの設定** → **ユーザーと権限** → メンバーを追加 → **Owner**  
必要に応じて GCP IAM でも確認。

---

## 2.2 Expo / EAS

| 項目 | 値 |
|------|-----|
| **Expo slug** | `odza` |
| **EAS プロジェクト ID** | `f75f4243-74a5-4f6c-a105-cea0c7eb5a2b`（`app.json` にも記載） |
| **ダッシュボード** | https://expo.dev → プロジェクト **odza** |
| **ビルドプロファイル** | `development`、`preview`、`production`（`eas.json`） |

### What you must do

1. クライアントを Expo **組織 / プロジェクトのメンバー**に追加する、または移管手順を文書化。
2. **EAS 認証情報**（Android キーストア等）がクライアントから Expo → プロジェクト → **Credentials** で見えること。
3. **`EXPO_ACCESS_TOKEN`** を安全な経路で共有（またはクライアント自身が Expo で新規発行）。

### Push notifications

- トークン取得: `expo-notifications` + EAS `projectId`
- 送信: Expo Push API（`scripts/send-pending-campaigns.mjs`）
- 詳細: `docs/push-notifications.md`（技術メモ・英語）

---

## 2.3 Domain / DNS / Hosting

| サービス | 利用 | 備考 |
|----------|------|------|
| アプリ用カスタムドメイン | **なし** | モバイルアプリのみ |
| 本番 Web ホスティング | **なし** | `expo web` は開発用 |
| Firebase Hosting | **未設定** |
| アプリ配布 | **EAS Build** + 任意で Google Play |

---

## 2.4 Other external services

| サービス | 用途 |
|----------|------|
| **GitHub** | ソースリポジトリ |
| **Expo** | ビルド、プッシュ基盤 |
| **Firebase** | Firestore、`google-services.json` |
| **Google Play Console** | production AAB 提出時（クライアント側アカウント） |
| **Apple Developer** | iOS 本番ビルド提出時 |

---

## 2.5 Handover checklist (permissions)

- [ ] クライアントが Firebase `odza-1af37` にログインできる  
- [ ] Firestore コレクションが閲覧できる  
- [ ] クライアントが Expo プロジェクト **odza** にアクセスできる  
- [ ] GitHub `zaf_app` にアクセスできる（または Zip 受領済み）  
- [ ] サービスアカウント JSON と Expo トークンを安全に受け渡した  
- [ ] 漏洩した可能性のある鍵をローテーションした  
