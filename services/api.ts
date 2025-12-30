import { GoogleGenAI } from "@google/genai";
import { MarketData } from '../types';

/**
 * Uses Gemini with Google Search to get real-time financial data.
 * Adheres to rule: Do not attempt to parse Search output as JSON directly.
 */
export const searchFinanceData = async (query: string): Promise<MarketData | null> => {
  // Initialize right before call to ensure latest API_KEY is captured from injected process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the current price and 24h performance of ${query} on Google Finance. 
      If it is a US stock, convert the price to IDR (Indonesian Rupiah).
      Please state the data clearly like: "PRICE_IDR: [value], CHANGE_PERCENT: [value], SYMBOL: [symbol]".`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "";
    
    // Use regex to find values in the generated text as per Grounding rules (avoiding JSON.parse)
    const priceMatch = text.match(/PRICE_IDR:?\s*([\d,.]+)/i);
    const changeMatch = text.match(/CHANGE_PERCENT:?\s*([+-]?[\d,.]+)/i);
    const symbolMatch = text.match(/SYMBOL:?\s*([A-Z0-9.]+)/i);

    if (!priceMatch) {
      console.warn("Could not find price in response:", text);
      return null;
    }

    const price = parseFloat(priceMatch[1].replace(/,/g, ''));
    const change = changeMatch ? parseFloat(changeMatch[1]) : 0;
    const symbol = symbolMatch ? symbolMatch[1] : query.toUpperCase();

    // Extract grounding chunks for attribution
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
  // Execute sequentially to avoid overwhelming rate limits on individual search grounding requests
  for (const sym of symbols) {
    const data = await searchFinanceData(sym);
    if (data) results[sym] = data;
  }
  return results;
};