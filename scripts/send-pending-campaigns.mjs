import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Load `.env` from project root (Node does not read it automatically).
dotenv.config({ path: path.join(repoRoot, '.env') });

const defaultServiceAccountPath = path.join(repoRoot, 'google-service-account-key.json');

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_API_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const BATCH_SIZE = 100;
const RECEIPT_ID_CHUNK = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkArray(values, size) {
  const chunks = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
}

function isDueCampaign(data, nowMs) {
  if (!data || data.status !== 'pending') return false;
  if (!data.scheduledAt) return true;

  const scheduledAt = data.scheduledAt;
  if (scheduledAt instanceof Timestamp) {
    return scheduledAt.toMillis() <= nowMs;
  }

  if (scheduledAt && typeof scheduledAt.toMillis === 'function') {
    return scheduledAt.toMillis() <= nowMs;
  }

  if (scheduledAt instanceof Date) {
    return scheduledAt.getTime() <= nowMs;
  }

  return true;
}

/** @type {import('node:fs').WriteStream | null} */
let logFileStream = null;

async function initLogFile() {
  const logPath = process.env.CAMPAIGN_LOG_FILE?.trim();
  if (!logPath) return;
  const abs = path.isAbsolute(logPath) ? logPath : path.join(repoRoot, logPath);
  await mkdir(path.dirname(abs), { recursive: true });
  logFileStream = createWriteStream(abs, { flags: 'a' });
  const header = `\n======== Run ${new Date().toISOString()} pid=${process.pid} ========\n`;
  logFileStream.write(header);
}

function logLine(level, ...parts) {
  const line = `[${new Date().toISOString()}] [${level}] ${parts.map(String).join(' ')}\n`;
  process.stdout.write(line);
  logFileStream?.write(line);
}

function logInfo(...args) {
  logLine('INFO', ...args);
}

function logWarn(...args) {
  logLine('WARN', ...args);
}

function logError(...args) {
  logLine('ERROR', ...args);
}

/** Resolve path from .env: trim, strip wrapping quotes, resolve relative paths from repo root. */
function resolveServiceAccountPath(raw) {
  let p = String(raw).trim();
  if (
    (p.startsWith('"') && p.endsWith('"')) ||
    (p.startsWith("'") && p.endsWith("'"))
  ) {
    p = p.slice(1, -1);
  }
  return path.isAbsolute(p) ? path.normalize(p) : path.resolve(repoRoot, p);
}

async function loadServiceAccount() {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonEnv) {
    try {
      return JSON.parse(jsonEnv);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON.');
    }
  }

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const serviceAccountPath = envPath
    ? resolveServiceAccountPath(envPath)
    : defaultServiceAccountPath;

  try {
    const raw = await readFile(serviceAccountPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? err.code : '';
    const reason =
      code === 'ENOENT'
        ? 'File does not exist'
        : 'Could not read or parse as JSON';
    throw new Error(
      `${reason} at:\n  ${serviceAccountPath}\n` +
        `Fix: download a Firebase **service account** JSON (Google Cloud → IAM → Service Accounts → Keys), ` +
        `then either set GOOGLE_APPLICATION_CREDENTIALS in .env to that file’s **full path**, ` +
        `or save it as google-service-account-key.json in the project folder (${repoRoot}). ` +
        `Variable name must be exactly GOOGLE_APPLICATION_CREDENTIALS (with an S at the end).`,
    );
  }
}

function getExpoAuthorizationHeader() {
  const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function getReceiptPollOptions() {
  const intervalMs = Math.max(
    1000,
    Number.parseInt(process.env.EXPO_RECEIPT_POLL_INTERVAL_MS ?? '4000', 10) || 4000,
  );
  const maxWaitMs = Math.max(
    intervalMs,
    Number.parseInt(process.env.EXPO_RECEIPT_MAX_WAIT_MS ?? '120000', 10) || 120000,
  );
  const maxAttempts = Math.max(1, Math.ceil(maxWaitMs / intervalMs));
  return { intervalMs, maxAttempts };
}

async function sendExpoBatch(messages) {
  const response = await fetch(EXPO_PUSH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getExpoAuthorizationHeader(),
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expo API returned ${response.status}: ${text}`);
  }

  return response.json();
}

async function fetchExpoReceipts(ticketIds) {
  const response = await fetch(EXPO_RECEIPTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getExpoAuthorizationHeader(),
    },
    body: JSON.stringify({ ids: ticketIds }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expo getReceipts returned ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Poll until each ticket id has a receipt or timeout. Missing ids = still pending on Expo side.
 * @param {Map<string, string>} ticketIdToDocId
 * @returns {Promise<{ receiptOk: number; receiptError: number; receiptPending: number; receiptInvalidDocIds: string[]; firstReceiptErrorMessage: string | null }>}
 */
async function pollPushReceipts(ticketIdToDocId) {
  const { intervalMs, maxAttempts } = getReceiptPollOptions();
  const pending = new Set(ticketIdToDocId.keys());
  let receiptOk = 0;
  let receiptError = 0;
  /** @type {string[]} */
  const receiptInvalidDocIds = [];
  let firstReceiptErrorMessage = null;

  if (pending.size === 0) {
    return {
      receiptOk: 0,
      receiptError: 0,
      receiptPending: 0,
      receiptInvalidDocIds,
      firstReceiptErrorMessage,
    };
  }

  for (let attempt = 0; attempt < maxAttempts && pending.size > 0; attempt += 1) {
    if (attempt > 0) {
      await sleep(intervalMs);
    }

    const ids = [...pending];
    for (const idChunk of chunkArray(ids, RECEIPT_ID_CHUNK)) {
      try {
        const result = await fetchExpoReceipts(idChunk);
        if (result?.errors?.length) {
          logWarn('getReceipts reported errors:', JSON.stringify(result.errors).slice(0, 500));
        }
        const data = result?.data && typeof result.data === 'object' ? result.data : {};

        for (const ticketId of idChunk) {
          if (!(ticketId in data)) continue;
          pending.delete(ticketId);
          const rec = data[ticketId];
          if (rec?.status === 'ok') {
            receiptOk += 1;
            continue;
          }
          receiptError += 1;
          const msg = typeof rec?.message === 'string' ? rec.message : JSON.stringify(rec?.details ?? rec);
          if (!firstReceiptErrorMessage && msg) firstReceiptErrorMessage = msg.slice(0, 500);
          const errCode = rec?.details?.error;
          if (errCode === 'DeviceNotRegistered') {
            const docId = ticketIdToDocId.get(ticketId);
            if (docId) receiptInvalidDocIds.push(docId);
          }
        }
      } catch (e) {
        logError('getReceipts chunk failed:', e?.message ?? e);
      }
    }
  }

  return {
    receiptOk,
    receiptError,
    receiptPending: pending.size,
    receiptInvalidDocIds,
    firstReceiptErrorMessage,
  };
}

function computeDeliveryOutcome(ticketOkCount, receiptOk, receiptError, receiptPending) {
  if (ticketOkCount <= 0) return 'submission_failed';
  if (receiptPending > 0) return 'receipts_pending';
  if (receiptError === 0 && receiptOk === ticketOkCount) return 'delivered';
  if (receiptOk > 0 && receiptError > 0) return 'partially_delivered';
  if (receiptOk === 0 && receiptError > 0) return 'failed';
  return 'unknown';
}

async function getActivePushTargets(db) {
  const snapshot = await db.collection('push_tokens').get();
  const targets = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const token = typeof data?.token === 'string' ? data.token.trim() : '';
    if (!token) continue;
    targets.push({ docId: docSnap.id, token });
  }
  return targets;
}

async function markInvalidTokens(db, invalidDocIds) {
  if (invalidDocIds.length === 0) return;
  const uniqueIds = [...new Set(invalidDocIds)];
  const ops = uniqueIds.map((id) => db.collection('push_tokens').doc(id).delete());
  await Promise.allSettled(ops);
}

async function run() {
  await initLogFile();

  if (!process.env.EXPO_ACCESS_TOKEN?.trim()) {
    logWarn(
      'EXPO_ACCESS_TOKEN is not set. Sending may still work for small volumes; Expo recommends a project access token for production.',
    );
  }

  const serviceAccount = await loadServiceAccount();
  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  const db = getFirestore();
  const nowMs = Date.now();
  const campaignsSnapshot = await db.collection('campaigns').where('status', '==', 'pending').get();
  const dueCampaigns = campaignsSnapshot.docs.filter((docSnap) => isDueCampaign(docSnap.data(), nowMs));

  if (dueCampaigns.length === 0) {
    logInfo('No due pending campaigns.');
    return;
  }

  const targets = await getActivePushTargets(db);
  if (targets.length === 0) {
    logWarn('No push tokens found in push_tokens.');
    return;
  }

  logInfo(`Sending ${dueCampaigns.length} campaign(s) to ${targets.length} token(s).`);

  for (const campaignDoc of dueCampaigns) {
    const campaign = campaignDoc.data();
    const title = typeof campaign.title === 'string' ? campaign.title : 'Notification';
    const body = typeof campaign.body === 'string' ? campaign.body : '';
    const data = campaign.data && typeof campaign.data === 'object' ? campaign.data : {};

    const messages = targets.map(({ token }) => ({
      to: token,
      title,
      body,
      data,
      sound: 'default',
    }));

    const chunks = chunkArray(messages, BATCH_SIZE);
    let ticketOkCount = 0;
    let ticketErrorCount = 0;
    /** @type {string[]} */
    const ticketInvalidDocIds = [];
    /** @type {Map<string, string>} */
    const ticketIdToDocId = new Map();

    for (let i = 0; i < chunks.length; i += 1) {
      const messageChunk = chunks[i];
      const targetChunk = targets.slice(i * BATCH_SIZE, i * BATCH_SIZE + messageChunk.length);

      try {
        const result = await sendExpoBatch(messageChunk);
        const entries = Array.isArray(result?.data) ? result.data : [];

        entries.forEach((entry, index) => {
          const target = targetChunk[index];
          if (entry?.status === 'ok' && typeof entry?.id === 'string') {
            ticketOkCount += 1;
            ticketIdToDocId.set(entry.id, target?.docId);
            return;
          }

          ticketErrorCount += 1;
          const errorCode = entry?.details?.error;
          if (errorCode === 'DeviceNotRegistered' && target?.docId) {
            ticketInvalidDocIds.push(target.docId);
          }
        });
      } catch (error) {
        ticketErrorCount += messageChunk.length;
        logError(`Chunk ${i + 1}/${chunks.length} send failed:`, error?.message ?? error);
      }
    }

    const receiptStats = await pollPushReceipts(ticketIdToDocId);
    const allInvalid = [...ticketInvalidDocIds, ...receiptStats.receiptInvalidDocIds];
    await markInvalidTokens(db, allInvalid);

    const submissionStatus =
      ticketErrorCount === 0 ? 'sent' : ticketOkCount > 0 ? 'partially_sent' : 'failed';

    const deliveryOutcome = computeDeliveryOutcome(
      ticketOkCount,
      receiptStats.receiptOk,
      receiptStats.receiptError,
      receiptStats.receiptPending,
    );

    await campaignDoc.ref.update({
      status: submissionStatus,
      sentAt: Timestamp.now(),
      recipientCount: targets.length,
      sentCount: ticketOkCount,
      errorCount: ticketErrorCount,
      invalidTokenCount: allInvalid.length,
      receiptOkCount: receiptStats.receiptOk,
      receiptErrorCount: receiptStats.receiptError,
      receiptPendingCount: receiptStats.receiptPending,
      deliveryOutcome,
      receiptCheckedAt: Timestamp.now(),
      lastError:
        ticketErrorCount > 0 || receiptStats.receiptError > 0
          ? receiptStats.firstReceiptErrorMessage ?? 'Some tickets or receipts reported errors. Check logs.'
          : null,
      updatedAt: Timestamp.now(),
    });

    logInfo(
      `Campaign ${campaignDoc.id} submission=${submissionStatus} deliveryOutcome=${deliveryOutcome} ticketsOk=${ticketOkCount} ticketsErr=${ticketErrorCount} receiptOk=${receiptStats.receiptOk} receiptErr=${receiptStats.receiptError} receiptPending=${receiptStats.receiptPending} invalidTokens=${allInvalid.length}`,
    );
  }
}

try {
  await run();
} catch (error) {
  logError('Fatal error:', error?.message ?? error);
  process.exitCode = 1;
} finally {
  logFileStream?.end();
}
