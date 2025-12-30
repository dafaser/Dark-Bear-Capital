
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GlobalStats, PortfolioPosition } from '../types';
import StatsCard from '../components/StatsCard';

interface DashboardViewProps {
  stats: GlobalStats;
  positions: PortfolioPosition[];
  isPrivacyMode: boolean;
}

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const DashboardView: React.FC<DashboardViewProps> = ({ stats, positions, isPrivacyMode }) => {
  const historyData = [
    { name: 'T-4', val: stats.totalValue * 0.95 },
    { name: 'T-3', val: stats.totalValue * 0.98 },
    { name: 'T-2', val: stats.totalValue * 0.96 },
    { name: 'T-1', val: stats.totalValue * 0.99 },
    { name: 'Today', val: stats.totalValue },
  ];

  const pieData = positions.map(p => ({
    name: p.symbol,
    value: p.marketValue,
    color: p.color
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Total Portfolio Value" 
          value={formatIDR(stats.totalValue)} 
          isPrivacyMode={isPrivacyMode}
        />
        <StatsCard 
          label="Today's Performance" 
          value={formatIDR(stats.todayPL)} 
          subValue={`${stats.todayPLPercent > 0 ? '+' : ''}${stats.todayPLPercent.toFixed(2)}%`}
          subValueType={stats.todayPL >= 0 ? 'positive' : 'negative'}
          isPrivacyMode={isPrivacyMode}
        />
        <StatsCard 
          label="All-time Growth" 
          value={formatIDR(stats.allTimePL)} 
          subValue={`${stats.allTimePLPercent > 0 ? '+' : ''}${stats.allTimePLPercent.toFixed(2)}%`}
          subValueType={stats.allTimePL >= 0 ? 'positive' : 'negative'}
          isPrivacyMode={isPrivacyMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8">Cumulative Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10}} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px'}}
                  labelStyle={{color: '#a1a1aa', marginBottom: '4px'}}
                  itemStyle={{color: '#fff', fontSize: '12px'}}
                  formatter={(val: any) => formatIDR(val)}
                />
                <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 text-center">Capital Allocation</h3>
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px'}} formatter={(val: any) => formatIDR(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                  <span className="text-xs text-zinc-400">{d.name}</span>
                </div>
                <span className="text-xs font-medium text-white mono">{((d.value / stats.totalValue) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
