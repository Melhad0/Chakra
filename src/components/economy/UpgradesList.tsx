import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TECHNIQUE_UPGRADES, UPGRADES_BY_ID } from '../../constants/upgrades';
import { UpgradeCategory, TechniqueUpgrade } from '../../types/upgrades';
import { UpgradeCard } from './UpgradeCard';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  Sparkles,
  Zap,
  Users,
  Flame,
  Shield,
  Layers,
  CheckCheck,
  Search,
  X,
  BookOpen,
} from 'lucide-react';

import { calculateTotalCPS } from '../../engine/formulas';

export const UpgradesList: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const totalChakraEarned = useGameStore((s) => s.stats.totalChakraEarned);
  const upgrades = useGameStore((s) => s.upgrades);
  const generators = useGameStore((s) => s.generators);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const claimedRankRewards = useGameStore((s) => s.claimedRankRewards);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const inventory = useGameStore((s) => s.inventory);
  const missionPermanentCpsMult = useGameStore((s) => s.missionPermanentCpsMult);
  const missionBuffTimer = useGameStore((s) => s.missionBuffTimer);
  const missionBuffMult = useGameStore((s) => s.missionBuffMult);
  const gauntlet = useGameStore((s) => s.gauntlet);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const buyAllAffordableUpgrades = useGameStore((s) => s.buyAllAffordableUpgrades);

  const [activeCategory, setActiveCategory] = useState<UpgradeCategory | 'all'>('all');
  const [activeTier, setActiveTier] = useState<'all' | 1 | 2 | 3>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Total de técnicas compradas
  const purchasedCount = useMemo(() => {
    return Object.keys(upgrades).filter((id) => upgrades[id]).length;
  }, [upgrades]);

  const masteryPercent = useMemo(() => {
    return Math.min(100, Math.floor((purchasedCount / TECHNIQUE_UPGRADES.length) * 100));
  }, [purchasedCount]);

  // Névoa de Descoberta: Upgrades visíveis quando atingir 20% do custo, ou requisito de chefe, ou se o pré-requisito V1 já foi adquirido
  const visibleUpgrades = useMemo(() => {
    return TECHNIQUE_UPGRADES.filter((upg) => {
      // Se já foi comprado, permanece sempre visível
      if (upgrades[upg.id]) return true;

      // Se possui requisito de chefe do Gauntlet
      if (upg.requiredBossId !== undefined && gauntlet.maxUnlockedBoss >= upg.requiredBossId) {
        return true;
      }

      // Se requer um upgrade anterior que já foi comprado, facilita a visibilidade
      if (upg.requiredUpgradeId && upgrades[upg.requiredUpgradeId]) {
        const relaxedThreshold = upg.cost.mul(0.15);
        if (chakra.gte(relaxedThreshold) || totalChakraEarned.gte(relaxedThreshold)) {
          return true;
        }
      }

      // Regra geral de 20% de custo acumulado ou disponível
      const threshold = upg.customFogChakra || upg.cost.mul(0.2);
      return chakra.gte(threshold) || totalChakraEarned.gte(threshold);
    });
  }, [upgrades, chakra, totalChakraEarned, gauntlet.maxUnlockedBoss]);

  // Filtro por Categoria Selecionada, Tier (V1, V2, V3) e Busca Textual
  const filteredUpgrades = useMemo(() => {
    let list = visibleUpgrades;
    if (activeCategory !== 'all') {
      list = list.filter((u) => u.category === activeCategory);
    }
    if (activeTier !== 'all') {
      list = list.filter((u) => u.tier === activeTier);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.description.toLowerCase().includes(query) ||
          u.category.toLowerCase().includes(query)
      );
    }
    return list;
  }, [visibleUpgrades, activeCategory, activeTier, searchQuery]);

  // Contagem de Upgrades Acessíveis para o botão "Buy All" (respeitando pré-requisitos encadeados)
  const affordableUpgrades = useMemo(() => {
    const unbought = visibleUpgrades
      .filter((u) => !upgrades[u.id])
      .sort((a, b) => (a.cost.lt(b.cost) ? -1 : 1));

    let availableChakra = chakra;
    const affordableList: TechniqueUpgrade[] = [];

    for (const u of unbought) {
      // Bloqueio por pré-requisito
      if (
        u.requiredUpgradeId &&
        !upgrades[u.requiredUpgradeId] &&
        !affordableList.some((item) => item.id === u.requiredUpgradeId)
      ) {
        continue;
      }

      if (availableChakra.gte(u.cost)) {
        availableChakra = availableChakra.sub(u.cost);
        affordableList.push(u);
      }
    }
    return affordableList;
  }, [visibleUpgrades, upgrades, chakra]);

  const totalAffordableCost = useMemo(() => {
    return affordableUpgrades.reduce((acc, u) => acc.add(u.cost), chakra.mul(0));
  }, [affordableUpgrades, chakra]);

  const categories: Array<{
    id: UpgradeCategory | 'all';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'all', label: 'Todos', icon: Layers },
    { id: 'taijutsu', label: 'Taijutsu', icon: Zap },
    { id: 'ninjutsu', label: 'Ninjutsu', icon: Users },
    { id: 'senjutsu', label: 'Senjutsu', icon: Flame },
    { id: 'fuinjutsu', label: 'Fūinjutsu', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-2">
      {/* Barra de Progresso de Maestria Shinobi */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-zinc-950/80 via-zinc-900/60 to-zinc-950/80 border border-zinc-800/80 shadow-md flex flex-col gap-1.5 flex-shrink-0 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <BookOpen className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="font-medium tracking-wide">Maestria de Jutsus</span>
          </div>
          <span className="text-fuchsia-400 font-bold">
            {purchasedCount} / {TECHNIQUE_UPGRADES.length} ({masteryPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-fuchsia-500/50"
            style={{ width: `${masteryPercent}%` }}
          />
        </div>
      </div>

      {/* Botão de Compra em Lote de Todas as Técnicas Acessíveis */}
      <div className="flex-shrink-0">
        <button
          onClick={buyAllAffordableUpgrades}
          disabled={affordableUpgrades.length === 0}
          className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-between transition-all border cursor-pointer select-none active:scale-[0.99] relative overflow-hidden ${
            affordableUpgrades.length > 0
              ? 'bg-gradient-to-r from-cyan-950/70 via-zinc-900 to-cyan-950/70 hover:from-cyan-900/70 hover:to-cyan-900/70 border-cyan-500/70 text-cyan-200 shadow-lg shadow-cyan-950/40'
              : 'bg-zinc-950/40 border-zinc-850/80 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {affordableUpgrades.length > 0 && (
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          )}

          <div className="flex items-center gap-2">
            <CheckCheck className={`w-4 h-4 ${affordableUpgrades.length > 0 ? 'text-cyan-400' : 'text-zinc-600'} stroke-[2.2]`} />
            <span className="font-semibold">Aprender Jutsus Viáveis</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
              affordableUpgrades.length > 0
                ? 'bg-cyan-900/70 border-cyan-500/70 text-cyan-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}>
              {affordableUpgrades.length}
            </span>
            {affordableUpgrades.length > 0 && (
              <span className="text-[11px] text-amber-300 font-bold">
                ({formatBigNumber(totalAffordableCost)})
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Barra de Busca de Técnicas */}
      <div className="relative flex-shrink-0">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar técnica por nome ou efeito..."
          className="w-full pl-8 pr-7 py-1 text-xs bg-zinc-950/70 border border-zinc-800/80 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500/60 transition shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Seletor de Tiers V1 / V2 / V3 */}
      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-850/80 flex-shrink-0 shadow-inner">
        <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Patamar:</span>
        <div className="flex items-center gap-1">
          {(['all', 1, 2, 3] as const).map((tier) => {
            const isActive = activeTier === tier;
            const tierLabel = tier === 'all' ? 'Todos' : `V${tier}`;
            return (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition border cursor-pointer select-none ${
                  isActive
                    ? tier === 3
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/80 font-bold shadow-md shadow-amber-950/60'
                      : tier === 2
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/80 font-semibold shadow-md shadow-cyan-950/60'
                      : 'bg-zinc-800 text-zinc-100 border-zinc-650 font-semibold shadow-sm'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:bg-zinc-850'
                }`}
              >
                {tierLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seletor Segmentado de Árvores de Domínio */}
      <div className="flex items-center gap-1 pb-1 overflow-x-auto custom-scrollbar flex-shrink-0">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count =
            cat.id === 'all'
              ? visibleUpgrades.length
              : visibleUpgrades.filter((u) => u.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition border ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-650 shadow-sm'
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
              }`}
            >
              <Icon className="w-3 h-3 stroke-[1.75]" />
              <span>{cat.label}</span>
              <span className="text-[10px] text-zinc-500 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Lista de Cards de Upgrades com Névoa de Descoberta */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {filteredUpgrades.length === 0 ? (
          <div className="py-12 text-center bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800/80">
            <Sparkles className="w-7 h-7 text-zinc-600 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs text-zinc-400 font-medium">Nenhum jutsu visível neste filtro.</p>
            <p className="text-[10px] text-zinc-600 mt-1">
              Acumule mais chakra ou domine os jutsus anteriores para dissipar a névoa.
            </p>
          </div>
        ) : (
          filteredUpgrades.map((upgrade) => {
            const isPrereqMet =
              !upgrade.requiredUpgradeId || !!upgrades[upgrade.requiredUpgradeId];
            const prereqName = upgrade.requiredUpgradeId
              ? UPGRADES_BY_ID[upgrade.requiredUpgradeId]?.name
              : undefined;

            return (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                purchased={!!upgrades[upgrade.id]}
                canAfford={chakra.gte(upgrade.cost)}
                currentChakra={chakra}
                currentCPS={currentCPS}
                prerequisiteMet={isPrereqMet}
                prerequisiteName={prereqName}
                onBuy={buyUpgrade}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

