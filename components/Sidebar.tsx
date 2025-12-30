import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'portfolio' | 'watchlist' | 'journal' | 'analytics';
  onTabChange: (tab: 'dashboard' | 'portfolio' | 'watchlist' | 'journal' | 'analytics') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems: { id: 'dashboard' | 'portfolio' | 'watchlist' | 'journal' | 'analytics'; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /> },
    { id: 'watchlist', label: 'Watchlist', icon: <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /> },
    { id: 'journal', label: 'Journal', icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></> },
    { id: 'analytics', label: 'Analytics', icon: <><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></> },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-[#0a0a0b] flex flex-col p-6">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
             <span className="text-black font-black text-xl italic leading-none">B</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tighter">DARK BEAR <span className="font-light text-zinc-500">CAPITAL</span></span>
        </div>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Risk-Aware Institutional Growth</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-zinc-900 text-white border border-zinc-800' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={activeTab === item.id ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}
            >
              {item.icon}
            </svg>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-900">
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Strategy Note</p>
          <p className="text-xs text-zinc-400 italic leading-relaxed">
            "The goal isn't to be right. The goal is to survive being wrong."
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;