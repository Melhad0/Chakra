import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { FORGE_RECIPES_CATALOG } from '../../constants/forgeCatalog';
import { SHINOBI_RANKS, getCurrentRank } from '../../constants/rankings';
import { GearSlotKey } from '../../types/inventory';
import {
  Hammer,
  Swords,
  Zap,
  TrendingUp,
  Percent,
  Trash2,
  ArrowUpCircle,
  RefreshCw,
} from 'lucide-react';

export const LegendaryForgePanel: React.FC = () => {
  const forgeFragments = useGameStore((s) => s.forgeFragments);
  const stats = useGameStore((s) => s.stats);
  const passedExams = useGameStore((s) => s.passedExams);
  const inventory = useGameStore((s) => s.inventory);
  const craftForgeWeapon = useGameStore((s) => s.craftForgeWeapon);
  const refineEquippedItem = useGameStore((s) => s.refineEquippedItem);
  const dismantleBagItem = useGameStore((s) => s.dismantleBagItem);

  const [activeTab, setActiveTab] = useState<'CRAFT' | 'REFINE' | 'DISMANTLE'>('CRAFT');

  // Patente do Jogador
  const currentRank = useMemo(() => {
    return getCurrentRank(stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges, passedExams);
  }, [stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges, passedExams]);

  const playerRankIndex = useMemo(() => {
    return SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);
  }, [currentRank]);

  const equippedItemsList = useMemo(() => {
    const gear = inventory.equippedGear || {};
    return (Object.keys(gear) as GearSlotKey[])
      .map((slotKey) => ({
        slotKey,
        item: gear[slotKey],
      }))
      .filter((entry) => !!entry.item);
  }, [inventory.equippedGear]);

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'MYTHIC':
        return 'border-purple-500/80 bg-purple-950/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
      case 'LEGENDARY':
        return 'border-amber-500/80 bg-amber-950/60 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'EPIC':
        return 'border-rose-500/70 bg-rose-950/50 text-rose-200';
      case 'RARE':
      default:
        return 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Principal da Forja */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-800/40 bg-gradient-to-br from-purple-950/40 via-zinc-950/90 to-zinc-900/60 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Hammer className="w-3.5 h-3.5" />
              <span>Fornalha Secreta dos Ferreiros da Folha & Névoa</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-100 tracking-tight">
              A Grande Forja Lendária Shinobi
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 font-mono max-w-xl leading-relaxed">
              Utilize seus <strong className="text-purple-300">Fragmentos de Forja</strong> para confeccionar armamentos sagrados com bônus colossais de CPS e Clique, aprimorar os equipamentos que você já veste até o nível +10, ou reciclar sobras de guerra!
            </p>
          </div>

          {/* Saldo de Fragmentos de Forja */}
          <div className="flex flex-col items-center gap-2 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl min-w-[240px] shadow-lg">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
              Fragmentos da Forja
            </span>
            <div className="flex items-center gap-2">
              <Hammer className="w-6 h-6 text-purple-400 animate-pulse" />
              <span className="text-3xl font-black font-mono text-purple-300">
                {forgeFragments}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Obtidos em Missões, Bosses & Gacha
            </span>
          </div>
        </div>

        {/* Abas Internas da Forja */}
        <div className="relative z-10 flex items-center gap-2 pt-6 mt-6 border-t border-zinc-800/80 font-mono text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('CRAFT')}
            className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 ${
              activeTab === 'CRAFT'
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold shadow-md'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Criação de Armas ({FORGE_RECIPES_CATALOG.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REFINE')}
            className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 ${
              activeTab === 'REFINE'
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold shadow-md'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Refino de Equipamentos (+1 a +10)</span>
          </button>

          <button
            onClick={() => setActiveTab('DISMANTLE')}
            className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 ${
              activeTab === 'DISMANTLE'
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold shadow-md'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Desmontar Mochila ({inventory.inventoryBag.length})</span>
          </button>
        </div>
      </div>

      {/* ABA 1: CRIAÇÃO DE ARMAS (CRAFTING) */}
      {activeTab === 'CRAFT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FORGE_RECIPES_CATALOG.map((recipe) => {
            const hasFragments = forgeFragments >= recipe.costFragments;
            const isRankLocked = playerRankIndex < recipe.requiredRankTier;
            const canCraft = hasFragments && !isRankLocked;

            return (
              <div
                key={recipe.id}
                className="p-5 rounded-3xl border bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getRarityBadgeStyle(recipe.rarity)}`}>
                      {recipe.rarity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {recipe.badge || recipe.slotType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100">{recipe.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed mt-1">
                    {recipe.description}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono italic mt-1">
                    "{recipe.lore}"
                  </p>

                  {/* Bônus Concedidos */}
                  <div className="mt-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 font-mono text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-400 block">
                      Atributos Forjados:
                    </span>
                    <div className="text-emerald-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{((recipe.resultItem.bonusCpsMult.toNumber() - 1) * 100).toFixed(0)}% Multiplicador de CPS Passivo</span>
                    </div>
                    <div className="text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>+{((recipe.resultItem.bonusClickMult.toNumber() - 1) * 100).toFixed(0)}% Poder no Clique Manual</span>
                    </div>
                    {recipe.resultItem.bonusCritChance && (
                      <div className="text-amber-400 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5" />
                        <span>+{(recipe.resultItem.bonusCritChance * 100).toFixed(0)}% Taxa de Acerto Crítico</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs">
                    <span className="text-zinc-500 block text-[10px]">Custo de Forja</span>
                    <span className={`font-bold ${hasFragments ? 'text-purple-300' : 'text-rose-400'}`}>
                      {recipe.costFragments} Fragmentos
                    </span>
                  </div>

                  <button
                    disabled={!canCraft}
                    onClick={() => craftForgeWeapon(recipe.id)}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl border border-purple-400 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Forjar Armamento</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ABA 2: REFINO DE EQUIPAMENTOS (+1 a +10) */}
      {activeTab === 'REFINE' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold mb-1">
              Bancada de Aprimoramento e Encantamento de Equipamentos
            </h4>
            <p className="text-xs font-mono text-zinc-400">
              Selecione qualquer item atualmente equipado no seu shinobi para refiná-lo até +10. Cada nível de refino concede +10% de CPS, +10% de Clique e +1% de Crítico!
            </p>
          </div>

          {equippedItemsList.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/20 border border-zinc-800/60 rounded-3xl font-mono text-xs text-zinc-500">
              Nenhum equipamento está equipado no momento. Equipe itens no seu inventário para poder aprimorá-los aqui!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equippedItemsList.map(({ slotKey, item }) => {
                if (!item) return null;
                const currentLevel = (item as any).refinementLevel || 0;
                const isMaxLevel = currentLevel >= 10;
                const cost = Math.min(600, Math.floor(15 * Math.pow(1.6, currentLevel)));
                const canRefine = !isMaxLevel && forgeFragments >= cost;

                return (
                  <div
                    key={slotKey}
                    className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl hover:border-zinc-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Slot: {slotKey}
                        </span>
                        <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50">
                          Nível: +{currentLevel} / +10
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-100">{item.name}</h4>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">{item.description}</p>

                      <div className="mt-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl font-mono text-xs space-y-1">
                        <div className="text-emerald-400">
                          • CPS Atual: +{((item.bonusCpsMult.toNumber() - 1) * 100).toFixed(0)}%
                          {!isMaxLevel && <span className="text-zinc-500"> → +{((item.bonusCpsMult.mul(1.1).toNumber() - 1) * 100).toFixed(0)}%</span>}
                        </div>
                        <div className="text-cyan-400">
                          • Clique Atual: +{((item.bonusClickMult.toNumber() - 1) * 100).toFixed(0)}%
                          {!isMaxLevel && <span className="text-zinc-500"> → +{((item.bonusClickMult.mul(1.1).toNumber() - 1) * 100).toFixed(0)}%</span>}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="font-mono text-xs">
                        <span className="text-zinc-500 block text-[10px]">Custo de Refino</span>
                        {isMaxLevel ? (
                          <span className="text-amber-400 font-bold">NÍVEL MÁXIMO</span>
                        ) : (
                          <span className={`font-bold ${forgeFragments >= cost ? 'text-purple-300' : 'text-rose-400'}`}>
                            {cost} Fragmentos
                          </span>
                        )}
                      </div>

                      <button
                        disabled={!canRefine}
                        onClick={() => refineEquippedItem(slotKey)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl border border-purple-400 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span>Aprimorar para +{currentLevel + 1}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: DESMONTAGEM / RECICLAGEM */}
      {activeTab === 'DISMANTLE' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold mb-1">
              Desmontagem de Armas & Reciclagem de Metais
            </h4>
            <p className="text-xs font-mono text-zinc-400">
              Desmonte equipamentos sobressalentes da sua mochila de inventário para derretê-los em Fragmentos de Forja. Quanto maior a raridade da peça, mais fragmentos são recuperados!
            </p>
          </div>

          {inventory.inventoryBag.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/20 border border-zinc-800/60 rounded-3xl font-mono text-xs text-zinc-500">
              Sua mochila está vazia no momento. Colete espólios em missões, bosses e no gacha para reciclar aqui!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.inventoryBag.map((item, idx) => {
                if (!item) return null;

                let estimatedFrags = 2;
                switch (item.rarity) {
                  case 'MYTHIC':
                    estimatedFrags = 250;
                    break;
                  case 'LEGENDARY':
                    estimatedFrags = 80;
                    break;
                  case 'EPIC':
                    estimatedFrags = 30;
                    break;
                  case 'RARE':
                    estimatedFrags = 12;
                    break;
                  case 'UNCOMMON':
                    estimatedFrags = 5;
                    break;
                  default:
                    estimatedFrags = 2;
                }

                return (
                  <div
                    key={`${item.id}_${idx}`}
                    className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getRarityBadgeStyle(item.rarity)}`}>
                          {item.rarity}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 font-bold">
                          +{estimatedFrags} Frags
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200 truncate">{item.name}</h4>
                      <p className="text-[11px] font-mono text-zinc-400 leading-snug line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => dismantleBagItem(idx)}
                      className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-600 text-rose-300 font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desmontar (+{estimatedFrags} Fragmentos)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
