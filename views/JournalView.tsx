import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, AssetClass } from '../types';
import { getAssetClass } from '../services/calculations';

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

interface JournalViewProps {
  transactions: Transaction[];
  onAdd: (tx: Transaction) => void;
  onUpdate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ transactions, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
    symbol: '',
    type: TransactionType.BUY,
    date: new Date().toISOString().split('T')[0],
    quantity: undefined,
    price: undefined,
    notes: ''
  });

  const activeAssetClass = useMemo(() => {
    if (!formData.symbol) return AssetClass.STOCK;
    return getAssetClass(formData.symbol);
  }, [formData.symbol]);

  const unitLabel = useMemo(() => {
    switch (activeAssetClass) {
      case AssetClass.GOLD: return 'Gram (gr)';
      case AssetClass.STOCK: return 'Lot (100 lbr)';
      case AssetClass.CRYPTO: return 'Coins / Unit';
      default: return 'Quantity';
    }
  }, [activeAssetClass]);

  const priceLabel = useMemo(() => {
    switch (activeAssetClass) {
      case AssetClass.STOCK: return 'Price per Share (Lembar)';
      case AssetClass.GOLD: return 'Price per Gram';
      default: return 'Unit Price';
    }
  }, [activeAssetClass]);

  const totalEstimate = useMemo(() => {
    if (!formData.quantity || !formData.price) return 0;
    const multiplier = activeAssetClass === AssetClass.STOCK ? 100 : 1;
    return formData.quantity * formData.price * multiplier;
  }, [formData.quantity, formData.price, activeAssetClass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.price) return;
    
    const tx: Transaction = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      assetId: formData.symbol.toUpperCase().trim(),
      symbol: formData.symbol.toUpperCase().trim(),
      name: formData.symbol.toUpperCase().trim(), 
      type: formData.type as TransactionType,
      date: formData.date!,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      notes: formData.notes
    };

    if (editingId) {
      onUpdate(tx);
    } else {
      onAdd(tx);
    }

    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      symbol: '',
      type: TransactionType.BUY,
      date: new Date().toISOString().split('T')[0],
      quantity: undefined,
      price: undefined,
      notes: ''
    });
  };

  const handleEdit = (tx: Transaction) => {
    setFormData({
      symbol: tx.symbol,
      type: tx.type,
      date: tx.date,
      quantity: tx.quantity,
      price: tx.price,
      notes: tx.notes
    });
    setEditingId(tx.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Transaction Ledger</h2>
        </div>
        <button 
          onClick={() => {
            if (isAdding) {
              resetForm();
            } else {
              setIsAdding(true);
            }
          }}
          className={`px-4 py-2 text-xs font-bold uppercase rounded transition-all duration-300 shadow-sm ${isAdding ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-black hover:bg-zinc-200'}`}
        >
          {isAdding ? 'Close Entry' : 'Add Transaction'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-4">
              {editingId ? 'Edit Entry' : 'New Transaction'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Asset Symbol</label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-amber-500 outline-none uppercase font-bold tracking-wider"
                  placeholder="e.g. BTC, BBCA, ANTM"
                  value={formData.symbol}
                  onChange={e => setFormData({...formData, symbol: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Transaction Type</label>
                <select 
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-amber-500 appearance-none font-medium"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                >
                  <option value={TransactionType.BUY}>BUY / DEPOSIT</option>
                  <option value={TransactionType.SELL}>SELL / WITHDRAW</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Execution Date</label>
                <input type="date" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-amber-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex justify-between">
                  <span>Quantity</span>
                  <span className="text-amber-500">{unitLabel}</span>
                </label>
                <input type="number" step="any" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white mono focus:border-amber-500 outline-none" placeholder="0.00" value={formData.quantity === undefined ? '' : formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value === '' ? undefined : Number(e.target.value)})} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex justify-between">
                  <span>Unit Price (IDR)</span>
                  <span className="text-zinc-600 text-[8px]">{priceLabel}</span>
                </label>
                <input type="number" step="any" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white mono focus:border-amber-500 outline-none" placeholder="Rp 0" value={formData.price === undefined ? '' : formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? undefined : Number(e.target.value)})} required />
              </div>
              <div className="flex flex-col justify-end pb-3">
                <div className="p-3 bg-black/40 rounded border border-zinc-800/50">
                   <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter mb-1">Estimated Total Notional</p>
                   <p className="text-sm font-bold text-white mono">{formatIDR(totalEstimate)}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Execution Note</label>
              <textarea 
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-amber-500 outline-none resize-none h-20" 
                placeholder="Investment thesis or execution details..." 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-amber-500 text-black py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-amber-400 transition-all shadow-lg active:scale-[0.99]">
                {editingId ? 'Update Entry' : 'Post to Journal'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-8 bg-zinc-800 text-zinc-400 py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-zinc-700 transition-all">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ticker</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Side</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Size</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Unit Price</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Total Notional</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-600 italic text-sm font-medium">No transactions recorded in current ledger.</td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const aClass = getAssetClass(tx.symbol);
                const multiplier = aClass === AssetClass.STOCK ? 100 : 1;
                const unitSuffix = aClass === AssetClass.STOCK ? ' lot' : aClass === AssetClass.GOLD ? ' gr' : '';
                
                return (
                  <tr key={tx.id} className={`hover:bg-zinc-800/20 transition-colors group ${editingId === tx.id ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-6 py-4 text-xs text-zinc-500 mono">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-tight">{tx.symbol}</span>
                        <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{aClass}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${tx.type === TransactionType.BUY ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-300 mono">
                      {tx.quantity.toLocaleString()}<span className="text-[10px] text-zinc-600 ml-1">{unitSuffix}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-400 mono">{formatIDR(tx.price)}</td>
                    <td className="px-6 py-4 text-right text-xs text-white font-bold mono">
                      {formatIDR(tx.quantity * tx.price * multiplier)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(tx)} title="Edit Entry" className="p-1.5 text-zinc-700 hover:text-amber-500 hover:bg-amber-500/5 rounded transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => onDelete(tx.id)} title="Delete Entry" className="p-1.5 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/5 rounded transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalView;