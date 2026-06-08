import React, { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardBody } from './common/Card';
import { 
  Send, 
  Trash2, 
  User, 
  Bot, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

export const AICoach: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    chatHistory, 
    sendCoachMessage, 
    clearChat, 
    isChatLoading,
    fetchHealthScore
  } = useFinanceStore();

  const [message, setMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync health score metrics to inject in background if needed
  useEffect(() => {
    fetchHealthScore();
  }, []);

  // Auto-scroll chat to the bottom on new message additions
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isChatLoading) return;
    const msgToSend = message;
    setMessage('');
    await sendCoachMessage(msgToSend);
  };

  const handlePromptClick = async (promptText: string) => {
    if (isChatLoading) return;
    await sendCoachMessage(promptText);
  };

  const suggestedPrompts = [
    "How can I raise my Financial Health Score?",
    "Give me ideas to cut back on Wants this month.",
    "Will I meet my savings goals based on current saving rate?",
    "Explain the 50/30/20 budget framework."
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(99,102,241,0.04)_0px,transparent_60%)] pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white text-gradient-primary">AI Financial Coach</h1>
          <p className="text-xs text-slate-400">Get context-aware suggestions and coaching from Google Gemini AI.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Left column: Quick prompt templates */}
        <div className="lg:col-span-1 hidden lg:flex flex-col gap-4">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-neonAmber" />
              <h2 className="text-base font-bold text-white">Suggested Topics</h2>
            </CardHeader>
            <CardBody className="flex-1 overflow-y-auto space-y-3.5">
              <p className="text-xs text-slate-400">
                Click any suggestion to instantly consult your AI coach about your current parameters:
              </p>
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isChatLoading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/40 border border-darkBorder hover:border-neonViolet/30 hover:bg-neonViolet/5 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Right column: Chat Console */}
        <Card className="lg:col-span-3 flex flex-col min-h-0 h-full">
          <CardHeader className="flex items-center justify-between border-b border-darkBorder py-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-neonMint animate-pulse" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Active Session</span>
            </div>
            
            {chatHistory.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-neonCoral/15 text-slate-400 hover:text-neonCoral border border-darkBorder hover:border-neonCoral/20 rounded-xl text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Chat
              </button>
            )}
          </CardHeader>

          {/* Messages Area */}
          <CardBody className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 no-scrollbar">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Hello, {user?.name}!</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  I am your AI Financial Coach. Ask me how to build up savings, analyze your budget metrics, or formulate plans for target goals!
                </p>
                
                {/* Mobile visible suggested prompt buttons */}
                <div className="lg:hidden mt-6 w-full space-y-2.5">
                  {suggestedPrompts.slice(0, 2).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(prompt)}
                      disabled={isChatLoading}
                      className="w-full text-left p-3 rounded-xl bg-slate-900/40 border border-darkBorder text-slate-300 text-xs font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs border ${
                      msg.role === 'user'
                        ? 'bg-violet-600/10 border-violet-500/20 text-violet-400'
                        : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                      msg.role === 'user'
                        ? 'bg-violet-600/10 border-violet-500/20 text-white rounded-tr-none'
                        : 'bg-slate-900/40 border-darkBorder text-slate-200 rounded-tl-none font-medium'
                    }`}>
                      {msg.content.split('\n').map((line, lineIdx) => (
                        <p key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Bot Loader Bubble */}
                {isChatLoading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                      <Bot className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="p-3.5 rounded-2xl text-xs bg-slate-900/40 border border-darkBorder text-slate-400 rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>
            )}
          </CardBody>

          {/* Input Panel */}
          <div className="p-3 border-t border-darkBorder bg-slate-950/40 shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isChatLoading}
                placeholder="Ask about goals, budgets, or purchase decisions..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-white text-xs focus:outline-none focus:border-neonViolet/50 transition-all"
              />
              <button
                type="submit"
                disabled={isChatLoading || !message.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center gap-1 mt-2 justify-center text-[10px] text-slate-500">
              <AlertTriangle className="w-3 h-3 text-slate-600" />
              <span>AI advice is educational; consult professionals for certified wealth planning.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
