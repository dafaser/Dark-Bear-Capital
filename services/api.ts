import { GoogleGenAI } from "@google/genai";
import { MarketData } from '../types';
import { USD_IDR_ESTIMATE } from '../constants';

/**
 * Uses Gemini with Google Search to get real-time financial data.
 * Optimized for High Precision (Google Finance / official sources).
 */
export const searchFinanceData = async (query: string): Promise<MarketData | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isGold = /gold|emas|antam|treasury|ubs/i.test(query);
  
  // Specific instruction to prioritize Google Finance or official market data sources
  const searchPrompt = isGold 
    ? `Cari harga BELI emas hari ini per 1 gram di Treasury.id atau harga emas Antam terbaru di LogamMulia.com dalam Rupiah (IDR). Harus harga beli terbaru, bukan harga buyback.`
    : `Find the precise current market price and 24h change for "${query}" using Google Finance, Yahoo Finance, or official stock exchange data. If the asset is on IDX (Indonesian Stock Exchange), find its current price in IDR. Use ${USD_IDR_ESTIMATE} as the conversion rate ONLY if the asset is strictly priced in USD.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${searchPrompt}
      
      CRITICAL INSTRUCTIONS:
      1. Priority Source: GOOGLE FINANCE knowledge graph.
      2. For Gold: Price per ONE GRAM in IDR (must be between 1,000,000 and 2,500,000).
      3. Format response EXACTLY as: "SYMBOL: [sym], PRICE_IDR: [val], CHANGE_PERCENT: [val]".
      4. PRICE_IDR must be a pure number without any dots, commas, or "Rp" (e.g., 2441575).
      5. If CHANGE_PERCENT is not found, use 0.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "";
    
    const priceMatch = text.match(/PRICE_IDR:?\s*([\d,.]+)/i);
    const changeMatch = text.match(/CHANGE_PERCENT:?\s*([+-]?[\d,.]+)/i);
    const symbolMatch = text.match(/SYMBOL:?\s*([A-Z0-9.]+)/i);

    if (!priceMatch) {
      console.warn("Could not extract price from Gemini response:", text);
      return null;
    }

    const rawPriceStr = priceMatch[1].replace(/[^\d]/g, ''); 
    const price = parseFloat(rawPriceStr);
    const change = changeMatch ? parseFloat(changeMatch[1]) : 0;
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
    await new Promise(resolve => setTimeout(resolve, 850));
  }
  return results;
};