import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { searchFinanceData } from '../services/api';

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
  const [assetSearch, setAssetSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ symbol: string; price: number } | null>(null);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: TransactionType.BUY,
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    price: 0
  });

  const handleSearchAsset = async () => {
    if (!assetSearch) return;
    setIsSearching(true);
    const data = await searchFinanceData(assetSearch);
    if (data) {
      setSelectedAsset({ symbol: data.symbol, price: data.price });
      setNewTx(prev => ({ ...prev, price: data.price }));
    }
    setIsSearching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: selectedAsset.symbol,
      symbol: selectedAsset.symbol,
      name: selectedAsset.symbol, // or descriptive name
      type: newTx.type as TransactionType,
      date: newTx.date!,
      quantity: Number(newTx.quantity),
      price: Number(newTx.price),
      notes: newTx.notes
    };
    onAdd(tx);
    setIsAdding(false);
    setSelectedAsset(null);
    setAssetSearch('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Transaction Ledger (IDR)</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-white text-black px-4 py-2 text-xs font-bold uppercase rounded hover:bg-zinc-200 transition-colors"
        >
          {isAdding ? 'Cancel' : 'Log Transaction'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
          {!selectedAsset ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  className="flex-1 bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-amber-500 outline-none"
                  placeholder="Enter asset symbol (BBCA, BTC, Gold...)"
                  value={assetSearch}
                  onChange={e => setAssetSearch(e.target.value)}
                />
                <button 
                  onClick={handleSearchAsset}
                  className="bg-zinc-800 text-zinc-300 px-6 rounded text-xs font-bold uppercase tracking-widest"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Selected Asset</p>
                  <h3 className="text-2xl font-bold text-white tracking-tighter">{selectedAsset.symbol}</h3>
                </div>
                <button type="button" onClick={() => setSelectedAsset(null)} className="text-[10px] text-rose-500 font-bold uppercase">Change Asset</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Type</label>
                  <select 
                    className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none"
                    value={newTx.type}
                    onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})}
                  >
                    <option value={TransactionType.BUY}>BUY / ADD</option>
                    <option value={TransactionType.SELL}>SELL / REDUCE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Date</label>
                  <input type="date" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quantity</label>
                  {/* Fixed Type Error: Convert input string to number */}
                  <input type="number" step="any" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white mono" value={newTx.quantity} onChange={e => setNewTx({...newTx, quantity: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Execution Price (Rp)</label>
                  {/* Fixed Type Error: Convert input string to number */}
                  <input type="number" step="any" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white mono" value={newTx.price} onChange={e => setNewTx({...newTx, price: Number(e.target.value)})} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Notes</label>
                  <input type="text" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white" placeholder="Investment reasoning..." value={newTx.notes} onChange={e => setNewTx({...newTx, notes: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 text-black py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-amber-400 transition-all">
                Save to Portfolio
              </button>
            </form>
          )}
        </div>
      )}

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Qty</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Price</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Total</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4 text-xs text-zinc-400 mono">{tx.date}</td>
                <td className="px-6 py-4"><span className="text-sm font-bold text-white">{tx.symbol}</span></td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.type === TransactionType.BUY ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm text-zinc-300 mono">{tx.quantity}</td>
                <td className="px-6 py-4 text-right text-sm text-zinc-300 mono">{formatIDR(tx.price)}</td>
                <td className="px-6 py-4 text-right text-sm text-white font-semibold mono">{formatIDR(tx.quantity * tx.price)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDelete(tx.id)} className="text-zinc-700 hover:text-rose-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalView;