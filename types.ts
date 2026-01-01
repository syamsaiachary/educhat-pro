export interface Intent {
  id: string;
  tag: string;
  patterns: string[];
  responses: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

export interface UnansweredLog {
  id: string;
  question: string;
  timestamp: number;
}

export type ViewState = 'chat' | 'admin';

export interface AdminStats {
  totalIntents: number;
  totalUnanswered: number;
}