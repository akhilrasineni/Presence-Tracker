
import React, { useMemo } from 'react';
import { PresenceRecord, Reminder } from '../types';
import { Target, TrendingUp, Calendar, Zap, Flame, Info, Award, BarChart, Clock, History, CheckCircle2 } from 'lucide-react';

interface AnalyticsViewProps {
  records: Record<string, PresenceRecord>;
  reminders: Reminder[];
  goal: number;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records, reminders, goal }) => {
  const weeklyTrend = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    Object.keys(records).forEach(date => {
      const day = parseInt(date.split('-')[2]);
      if (records[date].status === 'office' || records[date].status === 'planned') {
        const weekIdx = Math.min(3, Math.floor((day - 1) / 7));
        weeks[weekIdx]++;
      }
    });
    return weeks;
  }, [records]);

  const stats = useMemo(() => {
    const completed = reminders.filter(r => r.completed);
    const totalReminders = reminders.length;
    const efficiency = totalReminders === 0 ? 0 : Math.round((completed.length / totalReminders) * 100);
    
    // Find most active office day
    const dayCounts: Record<number, number> = {};
    Object.keys(records).forEach(dateStr => {
      if (records[dateStr].status === 'office') {
        const d = new Date(dateStr).getDay();
        dayCounts[d] = (dayCounts[d] || 0) + 1;
      }
    });
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let mostActiveDay = 'N/A';
    let maxCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = dayNames[parseInt(day)];
      }
    });

    return { efficiency, totalReminders, completedCount: completed.length, mostActiveDay };
  }, [reminders, records]);

  const tacticalReport = useMemo(() => {
    const avgAttendance = weeklyTrend.reduce((a, b) => a + b, 0) / (weeklyTrend.length || 1);
    const complianceRate = avgAttendance / (goal || 1);
    
    let grade = 'D';
    let label = 'Low Compliance';
    let color = 'text-slate-500';
    let insight = "Operational presence is currently sub-optimal. Schedule more mid-week office sessions.";

    if (complianceRate >= 1.0) {
      grade = 'S';
      label = 'Peak Efficiency';
      color = 'text-emerald-400';
      insight = "Maximum compliance reached. Your office presence matches strategic objectives.";
    } else if (complianceRate >= 0.8) {
      grade = 'A';
      label = 'High Consistency';
      color = 'text-blue-400';
      insight = "Steady performance. You are consistently hitting your mission goals.";
    } else if (complianceRate >= 0.5) {
      grade = 'B';
      label = 'Stable Utility';
      color = 'text-indigo-400';
      insight = "Moderate presence detected. Aim for a streak to reach the next tier.";
    }
    return { grade, label, color, insight };
  }, [weeklyTrend, goal]);

  const recentHistory = useMemo(() => {
    return reminders
      .filter(r => r.completed)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .slice(0, 5);
  }, [reminders]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <BarChart size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Strategy HUD</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Local Telemetry Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] text-center space-y-2">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tactical Grade</p>
          <p className={`text-5xl font-black ${tacticalReport.color} tracking-tighter`}>{tacticalReport.grade}</p>
          <p className="text-[10px] font-black text-white uppercase">{tacticalReport.label}</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Mission Velocity</p>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white">{stats.efficiency}%</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Efficiency</p>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.efficiency}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Peak Deployment</p>
            <Calendar size={14} className="text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white">{stats.mostActiveDay}</p>
          </div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Busiest Office Day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock size={14} className="text-blue-500" /> Attendance Flux
          </h3>
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 h-40 flex items-end justify-around gap-4">
            {weeklyTrend.map((count, i) => {
              const height = Math.max(10, Math.min(100, (count / (goal || 1)) * 70));
              const isTargetMet = count >= goal;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div 
                    className={`w-full rounded-t-xl transition-all duration-1000 ${isTargetMet ? 'bg-blue-600' : 'bg-slate-800'}`} 
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] font-black text-slate-600 uppercase">W{i+1}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <History size={14} className="text-indigo-500" /> Mission Log
          </h3>
          <div className="space-y-2">
            {recentHistory.length > 0 ? (
              recentHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-800/50">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <p className="text-[10px] font-medium text-slate-300 truncate flex-1">{h.title}</p>
                  <span className="text-[8px] font-black text-slate-600">{new Date(h.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No Recent Activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
