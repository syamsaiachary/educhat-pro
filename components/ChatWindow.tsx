import React, { useEffect, useRef, useState } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { Message, ChatSession } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  session: ChatSession | null;
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ session, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session) return;
    onSendMessage(input.trim());
    setInput('');
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-300" />
        </div>
        <p className="text-lg font-medium text-slate-500">Select or create a new chat to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {session.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <Bot className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">EduChat Assistant</h2>
            <p className="text-slate-500 max-w-md">
              Ask me about courses, tuition, library hours, or enrollment. I'm here to help you navigate your education.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {session.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-purple-600' : 'bg-emerald-500'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
           <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex w-full justify-start"
         >
           <div className="flex max-w-[80%] gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
               <Bot className="w-4 h-4 text-white" />
             </div>
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
           </div>
         </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-purple-100">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};