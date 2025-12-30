import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, MarketData, GlobalStats } from './types';
import { calculatePositions } from './services/calculations';
import { fetchMultiplePrices } from './services/api';

import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import PortfolioView from './views/PortfolioView';
import WatchlistView from './views/WatchlistView';
import JournalView from './views/JournalView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'watchlist' | 'journal'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dark_bear_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    localStorage.setItem('dark_bear_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const refreshPortfolioPrices = async () => {
    const symbolsToFetch = Array.from(new Set(transactions.map(t => t.symbol))) as string[];
    if (symbolsToFetch.length === 0) return;
    
    setIsLoading(true);
    try {
      const data = await fetchMultiplePrices(symbolsToFetch);
      setMarketData(prev => ({ ...prev, ...data }));
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Failed to refresh market data", error);
    } finally {
      setIsLoading(false);
    }
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

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-[#e4e4e7]">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as any)} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
                {activeTab === 'dashboard' ? 'Portfolio Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              {isLoading && (
                <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Live Sync</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-zinc-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {lastRefreshed && (
                <>
                  <span className="text-zinc-800">•</span>
                  <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight">
                    Last Sync: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={refreshPortfolioPrices}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-zinc-800 rounded-md hover:bg-zinc-900 transition-colors disabled:opacity-50"
              >
                <svg className={`${isLoading ? 'animate-spin' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                {isLoading ? 'Syncing...' : 'Refresh Prices'}
              </button>
              <button 
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-zinc-800 rounded-md hover:bg-zinc-900 transition-colors"
              >
                {isPrivacyMode ? 'Show Numbers' : 'Privacy Mode'}
              </button>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-tight">Valuation</span>
              <span className="text-sm font-medium text-white mono leading-tight">IDR / RP</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView stats={stats} positions={positions} isPrivacyMode={isPrivacyMode} />}
        {activeTab === 'portfolio' && <PortfolioView positions={positions} isPrivacyMode={isPrivacyMode} />}
        {activeTab === 'watchlist' && <WatchlistView marketData={marketData} />}
        {activeTab === 'journal' && (
          <JournalView 
            transactions={transactions} 
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        )}
      </main>
    </div>
  );
};

export default App;