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
      color: 'text-amber-400 border-amber-500 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      threshold: 100,
      condition: (pts) => pts >= 101,
    },
    {
      id: 'prata',
      name: 'Inovador de Prata',
      requirement: 'Acumular mais de 300 pontos',
      description: 'Mostrou grande dedicação e proatividade sugerindo novas ideias.',
      icon: Medal,
      color: 'text-slate-200 border-slate-300 bg-slate-400/30 shadow-[0_0_12px_rgba(226,232,240,0.4)]',
      threshold: 300,
      condition: (pts) => pts >= 301,
    },
    {
      id: 'ouro',
      name: 'Inovador de Ouro',
      requirement: 'Acumular mais de 500 pontos',
      description: 'Alta relevância técnica e atitude engajada na melhoria operacional Firjan.',
      icon: Trophy,
      color: 'text-yellow-300 border-yellow-400 bg-yellow-400/25 shadow-[0_0_12px_rgba(234,179,8,0.5)]',
      threshold: 500,
      condition: (pts) => pts >= 501,
    },
    {
      id: 'diamante',
      name: 'Elite de Diamante',
      requirement: 'Acumular mais de 1000 pontos',
      description: 'Liderança suprema! Um verdadeiro impulsionador de eficiência corporativa.',
      icon: Sparkles,
      color: 'text-cyan-300 border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]',
      threshold: 1000,
      condition: (pts) => pts >= 1001,
    },
    {
      id: 'onboarding_master',
      name: 'Onboarding Expert',
      requirement: 'Concluir o onboarding ou ter 200 pts',
      description: 'Dominou todas as diretrizes institucionais, operacionais e de segurança (LGPD).',
      icon: ShieldCheck,
      color: 'text-purple-300 border-purple-400 bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
      threshold: 200,
      condition: (pts, bdg) => bdg.includes('Onboarding Completo') || pts >= 200,
    },
    {
      id: 'colaborador_ativo',
      name: 'Social Guru',
      requirement: 'Ter o selo ativo ou mais de 400 pts',
      description: 'Sua voz ajuda a polir novas propostas comentando e interagindo nas ideias.',
      icon: Flame,
      color: 'text-pink-400 border-pink-400 bg-pink-500/20 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
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
                className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center transition-all duration-300 relative cursor-pointer ${
                  isUnlocked
                    ? `${medal.color} hover:scale-115 shadow-md hover:brightness-110`
                    : `${medal.color} opacity-50 saturate-75 border-zinc-700/60 hover:opacity-100 hover:saturate-100 hover:scale-110`
                }`}
              >
                <IconComp className="w-4 h-4" />
                {!isUnlocked && (
                  <div className="absolute -bottom-1 -right-1 bg-zinc-950 border border-zinc-800 rounded-full p-[1px] text-yellow-500 scale-75 animate-bounce-subtle">
                    <Lock className="w-2 h-2" />
                  </div>
                )}
              </div>

              {/* Enhanced Interactive Tooltip */}
              {hoveredId === medal.id && (
                <div className="absolute z-50 bottom-9 left-1/2 -translate-x-1/2 w-52 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-zinc-800/80 animate-in fade-in zoom-in duration-150 pointer-events-none text-left">
                  <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-950 border-r border-b border-zinc-800" />
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1">
                      <IconComp className={`w-4 h-4 ${medal.color.split(' ')[0]}`} />
                      <h4 className="text-[10px] font-extrabold text-white leading-none tracking-wide">
                        {medal.name}
                      </h4>
                    </div>
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase ${
                        isUnlocked
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-zinc-900 text-yellow-500 border border-yellow-500/20'
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
