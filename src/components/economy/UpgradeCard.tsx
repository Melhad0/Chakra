import React from 'react';
import Decimal from 'break_infinity.js';
import { TechniqueUpgrade, UpgradeCategory } from '../../types/upgrades';
import { formatBigNumber } from '../../engine/BigNumber';
import { IconRenderer } from '../common/IconRenderer';
import {
  Zap,
  Users,
  Flame,
  Shield,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface UpgradeCardProps {
  upgrade: TechniqueUpgrade;
  purchased: boolean;
  canAfford: boolean;
  currentChakra: Decimal;
  currentCPS?: Decimal;
  onBuy: (id: string) => void;
}

const CATEGORY_CONFIG: Record<
  UpgradeCategory,
  {
    label: string;
    badgeStyle: string;
    borderAffordable: string;
    borderMuted: string;
    avatarBg: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  taijutsu: {
    label: 'Taijutsu & Selos',
    badgeStyle: 'text-amber-400 border-amber-800/60 bg-amber-950/40',
    borderAffordable: 'hover:border-amber-500/60 bg-gradient-to-br from-amber-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-amber-950/40 border-amber-800/50 text-amber-300',
    icon: Zap,
  },
  ninjutsu: {
    label: 'Ninjutsu & Invocação',
    badgeStyle: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40',
    borderAffordable: 'hover:border-cyan-500/60 bg-gradient-to-br from-cyan-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300',
    icon: Users,
  },
  senjutsu: {
    label: 'Senjutsu & Formas',
    badgeStyle: 'text-fuchsia-400 border-fuchsia-800/60 bg-fuchsia-950/40',
    borderAffordable: 'hover:border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-fuchsia-950/40 border-fuchsia-800/50 text-fuchsia-300',
    icon: Flame,
  },
  fuinjutsu: {
    label: 'Fūinjutsu & Eficiência',
    badgeStyle: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40',
    borderAffordable: 'hover:border-emerald-500/60 bg-gradient-to-br from-emerald-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300',
    icon: Shield,
  },
};

function formatTimeToAfford(cost: Decimal, currentChakra: Decimal, totalCPS?: Decimal): string {
  if (currentChakra.gte(cost)) return 'Disponível';
  if (!totalCPS || totalCPS.lte(0)) return 'Sem CPS';
  const diff = cost.sub(currentChakra);
  const seconds = diff.div(totalCPS).toNumber();
  if (!isFinite(seconds) || seconds < 0) return 'Indisponível';
  if (seconds < 60) return `~${Math.ceil(seconds)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `~${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `~${hours}h ${mins}m`;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  purchased,
  canAfford,
  currentChakra,
  currentCPS,
  onBuy,
}) => {
  const cat = CATEGORY_CONFIG[upgrade.category] || CATEGORY_CONFIG.taijutsu;
  const CategoryIcon = cat.icon;

  const timeRemainingStr = formatTimeToAfford(upgrade.cost, currentChakra, currentCPS);

  return (
    <div
      onClick={() => {
        if (!purchased && canAfford) {
          onBuy(upgrade.id);
        }
      }}
      className={`relative backdrop-blur-md rounded-xl p-3 transition-all duration-200 flex flex-col justify-between border ${
        purchased
          ? 'bg-zinc-950/40 border-zinc-850/60 opacity-60'
          : canAfford
          ? `${cat.borderAffordable} border-zinc-800/90 shadow-sm hover:shadow-lg cursor-pointer active:scale-[0.99]`
          : 'bg-zinc-950/60 border-zinc-850/80 opacity-80'
      }`}
    >
      <div>
        {/* Top Header: Badge de Categoria & Indicador de Status */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 font-medium ${cat.badgeStyle}`}
          >
            <CategoryIcon className="w-3 h-3" />
            {cat.label}
          </span>

          {purchased ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" /> Dominado
            </span>
          ) : !canAfford ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800">
              <Clock className="w-3 h-3" /> {timeRemainingStr}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/50">
              Pronto para Aprender
            </span>
          )}
        </div>

        {/* Título, Ícone e Descrição */}
        <div className="flex items-start gap-2.5 mb-2">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${
              purchased
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                : cat.avatarBg
            }`}
          >
            <IconRenderer
              name={upgrade.icon || upgrade.id}
              className="w-4 h-4 stroke-[1.8]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-zinc-100 leading-tight truncate">
              {upgrade.name}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
              {upgrade.description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Preço e Ação de Compra */}
      <div className="pt-2 border-t border-zinc-850/80 flex items-center justify-between mt-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Custo:</span>
          <span
            className={`text-xs font-mono font-semibold ${
              purchased
                ? 'text-zinc-500 line-through'
                : canAfford
                ? 'text-amber-300'
                : 'text-rose-400'
            }`}
          >
            {formatBigNumber(upgrade.cost)}
          </span>
        </div>

        {!purchased && (
          <button
            disabled={!canAfford}
            onClick={(e) => {
              e.stopPropagation();
              onBuy(upgrade.id);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono font-medium transition-all flex items-center gap-1.5 border ${
              canAfford
                ? 'bg-gradient-to-r from-zinc-800 to-zinc-750 hover:from-cyan-950 hover:to-zinc-800 hover:border-cyan-500/60 hover:text-cyan-200 text-zinc-100 border-zinc-700 shadow-sm active:scale-95'
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
