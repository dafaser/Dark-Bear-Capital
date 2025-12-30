
import React from 'react';
import { PortfolioPosition } from '../types';

interface PortfolioViewProps {
  positions: PortfolioPosition[];
  idrRate: number;
  isPrivacyMode: boolean;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ positions, idrRate, isPrivacyMode }) => {
  const formatUSD = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatIDR = (val: number) => `Rp ${Math.round(val).toLocaleString()}`;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Qty</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Avg Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Current Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Market Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">P/L</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-600 italic">No open positions tracked. Add transactions to begin.</td>
                </tr>
              ) : (
                positions.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full" style={{backgroundColor: pos.asset.color}}></div>
                        <div>
                          <div className="text-sm font-semibold text-white tracking-tight">{pos.asset.symbol}</div>
                          <div className="text-[10px] text-zinc-500 font-medium">{pos.asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-sm border border-zinc-700 text-zinc-400">
                        {pos.asset.assetClass}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-white mono text-sm">
                      {isPrivacyMode ? '••••' : pos.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-zinc-400 mono text-sm">
                      {isPrivacyMode ? '••••' : formatUSD(pos.averageBuyPrice)}
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-white mono text-sm">
                      {isPrivacyMode ? '••••' : formatUSD(pos.currentPrice)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-sm font-semibold text-white mono">
                        {isPrivacyMode ? '••••' : formatUSD(pos.marketValue)}
                      </div>
                      {pos.asset.assetClass === 'GOLD' && (
                         <div className="text-[10px] text-zinc-500 mono font-medium">
                           {isPrivacyMode ? '••••' : formatIDR(pos.marketValue * idrRate)}
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`text-sm font-semibold mono ${pos.unrealizedPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPrivacyMode ? '••••' : `${pos.unrealizedPL >= 0 ? '+' : ''}${formatUSD(pos.unrealizedPL)}`}
                      </div>
                      <div className={`text-[10px] font-bold ${pos.unrealizedPL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPrivacyMode ? '•••' : `${pos.unrealizedPLPercent.toFixed(2)}%`}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="w-24 bg-zinc-800 h-1.5 rounded-full ml-auto overflow-hidden">
                        <div 
                          className="h-full bg-zinc-500" 
                          style={{width: `${pos.allocationPercent}%`, backgroundColor: pos.asset.color}}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 mt-1 block mono">
                        {pos.allocationPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
