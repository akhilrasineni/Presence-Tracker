
import React, { useState, useEffect } from 'react';
import SidebarLayout from './components/SidebarLayout';
import CalendarView from './components/CalendarView';
import RemindersView from './components/RemindersView';
import BreakReminder from './components/BreakReminder';
import { PresenceRecord, Reminder } from './types';
import { Info, Check, BellRing, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'reminders'>('calendar');
  
  // Presence Records State
  const [records, setRecords] = useState<Record<string, PresenceRecord>>(() => {
    const saved = localStorage.getItem('gemini_lens_presence');
    return saved ? JSON.parse(saved) : {};
  });

  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('presence_tracker_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dateObj = new Date();
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    
    if (!records[today] && !isWeekend) {
      const timer = setTimeout(() => setShowCheckIn(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [records]);

  // Global Reminder Check Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const due = reminders.find(r => 
        !r.completed && 
        !r.notified && 
        new Date(r.dateTime).getTime() <= now
      );

      if (due) {
        setActiveNotification(due);
        // Mark as notified so we don't spam
        const updated = reminders.map(r => r.id === due.id ? { ...r, notified: true } : r);
        updateReminders(updated);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders]);

  const handleUpdatePresence = (record: PresenceRecord) => {
    const newRecords = { ...records, [record.date]: record };
    setRecords(newRecords);
    localStorage.setItem('gemini_lens_presence', JSON.stringify(newRecords));
    if (record.date === new Date().toISOString().split('T')[0]) setShowCheckIn(false);
  };

  const updateReminders = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    localStorage.setItem('presence_tracker_reminders', JSON.stringify(newReminders));
  };

  const handleAddReminder = (data: Omit<Reminder, 'id' | 'completed' | 'notified'>) => {
    const newReminder: Reminder = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
      notified: false
    };
    updateReminders([...reminders, newReminder]);
  };

  const handleToggleReminder = (id: string) => {
    updateReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const handleDeleteReminder = (id: string) => {
    updateReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
      <div className="w-full max-w-[420px] h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 relative bg-slate-950">
        <SidebarLayout activeTab={activeTab} onTabChange={setActiveTab}>
          <div className="space-y-6">
            {showCheckIn && (
              <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/20 animate-in slide-in-from-top-4 border border-blue-400/30">
                <div className="flex gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg"><Info size={16} className="text-white" /></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white uppercase">Check-in</p>
                    <p className="text-xs text-blue-100">Where are you working today?</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleUpdatePresence({ date: new Date().toISOString().split('T')[0], status: 'office' })} className="flex-1 py-2 bg-white text-blue-600 rounded-lg text-[10px] font-bold">In Office</button>
                  <button onClick={() => handleUpdatePresence({ date: new Date().toISOString().split('T')[0], status: 'remote' })} className="flex-1 py-2 bg-white/20 text-white rounded-lg text-[10px] font-bold">Remote</button>
                  <button onClick={() => setShowCheckIn(false)} className="p-2 text-white/50"><Check size={18} /></button>
                </div>
              </div>
            )}

            {activeTab === 'calendar' ? (
              <CalendarView records={records} onUpdateRecord={handleUpdatePresence} />
            ) : (
              <RemindersView 
                reminders={reminders} 
                onAdd={handleAddReminder} 
                onDelete={handleDeleteReminder} 
                onToggle={handleToggleReminder} 
              />
            )}

            <div className="pt-6 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Presence Tracker v1.1</p>
            </div>
          </div>
        </SidebarLayout>

        {/* Reminder Notification Toast */}
        {activeNotification && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[340px] z-[110] animate-in slide-in-from-bottom-8">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-2xl border border-indigo-400/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg animate-bounce">
                  <BellRing size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-indigo-100 uppercase tracking-widest">Reminder Due!</h4>
                  <p className="text-sm text-white font-bold truncate">{activeNotification.title}</p>
                </div>
                <button onClick={() => setActiveNotification(null)} className="text-white/60 hover:text-white"><X size={18} /></button>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => { handleToggleReminder(activeNotification.id); setActiveNotification(null); }}
                  className="flex-1 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-bold"
                >
                  Mark as Done
                </button>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="px-4 py-2 bg-indigo-700 text-indigo-100 rounded-xl text-[10px] font-bold border border-indigo-500/30"
                >
                  Snooze
                </button>
              </div>
            </div>
          </div>
        )}

        <BreakReminder />
      </div>
    </div>
  );
};

export default App;
