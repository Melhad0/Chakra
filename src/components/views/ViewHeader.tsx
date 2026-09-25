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
      inventory?.isAvatarShinobi
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
    <header className="h-16 px-4 lg:px-8 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between z-50 flex-shrink-0 select-none">
      {/* Extremo Esquerdo: Retornar à Aldeia */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('MAIN_COCKPIT')}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition shadow-sm cursor-pointer"
          title="Retornar à Aldeia (Atalho: ESC)"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2] group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            Retornar à Aldeia
          </span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-950/80 border border-zinc-800 rounded">
            ESC
          </kbd>
        </button>
      </div>

      {/* Centro: Título da Funcionalidade */}
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            {icon}
          </div>
        )}
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-zinc-100 uppercase font-sans">
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
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Chakra */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 px-2.5 sm:px-3 py-1 rounded-lg text-right">
          <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block leading-none">
            Chakra
          </span>
          <span className="text-xs sm:text-sm font-mono font-medium text-orange-400 leading-tight">
            {formatBigNumber(chakra)}
          </span>
        </div>

        {/* CPS */}
        <div className="hidden sm:block bg-zinc-900/50 border border-zinc-800/80 px-3 py-1 rounded-lg text-right">
          <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block leading-none">
            CPS
          </span>
          <span className="text-xs sm:text-sm font-mono font-medium text-emerald-400 leading-tight flex items-center gap-1 justify-end">
            <Zap className="w-3 h-3 text-emerald-400" />
            +{formatBigNumber(currentCPS)}
          </span>
        </div>

        {/* Chakra Ancestral */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 px-2.5 sm:px-3 py-1 rounded-lg text-right">
          <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block leading-none">
            Ancestral
          </span>
          <span className="text-xs sm:text-sm font-mono font-medium text-purple-400 leading-tight flex items-center gap-1 justify-end">
            <Sparkles className="w-3 h-3 text-purple-400" />
            {chakraAncestral.toString()}
          </span>
        </div>
      </div>
    </header>
  );
};
