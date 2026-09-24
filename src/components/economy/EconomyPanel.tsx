import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { getBulkCost, getBulkSellRefund, getMaxBuyable } from '../../engine/formulas';
import { INITIAL_UPGRADES } from '../../engine/data';
import { ShopQty } from '../../types/economy';

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
    <aside className="h-full bg-shinobi-card/90 backdrop-blur-md border border-shinobi-border hover:border-shinobi-border-orange/30 transition-colors rounded-xl p-3 flex flex-col overflow-hidden shadow-2xl">
      {/* Cabeçalho da Base & Controles de Compra em Lote */}
      <div className="pb-3 border-b border-shinobi-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
            <span>📜</span> Base & Recrutamento
          </h2>
          <span className="text-[10px] text-chakra-orange font-bold">30 Tropas</span>
        </div>

        {/* Modo de Compra/Venda e Seleção de Quantidade */}
        <div className="flex items-center justify-between gap-1.5 bg-black/60 p-1 rounded-lg border border-shinobi-border">
          <div className="flex gap-1">
            <button
              onClick={() => setShopMode('buy')}
              className={`px-2.5 py-1 rounded text-[11px] font-black transition ${
                shopMode === 'buy'
                  ? 'bg-gradient-to-r from-chakra-orange to-chakra-amber text-black shadow-orange-glow'
                  : 'text-shinobi-muted hover:text-white'
              }`}
            >
              Comprar
            </button>
            <button
              onClick={() => setShopMode('sell')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                shopMode === 'sell'
                  ? 'bg-zinc-700 text-white shadow-sm border border-zinc-600'
                  : 'text-shinobi-muted hover:text-white'
              }`}
            >
              Vender
            </button>
          </div>

          <div className="flex gap-1">
            {([1, 10, 100, 'max'] as ShopQty[]).map((qty) => (
              <button
                key={qty}
                onClick={() => setShopQty(qty)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  shopQty === qty
                    ? 'bg-chakra-orange/20 text-chakra-orange border border-chakra-orange/50'
                    : 'text-shinobi-muted hover:text-white'
                }`}
              >
                {qty === 'max' ? 'Max' : `x${qty}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carrossel Compacto de Upgrades Rápidos */}
      <div className="py-2 flex-shrink-0">
        <span className="text-[10px] font-bold text-shinobi-muted uppercase tracking-wider block mb-1">
          Melhorias Rápidas
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
                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold border transition flex items-center gap-1 ${
                  canAfford
                    ? 'bg-chakra-orange/15 border-chakra-orange/60 text-white hover:bg-chakra-orange/25 shadow-sm'
                    : 'bg-white/5 border-shinobi-border text-shinobi-muted/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <span>{upg.icon}</span>
                <span>{formatBigNumber(upg.cost)}</span>
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
              className={`p-2 rounded-lg border transition flex items-center justify-between cursor-pointer ${
                canAfford
                  ? 'bg-glass-card hover:bg-glass-hover border-shinobi-border hover:border-chakra-orange/50 hover:shadow-[0_0_15px_rgba(255,107,0,0.12)]'
                  : 'bg-black/40 border-shinobi-border/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                  {gen.avatar}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">{gen.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-chakra-amber font-bold">
                      +{formatBigNumber(gen.baseCPS)} CPS
                    </span>
                    <span className="text-[10px] text-shinobi-muted">
                      {shopMode === 'buy' ? 'Custo:' : 'Reembolso:'}{' '}
                      <span className={canAfford ? 'text-chakra-gold font-bold' : 'text-red-400 font-bold'}>
                        {formatBigNumber(cost)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-chakra-orange px-2 py-0.5 rounded bg-black/50 border border-chakra-orange/30">
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
