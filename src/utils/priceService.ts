// Price service for fetching cryptocurrency prices
export interface PriceData {
  octUsd: number;
  timestamp: number;
}

let cachedPrice: PriceData | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchoctPrice = async (): Promise<number> => {
  // Check cache first
  if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
    return cachedPrice.octUsd;
  }

  try {
    // Try CoinGecko API first
    const response = await fetch(
  import.meta.env.VITE_COINGECKO_API
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = data['onechain-hashgraph']?.usd;
      
      if (price) {
        cachedPrice = {
          octUsd: price,
          timestamp: Date.now()
        };
        return price;
      }
    }
  } catch (error) {
    console.warn('CoinGecko API failed, trying fallback:', error);
  }

  try {
    // Fallback to CoinCap API
  const response = await fetch(import.meta.env.VITE_COINCAP_API);
    
    if (response.ok) {
      const data = await response.json();
      const price = parseFloat(data.data?.priceUsd);
      
      if (price) {
        cachedPrice = {
          octUsd: price,
          timestamp: Date.now()
        };
        return price;
      }
    }
  } catch (error) {
    console.warn('CoinCap API failed:', error);
  }

  // Fallback to a reasonable default if APIs fail
  console.warn('All price APIs failed, using fallback price');
  return 0.05; // Fallback oct price in USD
};

export const formatPriceInUSD = (octAmount: number, octPrice: number): string => {
  const usdValue = octAmount * octPrice;
  
  if (usdValue < 1) {
    return `$${usdValue.toFixed(4)}`;
  } else if (usdValue < 1000) {
    return `$${usdValue.toFixed(2)}`;
  } else {
    return `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const convertoctToUSD = (octAmount: string | number, octPrice: number): number => {
  const octValue = typeof octAmount === 'string' ? parseFloat(octAmount) : octAmount;
  return octValue * octPrice;
};
