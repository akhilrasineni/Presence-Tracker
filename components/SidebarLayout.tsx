
import React, { useState } from 'react';
import { 
  Zap,
  CalendarDays,
  Bell,
  Coffee,
  HelpCircle,
  X,
  Target,
  Trash2,
  Database,
  Download,
  MoreVertical,
  ShieldCheck,
  Wallet,
  Brain,
  LayoutDashboard
} from 'lucide-react';

import TechnicalDocumentation from './TechnicalDocumentation';

import { motion } from 'motion/react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activeTab: 'calendar' | 'reminders' | 'finance' | 'training';
  onTabChange: (tab: 'calendar' | 'reminders' | 'finance' | 'training') => void;
  onPurgeData: () => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, activeTab, onTabChange, onPurgeData }) => {
  const [showFullDocs, setShowFullDocs] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showVault, setShowVault] = useState(false);

  const exportLocalData = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rpt_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rasineni_strategy_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <nav className="hidden md:flex flex-col items-center py-6 border-r border-slate-900 bg-slate-950/50 backdrop-blur-xl z-[100] shrink-0 w-20 lg:w-24">
        <div className="p-2.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-10 transition-transform duration-700 cursor-pointer scale-100 hover:rotate-12">
          <Zap size={24} className="text-white fill-current" />
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onTabChange('calendar')}
            className={`p-4 rounded-2xl transition-all duration-300 relative group ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-900'}`}
          >
            <CalendarDays size={20} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-[8px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Hub</span>
          </button>

          <button 
            onClick={() => onTabChange('reminders')}
            className={`p-4 rounded-2xl transition-all duration-300 relative group ${activeTab === 'reminders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-900'}`}
          >
            <Bell size={20} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-[8px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Missions</span>
          </button>

          <button 
            onClick={() => onTabChange('finance')}
            className={`p-4 rounded-2xl transition-all duration-300 relative group ${activeTab === 'finance' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-900'}`}
          >
            <Wallet size={20} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-[8px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Finance</span>
          </button>

          <button 
            onClick={() => onTabChange('training')}
            className={`p-4 rounded-2xl transition-all duration-300 relative group ${activeTab === 'training' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-900'}`}
          >
            <Brain size={20} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-[8px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Training</span>
          </button>
        </div>

        <div className="flex-grow" />
        
        <div className="flex flex-col gap-4 pb-4">
          <button 
            onClick={() => setShowVault(true)}
            className="p-4 rounded-2xl text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/5 transition-all"
          >
            <Database size={20} />
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('manual-break-trigger'))}
            className="p-4 rounded-2xl text-slate-600 hover:text-orange-400 hover:bg-orange-400/5 transition-all"
          >
            <Coffee size={20} />
          </button>
          
          <button 
            onClick={() => setShowPurgeConfirm(true)}
            className="p-4 rounded-2xl text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 md:h-20 shrink-0 border-b border-slate-900 flex items-center justify-between px-4 md:px-8 bg-slate-950/40 backdrop-blur-xl z-50">
          <div className="flex items-center gap-3">
            <div className="md:hidden p-1.5 bg-blue-600 rounded-lg">
              <Zap size={16} className="text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-blue-500 leading-none">Terminal Local</span>
              <span className="font-black text-xs md:text-sm text-white tracking-tight mt-1">RASINENI <span className="text-slate-500">PRO</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFullDocs(true)}
              className="p-2.5 text-slate-500 hover:text-blue-400 transition-colors bg-slate-900/50 rounded-xl md:bg-transparent"
            >
              <HelpCircle size={18} />
            </button>
            
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2.5 text-slate-500 bg-slate-900/50 rounded-xl"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        {/* VAULT MODAL */}
        {showVault && (
          <div className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[360px] rounded-[2.5rem] p-8 shadow-2xl relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-white">Local Vault</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Strategic Telemetry Export</p>
                </div>
                <button onClick={() => setShowVault(false)} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Local</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Your mission data is stored exclusively in your browser's local cache. No tactical information is shared unless AI analysis is explicitly triggered.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={exportLocalData}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <Download size={16} /> Export Strategy JSON
                </button>
                <button 
                  onClick={() => setShowVault(false)}
                  className="w-full py-3 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Close Vault
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE DROPDOWN MENU */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-16 right-4 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-2 z-[200] shadow-2xl animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => { exportLocalData(); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              <Download size={16} className="text-emerald-400" /> Export Strategy
            </button>
            <button 
              onClick={() => { window.dispatchEvent(new CustomEvent('manual-break-trigger')); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              <Coffee size={16} className="text-orange-400" /> Break Refresh
            </button>
            <button 
              onClick={() => { setShowPurgeConfirm(true); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 size={16} /> Purge Hub Data
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 md:pb-6 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-900 px-6 flex items-center justify-around z-[100] pb-safe">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange('calendar')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'calendar' ? 'text-blue-500' : 'text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'calendar' ? 'bg-blue-500/10' : ''}`}>
              <CalendarDays size={22} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Hub</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange('reminders')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'reminders' ? 'text-indigo-500' : 'text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'reminders' ? 'bg-indigo-500/10' : ''}`}>
              <Bell size={22} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Missions</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange('finance')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'finance' ? 'text-emerald-500' : 'text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'finance' ? 'bg-emerald-500/10' : ''}`}>
              <Wallet size={22} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Finance</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange('training')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'training' ? 'text-indigo-500' : 'text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'training' ? 'bg-indigo-500/10' : ''}`}>
              <Brain size={22} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Training</span>
          </motion.button>
        </nav>

        {/* Technical Documentation Full View */}
        {showFullDocs && (
          <TechnicalDocumentation onClose={() => setShowFullDocs(false)} />
        )}

        {/* Purge Confirmation */}
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-[#0f172a] border border-red-500/20 w-full max-w-[340px] rounded-[2.5rem] p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Total Purge?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-8">This will permanently de-index all mission logs and presence records from local storage.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { onPurgeData(); setShowPurgeConfirm(false); }} className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30 active:scale-95">Confirm Termination</button>
                <button onClick={() => setShowPurgeConfirm(false)} className="w-full py-3 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Abort Mission</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SidebarLayout;
