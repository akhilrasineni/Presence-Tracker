
import React, { useState } from 'react';
import { 
  Zap,
  CalendarDays,
  Bell,
  Coffee,
  HelpCircle,
  X,
  Target,
  TrendingUp,
  Activity,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activeTab: 'calendar' | 'reminders';
  onTabChange: (tab: 'calendar' | 'reminders') => void;
  onPurgeData: () => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, activeTab, onTabChange, onPurgeData }) => {
  const [showHandbook, setShowHandbook] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Dynamic Sidebar */}
      <nav className={`transition-all duration-300 border-r border-slate-900 flex flex-col items-center py-6 bg-slate-950/50 backdrop-blur-xl z-[100] shrink-0 ${isCollapsed ? 'w-12' : 'w-16 lg:w-20'}`}>
        <div className={`p-2 bg-blue-600 rounded-xl shadow-xl shadow-blue-500/20 mb-8 transition-transform duration-700 cursor-pointer ${isCollapsed ? 'scale-75' : 'scale-100 hover:rotate-180'}`}>
          <Zap size={20} className="text-white fill-current" />
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onTabChange('calendar')}
            className={`p-3 rounded-xl transition-all duration-300 relative group ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-900'}`}
          >
            <CalendarDays size={18} />
          </button>

          <button 
            onClick={() => onTabChange('reminders')}
            className={`p-3 rounded-xl transition-all duration-300 relative group ${activeTab === 'reminders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-900'}`}
          >
            <Bell size={18} />
          </button>
        </div>

        <div className="flex-grow" />
        
        <div className="flex flex-col gap-3 pb-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-3 rounded-xl text-slate-700 hover:text-white transition-all"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          
          {!isCollapsed && (
            <>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('manual-break-trigger'))}
                className="p-3 rounded-xl text-slate-600 hover:text-orange-400 hover:bg-orange-400/5 transition-all"
              >
                <Coffee size={18} />
              </button>
              
              <button 
                onClick={() => setShowPurgeConfirm(true)}
                className="p-3 rounded-xl text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Responsive Body */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 shrink-0 border-b border-slate-900 flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="font-black text-[8px] tracking-[0.3em] uppercase text-slate-500">
              Terminal Active
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHandbook(true)}
              className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
            >
              <HelpCircle size={16} />
            </button>
            <div className="flex items-center gap-2 bg-slate-900/40 py-1 pl-2 pr-1 rounded-full border border-slate-800/60">
              <span className="font-black text-[8px] tracking-widest uppercase text-slate-400">
                RASINENI <span className="text-white">PRO</span>
              </span>
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[7px] text-white font-black">
                R
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>

        {/* System Handbook Modal */}
        {showHandbook && (
          <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[360px] rounded-[2.5rem] p-8 shadow-2xl relative">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-white">Handbook</h3>
                <button onClick={() => setShowHandbook(false)} className="p-2 text-slate-500 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong className="text-white">Efficiency:</strong> Mission completion rate.</p>
                <p><strong className="text-white">Presence:</strong> Compliance with weekly office targets.</p>
                <p><strong className="text-white">Neural Lens:</strong> Gemini-powered real-time tab summary and Q&A.</p>
              </div>
              <button 
                onClick={() => setShowHandbook(false)}
                className="w-full mt-8 py-3 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20"
              >
                Acknowledged
              </button>
            </div>
          </div>
        )}

        {/* Purge Confirmation */}
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-[#0f172a] border border-red-500/20 w-full max-w-[340px] rounded-[2.5rem] p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Purge Data?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-8">This will permanently erase all mission logs, presence records, and AI caches.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => { onPurgeData(); setShowPurgeConfirm(false); }} className="w-full py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30">Delete Permanently</button>
                <button onClick={() => setShowPurgeConfirm(false)} className="w-full py-3 text-slate-500 text-[9px] font-black uppercase tracking-widest">Abort</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SidebarLayout;
