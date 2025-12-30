import { Transaction, TransactionType, PortfolioPosition, MarketData, AssetClass } from '../types';

/**
 * Detects asset class based on symbol string.
 */
export const getAssetClass = (symbol: string): AssetClass => {
  const sym = symbol.toUpperCase();
  if (sym.includes('BTC') || sym.includes('ETH') || sym.includes('SOL') || sym.includes('BNB') || sym.includes('USDT')) {
    return AssetClass.CRYPTO;
  } else if (sym.includes('GOLD') || sym.includes('ANTM') || sym.includes('EMAS') || sym.includes('TREASURY') || sym.includes('UBS')) {
    return AssetClass.GOLD;
  }
  return AssetClass.STOCK;
};

export const calculatePositions = (
  transactions: Transaction[],
  marketData: Record<string, MarketData>
): PortfolioPosition[] => {
  const symbolStats: Record<string, { qty: number; totalCost: number; name: string; class: AssetClass }> = {};

  transactions.forEach(tx => {
    const sym = tx.symbol.toUpperCase();
    if (!symbolStats[tx.symbol]) {
      symbolStats[tx.symbol] = { 
        qty: 0, 
        totalCost: 0, 
        name: tx.name, 
        class: getAssetClass(tx.symbol) 
      };
    }

    // Calculation logic:
    // For Stocks: Quantity is in LOTS. Total Price = Qty * 100 * PricePerShare
    // For Gold/Crypto: Quantity is in Units (Gr/Coins). Total Price = Qty * PricePerUnit
    const multiplier = symbolStats[tx.symbol].class === AssetClass.STOCK ? 100 : 1;
    const transactionValue = tx.quantity * multiplier * tx.price;

    if (tx.type === TransactionType.BUY) {
      symbolStats[tx.symbol].qty += tx.quantity;
      symbolStats[tx.symbol].totalCost += transactionValue;
    } else {
      const currentQty = symbolStats[tx.symbol].qty;
      if (currentQty > 0) {
        // We use average cost for the cost reduction on sell
        const avgPricePerBaseUnit = symbolStats[tx.symbol].totalCost / (currentQty * multiplier);
        symbolStats[tx.symbol].qty -= tx.quantity;
        symbolStats[tx.symbol].totalCost -= (tx.quantity * multiplier * avgPricePerBaseUnit);
      }
    }
  });

  const portfolioPositions: PortfolioPosition[] = Object.keys(symbolStats)
    .filter(sym => symbolStats[sym].qty > 0)
    .map(sym => {
      const stat = symbolStats[sym];
      const currentPrice = marketData[sym]?.price || 0;
      const multiplier = stat.class === AssetClass.STOCK ? 100 : 1;
      
      const marketValue = stat.qty * multiplier * currentPrice;
      const totalCost = stat.totalCost;
      const unrealizedPL = marketValue - totalCost;
      const avgBuyPrice = totalCost / (stat.qty * multiplier);

      // Consistent Institutional Color Scheme
      let color = '#3b82f6'; // Stocks (Blue)
      if (stat.class === AssetClass.CRYPTO) color = '#f97316'; // Crypto (Orange)
      if (stat.class === AssetClass.GOLD) color = '#fbbf24'; // Gold (Amber)

      return {
        symbol: sym,
        name: stat.name,
        assetClass: stat.class,
        quantity: stat.qty,
        averageBuyPrice: avgBuyPrice,
        currentPrice,
        marketValue,
        unrealizedPL,
        unrealizedPLPercent: totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0,
        allocationPercent: 0,
        color
      };
    });

  const totalMarketValue = portfolioPositions.reduce((sum, p) => sum + p.marketValue, 0);
  
  return portfolioPositions.map(p => ({
    ...p,
    allocationPercent: totalMarketValue > 0 ? (p.marketValue / totalMarketValue) * 100 : 0
  }));
};