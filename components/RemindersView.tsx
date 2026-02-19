
import React, { useState } from 'react';
import { Reminder } from '../types';
import { Plus, Trash2, Clock, CheckCircle2, Circle, X, Info } from 'lucide-react';

interface RemindersViewProps {
  reminders: Reminder[];
  onUpdate: (items: Reminder[]) => void;
}

const RemindersView: React.FC<RemindersViewProps> = ({ reminders, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [inspectingReminder, setInspectingReminder] = useState<Reminder | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const add = () => {
    if (!title || !time) return;
    const next: Reminder = {
      id: Date.now().toString(),
      title,
      dateTime: new Date(time).toISOString(),
      completed: false,
      notified: false
    };
    onUpdate([next, ...reminders]);
    setTitle('');
    setTime('');
    setShowAdd(false);
  };

  const toggle = (id: string) => {
    const next = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    onUpdate(next);
    // Sync inspector if open
    if (inspectingReminder?.id === id) {
      setInspectingReminder(next.find(r => r.id === id) || null);
    }
  };

  const remove = (id: string) => {
    onUpdate(reminders.filter(r => r.id !== id));
    setInspectingReminder(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission Control</h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>

      {/* Grid of Cubes */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {reminders.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-50">Zero Pending</p>
          </div>
        ) : (
          reminders.map(r => (
            <button 
              key={r.id} 
              onClick={() => setInspectingReminder(r)}
              className={`group relative aspect-square rounded-[1.5rem] border transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3 ${
                r.completed 
                ? 'bg-slate-900/20 border-slate-800/40 opacity-50 grayscale' 
                : 'bg-blue-600/5 border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-600/10 active:scale-95'
              }`}
            >
              <div className={`transition-colors ${r.completed ? 'text-slate-700' : 'text-blue-500'}`}>
                {r.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </div>
              <div className="text-center w-full px-1">
                <p className={`text-[10px] font-bold truncate w-full ${r.completed ? 'text-slate-600' : 'text-slate-200'}`}>
                  {r.title}
                </p>
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-tighter mt-0.5">
                  {new Date(r.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* INSPECTOR MODAL */}
      {inspectingReminder && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[280px] rounded-[2.5rem] p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Info size={20} />
              </div>
              <button 
                onClick={() => setInspectingReminder(null)}
                className="p-2 text-slate-600 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className={`text-lg font-black leading-tight ${inspectingReminder.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                {inspectingReminder.title}
              </h4>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {new Date(inspectingReminder.dateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button 
                onClick={() => toggle(inspectingReminder.id)}
                className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  inspectingReminder.completed 
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500'
                }`}
              >
                {inspectingReminder.completed ? 'Restore Mission' : 'Mark as Done'}
              </button>
              
              <button 
                onClick={() => remove(inspectingReminder.id)}
                className="w-full py-3 text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[320px] rounded-[2.5rem] p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Mission</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-600 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Objective</label>
                <input 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Task name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 transition-colors"
                  autoFocus
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Deadline</label>
                <input 
                  type="datetime-local"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 [color-scheme:dark] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowAdd(false)}
                className="flex-1 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={add}
                disabled={!title || !time}
                className="flex-[2] py-4 bg-blue-600 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersView;
