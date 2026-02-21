
import React, { useState, useMemo, useEffect } from 'react';
import { Reminder } from '../types';
import { Plus, Trash2, Clock, CheckCircle2, Circle, X, Info, Filter, Zap, Target, BellRing } from 'lucide-react';

import { motion } from 'motion/react';

interface RemindersViewProps {
  reminders: Reminder[];
  onUpdate: (items: Reminder[]) => void;
}

const RemindersView: React.FC<RemindersViewProps> = ({ reminders, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [inspectingReminder, setInspectingReminder] = useState<Reminder | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'tactical' | 'system'>('all');
  
  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') return;

    const checkReminders = () => {
      const now = Date.now();
      const nextReminders = [...reminders];
      let updated = false;

      nextReminders.forEach((r, idx) => {
        const reminderTime = new Date(r.dateTime).getTime();
        // Notify if due within the last minute and not notified yet
        if (!r.completed && !r.notified && reminderTime <= now && reminderTime > now - 60000) {
          // Always trigger in-app alert
          setActiveAlert(r.title);
          
          // Try browser notification if granted
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Task Due', {
              body: r.title,
            });
          }
          
          nextReminders[idx] = { ...r, notified: true };
          updated = true;
        }
      });

      if (updated) {
        onUpdate(nextReminders);
      }
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [reminders, onUpdate]);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('Notifications are not supported in this browser.');
      return;
    }
    
    try {
      // Support both promise and callback based requestPermission
      const permission = await new Promise<NotificationPermission>((resolve) => {
        const result = Notification.requestPermission((p) => resolve(p));
        if (result) {
          result.then(resolve);
        }
      });
      
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        new Notification('Neural Finance Lab', {
          body: 'Task notifications are now active.',
        });
      } else if (permission === 'denied') {
        alert('Notification permission was denied. Please enable it in your browser settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Failed to request notification permission. This might be blocked by your browser or iframe settings.');
    }
  };

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      if (filterType === 'all') return true;
      if (filterType === 'system') return r.type === 'system';
      return r.type !== 'system';
    });
  }, [reminders, filterType]);

  const add = () => {
    if (!title || !time) return;
    const next: Reminder = {
      id: Date.now().toString(),
      title,
      dateTime: new Date(time).toISOString(),
      completed: false,
      notified: false,
      type: 'standard'
    };
    onUpdate([next, ...reminders]);
    setTitle('');
    setTime('');
    setShowAdd(false);
  };

  const toggle = (id: string) => {
    const next = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    onUpdate(next);
    if (inspectingReminder?.id === id) {
      setInspectingReminder(next.find(r => r.id === id) || null);
    }
  };

  const remove = (id: string) => {
    onUpdate(reminders.filter(r => r.id !== id));
    setInspectingReminder(null);
  };

  const getPressureStatus = (dateTime: string) => {
    const diff = new Date(dateTime).getTime() - Date.now();
    if (diff < 0) return 'expired';
    if (diff < 4 * 60 * 60 * 1000) return 'critical';
    return 'normal';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      {/* In-App Alert Fallback */}
      {activeAlert && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4"
        >
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-red-500/50 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap size={20} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Task Alert</p>
                <p className="text-sm font-black uppercase tracking-tight">{activeAlert}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveAlert(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Task Reminders</h3>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{filteredReminders.filter(r => !r.completed).length} Objectives in View</p>
        </div>
        <div className="flex items-center gap-3">
          {notificationPermission !== 'granted' && typeof Notification !== 'undefined' && (
            <button 
              onClick={requestPermission}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-blue-400 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <BellRing size={12} /> Enable Notifications
            </button>
          )}
          <button 
            onClick={() => setShowAdd(true)}
            className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 active:scale-90 transition-all flex items-center justify-center"
          >
            <Plus size={22} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Local Filter Bar */}
      <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-slate-800 self-start">
        <button 
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilterType('tactical')}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'tactical' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
        >
          Tactical
        </button>
        <button 
          onClick={() => setFilterType('system')}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'system' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
        >
          System
        </button>
      </div>

      {/* Grid of Cubes */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
        {filteredReminders.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-900 rounded-[2.5rem]">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-50">Zero Targets Found</p>
          </div>
        ) : (
          filteredReminders.map((r, idx) => {
            const pressure = getPressureStatus(r.dateTime);
            const isAlertActive = (pressure === 'critical' || pressure === 'expired') && !r.completed;

            return (
              <motion.button 
                key={r.id} 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setInspectingReminder(r)}
                className={`group relative aspect-square rounded-[1.8rem] border transition-all duration-500 flex flex-col items-center justify-center gap-2 p-4 ${
                  r.completed 
                  ? 'bg-slate-900/40 border-slate-800 opacity-60 grayscale' 
                  : isAlertActive
                  ? 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] active:scale-95'
                  : 'bg-blue-600/5 border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-600/10 active:scale-95 shadow-lg hover:shadow-blue-500/5'
                }`}
              >
                {isAlertActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
                
                <div className={`transition-all duration-500 ${r.completed ? 'text-slate-400' : isAlertActive ? 'text-red-500' : 'text-blue-500 group-hover:scale-110'}`}>
                  {r.completed ? <CheckCircle2 size={24} /> : isAlertActive ? <Zap size={24} /> : <Circle size={24} />}
                </div>
                <div className="text-center w-full px-1 overflow-hidden">
                  <p className={`text-[9px] md:text-[10px] font-black truncate w-full uppercase tracking-tight ${r.completed ? 'text-slate-400' : 'text-slate-100'}`}>
                    {r.title}
                  </p>
                  <p className={`text-[7px] font-black uppercase tracking-tighter mt-1 ${r.completed ? 'text-slate-600' : isAlertActive ? 'text-red-400' : 'text-slate-500'}`}>
                    {pressure === 'expired' ? 'OVERDUE' : new Date(r.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.button>
            )
          })
        )}
      </div>

      {/* INSPECTOR MODAL */}
      {inspectingReminder && (
        <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[300px] rounded-[3rem] p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${inspectingReminder.type === 'system' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-500'}`}>
                {inspectingReminder.type === 'system' ? <Target size={24} /> : <Info size={24} />}
              </div>
              <button onClick={() => setInspectingReminder(null)} className="p-3 text-slate-600 hover:text-white transition-colors bg-slate-900/50 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-1">
                {inspectingReminder.type === 'system' ? 'System Mission' : 'Tactical Objective'}
              </span>
              <h4 className={`text-xl font-black leading-tight uppercase tracking-tight ${inspectingReminder.completed ? 'text-slate-600 line-through' : 'text-white'}`}>
                {inspectingReminder.title}
              </h4>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} className="text-blue-500/50" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {new Date(inspectingReminder.dateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button 
                onClick={() => toggle(inspectingReminder.id)}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  inspectingReminder.completed 
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95'
                }`}
              >
                {inspectingReminder.completed ? 'Re-Initialize Mission' : 'Signal Completion'}
              </button>
              
              <button 
                onClick={() => remove(inspectingReminder.id)}
                className="w-full py-3 text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Terminate Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-[340px] rounded-[3rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Deploy New Signal</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 text-slate-600 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Mission Objective</label>
                <input 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Identify target task..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Temporal Deadline</label>
                <input 
                  type="datetime-local"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 [color-scheme:dark] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={add}
                disabled={!title || !time}
                className="w-full py-4 bg-blue-600 disabled:opacity-20 disabled:grayscale text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
              >
                Execute Deployment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersView;
