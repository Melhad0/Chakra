import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { calculateTotalCPS } from '../../engine/formulas';
import { ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ViewHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'chakra' | 'production' | 'danger' | 'warning' | 'neutral' | 'cyan';
  icon?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'chakra',
  icon,
}) => {
  const setView = useGameStore((s) => s.setView);
  const chakra = useGameStore((s) => s.chakra);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const inventory = useGameStore((s) => s.inventory);
  const missionPermanentCpsMult = useGameStore((s) => s.missionPermanentCpsMult);
  const missionBuffTimer = useGameStore((s) => s.missionBuffTimer);
  const missionBuffMult = useGameStore((s) => s.missionBuffMult);

  const currentCPS = React.useMemo(() => {
    const missionMult = missionPermanentCpsMult * (missionBuffTimer > 0 ? missionBuffMult : 1);
    return calculateTotalCPS(
      generators,
      upgrades,
      clanNodes,
      gatesUnlocked,
      gatesActiveTimer > 0,
      exhaustionTimer > 0,
      {},
      onlinePresenceBuffTimer > 0,
      missionMult,
      inventory?.equippedArmor,
      inventory?.equippedWeapon,
      inventory?.unlockedElements,
      inventory?.elementalSacrificePenaltyMult,
      inventory?.isAvatarShinobi,
      inventory?.equippedGear
    );
  }, [
    generators,
    upgrades,
    clanNodes,
    gatesUnlocked,
    gatesActiveTimer,
    exhaustionTimer,
    onlinePresenceBuffTimer,
    missionPermanentCpsMult,
    missionBuffTimer,
    missionBuffMult,
    inventory,
  ]);

  return (
    <header className="relative h-16 px-4 lg:px-8 bg-zinc-950/85 backdrop-blur-2xl border-b border-zinc-850/80 flex items-center justify-between z-50 flex-shrink-0 select-none shadow-2xl">
      {/* Laser Neon Inferior Dinâmico */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 via-purple-500/50 to-transparent pointer-events-none" />

      {/* Extremo Esquerdo: Retornar à Aldeia */}
      <div className="flex items-center gap-3 relative z-10">
        <button
          onClick={() => setView('MAIN_COCKPIT')}
          className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-zinc-900/90 to-zinc-950/90 hover:from-zinc-850 hover:to-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-zinc-300 hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
          title="Retornar à Aldeia (Atalho: ESC)"
        >
          <div className="w-5 h-5 rounded-lg bg-zinc-800/80 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform duration-200" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            Retornar ao Cockpit
          </span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-950/90 border border-zinc-800 rounded group-hover:border-cyan-500/40">
            ESC
          </kbd>
        </button>
      </div>

      {/* Centro: Título da Funcionalidade com Glow e Ícone */}
      <div className="flex items-center gap-3 relative z-10">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900 border border-zinc-700/60 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] flex-shrink-0 animate-pulse-slow">
            {icon}
          </div>
        )}
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase font-sans drop-shadow-sm">
              {title}
            </h2>
            {badgeText && (
              <Badge variant={badgeVariant} dot>
                {badgeText}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Extremo Direito: Mini-HUD Consolidado em Tempo Real */}
      <div className="flex items-center gap-2 sm:gap-2.5 relative z-10">
        {/* Chakra Principal */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/40 px-3 py-1 rounded-xl text-right transition-colors shadow-inner">
          <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block leading-none">
            Chakra
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 leading-tight drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            {formatBigNumber(chakra)}
          </span>
        </div>

        {/* CPS */}
        <div className="hidden sm:block bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 px-3 py-1 rounded-xl text-right transition-colors shadow-inner">
          <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block leading-none">
            CPS
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 leading-tight flex items-center gap-1 justify-end drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
            +{formatBigNumber(currentCPS)}
          </span>
        </div>

        {/* Chakra Ancestral */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-purple-500/40 px-3 py-1 rounded-xl text-right transition-colors shadow-inner">
          <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block leading-none">
            Ancestral
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-purple-300 leading-tight flex items-center gap-1 justify-end drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-3 h-3 text-purple-400" />
            {chakraAncestral.toString()}
          </span>
        </div>
      </div>
    </header>
  );
};
