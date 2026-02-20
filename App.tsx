
import React, { useState, useEffect, useMemo } from 'react';
import SidebarLayout from './components/SidebarLayout';
import CalendarView from './components/CalendarView';
import RemindersView from './components/RemindersView';
import SummaryView from './components/SummaryView';
import AnalyticsView from './components/AnalyticsView';
import BreakReminder from './components/BreakReminder';
import MissionPlanner from './components/MissionPlanner';
import ChatView from './components/ChatView';
import { PresenceRecord, Reminder, PageContent, AnalysisResult } from './types';
import { analyzePage } from './services/geminiService';
import { getActiveTabContent } from './services/tabService';
import { Loader2, LayoutDashboard, BrainCircuit, BarChart3, MessageSquare } from 'lucide-react';

const STORAGE_KEYS = {
  PRESENCE: 'rpt_presence',
  REMINDERS: 'rpt_reminders',
  GOAL: 'rpt_goal',
  ANALYSIS: 'rpt_analysis_cache'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'reminders'>('calendar');
  const [dashboardMode, setDashboardMode] = useState<'analysis' | 'analytics' | 'chat'>('analysis');
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [records, setRecords] = useState<Record<string, PresenceRecord>>({});
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [goal, setGoal] = useState(3);

  const [currentPage, setCurrentPage] = useState<PageContent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const now = new Date();
  const SIM_YEAR = now.getFullYear();
  const SIM_MONTH = now.getMonth();
  const SIM_TODAY_DAY = now.getDate();

  useEffect(() => {
    const load = async () => {
      try {
        const p = localStorage.getItem(STORAGE_KEYS.PRESENCE);
        const r = localStorage.getItem(STORAGE_KEYS.REMINDERS);
        const g = localStorage.getItem(STORAGE_KEYS.GOAL);
        
        if (p) setRecords(JSON.parse(p));
        if (r) setReminders(JSON.parse(r));
        if (g) setGoal(parseInt(g || "3"));

        const content = await getActiveTabContent();
        setCurrentPage(content);
        
        const cached = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.url === content.url) {
            setAiAnalysis(parsed.data);
          }
        }
      } catch (err) {
        console.error("Storage Error:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    load();
  }, []);

  const savePresence = (rec: PresenceRecord) => {
    const next = { ...records, [rec.date]: rec };
    setRecords(next);
    localStorage.setItem(STORAGE_KEYS.PRESENCE, JSON.stringify(next));
  };

  const handleCommitTask = (task: Reminder) => {
    const next = [task, ...reminders];
    setReminders(next);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(next));
  };

  const handlePlansConfirmed = (dates: string[], notify: boolean) => {
    const nextRecords = { ...records };
    const newReminders = [...reminders];

    const simToday = new Date(SIM_YEAR, SIM_MONTH, SIM_TODAY_DAY);
    const simNextWeek = new Date(SIM_YEAR, SIM_MONTH, SIM_TODAY_DAY + 7);
    
    Object.keys(nextRecords).forEach(dateStr => {
      const d = new Date(dateStr);
      if (nextRecords[dateStr].status === 'planned' && d >= simToday && d <= simNextWeek) {
        delete nextRecords[dateStr];
      }
    });

    dates.forEach(date => {
      nextRecords[date] = { date, status: 'planned' };
      if (notify) {
        const bookingReminder: Reminder = {
          id: `booking-${date}-${Date.now()}`,
          title: `Seat reservation for ${new Date(date).toLocaleDateString()}`,
          dateTime: new Date(date).toISOString(),
          completed: false,
          notified: false,
          type: 'system'
        };
        newReminders.unshift(bookingReminder);
      }
    });

    setRecords(nextRecords);
    setReminders(newReminders);
    localStorage.setItem(STORAGE_KEYS.PRESENCE, JSON.stringify(nextRecords));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(newReminders));
  };

  const handleAnalyze = async () => {
    if (!currentPage) return;
    setIsAiLoading(true);
    try {
      const result = await analyzePage(currentPage);
      setAiAnalysis(result);
      localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify({
        url: currentPage.url,
        data: result
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const analyticsData = useMemo(() => {
    const total = reminders.length;
    const done = reminders.filter(r => r.completed).length;
    const efficiency = total === 0 ? 100 : Math.round((done / total) * 100);
    const officeDays = (Object.values(records) as PresenceRecord[]).filter(r => r.status === 'office' || r.status === 'planned').length;
    const score = Math.min(100, Math.round((officeDays / (goal * 4 || 1)) * 100));

    return { efficiency, activeCount: total - done, score };
  }, [reminders, records, goal]);

  const purgeAllData = () => {
    localStorage.clear();
    setRecords({});
    setReminders([]);
    setGoal(3);
    setAiAnalysis(null);
    window.location.reload(); // Refresh as requested to show as new
  };

  if (isInitializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-10 h-full">
        <Loader2 className="animate-spin text-blue-500 mb-6" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Initializing Hub Telemetry...</p>
      </div>
    );
  }

  const isDataEmpty = Object.keys(records).length === 0 && reminders.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden select-none min-h-[100dvh]">
      <SidebarLayout 
        activeTab={activeTab} 
        onTabChange={(t) => setActiveTab(t as any)}
        onPurgeData={purgeAllData}
      >
        <div className="flex flex-col gap-6 md:gap-10 pb-8">
          {activeTab === 'calendar' && (
            <>
              {/* Header Context */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 shadow-inner">
                      <LayoutDashboard size={24} />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-black text-white tracking-tight uppercase">Strategy Hub</h2>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Local Presence & Missions</p>
                    </div>
                  </div>
                  <CalendarView 
                    records={records} 
                    onUpdate={savePresence} 
                    goal={goal} 
                    setGoal={(v) => { setGoal(v); localStorage.setItem(STORAGE_KEYS.GOAL, v.toString()); }} 
                  />
                </div>

                <div className="flex flex-wrap bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/80 self-start gap-1">
                  <button 
                    onClick={() => setDashboardMode('analysis')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'analysis' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    <BrainCircuit size={16} /> Neural Lens
                  </button>
                  <button 
                    onClick={() => setDashboardMode('chat')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'chat' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    <MessageSquare size={16} /> Chat
                  </button>
                  <button 
                    onClick={() => setDashboardMode('analytics')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'analytics' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    <BarChart3 size={16} /> Performance
                  </button>
                </div>
              </div>

              {/* Main Adaptive Cards */}
              <div className="space-y-6 md:space-y-10">
                {isDataEmpty && (
                  <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] text-center space-y-3 animate-in fade-in duration-700">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Awaiting Strategic Data</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-[280px] mx-auto uppercase font-bold tracking-tight">
                      Mark your office presence or deploy new mission objectives to begin telemetry tracking.
                    </p>
                  </div>
                )}

                {dashboardMode !== 'chat' && (
                  <MissionPlanner 
                    onPlanConfirmed={(dates, notify) => handlePlansConfirmed(Array.isArray(dates) ? dates : [dates], notify)} 
                    existingRecords={records} 
                    goal={goal}
                  />
                )}

                <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                  
                  {dashboardMode === 'analysis' ? (
                    <SummaryView 
                      analysis={aiAnalysis} 
                      loading={isAiLoading} 
                      content={currentPage || { title: "Initializing...", url: "", body: "" }} 
                      onRefresh={handleAnalyze}
                      onCommitTask={handleCommitTask}
                    />
                  ) : dashboardMode === 'chat' ? (
                    <ChatView pageContent={currentPage || { title: "Initializing...", url: "", body: "" }} />
                  ) : (
                    <AnalyticsView 
                      records={records} 
                      reminders={reminders}
                      goal={goal}
                    />
                  )}
                </div>
              </div>

              {/* Status HUD Mini */}
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 md:p-6 text-center group hover:border-blue-500/30 transition-all">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-blue-500">Efficiency</p>
                  <p className="text-base md:text-xl font-black text-white">{analyticsData.efficiency}%</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 md:p-6 text-center group hover:border-indigo-500/30 transition-all">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-indigo-500">Score</p>
                  <p className="text-base md:text-xl font-black text-white">{analyticsData.score}%</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 md:p-6 text-center group hover:border-emerald-500/30 transition-all">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-emerald-500">Active</p>
                  <p className="text-base md:text-xl font-black text-white">{analyticsData.activeCount}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reminders' && (
            <RemindersView 
              reminders={reminders} 
              onUpdate={(items) => { setReminders(items); localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(items)); }} 
            />
          )}
        </div>
      </SidebarLayout>
      <BreakReminder />
    </div>
  );
};

export default App;
