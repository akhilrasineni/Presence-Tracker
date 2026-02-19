
import React, { useState, useEffect } from 'react';
import SidebarLayout from './components/SidebarLayout';
import CalendarView from './components/CalendarView';
import BreakReminder from './components/BreakReminder';
import { PresenceRecord } from './types';
import { Info, Check } from 'lucide-react';

const App: React.FC = () => {
  // Presence Records State
  const [records, setRecords] = useState<Record<string, PresenceRecord>>(() => {
    const saved = localStorage.getItem('gemini_lens_presence');
    return saved ? JSON.parse(saved) : {};
  });

  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    // Check if today is marked
    const today = new Date().toISOString().split('T')[0];
    const dateObj = new Date();
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Only show check-in on weekdays if not already marked
    if (!records[today] && !isWeekend) {
      const timer = setTimeout(() => setShowCheckIn(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [records]);

  const handleUpdatePresence = (record: PresenceRecord) => {
    const newRecords = { ...records, [record.date]: record };
    setRecords(newRecords);
    localStorage.setItem('gemini_lens_presence', JSON.stringify(newRecords));
    
    // Auto-dismiss check-in if today was updated
    const todayStr = new Date().toISOString().split('T')[0];
    if (record.date === todayStr) {
      setShowCheckIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
      <div className="w-full max-w-[420px] h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 relative">
        <SidebarLayout>
          <div className="space-y-6">
            {/* Daily Check-in Banner */}
            {showCheckIn && (
              <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/20 animate-in slide-in-from-top-4 duration-500 border border-blue-400/30">
                <div className="flex gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Info size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Morning Check-in</p>
                    <p className="text-xs text-blue-100 mt-0.5">Where are you working from today?</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleUpdatePresence({ date: new Date().toISOString().split('T')[0], status: 'office' })}
                    className="flex-1 py-2 bg-white text-blue-600 rounded-lg text-[10px] font-bold transition-all hover:bg-blue-50 shadow-sm"
                  >
                    In Office
                  </button>
                  <button 
                    onClick={() => handleUpdatePresence({ date: new Date().toISOString().split('T')[0], status: 'remote' })}
                    className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold transition-all border border-white/20"
                  >
                    Remote
                  </button>
                  <button 
                    onClick={() => setShowCheckIn(false)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Main Calendar Interface */}
            <CalendarView records={records} onUpdateRecord={handleUpdatePresence} />

            {/* Support/Footer info */}
            <div className="pt-6 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">
                Data stored locally on this device
              </p>
            </div>
          </div>
        </SidebarLayout>

        {/* Break Reminder Overlay */}
        <BreakReminder />
      </div>
    </div>
  );
};

export default App;
