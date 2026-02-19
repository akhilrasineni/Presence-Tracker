
import React, { useState } from 'react';
import { Reminder } from '../types';
import { Plus, Bell, Trash2, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface RemindersViewProps {
  reminders: Reminder[];
  onAdd: (reminder: Omit<Reminder, 'id' | 'completed' | 'notified'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const RemindersView: React.FC<RemindersViewProps> = ({ reminders, onAdd, onDelete, onToggle }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;
    onAdd({ title, dateTime: new Date(`${date}T${time}`).toISOString() });
    setTitle('');
    setDate('');
    setTime('');
    setShowAdd(false);
  };

  const sortedReminders = [...reminders].sort((a, b) => 
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  const upcoming = sortedReminders.filter(r => !r.completed);
  const completed = sortedReminders.filter(r => r.completed);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Bell size={20} className="text-indigo-400" /> Reminders
        </h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          {showAdd ? <Clock size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-indigo-500/20 p-4 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">What should I remind you about?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Submit monthly report"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Create Reminder
          </button>
        </form>
      )}

      <div className="space-y-4">
        {upcoming.length > 0 ? (
          upcoming.map(reminder => (
            <div key={reminder.id} className="group relative bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition-all">
              <button 
                onClick={() => onToggle(reminder.id)}
                className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center hover:border-indigo-500 transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
              
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-200">{reminder.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                    <Calendar size={10} /> {new Date(reminder.dateTime).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase tracking-tight">
                    <Clock size={10} /> {new Date(reminder.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => onDelete(reminder.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : !showAdd && (
          <div className="text-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <AlertCircle size={32} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">No active reminders.<br/>Enjoy the peace!</p>
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2">Recently Completed</h3>
            {completed.map(reminder => (
              <div key={reminder.id} className="bg-slate-900/20 border border-slate-800/50 p-3 rounded-xl flex items-center gap-4 opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500">
                  <CheckCircle size={14} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-slate-400 line-through">{reminder.title}</h4>
                </div>
                <button onClick={() => onDelete(reminder.id)} className="p-2 text-slate-700 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersView;
