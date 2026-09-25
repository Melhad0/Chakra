import React from 'react';
import Decimal from 'break_infinity.js';
import { TechniqueUpgrade, UpgradeCategory } from '../../types/upgrades';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  Zap,
  Sparkles,
  HandMetal,
  Users,
  TrendingUp,
  Flame,
  Shield,
  Coins,
  Percent,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface UpgradeCardProps {
  upgrade: TechniqueUpgrade;
  purchased: boolean;
  canAfford: boolean;
  currentChakra: Decimal;
  onBuy: (id: string) => void;
}

const CATEGORY_CONFIG: Record<
  UpgradeCategory,
  {
    label: string;
    badgeStyle: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  taijutsu: {
    label: 'Taijutsu & Selos',
    badgeStyle: 'text-amber-400 border-amber-800/60 bg-amber-950/30',
    icon: Zap,
  },
  ninjutsu: {
    label: 'Ninjutsu & Invocação',
    badgeStyle: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/30',
    icon: Users,
  },
  senjutsu: {
    label: 'Senjutsu & Formas',
    badgeStyle: 'text-fuchsia-400 border-fuchsia-800/60 bg-fuchsia-950/30',
    icon: Flame,
  },
  fuinjutsu: {
    label: 'Fūinjutsu & Eficiência',
    badgeStyle: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/30',
    icon: Shield,
  },
};

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  purchased,
  canAfford,
  onBuy,
}) => {
  const cat = CATEGORY_CONFIG[upgrade.category] || CATEGORY_CONFIG.taijutsu;
  const CategoryIcon = cat.icon;

  // Renderização específica de ícone visual da técnica
  const renderTechniqueIcon = () => {
    switch (upgrade.category) {
      case 'taijutsu':
        if (upgrade.id === 'reaper_seal' || upgrade.id === 'night_guy') {
          return <HandMetal className="w-4 h-4 text-amber-400 stroke-[1.75]" />;
        }
        return <Zap className="w-4 h-4 text-amber-300 stroke-[1.75]" />;
      case 'ninjutsu':
        if (upgrade.id === 'fire_ball_jutsu' || upgrade.id === 'water_dragon') {
          return <TrendingUp className="w-4 h-4 text-cyan-400 stroke-[1.75]" />;
        }
        return <Users className="w-4 h-4 text-cyan-300 stroke-[1.75]" />;
      case 'senjutsu':
        if (upgrade.id === 'sage_mode' || upgrade.id === 'six_paths_senjutsu') {
          return <Sparkles className="w-4 h-4 text-fuchsia-400 stroke-[1.75]" />;
        }
        return <Flame className="w-4 h-4 text-fuchsia-300 stroke-[1.75]" />;
      case 'fuinjutsu':
        if (upgrade.id === 'chakra_concentration' || upgrade.id === 'karma_seal') {
          return <Percent className="w-4 h-4 text-emerald-400 stroke-[1.75]" />;
        }
        if (upgrade.id === 'tactical_kunai' || upgrade.id === 'adamantine_chains') {
          return <Coins className="w-4 h-4 text-emerald-300 stroke-[1.75]" />;
        }
        return <Shield className="w-4 h-4 text-emerald-400 stroke-[1.75]" />;
    }
  };

  return (
    <div
      className={`relative backdrop-blur-md rounded-xl p-3 transition-all flex flex-col justify-between border ${
        purchased
          ? 'bg-zinc-950/40 border-zinc-850/60 opacity-60'
          : canAfford
          ? 'bg-zinc-900/60 border-zinc-800 hover:border-cyan-500/40 shadow-sm hover:shadow-cyan-950/20'
          : 'bg-zinc-950/60 border-zinc-850 opacity-80'
      }`}
    >
      <div>
        {/* Top Header: Badge de Categoria & Indicador de Status */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${cat.badgeStyle}`}
          >
            <CategoryIcon className="w-3 h-3" />
            {cat.label}
          </span>

          {purchased ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" /> Dominado
            </span>
          ) : !canAfford ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
              <Lock className="w-3 h-3" /> Bloqueado
            </span>
          ) : null}
        </div>

        {/* Título & Descrição */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-850/80 border border-zinc-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
            {renderTechniqueIcon()}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-zinc-100 leading-tight truncate">
              {upgrade.name}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
              {upgrade.description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Preço Formatado via formatBigNumber & Ação de Compra */}
      <div className="pt-2 border-t border-zinc-850/80 flex items-center justify-between mt-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Custo:</span>
          <span
            className={`text-xs font-mono font-semibold ${
              purchased
                ? 'text-zinc-500 line-through'
                : canAfford
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {formatBigNumber(upgrade.cost)}
          </span>
        </div>

        {!purchased && (
          <button
            disabled={!canAfford}
            onClick={() => onBuy(upgrade.id)}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition flex items-center gap-1.5 border ${
              canAfford
                ? 'bg-zinc-800 hover:bg-cyan-950/80 hover:border-cyan-500/50 hover:text-cyan-200 text-zinc-200 border-zinc-700 shadow-sm active:scale-95'
                : 'bg-zinc-900/60 border-zinc-850 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Aprender
          </button>
        )}
      </div>
    </div>
  );
};
