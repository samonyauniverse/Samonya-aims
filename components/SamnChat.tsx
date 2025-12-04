import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToSamn } from '../services/geminiService';
import { ChatMessage } from '../types';
import { WELCOME_MESSAGE, CREDIT_COSTS } from '../constants';

interface SamnChatProps {
  credits: number;
  onSpendCredits: (amount: number, description: string) => boolean;
}

const SamnChat: React.FC<SamnChatProps> = ({ credits, onSpendCredits }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: "🔷 **SAMN AI:** " + WELCOME_MESSAGE,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check credits for chat
    if (credits < CREDIT_COSTS.CHAT_MESSAGE) {
      const denyMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "🔷 **SAMN AI:** I apologize, but you have insufficient credits (Cost: 1 Credit/msg). Please upgrade your plan via M-Pesa.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, denyMsg]);
      return;
    }

    // Spend Credit
    onSpendCredits(CREDIT_COSTS.CHAT_MESSAGE, "SAMN AI Chat Message");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToSamn(input);
      // Ensure prefix
      const formattedResponse = responseText.startsWith("🔷") ? responseText : `🔷 **SAMN AI:** ${responseText}`;
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: formattedResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-brand-orange hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center group"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ask SAMN AI</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[90vw] md:w-96 h-[60vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden font-sans animate-fade-in transition-colors duration-200">
          {/* Header */}
          <div className="bg-brand-dark p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">SAMN AI</h3>
                <p className="text-gray-400 text-xs flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-1 ${credits > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span> Online | {credits} Credits
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                  }`}
                >
                   <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>')}} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me or type 'Insights Mode'..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-orange text-white p-2 rounded-full hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SamnChat;