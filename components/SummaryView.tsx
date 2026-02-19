
import React from 'react';
import { AnalysisResult, PageContent } from '../types';
import { Clock, BarChart3, Tag, MessageCircle, Globe, Sparkles, Loader2, Info } from 'lucide-react';

interface SummaryViewProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  content: PageContent;
  onRefresh: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ analysis, loading, content, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 size={40} className="animate-spin text-blue-500 opacity-20" />
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Analyzing Active Tab...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8">
        <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mb-4 border border-blue-500/10">
          <Globe size={28} className="text-slate-700" />
        </div>
        <h3 className="text-slate-100 font-black text-sm mb-2">Target Acquired</h3>
        <p className="text-slate-500 text-[11px] mb-6 leading-relaxed px-4">Ready to extract intelligence from the active page.</p>
        <button 
          onClick={onRefresh}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl shadow-blue-600/20 text-[9px] font-black uppercase tracking-widest active:scale-95"
        >
          Initialize Neural Lens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Info */}
      <div className="flex items-start gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
          <Globe size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-white truncate pr-4">{content.title}</h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-0.5 truncate">{content.url}</p>
        </div>
        <button onClick={onRefresh} className="p-2 ml-auto text-slate-500 hover:text-blue-400 transition-colors">
          <Sparkles size={14} />
        </button>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Clock size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Time</span>
          </div>
          <p className="text-sm font-black text-white">{analysis.readingTime}</p>
        </div>
        <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <BarChart3 size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Sentiment</span>
          </div>
          <p className="text-sm font-black text-white">{analysis.sentiment}</p>
        </div>
      </div>

      {/* Summary Content */}
      <div className="space-y-3">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <MessageCircle size={12} /> Neural Summary
        </h3>
        <p className="text-[12px] text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
          {analysis.summary}
        </p>
      </div>

      {/* Key Vectors */}
      <div className="space-y-3">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strategic Vectors</h3>
        <div className="space-y-2">
          {analysis.keyPoints.slice(0, 3).map((point, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <span className="shrink-0 w-6 h-6 bg-slate-950 text-slate-500 text-[8px] flex items-center justify-center rounded-lg border border-slate-800 font-black">
                {i + 1}
              </span>
              <p className="text-[11px] font-medium text-slate-400">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
