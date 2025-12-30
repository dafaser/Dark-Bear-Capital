
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
  type: TransactionType;
  date: string;
  quantity: number;
  price: number; // In asset's primary currency (USD for Stocks/Crypto/Gold Spot)
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
  price: number;
  change24h: number;
  lastUpdated: string;
}

export interface PortfolioPosition {
  asset: Asset;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  allocationPercent: number;
}

export interface GlobalStats {
  totalValue: number;
  totalInvested: number;
  allTimePL: number;
  allTimePLPercent: number;
  todayPL: number;
  todayPLPercent: number;
}
