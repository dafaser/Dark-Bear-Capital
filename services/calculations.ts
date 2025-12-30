
import { Transaction, TransactionType, PortfolioPosition, MarketData, AssetClass } from '../types';

export const calculatePositions = (
  transactions: Transaction[],
  marketData: Record<string, MarketData>
): PortfolioPosition[] => {
  const symbolStats: Record<string, { qty: number; totalCost: number; name: string; class: AssetClass }> = {};

  transactions.forEach(tx => {
    if (!symbolStats[tx.symbol]) {
      symbolStats[tx.symbol] = { qty: 0, totalCost: 0, name: tx.name, class: AssetClass.STOCK }; // Default to stock for search results
    }

    if (tx.type === TransactionType.BUY) {
      symbolStats[tx.symbol].qty += tx.quantity;
      symbolStats[tx.symbol].totalCost += tx.quantity * tx.price;
    } else {
      const avgPrice = symbolStats[tx.symbol].totalCost / symbolStats[tx.symbol].qty;
      symbolStats[tx.symbol].qty -= tx.quantity;
      symbolStats[tx.symbol].totalCost -= tx.quantity * avgPrice;
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

      // Simple color logic based on asset name/symbol
      let color = '#3b82f6';
      if (sym.includes('BTC') || sym.includes('ETH')) color = '#f97316';
      if (sym.includes('GOLD') || sym.includes('ANTM')) color = '#fbbf24';

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
