
import { Transaction, TransactionType, PortfolioPosition, Asset, MarketData } from '../types';

export const calculatePositions = (
  assets: Asset[],
  transactions: Transaction[],
  marketData: Record<string, MarketData>
): PortfolioPosition[] => {
  const positions: Record<string, { qty: number; totalCost: number }> = {};

  transactions.forEach(tx => {
    if (!positions[tx.assetId]) {
      positions[tx.assetId] = { qty: 0, totalCost: 0 };
    }

    if (tx.type === TransactionType.BUY) {
      positions[tx.assetId].qty += tx.quantity;
      positions[tx.assetId].totalCost += tx.quantity * tx.price;
    } else {
      // For SELL, we reduce quantity. Cost basis typically follows FIFO or Average Cost.
      // In this app, we maintain weighted average of remaining units.
      const avgPrice = positions[tx.assetId].totalCost / positions[tx.assetId].qty;
      positions[tx.assetId].qty -= tx.quantity;
      positions[tx.assetId].totalCost -= tx.quantity * avgPrice;
    }
  });

  const portfolioPositions: PortfolioPosition[] = assets
    .filter(asset => positions[asset.id]?.qty > 0)
    .map(asset => {
      const pos = positions[asset.id];
      const currentPrice = marketData[asset.symbol]?.price || 0;
      const marketValue = pos.qty * currentPrice;
      const totalCost = pos.totalCost;
      const unrealizedPL = marketValue - totalCost;
      const avgBuyPrice = totalCost / pos.qty;

      return {
        asset,
        quantity: pos.qty,
        averageBuyPrice: avgBuyPrice,
        currentPrice,
        marketValue,
        unrealizedPL,
        unrealizedPLPercent: (unrealizedPL / totalCost) * 100,
        allocationPercent: 0, // Calculated later against total
      };
    });

  const totalMarketValue = portfolioPositions.reduce((sum, p) => sum + p.marketValue, 0);
  
  return portfolioPositions.map(p => ({
    ...p,
    allocationPercent: totalMarketValue > 0 ? (p.marketValue / totalMarketValue) * 100 : 0
  }));
};
