# Scheduling campaign sending on Windows

`npm run send-campaigns` は、Node.js・本リポジトリ・認証情報が設定された信頼できる PC またはサーバーで実行してください（`manual.md` と `.env.example` 参照）。

## 1. One-off run with a log file (PowerShell)

プロジェクトフォルダ（`odza`）で:

```powershell
$env:CAMPAIGN_LOG_FILE = "logs\campaign-run.log"
npm run send-campaigns
```

`logs` フォルダがなくても、スクリプトが書き込み時に作成します。

または:

```powershell
npm run send-campaigns:log
```

（既定で `logs/campaign-run.log` に追記）

## 2. Task Scheduler (run every N minutes)

1. **タスクスケジューラ** を開く → **タスクの作成**（詳細オプションが必要なら「基本タスクの作成」ではなくこちら）。
2. **全般:** 名前例 `Odza send campaigns`。常時稼働 PC なら「ユーザーがログオンしているかどうかにかかわらず実行」を選択（パスワード入力を求められる場合あり）。
3. **トリガー:** 新規 → **毎日** またはスケジュール → **5分**（または15分）ごとに繰り返し、期間 **無期限**。
4. **操作:** 新規 → **プログラムの開始**
   - **プログラム/スクリプト:** `npm.cmd` のフルパス  
     例: `C:\Program Files\nodejs\npm.cmd`
   - **引数の追加:** `run send-campaigns`
   - **開始:** リポジトリルート、例: `D:\projects\odza`
5. **条件 / 設定:** ノート PC でバッテリー駆動時も動かすなら「AC 電源時のみ」をオフ。スリープ後の取りこぼしを減らすなら「スケジュールされた開始時刻を逃した場合、できるだけ早くタスクを開始する」をオン。
6. **環境変数:** タスクスケジューラはユーザーの `.env` を自動読み込みしません。次のいずれか:
   - システム / ユーザー環境変数に `EXPO_ACCESS_TOKEN`、`GOOGLE_APPLICATION_CREDENTIALS`、任意で `CAMPAIGN_LOG_FILE` を設定  
   - 環境変数を設定してから `npm run send-campaigns` を呼ぶ **ラッパー `.cmd`** を使う

ラッパー例 `scripts\run-campaigns-task.cmd`（パスと秘密は**ローカルで**編集。**Git にコミットしない**）:

```bat
@echo off
set EXPO_ACCESS_TOKEN=your_token_here
set GOOGLE_APPLICATION_CREDENTIALS=D:\secure\path\service-account.json
set CAMPAIGN_LOG_FILE=D:\projects\odza\logs\campaign-run.log
cd /d D:\projects\odza
call npm run send-campaigns
```

スケジュールタスクの実行ファイルを `npm.cmd` ではなく `run-campaigns-task.cmd` に指定。

## 3. Failure monitoring

- `CAMPAIGN_LOG_FILE` 設定時は `logs\campaign-run.log` の `[ERROR]` 行を確認。
- Firestore の `campaigns` ドキュメントで `deliveryOutcome`、`receiptPendingCount`、`status` を確認。
- 致命的エラー時スクリプトは終了コード `1`。タスクスケジューラの「失敗時に再起動」や外部監視も検討。

## 4. Expo note on receipts

Expo のドキュメントでは、送信後 **最大約15分** までレシート確認を推奨しています。本スクリプトの既定待ち時間は約 **2分**（`EXPO_RECEIPT_MAX_WAIT_MS=120000`）。より厳密にレシートを待つ場合は環境変数を延長するか、時間を空けて同コマンドを再実行（処理対象は `pending` のキャンペーンのみ）。
