
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Transaction, TransactionCategory } from '../types';
import { analyzeFinance, parseBankStatement, runFinancialModel } from '../services/geminiService';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ShieldCheck, 
  PieChart, 
  Calendar, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  CreditCard,
  DollarSign,
  BarChart3,
  Upload,
  FileText,
  Brain,
  ShieldAlert,
  History,
  Info,
  ChevronRight,
  Sparkles,
  Lock,
  Database
} from 'lucide-react';

import ModelResultRenderer from './ModelResultRenderer';

const MODELS = [
  { id: 'categorization', name: 'Expense Categorization', icon: PieChart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'recurring', name: 'Recurring Detection', icon: RefreshCw, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'cashflow', name: 'Cash Flow Prediction', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'risk', name: 'Risk & Anomaly', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'health', name: 'Financial Health', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'balance', name: 'Balance Prediction', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'behavior', name: 'Behavior Change', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'loan', name: 'Loan Risk', icon: CreditCard, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'savings', name: 'Savings Prediction', icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'investment', name: 'Investment Insights', icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'overrun', name: 'Budget Overrun', icon: AlertCircle, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'emergency', name: 'Emergency Readiness', icon: ShieldCheck, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { id: 'impulse', name: 'Impulse Detection', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'creep', name: 'Subscription Creep', icon: History, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { id: 'fraud', name: 'Fraud Detection', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-500/10' },
];

const FinanceIntelligenceView: React.FC = () => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('rpt_currency') || 'USD';
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('rpt_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showAddTx, setShowAddTx] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [modelResult, setModelResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for new transaction
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'debit',
    merchant: ''
  });

  useEffect(() => {
    localStorage.setItem('rpt_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('rpt_currency', currency);
  }, [currency]);

  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'JPY': return '¥';
      default: return '$';
    }
  }, [currency]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      let extracted: Transaction[] = [];
      const isText = file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.json');
      
      if (isText) {
        const text = await file.text();
        if (!text.trim()) {
          alert("The selected file is empty.");
          setParsing(false);
          return;
        }
        extracted = await parseBankStatement({ text });
      } else {
        // Handle PDF or Images
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:mime/type;base64,
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        extracted = await parseBankStatement({ base64, mimeType: file.type });
      }

      if (extracted.length === 0) {
        alert("No transactions could be extracted from this file. Please ensure it contains clear financial data.");
      } else {
        setTransactions(prev => [...extracted, ...prev]);
        alert(`Successfully extracted ${extracted.length} transactions.`);
      }
    } catch (error) {
      console.error("Failed to parse statement", error);
      alert("Failed to process the bank statement. Please check the file format and try again.");
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const runModel = async (modelId: string) => {
    if (transactions.length === 0) return;
    setLoading(true);
    setActiveModel(modelId);
    try {
      const model = MODELS.find(m => m.id === modelId);
      const result = await runFinancialModel(model?.name || modelId, transactions);
      setModelResult(result);
    } catch (error) {
      console.error("Model execution failed", error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = () => {
    if (!newTx.description || !newTx.amount) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      date: newTx.date!,
      description: newTx.description!,
      amount: Number(newTx.amount),
      type: newTx.type as 'credit' | 'debit',
      merchant: newTx.merchant
    };
    setTransactions([tx, ...transactions]);
    setNewTx({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'debit',
      merchant: ''
    });
    setShowAddTx(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      const amt = Number(tx.amount) || 0;
      return tx.type === 'credit' ? acc + amt : acc - amt;
    }, 0);
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Neural Finance Lab</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
              <Lock size={10} /> Local Encrypted Storage Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/50 transition-all"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv,.json,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 group relative"
          >
            {parsing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload Statement
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[7px] text-slate-400 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Supports PDF, Images, CSV, TXT
            </div>
          </button>
          <button 
            onClick={() => setShowAddTx(true)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Manual Entry
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] space-y-2">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Net Liquidity</p>
          <p className={`text-2xl font-black tracking-tight ${totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currencySymbol}{totalBalance.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase">
            <Activity size={10} /> Real-time Balance
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] space-y-2">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Data Points</p>
          <p className="text-2xl font-black text-blue-400 tracking-tight">{transactions.length}</p>
          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase">
            <Database size={10} /> Local Transactions
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] space-y-2">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Model Readiness</p>
          <p className="text-2xl font-black text-indigo-400 tracking-tight">{MODELS.length}</p>
          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase">
            <Brain size={10} /> Specialized Models
          </div>
        </div>
      </div>

      {/* Model Selection Grid */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Brain size={14} className="text-indigo-500" /> Intelligence Center
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => runModel(model.id)}
              disabled={loading || transactions.length === 0}
              className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all group ${
                activeModel === model.id 
                ? 'bg-slate-800 border-blue-500/50 shadow-lg' 
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-10 h-10 ${model.bg} ${model.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <model.icon size={20} />
              </div>
              <span className="text-[8px] font-black text-center uppercase tracking-tighter text-slate-400 leading-tight">
                {model.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Model Result Display */}
      {modelResult && activeModel && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900/60 border border-blue-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">
                    {MODELS.find(m => m.id === activeModel)?.name} Result
                  </h4>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Neural Computation Complete</p>
                </div>
              </div>
              <button 
                onClick={() => setModelResult(null)}
                className="p-2 text-slate-600 hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <ModelResultRenderer 
                result={modelResult} 
                modelId={activeModel} 
                currencySymbol={currencySymbol} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" /> Transaction Ledger
          </h3>
          {transactions.length > 0 && (
            <button 
              onClick={() => { if(confirm('Purge all transaction data?')) setTransactions([]); }}
              className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
            >
              Purge Ledger
            </button>
          )}
        </div>
        <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sortedTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-400">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white">{tx.description}</span>
                        {tx.merchant && <span className="text-[8px] text-slate-600 uppercase font-bold">{tx.merchant}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tx.category ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase rounded-full w-fit">
                            {tx.category}
                          </span>
                          {tx.confidence !== undefined && tx.confidence < 0.8 && (
                            <span className="text-[6px] text-amber-500 font-black uppercase tracking-tighter">Low Confidence</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[8px] text-slate-700 font-black uppercase">Unclassified</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right text-[11px] font-black ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No Transactions Recorded</p>
              <p className="text-[8px] text-slate-700 uppercase mt-2">Upload a statement to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[400px] rounded-[3rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Record Transaction</h3>
              <button onClick={() => setShowAddTx(false)} className="p-2 text-slate-600 hover:text-white transition-colors">
                <Trash2 size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    value={newTx.type}
                    onChange={e => setNewTx({...newTx, type: e.target.value as 'credit' | 'debit'})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="debit">Debit (Expense)</option>
                    <option value="credit">Credit (Income)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date"
                    value={newTx.date}
                    onChange={e => setNewTx({...newTx, date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Description</label>
                <input 
                  value={newTx.description}
                  onChange={e => setNewTx({...newTx, description: e.target.value})}
                  placeholder="e.g. Starbucks, Rent, Salary..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Amount ({currencySymbol})</label>
                  <input 
                    type="number"
                    value={newTx.amount}
                    onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Merchant (Opt)</label>
                  <input 
                    value={newTx.merchant}
                    onChange={e => setNewTx({...newTx, merchant: e.target.value})}
                    placeholder="Store name..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={addTransaction}
              disabled={!newTx.description || !newTx.amount}
              className="w-full py-4 bg-emerald-600 disabled:opacity-20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"
            >
              Commit to Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceIntelligenceView;
