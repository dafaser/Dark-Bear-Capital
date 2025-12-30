import { GoogleGenAI } from "@google/genai";
import { MarketData } from '../types';
import { USD_IDR_ESTIMATE } from '../constants';

/**
 * Uses Gemini with Google Search to get real-time financial data.
 * Optimized for Treasury.id and Indonesian local gold prices.
 */
export const searchFinanceData = async (query: string): Promise<MarketData | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Detect if query is gold-related
  const isGold = /gold|emas|antam|treasury|ubs/i.test(query);
  
  // Specific prompt for Indonesian Gold (Treasury focus)
  const searchPrompt = isGold 
    ? `Cari harga beli/investasi emas hari ini per 1 gram di platform Treasury.id atau harga emas Antam terbaru di Indonesia dalam Rupiah (IDR). Harga biasanya berada di rentang Rp1.400.000 hingga Rp2.500.000 per gram.`
    : `Perform a Google Search for the current market price and 24h change of: ${query}. Use ${USD_IDR_ESTIMATE} as USD/IDR rate if the source data is in USD.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${searchPrompt}
      
      CRITICAL INSTRUCTIONS:
      1. For Gold: You MUST find the price per ONE GRAM in IDR (Indonesian Rupiah).
      2. If searching for "Treasury", find the specific price on Treasury.id.
      3. Format response EXACTLY as: "SYMBOL: [sym], PRICE_IDR: [val], CHANGE_PERCENT: [val]".
      4. PRICE_IDR must be a pure number without any dots, commas, or "Rp" (e.g., 2441575).
      5. If CHANGE_PERCENT is not available, use 0.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "";
    
    // Improved regex to capture symbol, price, and change percentage
    const priceMatch = text.match(/PRICE_IDR:?\s*([\d,.]+)/i);
    const changeMatch = text.match(/CHANGE_PERCENT:?\s*([+-]?[\d,.]+)/i);
    const symbolMatch = text.match(/SYMBOL:?\s*([A-Z0-9.]+)/i);

    if (!priceMatch) {
      console.warn("Could not extract price from Gemini response:", text);
      return null;
    }

    // Clean price: remove any non-digit characters (in case Gemini included dots/commas)
    const rawPriceStr = priceMatch[1].replace(/[^\d]/g, ''); 
    const price = parseFloat(rawPriceStr);
    const change = changeMatch ? parseFloat(changeMatch[1]) : 0;
    
    // Use query as symbol if model fails to provide one
    const symbol = symbolMatch ? symbolMatch[1].trim() : query.toUpperCase();

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web)
      .filter(Boolean) as { uri: string; title: string }[];

    return {
      symbol,
      price,
      change24h: change,
      lastUpdated: new Date().toISOString(),
      sources
    };
  } catch (error) {
    console.error("Gemini search integration failed:", error);
    return null;
  }
};

export const fetchMultiplePrices = async (symbols: string[]): Promise<Record<string, MarketData>> => {
  const results: Record<string, MarketData> = {};
  for (const sym of symbols) {
    const data = await searchFinanceData(sym);
    if (data) results[sym] = data;
    // Delay to prevent hitting free-tier search limits
    await new Promise(resolve => setTimeout(resolve, 850));
  }
  return results;
};