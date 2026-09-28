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
  Lock,
} from 'lucide-react';

interface UpgradeCardProps {
  upgrade: TechniqueUpgrade;
  purchased: boolean;
  canAfford: boolean;
  currentChakra: Decimal;
  currentCPS?: Decimal;
  prerequisiteMet?: boolean;
  prerequisiteName?: string;
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
    label: 'Taijutsu',
    badgeStyle: 'text-amber-400 border-amber-800/60 bg-amber-950/40',
    borderAffordable: 'hover:border-amber-500/60 bg-gradient-to-br from-amber-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-amber-950/40 border-amber-800/50 text-amber-300',
    icon: Zap,
  },
  ninjutsu: {
    label: 'Ninjutsu',
    badgeStyle: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40',
    borderAffordable: 'hover:border-cyan-500/60 bg-gradient-to-br from-cyan-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300',
    icon: Users,
  },
  senjutsu: {
    label: 'Senjutsu',
    badgeStyle: 'text-fuchsia-400 border-fuchsia-800/60 bg-fuchsia-950/40',
    borderAffordable: 'hover:border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-fuchsia-950/40 border-fuchsia-800/50 text-fuchsia-300',
    icon: Flame,
  },
  fuinjutsu: {
    label: 'Fūinjutsu',
    badgeStyle: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40',
    borderAffordable: 'hover:border-emerald-500/60 bg-gradient-to-br from-emerald-950/15 via-zinc-900/70 to-zinc-900/40',
    borderMuted: 'border-zinc-850/60',
    avatarBg: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300',
    icon: Shield,
  },
};

const TIER_CONFIG: Record<
  1 | 2 | 3,
  { label: string; badgeStyle: string }
> = {
  1: {
    label: 'V1',
    badgeStyle: 'bg-zinc-800/90 text-zinc-300 border-zinc-700/80',
  },
  2: {
    label: 'V2',
    badgeStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70 shadow-sm shadow-cyan-950/40 font-semibold',
  },
  3: {
    label: 'V3',
    badgeStyle: 'bg-gradient-to-r from-amber-500/20 via-fuchsia-500/25 to-amber-500/20 text-amber-300 border-amber-500/70 shadow-md shadow-amber-950/40 font-bold',
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
  prerequisiteMet = true,
  prerequisiteName,
  onBuy,
}) => {
  const cat = CATEGORY_CONFIG[upgrade.category] || CATEGORY_CONFIG.taijutsu;
  const CategoryIcon = cat.icon;
  const tierConfig = upgrade.tier ? TIER_CONFIG[upgrade.tier] : null;

  const isLocked = !prerequisiteMet;
  const isBuyable = !purchased && canAfford && !isLocked;

  const timeRemainingStr = formatTimeToAfford(upgrade.cost, currentChakra, currentCPS);

  return (
    <div
      onClick={() => {
        if (isBuyable) {
          onBuy(upgrade.id);
        }
      }}
      className={`group/card relative backdrop-blur-xl rounded-xl p-3 transition-all duration-200 flex flex-col justify-between border overflow-hidden select-none ${
        purchased
          ? 'bg-zinc-950/40 border-zinc-850/60 opacity-60'
          : isLocked
          ? 'bg-zinc-950/70 border-zinc-850/90 opacity-75'
          : canAfford
          ? `${cat.borderAffordable} border-zinc-800/90 shadow-md hover:shadow-xl cursor-pointer active:scale-[0.99]`
          : 'bg-zinc-950/60 border-zinc-850/80 opacity-80 hover:opacity-95'
      }`}
    >
      {/* Linha de brilho superior no hover */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Top Header: Badge de Categoria, Tier & Indicador de Status */}
        <div className="flex items-center justify-between mb-2 gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 font-medium ${cat.badgeStyle}`}
            >
              <CategoryIcon className="w-3 h-3" />
              {cat.label}
            </span>

            {tierConfig && (
              <span
                className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border tracking-wider ${tierConfig.badgeStyle}`}
              >
                {tierConfig.label}
              </span>
            )}
          </div>

          {purchased ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" /> Dominado
            </span>
          ) : isLocked ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-850/60 flex-shrink-0">
              <Lock className="w-3 h-3" /> Bloqueado
            </span>
          ) : !canAfford ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800 flex-shrink-0">
              <Clock className="w-3 h-3" /> {timeRemainingStr}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/50 flex-shrink-0">
              Pronto
            </span>
          )}
        </div>

        {/* Título, Ícone e Descrição */}
        <div className="flex items-start gap-2.5 mb-2">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover/card:scale-105 ${
              purchased
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                : isLocked
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600'
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
            <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">
              {upgrade.description}
            </p>
          </div>
        </div>

        {/* Notificação de Pré-requisito Faltante */}
        {isLocked && prerequisiteName && (
          <div className="mt-1 mb-2 px-2 py-1 rounded-md bg-rose-950/30 border border-rose-800/40 flex items-center gap-1.5 text-[10px] text-rose-300 font-mono">
            <Lock className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <span className="truncate">Requer: {prerequisiteName}</span>
          </div>
        )}
      </div>

      {/* Footer: Preço e Ação de Compra */}
      <div className="pt-2 border-t border-zinc-850/80 flex items-center justify-between mt-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Custo:</span>
          <span
            className={`text-xs font-mono font-semibold ${
              purchased
                ? 'text-zinc-500 line-through'
                : canAfford && !isLocked
                ? 'text-amber-300'
                : 'text-rose-400'
            }`}
          >
            {formatBigNumber(upgrade.cost)}
          </span>
        </div>

        {!purchased && (
          <button
            disabled={!isBuyable}
            onClick={(e) => {
              e.stopPropagation();
              if (isBuyable) {
                onBuy(upgrade.id);
              }
            }}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer select-none active:scale-95 ${
              isLocked
                ? 'bg-zinc-900/60 border-zinc-800 text-rose-400/60 cursor-not-allowed'
                : canAfford
                ? 'bg-gradient-to-r from-zinc-800 via-zinc-750 to-zinc-800 hover:from-fuchsia-950 hover:to-zinc-800 hover:border-fuchsia-500/60 hover:text-fuchsia-200 text-zinc-100 border-zinc-700 shadow-sm'
                : 'bg-zinc-900/60 border-zinc-850 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3 h-3" />
                <span>Bloqueado</span>
              </>
            ) : (
              'Aprender'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

