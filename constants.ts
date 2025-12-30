
import { Asset, AssetClass } from './types';

export const INITIAL_ASSETS: Asset[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', assetClass: AssetClass.STOCK, color: '#3b82f6' },
  { id: '2', symbol: 'TSLA', name: 'Tesla, Inc.', assetClass: AssetClass.STOCK, color: '#3b82f6' },
  { id: '3', symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: AssetClass.STOCK, color: '#3b82f6' },
  { id: '4', symbol: 'GOLD', name: 'Physical Gold', assetClass: AssetClass.GOLD, color: '#fbbf24' },
  { id: '5', symbol: 'BTC', name: 'Bitcoin', assetClass: AssetClass.CRYPTO, color: '#f97316' },
];

export const WATCHLIST_SYMBOLS = ['MSFT', 'GOOGL', 'AMZN', 'META', 'ETH', 'SOL'];

export const USD_IDR_ESTIMATE = 15800; // Simplified static estimate for IDR conversion
