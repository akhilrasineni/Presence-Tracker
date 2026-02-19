
import React, { useState, useEffect, useMemo } from 'react';
import SidebarLayout from './components/SidebarLayout';
import CalendarView from './components/CalendarView';
import RemindersView from './components/RemindersView';
import SummaryView from './components/SummaryView';
import AnalyticsView from './components/AnalyticsView';
import BreakReminder from './components/BreakReminder';
import MissionPlanner from './components/MissionPlanner';
import { PresenceRecord, Reminder, PageContent, AnalysisResult } from './types';
import { analyzePage } from './services/geminiService';
import { getActiveTabContent } from './services/tabService';
import { Loader2, LayoutDashboard, BrainCircuit, BarChart3, Info, Globe, Sparkles } from 'lucide-react';

declare const chrome: any;

const STORAGE_KEYS = {
  PRESENCE: 'rpt_presence',
  REMINDERS: 'rpt_reminders',
  GOAL: 'rpt_goal',
  ANALYSIS: 'rpt_analysis_cache'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'reminders'>('calendar');
  const [dashboardMode, setDashboardMode] = useState<'analysis' | 'analytics'>('analysis');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // App Data State
  const [records, setRecords] = useState<Record<string, PresenceRecord>>({});
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [goal, setGoal] = useState(3);

  // Browser Tab State
  const [currentPage, setCurrentPage] = useState<PageContent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Real-time date logic
  const now = new Date();
  const SIM_YEAR = now.getFullYear();
  const SIM_MONTH = now.getMonth();
  const SIM_TODAY_DAY = now.getDate();

  // Initialize Data
  useEffect(() => {
    const load = async () => {
      try {
        const p = localStorage.getItem(STORAGE_KEYS.PRESENCE);
        const r = localStorage.getItem(STORAGE_KEYS.REMINDERS);
        const g = localStorage.getItem(STORAGE_KEYS.GOAL);
        
        if (p) setRecords(JSON.parse(p));
        if (r) setReminders(JSON.parse(r));
        if (g) setGoal(parseInt(g || "3"));

        // Fetch active tab info
        const content = await getActiveTabContent();
        setCurrentPage(content);
        
        // Try to load cached analysis for this URL
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

  const handlePlansConfirmed = (dates: string[], notify: boolean) => {
    const nextRecords = { ...records };
    const newReminders = [...reminders];

    // 1. Clear ALL existing "planned" records in the upcoming week window
    const simToday = new Date(SIM_YEAR, SIM_MONTH, SIM_TODAY_DAY);
    const simNextWeek = new Date(SIM_YEAR, SIM_MONTH, SIM_TODAY_DAY + 7);
    
    Object.keys(nextRecords).forEach(dateStr => {
      const d = new Date(dateStr);
      if (nextRecords[dateStr].status === 'planned' && d >= simToday && d <= simNextWeek) {
        delete nextRecords[dateStr];
      }
    });

    // 2. Add only the newly selected dates
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

  if (isInitializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-10">
        <Loader2 className="animate-spin text-blue-500 mb-6" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Syncing Mission Logs...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden select-none">
      <SidebarLayout 
        activeTab={activeTab} 
        onTabChange={(t) => setActiveTab(t as any)}
        onPurgeData={() => { localStorage.clear(); window.location.reload(); }}
      >
        <div className="flex flex-col gap-6">
          {activeTab === 'calendar' && (
            <>
              {/* Top Header Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/10 rounded-xl text-blue-500">
                      <LayoutDashboard size={20} />
                    </div>
                    <h2 className="text-lg font-black text-white tracking-tight">Intelligence Hub</h2>
                  </div>
                  <CalendarView 
                    records={records} 
                    onUpdate={savePresence} 
                    goal={goal} 
                    setGoal={(v) => { setGoal(v); localStorage.setItem(STORAGE_KEYS.GOAL, v.toString()); }} 
                  />
                </div>

                <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-slate-800/60 self-start">
                  <button 
                    onClick={() => setDashboardMode('analysis')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'analysis' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <BrainCircuit size={14} /> Analysis
                  </button>
                  <button 
                    onClick={() => setDashboardMode('analytics')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'analytics' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <BarChart3 size={14} /> Analytics
                  </button>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="space-y-6">
                <MissionPlanner 
                  onPlanConfirmed={(dates, notify) => handlePlansConfirmed(Array.isArray(dates) ? dates : [dates], notify)} 
                  existingRecords={records} 
                  goal={goal}
                />

                <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[60px] -mr-24 -mt-24 pointer-events-none" />
                  
                  {dashboardMode === 'analysis' ? (
                    <SummaryView 
                      analysis={aiAnalysis} 
                      loading={isAiLoading} 
                      content={currentPage || { title: "Initializing...", url: "", body: "" }} 
                      onRefresh={handleAnalyze} 
                    />
                  ) : (
                    <AnalyticsView 
                      records={records} 
                      goal={goal}
                      score={analyticsData.score}
                    />
                  )}
                </div>
              </div>

              {/* Bottom Mini-Stats for Popup */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficiency</p>
                  <p className="text-sm font-black text-white">{analyticsData.efficiency}%</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</p>
                  <p className="text-sm font-black text-white">{analyticsData.score}%</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Tasks</p>
                  <p className="text-sm font-black text-white">{analyticsData.activeCount}</p>
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
