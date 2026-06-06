# 6. Known issues, unimplemented items, and future work

第三者レビューとクライアント協議用の事実記載です。解決したら日付・状態を更新してください。

---

## 6.1 Known issues / limitations

| # | 領域 | 内容 | 回避策・備考 |
|---|------|------|-------------|
| 1 | プッシュ（Android） | **Expo Go** ではトークン取得・配信が不安定 | **EAS 開発ビルド** または preview/production APK |
| 2 | プッシュ検証 | **エミュレータ**（MuMu 等）では届かないことが多い | **実機**で確認 |
| 3 | キャンペーン status | `sent` は **Expo API 受付**まで。端末表示は保証しない | `deliveryOutcome` とレシートを確認（`manual.md` 5.3） |
| 4 | レシート待ち | 既定ポーリング約 **2分**。Expo 側はもっと遅れる場合あり | `EXPO_RECEIPT_MAX_WAIT_MS` を延長 |
| 5 | 商品画像 | `imageUrl` は **有効な公開 HTTPS** が必要。無効 URL は代替画像 | CDN 等でホスティング |
| 6 | 秘密鍵 | サービスアカウント鍵が **過去に Git 混入**した可能性 | GCP で **ローテーション**、再コミット禁止 |
| 7 | キャンペーン自動化 | Cloud Functions なし。**PC またはスケジューラ**で実行 | `docs/campaign-scheduling-windows.md` |
| 8 | インポート | `import-quotes` / `import-zaf-products` は **`.env` 自動読込なし**（キャンペーン脚本とは異なる） | シェルで `GOOGLE_APPLICATION_CREDENTIALS` または既定パスに鍵配置 |
| 9 | Git（Windows） | 一部環境で `git commit` が `trailer` エラー | `C:\Program Files\Git\bin\git.exe` を直接使用 |
| 10 | 多言語 | UI は主に日本語。i18n フレームワークなし | 必要なら将来対応 |

---

## 6.2 Implemented at handover (reference)

- Firestore 連携 **quotes**（15分ローテーション）
- Firestore 連携 **zaf_products**（一覧・詳細・キャッシュ）
- **push_tokens** のアプリからの upsert
- **キャンペーン送信**（Expo レシート・メトリクス付き）
- 名言・商品の CSV/JSON **インポート**
- **ローカルリマインダー**（端末内）
- **manual.md** + 引き継ぎドキュメント
- EAS **development / preview / production** 設定

---

## 6.3 Commonly expected but NOT implemented (confirm against original SOW)

| 項目 | 状態 | 備考 |
|------|------|------|
| キャンペーン用 **Cloud Functions** | **未実装** | PC 上の Node スクリプト |
| 商品画像用 **Firebase Storage** | **未実装** | 外部 `imageUrl` のみ |
| クラウド上の **キャンペーン自動スケジュール** | **未実装** | Windows 手順書のみ |
| コンテンツ・キャンペーン用 **管理 Web UI** | **未実装** | Console + スクリプト |
| **ユーザー認証** / ユーザー別 Firestore ルール | **未実装** | 公開読取 + トークン書込のみ |
| アプリ内 **分析ダッシュボード** | **未実装** | Console の Analytics は別 |
| **ドメイン / マーケサイト** | **リポジトリ外** | モバイルアプリ範囲 |
| **ストア公開済み** | **クライアント依存** | EAS ビルドは可能、提出は別 |
| 全端末への **プッシュ到達保証** | **業界上不可** | レシートで可視化を改善 |
| **Excel 直接連携** | **未実装** | CSV エクスポート → インポート |

*返金・減額協議時は、署名済み契約・当初要件と本表を突合してください。*

---

## 6.4 Recommended future actions (for maintaining party)

1. サービスアカウント鍵をローテーションし、`.env` または秘密管理のみに保管。
2. クライアントメールを Firebase **Owner** に。Expo プロジェクトの移管またはメンバー追加。
3. `docs/firestore.rules.production.example` を Console に反映（未反映の場合）。
4. **実機 Android / iOS** でプッシュ端到端テスト。
5. `npm run send-campaigns` の **タスクスケジューラ** 設定。
6. 商品画像を安定 CDN に置き、`zaf_products.imageUrl` を更新。
7. （任意）キャンペーン送信を **Cloud Functions + Cloud Scheduler** へ移行。
8. （任意）インポート脚本にも `dotenv` 読込を追加。
9. ストアリリース未完了なら Play / App Store 手続きを完了。

---

## 6.5 QA checklist (suggested for acceptance)

- [ ] 最新 EAS ビルドが端末にインストールできる
- [ ] ホームの名言が 15 分以内に切り替わる（`quotes` が複数あること）
- [ ] 設定画面に Firestore の商品が表示される
- [ ] 商品詳細でタイトル・説明・画像が表示される
- [ ] リマインダーが設定時刻に鳴る（24時間表記、例: 22:15 = PM 10:15）
- [ ] 開発ビルド起動後 `push_tokens` にトークンが載る
- [ ] テストキャンペーン: `pending` → `npm run send-campaigns` → 実機で通知
- [ ] サンプル CSV のインポートが成功する
