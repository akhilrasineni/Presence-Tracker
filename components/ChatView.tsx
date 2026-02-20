
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PageContent } from '../types';
import { chatWithPage } from '../services/geminiService';
import { Send, User, Bot, Loader2, Info, Trash2, Globe, ExternalLink } from 'lucide-react';

interface ChatViewProps {
  pageContent: PageContent;
}

const STORAGE_KEY = 'rpt_chat_history';

const ChatView: React.FC<ChatViewProps> = ({ pageContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: 'model', text: "Neural session initialized. Ask me anything about this page.", timestamp: Date.now() }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearHistory = () => {
    setMessages([{ role: 'model', text: "Neural buffers cleared.", timestamp: Date.now() }]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const { text, grounding } = await chatWithPage(history, input, pageContent, useSearch);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: text || "Transmission failure.", 
        timestamp: Date.now(),
        groundingUrls: grounding 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Terminal Error.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <button 
          onClick={() => setUseSearch(!useSearch)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
            useSearch 
            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
            : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          <Globe size={14} className={useSearch ? "animate-pulse" : ""} />
          <span className="text-[9px] font-black uppercase tracking-widest">Global Intelligence</span>
        </button>
        <button onClick={clearHistory} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`p-4 rounded-3xl text-[12px] leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-start mt-2">
                  {msg.groundingUrls.map((url, i) => (
                    <a 
                      key={i} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[8px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink size={10} /> Intelligence Source {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl rounded-tl-none animate-pulse">
              <Loader2 size={16} className="animate-spin text-blue-500" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative pt-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={useSearch ? "Search and analyze..." : "Analyze page..."}
          className="w-full bg-slate-900 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 placeholder:text-slate-700 pr-14 transition-all shadow-2xl"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-4 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatView;
