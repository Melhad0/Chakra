import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import { CLAN_NODES } from '../../engine/data';
import { Badge } from '../common/Badge';
import { IconRenderer } from '../common/IconRenderer';
import { RankingDashboard } from './RankingDashboard';
import {
  Scroll,
  GitFork,
  Trophy,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  Dice5,
} from 'lucide-react';
import { PRESTIGE_THRESHOLD, calculatePendingAncestralChakra } from '../../engine/formulas';
import { getCurrentRank } from '../../constants/rankings';

export const OperationsPanel: React.FC = () => {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const buyClanNode = useGameStore((s) => s.buyClanNode);
  const activeMission = useGameStore((s) => s.activeMission);
  const stats = useGameStore((s) => s.stats);
  const performPrestige = useGameStore((s) => s.performPrestige);
  const setView = useGameStore((s) => s.setView);

  return (
    <aside className="h-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 transition-colors rounded-xl p-3.5 flex flex-col overflow-hidden shadow-sm">
      {/* 4 CARTÕES DE ACESSO RÁPIDO AOS MÓDULOS DEDICADOS EM TELA CHEIA */}
      {(() => {
        const unlockedClanNodesCount = Object.keys(clanNodes).filter((k) => clanNodes[k]).length;
        const currentRank = getCurrentRank(stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges);
        const canPrestige = stats.totalChakraEarned.gte(PRESTIGE_THRESHOLD);
        const prestigeProgress = Math.min(100, Math.max(0, stats.totalChakraEarned.div(PRESTIGE_THRESHOLD).mul(100).toNumber()));
        const isChuninEligible = stats.manualClicksAllTime >= 100;
        const isMissionRunning = !!(activeMission.activeMissionId && activeMission.resolvesAt && activeMission.resolvesAt > Date.now());
        const isMissionReady = !!(activeMission.activeMissionId && activeMission.resolvesAt && Date.now() >= activeMission.resolvesAt);

        return (
          <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
            {/* Card 1: Árvore de Clãs */}
            <button
              onClick={() => setView('CLAN_TREE')}
              className="group p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-850/90 border border-purple-900/30 hover:border-purple-500/60 text-left transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="w-6 h-6 rounded-md bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <GitFork className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400">
                  {chakraAncestral.toString()}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                  Clãs
                </h4>
                <p className="text-[9px] font-mono text-zinc-400 truncate">
                  {unlockedClanNodesCount}/8 Linhagens
                </p>
              </div>
              <div className="mt-1 pt-1 border-t border-zinc-850/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span>{canPrestige ? 'Pronto!' : `${prestigeProgress.toFixed(0)}%`}</span>
                <ArrowUpRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>

            {/* Card 2: Quadro de Missões Shinobi */}
            <button
              onClick={() => setView('MISSIONS')}
              className="group p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-850/90 border border-emerald-900/30 hover:border-emerald-500/60 text-left transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="w-6 h-6 rounded-md bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Dice5 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  14 Missões
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  Missões
                </h4>
                <p className="text-[9px] font-mono text-zinc-400 truncate">
                  {isMissionReady ? 'Pronto para Desfecho!' : isMissionRunning ? 'Em Incursão...' : 'Ranks E a SS'}
                </p>
              </div>
              <div className="mt-1 pt-1 border-t border-zinc-850/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span>{isMissionReady ? 'Revelar!' : isMissionRunning ? 'Operando' : 'Mural Shinobi'}</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>

            {/* Card 3: Exame Chūnin */}
            <button
              onClick={() => setView('CHUNIN_EXAM')}
              className="group p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-850/90 border border-amber-900/30 hover:border-amber-500/60 text-left transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="w-6 h-6 rounded-md bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Scroll className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  3 Fases
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                  Exame
                </h4>
                <p className="text-[9px] font-mono text-zinc-400 truncate">
                  {isChuninEligible ? 'Elegível' : '100 Cliques'}
                </p>
              </div>
              <div className="mt-1 pt-1 border-t border-zinc-850/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span>Torneio</span>
                <ArrowUpRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>

            {/* Card 4: Hall da Fama */}
            <button
              onClick={() => setView('RANKINGS')}
              className="group p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-850/90 border border-cyan-900/30 hover:border-cyan-500/60 text-left transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="w-6 h-6 rounded-md bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  Top 100
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                  Rankings
                </h4>
                <p className="text-[9px] font-mono text-zinc-400 truncate">
                  {currentRank.title}
                </p>
              </div>
              <div className="mt-1 pt-1 border-t border-zinc-850/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span>Placar</span>
                <ArrowUpRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          </div>
        );
      })()}

      {/* Abas Deslizantes Minimalistas: Clãs, Exame e Rankings */}
      <nav className="flex items-center justify-between gap-1.5 pb-2 border-b border-zinc-800/80 overflow-x-auto custom-scrollbar flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('clans')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition border ${
              activeTab === 'clans'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
            }`}
          >
            <GitFork className="w-3 h-3 stroke-[1.75]" /> Clãs
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition border ${
              activeTab === 'exam'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
            }`}
          >
            <Scroll className="w-3 h-3 stroke-[1.75]" /> Exame
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition border ${
              activeTab === 'rankings'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
            }`}
          >
            <Trophy className="w-3 h-3 stroke-[1.75]" /> Rankings
          </button>
        </div>

        {/* Botão de Expandir Tela Cheia */}
        <button
          onClick={() => {
            if (activeTab === 'clans') setView('CLAN_TREE');
            else if (activeTab === 'exam') setView('CHUNIN_EXAM');
            else if (activeTab === 'rankings') setView('RANKINGS');
          }}
          title="Expandir para Tela Cheia Dedicada"
          className="p-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </nav>

      {/* Conteúdo Dinâmico */}
      <div className="flex-1 overflow-y-auto mt-2.5 pr-1 custom-scrollbar">
        {/* ================================================================= */}
        {/* 1. ABA ÁRVORE DE CLÃS COM NÉVOA DA GUERRA & PRESTÍGIO             */}
        {/* ================================================================= */}
        {(activeTab === 'clans' || activeTab === 'gauntlet') && (
          <div className="space-y-3">
            {/* Card de Prestígio / Renascimento Shinobi Rebalanceado */}
            {(() => {
              const runChakra = stats.totalChakraEarned;
              const pendingPoints = calculatePendingAncestralChakra(runChakra);
              const canPrestige = runChakra.gte(PRESTIGE_THRESHOLD);
              const progressPct = Math.min(100, Math.max(0, runChakra.div(PRESTIGE_THRESHOLD).mul(100).toNumber()));

              return (
                <div className="p-3.5 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-amber-800/40 rounded-xl relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Sparkles className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                          Renascimento Shinobi (Prestígio)
                          <Badge variant="chakra">Nível Kage</Badge>
                        </h4>
                        <p className="text-[10px] text-zinc-400">
                          Reinicia geradores e técnicas em troca de Chakra Ancestral permanente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3 pt-2.5 border-t border-zinc-800/70 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Progresso até o Limiar (10T / 10¹³):</span>
                      <span className={canPrestige ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                        {formatBigNumber(runChakra)} / {formatBigNumber(PRESTIGE_THRESHOLD)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-900 rounded-sm overflow-hidden">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className={`h-full transition-all duration-300 rounded-sm ${
                          canPrestige ? 'bg-amber-400' : 'bg-zinc-600'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-zinc-400">Chakra Ancestral a receber:</span>
                      <span className="text-amber-300 font-bold">
                        +{pendingPoints} Ancestral
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      disabled={!canPrestige}
                      onClick={() => {
                        if (confirm(`Confirma o Renascimento Shinobi? Você receberá +${pendingPoints} Chakra Ancestral e reiniciará seu progresso na run atual.`)) {
                          performPrestige();
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-medium font-mono transition border flex items-center justify-center gap-2 ${
                        canPrestige
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm cursor-pointer'
                          : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {canPrestige
                        ? `Executar Renascimento (+${pendingPoints} Ancestral)`
                        : `Bloqueado: Requer ${formatBigNumber(PRESTIGE_THRESHOLD)} Chakra`}
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Chakra Ancestral Disponível
              </span>
              <span className="text-sm font-mono font-medium text-amber-300">
                {chakraAncestral.toString()}
              </span>
            </div>

            <div className="space-y-2">
              {Object.values(CLAN_NODES).map((node) => {
                const isUnlocked = !!clanNodes[node.id];
                const canAfford = chakraAncestral.gte(node.cost);

                return (
                  <div
                    key={node.id}
                    className={`p-3 rounded-lg border transition ${
                      isUnlocked
                        ? 'bg-zinc-850/90 border-zinc-700/80 shadow-sm'
                        : canAfford
                        ? 'bg-zinc-900/60 border-zinc-700/80 hover:border-zinc-600'
                        : 'bg-zinc-950/40 border-zinc-850 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 flex-shrink-0">
                          <IconRenderer name={node.icon} className="w-4 h-4 stroke-[1.75]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-200">{node.name}</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{node.desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {isUnlocked ? (
                          <Badge variant="production">Desperto</Badge>
                        ) : (
                          `Custo: ${node.cost} Ancestral`
                        )}
                      </span>

                      {!isUnlocked && (
                        <button
                          disabled={!canAfford}
                          onClick={() => buyClanNode(node.id)}
                          className={`px-3 py-1 rounded text-[11px] font-medium transition border ${
                            canAfford
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 shadow-sm'
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          }`}
                        >
                          Despertar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. ABA EXAME CHŪNIN                                              */}
        {/* ================================================================= */}
        {activeTab === 'exam' && (
          <div className="space-y-3 p-1">
            <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Scroll className="w-4 h-4 text-zinc-400 stroke-[1.75]" /> Exame Chūnin Oficial
              </h4>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Supere as três etapas do exame (Prova Teórica, Floresta da Morte e Torneio 1v1).
              </p>

              <div className="space-y-2 text-left text-xs mb-4 font-mono">
                <div className="p-2.5 bg-zinc-900/60 rounded-md border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">1ª Fase: Prova Teórica</span>
                  <Badge variant="neutral">Furtividade</Badge>
                </div>
                <div className="p-2.5 bg-zinc-900/60 rounded-md border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">2ª Fase: Floresta da Morte</span>
                  <Badge variant="neutral">180s Limite</Badge>
                </div>
                <div className="p-2.5 bg-zinc-900/60 rounded-md border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">3ª Fase: Torneio na Arena</span>
                  <Badge variant="chakra">QTE & Parry</Badge>
                </div>
              </div>

              <button
                onClick={() => setView('CHUNIN_EXAM')}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-mono text-xs rounded-md border border-zinc-700 shadow-sm transition cursor-pointer"
              >
                Abrir Pavilhão do Exame
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. ABA RANKINGS                                                  */}
        {/* ================================================================= */}
        {activeTab === 'rankings' && <RankingDashboard />}
      </div>
    </aside>
  );
};
