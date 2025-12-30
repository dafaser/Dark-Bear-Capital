import { GoogleGenAI } from "@google/genai";
import { MarketData } from '../types';
import { USD_IDR_ESTIMATE } from '../constants';

/**
 * Uses Gemini with Google Search to get real-time financial data.
 * Adheres to rule: Do not attempt to parse Search output as JSON directly.
 */
export const searchFinanceData = async (query: string): Promise<MarketData | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // We provide the USD_IDR_ESTIMATE to prevent the model from performing an extra search for the exchange rate.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a Google Search for the current market price and 24h change of: ${query}. 
      
      CRITICAL INSTRUCTIONS:
      1. Use ${USD_IDR_ESTIMATE} as the static USD to IDR conversion rate. Do NOT search for exchange rates.
      2. If the price is in USD, multiply by ${USD_IDR_ESTIMATE} to get IDR.
      3. Format response exactly as: "SYMBOL: [sym], PRICE_IDR: [val], CHANGE_PERCENT: [val]".
      4. Be extremely concise.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "";
    
    // Improved regex to handle various formatting possibilities from the model
    const priceMatch = text.match(/PRICE_IDR:?\s*([\d,.]+)/i);
    const changeMatch = text.match(/CHANGE_PERCENT:?\s*([+-]?[\d,.]+)/i);
    const symbolMatch = text.match(/SYMBOL:?\s*([A-Z0-9.]+)/i);

    if (!priceMatch) {
      console.warn("Could not find price in response:", text);
      return null;
    }

    // Clean price string of commas and non-numeric chars except decimal
    const price = parseFloat(priceMatch[1].replace(/,/g, ''));
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
    console.error("Gemini search failed:", error);
    return null;
  }
};

export const fetchMultiplePrices = async (symbols: string[]): Promise<Record<string, MarketData>> => {
  const results: Record<string, MarketData> = {};
  // For multiple prices, we process them in parallel with a small delay to avoid rate limiting
  // but keeping it sequential to be safe with free-tier search limits
  for (const sym of symbols) {
    const data = await searchFinanceData(sym);
    if (data) results[sym] = data;
    // Tiny delay to breathe between searches
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return results;
};