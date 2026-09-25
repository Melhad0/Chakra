import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  SHINOBI_RANKS,
  RIVAL_SHINOBIS,
  getCurrentRank,
  getNextRank,
  calculateRankProgress,
} from '../../constants/rankings';
import { LeaderboardType } from '../../types/rankings';
import { IconRenderer } from '../common/IconRenderer';
import { ViewHeader } from './ViewHeader';
import { Badge } from '../common/Badge';
import {
  Trophy,
  Award,
  Medal,
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  Gift,
} from 'lucide-react';

export const RankingsView: React.FC = () => {
  const stats = useGameStore((s) => s.stats);
  const claimedRankRewards = useGameStore((s) => s.claimedRankRewards);
  const claimRankReward = useGameStore((s) => s.claimRankReward);
  const currentUser = useGameStore((s) => s.currentUser);

  const [activeLeaderboard, setActiveLeaderboard] = useState<LeaderboardType>('peakCps');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const sessionClicks = stats.manualClicksSession || stats.manualClicksCurrentSession || 0;
  const allTimeClicks = stats.manualClicksAllTime;
  const highestCPS = stats.highestCPSRecord;
  const prestiges = stats.totalPrestiges;

  // Determina patente atual e próxima
  const currentRank = useMemo(
    () => getCurrentRank(allTimeClicks, highestCPS, prestiges),
    [allTimeClicks, highestCPS, prestiges]
  );
  const nextRank = useMemo(() => getNextRank(currentRank.id), [currentRank.id]);

  const progress = useMemo(
    () => calculateRankProgress(currentRank, nextRank, allTimeClicks, highestCPS, prestiges),
    [currentRank, nextRank, allTimeClicks, highestCPS, prestiges]
  );

  // Sync com o Backend Flask (/api/rankings/sync)
  const handleSyncRankings = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const payload = {
        username: currentUser.username,
        ninjaId: currentUser.ninjaId,
        manualClicksSession: sessionClicks,
        manualClicksAllTime: allTimeClicks,
        highestCpsRecord: highestCPS.toString(),
        totalPrestiges: prestiges,
        currentRank: currentRank.id,
      };

      const res = await fetch('/api/rankings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSyncStatus('Sincronizado');
        setTimeout(() => setSyncStatus(null), 3000);
      } else {
        setSyncStatus('Falha ao sincronizar');
        setTimeout(() => setSyncStatus(null), 3000);
      }
    } catch {
      setSyncStatus('Sincronizado Localmente');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentUser) {
        handleSyncRankings();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentUser, sessionClicks, allTimeClicks, highestCPS, prestiges]);

  // Lista dinâmica do leaderboard selecionado mesclando o jogador com os rivais
  const sortedRivals = useMemo(() => {
    const playerEntry = {
      isPlayer: true,
      name: currentUser ? currentUser.fullName : 'Você (Shinobi)',
      title: currentRank.title,
      rankId: currentRank.id,
      avatar: 'ninja_mask',
      sessionClicks,
      allTimeClicks,
      peakCPS: highestCPS,
      prestiges,
      quote: 'Determinado a superar todos os ancestrais da Folha.',
    };

    const rivalsList = RIVAL_SHINOBIS.map((r) => ({
      ...r,
      isPlayer: false,
    }));

    const combined = [...rivalsList, playerEntry];

    return combined.sort((a, b) => {
      if (activeLeaderboard === 'sessionClicks') {
        return b.sessionClicks - a.sessionClicks;
      }
      if (activeLeaderboard === 'allTimeClicks') {
        return b.allTimeClicks - a.allTimeClicks;
      }
      if (activeLeaderboard === 'peakCps') {
        return b.peakCPS.gt(a.peakCPS) ? 1 : -1;
      }
      return b.prestiges - a.prestiges;
    });
  }, [activeLeaderboard, currentUser, currentRank, sessionClicks, allTimeClicks, highestCPS, prestiges]);

  const playerPosition = useMemo(() => {
    return sortedRivals.findIndex((r) => r.isPlayer) + 1;
  }, [sortedRivals]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#08090d] text-zinc-100 overflow-hidden select-none">
      {/* Cabeçalho Fixo Universal */}
      <ViewHeader
        title="Hall da Fama e Patentes Shinobi"
        subtitle="Registros Oficiais e Quadro de Honra da Aldeia da Folha"
        badgeText={`Graduação: ${currentRank.title}`}
        badgeVariant="chakra"
        icon={<Trophy className="w-4 h-4 text-amber-400 stroke-[1.75]" />}
      />

      {/* Conteúdo Principal em 2 Colunas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6">
        {/* ================================================================= */}
        {/* COLUNA ESQUERDA: QUADRO DE LÍDERES & TABELA DE RIVAIS              */}
        {/* ================================================================= */}
        <section className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 flex flex-col overflow-hidden">
          {/* Topo do Placares: Seletor de 4 Abas Segmentadas */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 flex-wrap">
              <button
                onClick={() => setActiveLeaderboard('sessionClicks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'sessionClicks'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-orange-400" /> Mestre dos Selos
              </button>

              <button
                onClick={() => setActiveLeaderboard('allTimeClicks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'allTimeClicks'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Lenda Histórica
              </button>

              <button
                onClick={() => setActiveLeaderboard('peakCps')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'peakCps'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Pico de Poder
              </button>

              <button
                onClick={() => setActiveLeaderboard('prestiges')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'prestiges'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Reencarnações
              </button>
            </div>

            {/* Sincronização */}
            <div className="flex items-center gap-2">
              {syncStatus && (
                <span className="text-[11px] font-mono text-emerald-400 font-medium">{syncStatus}</span>
              )}
              <button
                onClick={handleSyncRankings}
                disabled={isSyncing}
                title="Sincronizar dados com o Livro Bingo da Aldeia"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Destaque da Posição do Jogador */}
          <div className="my-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                #{playerPosition}
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Sua Colocação no Placar Oficial:</span>
                <strong className="text-zinc-100 text-sm">{currentUser ? currentUser.fullName : 'Você'}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-zinc-400 block text-[10px]">Métrica Ativa:</span>
              <strong className="text-amber-300 text-sm">
                {activeLeaderboard === 'sessionClicks' && `${sessionClicks.toLocaleString()} cliques`}
                {activeLeaderboard === 'allTimeClicks' && `${allTimeClicks.toLocaleString()} cliques`}
                {activeLeaderboard === 'peakCps' && `${formatBigNumber(highestCPS)} CPS`}
                {activeLeaderboard === 'prestiges' && `${prestiges} renascimentos`}
              </strong>
            </div>
          </div>

          {/* Tabela Comparativa de Rivais Ilustres */}
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-800/80 rounded-xl bg-zinc-950/40">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 text-[10px] uppercase tracking-wider sticky top-0 border-b border-zinc-800 z-10">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">Pos</th>
                  <th className="py-2.5 px-4">Shinobi</th>
                  <th className="py-2.5 px-4">Patente</th>
                  <th className="py-2.5 px-4 text-right">Registro Recorde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {sortedRivals.map((ninja, index) => {
                  const isCurrentPlayer = ninja.isPlayer;

                  return (
                    <tr
                      key={ninja.name}
                      className={`transition ${
                        isCurrentPlayer
                          ? 'bg-amber-950/30 font-bold text-amber-300'
                          : 'hover:bg-zinc-850/40 text-zinc-300'
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        {index === 0 ? (
                          <Medal className="w-4 h-4 text-amber-400 mx-auto" />
                        ) : index === 1 ? (
                          <Medal className="w-4 h-4 text-zinc-300 mx-auto" />
                        ) : index === 2 ? (
                          <Medal className="w-4 h-4 text-amber-700 mx-auto" />
                        ) : (
                          <span className="text-zinc-500 font-bold">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-300">
                            <IconRenderer name={ninja.avatar} className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold block">{ninja.name}</span>
                            <span className="text-[10px] text-zinc-500 font-normal truncate block max-w-[200px]">
                              {ninja.quote}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{ninja.title}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {activeLeaderboard === 'sessionClicks' && `${ninja.sessionClicks.toLocaleString()} clq`}
                        {activeLeaderboard === 'allTimeClicks' && `${ninja.allTimeClicks.toLocaleString()} clq`}
                        {activeLeaderboard === 'peakCps' && `${formatBigNumber(ninja.peakCPS)}`}
                        {activeLeaderboard === 'prestiges' && `${ninja.prestiges} rnc`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================================================================= */}
        {/* COLUNA DIREITA: PATENTE ATUAL & RECOMPENSAS DE GRADUAÇÃO          */}
        {/* ================================================================= */}
        <aside className="w-full lg:w-96 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Cartão de Patente Atual */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 shadow-md">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block mb-2">
                Graduação Ninja Oficial
              </span>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-amber-400">
                  <Award className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">{currentRank.title}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentRank.subtitle}</p>
                </div>
              </div>

              {/* Barra de Progresso até a próxima patente */}
              {nextRank && (
                <div className="mt-4 pt-3 border-t border-zinc-850">
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>Próxima: {nextRank.title}</span>
                    <strong className="text-amber-400">{progress.overallProgress}%</strong>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress.overallProgress}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Patentes & Resgate de Recompensas de Promoção */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-400" /> Recompensas de Graduação
              </h4>

              <div className="space-y-2.5">
                {SHINOBI_RANKS.map((rank) => {
                  const isClaimed = !!claimedRankRewards[rank.id];
                  const qualifies =
                    allTimeClicks >= rank.minClicksAllTime &&
                    highestCPS.gte(rank.minCPS) &&
                    prestiges >= rank.minPrestiges;

                  if (rank.id === 'estudante') return null;

                  return (
                    <div
                      key={rank.id}
                      className={`p-3 rounded-xl border text-xs font-mono transition ${
                        isClaimed
                          ? 'bg-zinc-950/40 border-zinc-850 opacity-60'
                          : qualifies
                          ? 'bg-emerald-950/20 border-emerald-700/50 shadow-sm'
                          : 'bg-zinc-950/60 border-zinc-850/80 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-200">{rank.title}</span>
                            {isClaimed && <Badge variant="neutral">Resgatado</Badge>}
                          </div>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            [{rank.reward.title}]: {rank.reward.description}
                          </span>
                        </div>

                        {!isClaimed && (
                          <button
                            disabled={!qualifies}
                            onClick={() => claimRankReward(rank.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex-shrink-0 ${
                              qualifies
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-sm cursor-pointer'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                          >
                            Resgatar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
