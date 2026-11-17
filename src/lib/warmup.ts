import type { Env } from '../env';
import { fetchBajus } from '../modules/gold/bajus';
import { remember as rememberGold } from '../modules/gold/last-good';
import { remember as rememberMarket } from '../modules/market/last-good';
import { fetchTcb } from '../modules/market/tcb';

export interface WarmupSummary {
  gold: { success: boolean; effective_date?: string; error?: string };
  market: { success: boolean; date?: string; error?: string };
}

/**
 * Pre-warms live datasets (BAJUS gold rates & TCB market prices) into Workers KV.
 * Proactively called by Cloudflare Workers scheduled cron triggers.
 */
export async function warmupLiveData(env: Env): Promise<WarmupSummary> {
  const summary: WarmupSummary = {
    gold: { success: false },
    market: { success: false },
  };

  const kv = env.LIVE_DATA;
  if (!kv) {
    return summary;
  }

  // Proactively fetch and store BAJUS gold & silver prices
  try {
    const goldPrices = await fetchBajus();
    await rememberGold(kv, goldPrices);
    summary.gold = { success: true, effective_date: goldPrices.effective_date };
  } catch (err) {
    summary.gold = { success: false, error: String(err) };
    console.error(JSON.stringify({ level: 'error', name: 'warmup:bajus', message: String(err) }));
  }

  // Proactively fetch and store TCB Dhaka market retail prices
  try {
    const marketPrices = await fetchTcb();
    await rememberMarket(kv, marketPrices);
    summary.market = { success: true, date: marketPrices.date };
  } catch (err) {
    summary.market = { success: false, error: String(err) };
    console.error(JSON.stringify({ level: 'error', name: 'warmup:tcb', message: String(err) }));
  }

  return summary;
}
