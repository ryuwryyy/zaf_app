# 1. Source code and repository

## 1.1 Git repository (recommended)

| 項目 | 値 |
|------|-----|
| **URL** | https://github.com/ryuwryyy/zaf_app.git |
| **デフォルトブランチ** | `main` |
| **パッケージ名** | `odza`（Expo アプリ） |
| **Android パッケージ** | `com.odza.app` |
| **iOS バンドル ID** | `com.odza.app` |

### What you must do (developer)

1. **最新コードを push** し、GitHub の `main` に引き渡し内容が揃っていること。
2. **クライアント（または代理店）にアクセス付与**
   - GitHub → リポジトリ **Settings → Collaborators**（または組織へ移管）。
   - 権限: 保守なら **Write** 以上、設定管理なら **Admin**。
3. 次が実行できることを確認:  
   `git clone https://github.com/ryuwryyy/zaf_app.git`

### What is intentionally NOT in Git

| ファイル | 理由 |
|----------|------|
| `.env` | 秘密情報 |
| `google-service-account-key.json` | Firebase Admin 鍵（gitignore 対象） |
| `logs/` | 運用ログに機微情報が含まれる可能性 |

---

## 1.2 Zip alternative

Git がすぐ使えない場合:

1. プロジェクトルートから **`node_modules`、`.expo`、`logs`、`.env`、`google-service-account-key.json` を除いて** アーカイブ。
2. 例（PowerShell、親フォルダから）:

```powershell
Compress-Archive -Path "D:\projects\odza\*" -DestinationPath "D:\odza-source-handoff.zip"
# Zip 内に .env とサービスアカウント JSON が入っていないか必ず確認
```

3. Zip は合意した安全な経路で送付。秘密情報は別送。

---

## 1.3 Key directories (for third-party developers)

| パス | 内容 |
|------|------|
| `app/` | 画面（Expo Router） |
| `lib/` | Firebase、名言、商品、プッシュ、端末ストレージ |
| `scripts/` | キャンペーン送信、CSV/JSON インポート |
| `assets/` | 画像、アイコン、スクリーンショット |
| `docs/` | 技術・引き継ぎドキュメント |
| `manual.md` | 非エンジニア向け運用マニュアル |
| `app.json` / `eas.json` | アプリ・EAS ビルド設定 |
| `google-services.json` | Firebase Android クライアント設定（Admin 鍵ではない） |

---

## 1.4 npm scripts (operations)

| コマンド | 用途 |
|----------|------|
| `npm start` | ローカル開発サーバー |
| `npm run android` / `ios` / `web` | 各プラットフォームで起動 |
| `npm run send-campaigns` | Firestore の pending キャンペーンを Expo Push で送信 |
| `npm run send-campaigns:log` | 同上（`logs/campaign-run.log` に追記） |
| `npm run import-quotes` | 名言 CSV/JSON → Firestore |
| `npm run import-zaf-products` | 商品 CSV/JSON → Firestore |
