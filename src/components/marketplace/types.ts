export interface NetworkInfo {
  name: string;
  logo: string;
}

export interface ListingItem {
  id: string;
  title: string;
  assetNumber?: string;
  price: number;  description: string;
  imageUrl: string;
  category: string;
  network: NetworkInfo;
  type: string;
  tier: string;
  earnXP: number;
  yield: number;
  tokenSymbol?: string; // Deprecated: use priceToken instead
  priceToken: string;
  
}

export interface MarketData {
  realEstate: ListingItem[];
  invoices: ListingItem[];
  commodities: ListingItem[];
}
