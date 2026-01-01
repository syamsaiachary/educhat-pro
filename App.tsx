import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel'; // Import Admin Panel
import { ChatSession, Message } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { NLPService } from './services/nlpService'; // Import your custom NLP engine
import { Menu, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); // State for Admin Panel

  // Check for existing login on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('educhat_user');
    if (savedUser) {
      handleLogin(savedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('educhat_user', username);
    const userSessions = storageService.getSessions(username);
    setSessions(userSessions);
    if (userSessions.length > 0) {
      setCurrentSessionId(userSessions[0].id);
    } else {
      handleNewSession(username);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSessionId(null);
    setSessions([]);
    localStorage.removeItem('educhat_user');
  };

  const handleNewSession = (username = currentUser) => {
    if (!username) return;
    const newSession = storageService.createSession(username);
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setShowMobileSidebar(false);
  };

  const handleSwitchSession = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setShowMobileSidebar(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    storageService.deleteSession(currentUser, id);
    setSessions(prev => prev.filter(s => s.id !== id));
    
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        handleNewSession(currentUser);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId || !currentUser) return;

    // 1. Create User Message and Update UI
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    // Helper to update state
    const updateSessionMessages = (msg: Message, updateTitle = false) => {
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(s => {
          if (s.id === currentSessionId) {
            return {
               ...s,
               messages: [...s.messages, msg],
               lastUpdated: Date.now(),
               title: updateTitle ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : s.title
            };
          }
          return s;
        });
        updatedSessions.sort((a, b) => b.lastUpdated - a.lastUpdated);
        storageService.saveSessions(currentUser, updatedSessions);
        return updatedSessions;
      });
    };

    const currentSession = sessions.find(s => s.id === currentSessionId);
    const isFirstMessage = currentSession?.messages.length === 0;
    updateSessionMessages(userMsg, isFirstMessage);
    
    setIsTyping(true);

    // --- THE HYBRID LOGIC START ---
    try {
      let responseText = "";
      
      // Step A: Initialize NLP Engine with current intents
      const intents = storageService.getIntents();
      const nlp = new NLPService(intents);
      
      // Step B: Check Local Database
      const localMatch = nlp.getBestMatch(text);

      if (localMatch) {
        // MATCH FOUND: Use the database response (Immediate & Free)
        // Randomly select one of the available responses for variety
        const randomIndex = Math.floor(Math.random() * localMatch.responses.length);
        responseText = localMatch.responses[randomIndex];
        console.log("Served from Local Database (Intent: " + localMatch.tag + ")");
      } else {
        // NO MATCH: Fallback to Gemini AI
        console.log("No local match found. Calling Gemini API...");
        
        // Log this question so Admin can see it later!
        storageService.addUnansweredLog(text);

        const history = currentSession?.messages || [];
        responseText = await geminiService.getChatResponse(history, text);
      }

      // Step C: Send Response to UI
      const botMsg: Message = {
        id: uuidv4(),
        role: 'bot',
        text: responseText,
        timestamp: Date.now()
      };

      updateSessionMessages(botMsg);
    } catch (error) {
      console.error("Error generating response", error);
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'bot',
        text: "I encountered a system error. Please try again.",
        timestamp: Date.now()
      };
      updateSessionMessages(errorMsg);
    } finally {
      setIsTyping(false);
    }
    // --- THE HYBRID LOGIC END ---
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <Layout>
      {/* Admin Panel Overlay */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 left-4 z-20">
        <button 
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 bg-white rounded-lg shadow-md text-purple-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Admin Toggle Button (Visible on Desktop) */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => setShowAdmin(true)}
          className="p-2 bg-white/50 hover:bg-white rounded-full shadow-sm text-slate-500 hover:text-purple-600 transition-all"
          title="Open Admin Panel"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          username={currentUser}
          onNewSession={() => handleNewSession(currentUser)}
          onSelectSession={handleSwitchSession}
          onDeleteSession={handleDeleteSession}
          onLogout={handleLogout}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <ChatWindow
        session={currentSession}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </Layout>
  );
};

export default App;