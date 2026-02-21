
import React, { useState, useEffect, useMemo } from 'react';
import { AnalysisResult, PageContent, ExtractedTask, Reminder } from '../types';
import { Clock, BarChart3, MessageCircle, Globe, Sparkles, Loader2, ShieldAlert, CheckCircle, Info, AlertTriangle, Fingerprint, Target, Plus, Database, FileText, Layout } from 'lucide-react';

import NeuralLoader from './NeuralLoader';

interface SummaryViewProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  content: PageContent;
  onRefresh: () => void;
  onCommitTask: (task: Reminder) => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ analysis, loading, content, onRefresh, onCommitTask }) => {
  const [hasConsented, setHasConsented] = useState(false);
  const [committedIndices, setCommittedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    setHasConsented(false);
    setCommittedIndices(new Set());
  }, [content.url]);

  const localStats = useMemo(() => {
    const wordCount = content.body.split(/\s+/).length;
    const readingTimeMin = Math.ceil(wordCount / 200);
    return { wordCount, readingTimeMin };
  }, [content]);

  const handleConsentAndAnalyze = () => {
    setHasConsented(true);
    onRefresh();
  };

  const commitToMission = (task: ExtractedTask, index: number) => {
    if (committedIndices.has(index)) return;
    
    const reminder: Reminder = {
      id: `ai-extracted-${Date.now()}-${index}`,
      title: task.description,
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      notified: false
    };
    
    onCommitTask(reminder);
    setCommittedIndices(prev => new Set([...prev, index]));
  };

  if (loading) {
    return (
      <NeuralLoader 
        message="Transmitting to Neural Hub" 
        submessage="SECURE ENCRYPTED CHANNEL ACTIVE" 
      />
    );
  }

  if (!hasConsented) {
    return (
      <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Globe size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[11px] font-black text-white truncate uppercase tracking-tight">{content.title}</h2>
            <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest mt-0.5 truncate">{content.url}</p>
          </div>
        </div>

        {/* Local Metadata Dashboard (Zero AI required) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-500">
              <FileText size={10} />
              <span className="text-[7px] font-black uppercase tracking-widest">Local Density</span>
            </div>
            <p className="text-[14px] font-black text-white">{localStats.wordCount} <span className="text-[8px] text-slate-600">Words</span></p>
          </div>
          <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-500">
              <Clock size={10} />
              <span className="text-[7px] font-black uppercase tracking-widest">Est. Focus</span>
            </div>
            <p className="text-[14px] font-black text-white">{localStats.readingTimeMin} <span className="text-[8px] text-slate-600">Mins</span></p>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
          <ShieldAlert size={24} className="text-amber-500/40" />
          <div className="space-y-1">
            <h3 className="text-white font-black text-xs uppercase tracking-tight">Neural Activation Required</h3>
            <p className="text-slate-500 text-[10px] leading-relaxed max-w-[240px] font-medium">
              Deep page summarization requires external <span className="text-blue-400 font-bold">Gemini AI</span> processing. 
            </p>
          </div>
          <button 
            onClick={handleConsentAndAnalyze}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-xl shadow-blue-600/20 text-[9px] font-black uppercase tracking-[0.2em] active:scale-95 flex items-center justify-center gap-3"
          >
            <Fingerprint size={16} /> Deploy Neural Lens
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
          <Globe size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[11px] font-black text-white truncate uppercase tracking-tight">{content.title}</h2>
          <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest mt-0.5 truncate">{content.url}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/30 p-3 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <Clock size={10} />
            <span className="text-[7px] font-black uppercase tracking-widest">Time Vector</span>
          </div>
          <p className="text-[12px] font-black text-white">{analysis.readingTime}</p>
        </div>
        <div className="bg-slate-950/30 p-3 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-purple-500">
            <BarChart3 size={10} />
            <span className="text-[7px] font-black uppercase tracking-widest">Sentiment</span>
          </div>
          <p className="text-[12px] font-black text-white">{analysis.sentiment}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <MessageCircle size={12} /> Intelligence Abstract
        </h3>
        <p className="text-[11px] text-slate-300 leading-relaxed bg-white/[0.01] p-4 rounded-2xl border border-white/[0.05] italic font-medium">
          {analysis.summary}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
          <Target size={12} /> Neural Action Bridge
        </h3>
        <div className="space-y-2">
          {analysis.suggestedTasks?.length > 0 ? (
            analysis.suggestedTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[6px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-tighter ${
                      task.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                      task.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 leading-tight truncate">{task.description}</p>
                </div>
                <button 
                  onClick={() => commitToMission(task, i)}
                  disabled={committedIndices.has(i)}
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    committedIndices.has(i) 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  {committedIndices.has(i) ? <CheckCircle size={16} /> : <Plus size={16} />}
                </button>
              </div>
            ))
          ) : (
             <p className="text-[10px] text-slate-600 italic text-center py-2">No direct actions identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
