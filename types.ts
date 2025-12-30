
export enum AssetClass {
  STOCK = 'STOCK',
  GOLD = 'GOLD',
  CRYPTO = 'CRYPTO'
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface Transaction {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  type: TransactionType;
  date: string;
  quantity: number;
  price: number; // In IDR
  notes?: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  color: string;
}

export interface MarketData {
  symbol: string;
  price: number; // In IDR
  change24h: number;
  lastUpdated: string;
  sources?: { uri: string; title: string }[];
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  allocationPercent: number;
  color: string;
}

export interface GlobalStats {
  totalValue: number;
  totalInvested: number;
  allTimePL: number;
  allTimePLPercent: number;
  todayPL: number;
  todayPLPercent: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sources?: { uri: string; title: string }[];
}
