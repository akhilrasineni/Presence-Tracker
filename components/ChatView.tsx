
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PageContent } from '../types';
import { chatWithPage } from '../services/geminiService';
import { Send, User, Bot, Loader2, Info, Trash2 } from 'lucide-react';

interface ChatViewProps {
  pageContent: PageContent;
}

const STORAGE_KEY = 'rpt_chat_history';

const ChatView: React.FC<ChatViewProps> = ({ pageContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from local core
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: 'model', text: "I've indexed this page. Ask me anything about it!", timestamp: Date.now() }]);
    }
  }, []);

  // Save history to local core on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearHistory = () => {
    const initial = [{ role: 'model', text: "Neural buffers cleared. Ready for new input.", timestamp: Date.now() }];
    setMessages(initial);
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
      
      const response = await chatWithPage(history, input, pageContent);
      setMessages(prev => [...prev, { role: 'model', text: response || "I couldn't process that.", timestamp: Date.now() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI service.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-blue-400 mt-0.5" />
          <p className="text-[11px] text-blue-300 leading-tight">
            Chat context: <br/>
            <span className="font-semibold text-blue-200">"{pageContent.title}"</span>
          </p>
        </div>
        <button 
          onClick={clearHistory}
          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
          title="Clear local logs"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-blue-400" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-700 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Bot size={14} className="text-blue-400" />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-blue-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="relative mt-auto">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this page..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-200 placeholder-slate-600 pr-12 transition-all"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatView;
