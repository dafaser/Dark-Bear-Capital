
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PortfolioPosition, GlobalStats } from '../types';

interface AnalyticsViewProps {
  positions: PortfolioPosition[];
  stats: GlobalStats;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ positions, stats }) => {
  const assetPerformance = [...positions]
    .sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent)
    .map(p => ({
      // Fix: PortfolioPosition has a flat structure; symbol is a direct property.
      name: p.symbol,
      percent: p.unrealizedPLPercent,
      color: p.unrealizedPLPercent >= 0 ? '#10b981' : '#f43f5e'
    }));

  const allocationByClass = positions.reduce((acc, pos) => {
    // Fix: PortfolioPosition has a flat structure; assetClass is a direct property.
    const existing = acc.find(a => a.name === pos.assetClass);
    if (existing) {
      existing.value += pos.marketValue;
    } else {
      // Fix: PortfolioPosition has a flat structure; assetClass is a direct property.
      acc.push({ name: pos.assetClass, value: pos.marketValue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-10">Relative Performance (%)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#18181b" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 11}} width={60} />
                <Tooltip 
                  cursor={{fill: '#18181b'}}
                  contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px'}}
                  formatter={(val: any) => [`${val.toFixed(2)}%`, 'Unrealized P/L']}
                />
                <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={20}>
                  {assetPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8">Portfolio Concentration</h3>
            <div className="space-y-6">
              {allocationByClass.map((ac, i) => {
                const perc = (ac.value / stats.totalValue) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-white tracking-widest uppercase">{ac.name}</span>
                      <span className="text-zinc-400 mono">{perc.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-zinc-400 transition-all duration-1000" 
                        style={{
                          width: `${perc}%`, 
                          backgroundColor: ac.name === 'STOCK' ? '#3b82f6' : ac.name === 'GOLD' ? '#fbbf24' : '#f97316'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-12 p-4 bg-zinc-900 border border-zinc-800 rounded italic text-xs text-zinc-500 leading-relaxed">
            Analytics highlight: Your portfolio is currently { (allocationByClass.find(a => a.name === 'STOCK')?.value || 0) > stats.totalValue * 0.5 ? 'concentrated in Equities' : 'well-diversified' }. 
            Maintain focus on risk-adjusted returns rather than nominal growth.
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Risk Attribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border-l-2 border-zinc-800 pl-4 py-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Volatilty Index</p>
            <p className="text-xl font-semibold text-white mono">Low</p>
          </div>
          <div className="border-l-2 border-zinc-800 pl-4 py-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Max Drawdown</p>
            <p className="text-xl font-semibold text-rose-500 mono">-4.2%</p>
          </div>
          <div className="border-l-2 border-zinc-800 pl-4 py-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Sharpe Ratio</p>
            <p className="text-xl font-semibold text-emerald-500 mono">1.82</p>
          </div>
          <div className="border-l-2 border-zinc-800 pl-4 py-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Diversification</p>
            <p className="text-xl font-semibold text-white mono">Optimal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
