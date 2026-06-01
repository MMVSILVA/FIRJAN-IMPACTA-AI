import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Type, 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  Mic, 
  MicOff, 
  CheckCircle,
  Menu,
  ChevronDown
} from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface AccessibilityToolbarProps {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
  onVoiceCommandTrigger: (command: string) => void;
}

export default function AccessibilityToolbar({ 
  settings, 
  onChange,
  onVoiceCommandTrigger 
}: AccessibilityToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceTriggers, setShowVoiceTriggers] = useState(false);

  // Available font size labels
  const sizeLabels = {
    sm: 'Pequena',
    base: 'Padrão',
    lg: 'Grande',
    xl: 'Extra G'
  };

  const sampleCommands = [
    { text: 'Ir para Dashboard', action: 'dashboard' },
    { text: 'Cadastrar Ideias', action: 'cadastro' },
    { text: 'Abrir Chat IA', action: 'chat' },
    { text: 'Ver Central de Conhecimento', action: 'wiki' },
    { text: 'Ver Onboarding', action: 'onboarding' },
    { text: 'Ver Eficiência Operacional', action: 'eficiencia' },
    { text: 'Ver Administração', action: 'admin' },
    { text: 'Ativar Alto Contraste', action: 'alto_contraste' }
  ];

  // Apply basic tags to document body based on settings
  useEffect(() => {
    const body = document.body;
    
    // Contrast
    if (settings.highContrast) {
      body.classList.add('high-contrast-mode');
    } else {
      body.classList.remove('high-contrast-mode');
    }

    // Dyslexia Dyslexic font
    if (settings.dyslexicFont) {
      body.classList.add('dyslexic-font-active');
    } else {
      body.classList.remove('dyslexic-font-active');
    }

    // Font size
    body.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    if (settings.fontSize === 'sm') body.classList.add('text-sm');
    else if (settings.fontSize === 'base') body.classList.add('text-base');
    else if (settings.fontSize === 'lg') body.classList.add('text-lg');
    else if (settings.fontSize === 'xl') body.classList.add('text-xl');

  }, [settings]);

  // Voice Recognition setup
  const startSpeechRecognition = () => {
    if (voiceActive) {
      setVoiceActive(false);
      return;
    }

    // Check availability
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceTranscript('Reconhecimento de voz não suportado neste navegador. Use os botões de atalho.');
      setVoiceActive(true);
      setShowVoiceTriggers(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceActive(true);
        setVoiceTranscript('Ouvindo comandos...');
      };

      recognition.onerror = (event: any) => {
        console.error('Erro reconhecimento voz:', event.error);
        setVoiceTranscript(`Erro no microfone: ${event.error}. Use os atalhos abaixo.`);
        setShowVoiceTriggers(true);
      };

      recognition.onend = () => {
        setVoiceActive(false);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript.toLowerCase();
        setVoiceTranscript(`Comando detectado: "${resultText}"`);
        processVoiceCommand(resultText);
      };

      recognition.start();
    } catch (err) {
      setVoiceTranscript('Acesso negado ou restrito. Use os atalhos.');
      setShowVoiceTriggers(true);
    }
  };

  const processVoiceCommand = (rawText: string) => {
    let triggered = false;
    
    if (rawText.includes('dash') || rawText.includes('principal') || rawText.includes('executivo')) {
      onVoiceCommandTrigger('dashboard');
      triggered = true;
    } else if (rawText.includes('ideia') || rawText.includes('cadastrar') || rawText.includes('novo projeto')) {
      onVoiceCommandTrigger('cadastro');
      triggered = true;
    } else if (rawText.includes('chat') || rawText.includes('assistente') || rawText.includes('ia') || rawText.includes('inteligência')) {
      onVoiceCommandTrigger('chat');
      triggered = true;
    } else if (rawText.includes('wiki') || rawText.includes('conhecimento') || rawText.includes('central') || rawText.includes('perguntas')) {
      onVoiceCommandTrigger('wiki');
      triggered = true;
    } else if (rawText.includes('onboarding') || rawText.includes('trilha') || rawText.includes('integração')) {
      onVoiceCommandTrigger('onboarding');
      triggered = true;
    } else if (rawText.includes('gargalo') || rawText.includes('eficiência') || rawText.includes('estatística') || rawText.includes('operação')) {
      onVoiceCommandTrigger('eficiencia');
      triggered = true;
    } else if (rawText.includes('administração') || rawText.includes('admin') || rawText.includes('gerenciamento') || rawText.includes('configurações')) {
      onVoiceCommandTrigger('admin');
      triggered = true;
    } else if (rawText.includes('contraste') || rawText.includes('alto contraste') || rawText.includes('cores')) {
      onChange({ ...settings, highContrast: !settings.highContrast });
      setVoiceTranscript('Modo de cores atualizado!');
      triggered = true;
    }

    if (!triggered) {
      // Find approximate matching sample command
      const found = sampleCommands.find(cmd => rawText.includes(cmd.action) || rawText.includes(cmd.text.toLowerCase()));
      if (found) {
        onVoiceCommandTrigger(found.action);
      } else {
        setVoiceTranscript(`Instrução "${rawText}" não mapeada. Veja a lista de atalhos suportados:`);
        setShowVoiceTriggers(true);
      }
    }
  };

  // Helper function to read out current page instructions or accessibility guidelines
  const handleReadScreen = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop anything working currently
      
      const activeEl = document.querySelector('[role="main"]') || document.getElementById('root');
      const textToRead = activeEl ? (activeEl as HTMLElement).innerText : 'FIRJAN CONNECT AI';
      
      const cleanedText = textToRead
        .replace(/[\n\r]+/g, '. ')
        .substring(0, 400); // Limit length to avoid infinite speech

      const utterance = new SpeechSynthesisUtterance(
        `Ativo o leitor de tela do Firjan Connect. Conteúdo atual: ${cleanedText}... Fim do resumo.`
      );
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sua plataforma ou navegador não suporta a síntese de voz (SpeechSynthesis).');
    }
  };

  return (
    <div className="relative z-50">
      {/* Trigger floating button */}
      <button
        id="btn_accessibility_control"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-green-500 hover:bg-green-400 text-black p-3.5 rounded-full shadow-lg shadow-green-500/20 hover:scale-105 transition-all flex items-center gap-2 group focus:ring-2 focus:ring-white border border-green-300"
        title="Controles de Acessibilidade e Inclusão"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-semibold uppercase font-display max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
          Acessibilidade (F9)
        </span>
      </button>

      {/* Control Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 w-96 max-w-[calc(100vw-32px)] glass-panel bg-zinc-950/95 border-purple-500/30 rounded-2xl shadow-2xl p-5 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-semibold font-display tracking-wide uppercase text-white">
                Acessibilidade & Voz
              </h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white text-xs border border-zinc-800 px-2 py-1 rounded"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-4 text-xs text-zinc-300">
            {/* Visual Adjustments */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Visual</span>
              
              {/* Contrast */}
              <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span>Modo Alto Contraste</span>
                </div>
                <button
                  id="toggle_contrast"
                  onClick={() => onChange({ ...settings, highContrast: !settings.highContrast })}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.highContrast ? 'bg-green-500' : 'bg-zinc-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${settings.highContrast ? 'translate-x-5 bg-white' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Dyslexia font */}
              <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-purple-400" />
                  <div>
                    <span>Fonte para Dislexia</span>
                    <span className="text-[10px] text-zinc-500 block">Letras espaçadas e amigáveis</span>
                  </div>
                </div>
                <button
                  id="toggle_dyslexic"
                  onClick={() => onChange({ ...settings, dyslexicFont: !settings.dyslexicFont })}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.dyslexicFont ? 'bg-purple-500' : 'bg-zinc-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${settings.dyslexicFont ? 'translate-x-5 bg-white' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Cognitive simplified */}
              <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span>Acessibilidade Cognitiva</span>
                    <span className="text-[10px] text-zinc-500 block">Esconde dashboards complexos</span>
                  </div>
                </div>
                <button
                  id="toggle_cognitive"
                  onClick={() => onChange({ ...settings, cognitiveSimplified: !settings.cognitiveSimplified })}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.cognitiveSimplified ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${settings.cognitiveSimplified ? 'translate-x-5 bg-white' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* FontSize */}
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase block mb-1.5">Tamanho do Texto</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                    <button
                      id={`btn_font_size_${sz}`}
                      key={sz}
                      onClick={() => onChange({ ...settings, fontSize: sz })}
                      className={`py-1 rounded text-center transition-all border ${settings.fontSize === sz ? 'bg-purple-500/20 text-purple-300 border-purple-500' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      {sizeLabels[sz]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Reader */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Áudio (Leitura)</span>
              <button
                id="btn_read_screen"
                onClick={handleReadScreen}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-lg transition-all"
              >
                <Volume2 className="w-4 h-4" />
                Ler Conteúdo de Tela (Voz)
              </button>
            </div>

            {/* Voice Command Assistant */}
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Comandos por Voz</span>
                <button 
                  onClick={() => setShowVoiceTriggers(!showVoiceTriggers)}
                  className="text-[10px] text-purple-400 hover:underline flex items-center gap-1"
                >
                  Atalhos de voz <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-center space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-left">Microfone Virtual:</span>
                  <button
                    id="btn_speech_mic_toggle"
                    onClick={startSpeechRecognition}
                    className={`p-2 rounded-full transition-all flex items-center justify-center ${voiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    {voiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>

                {voiceTranscript && (
                  <p className="text-[11px] font-mono text-green-400 bg-black/40 p-2 rounded text-left border border-zinc-950">
                    {voiceTranscript}
                  </p>
                )}

                {!voiceTranscript && (
                  <p className="text-[11px] text-zinc-500 text-left leading-relaxed">
                    Clique no ícone de microfone e diga "Cadastrar Ideias", "Dashboard" ou "Abrir Chat".
                  </p>
                )}
              </div>

              {/* Show sample clickable triggers for seamless demo & accessibility constraints */}
              {showVoiceTriggers && (
                <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800 space-y-1.5 animate-in fade-in">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest block mb-1">
                    Atalho Rápido (Selecione ou clique para simular comando falado)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sampleCommands.map((cmd) => (
                      <button
                        key={cmd.action}
                        onClick={() => {
                          setVoiceTranscript(`Comando simulado: "${cmd.text}"`);
                          onVoiceCommandTrigger(cmd.action);
                        }}
                        className="text-left py-1 px-2 rounded bg-zinc-900 hover:bg-purple-900/30 text-[10px] text-zinc-400 hover:text-purple-300 border border-zinc-800 truncate transition-all"
                      >
                        🗣️ "{cmd.text}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
