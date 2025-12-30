
import React from 'react';
import { MarketData } from '../types';
import { WATCHLIST_SYMBOLS } from '../constants';

interface WatchlistViewProps {
  marketData: Record<string, MarketData>;
}

const WatchlistView: React.FC<WatchlistViewProps> = ({ marketData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
      {WATCHLIST_SYMBOLS.map(symbol => {
        const data = marketData[symbol];
        const isPositive = (data?.change24h || 0) >= 0;

        return (
          <div key={symbol} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900/50 transition-all border-l-2" style={{borderLeftColor: isPositive ? '#10b981' : '#f43f5e'}}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">{symbol}</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Global Market</p>
              </div>
              <div className={`px-2 py-1 text-[10px] font-black rounded uppercase ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {isPositive ? '+' : ''}{data?.change24h.toFixed(2)}%
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl font-semibold text-white mono">${data?.price.toLocaleString() || '---'}</span>
              <span className="text-xs text-zinc-600 font-medium mono">USD</span>
            </div>

            <div className="h-12 w-full flex items-end gap-1 px-1">
               {/* Mock sparkline */}
               {[40, 70, 45, 90, 65, 80, 50, 60, 40, 85, 95, 75].map((h, i) => (
                 <div 
                   key={i} 
                   className={`flex-1 rounded-t-sm transition-all duration-500 ${isPositive ? 'bg-emerald-500/20 group-hover:bg-emerald-500/40' : 'bg-rose-500/20 group-hover:bg-rose-500/40'}`} 
                   style={{height: `${h}%`}}
                 ></div>
               ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between">
               <button className="text-[10px] font-bold text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">Alerts</button>
               <button className="text-[10px] font-bold text-white uppercase tracking-widest hover:underline">Chart</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WatchlistView;
