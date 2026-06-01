import React, { useState } from 'react';
import { Award, Trophy, ShieldCheck, Sparkles, Medal, Flame, Lock } from 'lucide-react';

interface MedalDetails {
  id: string;
  name: string;
  requirement: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  threshold: number;
  condition: (points: number, badges: string[]) => boolean;
}

export default function UserMedals({ points, badges = [] }: { points: number; badges?: string[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const listMedals: MedalDetails[] = [
    {
      id: 'bronze',
      name: 'Inovador de Bronze',
      requirement: 'Acumular mais de 100 pontos',
      description: 'Você iniciou a sua trajetória de inovação no ecossistema Firjan!',
      icon: Award,
      color: 'text-amber-600 border-amber-500/30 bg-amber-950/10 shadow-amber-600/10',
      threshold: 100,
      condition: (pts) => pts >= 101,
    },
    {
      id: 'prata',
      name: 'Inovador de Prata',
      requirement: 'Acumular mais de 300 pontos',
      description: 'Mostrou grande dedicação e proatividade sugerindo novas ideias.',
      icon: Medal,
      color: 'text-slate-400 border-slate-350/30 bg-slate-900/10 shadow-slate-400/10',
      threshold: 300,
      condition: (pts) => pts >= 301,
    },
    {
      id: 'ouro',
      name: 'Inovador de Ouro',
      requirement: 'Acumular mais de 500 pontos',
      description: 'Alta relevância técnica e atitude engajada na melhoria operacional Firjan.',
      icon: Trophy,
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/10 shadow-yellow-400/10',
      threshold: 500,
      condition: (pts) => pts >= 501,
    },
    {
      id: 'diamante',
      name: 'Elite de Diamante',
      requirement: 'Acumular mais de 1000 pontos',
      description: 'Liderança suprema! Um verdadeiro impulsionador de eficiência corporativa.',
      icon: Sparkles,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/10 shadow-cyan-400/10',
      threshold: 1000,
      condition: (pts) => pts >= 1001,
    },
    {
      id: 'onboarding_master',
      name: 'Onboarding Expert',
      requirement: 'Concluir o onboarding ou ter 200 pts',
      description: 'Dominou todas as diretrizes institucionais, operacionais e de segurança (LGPD).',
      icon: ShieldCheck,
      color: 'text-purple-400 border-purple-500/30 bg-purple-950/10 shadow-purple-400/10',
      threshold: 200,
      condition: (pts, bdg) => bdg.includes('Onboarding Completo') || pts >= 200,
    },
    {
      id: 'colaborador_ativo',
      name: 'Social Guru',
      requirement: 'Ter o selo ativo ou mais de 400 pts',
      description: 'Sua voz ajuda a polir novas propostas comentando e interagindo nas ideias.',
      icon: Flame,
      color: 'text-pink-500 border-pink-500/30 bg-pink-950/10 shadow-pink-500/10',
      threshold: 400,
      condition: (pts, bdg) => bdg.includes('Colaborador Ativo') || bdg.includes('Inovador Ativo') || pts >= 400,
    },
  ];

  return (
    <div className="pt-2.5 border-t border-zinc-900/80">
      <span className="text-[7.5px] uppercase font-bold text-zinc-600 block mb-1.5 font-mono tracking-wider">
        CONQUISTAS E MEDALHAS DINÂMICAS:
      </span>
      <div className="grid grid-cols-6 gap-2">
        {listMedals.map((medal) => {
          const isUnlocked = medal.condition(points, badges);
          const IconComp = medal.icon;

          return (
            <div
              key={medal.id}
              className="relative flex justify-center items-center"
              onMouseEnter={() => setHoveredId(medal.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Individual Medal Circle */}
              <div
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 relative ${
                  isUnlocked
                    ? `${medal.color} cursor-pointer hover:scale-110 shadow-sm hover:brightness-110`
                    : 'text-zinc-700 bg-zinc-950/40 border-zinc-900/40 opacity-40 select-none'
                }`}
              >
                <IconComp className="w-4 h-4" />
                {!isUnlocked && (
                  <div className="absolute -bottom-1 -right-1 bg-zinc-950 border border-zinc-800 rounded-full p-[1px] text-zinc-600 scale-75">
                    <Lock className="w-2 h-2" />
                  </div>
                )}
              </div>

              {/* Enhanced Interactive Tooltip */}
              {hoveredId === medal.id && (
                <div className="absolute z-50 bottom-9 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-150 pointer-events-none text-left">
                  <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-900 border-r border-b border-zinc-800" />
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1">
                      <IconComp className={`w-3.5 h-3.5 ${isUnlocked ? medal.color.split(' ')[0] : 'text-zinc-600'}`} />
                      <h4 className="text-[10px] font-extrabold text-white leading-none tracking-wide">
                        {medal.name}
                      </h4>
                    </div>
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase ${
                        isUnlocked
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-750'
                      }`}
                    >
                      {isUnlocked ? '✓ DESBLOQUEADO' : '🔒 BLOQUEADO'}
                    </span>
                    <p className="text-[9px] text-zinc-300 mt-1.5 leading-snug">
                      {medal.description}
                    </p>
                    <p className="text-[8px] text-yellow-500/90 font-mono mt-1 pt-1 border-t border-zinc-850">
                      Requisito: {medal.requirement}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
