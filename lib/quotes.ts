import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const DAILY_QUOTE_STATE_KEY = '@zaf/daily_quote_state';

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  profession?: string;
}

interface DailyQuoteState {
  slot: string;
  quote: DailyQuote;
  lastQuoteId: string;
}

const FALLBACK_QUOTE: DailyQuote = {
  id: 'fallback',
  text: '今あるものに満たされない者は\nこれから欲しいものにも満たされない',
  author: 'ソクラテス',
  profession: '古代ギリシャの哲学者',
};

function getCurrentQuoteSlot(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const minute = now.getMinutes();
  const bucket = Math.floor(minute / 15) * 15;
  const q = String(bucket).padStart(2, '0');
  return `${y}-${m}-${d}-${h}:${q}`;
}

function formatAttribution(quote: DailyQuote): string {
  if (quote.profession?.trim()) return `${quote.author}(${quote.profession})`;
  return quote.author;
}

async function loadState(): Promise<DailyQuoteState | null> {
  try {
    const raw = await AsyncStorage.getItem(DAILY_QUOTE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyQuoteState;
    if (!parsed?.quote?.id || !parsed?.slot) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function saveState(state: DailyQuoteState): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_QUOTE_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

async function fetchQuotePool(): Promise<DailyQuote[]> {
  const snapshot = await getDocs(collection(db, 'quotes'));
  const quotes: DailyQuote[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as {
      text?: string;
      quote?: string;
      author?: string;
      profession?: string;
      enabled?: boolean;
    };

    if (data.enabled === false) continue;
    const text = (data.text ?? data.quote ?? '').trim();
    if (!text) continue;

    quotes.push({
      id: docSnap.id,
      text,
      author: (data.author ?? '不明').trim() || '不明',
      profession: data.profession?.trim(),
    });
  }

  return quotes;
}

function pickQuote(pool: DailyQuote[], lastQuoteId: string | null): DailyQuote {
  if (pool.length === 0) return FALLBACK_QUOTE;
  if (pool.length === 1) return pool[0];

  const filtered = lastQuoteId ? pool.filter((q) => q.id !== lastQuoteId) : pool;
  const candidates = filtered.length > 0 ? filtered : pool;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

export async function getTodaysQuote(): Promise<{ text: string; attribution: string }> {
  const slot = getCurrentQuoteSlot();
  const stored = await loadState();

  if (stored?.slot === slot && stored.quote?.text) {
    return { text: stored.quote.text, attribution: formatAttribution(stored.quote) };
  }

  try {
    const pool = await fetchQuotePool();
    const picked = pickQuote(pool, stored?.lastQuoteId ?? null);
    await saveState({
      slot,
      quote: picked,
      lastQuoteId: picked.id,
    });
    return { text: picked.text, attribution: formatAttribution(picked) };
  } catch {
    const fallback = stored?.quote ?? FALLBACK_QUOTE;
    return { text: fallback.text, attribution: formatAttribution(fallback) };
  }
}
