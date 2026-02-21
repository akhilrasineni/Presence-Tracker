
import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Fingerprint, Loader2, Sparkles } from 'lucide-react';

interface NeuralLoaderProps {
  message?: string;
  submessage?: string;
}

const NeuralLoader: React.FC<NeuralLoaderProps> = ({ 
  message = "Neural Computation in Progress", 
  submessage = "SECURE ENCRYPTED CHANNEL ACTIVE" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-2 border-blue-500/20 border-t-blue-500 rounded-full"
        />
        
        {/* Inner pulsing core */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        >
          <Fingerprint size={28} className="text-blue-400" />
        </motion.div>

        {/* Floating particles */}
        <motion.div 
          animate={{ 
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-4 -right-4 text-blue-500/40"
        >
          <Sparkles size={16} />
        </motion.div>
        
        <motion.div 
          animate={{ 
            y: [10, -10, 10],
            x: [5, -5, 5],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -bottom-4 -left-4 text-indigo-500/40"
        >
          <Cpu size={16} />
        </motion.div>
      </div>

      <div className="text-center space-y-2">
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-[10px] font-black uppercase tracking-[0.5em]"
        >
          {message}
        </motion.p>
        <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">
          {submessage}
        </p>
      </div>

      {/* Progress bar simulation */}
      <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        />
      </div>
    </div>
  );
};

export default NeuralLoader;
