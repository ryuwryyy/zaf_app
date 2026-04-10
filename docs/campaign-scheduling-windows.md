# Scheduling campaign sending on Windows

The command `npm run send-campaigns` should run on a trusted PC or server that has Node.js, this repo, and credentials configured (see `manual.md` and `.env.example`).

## 1. One-off run with a log file (PowerShell)

From the project folder (`odza`):

```powershell
$env:CAMPAIGN_LOG_FILE = "logs\campaign-run.log"
npm run send-campaigns
```

Create the `logs` folder once if needed; the script will create it when writing the log.

## 2. Task Scheduler (run every N minutes)

1. Open **Task Scheduler** → **Create Task** (not “Create Basic Task” if you need full options).
2. **General:** Name e.g. `Odza send campaigns`. Choose “Run whether user is logged on or not” if the machine stays on unattended (store the account password when prompted).
3. **Triggers:** New → **Daily** or **On a schedule** → repeat task every **5 minutes** (or 15), for a duration of **Indefinitely** (adjust to your policy).
4. **Actions:** New → **Start a program**
   - **Program/script:** full path to `npm.cmd`  
     Example: `C:\Program Files\nodejs\npm.cmd`
   - **Add arguments:** `run send-campaigns`
   - **Start in:** your repo root, e.g. `D:\projects\odza`
5. **Conditions / Settings:** Uncheck “Start only if on AC power” if this is a laptop you want to run on battery; enable “Run task as soon as possible after a scheduled start is missed” if you want catch-up after sleep.
6. **Environment variables:** Task Scheduler does not load your user `.env` automatically. Either:
   - set system/user environment variables (`EXPO_ACCESS_TOKEN`, `GOOGLE_APPLICATION_CREDENTIALS`, optional `CAMPAIGN_LOG_FILE`), or  
   - use a wrapper `.cmd` that sets variables then calls `npm run send-campaigns`.

Example wrapper `scripts\run-campaigns-task.cmd` (edit paths and secrets **locally**, do not commit secrets):

```bat
@echo off
set EXPO_ACCESS_TOKEN=your_token_here
set GOOGLE_APPLICATION_CREDENTIALS=D:\secure\path\service-account.json
set CAMPAIGN_LOG_FILE=D:\projects\odza\logs\campaign-run.log
cd /d D:\projects\odza
call npm run send-campaigns
```

Point the scheduled task at `run-campaigns-task.cmd` instead of `npm.cmd`.

## 3. Failure monitoring

- Inspect `logs\campaign-run.log` (if `CAMPAIGN_LOG_FILE` is set) for `[ERROR]` lines.
- In Firestore, open the `campaigns` document: check `deliveryOutcome`, `receiptPendingCount`, and `status`.
- Exit code: the script sets exit code `1` on fatal errors; you can use Task Scheduler “If task fails, restart” or external monitoring if needed.

## 4. Expo note on receipts

Expo’s docs recommend checking receipts **up to ~15 minutes** after send. The default script waits about **2 minutes** (`EXPO_RECEIPT_MAX_WAIT_MS=120000`). For stricter receipt completion on a schedule, either increase that env var for a dedicated long-running task, or run a second pass later (same command is safe: it only processes `pending` campaigns).
