import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  getBulkCost,
  getBulkSellRefund,
  getMaxBuyable,
  getGeneratorCostDiscount,
} from '../../engine/formulas';
import { getGeneratorMilestoneEffects } from '../../constants/upgrades';
import { QuantitySelector } from '../common/QuantitySelector';
import { IconRenderer } from '../common/IconRenderer';
import { UpgradesList } from './UpgradesList';
import { Users, Sparkles, Award } from 'lucide-react';
import { Badge } from '../common/Badge';

export const EconomyPanel: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const claimedRankRewards = useGameStore((s) => s.claimedRankRewards);
  const shopMode = useGameStore((s) => s.shopMode);
  const shopQty = useGameStore((s) => s.shopQty);
  const setShopMode = useGameStore((s) => s.setShopMode);
  const setShopQty = useGameStore((s) => s.setShopQty);
  const buyGenerator = useGameStore((s) => s.buyGenerator);

  const [panelView, setPanelView] = useState<'generators' | 'upgrades'>('generators');

  const generatorKeys = React.useMemo(() => Object.keys(generators), [generators]);

  return (
    <aside className="h-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 transition-colors rounded-xl p-4 flex flex-col overflow-hidden shadow-sm">
      {/* Cabeçalho do Cockpit: Alternância de Módulo (Recrutamento vs Técnicas) */}
      <div className="pb-3 border-b border-zinc-800/80 flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setPanelView('generators')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                panelView === 'generators'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" />
              <span>Tropas</span>
            </button>
            <button
              onClick={() => setPanelView('upgrades')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                panelView === 'upgrades'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 stroke-[1.75]" />
              <span>Técnicas Jutsu</span>
            </button>
          </div>

          <Badge variant="neutral">30 Tropas</Badge>
        </div>

        {/* Controles de Lote ativos apenas no modo de Tropas */}
        {panelView === 'generators' && (
          <QuantitySelector
            mode={shopMode}
            qty={shopQty}
            onModeChange={setShopMode}
            onQtyChange={setShopQty}
          />
        )}
      </div>

      {/* Conteúdo Alternável: Lista de Geradores ou Matriz de Técnicas */}
      <div className="flex-1 overflow-hidden mt-2.5">
        {panelView === 'upgrades' ? (
          <UpgradesList />
        ) : (
          <div className="h-full overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {generatorKeys.map((key) => {
              const gen = generators[key];
              const discount = getGeneratorCostDiscount(
                key,
                gen.level,
                upgrades,
                claimedRankRewards
              );
              const milestone = getGeneratorMilestoneEffects(gen.level);

              let effectiveQty: number = typeof shopQty === 'number' ? shopQty : 1;
              if (shopQty === 'max') {
                effectiveQty =
                  shopMode === 'buy'
                    ? Math.max(1, getMaxBuyable(gen.baseCost, gen.level, chakra, discount))
                    : Math.max(1, gen.level);
              }

              const cost =
                shopMode === 'buy'
                  ? getBulkCost(gen.baseCost, gen.level, effectiveQty, discount)
                  : getBulkSellRefund(gen.baseCost, gen.level, effectiveQty, discount);

              const canAfford =
                shopMode === 'buy' ? chakra.gte(cost) && effectiveQty > 0 : gen.level > 0;

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

              return (
                <div
                  key={key}
                  onClick={() => buyGenerator(key)}
                  className={`p-2.5 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                    canAfford
                      ? 'bg-zinc-900/60 hover:bg-zinc-850/80 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                      : 'bg-zinc-950/40 border-zinc-850/60 opacity-60 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-300 flex-shrink-0">
                        <IconRenderer name={gen.avatar} className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-medium text-zinc-200 truncate">{gen.name}</h3>
                          {gen.level >= 25 && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${milestone.badgeColor}`}
                            >
                              <Award className="w-2.5 h-2.5" />
                              {milestone.tierName} ({milestone.cpsMultiplier.toString()}x)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-emerald-400 font-medium">
                            +{formatBigNumber(gen.baseCPS.mul(milestone.cpsMultiplier))} CPS
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {shopMode === 'buy' ? 'Custo:' : 'Reembolso:'}{' '}
                            <span
                              className={
                                canAfford ? 'text-zinc-300 font-semibold' : 'text-rose-400 font-semibold'
                              }
                            >
                              {formatBigNumber(cost)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono font-medium text-zinc-200 px-2 py-0.5 rounded bg-zinc-850 border border-zinc-700">
                        {gen.level}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso de Marco (Tier Milestone) */}
                  {milestone.nextMilestoneLevel && (
                    <div className="pt-1 border-t border-zinc-800/40">
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mb-1">
                        <span>Próximo Marco: Nível {milestone.nextMilestoneLevel}</span>
                        <span>{milestoneProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500/80 rounded-full transition-all duration-300"
                          style={{ width: `${milestoneProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
