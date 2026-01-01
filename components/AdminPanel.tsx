import React, { useState, useEffect } from 'react';
import { Intent, UnansweredLog } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { X, Save, Trash2, Plus, RefreshCw, Wand2, Check, Settings, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'intents' | 'logs'>('intents');
  const [intents, setIntents] = useState<Intent[]>([]);
  const [logs, setLogs] = useState<UnansweredLog[]>([]);
  const [editingIntent, setEditingIntent] = useState<Partial<Intent> | null>(null);
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  useEffect(() => {
    setIntents(storageService.getIntents());
    setLogs(storageService.getUnansweredLogs());
  }, []);

  const handleDeleteIntent = (id: string) => {
    if (confirm('Are you sure you want to delete this intent?')) {
      const newIntents = intents.filter(i => i.id !== id);
      setIntents(newIntents);
      storageService.saveIntents(newIntents);
    }
  };

  const handleSaveIntent = () => {
    if (!editingIntent?.tag || !editingIntent.patterns?.length || !editingIntent.responses?.length) {
      alert('Please fill in all fields (Tag, at least one Pattern, at least one Response)');
      return;
    }

    const newIntent: Intent = {
      id: editingIntent.id || uuidv4(),
      tag: editingIntent.tag,
      patterns: editingIntent.patterns,
      responses: editingIntent.responses
    };

    let newIntents = [...intents];
    const index = newIntents.findIndex(i => i.id === newIntent.id);
    
    if (index !== -1) {
      newIntents[index] = newIntent;
    } else {
      newIntents.push(newIntent);
    }

    setIntents(newIntents);
    storageService.saveIntents(newIntents);
    setEditingIntent(null);
  };

  const handleConvertToIntent = (log: UnansweredLog) => {
    setEditingIntent({
      tag: 'new_topic',
      patterns: [log.question],
      responses: ['']
    });
    setActiveTab('intents');
    // We don't remove the log yet, wait until save
  };

  const handleGenerateAnswer = async (log: UnansweredLog) => {
    if (!process.env.API_KEY) {
      alert("API_KEY environment variable is missing.");
      return;
    }
    setGeneratingFor(log.id);
    try {
      const answer = await geminiService.generateAnswer(log.question);
      setEditingIntent({
        tag: 'auto_generated',
        patterns: [log.question],
        responses: [answer]
      });
      setActiveTab('intents');
      storageService.removeLog(log.id);
      setLogs(storageService.getUnansweredLogs());
    } catch (e) {
      alert("Failed to generate answer. Check console.");
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-sm">ADMIN</span>
          Knowledge Base
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-slate-50 border-r border-slate-200 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('intents')}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'intents' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Intents ({intents.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'logs' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unanswered ({logs.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          
          {editingIntent ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
              <h3 className="text-lg font-bold mb-4">{editingIntent.id ? 'Edit Intent' : 'New Intent'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tag (Category)</label>
                  <input
                    type="text"
                    value={editingIntent.tag || ''}
                    onChange={e => setEditingIntent({ ...editingIntent, tag: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="e.g. library_hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patterns (User Inputs)</label>
                  <div className="space-y-2">
                    {(editingIntent.patterns || []).map((p, idx) => (
                      <div key={idx} className="flex gap-2">
                         <input
                          type="text"
                          value={p}
                          onChange={e => {
                            const newPatterns = [...(editingIntent.patterns || [])];
                            newPatterns[idx] = e.target.value;
                            setEditingIntent({ ...editingIntent, patterns: newPatterns });
                          }}
                          className="flex-1 border border-slate-300 rounded-lg p-2 text-sm"
                        />
                         <button 
                           onClick={() => {
                             const newPatterns = editingIntent.patterns?.filter((_, i) => i !== idx);
                             setEditingIntent({ ...editingIntent, patterns: newPatterns });
                           }}
                           className="text-red-500 hover:bg-red-50 p-2 rounded"
                         >
                           <Trash2 className="w-4 h-4"/>
                         </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditingIntent({ ...editingIntent, patterns: [...(editingIntent.patterns || []), ''] })}
                      className="text-sm text-purple-600 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Pattern
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responses (Bot Answers)</label>
                  <div className="space-y-2">
                    {(editingIntent.responses || []).map((r, idx) => (
                      <div key={idx} className="flex gap-2">
                         <textarea
                          value={r}
                          onChange={e => {
                            const newRes = [...(editingIntent.responses || [])];
                            newRes[idx] = e.target.value;
                            setEditingIntent({ ...editingIntent, responses: newRes });
                          }}
                          className="flex-1 border border-slate-300 rounded-lg p-2 text-sm h-20"
                        />
                        <button 
                           onClick={() => {
                             const newRes = editingIntent.responses?.filter((_, i) => i !== idx);
                             setEditingIntent({ ...editingIntent, responses: newRes });
                           }}
                           className="text-red-500 hover:bg-red-50 p-2 rounded self-start"
                         >
                           <Trash2 className="w-4 h-4"/>
                         </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditingIntent({ ...editingIntent, responses: [...(editingIntent.responses || []), ''] })}
                      className="text-sm text-purple-600 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Response
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditingIntent(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIntent}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Intent
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'intents' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Existing Intents</h3>
                <button
                  onClick={() => setEditingIntent({ patterns: [''], responses: [''] })}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>
              <div className="grid gap-4">
                {intents.map(intent => (
                  <div key={intent.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded text-xs uppercase">{intent.tag}</span>
                        </div>
                        <p className="text-sm text-slate-500 italic mb-2">"{intent.patterns[0]}" + {intent.patterns.length - 1} more</p>
                        <p className="text-sm text-slate-700 line-clamp-2">{intent.responses[0]}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingIntent(intent)}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIntent(intent.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-slate-800 mb-6">Unanswered Questions</h3>
               {logs.length === 0 ? (
                 <div className="text-center text-slate-400 py-10">
                   <Check className="w-12 h-12 mx-auto mb-2 opacity-50" />
                   <p>All clear! No unanswered questions logged.</p>
                 </div>
               ) : (
                 <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                   {logs.map(log => (
                     <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                       <div>
                         <p className="font-medium text-slate-800">{log.question}</p>
                         <p className="text-xs text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                       </div>
                       <div className="flex gap-2">
                         <button
                           onClick={() => handleConvertToIntent(log)}
                           className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                         >
                           Add Manually
                         </button>
                         <button
                           onClick={() => handleGenerateAnswer(log)}
                           disabled={generatingFor === log.id || !process.env.API_KEY}
                           className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                         >
                           {generatingFor === log.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />}
                           Auto-Generate
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};