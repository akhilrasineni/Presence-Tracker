
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, Info } from 'lucide-react';

interface ModelResultRendererProps {
  result: {
    summary?: string;
    data?: Record<string, any>;
    chartData?: any[];
    recommendations?: string[];
  };
  modelId: string;
  currencySymbol: string;
}

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ModelResultRenderer: React.FC<ModelResultRendererProps> = ({ result, modelId, currencySymbol }) => {
  const { summary, data, chartData, recommendations } = result;

  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;

    // Determine chart type based on modelId or data structure
    if (modelId === 'forecast' || modelId === 'savings' || modelId === 'investments') {
      return (
        <div className="h-[250px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${currencySymbol}${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (modelId === 'categorization' || modelId === 'creep') {
      return (
        <div className="h-[250px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-[250px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {summary && (
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Info size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Executive Intelligence</span>
          </div>
          <div className="markdown-body text-[11px] text-slate-300 leading-relaxed">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {data && Object.keys(data).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 flex flex-col gap-1">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-[13px] font-black text-white">
                {typeof value === 'number' ? `${currencySymbol}${value.toLocaleString()}` : String(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart Visualization */}
      {renderChart()}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-3 pt-4">
          <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Lightbulb size={12} className="text-yellow-500" /> Strategic Recommendations
          </h5>
          <div className="grid grid-cols-1 gap-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelResultRenderer;
