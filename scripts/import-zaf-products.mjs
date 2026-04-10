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
    if (cur === '--merge') args.merge = true;
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
    if (!Array.isArray(parsed)) throw new Error('JSON must be an array of product objects.');
    return parsed;
  }
  if (filePath.toLowerCase().endsWith('.csv')) {
    return parseCsv(raw);
  }
  throw new Error('Unsupported file type. Use .json or .csv');
}

function normalizeProduct(input, index) {
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  if (!title || !description) return null;
  const idRaw = String(input.id ?? '').trim();
  const id = idRaw || `product-${Date.now()}-${index}`;
  const imageUrl = String(input.imageurl ?? input.imageUrl ?? '').trim();
  const enabledRaw = String(input.enabled ?? 'true').toLowerCase();
  const enabled = enabledRaw !== 'false' && enabledRaw !== '0' && enabledRaw !== 'no';
  const sortOrderRaw = String(input.sortorder ?? input.sortOrder ?? '').trim();
  const parsedSort = parseInt(sortOrderRaw, 10);
  const sortOrder = Number.isFinite(parsedSort) ? parsedSort : index + 1;
  return {
    id,
    title,
    description,
    imageUrl: imageUrl || null,
    enabled,
    sortOrder,
  };
}

async function clearProductsCollection(db) {
  const snapshot = await db.collection('zaf_products').get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  await batch.commit();
}

async function importProducts({ file, merge }) {
  const db = await initDb();
  const filePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  const rawProducts = await readInputFile(filePath);
  const normalized = rawProducts
    .map((p, i) => normalizeProduct(p, i))
    .filter((p) => p !== null);

  if (normalized.length === 0) {
    console.warn('[ProductImport] No valid products found in input file.');
    return;
  }

  if (!merge) {
    await clearProductsCollection(db);
    console.log('[ProductImport] Existing zaf_products cleared (replace mode).');
  }

  const batch = db.batch();
  normalized.forEach((product) => {
    const ref = db.collection('zaf_products').doc(product.id);
    batch.set(
      ref,
      {
        title: product.title,
        description: product.description,
        imageUrl: product.imageUrl,
        enabled: product.enabled,
        sortOrder: product.sortOrder,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        source: 'import',
      },
      { merge },
    );
  });
  await batch.commit();

  console.log(
    `[ProductImport] Imported ${normalized.length} product(s) from ${path.basename(filePath)} (${merge ? 'merge' : 'replace'} mode).`,
  );
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) {
    console.error('Usage: node scripts/import-zaf-products.mjs --file <products.json|products.csv> [--merge]');
    process.exitCode = 1;
    return;
  }
  await importProducts(args);
}

run().catch((error) => {
  console.error('[ProductImport] Fatal error:', error);
  process.exitCode = 1;
});
