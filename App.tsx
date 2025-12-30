
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Transaction, MarketData, PortfolioPosition, GlobalStats } from './types';
import { INITIAL_ASSETS } from './constants';
import { calculatePositions } from './services/calculations';
import { fetchStockPrices, fetchCryptoPrices, fetchGoldPrice, fetchExchangeRate } from './services/api';

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
  const [idrRate, setIdrRate] = useState<number>(15800);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Sync transactions to localStorage
  useEffect(() => {
    localStorage.setItem('dark_bear_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Fetch prices
  const refreshData = async () => {
    const stockSymbols = INITIAL_ASSETS.filter(a => a.assetClass === 'STOCK').map(a => a.symbol);
    const cryptoIds = ['bitcoin']; // mapping for coingecko
    
    const [stocks, crypto, gold, rate] = await Promise.all([
      fetchStockPrices(stockSymbols),
      fetchCryptoPrices(cryptoIds),
      fetchGoldPrice(),
      fetchExchangeRate()
    ]);

    setMarketData({
      ...stocks,
      ...crypto,
      GOLD: gold
    });
    setIdrRate(rate);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const positions = useMemo(() => 
    calculatePositions(INITIAL_ASSETS, transactions, marketData),
  [transactions, marketData]);

  const stats: GlobalStats = useMemo(() => {
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const totalInvested = positions.reduce((sum, p) => sum + (p.quantity * p.averageBuyPrice), 0);
    const allTimePL = totalValue - totalInvested;
    
    // Simplified today's PL based on current market change %
    const todayPL = positions.reduce((sum, p) => {
      const change = marketData[p.asset.symbol]?.change24h || 0;
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

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-[#e4e4e7]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase letter-spacing-wide">
              {activeTab === 'dashboard' ? 'Market Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
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
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">USD/IDR</span>
              <span className="text-sm font-medium text-white mono">{idrRate.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <DashboardView stats={stats} positions={positions} isPrivacyMode={isPrivacyMode} />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioView positions={positions} idrRate={idrRate} isPrivacyMode={isPrivacyMode} />
        )}
        {activeTab === 'watchlist' && (
          <WatchlistView marketData={marketData} />
        )}
        {activeTab === 'journal' && (
          <JournalView 
            transactions={transactions} 
            assets={INITIAL_ASSETS} 
            onAdd={handleAddTransaction} 
            onDelete={handleDeleteTransaction}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView positions={positions} stats={stats} />
        )}
      </main>
    </div>
  );
};

export default App;
