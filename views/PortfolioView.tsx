import React from 'react';
import { PortfolioPosition, AssetClass } from '../types';

interface PortfolioViewProps {
  positions: PortfolioPosition[];
  isPrivacyMode: boolean;
}

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const PortfolioView: React.FC<PortfolioViewProps> = ({ positions, isPrivacyMode }) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Total Quantity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Avg Price / Unit</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Live Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Market Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Unrealized P/L</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-zinc-600 italic text-sm">No active positions. Log transactions in the Journal to build your portfolio.</td>
                </tr>
              ) : (
                positions.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full" style={{backgroundColor: pos.color}}></div>
                        <div>
                          <div className="text-sm font-semibold text-white tracking-tight">{pos.symbol}</div>
                          <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{pos.assetClass}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-white mono text-sm">
                      {isPrivacyMode ? '••••' : pos.quantity.toLocaleString()}
                      {!isPrivacyMode && (
                        <span className="text-[10px] text-zinc-500 ml-1 font-bold uppercase tracking-tighter">
                          {pos.assetClass === AssetClass.GOLD ? 'gr' : pos.assetClass === AssetClass.STOCK ? 'lot' : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-zinc-500 mono text-xs">
                      {isPrivacyMode ? '••••' : formatIDR(pos.averageBuyPrice)}
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-white mono text-sm">
                      {isPrivacyMode ? '••••' : formatIDR(pos.currentPrice)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-sm font-semibold text-white mono">
                        {isPrivacyMode ? '••••' : formatIDR(pos.marketValue)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`text-sm font-semibold mono ${pos.unrealizedPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPrivacyMode ? '••••' : `${pos.unrealizedPL >= 0 ? '+' : ''}${formatIDR(pos.unrealizedPL)}`}
                      </div>
                      <div className={`text-[10px] font-black ${pos.unrealizedPL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPrivacyMode ? '•••' : `${pos.unrealizedPLPercent.toFixed(2)}%`}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-[10px] font-black text-zinc-600 mono bg-zinc-800/50 inline-block px-2 py-0.5 rounded">
                        {pos.allocationPercent.toFixed(1)}%
                      </div>
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