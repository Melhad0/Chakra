import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TECHNIQUE_UPGRADES } from '../../constants/upgrades';
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
} from 'lucide-react';

export const UpgradesList: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const totalChakraEarned = useGameStore((s) => s.stats.totalChakraEarned);
  const upgrades = useGameStore((s) => s.upgrades);
  const gauntlet = useGameStore((s) => s.gauntlet);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const buyAllAffordableUpgrades = useGameStore((s) => s.buyAllAffordableUpgrades);

  const [activeCategory, setActiveCategory] = useState<UpgradeCategory | 'all'>('all');

  // Névoa de Descoberta: Upgrades visíveis quando atingir 20% do custo ou derrotar o chefe requerido
  const visibleUpgrades = useMemo(() => {
    return TECHNIQUE_UPGRADES.filter((upg) => {
      // Se já foi comprado, permanece sempre visível
      if (upgrades[upg.id]) return true;

      // Se possui requisito de chefe do Gauntlet
      if (upg.requiredBossId !== undefined && gauntlet.maxUnlockedBoss >= upg.requiredBossId) {
        return true;
      }

      // Regra de 20% de custo acumulado ou disponível
      const threshold = upg.customFogChakra || upg.cost.mul(0.2);
      return chakra.gte(threshold) || totalChakraEarned.gte(threshold);
    });
  }, [upgrades, chakra, totalChakraEarned, gauntlet.maxUnlockedBoss]);

  // Filtro por Categoria Selecionada
  const filteredUpgrades = useMemo(() => {
    if (activeCategory === 'all') return visibleUpgrades;
    return visibleUpgrades.filter((u) => u.category === activeCategory);
  }, [visibleUpgrades, activeCategory]);

  // Contagem de Upgrades Acessíveis para o botão "Buy All"
  const affordableUpgrades = useMemo(() => {
    const unbought = visibleUpgrades
      .filter((u) => !upgrades[u.id])
      .sort((a, b) => (a.cost.lt(b.cost) ? -1 : 1));

    let availableChakra = chakra;
    const affordableList: TechniqueUpgrade[] = [];

    for (const u of unbought) {
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

  const categories: Array<{ id: UpgradeCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'all', label: 'Todos', icon: Layers },
    { id: 'taijutsu', label: 'Taijutsu', icon: Zap },
    { id: 'ninjutsu', label: 'Ninjutsu', icon: Users },
    { id: 'senjutsu', label: 'Senjutsu', icon: Flame },
    { id: 'fuinjutsu', label: 'Fūinjutsu', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Barra de Ação Superior: Aprender Todos os Jutsus Viáveis */}
      <div className="pb-2.5 flex-shrink-0">
        <button
          onClick={buyAllAffordableUpgrades}
          disabled={affordableUpgrades.length === 0}
          className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-between transition border ${
            affordableUpgrades.length > 0
              ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-700/60 text-cyan-200 shadow-sm hover:border-cyan-500 active:scale-[0.99]'
              : 'bg-zinc-950/40 border-zinc-850 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400 stroke-[2]" />
            <span>Aprender Todos os Jutsus Viáveis</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/50 border border-cyan-700/50 text-cyan-300">
              {affordableUpgrades.length}
            </span>
            {affordableUpgrades.length > 0 && (
              <span className="text-[11px] text-zinc-400">
                ({formatBigNumber(totalAffordableCost)})
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Seletor Segmentado de Árvores de Domínio */}
      <div className="flex items-center gap-1 pb-2 overflow-x-auto custom-scrollbar flex-shrink-0">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'all'
            ? visibleUpgrades.length
            : visibleUpgrades.filter((u) => u.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition border ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
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
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar mt-1">
        {filteredUpgrades.length === 0 ? (
          <div className="py-8 text-center bg-zinc-950/40 rounded-xl border border-dashed border-zinc-850">
            <Sparkles className="w-6 h-6 text-zinc-600 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs text-zinc-400 font-medium">Nenhum jutsu visível nesta categoria.</p>
            <p className="text-[10px] text-zinc-600 mt-1">
              Acumule mais chakra para dissipar a névoa de descoberta.
            </p>
          </div>
        ) : (
          filteredUpgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              purchased={!!upgrades[upgrade.id]}
              canAfford={chakra.gte(upgrade.cost)}
              currentChakra={chakra}
              onBuy={buyUpgrade}
            />
          ))
        )}
      </div>
    </div>
  );
};
