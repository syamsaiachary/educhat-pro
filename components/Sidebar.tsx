import React from 'react';
import { Plus, MessageSquare, Trash2, LogOut } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  username: string;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  username,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onLogout,
}) => {
  return (
    <div className="w-64 bg-white/80 backdrop-blur-md border-r border-purple-100 flex flex-col h-full shadow-lg transition-all hidden md:flex">
      <div className="p-4 border-b border-purple-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl text-purple-900 tracking-tight">EduChat Pro</h1>
        </div>
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
              currentSessionId === session.id
                ? 'bg-purple-100 text-purple-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare className={`w-4 h-4 ${currentSessionId === session.id ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="truncate text-sm">{session.title}</span>
            </div>
            <button
              onClick={(e) => onDeleteSession(e, session.id)}
              className={`p-1.5 rounded-md hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ${
                currentSessionId === session.id ? 'opacity-100' : ''
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-purple-100">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2 px-2">
            <span className="font-medium truncate max-w-[120px]">{username}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-red-600 w-full p-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
};