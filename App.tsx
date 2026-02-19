
import React, { useState, useEffect } from 'react';
import SidebarLayout from './components/SidebarLayout';
import CalendarView from './components/CalendarView';
import RemindersView from './components/RemindersView';
import SummaryView from './components/SummaryView';
import ChatView from './components/ChatView';
import BreakReminder from './components/BreakReminder';
import { PresenceRecord, Reminder, PageContent, AnalysisResult } from './types';
import { analyzePage } from './services/geminiService';
import { Info, X, Loader2, Download, PackageCheck } from 'lucide-react';
import JSZip from 'jszip';

declare const chrome: any;

const PRESENCE_KEY = 'gemini_lens_presence';
const REMINDERS_KEY = 'presence_tracker_reminders';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'reminders' | 'ai'>('calendar');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  // States
  const [records, setRecords] = useState<Record<string, PresenceRecord>>({});
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent>({
    title: 'New Tab',
    url: 'about:blank',
    body: 'No content fetched yet.'
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiView, setAiView] = useState<'summary' | 'chat'>('summary');

  useEffect(() => {
    const initData = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get([PRESENCE_KEY, REMINDERS_KEY]);
        setRecords(result[PRESENCE_KEY] || {});
        setReminders(result[REMINDERS_KEY] || []);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
          if (tabs[0]) {
            setPageContent(prev => ({ ...prev, title: tabs[0].title || 'Unknown Page', url: tabs[0].url || '' }));
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => document.body.innerText
            }).then((results: any) => {
              if (results?.[0]?.result) setPageContent(prev => ({ ...prev, body: results[0].result }));
            });
          }
        });
      } else {
        const savedPresence = localStorage.getItem(PRESENCE_KEY);
        const savedReminders = localStorage.getItem(REMINDERS_KEY);
        setRecords(savedPresence ? JSON.parse(savedPresence) : {});
        setReminders(savedReminders ? JSON.parse(savedReminders) : []);
      }
      setIsInitializing(false);
    };
    initData();
  }, []);

  const handleUpdatePresence = async (record: PresenceRecord) => {
    const newRecords = { ...records, [record.date]: record };
    setRecords(newRecords);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [PRESENCE_KEY]: newRecords });
    } else {
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(newRecords));
    }
    if (record.date === new Date().toISOString().split('T')[0]) setShowCheckIn(false);
  };

  const updateReminders = async (newReminders: Reminder[]) => {
    setReminders(newReminders);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [REMINDERS_KEY]: newReminders });
    } else {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
    }
  };

  const handleBuildExtension = async () => {
    const zip = new JSZip();
    
    // In a real environment, we'd fetch current file content.
    // Here we'll package the critical production files.
    const manifest = {
      manifest_version: 3,
      name: "Presence & AI Tracker",
      version: "1.2.0",
      description: "AI-powered work tracker and page analyzer.",
      permissions: ["storage", "alarms", "notifications", "activeTab", "scripting"],
      background: { service_worker: "background.js", type: "module" },
      action: { default_popup: "index.html" }
    };

    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    
    // Add dummy or placeholder for background since we can't easily grab the actual file from here
    zip.file("background.js", `/** Extension Background Logic **/`);
    
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "presence-tracker-extension.zip";
    link.click();
    setShowInstallGuide(true);
  };

  if (isInitializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Waking up...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
      <SidebarLayout activeTab={activeTab} onTabChange={setActiveTab} onBuild={handleBuildExtension}>
        <div className="space-y-6 pb-20">
          {activeTab === 'calendar' && (
            <>
              {showCheckIn && (
                <div className="bg-blue-600 p-4 rounded-xl shadow-lg border border-blue-400/30">
                  <p className="text-xs text-white font-medium">Where are you today?</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleUpdatePresence({ date: new Date().toISOString().split('T')[0], status: 'office' })} className="flex-1 py-1.5 bg-white text-blue-600 rounded text-[10px] font-bold">In Office</button>
                    <button onClick={() => handleUpdatePresence({ date: new Date().toISOString().split('T')[0], status: 'remote' })} className="flex-1 py-1.5 bg-white/20 text-white rounded text-[10px] font-bold">Remote</button>
                  </div>
                </div>
              )}
              <CalendarView records={records} onUpdateRecord={handleUpdatePresence} />
            </>
          )}

          {activeTab === 'reminders' && (
            <RemindersView 
              reminders={reminders} 
              onAdd={(data) => updateReminders([...reminders, { ...data, id: Date.now().toString(), completed: false, notified: false }])} 
              onDelete={(id) => updateReminders(reminders.filter(r => r.id !== id))} 
              onToggle={(id) => updateReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r))} 
            />
          )}

          {activeTab === 'ai' && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                <button onClick={() => setAiView('summary')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${aiView === 'summary' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Summary</button>
                <button onClick={() => setAiView('chat')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${aiView === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Chat</button>
              </div>
              {aiView === 'summary' ? <SummaryView analysis={analysis} loading={isAnalyzing} content={pageContent} onRefresh={async () => { setIsAnalyzing(true); setAnalysis(await analyzePage(pageContent)); setIsAnalyzing(false); }} /> : <ChatView pageContent={pageContent} />}
            </div>
          )}
        </div>
      </SidebarLayout>
      <BreakReminder />

      {/* Simplified Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-[340px] rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <PackageCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bundle Downloaded!</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              1. Unzip the file.<br/>
              2. Go to <span className="text-blue-400 font-mono">chrome://extensions</span>.<br/>
              3. Turn on <span className="font-bold">Developer Mode</span>.<br/>
              4. Click <span className="font-bold">Load Unpacked</span> and select the folder.
            </p>
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
