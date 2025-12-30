
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, MarketData, PortfolioPosition, GlobalStats } from './types';
import { calculatePositions } from './services/calculations';
import { fetchMultiplePrices } from './services/api';

import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import PortfolioView from './views/PortfolioView';
import WatchlistView from './views/WatchlistView';
import JournalView from './views/JournalView';
import AnalyticsView from './views/AnalyticsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'watchlist' | 'journal' | 'analytics'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dark_bear_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('dark_bear_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const refreshPortfolioPrices = async () => {
    const symbolsToFetch = Array.from(new Set(transactions.map(t => t.symbol))) as string[];
    if (symbolsToFetch.length === 0) return;
    
    setIsLoading(true);
    const data = await fetchMultiplePrices(symbolsToFetch);
    setMarketData(prev => ({ ...prev, ...data }));
    setIsLoading(false);
  };

  useEffect(() => {
    refreshPortfolioPrices();
    const interval = setInterval(refreshPortfolioPrices, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [transactions.length]);

  const positions = useMemo(() => 
    calculatePositions(transactions, marketData),
  [transactions, marketData]);

  const stats: GlobalStats = useMemo(() => {
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const totalInvested = positions.reduce((sum, p) => sum + (p.quantity * p.averageBuyPrice), 0);
    const allTimePL = totalValue - totalInvested;
    const todayPL = positions.reduce((sum, p) => {
      const change = marketData[p.symbol]?.change24h || 0;
      return sum + (p.marketValue * (change / 100));
    }, 0);

    return {
      totalValue,
      totalInvested,
      allTimePL,
      allTimePLPercent: totalInvested > 0 ? (allTimePL / totalInvested) * 100 : 0,
      todayPL,
      todayPLPercent: totalValue > 0 ? (todayPL / totalValue) * 100 : 0
    };
  }, [positions, marketData]);

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-[#e4e4e7]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase letter-spacing-wide">
                {activeTab === 'dashboard' ? 'Portfolio Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              {isLoading && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPrivacyMode(!isPrivacyMode)}
              className="px-3 py-1.5 text-xs font-medium border border-zinc-800 rounded-md hover:bg-zinc-900 transition-colors"
            >
              {isPrivacyMode ? 'Show Numbers' : 'Privacy Mode'}
            </button>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Base Currency</span>
              <span className="text-sm font-medium text-white mono">IDR (Rupiah)</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView stats={stats} positions={positions} isPrivacyMode={isPrivacyMode} />}
        {activeTab === 'portfolio' && <PortfolioView positions={positions} isPrivacyMode={isPrivacyMode} />}
        {activeTab === 'watchlist' && <WatchlistView marketData={marketData} />}
        {activeTab === 'journal' && (
          <JournalView 
            transactions={transactions} 
            onAdd={(tx) => setTransactions(prev => [tx, ...prev])} 
            onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsView positions={positions} stats={stats} />}
      </main>
    </div>
  );
};

export default App;
