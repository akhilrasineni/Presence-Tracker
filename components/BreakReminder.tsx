
import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, GlassWater, Accessibility, X, Ghost, Zap } from 'lucide-react';

const BREAK_MESSAGES = [
  { text: "Human.exe has stopped responding. Please stand up and perform a wiggle dance to restart.", icon: Ghost },
  { text: "Legend says if you sit here for another hour, you'll become part of the ergonomic mesh. Run!", icon: Accessibility },
  { text: "Your eyes are filing for a divorce. Go look at a real tree (or a wall) for 5 minutes.", icon: Zap },
  { text: "Hydrate or Diedrate! (Just kidding, but seriously, your kidneys are parched).", icon: GlassWater },
  { text: "The coffee machine is whispering your name. Go check if it's talking to anyone else.", icon: Coffee },
  { text: "Your back is currently shaped like a shrimp. Un-shrimp yourself now.", icon: Accessibility },
  { text: "Error 404: Focus not found. Please reboot your brain with a 2-minute walk.", icon: Zap },
  { text: "The pixels are starting to judge your posture. Show them who's boss and stretch.", icon: Accessibility },
  { text: "You've been here so long the dust is starting to name its children after you.", icon: Ghost },
  { text: "If you don't stand up, your legs will forget how to gravity. Don't let them forget.", icon: Zap }
];

const BREAK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const BreakReminder: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(BREAK_MESSAGES[0]);
  const [lastBreakTime, setLastBreakTime] = useState<number>(Date.now());

  const triggerBreak = useCallback(() => {
    const randomMsg = BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)];
    setCurrentMessage(randomMsg);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const checkTimer = setInterval(() => {
      const now = Date.now();
      if (now - lastBreakTime >= BREAK_INTERVAL_MS && !isVisible) {
        triggerBreak();
      }
    }, 60000); // Check every minute

    // Manual trigger listener
    const handleManualTrigger = () => {
      triggerBreak();
    };

    window.addEventListener('manual-break-trigger', handleManualTrigger);

    return () => {
      clearInterval(checkTimer);
      window.removeEventListener('manual-break-trigger', handleManualTrigger);
    };
  }, [lastBreakTime, isVisible, triggerBreak]);

  const handleDismiss = () => {
    setIsVisible(false);
    setLastBreakTime(Date.now());
  };

  if (!isVisible) return null;

  const Icon = currentMessage.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[340px] z-[100] animate-in slide-in-from-bottom-8 duration-500 ease-out">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.2)] relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full" />
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 animate-pulse">
            <Icon size={24} />
          </div>
          
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Mandatory Interruption</h4>
            <p className="text-sm text-slate-100 font-medium leading-relaxed">
              {currentMessage.text}
            </p>
          </div>

          <button 
            onClick={handleDismiss}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <button 
            onClick={handleDismiss}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            I'm Moving! (Maybe)
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakReminder;
