
import React from 'react';
import { AnalysisResult, PageContent } from '../types';
import { Clock, BarChart3, Tag, MessageCircle, ExternalLink, Sparkles, Loader2, Globe } from 'lucide-react';

interface SummaryViewProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  content: PageContent;
  onRefresh: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ analysis, loading, content, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-400 text-sm animate-pulse">Analyzing page structure...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center p-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
        <Sparkles size={32} className="mx-auto text-slate-600 mb-4" />
        <h3 className="text-slate-200 font-medium mb-2">No Content Analyzed</h3>
        <p className="text-slate-500 text-sm mb-6">Click the button below to analyze this simulated browser tab.</p>
        <button 
          onClick={onRefresh}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
        >
          Analyze Current Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page Info */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          <Globe size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-slate-100 truncate">{content.title}</h2>
          <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
            <span className="truncate max-w-[150px]">{content.url}</span>
            <ExternalLink size={12} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col items-center text-center">
          <Clock size={16} className="text-emerald-400 mb-1" />
          <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Read Time</span>
          <span className="text-xs font-semibold text-slate-200">{analysis.readingTime}</span>
        </div>
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col items-center text-center">
          <BarChart3 size={16} className="text-purple-400 mb-1" />
          <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Sentiment</span>
          <span className="text-xs font-semibold text-slate-200">{analysis.sentiment}</span>
        </div>
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col items-center text-center">
          <Tag size={16} className="text-amber-400 mb-1" />
          <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Complexity</span>
          <span className="text-xs font-semibold text-slate-200">Medium</span>
        </div>
      </div>

      {/* Summary Content */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <MessageCircle size={14} /> TL;DR
        </h3>
        <p className="text-slate-300 leading-relaxed text-sm bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
          {analysis.summary}
        </p>
      </section>

      {/* Key Points */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key Takeaways</h3>
        <ul className="space-y-3">
          {analysis.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-3 items-start group">
              <span className="flex-shrink-0 w-5 h-5 bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center rounded-full border border-slate-700 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {i + 1}
              </span>
              <p className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors leading-snug">
                {point}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Topics */}
      <section className="flex flex-wrap gap-2 pt-4">
        {analysis.topics.map((topic, i) => (
          <span key={i} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-400 hover:border-blue-500/30 hover:text-blue-400 cursor-default transition-all">
            #{topic}
          </span>
        ))}
      </section>

      <button 
        onClick={onRefresh}
        className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all border border-slate-700 flex items-center justify-center gap-2"
      >
        <Sparkles size={16} /> Re-analyze content
      </button>
    </div>
  );
};

export default SummaryView;
