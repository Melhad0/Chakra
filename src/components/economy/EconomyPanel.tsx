import React, { useState, useMemo } from 'react';
import Decimal from 'break_infinity.js';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  getBulkCost,
  getBulkSellRefund,
  getMaxBuyable,
  getSingleGeneratorCost,
  getGeneratorCostDiscount,
  calculateTotalCPS,
} from '../../engine/formulas';
import { getGeneratorMilestoneEffects, TECHNIQUE_UPGRADES } from '../../constants/upgrades';
import { QuantitySelector } from '../common/QuantitySelector';
import { IconRenderer } from '../common/IconRenderer';
import { UpgradesList } from './UpgradesList';
import { TroopTierCategory } from '../../types/economy';
import {
  Users,
  Sparkles,
  Award,
  PanelLeftClose,
  Search,
  Clock,
  TrendingUp,
  Filter,
  X,
  Store,
  Coins,
  Shield,
  Zap,
  Flame,
  Orbit,
  Crown,
} from 'lucide-react';

const TIER_CONFIG: Record<
  TroopTierCategory,
  {
    label: string;
    badgeStyle: string;
    borderAffordable: string;
    borderMuted: string;
    avatarBg: string;
    pillActive: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }
> = {
  INICIANTE: {
    label: 'Iniciante',
    badgeStyle: 'text-emerald-400 bg-emerald-950/50 border-emerald-700/60 shadow-sm shadow-emerald-950/40',
    borderAffordable: 'hover:border-emerald-500/60 bg-gradient-to-br from-emerald-950/20 via-zinc-900/80 to-zinc-950/70 hover:shadow-lg hover:shadow-emerald-950/30',
    borderMuted: 'border-zinc-850/80 bg-zinc-950/60',
    avatarBg: 'bg-emerald-950/60 border-emerald-650 text-emerald-300 shadow-inner',
    pillActive: 'bg-emerald-950/80 text-emerald-300 border-emerald-550 shadow-sm shadow-emerald-950/60',
    icon: Shield,
    accentColor: '#10b981',
  },
  ELITE: {
    label: 'Elite',
    badgeStyle: 'text-cyan-400 bg-cyan-950/50 border-cyan-700/60 shadow-sm shadow-cyan-950/40',
    borderAffordable: 'hover:border-cyan-500/60 bg-gradient-to-br from-cyan-950/20 via-zinc-900/80 to-zinc-950/70 hover:shadow-lg hover:shadow-cyan-950/30',
    borderMuted: 'border-zinc-850/80 bg-zinc-950/60',
    avatarBg: 'bg-cyan-950/60 border-cyan-650 text-cyan-300 shadow-inner',
    pillActive: 'bg-cyan-950/80 text-cyan-300 border-cyan-550 shadow-sm shadow-cyan-950/60',
    icon: Zap,
    accentColor: '#06b6d4',
  },
  LENDARIO: {
    label: 'Lendário',
    badgeStyle: 'text-amber-400 bg-amber-950/50 border-amber-700/60 shadow-sm shadow-amber-950/40',
    borderAffordable: 'hover:border-amber-500/60 bg-gradient-to-br from-amber-950/20 via-zinc-900/80 to-zinc-950/70 hover:shadow-lg hover:shadow-amber-950/30',
    borderMuted: 'border-zinc-850/80 bg-zinc-950/60',
    avatarBg: 'bg-amber-950/60 border-amber-650 text-amber-300 shadow-inner',
    pillActive: 'bg-amber-950/80 text-amber-300 border-amber-550 shadow-sm shadow-amber-950/60',
    icon: Flame,
    accentColor: '#f59e0b',
  },
  COSMICO: {
    label: 'Cósmico',
    badgeStyle: 'text-purple-400 bg-purple-950/50 border-purple-700/60 shadow-sm shadow-purple-950/40',
    borderAffordable: 'hover:border-purple-500/60 bg-gradient-to-br from-purple-950/20 via-zinc-900/80 to-zinc-950/70 hover:shadow-lg hover:shadow-purple-950/30',
    borderMuted: 'border-zinc-850/80 bg-zinc-950/60',
    avatarBg: 'bg-purple-950/60 border-purple-650 text-purple-300 shadow-inner',
    pillActive: 'bg-purple-950/80 text-purple-300 border-purple-550 shadow-sm shadow-purple-950/60',
    icon: Orbit,
    accentColor: '#a855f7',
  },
  DIVINO: {
    label: 'Divino',
    badgeStyle: 'text-rose-400 bg-rose-950/50 border-rose-700/60 shadow-sm shadow-rose-950/40 font-bold',
    borderAffordable: 'hover:border-rose-500/60 bg-gradient-to-br from-rose-950/25 via-zinc-900/80 to-zinc-950/70 hover:shadow-lg hover:shadow-rose-950/30',
    borderMuted: 'border-zinc-850/80 bg-zinc-950/60',
    avatarBg: 'bg-rose-950/60 border-rose-650 text-rose-300 shadow-inner',
    pillActive: 'bg-rose-950/80 text-rose-300 border-rose-550 shadow-sm shadow-rose-950/60',
    icon: Crown,
    accentColor: '#f43f5e',
  },
};

function formatTimeToAfford(cost: Decimal, currentChakra: Decimal, totalCPS: Decimal): string {
  if (currentChakra.gte(cost)) return 'Disponível';
  if (totalCPS.lte(0)) return 'Sem CPS';
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

export const EconomyPanel: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const claimedRankRewards = useGameStore((s) => s.claimedRankRewards);
  const shopMode = useGameStore((s) => s.shopMode);
  const shopQty = useGameStore((s) => s.shopQty);
  const setShopMode = useGameStore((s) => s.setShopMode);
  const setShopQty = useGameStore((s) => s.setShopQty);
  const buyGenerator = useGameStore((s) => s.buyGenerator);
  const toggleLeftSidebar = useGameStore((s) => s.toggleLeftSidebar);

  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const inventory = useGameStore((s) => s.inventory);
  const missionPermanentCpsMult = useGameStore((s) => s.missionPermanentCpsMult);
  const missionBuffTimer = useGameStore((s) => s.missionBuffTimer);
  const missionBuffMult = useGameStore((s) => s.missionBuffMult);

  const [panelView, setPanelView] = useState<'generators' | 'upgrades'>('generators');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<TroopTierCategory | 'all'>('all');
  const [onlyAffordable, setOnlyAffordable] = useState(false);

  // CPS Total em tempo real
  const currentCPS = useMemo(() => {
    const missionMult = missionPermanentCpsMult * (missionBuffTimer > 0 ? missionBuffMult : 1);
    return calculateTotalCPS(
      generators,
      upgrades,
      clanNodes,
      gatesUnlocked,
      gatesActiveTimer > 0,
      exhaustionTimer > 0,
      claimedRankRewards,
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
    claimedRankRewards,
    onlinePresenceBuffTimer,
    missionPermanentCpsMult,
    missionBuffTimer,
    missionBuffMult,
    inventory,
  ]);

  const generatorKeys = useMemo(() => Object.keys(generators), [generators]);

  // Contadores globais de tropas
  const totalTroopsRecruited = useMemo(() => {
    return Object.values(generators).reduce((acc, g) => acc + g.level, 0);
  }, [generators]);

  // Contadores de Upgrades
  const masteredUpgradesCount = useMemo(() => {
    return Object.keys(upgrades).filter((k) => upgrades[k]).length;
  }, [upgrades]);

  // Filtragem e busca reativa de tropas
  const filteredGeneratorKeys = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return generatorKeys.filter((key) => {
      const gen = generators[key];
      if (!gen) return false;

      // Filtro de Tier
      if (selectedTier !== 'all' && gen.tierCategory !== selectedTier) {
        return false;
      }

      // Filtro de busca textual
      if (query) {
        const matchName = gen.name.toLowerCase().includes(query);
        const matchLore = gen.lore ? gen.lore.toLowerCase().includes(query) : false;
        const matchTier = gen.tierCategory ? gen.tierCategory.toLowerCase().includes(query) : false;
        if (!matchName && !matchLore && !matchTier) return false;
      }

      // Filtro de viabilidade (apenas compráveis)
      if (onlyAffordable && shopMode === 'buy') {
        const discount = getGeneratorCostDiscount(key, gen.level, upgrades, claimedRankRewards);
        let effectiveQty: number = typeof shopQty === 'number' ? shopQty : 1;
        if (shopQty === 'max') {
          const maxBuyable = getMaxBuyable(gen.baseCost, gen.level, chakra, discount);
          if (maxBuyable <= 0) return false;
          effectiveQty = maxBuyable;
        }
        const cost = getBulkCost(gen.baseCost, gen.level, effectiveQty, discount);
        if (chakra.lt(cost)) return false;
      }

      return true;
    });
  }, [generatorKeys, generators, searchQuery, selectedTier, onlyAffordable, shopMode, shopQty, chakra, upgrades, claimedRankRewards]);

  return (
    <aside className="relative h-full bg-gradient-to-b from-zinc-900/90 via-zinc-925/70 to-zinc-950/95 backdrop-blur-2xl border border-zinc-800/90 hover:border-cyan-500/40 transition-all duration-300 rounded-2xl p-3.5 flex flex-col overflow-hidden shadow-2xl shadow-black/60 group/panel">
      {/* Luz ambiente de fundo (Glow estético Dark Glassmorphic) */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Linha decorativa de neon sutil no topo do card */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Header Superior: Identidade da Loja Shinobi e Alternância de Abas */}
      <div className="pb-3 border-b border-zinc-800/80 flex-shrink-0 relative z-10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Título da Loja */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-zinc-900 to-amber-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-950/40 flex-shrink-0">
              <Store className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-zinc-100 tracking-wider uppercase truncate">
                  Loja Shinobi
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold tracking-wider">
                  MERCADO
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono block truncate">
                Recrutamento & Jutsus
              </span>
            </div>
          </div>

          {/* Botão de Recolher Sidebar */}
          <button
            onClick={toggleLeftSidebar}
            title="Recolher Painel de Tropas (Sidebar Toggle)"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700/80 transition cursor-pointer active:scale-95 flex-shrink-0"
          >
            <PanelLeftClose className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Chip de Chakra em Mão (Saldo Dinâmico do Ninja na Loja) */}
        <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-950/60 to-zinc-950/60 border border-amber-800/50 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse stroke-[2.2]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Chakra Disponível
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 tracking-tight">
            {formatBigNumber(chakra)}
          </span>
        </div>

        {/* Seletor de Painel: Tropas / Técnicas */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-950/90 p-1 rounded-xl border border-zinc-800/80 shadow-inner">
          <button
            onClick={() => setPanelView('generators')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              panelView === 'generators'
                ? 'bg-gradient-to-r from-zinc-800 to-zinc-750 text-cyan-300 shadow-md border border-cyan-500/40 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400 stroke-[2]" />
            <span>Tropas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 border border-zinc-750 text-zinc-300 font-mono">
              {generatorKeys.length}
            </span>
          </button>

          <button
            onClick={() => setPanelView('upgrades')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              panelView === 'upgrades'
                ? 'bg-gradient-to-r from-zinc-800 to-zinc-750 text-fuchsia-300 shadow-md border border-fuchsia-500/40 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 stroke-[2]" />
            <span>Técnicas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 border border-zinc-750 text-zinc-300 font-mono">
              {masteredUpgradesCount}/{TECHNIQUE_UPGRADES.length}
            </span>
          </button>
        </div>

        {/* Dashboard de Métricas Rápidas ao Vivo */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-850/80 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">CPS Ativo</span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              +{formatBigNumber(currentCPS)}
            </span>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-850/80 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Recrutas</span>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-300">
              {totalTroopsRecruited.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Controles de Lote e Filtros Dinâmicos (Ativos no painel de Tropas) */}
        {panelView === 'generators' && (
          <div className="space-y-2 pt-0.5">
            <QuantitySelector
              mode={shopMode}
              qty={shopQty}
              onModeChange={setShopMode}
              onQtyChange={setShopQty}
            />

            {/* Barra de Busca e Filtro de Viabilidade */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tropa, clã ou lore..."
                  className="w-full pl-8 pr-7 py-1 text-xs bg-zinc-950/70 border border-zinc-800/80 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setOnlyAffordable(!onlyAffordable)}
                title={onlyAffordable ? 'Mostrando apenas tropas viáveis' : 'Mostrar todas as tropas'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition border cursor-pointer ${
                  onlyAffordable
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/70 shadow-sm shadow-emerald-950/50'
                    : 'bg-zinc-950/50 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:bg-zinc-900'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>Viáveis</span>
              </button>
            </div>

            {/* Seletor de Tiers / Categorias com Ícones */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
              <button
                onClick={() => setSelectedTier('all')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition border whitespace-nowrap cursor-pointer ${
                  selectedTier === 'all'
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-650 shadow-sm'
                    : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border-zinc-850'
                }`}
              >
                Todas ({generatorKeys.length})
              </button>
              {(Object.keys(TIER_CONFIG) as TroopTierCategory[]).map((tierKey) => {
                const conf = TIER_CONFIG[tierKey];
                const TierIcon = conf.icon;
                const isActive = selectedTier === tierKey;
                const count = generatorKeys.filter((k) => generators[k]?.tierCategory === tierKey).length;
                return (
                  <button
                    key={tierKey}
                    onClick={() => setSelectedTier(tierKey)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition border whitespace-nowrap cursor-pointer ${
                      isActive
                        ? conf.pillActive
                        : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border-zinc-850 hover:bg-zinc-900'
                    }`}
                  >
                    <TierIcon className="w-2.5 h-2.5" />
                    <span>{conf.label}</span>
                    <span className="font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo Central: Lista de Geradores ou Matriz de Técnicas */}
      <div className="flex-1 overflow-hidden mt-2 relative z-10">
        {panelView === 'upgrades' ? (
          <UpgradesList />
        ) : (
          <div className="h-full overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {filteredGeneratorKeys.length === 0 ? (
              <div className="py-12 text-center bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800/80">
                <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-xs text-zinc-400 font-medium">Nenhuma tropa encontrada com esses filtros.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTier('all');
                    setOnlyAffordable(false);
                  }}
                  className="mt-2 text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              filteredGeneratorKeys.map((key) => {
                const gen = generators[key];
                const discount = getGeneratorCostDiscount(
                  key,
                  gen.level,
                  upgrades,
                  claimedRankRewards
                );
                const milestone = getGeneratorMilestoneEffects(gen.level);

                let effectiveQty = 1;
                let cost = new Decimal(0);
                let canAfford = false;

                if (shopMode === 'buy') {
                  if (shopQty === 'max') {
                    const maxBuyable = getMaxBuyable(gen.baseCost, gen.level, chakra, discount);
                    if (maxBuyable > 0) {
                      effectiveQty = maxBuyable;
                      cost = getBulkCost(gen.baseCost, gen.level, effectiveQty, discount);
                      canAfford = true;
                    } else {
                      effectiveQty = 1;
                      cost = getSingleGeneratorCost(gen.baseCost, gen.level, discount);
                      canAfford = false;
                    }
                  } else {
                    effectiveQty = shopQty;
                    cost = getBulkCost(gen.baseCost, gen.level, effectiveQty, discount);
                    canAfford = chakra.gte(cost) && effectiveQty > 0;
                  }
                } else {
                  // Venda
                  effectiveQty = shopQty === 'max' ? Math.max(1, gen.level) : Math.min(shopQty, Math.max(1, gen.level));
                  cost = getBulkSellRefund(gen.baseCost, gen.level, effectiveQty, discount);
                  canAfford = gen.level > 0;
                }

                // Contribuição específica desta tropa para o CPS total
                const genCurrentCPS = gen.baseCPS.mul(gen.level).mul(milestone.cpsMultiplier);
                const sharePercent =
                  currentCPS.gt(0) && gen.level > 0
                    ? Math.min(100, Math.max(0, genCurrentCPS.div(currentCPS).mul(100).toNumber()))
                    : 0;

                // Tempo estimado para conseguir comprar
                const timeToAffordStr = formatTimeToAfford(cost, chakra, currentCPS);

                // Cálculo de Progresso para o próximo marco (Tier Milestone)
                let milestoneProgress = 100;
                let prevLevel = 0;
                if (milestone.nextMilestoneLevel) {
                  if (milestone.nextMilestoneLevel === 25) prevLevel = 0;
                  else if (milestone.nextMilestoneLevel === 50) prevLevel = 25;
                  else if (milestone.nextMilestoneLevel === 100) prevLevel = 50;
                  else if (milestone.nextMilestoneLevel === 200) prevLevel = 100;
                  else if (milestone.nextMilestoneLevel === 300) prevLevel = 200;
                  else if (milestone.nextMilestoneLevel === 500) prevLevel = 300;

                  const range = milestone.nextMilestoneLevel - prevLevel;
                  const current = Math.max(0, gen.level - prevLevel);
                  milestoneProgress = Math.min(100, Math.floor((current / range) * 100));
                }

                const tierConf = gen.tierCategory
                  ? TIER_CONFIG[gen.tierCategory]
                  : TIER_CONFIG.INICIANTE;
                const TierIcon = tierConf.icon;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (canAfford) {
                        buyGenerator(key);
                      }
                    }}
                    className={`group/card p-3 rounded-xl border transition-all duration-200 flex flex-col gap-2 select-none relative overflow-hidden ${
                      canAfford
                        ? `${tierConf.borderAffordable} border-zinc-800/90 text-zinc-100 hover:shadow-xl active:scale-[0.99] cursor-pointer`
                        : `${tierConf.borderMuted} opacity-60 text-zinc-400 cursor-not-allowed`
                    }`}
                  >
                    {/* Linha de brilho superior no hover */}
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                    {/* Header do Card da Tropa */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar do Shinobi com borda e badge temático */}
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover/card:scale-105 ${tierConf.avatarBg}`}
                        >
                          <IconRenderer name={gen.avatar} className="w-5 h-5 stroke-[1.8]" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-semibold text-zinc-100 truncate tracking-tight">
                              {gen.name}
                            </h3>

                            {/* Badge do Tier */}
                            <span
                              className={`text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.2 rounded border flex items-center gap-1 ${tierConf.badgeStyle}`}
                            >
                              <TierIcon className="w-2.5 h-2.5" />
                              {tierConf.label}
                            </span>

                            {/* Badge de Marco (Milestone) */}
                            {gen.level >= 25 && (
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${milestone.badgeColor}`}
                              >
                                <Award className="w-2.5 h-2.5" />
                                {milestone.tierName} ({milestone.cpsMultiplier.toString()}x)
                              </span>
                            )}
                          </div>

                          {/* Lore poético do Shinobi */}
                          {gen.lore && (
                            <p className="text-[10px] text-zinc-400/90 italic truncate mt-0.5 max-w-[240px]">
                              {gen.lore}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contador de Nível */}
                      <div className="text-right flex-shrink-0 flex flex-col items-end">
                        <span className="text-xs font-mono font-bold text-zinc-200 px-2 py-0.5 rounded-lg bg-zinc-950/80 border border-zinc-700/80 shadow-sm">
                          Nv. {gen.level}
                        </span>
                        {sharePercent > 0 && (
                          <span className="text-[9px] font-mono text-cyan-400/90 mt-1 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />
                            {sharePercent.toFixed(1)}% do CPS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Linha de Produção & Custo Dinâmico */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-medium">
                          +{formatBigNumber(gen.baseCPS.mul(milestone.cpsMultiplier))} CPS
                        </span>
                        {gen.level > 0 && (
                          <span className="text-zinc-500 text-[10px]">
                            (Total: +{formatBigNumber(genCurrentCPS)})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400 text-[10px]">
                          {shopMode === 'buy'
                            ? shopQty === 'max' && effectiveQty > 0 && canAfford
                              ? `Custo (x${effectiveQty}):`
                              : 'Custo:'
                            : 'Reembolso:'}
                        </span>
                        <span
                          className={`font-semibold ${
                            canAfford ? 'text-amber-300' : 'text-rose-400'
                          }`}
                        >
                          {formatBigNumber(cost)}
                        </span>

                        {shopMode === 'buy' && !canAfford && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-amber-400/90 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {timeToAffordStr}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barra de Progresso de Marco (Tier Milestone) */}
                    {milestone.nextMilestoneLevel && (
                      <div className="pt-0.5">
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mb-1">
                          <span className="flex items-center gap-1">
                            <span>Próximo Marco: Nível {milestone.nextMilestoneLevel}</span>
                            <span className="text-cyan-400">
                              ({milestone.nextMilestoneLevel === 50 ? 'x2.0' : milestone.nextMilestoneLevel === 100 ? 'x3.0' : milestone.nextMilestoneLevel === 200 ? 'x5.0' : milestone.nextMilestoneLevel === 300 ? 'x7.5' : 'x10.0'} CPS)
                            </span>
                          </span>
                          <span>{milestoneProgress}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-850/60">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
                            style={{ width: `${milestoneProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

