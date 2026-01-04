import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'metrics.json');
const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'config.json');

// Interface for persistent config (Slow moving data like Whale Costs)
interface ConfigData {
  cohorts: {
    '1k_10k': number;
    '10k_100k': number;
    'over_100k': number;
  };
  manual_overrides: {
    sentiment?: number; // Manual LTH-NUPL if desired
    structure?: number; // Manual PSIP
    momentum?: number;
  }
}

const DEFAULT_CONFIG: ConfigData = {
  cohorts: {
    '1k_10k': 2260,
    '10k_100k': 2597,
    'over_100k': 2599,
  },
  manual_overrides: {
    structure: 0.617, // 61.7% from tweet
    momentum: 2,
    sentiment: 0.4, // Default from tweet
  }
};

async function fetchEthPrice(): Promise<number> {
  try {
    // Try Binance API first (fast, public)
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return parseFloat(data.price);
    }
  } catch (e) {
    console.warn('Binance fetch failed, trying CoinGecko...');
  }

  try {
    // Fallback to CoinGecko
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return data.ethereum.usd;
    }
  } catch (e) {
    console.error('All price fetches failed');
    return 3000; // Fallback
  }
  return 3000;
}

async function fetchFearAndGreed(): Promise<{ value: number, status: string }> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1', { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const item = data.data[0];
      return { value: parseInt(item.value), status: item.value_classification };
    }
  } catch (e) {
    console.error('F&G fetch failed');
  }
  return { value: 50, status: 'Neutral' }; // Fallback
}

export const getMetrics = async (): Promise<MetricsData> => {
  // 1. Load Static/Manual Config
  let config = DEFAULT_CONFIG;
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));
  } else {
    // Ensure dir exists
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  // 2. Fetch Live Data (Parallel)
  const [price, fng] = await Promise.all([
    fetchEthPrice(),
    fetchFearAndGreed()
  ]);

  // 3. Assemble Metrics
  // Logic: 
  // Sentiment: Uses Manual LTH-NUPL if available, otherwise could map F&G to it? 
  // For now, let's keep LTH-NUPL as the primary "Sentiment" metric because it's the strategy core.
  // BUT the user wants automation. 
  // We will return the LIVE price to update 'Cost' logic automatically.

  return {
    sentiment: {
      value: config.manual_overrides.sentiment ?? 0.4,
      status: (config.manual_overrides.sentiment ?? 0.4) < 0 ? 'bullish' : 'neutral',
    },
    structure: {
      value: config.manual_overrides.structure ?? 0.617,
      status: (config.manual_overrides.structure ?? 0.617) < 0.5 ? 'bullish' : 'neutral',
    },
    cost: {
      currentPrice: price,
      cohorts: config.cohorts,
    },
    momentum: {
      score: config.manual_overrides.momentum ?? 2,
    },
    lastUpdated: new Date().toISOString(),
  };
};

export const updateConfig = (newConfig: Partial<ConfigData>) => {
  let current = DEFAULT_CONFIG;
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    current = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));
  }

  const updated = { ...current, ...newConfig };
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(updated, null, 2));
  return updated;
};

// No longer using updateMetrics for the main route, as we generate it dynamically.
export const updateMetrics = (data: any) => { throw new Error("Use updateConfig instead"); };
