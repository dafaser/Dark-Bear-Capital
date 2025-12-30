
import React, { useState, useEffect } from 'react';
import { MarketData, WatchlistItem } from '../types';
import { searchFinanceData } from '../services/api';

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const WatchlistView: React.FC<{ marketData: Record<string, MarketData> }> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<MarketData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('dark_bear_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dark_bear_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    const data = await searchFinanceData(searchQuery);
    setSearchResult(data);
    setIsSearching(false);
  };

  const toggleWatchlist = (item: MarketData) => {
    const exists = watchlist.find(w => w.symbol === item.symbol);
    if (exists) {
      setWatchlist(prev => prev.filter(w => w.symbol !== item.symbol));
    } else {
      setWatchlist(prev => [...prev, { 
        symbol: item.symbol, 
        name: '', 
        price: item.price, 
        change24h: item.change24h,
        sources: item.sources 
      }]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative group">
          <input 
            type="text" 
            placeholder="Search Stocks, Crypto, or Gold (e.g., BBCA, BTC, Gold)..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all pl-14"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-md">
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResult && (
          <div className="mt-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tighter">{searchResult.symbol}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Real-time Data (IDR)</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="text-xl font-bold text-white mono">{formatIDR(searchResult.price)}</div>
                  <div className={`text-[10px] font-black ${searchResult.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {searchResult.change24h >= 0 ? '+' : ''}{searchResult.change24h.toFixed(2)}%
                  </div>
                </div>
                <button 
                  onClick={() => toggleWatchlist(searchResult)}
                  className={`p-2 rounded-full border border-zinc-800 transition-all ${watchlist.find(w => w.symbol === searchResult.symbol) ? 'bg-amber-500 text-black border-amber-600' : 'text-zinc-600 hover:text-amber-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                </button>
              </div>
            </div>

            {searchResult.sources && searchResult.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {searchResult.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] text-amber-500/70 hover:text-amber-500 underline truncate max-w-[200px]"
                    >
                      {source.title || 'Market Info'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlist.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
            <p className="text-zinc-600 text-sm italic">Watchlist is empty. Search for assets above and click the star to track them.</p>
          </div>
        ) : (
          watchlist.map(item => (
            <div key={item.symbol} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{item.symbol}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Saved Tracker</p>
                </div>
                <button 
                  onClick={() => setWatchlist(prev => prev.filter(w => w.symbol !== item.symbol))}
                  className="text-amber-500 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                </button>
              </div>
              <div className="text-2xl font-semibold text-white mono mb-2">{formatIDR(item.price)}</div>
              
              {item.sources && item.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.sources.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="text-[8px] text-zinc-600 bg-zinc-800 px-1 rounded truncate max-w-[80px]">
                      {s.title}
                    </span>
                  ))}
                </div>
              )}

              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-amber-500 w-1/2"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WatchlistView;
