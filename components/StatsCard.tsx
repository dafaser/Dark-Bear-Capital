
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  subValueType?: 'positive' | 'negative' | 'neutral';
  isPrivacyMode?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, subValueType, isPrivacyMode }) => {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-baseline gap-3">
        <h3 className="text-3xl font-semibold tracking-tight text-white mono">
          {isPrivacyMode ? '••••••' : value}
        </h3>
        {subValue && (
          <span className={`text-sm font-medium ${
            subValueType === 'positive' ? 'text-emerald-500' : 
            subValueType === 'negative' ? 'text-rose-500' : 
            'text-zinc-400'
          }`}>
            {isPrivacyMode ? '•••' : subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
