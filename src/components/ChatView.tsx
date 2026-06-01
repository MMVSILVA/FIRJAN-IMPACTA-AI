import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RefreshCcw, 
  Bot, 
  User, 
  Volume2, 
  Cpu, 
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatViewProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: () => void;
  isLoading: boolean;
}

export default function ChatView({ 
  chatHistory, 
  onSendMessage, 
  onClearHistory, 
  isLoading 
}: ChatViewProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const faqSuggestions = [
    { label: 'Como cadastrar ideias?', text: 'Como posso cadastrar uma ideia inovadora no Firjan Connect?' },
    { label: 'O que é o SESI RJ?', text: 'Qual é o papel do SESI RJ no ambiente de saúde industrial?' },
    { label: 'Manual de identidade visual', text: 'Onde encontro as fontes e regras do manual de identidade visual Firjan SENAI?' },
    { label: 'Regras de Reembolso SAP', text: 'Quais as regras e prazos de reembolsos integrados no sistema SAP?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText;
    setInputText('');
    await onSendMessage(textToSend);
  };

  // TTS speech helper
  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove markdowns from reader text to make it sound premium and human-like
      const cleanText = text.replace(/[*#`_\-]/g, '');
      const utterance = new SynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Síntese de voz não suportada.');
    }
  };

  // Workaround since SynthesisUtterance isn't directly typed in some environments
  const SynthesisUtterance = (window as any).SpeechSynthesisUtterance;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px] lg:h-[calc(100vh-140px)]" role="main">
      
      {/* Suggestions / Context guidelines menu left */}
      <div className="lg:col-span-1 glass-panel p-4 rounded-xl border-zinc-800 space-y-4 flex flex-col justify-between text-left">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-semibold uppercase text-white font-display tracking-wider">
              Orientações Rápidas
            </h3>
          </div>
          
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Eu sou uma IA treinada nos processos corporativos da FIRJAN. Sinta-se livre para tirar dúvidas operacionais, fluxos administrativos do SENAI/SESI ou pedir orientações para aprimorar sua ideia!
          </p>

          <div className="space-y-2 pt-2 border-t border-zinc-900">
            <span className="text-[10px] text-zinc-500 font-mono uppercase block">Perguntas Frequentes</span>
            {faqSuggestions.map((faq, idx) => (
              <button
                id={`btn_faq_suggest_${idx}`}
                key={idx}
                onClick={() => setInputText(faq.text)}
                className="w-full text-left p-2.5 rounded text-[11px] bg-zinc-950/40 hover:bg-purple-900/10 text-zinc-300 hover:text-purple-300 border border-zinc-900 truncate block transition-all"
              >
                ❓ {faq.label}
              </button>
            ))}
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            id="btn_clear_chat_hist"
            onClick={onClearHistory}
            className="w-full py-1.5 border border-zinc-800 hover:border-red-500/30 text-[10px] font-semibold text-zinc-400 hover:text-red-400 rounded-lg transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Limpar Histórico do Chat
          </button>
        )}
      </div>

      {/* Primary chat window right */}
      <div className="lg:col-span-3 glass-panel rounded-xl border-zinc-800 flex flex-col justify-between overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="bg-zinc-950/80 p-3.5 border-b border-zinc-900/80 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white uppercase font-display tracking-widest leading-none">
                Assistente Firjan Connect AI
              </h3>
              <span className="text-[9px] text-green-400 font-mono">● Gemini-3.5-flash com Contexto Institucional Ativo</span>
            </div>
          </div>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)] min-h-[300px]">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3 py-10">
              <Bot className="w-12 h-12 text-zinc-700 animate-bounce" />
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-semibold text-white font-display">Olá! Como posso acelerar seu onboarding hoje?</h4>
                <p className="text-xs">Digite uma pergunta acima ou selecione um atalho rápido ao lado para ver o Gemini AI em ação executando respostas humanizadas.</p>
              </div>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-full text-left animate-in fade-in duration-200 ${msg.role === 'model' ? 'justify-start' : 'justify-end'}`}
              >
                {msg.role === 'model' && (
                  <div className="p-1.5 shrink-0 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 w-8 h-8 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`p-3.5 rounded-2xl text-xs max-w-xs sm:max-w-md md:max-w-lg leading-relaxed shadow-lg ${
                  msg.role === 'model' 
                    ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-100 rounded-tl-none' 
                    : 'bg-purple-600 border border-purple-500 text-white rounded-tr-none'
                }`}>
                  <div className="flex justify-between items-center pb-1.5 border-b border-zinc-950/20 mb-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest opacity-80">
                      {msg.role === 'model' ? 'Assistente AI' : 'Você'}
                    </span>
                    {msg.role === 'model' && (
                      <button
                        id={`btn_read_speech_${msg.id}`}
                        onClick={() => handleTTS(msg.content)}
                        className="opacity-40 hover:opacity-100 text-zinc-400 hover:text-white transition-opacity"
                        title="Ler em voz alta"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="p-1.5 shrink-0 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 w-8 h-8 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 text-left">
              <div className="p-1.5 shrink-0 rounded-lg bg-purple-500/11 text-purple-400 border border-purple-500/11 w-8 h-8 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-zinc-900 p-3 rounded-2xl rounded-tl-none border border-zinc-800/60 max-w-xs">
                <span className="text-[9px] text-zinc-500 font-mono block">GEMINI PROCESSANDO...</span>
                <div className="flex gap-1.5 pt-1.5 pb-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150" />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-zinc-950/80 border-t border-zinc-900/80 flex gap-2">
          <input
            id="input_chat_text_box"
            type="text"
            placeholder="Pergunte sobre políticas, saúde SESI, cursos SENAI, recompensas Firjan Connect..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <button
            id="btn_chat_send_button"
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
