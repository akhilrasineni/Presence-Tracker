
import React from 'react';
import { 
  X, 
  Brain, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  PieChart, 
  RefreshCw, 
  AlertCircle, 
  Target, 
  BarChart3, 
  History, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  Lock,
  Cpu,
  Network,
  Database,
  Layers,
  CreditCard
} from 'lucide-react';

interface TechnicalDocumentationProps {
  onClose: () => void;
}

const TechnicalDocumentation: React.FC<TechnicalDocumentationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-500">
              <Cpu size={32} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Architecture v2.5</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              Neural Finance <br />
              <span className="text-slate-500">Intelligence Stack</span>
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white hover:bg-slate-800 transition-all flex items-center gap-3 group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Close Documentation</span>
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Core Engine Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Brain className="text-purple-500" /> Core Engine
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The entire intelligence layer is powered by the <strong>Gemini 3 Flash</strong> Large Language Model. Unlike traditional static algorithms, this system uses <strong>In-Context Learning (ICL)</strong> to adapt to your specific financial patterns without permanent weight updates, ensuring maximum privacy.
            </p>
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                <Lock size={14} /> Privacy Protocol
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Data is processed in-memory during the inference window. No transaction data is used for global model training. Your financial identity remains local.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] space-y-4">
              <Layers className="text-blue-500" size={24} />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Zero-Shot Reasoning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Models are initialized with complex financial ontologies, allowing them to categorize and analyze data accurately from the very first upload without needing a dedicated training phase.
              </p>
            </div>
            <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] space-y-4">
              <Network className="text-emerald-500" size={24} />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Temporal Context</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The system maintains a sliding window of historical transactions, enabling the detection of seasonality, drift, and long-term behavioral shifts.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Model Documentation */}
        <div className="space-y-8">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Multimodal Data Extraction</h2>
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-black text-white">Multimodal Document Processing</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The system utilizes <strong>Gemini 3 Flash Multimodal Vision</strong> to process heterogeneous document formats. 
              Whether you upload a structured CSV, a raw text file, a PDF bank statement, or even a high-resolution screenshot of a transaction ledger, 
              the model uses vision-language reasoning to identify tabular structures, OCR text, and normalize data into a unified schema.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black text-white uppercase mb-1">OCR Engine</p>
                <p className="text-[9px] text-slate-500">Neural-based optical character recognition for handwritten or scanned entries.</p>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black text-white uppercase mb-1">Structure Mapping</p>
                <p className="text-[9px] text-slate-500">Heuristic-free mapping of columns regardless of document orientation.</p>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black text-white uppercase mb-1">Normalization</p>
                <p className="text-[9px] text-slate-500">Standardizes dates, currencies, and merchant strings across all formats.</p>
              </div>
            </div>
          </div>

          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Specialized Model Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Expense Categorization */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <PieChart size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Expense Categorization</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Multi-class Semantic Classification.</p>
                <p><strong>Logic:</strong> Uses <strong>Natural Language Embeddings</strong> to map transaction descriptions to a standardized financial ontology. It handles ambiguous merchants (e.g., "AMZN MKTP" vs "AMZN PRIME") by analyzing amount patterns and historical context.</p>
                <p><strong>Training:</strong> Few-shot prompting with industry-standard merchant databases.</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 2. Recurring Expense Detection */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                  <RefreshCw size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Recurring Detection</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Time-Series Pattern Recognition.</p>
                <p><strong>Logic:</strong> Clusters transactions by description similarity and calculates the <strong>Standard Deviation of Intervals</strong>. It identifies subscriptions (Netflix), EMIs (Home Loan), and fixed inflows (Salary) by detecting rhythmic signatures in the ledger.</p>
                <p><strong>Training:</strong> Algorithmic pattern matching within the LLM context window.</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 3. Cash Flow Prediction */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Cash Flow Prediction</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Autoregressive Forecasting.</p>
                <p><strong>Logic:</strong> Combines detected recurring expenses with a <strong>Probabilistic Burn Rate</strong>. It accounts for "Salary Week" spending spikes and "End of Month" austerity patterns to project total liquidity for the next 30 days.</p>
                <p><strong>Training:</strong> Historical sequence analysis (In-Context).</p>
                <p className="text-[10px] text-indigo-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 4. Risk & Anomaly Detection */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-rose-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Risk & Anomaly</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Outlier Detection (Unsupervised).</p>
                <p><strong>Logic:</strong> Establishes a <strong>Behavioral Baseline</strong> for your spending. It flags transactions that deviate significantly in amount, merchant type, or frequency. High-risk scores are assigned to "New Merchant" spikes or "Double Billing" patterns.</p>
                <p><strong>Training:</strong> Statistical deviation reasoning within the LLM.</p>
                <p className="text-[10px] text-rose-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 5. Credit & Health Assessment */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Financial Health</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Multi-factor Scoring Regression.</p>
                <p><strong>Logic:</strong> Calculates a <strong>Resilience Index</strong> based on: 1. Income Consistency, 2. Debt-to-Income Ratio, 3. Savings Velocity, and 4. Fixed Cost Burden. It provides a qualitative readiness score (Poor to Strong).</p>
                <p><strong>Training:</strong> Expert-rule-based reasoning applied to local data.</p>
                <p className="text-[10px] text-amber-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 6. Spending Behavior Change */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                  <Activity size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Behavior Change</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Drift Analysis.</p>
                <p><strong>Logic:</strong> Compares the <strong>Centroid of Spending</strong> across different time epochs. It detects "Lifestyle Inflation" (gradual increase in discretionary spend) or "Austerity Shifts" (sudden drop in non-essential categories).</p>
                <p><strong>Training:</strong> Comparative historical analysis.</p>
                <p className="text-[10px] text-purple-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 7. Loan Repayment Risk */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-red-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Loan Repayment Risk</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Default Probability Modeling.</p>
                <p><strong>Logic:</strong> Analyzes the <strong>Liquidity Buffer</strong> specifically on dates preceding known EMI/Loan deductions. It flags risk if the "Minimum Balance" trend intersects with upcoming debt obligations.</p>
                <p><strong>Training:</strong> Risk-based reasoning on cash-flow sequences.</p>
                <p className="text-[10px] text-red-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 8. Savings Prediction */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Savings Prediction</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Optimization Modeling.</p>
                <p><strong>Logic:</strong> Calculates the <strong>Residual Income Potential</strong> by subtracting predicted essential costs from predicted income. It provides a realistic savings target based on your actual historical spending floor.</p>
                <p><strong>Training:</strong> Goal-oriented reasoning on budget data.</p>
                <p className="text-[10px] text-cyan-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 9. Investment Insights */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-orange-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Investment Insights</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Strategic Asset Reasoning.</p>
                <p><strong>Logic:</strong> Identifies "Investment Leakage" (idle cash that could be invested) and calculates <strong>Contribution Consistency</strong>. It predicts portfolio growth based on your historical investment frequency and amount trends.</p>
                <p><strong>Training:</strong> Financial strategy reasoning.</p>
                <p className="text-[10px] text-orange-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 10. Impulse Buying Detection */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-400">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Impulse Detection</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Behavioral Trigger Analysis.</p>
                <p><strong>Logic:</strong> Detects <strong>High-Velocity Discretionary Spend</strong>. It looks for clusters of non-essential purchases (Shopping, Dining) that occur shortly after salary credits or during late-night hours, identifying psychological spending triggers.</p>
                <p><strong>Training:</strong> Behavioral pattern recognition.</p>
                <p className="text-[10px] text-yellow-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 11. Subscription Creep */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-violet-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400">
                  <History size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Subscription Creep</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Recurring Load Monitoring.</p>
                <p><strong>Logic:</strong> Tracks the <strong>Cumulative Growth</strong> of small recurring payments. It alerts you when the "Death by a Thousand Cuts" threshold is reached—where total subscriptions consume more than 15% of net income.</p>
                <p><strong>Training:</strong> Aggregation and threshold reasoning.</p>
                <p className="text-[10px] text-violet-400 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

            {/* 12. Fraud Detection */}
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] space-y-6 hover:border-red-600/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Fraud Detection</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p><strong>Technique:</strong> Adversarial Pattern Matching.</p>
                <p><strong>Logic:</strong> Scans for <strong>Micro-Charge Probing</strong> (small $1 charges often used by hackers to test cards) and "Ghost Merchant" patterns. It cross-references transaction locations and times to detect physical impossibilities.</p>
                <p><strong>Training:</strong> Security-focused pattern reasoning.</p>
                <p className="text-[10px] text-red-600 font-bold uppercase">Chargeable: Gemini API Tokens</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-6 items-center">
          <div className="flex items-center gap-4 text-slate-500">
            <Database size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Local Data Vault: Encrypted</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Cpu size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Inference Engine: Gemini 3 Flash</span>
          </div>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            © 2026 RASINENI PT PRO • Neural Intelligence Division
          </p>
        </div>

      </div>
    </div>
  );
};

export default TechnicalDocumentation;
