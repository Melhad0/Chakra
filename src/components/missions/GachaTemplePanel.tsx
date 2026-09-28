import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GachaDropResult } from '../../types/gacha';
import { GACHA_ITEMS_POOL } from '../../constants/gachaPool';
import {
  Scroll,
  Sparkles,
  Swords,
  Shield,
  Zap,
  Crosshair,
  Eye,
  Feather,
  Boxes,
  CircleDot,
  X,
  Award,
} from 'lucide-react';

export const GachaTemplePanel: React.FC = () => {
  const gachaTickets = useGameStore((s) => s.gachaTickets);
  const performGachaPull = useGameStore((s) => s.performGachaPull);
  const [pullResults, setPullResults] = useState<GachaDropResult[] | null>(null);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  const handlePull = (count: 1 | 10) => {
    if (gachaTickets < count) return;
    setIsRevealing(true);
    const results = performGachaPull(count);
    setTimeout(() => {
      setPullResults(results);
      setIsRevealing(false);
    }, 450);
  };

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

  const renderIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Swords':
        return <Swords className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Crosshair':
        return <Crosshair className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Eye':
        return <Eye className={className} />;
      case 'Feather':
        return <Feather className={className} />;
      case 'Boxes':
        return <Boxes className={className} />;
      case 'CircleDot':
        return <CircleDot className={className} />;
      case 'Scroll':
        return <Scroll className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Principal do Templo */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-600/40 bg-gradient-to-br from-amber-950/40 via-zinc-950/90 to-purple-950/40 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <Scroll className="w-3.5 h-3.5" />
              <span>Santuário de Invocação de Pergaminhos Míticos</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-100 tracking-tight">
              Templo das Relíquias & Invocação Ninja
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 font-mono max-w-xl leading-relaxed">
              Consuma seus <strong className="text-amber-300">Bilhetes Gacha</strong> para quebrar os selos ancestrais.
              Invoque armamentos lendários canônicos diretamente para a sua mochila de equipamentos ou resgate provisões celestiais!
            </p>
          </div>

          {/* Saldo de Bilhetes & Ações de Invocação */}
          <div className="flex flex-col items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl min-w-[260px] shadow-lg">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
              Bilhetes Disponíveis
            </span>
            <div className="flex items-center gap-2">
              <Scroll className="w-6 h-6 text-amber-400 animate-bounce" />
              <span className="text-3xl font-black font-mono text-amber-300">
                {gachaTickets}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              <button
                disabled={gachaTickets < 1 || isRevealing}
                onClick={() => handlePull(1)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-mono text-xs font-bold border border-amber-400/80 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex flex-col items-center justify-center"
              >
                <span>Invocação 1x</span>
                <span className="text-[10px] opacity-80">(1 Bilhete)</span>
              </button>

              <button
                disabled={gachaTickets < 10 || isRevealing}
                onClick={() => handlePull(10)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-mono text-xs font-bold border border-purple-400/80 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex flex-col items-center justify-center"
              >
                <span className="text-amber-300">Invocação 10x</span>
                <span className="text-[9px] text-purple-200">Garante Épico+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Probabilidades */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 mt-6 border-t border-zinc-800/80 text-center font-mono text-xs">
          <div className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-cyan-300">
            <span className="text-[10px] block opacity-70">RARO</span>
            <strong>50.0%</strong>
          </div>
          <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-800/30 text-rose-300">
            <span className="text-[10px] block opacity-70">ÉPICO</span>
            <strong>32.0%</strong>
          </div>
          <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-300">
            <span className="text-[10px] block opacity-70">LENDÁRIO</span>
            <strong>14.0%</strong>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-800/30 text-purple-300">
            <span className="text-[10px] block opacity-70">MÍTICO SUPREMO</span>
            <strong>4.0%</strong>
          </div>
        </div>
      </div>

      {/* Catálogo de Itens do Pool Gacha */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Catálogo de Relíquias da Invocação
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            {GACHA_ITEMS_POOL.length} relíquias no templo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GACHA_ITEMS_POOL.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 bg-zinc-900/40 hover:bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700`}
            >
              <div className={`p-2.5 rounded-xl border flex-shrink-0 ${getRarityBadgeStyle(item.rarity)}`}>
                {renderIcon(item.iconName, 'w-5 h-5')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getRarityBadgeStyle(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{item.type}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 truncate">{item.name}</h4>
                <p className="text-[11px] font-mono text-zinc-400 leading-snug line-clamp-2 mt-0.5">
                  {item.description}
                </p>

                {item.equipment && (
                  <div className="mt-2 text-[10px] font-mono text-emerald-400">
                    +{((item.equipment.bonusCpsMult.toNumber() - 1) * 100).toFixed(0)}% CPS • +{((item.equipment.bonusClickMult.toNumber() - 1) * 100).toFixed(0)}% Clique
                  </div>
                )}
                {item.amount && (
                  <div className="mt-2 text-[10px] font-mono text-amber-400">
                    +{item.amount} {item.type === 'FORGE_FRAGMENTS' ? 'Fragmentos de Forja' : 'Chakra Ancestral'}
                  </div>
                )}
                {item.cpsSeconds && (
                  <div className="mt-2 text-[10px] font-mono text-cyan-400">
                    +{item.cpsSeconds}s de CPS Imediato
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Revelação de Drops */}
      {pullResults && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-zinc-100 font-mono">
                  Selos Rompidos! Recompensas Conquistadas
                </h3>
              </div>
              <button
                onClick={() => setPullResults(null)}
                className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
              {pullResults.map((drop, idx) => (
                <div
                  key={`${drop.id}_${idx}`}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${getRarityBadgeStyle(
                    drop.rarity
                  )} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase font-black tracking-widest px-2 py-0.5 rounded border bg-black/40">
                        {drop.rarity}
                      </span>
                      <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
                        {renderIcon(drop.iconName, 'w-4 h-4')}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-zinc-100">{drop.name}</h4>
                    <p className="text-[11px] font-mono text-zinc-300 leading-snug mt-1 opacity-90">
                      {drop.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[10px] font-mono font-bold">
                    {drop.equipment && (
                      <span className="text-emerald-300 block">
                        ✓ Enviado para a Mochila do Inventário!
                      </span>
                    )}
                    {drop.amount && (
                      <span className="text-amber-300 block">
                        +{drop.amount} Adicionados ao seu Saldo!
                      </span>
                    )}
                    {drop.cpsSeconds && (
                      <span className="text-cyan-300 block">
                        +{drop.cpsSeconds}s de CPS Creditados!
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setPullResults(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-xs font-bold rounded-xl border border-zinc-700 transition cursor-pointer"
              >
                Concluir & Coletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
