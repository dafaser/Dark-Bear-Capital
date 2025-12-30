
import { MarketData } from '../types';

/**
 * Note: Real-world apps would use authenticated keys. 
 * These endpoints use public or demo-compatible interfaces where possible.
 */

export const fetchStockPrices = async (symbols: string[]): Promise<Record<string, MarketData>> => {
  // Mocking real-time stock data for demo purposes since free keys (AlphaVantage) are very restrictive
  const data: Record<string, MarketData> = {};
  symbols.forEach(symbol => {
    data[symbol] = {
      symbol,
      price: Math.random() * 200 + 100,
      change24h: (Math.random() - 0.5) * 5,
      lastUpdated: new Date().toISOString()
    };
  });
  return data;
};

export const fetchCryptoPrices = async (ids: string[]): Promise<Record<string, MarketData>> => {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
    const json = await response.json();
    
    const data: Record<string, MarketData> = {};
    Object.keys(json).forEach(id => {
      const symbol = id.toUpperCase();
      data[symbol] = {
        symbol,
        price: json[id].usd,
        change24h: json[id].usd_24h_change,
        lastUpdated: new Date().toISOString()
      };
    });
    return data;
  } catch (error) {
    console.error('Crypto fetch failed', error);
    return {};
  }
};

export const fetchGoldPrice = async (): Promise<MarketData> => {
  // Metals-API usually requires keys. Using a fallback proxy or mock for the demo.
  return {
    symbol: 'GOLD',
    price: 2650.50, // USD per oz
    change24h: 0.45,
    lastUpdated: new Date().toISOString()
  };
};

export const fetchExchangeRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const json = await response.json();
    return json.rates.IDR;
  } catch (error) {
    return 15850; // Fallback
  }
};
