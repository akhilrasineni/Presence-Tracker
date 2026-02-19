
import React from 'react';
import { 
  Zap,
  PanelRightClose,
  CalendarDays,
  Coffee,
  Bell
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activeTab: 'calendar' | 'reminders';
  onTabChange: (tab: 'calendar' | 'reminders') => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const triggerManualBreak = () => {
    window.dispatchEvent(new CustomEvent('manual-break-trigger'));
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-200 overflow-hidden border-l border-slate-800 shadow-2xl">
      {/* Mini Sidebar */}
      <nav className="w-16 border-r border-slate-800 flex flex-col items-center py-6 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 mb-8">
          <Zap size={24} className="text-white fill-current" />
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onTabChange('calendar')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-slate-800 text-blue-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <CalendarDays size={20} />
          </button>

          <button 
            onClick={() => onTabChange('reminders')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'reminders' ? 'bg-slate-800 text-indigo-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Bell size={20} />
          </button>
        </div>

        <div className="flex-grow" />
        
        <button 
          onClick={triggerManualBreak}
          title="Force a break"
          className="p-3 mb-4 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-all group"
        >
          <Coffee size={20} className="group-hover:animate-bounce" />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-widest uppercase text-slate-400">
              {activeTab === 'calendar' ? 'Presence' : 'Reminders'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">v1.1</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={triggerManualBreak}
              className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded text-[10px] font-bold transition-all uppercase tracking-tighter"
            >
              <Coffee size={12} /> Break
            </button>
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <PanelRightClose size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
