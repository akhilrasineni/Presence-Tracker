
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Bell, ShieldCheck, MapPin, ChevronRight, Check, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { PresenceRecord } from '../types';

interface MissionPlannerProps {
  onPlanConfirmed: (dates: string[], notify: boolean) => void;
  existingRecords: Record<string, PresenceRecord>;
  goal: number;
}

const WEEKDAYS = [
  { id: 1, label: 'MON' },
  { id: 2, label: 'TUE' },
  { id: 3, label: 'WED' },
  { id: 4, label: 'THU' },
  { id: 5, label: 'FRI' },
];

const MissionPlanner: React.FC<MissionPlannerProps> = ({ onPlanConfirmed, existingRecords, goal }) => {
  const [selectedDayIds, setSelectedDayIds] = useState<number[]>([]);
  const [wantsNotification, setWantsNotification] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const now = new Date();
  const YEAR = now.getFullYear();
  const MONTH = now.getMonth();
  const SIM_TODAY_DAY = now.getDate();

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
    if (daysToAdd <= 0) daysToAdd += 7; 
    
    const targetDate = new Date(YEAR, MONTH, SIM_TODAY_DAY + daysToAdd);
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

  const hasChanges = JSON.stringify([...selectedDayIds].sort()) !== JSON.stringify([...currentPlannedDayIds].sort());

  return (
    <div className={`bg-slate-900/30 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 ${isMinimized ? 'p-5' : 'p-6 md:p-8'} hover:bg-slate-900/50 animate-in slide-in-from-top-4`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] -mr-24 -mt-24 pointer-events-none" />
      
      <header 
        onClick={() => setIsMinimized(!isMinimized)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 transition-transform group-hover:scale-105">
            <RefreshCw size={22} className={hasChanges ? "animate-spin-slow" : ""} />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tight">Manual Strategy Calibration</h3>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Loadout: {selectedDayIds.length} / {goal} Days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden sm:flex h-1.5 w-16 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
            <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${(selectedDayIds.length / goal) * 100}%` }} />
          </div>
          <div className="text-slate-700 hover:text-slate-300 transition-colors">
            {isMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </div>
      </header>

      {!isMinimized && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-400">
          {/* Day Selector - Responsive Flow */}
          <div className="grid grid-cols-5 gap-2 md:gap-3 mb-8">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDayIds.includes(day.id);
              const isPreviouslyPlanned = currentPlannedDayIds.includes(day.id);
              const isModified = isSelected !== isPreviouslyPlanned;

              return (
                <button
                  key={day.id}
                  onClick={(e) => { e.stopPropagation(); toggleDay(day.id); }}
                  className={`flex flex-col items-center justify-center py-5 md:py-6 rounded-2xl border transition-all relative group/btn ${
                    isSelected 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20 scale-[1.02] z-10' 
                    : 'bg-slate-950 border-slate-800/80 text-slate-600 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-tighter ${isSelected ? 'scale-110' : ''}`}>
                    {day.label}
                  </span>
                  
                  {isModified && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  )}
                  
                  {isSelected && (
                     <span className="absolute -bottom-1.5 text-[6px] font-black px-2 py-0.5 rounded-full bg-white text-blue-600 uppercase tracking-tighter shadow-md">
                       {isModified ? 'DRAFT' : 'SYNCED'}
                     </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${wantsNotification ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-900 text-slate-700'}`}>
                <Bell size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Temporal Alerts</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase">Seat-booking reminders</span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setWantsNotification(!wantsNotification); }}
              className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${wantsNotification ? 'bg-blue-600' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${wantsNotification ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
            disabled={!hasChanges || isConfirmed}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
              isConfirmed 
              ? 'bg-emerald-600 text-white' 
              : hasChanges
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-[0.98]' 
              : 'bg-slate-800 text-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            {isConfirmed ? (
              <> <Check size={18} strokeWidth={3} /> Strategy Calibrated </>
            ) : (
              <> <MapPin size={16} /> {hasChanges ? 'Apply Strategic Changes' : 'Telemetry Synced'} <ChevronRight size={16} /> </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MissionPlanner;
