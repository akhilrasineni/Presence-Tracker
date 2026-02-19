
import React, { useState, useMemo } from 'react';
import { PresenceRecord, PresenceStatus } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Home, 
  CalendarOff, 
  Plane,
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Download,
  Target,
  Settings2
} from 'lucide-react';

interface CalendarViewProps {
  records: Record<string, PresenceRecord>;
  onUpdateRecord: (record: PresenceRecord) => void;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarView: React.FC<CalendarViewProps> = ({ records, onUpdateRecord }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<PresenceStatus>('office');
  const [leaveReason, setLeaveReason] = useState('');
  const [officeGoal, setOfficeGoal] = useState(3);
  const [showGoalSettings, setShowGoalSettings] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const formatDateKey = (day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const getStatus = (day: number): PresenceStatus => {
    const key = formatDateKey(day);
    if (records[key]) return records[key].status;
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'remote';
  };

  const handleDayClick = (day: number) => {
    const key = formatDateKey(day);
    const current = records[key] || { date: key, status: getStatus(day) };
    setSelectedDate(key);
    setEditingStatus(current.status);
    setLeaveReason(current.reason || '');
  };

  const saveRecord = () => {
    if (selectedDate) {
      onUpdateRecord({
        date: selectedDate,
        status: editingStatus,
        reason: editingStatus === 'leave' ? leaveReason : undefined
      });
      setSelectedDate(null);
    }
  };

  // Weekly Goal Logic
  const weeklyOfficeCount = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    let count = 0;
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = d.toISOString().split('T')[0];
      if (records[key]?.status === 'office') count++;
    }
    return count;
  }, [records]);

  // CSV Export Utility
  const exportToCSV = () => {
    const headers = ['Date', 'Status', 'Reason'];
    const rows = Object.values(records)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(r => [r.date, r.status, r.reason || 'N/A']);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `presence_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusIcon = (status: PresenceStatus) => {
    switch (status) {
      case 'office': return <MapPin size={10} className="text-blue-400" />;
      case 'remote': return <Home size={10} className="text-purple-400" />;
      case 'leave': return <Plane size={10} className="text-amber-400" />;
      case 'holiday': return <CalendarOff size={10} className="text-emerald-400" />;
      case 'weekend': return null;
      default: return null;
    }
  };

  const getStatusStyles = (status: PresenceStatus) => {
    switch (status) {
      case 'office': return 'bg-blue-500/20 border-blue-500/40 text-blue-100 shadow-[0_0_8px_rgba(59,130,246,0.2)]';
      case 'remote': return 'bg-purple-500/20 border-purple-500/40 text-purple-100';
      case 'leave': return 'bg-amber-500/20 border-amber-500/40 text-amber-100 animate-pulse';
      case 'holiday': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100';
      case 'weekend': return 'bg-slate-800/30 border-slate-700/50 text-slate-500 opacity-60';
      default: return 'bg-slate-900 border-slate-800 text-slate-400';
    }
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthStats = daysArray.reduce((acc, day) => {
    const status = getStatus(day);
    if (status !== 'weekend') {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, { office: 0, remote: 0, leave: 0, holiday: 0 } as Record<PresenceStatus, number>);

  const totalTracked = monthStats.office + monthStats.remote + monthStats.leave + monthStats.holiday || 1;

  return (
    <div className="space-y-6">
      {/* Header & Goal Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-400" /> Presence Tracker
          </h2>
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                <Target size={16} />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weekly Office Goal</h4>
                <p className="text-lg font-bold text-white leading-tight">
                  {weeklyOfficeCount} <span className="text-slate-500 text-sm font-medium">/ {officeGoal} days</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowGoalSettings(!showGoalSettings)}
              className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
            >
              <Settings2 size={16} />
            </button>
          </div>
          
          {showGoalSettings ? (
            <div className="mb-2 animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Set Target:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(g => (
                    <button 
                      key={g} 
                      onClick={() => { setOfficeGoal(g); setShowGoalSettings(false); }}
                      className={`w-7 h-7 rounded-md text-[10px] font-bold transition-all ${officeGoal === g ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-700 ease-out ${weeklyOfficeCount >= officeGoal ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`} 
                style={{ width: `${Math.min((weeklyOfficeCount / officeGoal) * 100, 100)}%` }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
        <div className="text-center mb-4 text-sm font-semibold text-slate-300">
          {MONTHS[month]} {year}
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-600 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getStatus(day);
            const isTodayDate = isToday(day);
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`h-11 rounded-lg border flex flex-col items-center justify-center relative transition-all hover:scale-105 active:scale-95 ${getStatusStyles(status)} ${isTodayDate ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950' : ''}`}
              >
                <span className="text-xs font-medium">{day}</span>
                <div className="absolute bottom-1">
                  {renderStatusIcon(status)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]" /> Office</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> Remote</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Leave</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Holiday</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-700" /> Off</div>
      </div>

      {/* Stats Summary */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Breakdown</span>
          <div className="flex flex-wrap justify-end gap-3 text-[10px] font-mono">
             <div className="flex flex-col items-end">
               <span className="text-blue-400">{monthStats.office}</span>
               <span className="text-slate-600 uppercase">Office</span>
             </div>
             <div className="flex flex-col items-end border-l border-slate-800 pl-3">
               <span className="text-purple-400">{monthStats.remote}</span>
               <span className="text-slate-600 uppercase">Remote</span>
             </div>
             <div className="flex flex-col items-end border-l border-slate-800 pl-3">
               <span className="text-amber-400">{monthStats.leave}</span>
               <span className="text-slate-600 uppercase">Leave</span>
             </div>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${(monthStats.office / totalTracked) * 100}%` }} title="Office" />
            <div className="h-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${(monthStats.remote / totalTracked) * 100}%` }} title="Remote" />
            <div className="h-full bg-amber-500 transition-all duration-500 ease-out" style={{ width: `${(monthStats.leave / totalTracked) * 100}%` }} title="Leave" />
            <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${(monthStats.holiday / totalTracked) * 100}%` }} title="Holiday" />
          </div>
          <div className="flex justify-between items-center mt-2">
             <span className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Efficiency Trend</span>
             <button 
               onClick={exportToCSV}
               className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-all border border-slate-700"
             >
               <Download size={12} /> Export CSV
             </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-[320px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-100">Manage Presence</h3>
              <button onClick={() => setSelectedDate(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="text-sm text-slate-400">
                Update status for <span className="text-blue-400 font-semibold">{selectedDate}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'office', label: 'In Office', icon: MapPin, color: 'text-blue-400' },
                  { id: 'remote', label: 'Remote', icon: Home, color: 'text-purple-400' },
                  { id: 'leave', label: 'Mark Leave', icon: Plane, color: 'text-amber-400' },
                  { id: 'holiday', label: 'Public Holiday', icon: CalendarOff, color: 'text-emerald-400' }
                ].map((stat) => (
                  <button
                    key={stat.id}
                    onClick={() => setEditingStatus(stat.id as PresenceStatus)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${editingStatus === stat.id ? 'bg-blue-600/10 border-blue-500 text-blue-100' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                  >
                    <stat.icon size={20} className={stat.color} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{stat.label}</span>
                  </button>
                ))}
              </div>

              {editingStatus === 'leave' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason for Leave</label>
                  <select 
                    value={leaveReason} 
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Personal">Personal Reasons</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Vacation">Annual Vacation</option>
                    <option value="Doctor">Doctor Appointment</option>
                    <option value="Family">Family Commitment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <button
                onClick={saveRecord}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
