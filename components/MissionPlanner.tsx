
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Bell, ShieldCheck, MapPin, ChevronRight, Check, ChevronUp, ChevronDown, Edit3, Target, Info, RefreshCw } from 'lucide-react';
import { PresenceRecord } from '../types';

interface MissionPlannerProps {
  onPlanConfirmed: (dates: string[], notify: boolean) => void;
  existingRecords: Record<string, PresenceRecord>;
  goal: number;
}

const WEEKDAYS = [
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
];

const MissionPlanner: React.FC<MissionPlannerProps> = ({ onPlanConfirmed, existingRecords, goal }) => {
  const [selectedDayIds, setSelectedDayIds] = useState<number[]>([]);
  const [wantsNotification, setWantsNotification] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Real-time date logic
  const now = new Date();
  const YEAR = now.getFullYear();
  const MONTH = now.getMonth();
  const SIM_TODAY_DAY = now.getDate();

  // Derive which days are currently "planned" in the upcoming week window
  const currentPlannedDayIds = useMemo(() => {
    const simToday = new Date(YEAR, MONTH, SIM_TODAY_DAY);
    const simNextWeek = new Date(YEAR, MONTH, SIM_TODAY_DAY + 7);
    
    return (Object.entries(existingRecords) as [string, PresenceRecord][])
      .filter(([dateStr, rec]) => {
        const d = new Date(dateStr);
        return rec.status === 'planned' && d >= simToday && d <= simNextWeek;
      })
      .map(([dateStr]) => new Date(dateStr).getDay());
  }, [existingRecords, YEAR, MONTH, SIM_TODAY_DAY]);

  // Sync internal selection with records
  useEffect(() => {
    setSelectedDayIds(currentPlannedDayIds);
  }, [currentPlannedDayIds]);

  const toggleDay = (id: number) => {
    if (selectedDayIds.includes(id)) {
      setSelectedDayIds(prev => prev.filter(d => d !== id));
    } else {
      if (selectedDayIds.length < goal) {
        setSelectedDayIds(prev => [...prev, id]);
      }
    }
  };

  const calculateNextDate = (dayId: number): string => {
    const simToday = new Date(YEAR, MONTH, SIM_TODAY_DAY);
    const currentDayId = simToday.getDay(); 
    
    let daysToAdd = dayId - currentDayId;
    if (daysToAdd <= 0) {
      daysToAdd += 7; 
    }
    
    const targetDate = new Date(YEAR, MONTH, SIM_TODAY_DAY + daysToAdd);
    // Boundary check for month end
    const lastDayOfMonth = new Date(YEAR, MONTH + 1, 0).getDate();
    if (targetDate.getDate() > lastDayOfMonth) {
      targetDate.setMonth(MONTH + 1);
      targetDate.setDate(targetDate.getDate() - lastDayOfMonth);
    }

    return targetDate.toISOString().split('T')[0];
  };

  const handleConfirm = () => {
    const targetDates = selectedDayIds.map(id => calculateNextDate(id));
    onPlanConfirmed(targetDates, wantsNotification);
    setIsConfirmed(true);
    
    setTimeout(() => {
      setIsConfirmed(false);
      setIsMinimized(true);
    }, 2000);
  };

  const slotsRemaining = goal - selectedDayIds.length;
  const hasChanges = JSON.stringify([...selectedDayIds].sort()) !== JSON.stringify([...currentPlannedDayIds].sort());

  return (
    <div className={`bg-slate-900/40 border border-slate-800 rounded-[2rem] relative overflow-hidden group transition-all duration-500 ${isMinimized ? 'p-4' : 'p-6'} hover:bg-slate-900/60 animate-in slide-in-from-top-4`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
      
      {/* HEADER: Always Visible and Clickable to Toggle */}
      <header 
        onClick={() => setIsMinimized(!isMinimized)}
        className="flex items-center justify-between cursor-pointer group/header"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 transition-transform group-hover/header:rotate-12">
            <RefreshCw size={18} className={hasChanges ? "animate-spin-slow" : ""} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Manual Toggle Strategy</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Cap: {goal} Days • {slotsRemaining} Available
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 min-w-[40px]">
          <div className="text-slate-600 group-hover/header:text-slate-300 transition-colors">
            {isMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
          <span className="text-[10px] font-black text-blue-500/80 tracking-tighter tabular-nums bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10">
            {selectedDayIds.length} / {goal}
          </span>
        </div>
      </header>

      {/* BODY: Controlled by minimized state */}
      {!isMinimized && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Progress Bar */}
          <div className="mb-6 space-y-1">
            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/30">
              <div 
                className="h-full bg-blue-600 transition-all duration-700" 
                style={{ width: `${(selectedDayIds.length / goal) * 100}%` }}
              />
            </div>
          </div>

          {/* Day Selector */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDayIds.includes(day.id);
              const isPreviouslyPlanned = currentPlannedDayIds.includes(day.id);
              const isModified = isSelected !== isPreviouslyPlanned;

              return (
                <button
                  key={day.id}
                  onClick={(e) => { e.stopPropagation(); toggleDay(day.id); }}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all relative group/btn ${
                    isSelected 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20 scale-105 z-10' 
                    : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'scale-110' : ''}`}>
                    {day.label}
                  </span>
                  
                  {isModified && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] border border-slate-950" />
                  )}
                  
                  {isSelected && (
                     <span className={`absolute -bottom-1 text-[6px] font-black px-1.5 py-0.5 rounded-full border bg-white text-blue-600 border-white`}>
                       {isModified ? 'DRAFT' : 'SYNCED'}
                     </span>
                  )}
                  
                  {!isSelected && isPreviouslyPlanned && (
                    <span className={`absolute -bottom-1 text-[6px] font-black px-1.5 py-0.5 rounded-full border bg-red-500/20 text-red-400 border-red-500/30`}>
                      CLEAR
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg transition-colors ${wantsNotification ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
                <Bell size={14} />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Web seat-booking alerts</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setWantsNotification(!wantsNotification); }}
              className={`w-10 h-5 rounded-full relative transition-all ${wantsNotification ? 'bg-blue-600' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${wantsNotification ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
            disabled={!hasChanges || isConfirmed}
            className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              isConfirmed 
              ? 'bg-emerald-600 text-white' 
              : hasChanges
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 active:scale-95' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isConfirmed ? (
              <> <Check size={16} strokeWidth={3} /> HUD Calibrated </>
            ) : (
              <> <MapPin size={14} /> {hasChanges ? 'Apply Manual Changes' : 'No Changes Detected'} <ChevronRight size={14} /> </>
            )}
          </button>

          {isConfirmed && (
            <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 text-center">
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest inline-flex items-center gap-2">
                <ShieldCheck size={12} /> Local Strategy Synchronized with HUD Terminal.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MissionPlanner;
