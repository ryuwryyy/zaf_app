import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const defaultServiceAccountPath = path.join(repoRoot, 'google-service-account-key.json');

function parseArgs(argv) {
  const args = { file: '', merge: false };
  for (let i = 0; i < argv.length; i += 1) {
    const cur = argv[i];
    if (cur === '--file' || cur === '-f') {
      args.file = argv[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (cur === '--merge') {
      args.merge = true;
    }
  }
  return args;
}

function splitCsvLine(line) {
  const out = [];
  let buf = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        buf += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  out.push(buf.trim());
  return out;
}

function parseCsv(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function normalizeQuote(input, index) {
  const text = String(input.text ?? input.quote ?? '').trim();
  if (!text) return null;
  const idRaw = String(input.id ?? '').trim();
  const id = idRaw || `quote-${Date.now()}-${index}`;
  const author = String(input.author ?? '不明').trim() || '不明';
  const professionRaw = String(input.profession ?? '').trim();
  const enabledRaw = String(input.enabled ?? 'true').toLowerCase();
  const enabled = enabledRaw !== 'false' && enabledRaw !== '0' && enabledRaw !== 'no';

  return {
    id,
    text,
    author,
    profession: professionRaw || null,
    enabled,
    source: 'import',
  };
}

async function loadServiceAccount() {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || defaultServiceAccountPath;
  const raw = await readFile(serviceAccountPath, 'utf8');
  return JSON.parse(raw);
}

async function initDb() {
  const serviceAccount = await loadServiceAccount();
  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

async function readInputFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  if (filePath.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('JSON must be an array of quote objects.');
    return parsed;
  }
  if (filePath.toLowerCase().endsWith('.csv')) {
    return parseCsv(raw);
  }
  throw new Error('Unsupported file type. Use .json or .csv');
}

async function clearQuotesCollection(db) {
  const snapshot = await db.collection('quotes').get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  await batch.commit();
}

async function importQuotes({ file, merge }) {
  const db = await initDb();
  const filePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  const rawQuotes = await readInputFile(filePath);
  const normalized = rawQuotes
    .map((q, i) => normalizeQuote(q, i))
    .filter((q) => q !== null);

  if (normalized.length === 0) {
    console.warn('[QuoteImport] No valid quotes found in input file.');
    return;
  }

  if (!merge) {
    await clearQuotesCollection(db);
    console.log('[QuoteImport] Existing quotes cleared (replace mode).');
  }

  const batch = db.batch();
  normalized.forEach((quote, idx) => {
    const ref = db.collection('quotes').doc(quote.id);
    batch.set(
      ref,
      {
        text: quote.text,
        author: quote.author,
        profession: quote.profession,
        enabled: quote.enabled,
        sortOrder: idx + 1,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        source: quote.source,
      },
      { merge },
    );
  });

  await batch.commit();
  console.log(
    `[QuoteImport] Imported ${normalized.length} quote(s) from ${path.basename(filePath)} (${merge ? 'merge' : 'replace'} mode).`,
  );
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) {
    console.error('Usage: node scripts/import-quotes.mjs --file <quotes.json|quotes.csv> [--merge]');
    process.exitCode = 1;
    return;
  }
  await importQuotes(args);
}

run().catch((error) => {
  console.error('[QuoteImport] Fatal error:', error);
  process.exitCode = 1;
});
