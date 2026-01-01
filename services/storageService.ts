import { ChatSession, Message, Intent, UnansweredLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { defaultIntents } from '../data/defaultIntents';

export const storageService = {
  getSessions: (username: string): ChatSession[] => {
    const key = `educhat_sessions_${username}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  saveSessions: (username: string, sessions: ChatSession[]) => {
    const key = `educhat_sessions_${username}`;
    localStorage.setItem(key, JSON.stringify(sessions));
  },

  createSession: (username: string): ChatSession => {
    const sessions = storageService.getSessions(username);
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      lastUpdated: Date.now(),
    };
    sessions.unshift(newSession);
    storageService.saveSessions(username, sessions);
    return newSession;
  },

  updateSession: (username: string, sessionId: string, updater: (session: ChatSession) => ChatSession) => {
    const sessions = storageService.getSessions(username);
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = updater(sessions[index]);
      // Move to top
      const updated = sessions.splice(index, 1)[0];
      sessions.unshift(updated);
      storageService.saveSessions(username, sessions);
    }
  },

  deleteSession: (username: string, sessionId: string) => {
    const sessions = storageService.getSessions(username).filter(s => s.id !== sessionId);
    storageService.saveSessions(username, sessions);
  },

  getIntents: (): Intent[] => {
    const stored = localStorage.getItem('educhat_intents');
    return stored ? JSON.parse(stored) : defaultIntents;
  },

  saveIntents: (intents: Intent[]) => {
    localStorage.setItem('educhat_intents', JSON.stringify(intents));
  },

  getUnansweredLogs: (): UnansweredLog[] => {
    const stored = localStorage.getItem('educhat_logs');
    return stored ? JSON.parse(stored) : [];
  },

  saveUnansweredLogs: (logs: UnansweredLog[]) => {
    localStorage.setItem('educhat_logs', JSON.stringify(logs));
  },

  addUnansweredLog: (question: string) => {
    const logs = storageService.getUnansweredLogs();
    logs.push({
      id: uuidv4(),
      question,
      timestamp: Date.now()
    });
    storageService.saveUnansweredLogs(logs);
  },

  removeLog: (id: string) => {
    const logs = storageService.getUnansweredLogs();
    const newLogs = logs.filter(l => l.id !== id);
    storageService.saveUnansweredLogs(newLogs);
  }
};