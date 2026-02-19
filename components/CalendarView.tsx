
import React, { useState, useMemo } from 'react';
import { PresenceRecord, PresenceStatus } from '../types';
import { Settings2, X, MapPin, Calendar as CalendarIcon, Edit3, Flame, Target } from 'lucide-react';

interface CalendarViewProps {
  records: Record<string, PresenceRecord>;
  onUpdate: (rec: PresenceRecord) => void;
  goal: number;
  setGoal: (val: number) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CalendarView: React.FC<CalendarViewProps> = ({ records, onUpdate, goal, setGoal }) => {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);
  const [customReason, setCustomReason] = useState('');

  // Real-time date settings
  const now = new Date();
  const YEAR = now.getFullYear();
  const MONTH = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayRecord = (day: number): PresenceRecord | null => {
    const dateStr = `${YEAR}-${String(MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records[dateStr] || null;
  };

  const getDayStatus = (day: number): PresenceStatus | 'none' | 'weekend' => {
    const record = getDayRecord(day);
    if (record) return record.status;

    const dateObj = new Date(YEAR, MONTH, day);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend';
    if (day < today) return 'remote';

    return 'none';
  };

  const currentMonthCount = useMemo(() => {
    return days.filter(d => {
      const status = getDayStatus(d);
      return status === 'office' || status === 'planned';
    }).length;
  }, [records, days, goal]);

  const hasPlannedDays = useMemo(() => {
    return (Object.values(records) as PresenceRecord[]).some(r => r.status === 'planned');
  }, [records]);

  const handleStatusSelect = (status: PresenceStatus) => {
    if (selectedDay) {
      onUpdate({
        date: `${YEAR}-${String(MONTH + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
        status,
        reason: status === 'other' ? customReason : undefined
      });
      setSelectedDay(null);
      setCustomReason('');
    }
  };

  return (
    <>
      {/* COMPACT TRIGGER HUD */}
      <button 
        onClick={() => setShowFullCalendar(true)}
        className={`flex items-center gap-4 bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-2.5 pr-5 transition-all active:scale-95 group relative ${hasPlannedDays ? 'ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform ${hasPlannedDays ? 'bg-blue-500 shadow-blue-500/30 group-hover:rotate-6' : 'bg-slate-800 text-slate-400 group-hover:bg-blue-600/20'}`}>
          {hasPlannedDays ? <Target size={20} className="animate-pulse" /> : <MapPin size={20} />}
        </div>
        <div className="text-left">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Presence HUD</p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-white">{currentMonthCount}</span>
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-tighter">/ {goal} MISSION DAYS</span>
          </div>
        </div>
        {hasPlannedDays && (
           <div className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
           </div>
        )}
      </button>

      {/* FULL CALENDAR POPUP MODAL */}
      {showFullCalendar && (
        <div className="fixed inset-0 z-[400] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[420px] rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Office Presence</h3>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarIcon size={12} /> {MONTH_NAMES[MONTH]} {YEAR}
                  </p>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Flame size={12} /> Target: {goal}/wk
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingGoal(true)}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"
                >
                  <Settings2 size={18} />
                </button>
                <button 
                  onClick={() => setShowFullCalendar(false)} 
                  className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3 mb-8">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-[10px] font-black text-slate-600 text-center mb-1">{d}</div>
              ))}
              {days.map(day => {
                const status = getDayStatus(day);
                const record = getDayRecord(day);
                const isToday = day === today;
                
                let colorClass = "bg-transparent border-slate-800/40 text-slate-600";
                if (status === 'weekend') {
                  colorClass = "bg-slate-950/50 border-dashed border-slate-800/10 text-slate-700 cursor-not-allowed";
                } else if (status === 'office') {
                  colorClass = "bg-blue-600/30 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
                } else if (status === 'planned') {
                  colorClass = "bg-blue-900/10 border-dashed border-blue-500/50 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)]";
                } else if (status === 'remote') {
                  colorClass = "bg-purple-600/20 border-purple-500/30 text-purple-200/70";
                } else if (status === 'leave') {
                  colorClass = "bg-amber-600/30 border-amber-500 text-amber-100";
                } else if (status === 'sick') {
                  colorClass = "bg-rose-600/30 border-rose-500 text-rose-100";
                } else if (status === 'holiday') {
                  colorClass = "bg-cyan-600/30 border-cyan-500 text-cyan-100";
                } else if (status === 'other') {
                  colorClass = "bg-slate-700/50 border-slate-500 text-slate-200";
                }

                if (isToday) {
                  colorClass += " ring-2 ring-white/20 ring-offset-2 ring-offset-slate-950";
                }

                return (
                  <button 
                    key={day} 
                    disabled={status === 'weekend'}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-90 relative ${colorClass}`}
                  >
                    <span className={`text-[11px] font-bold ${status === 'other' || status === 'planned' ? 'mb-0.5' : ''}`}>{day}</span>
                    {(status === 'other' && record?.reason) && (
                       <span className="text-[5px] font-black uppercase text-center leading-[1] px-1 truncate w-full opacity-60">
                        {record.reason}
                       </span>
                    )}
                    {status === 'planned' && (
                       <span className="text-[5px] font-black uppercase text-center leading-[1] px-1 text-blue-400">
                        TARGETED
                       </span>
                    )}
                    {isToday && <span className="absolute -top-1.5 text-[6px] font-black text-white uppercase tracking-tighter bg-blue-600 px-1 rounded-full">TODAY</span>}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[8px] font-black uppercase tracking-widest text-slate-600 border-t border-slate-800/50 pt-6">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Office</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-dashed border-blue-500" /> Planned</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500/50" /> Remote</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Sick</div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS SELECTION MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-[500] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-[320px] rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{MONTH_NAMES[MONTH].slice(0,3)} {selectedDay} Presence</h3>
              <button onClick={() => { setSelectedDay(null); setCustomReason(''); }} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => handleStatusSelect('office')} className="py-4 bg-blue-600/20 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase text-blue-400 hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2">🏢 Office</button>
              <button onClick={() => handleStatusSelect('planned')} className="py-4 bg-blue-900/10 border border-blue-500/50 rounded-xl text-[9px] font-black uppercase text-blue-300 hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2">🎯 Planned</button>
              <button onClick={() => handleStatusSelect('remote')} className="py-4 bg-purple-600/20 border border-purple-500/20 rounded-xl text-[9px] font-black uppercase text-purple-400 hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2">🏠 Remote</button>
              <button onClick={() => handleStatusSelect('sick')} className="py-4 bg-rose-600/20 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase text-rose-400 hover:bg-rose-600/30 transition-all flex items-center justify-center gap-2">🤒 Sick</button>
              <button onClick={() => handleStatusSelect('holiday')} className="py-4 bg-cyan-600/20 border border-cyan-500/20 rounded-xl text-[9px] font-black uppercase text-cyan-400 hover:bg-cyan-600/30 transition-all flex items-center justify-center gap-2">🏖️ Holiday</button>
              <button onClick={() => handleStatusSelect('other')} className="py-4 bg-slate-600/20 border border-slate-500/20 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-slate-600/30 transition-all flex items-center justify-center gap-2">✨ Other</button>
            </div>

            <div className="space-y-2 border-t border-slate-700/50 pt-4">
              <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                <Edit3 size={10} /> Self Input (Optional)
              </div>
              <input 
                type="text"
                placeholder="E.g. Travel, Conference..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* GOAL EDITOR MODAL */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-[500] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-[320px] rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-8">Weekly Office Objective</h3>
            
            <div className="space-y-10 mb-10 px-2">
              <div className="flex flex-col items-center gap-4">
                <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
                  {tempGoal}
                </span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Days / Week
                </span>
              </div>
              
              <div className="relative h-2 bg-slate-900 rounded-full">
                <input 
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={tempGoal}
                  onChange={e => setTempGoal(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white/20 [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all pointer-events-none"
                  style={{ width: `${((tempGoal - 1) / 4) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setIsEditingGoal(false); setTempGoal(goal); }} 
                className="flex-1 py-4 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => { setGoal(tempGoal); setIsEditingGoal(false); }} 
                className="flex-[2] py-4 bg-blue-600 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
              >
                Calibrate Target
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarView;
