
import React, { useState, useEffect } from 'react';
import { CustomModel, LearnedPattern, Transaction } from '../types';
import { runCustomModel } from '../services/geminiService';
import { 
  Brain, 
  Plus, 
  Trash2, 
  Play, 
  Edit3, 
  Save, 
  X, 
  ChevronRight, 
  Sparkles, 
  Database, 
  History,
  Target,
  Zap,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NeuralLoader from './NeuralLoader';
import ModelResultRenderer from './ModelResultRenderer';

const NeuralTrainingChamber: React.FC = () => {
  const [models, setModels] = useState<CustomModel[]>(() => {
    const saved = localStorage.getItem('rpt_custom_models');
    return saved ? JSON.parse(saved) : [];
  });
  const [transactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('rpt_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPatternForm, setShowPatternForm] = useState(false);
  
  // New Model Form
  const [newName, setNewName] = useState('');
  const [newObjective, setNewObjective] = useState('');
  
  // New Pattern Form
  const [patternInput, setPatternInput] = useState('');
  const [patternOutput, setPatternOutput] = useState('');

  useEffect(() => {
    localStorage.setItem('rpt_custom_models', JSON.stringify(models));
  }, [models]);

  const activeModel = models.find(m => m.id === activeModelId);

  const createModel = () => {
    if (!newName || !newObjective) return;
    const model: CustomModel = {
      id: `model-${Date.now()}`,
      name: newName,
      objective: newObjective,
      createdAt: Date.now(),
      patterns: []
    };
    setModels([model, ...models]);
    setNewName('');
    setNewObjective('');
    setIsCreating(false);
    setActiveModelId(model.id);
  };

  const deleteModel = (id: string) => {
    setModels(models.filter(m => m.id !== id));
    if (activeModelId === id) setActiveModelId(null);
  };

  const addPattern = () => {
    if (!activeModelId || !patternInput || !patternOutput) return;
    const pattern: LearnedPattern = {
      id: `pattern-${Date.now()}`,
      input: patternInput,
      output: patternOutput,
      timestamp: Date.now()
    };
    
    setModels(models.map(m => 
      m.id === activeModelId 
        ? { ...m, patterns: [pattern, ...m.patterns] } 
        : m
    ));
    
    setPatternInput('');
    setPatternOutput('');
    setShowPatternForm(false);
  };

  const deletePattern = (patternId: string) => {
    if (!activeModelId) return;
    setModels(models.map(m => 
      m.id === activeModelId 
        ? { ...m, patterns: m.patterns.filter(p => p.id !== patternId) } 
        : m
    ));
  };

  const executeModel = async () => {
    if (!activeModel || transactions.length === 0) return;
    setLoading(true);
    try {
      const result = await runCustomModel(
        activeModel.name,
        activeModel.objective,
        activeModel.patterns.map(p => ({ input: p.input, output: p.output })),
        transactions
      );
      
      setModels(models.map(m => 
        m.id === activeModelId 
          ? { ...m, lastResult: result } 
          : m
      ));
    } catch (error) {
      console.error("Execution failed", error);
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = localStorage.getItem('rpt_currency') === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Neural Training Chamber</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
              <Zap size={10} className="text-amber-500" /> Create & Evolve Custom Intelligence
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} /> New Neural Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Model List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Active Agents</h3>
          <div className="space-y-2">
            {models.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-900 rounded-[2rem] text-center">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-50">No Agents Initialized</p>
              </div>
            ) : (
              models.map(model => (
                <button
                  key={model.id}
                  onClick={() => setActiveModelId(model.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                    activeModelId === model.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <Target size={16} className={activeModelId === model.id ? 'text-white' : 'text-indigo-500'} />
                      <span className="text-[11px] font-black uppercase tracking-tight">{model.name}</span>
                    </div>
                    <ChevronRight size={14} className={activeModelId === model.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
                  </div>
                  {activeModelId === model.id && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content: Model Workspace */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeModel ? (
              <motion.div 
                key={activeModel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Agent Workspace Header */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{activeModel.name}</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Mission Objective</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteModel(activeModel.id)}
                        className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{activeModel.objective}"</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={executeModel}
                      disabled={loading || transactions.length === 0}
                      className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Play size={16} fill="currentColor" /> Deploy Agent
                    </button>
                  </div>
                </div>

                {/* Training Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <History size={14} className="text-amber-500" /> Learned Patterns ({activeModel.patterns.length})
                    </h3>
                    <button 
                      onClick={() => setShowPatternForm(true)}
                      className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Pattern
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {activeModel.patterns.length === 0 ? (
                      <div className="p-12 border-2 border-dashed border-slate-900 rounded-[2rem] text-center bg-slate-950/20">
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2">Neural Buffers Empty</p>
                        <p className="text-slate-700 text-[9px] font-medium max-w-[200px] mx-auto">Add "Learned Patterns" to teach this agent how to reason about your data.</p>
                      </div>
                    ) : (
                      activeModel.patterns.map(pattern => (
                        <div key={pattern.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4 group">
                          <div className="space-y-3 flex-1">
                            <div className="space-y-1">
                              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Input Signal</span>
                              <p className="text-[11px] text-slate-300 font-medium">{pattern.input}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block">Desired Output</span>
                              <p className="text-[11px] text-emerald-400 font-bold">{pattern.output}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => deletePattern(pattern.id)}
                            className="p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Execution Results */}
                {loading && (
                  <div className="py-12 bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] backdrop-blur-sm">
                    <NeuralLoader 
                      message={`Evolving ${activeModel.name}`} 
                      submessage="Applying Learned Patterns to Transaction Stream"
                    />
                  </div>
                )}

                {activeModel.lastResult && !loading && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-slate-900/60 border border-indigo-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-tight">Intelligence Output</h4>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Custom Model Inference Complete</p>
                          </div>
                        </div>
                      </div>

                      <ModelResultRenderer 
                        result={activeModel.lastResult} 
                        modelId="custom" 
                        currencySymbol={currencySymbol} 
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/20 border-2 border-dashed border-slate-900 rounded-[3rem]">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700">
                  <Brain size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-500 uppercase tracking-tighter">Select an Agent</h3>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest max-w-[240px]">Initialize a neural agent to begin custom training and analysis.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CREATE MODEL MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[400px] rounded-[3rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Initialize Neural Agent</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 text-slate-600 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Agent Designation</label>
                <input 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="E.g. Tax Optimizer, Carbon Tracker..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Mission Objective</label>
                <textarea 
                  value={newObjective}
                  onChange={e => setNewObjective(e.target.value)}
                  placeholder="Describe exactly what this model should focus on..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800 resize-none"
                />
              </div>
            </div>

            <button 
              onClick={createModel}
              disabled={!newName || !newObjective}
              className="w-full py-5 bg-blue-600 disabled:opacity-20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <CheckCircle2 size={18} /> Deploy to Chamber
            </button>
          </div>
        </div>
      )}

      {/* ADD PATTERN MODAL */}
      {showPatternForm && (
        <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[400px] rounded-[3rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Teach Pattern</h3>
              <button onClick={() => setShowPatternForm(false)} className="p-2 text-slate-600 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Input Signal (The Trigger)</label>
                <input 
                  value={patternInput}
                  onChange={e => setPatternInput(e.target.value)}
                  placeholder="E.g. Transaction from 'Amazon' over $100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Desired Output (The Reasoning)</label>
                <textarea 
                  value={patternOutput}
                  onChange={e => setPatternOutput(e.target.value)}
                  placeholder="E.g. Categorize as 'Impulse' and flag for budget review."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800 resize-none"
                />
              </div>
            </div>

            <button 
              onClick={addPattern}
              disabled={!patternInput || !patternOutput}
              className="w-full py-5 bg-emerald-600 disabled:opacity-20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Save size={18} /> Commit to Neural Memory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralTrainingChamber;
