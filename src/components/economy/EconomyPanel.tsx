import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { getBulkCost, getBulkSellRefund, getMaxBuyable } from '../../engine/formulas';
import { INITIAL_UPGRADES } from '../../engine/data';
import { QuantitySelector } from '../common/QuantitySelector';
import { IconRenderer } from '../common/IconRenderer';
import { Users, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

export const EconomyPanel: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const shopMode = useGameStore((s) => s.shopMode);
  const shopQty = useGameStore((s) => s.shopQty);
  const setShopMode = useGameStore((s) => s.setShopMode);
  const setShopQty = useGameStore((s) => s.setShopQty);
  const buyGenerator = useGameStore((s) => s.buyGenerator);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  const generatorKeys = React.useMemo(() => Object.keys(generators), [generators]);
  const upgradeKeys = React.useMemo(() => Object.keys(INITIAL_UPGRADES), []);

  return (
    <aside className="h-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 transition-colors rounded-xl p-4 flex flex-col overflow-hidden shadow-sm">
      {/* Cabeçalho da Base & Controles de Compra em Lote */}
      <div className="pb-3 border-b border-zinc-800/80 flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-zinc-200 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" /> Base & Recrutamento
          </h2>
          <Badge variant="neutral">30 Tropas</Badge>
        </div>

        {/* Componente Reutilizável de Seleção de Lote */}
        <QuantitySelector
          mode={shopMode}
          qty={shopQty}
          onModeChange={setShopMode}
          onQtyChange={setShopQty}
        />
      </div>

      {/* Carrossel Compacto de Upgrades Rápidos */}
      <div className="py-2.5 flex-shrink-0">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase block mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-zinc-500 stroke-[1.75]" /> Melhorias Rápidas
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {upgradeKeys.map((upgId) => {
            const upg = INITIAL_UPGRADES[upgId];
            const isBought = !!upgrades[upgId];
            const canAfford = chakra.gte(upg.cost);

            if (isBought) return null;

            return (
              <button
                key={upgId}
                disabled={!canAfford}
                onClick={() => buyUpgrade(upgId)}
                title={`${upg.name} (${formatBigNumber(upg.cost)} Chakra) - ${upg.description}`}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition flex items-center gap-1.5 ${
                  canAfford
                    ? 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-200 shadow-sm'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-600 opacity-60 cursor-not-allowed'
                }`}
              >
                <IconRenderer name={upg.icon} className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" />
                <span className="font-mono text-zinc-300">{formatBigNumber(upg.cost)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista Rolável de Geradores Shinobi */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
        {generatorKeys.map((key) => {
          const gen = generators[key];
          let effectiveQty: number = typeof shopQty === 'number' ? shopQty : 1;
          if (shopQty === 'max') {
            effectiveQty = shopMode === 'buy'
              ? Math.max(1, getMaxBuyable(gen.baseCost, gen.level, chakra))
              : Math.max(1, gen.level);
          }

          const cost = shopMode === 'buy'
            ? getBulkCost(gen.baseCost, gen.level, effectiveQty)
            : getBulkSellRefund(gen.baseCost, gen.level, effectiveQty);

          const canAfford = shopMode === 'buy' ? chakra.gte(cost) && effectiveQty > 0 : gen.level > 0;

          return (
            <div
              key={key}
              onClick={() => buyGenerator(key)}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                canAfford
                  ? 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
                  : 'bg-zinc-950/40 border-zinc-850/60 opacity-60 text-zinc-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-300 flex-shrink-0">
                  <IconRenderer name={gen.avatar} className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-zinc-200 leading-tight">{gen.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-medium">
                      +{formatBigNumber(gen.baseCPS)} CPS
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {shopMode === 'buy' ? 'Custo:' : 'Reembolso:'}{' '}
                      <span className={canAfford ? 'text-zinc-300 font-semibold' : 'text-rose-400 font-semibold'}>
                        {formatBigNumber(cost)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-medium text-zinc-300 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/80">
                  {gen.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
