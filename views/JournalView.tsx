import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

interface JournalViewProps {
  transactions: Transaction[];
  onAdd: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ transactions, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    symbol: '',
    type: TransactionType.BUY,
    date: new Date().toISOString().split('T')[0],
    quantity: undefined,
    price: undefined,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.symbol || !newTx.quantity || !newTx.price) return;
    
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: newTx.symbol.toUpperCase().trim(),
      symbol: newTx.symbol.toUpperCase().trim(),
      name: newTx.symbol.toUpperCase().trim(), 
      type: newTx.type as TransactionType,
      date: newTx.date!,
      quantity: Number(newTx.quantity),
      price: Number(newTx.price),
      notes: newTx.notes
    };
    onAdd(tx);
    setIsAdding(false);
    setNewTx({
      symbol: '',
      type: TransactionType.BUY,
      date: new Date().toISOString().split('T')[0],
      quantity: undefined,
      price: undefined,
      notes: ''
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Transaction Ledger</h2>
          <p className="text-[10px] text-zinc-600">Manual entry for high-precision institutional record keeping.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 text-xs font-bold uppercase rounded transition-all duration-300 ${isAdding ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-black hover:bg-zinc-200'}`}
        >
          {isAdding ? 'Close Entry' : 'Log Transaction'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Asset Symbol</label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-amber-500 outline-none uppercase font-bold"
                  placeholder="e.g. BTC, BBCA, AAPL"
                  value={newTx.symbol}
                  onChange={e => setNewTx({...newTx, symbol: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Transaction Type</label>
                <select 
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-amber-500 appearance-none"
                  value={newTx.type}
                  onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})}
                >
                  <option value={TransactionType.BUY}>BUY / DEPOSIT</option>
                  <option value={TransactionType.SELL}>SELL / WITHDRAW</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Execution Date</label>
                <input type="date" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-amber-500 outline-none" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quantity</label>
                <input type="number" step="any" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white mono focus:border-amber-500 outline-none" placeholder="0.00" value={newTx.quantity === undefined ? '' : newTx.quantity} onChange={e => setNewTx({...newTx, quantity: e.target.value === '' ? undefined : Number(e.target.value)})} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Unit Price (IDR)</label>
                <input type="number" step="any" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white mono focus:border-amber-500 outline-none" placeholder="Rp 0" value={newTx.price === undefined ? '' : newTx.price} onChange={e => setNewTx({...newTx, price: e.target.value === '' ? undefined : Number(e.target.value)})} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Execution Note</label>
                <input type="text" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-amber-500 outline-none" placeholder="Reasoning..." value={newTx.notes} onChange={e => setNewTx({...newTx, notes: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-amber-500 text-black py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-amber-400 transition-all shadow-lg active:scale-[0.99]">
              Post to Journal
            </button>
            <p className="text-[9px] text-zinc-600 text-center italic">Institutional valuation will update automatically across the dashboard after posting.</p>
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
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Price</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Total Notional</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-600 italic text-sm">No transactions recorded in current ledger.</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-xs text-zinc-500 mono">{tx.date}</td>
                  <td className="px-6 py-4"><span className="text-sm font-bold text-white tracking-tight">{tx.symbol}</span></td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${tx.type === TransactionType.BUY ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-zinc-300 mono">{tx.quantity.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-xs text-zinc-300 mono">{formatIDR(tx.price)}</td>
                  <td className="px-6 py-4 text-right text-xs text-white font-bold mono">{formatIDR(tx.quantity * tx.price)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onDelete(tx.id)} className="p-1.5 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/5 rounded transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalView;