# 3. Environment setup, build, and deployment

## 3.1 Prerequisites

| ツール | バージョン / 備考 |
|--------|-------------------|
| Node.js | 18 または 20 LTS 推奨 |
| npm | Node に同梱 |
| EAS CLI | `npm install -g eas-cli`（クラウドビルド時） |
| Expo アカウント | EAS ビルドに必須 |

---

## 3.2 Environment variables

**テンプレート（リポジトリ同梱）:** `.env.example`  
**ローカル秘密（コミット禁止）:** プロジェクトルートに `.env` を作成

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `EXPO_ACCESS_TOKEN` | 推奨 | Expo アクセストークン |
| `GOOGLE_APPLICATION_CREDENTIALS` | スクリプト実行時 | サービスアカウント JSON の**フルパス** |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | 任意（CI） | JSON 文字列 |
| `CAMPAIGN_LOG_FILE` | 任意 | 例: `logs/campaign-run.log` |
| `EXPO_RECEIPT_POLL_INTERVAL_MS` | 任意 | 既定 `4000` |
| `EXPO_RECEIPT_MAX_WAIT_MS` | 任意 | 既定 `120000` |

**`npm run send-campaigns` は `.env` を自動読み込み**します。

`.env` の例:

```env
EXPO_ACCESS_TOKEN=ここにトークン
GOOGLE_APPLICATION_CREDENTIALS=D:\secure\path\service-account.json
```

サービスアカウント JSON は**リポジトリ外**に置くことを推奨。

---

## 3.3 Local startup

```powershell
cd D:\projects\odza
npm install
npm start
```

- `a`（Android）などで起動。**プッシュ・リマインダーの完全検証は開発ビルド**を使用（Android の Expo Go は制限あり）。
- 詳細: `README.md` 第1章

---

## 3.4 Build procedure (EAS)

初回ログイン:

```powershell
eas login
```

| プロファイル | 用途 | コマンド |
|-------------|------|----------|
| **development** | 開発クライアント、プッシュ検証 | `eas build --profile development --platform android` |
| **preview** | 社内配布用 APK | `eas build --profile preview --platform android` |
| **production** | Google Play 用 AAB | `eas build --profile production --platform android` |

iOS は `--platform ios` に変更。

成果物はターミナルの URL または https://expo.dev → **odza** → **Builds** からダウンロード。

**APK を確実に欲しい場合:** `eas.json` の `preview` に以下を追加:

```json
"android": { "buildType": "apk" }
```

---

## 3.5 Production deployment procedure

### Mobile app (Google Play)

1. `eas build --profile production --platform android`
2. **AAB** をダウンロード
3. **Google Play Console**（クライアントアカウント）へアップロード

### Mobile app (App Store)

1. `eas build --profile production --platform ios`
2. EAS Submit または App Store Connect（Apple Developer 必須）

### Content updates (no app rebuild required)

Firestore の `quotes` / `zaf_products` / `campaigns` の更新、または:

- `npm run import-quotes`
- `npm run import-zaf-products`
- `npm run send-campaigns`

### Backend / campaigns

**Cloud Functions は未使用。** PC 上（またはタスクスケジューラ）でスクリプト実行:

- `docs/campaign-scheduling-windows.md`

---

## 3.6 Firebase client config (in repo)

| ファイル | 用途 |
|----------|------|
| `lib/firebase.ts` | Web SDK 設定（projectId `odza-1af37`） |
| `google-services.json` | Android 用 Firebase 設定 |

これらは**クライアント用公開設定**であり、Admin 秘密鍵ではありません。
