
import { GoogleGenAI } from "@google/genai";
import { MarketData } from '../types';

// Initialize the Gemini client using the mandatory apiKey configuration.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini with Google Search to get real-time financial data.
 * This acts as our "Google Finance API" proxy.
 */
export const searchFinanceData = async (query: string): Promise<MarketData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Get the current price and 24h percentage change for ${query} from Google Finance. Return strictly a JSON object with keys: symbol, price_idr, change_percent. Example: {"symbol": "BBCA", "price_idr": 10200, "change_percent": 1.5}. If it's a US stock like AAPL, convert the price to IDR using current exchange rates.`,
      config: {
        tools: [{ googleSearch: {} }],
        // Request JSON format for structured data parsing.
        responseMimeType: "application/json"
      },
    });

    // Extract text using the direct .text property access.
    const text = response.text || "{}";
    const data = JSON.parse(text);
    if (!data.price_idr) return null;

    // Extract grounding chunks to comply with search grounding attribution requirements.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web)
      .filter(Boolean) as { uri: string; title: string }[];

    return {
      symbol: data.symbol || query.toUpperCase(),
      price: data.price_idr,
      change24h: data.change_percent || 0,
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
  for (const sym of symbols) {
    const data = await searchFinanceData(sym);
    if (data) results[sym] = data;
  }
  return results;
};
