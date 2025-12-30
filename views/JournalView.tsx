
import React, { useState } from 'react';
import { Transaction, Asset, TransactionType } from '../types';

interface JournalViewProps {
  transactions: Transaction[];
  assets: Asset[];
  onAdd: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ transactions, assets, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: TransactionType.BUY,
    assetId: assets[0].id,
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: newTx.assetId!,
      type: newTx.type as TransactionType,
      date: newTx.date!,
      quantity: Number(newTx.quantity),
      price: Number(newTx.price),
      notes: newTx.notes
    };
    onAdd(tx);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Transaction Ledger</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-white text-black px-4 py-2 text-xs font-bold uppercase rounded hover:bg-zinc-200 transition-colors"
        >
          {isAdding ? 'Cancel' : 'Register Transaction'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Transaction Type</label>
              <select 
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-zinc-500"
                value={newTx.type}
                onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})}
              >
                <option value={TransactionType.BUY}>BUY / DEPOSIT</option>
                <option value={TransactionType.SELL}>SELL / WITHDRAW</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Asset</label>
              <select 
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-zinc-500"
                value={newTx.assetId}
                onChange={e => setNewTx({...newTx, assetId: e.target.value})}
              >
                {assets.map(a => <option key={a.id} value={a.id}>{a.symbol} — {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Date</label>
              <input 
                type="date"
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-zinc-500"
                value={newTx.date}
                onChange={e => setNewTx({...newTx, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quantity</label>
              <input 
                type="number"
                step="any"
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-zinc-500 mono"
                value={newTx.quantity}
                onChange={e => setNewTx({...newTx, quantity: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Execution Price (USD)</label>
              <input 
                type="number"
                step="any"
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-zinc-500 mono"
                value={newTx.price}
                onChange={e => setNewTx({...newTx, price: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Notes (Optional)</label>
              <input 
                type="text"
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white outline-none focus:border-zinc-500"
                placeholder="Investment thesis..."
                value={newTx.notes}
                onChange={e => setNewTx({...newTx, notes: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-zinc-100 text-black py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-white transition-all">
            Commit to Ledger
          </button>
        </form>
      )}

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Quantity</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Price</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Value</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-600 italic">No transactions recorded.</td>
              </tr>
            )}
            {transactions.map((tx) => {
              const asset = assets.find(a => a.id === tx.assetId);
              return (
                <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-xs text-zinc-400 mono">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white">{asset?.symbol}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.type === TransactionType.BUY ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-zinc-300 mono">{tx.quantity}</td>
                  <td className="px-6 py-4 text-right text-sm text-zinc-300 mono">${tx.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm text-white font-semibold mono">${(tx.quantity * tx.price).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(tx.id)}
                      className="text-zinc-600 hover:text-rose-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalView;
