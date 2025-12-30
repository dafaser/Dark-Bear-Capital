import { Transaction, TransactionType, PortfolioPosition, MarketData, AssetClass } from '../types';

export const calculatePositions = (
  transactions: Transaction[],
  marketData: Record<string, MarketData>
): PortfolioPosition[] => {
  const symbolStats: Record<string, { qty: number; totalCost: number; name: string; class: AssetClass }> = {};

  transactions.forEach(tx => {
    const sym = tx.symbol.toUpperCase();
    if (!symbolStats[tx.symbol]) {
      // Logic to determine Asset Class based on symbol
      let assetClass = AssetClass.STOCK;
      
      if (sym.includes('BTC') || sym.includes('ETH') || sym.includes('SOL') || sym.includes('BNB')) {
        assetClass = AssetClass.CRYPTO;
      } else if (sym.includes('GOLD') || sym.includes('ANTM') || sym.includes('EMAS') || sym.includes('TREASURY') || sym.includes('UBS')) {
        assetClass = AssetClass.GOLD;
      }

      symbolStats[tx.symbol] = { qty: 0, totalCost: 0, name: tx.name, class: assetClass };
    }

    if (tx.type === TransactionType.BUY) {
      symbolStats[tx.symbol].qty += tx.quantity;
      symbolStats[tx.symbol].totalCost += tx.quantity * tx.price;
    } else {
      const currentQty = symbolStats[tx.symbol].qty;
      if (currentQty > 0) {
        const avgPrice = symbolStats[tx.symbol].totalCost / currentQty;
        symbolStats[tx.symbol].qty -= tx.quantity;
        symbolStats[tx.symbol].totalCost -= tx.quantity * avgPrice;
      }
    }
  });

  const portfolioPositions: PortfolioPosition[] = Object.keys(symbolStats)
    .filter(sym => symbolStats[sym].qty > 0)
    .map(sym => {
      const stat = symbolStats[sym];
      const currentPrice = marketData[sym]?.price || 0;
      const marketValue = stat.qty * currentPrice;
      const totalCost = stat.totalCost;
      const unrealizedPL = marketValue - totalCost;
      const avgBuyPrice = totalCost / stat.qty;

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