
import React, { useMemo } from 'react';
import { PresenceRecord } from '../types';
import { Target, TrendingUp, Calendar, Zap, Flame, Info } from 'lucide-react';

interface AnalyticsViewProps {
  records: Record<string, PresenceRecord>;
  goal: number;
  score: number;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records, goal, score }) => {
  // Generate simulated weekly chart data based on real records
  const weeklyTrend = useMemo(() => {
    // Grouping records by week (simplified for Feb 2026)
    const weeks = [0, 0, 0, 0];
    Object.keys(records).forEach(date => {
      const day = parseInt(date.split('-')[2]);
      if (records[date].status === 'office') {
        const weekIdx = Math.min(3, Math.floor((day - 1) / 7));
        weeks[weekIdx]++;
      }
    });
    return weeks;
  }, [records]);

  const streak = useMemo(() => {
    let currentStreak = 0;
    for (let i = weeklyTrend.length - 1; i >= 0; i--) {
      if (weeklyTrend[i] >= goal) currentStreak++;
      else break;
    }
    return currentStreak;
  }, [weeklyTrend, goal]);

  const smartInsight = useMemo(() => {
    if (score >= 90) return "Optimal operational consistency achieved. Maintain trajectory.";
    if (score >= 70) return "Steady presence detected. Increasing office visits by 10% will hit peak target.";
    if (score > 0) return "Presence below objective. Aim for mid-week office sessions to boost score.";
    return "Neural patterns suggest remote dominance. Initialize office deployment sequence.";
  }, [score]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Performance Matrix</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Telemetry Analysis v1.5</p>
          </div>
        </div>
        
        <div className="group relative">
           {/* Streak Tooltip */}
           <div className="absolute -top-16 right-0 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100">
              <p className="text-white text-[10px] font-black uppercase mb-1 flex items-center gap-2"><Flame size={10} className="text-amber-500" /> Momentum</p>
              <p className="text-slate-400 text-[9px] leading-tight">Consecutive weeks where the office day count ({goal}) was met or exceeded.</p>
            </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 cursor-help">
            <Flame size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">{streak} Week Streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Attendance Trend Chart */}
        <div className="space-y-4">
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap size={14} className="text-blue-500" /> Attendance Trend
          </h3>
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 h-48 flex items-end justify-around gap-4">
            {weeklyTrend.map((count, i) => {
              const height = Math.min(100, (count / (goal || 1)) * 50);
              const isTargetMet = count >= goal;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                  {/* Bar Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {count} / {goal} DAYS
                  </div>
                  
                  <div className="w-full relative">
                     <div 
                      className={`w-full rounded-t-xl transition-all duration-1000 ease-out shadow-2xl ${isTargetMet ? 'bg-blue-500 shadow-blue-500/20' : 'bg-slate-700'}`} 
                      style={{ height: `${height}px` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-600 uppercase">W0{i+1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap Matrix */}
        <div className="space-y-4">
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar size={14} className="text-purple-500" /> Activity Matrix
          </h3>
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 h-48">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-02-${String(dayNum).padStart(2, '0')}`;
                const status = records[dateStr]?.status;
                let color = "bg-slate-800/40";
                if (status === 'office') color = "bg-blue-500";
                if (status === 'remote') color = "bg-purple-500/40";
                if (status === 'sick') color = "bg-rose-500/40";
                
                return (
                  <div className="relative group" key={i}>
                    <div 
                      className={`aspect-square rounded-md ${color} transition-all hover:scale-125 cursor-help border border-white/5 w-full`}
                    />
                    {/* Tile Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-90 group-hover:scale-100 whitespace-nowrap">
                       <p className="text-[8px] font-black text-slate-500 uppercase">Feb {dayNum}</p>
                       <p className={`text-[9px] font-bold uppercase ${status ? 'text-white' : 'text-slate-600'}`}>{status || 'NO RECORD'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6 flex items-start gap-6 relative group">
        {/* Insight Tooltip */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100">
          <p className="text-indigo-400 text-[10px] font-black uppercase flex items-center gap-2"><Info size={10} /> Pattern Recognition</p>
          <p className="text-slate-400 text-[9px]">Insight generated by analyzing the delta between goal compliance and historical presence logs.</p>
        </div>

        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-indigo-400">
          <Target size={28} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Core Insight</p>
          <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
            "{smartInsight}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
