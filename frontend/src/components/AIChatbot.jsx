import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User, RefreshCw } from 'lucide-react';
import { apiService } from '../utils/api';

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Namaste! I am your AI Educational Guidance Assistant for Saraswati Tutorials. How can I help you improve your child's academic performance today?",
      mode: 'local-nlp'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "How can a tutor improve my child's mathematics performance?",
    "What is the best 1-on-1 study planning method?",
    "What are the benefits of home tutoring over coaching classes?",
    "How do tutors prepare students for Class 10th Board exams?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Build history formatting
      const history = messages.map(m => ({
        role: m.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const res = await apiService.sendChatbotMessage(query, history);
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        mode: res.mode
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I apologize, but I am having trouble connecting to my knowledge base right now. Please try again in a few moments.",
          mode: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-400 p-2 rounded-xl text-white animate-pulse">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">AI Educational Assistant</h3>
            <p className="text-xs text-purple-300">Parent Guidance & Study Planners</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800 text-[10px] text-teal-400">
          <Sparkles className="w-3 h-3 text-teal-400 animate-spin" />
          <span>Active Guidance Engine</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
              msg.sender === 'user' 
                ? 'bg-slate-800 border-slate-700 text-teal-400' 
                : 'bg-purple-950/80 border-purple-800 text-purple-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              
              {/* AI Badge indicator */}
              {msg.sender === 'ai' && msg.mode && (
                <span className="text-[9px] text-slate-500 mt-1 block px-1">
                  Engine: <span className="text-purple-400 capitalize">{msg.mode.replace('-', ' ')}</span>
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-[85%] items-center">
            <div className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5">
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Suggested Inquiries</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 bg-slate-800/80 hover:bg-purple-950/30 hover:text-purple-300 text-slate-300 rounded-full border border-slate-800 hover:border-purple-800/60 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about tuition planning or academic improvement..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-650/15"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
