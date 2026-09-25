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
import { LeaderboardType, ShinobiRankId } from '../../types/rankings';
import { IconRenderer } from '../common/IconRenderer';
import {
  Award,
  Trophy,
  Medal,
  Target,
  BarChart3,
  Zap,
  TrendingUp,
  RefreshCw,
  Gift,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const RankingDashboard: React.FC = () => {
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
      setSyncStatus('Backend indisponível');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync a cada 60s
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentUser) {
        handleSyncRankings();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentUser, sessionClicks, allTimeClicks, highestCPS, prestiges]);

  // Monta tabela comparativa dinâmica do Hall da Fama / Rivalry Board
  const rivalryList = useMemo(() => {
    const userEntry = {
      isUser: true,
      name: currentUser?.fullName || 'Você (Shinobi)',
      title: currentRank.title,
      rankId: currentRank.id,
      avatar: 'user',
      sessionClicks,
      allTimeClicks,
      peakCPS: highestCPS,
      prestiges,
      quote: 'Determinação inabalável da Chama da Folha.',
    };

    const combined = [...RIVAL_SHINOBIS, userEntry];

    // Ordenação dinâmica pelo placar selecionado
    if (activeLeaderboard === 'sessionClicks') {
      combined.sort((a, b) => b.sessionClicks - a.sessionClicks);
    } else if (activeLeaderboard === 'allTimeClicks') {
      combined.sort((a, b) => b.allTimeClicks - a.allTimeClicks);
    } else if (activeLeaderboard === 'peakCps') {
      combined.sort((a, b) => (b.peakCPS.lt(a.peakCPS) ? -1 : 1));
    } else {
      combined.sort((a, b) => b.prestiges - a.prestiges);
    }

    return combined.map((entry, idx) => ({ ...entry, position: idx + 1 }));
  }, [
    activeLeaderboard,
    currentUser,
    currentRank,
    sessionClicks,
    allTimeClicks,
    highestCPS,
    prestiges,
  ]);

  const leaderboards: Array<{ id: LeaderboardType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'peakCps', label: 'Pico de Poder', icon: TrendingUp },
    { id: 'sessionClicks', label: 'Mestre dos Selos', icon: Zap },
    { id: 'allTimeClicks', label: 'Lenda Histórica', icon: Medal },
    { id: 'prestiges', label: 'Reencarnações', icon: Target },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-3">
      {/* 1. Card de Patente Shinobi & Barra de Progresso com Gradiente */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-850 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
              <Trophy className="w-5 h-5 text-amber-400 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-zinc-100">{currentRank.title}</h3>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${currentRank.badgeClass}`}
                >
                  Patente Canônica
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">{currentRank.subtitle}</p>
            </div>
          </div>

          <button
            onClick={handleSyncRankings}
            disabled={isSyncing}
            title="Sincronizar com o Banco de Dados do Servidor"
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {syncStatus && (
          <div className="text-[10px] font-mono text-cyan-400 text-right mb-1">
            {syncStatus}
          </div>
        )}

        {/* Barra de Progresso Suave até a Próxima Patente */}
        {nextRank ? (
          <div className="mt-2.5 pt-2.5 border-t border-zinc-850">
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="text-zinc-400">
                Avanço para <span className="text-zinc-200 font-semibold">{nextRank.title}</span>
              </span>
              <span className="text-cyan-400 font-semibold">{progress.overallProgress}%</span>
            </div>

            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.overallProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-2 text-[9px] font-mono text-zinc-500">
              <div className="bg-zinc-900/60 p-1 rounded border border-zinc-850 text-center">
                <span>Cliques: </span>
                <span className="text-zinc-300 font-medium">
                  {allTimeClicks} / {nextRank.minClicksAllTime}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-1 rounded border border-zinc-850 text-center">
                <span>CPS: </span>
                <span className="text-zinc-300 font-medium">
                  {formatBigNumber(highestCPS)} / {formatBigNumber(nextRank.minCPS)}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-1 rounded border border-zinc-850 text-center">
                <span>Prestígios: </span>
                <span className="text-zinc-300 font-medium">
                  {prestiges} / {nextRank.minPrestiges}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 pt-2 border-t border-zinc-850 text-center text-xs font-mono text-fuchsia-400 font-semibold">
            Patente Máxima Atingida: Deus Shinobi Rikudou
          </div>
        )}
      </div>

      {/* 2. Recompensas Canônicas de Promoção (Promotion Milestones Trail) */}
      <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400 stroke-[1.75]" /> Recompensas Únicas de Promoção
          </span>
          <span className="text-[9px] font-mono text-zinc-500">Permanentes</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {SHINOBI_RANKS.filter((r) => r.id !== 'estudante').map((rank) => {
            const isClaimed = !!claimedRankRewards[rank.id];
            const qualifies =
              allTimeClicks >= rank.minClicksAllTime &&
              highestCPS.gte(rank.minCPS) &&
              prestiges >= rank.minPrestiges;

            return (
              <div
                key={rank.id}
                className={`flex-shrink-0 w-44 p-2.5 rounded-lg border flex flex-col justify-between transition ${
                  isClaimed
                    ? 'bg-zinc-900/30 border-zinc-850 opacity-60'
                    : qualifies
                    ? 'bg-zinc-900/80 border-amber-600/50 shadow-sm'
                    : 'bg-zinc-950/40 border-zinc-850 opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-zinc-200 truncate">
                      {rank.title}
                    </span>
                    {isClaimed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : !qualifies ? (
                      <Lock className="w-3 h-3 text-zinc-600" />
                    ) : null}
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-tight">
                    {rank.reward.description}
                  </p>
                </div>

                <div className="mt-2 pt-1 border-t border-zinc-800/60">
                  {isClaimed ? (
                    <span className="text-[9px] font-mono text-emerald-400 block text-center">
                      Resgatado
                    </span>
                  ) : (
                    <button
                      disabled={!qualifies}
                      onClick={() => claimRankReward(rank.id as ShinobiRankId)}
                      className={`w-full py-1 text-[9px] font-mono font-medium rounded transition ${
                        qualifies
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {qualifies ? 'Resgatar' : 'Bloqueado'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Seletor Segmented Control dos 4 Placares Independentes */}
      <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800/80 flex-shrink-0">
        {leaderboards.map((b) => {
          const Icon = b.icon;
          const isActive = activeLeaderboard === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setActiveLeaderboard(b.id)}
              className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-medium flex items-center justify-center gap-1.5 transition ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Icon className="w-3 h-3 stroke-[1.75]" />
              <span className="hidden sm:inline">{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Hall da Fama Local / Rivalry Board */}
      <div className="flex-1 bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-850 flex-shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400 stroke-[1.75]" /> Hall da Fama Shinobi
          </span>
          <span className="text-[9px] font-mono text-zinc-500">Rivalry Board</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 mt-2">
          {rivalryList.map((entry) => {
            const isUser = 'isUser' in entry && entry.isUser;

            // Formatação do valor do placar ativo
            let scoreDisplay = '';
            if (activeLeaderboard === 'peakCps') {
              scoreDisplay = `${formatBigNumber(entry.peakCPS)} CPS`;
            } else if (activeLeaderboard === 'sessionClicks') {
              scoreDisplay = `${entry.sessionClicks.toLocaleString()} cliques`;
            } else if (activeLeaderboard === 'allTimeClicks') {
              scoreDisplay = `${entry.allTimeClicks.toLocaleString()} cliques`;
            } else {
              scoreDisplay = `${entry.prestiges} prestígios`;
            }

            return (
              <div
                key={entry.name}
                className={`p-2 rounded-lg border transition flex items-center justify-between ${
                  isUser
                    ? 'bg-cyan-950/40 border-cyan-600/60 text-zinc-100 shadow-sm'
                    : entry.position === 1
                    ? 'bg-amber-950/20 border-amber-800/50 text-zinc-200'
                    : 'bg-zinc-900/40 border-zinc-850 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded flex items-center justify-center font-mono text-[11px] font-semibold flex-shrink-0">
                    {entry.position === 1 ? (
                      <Award className="w-4 h-4 text-amber-400" />
                    ) : entry.position === 2 ? (
                      <Medal className="w-4 h-4 text-zinc-300" />
                    ) : entry.position === 3 ? (
                      <Medal className="w-4 h-4 text-amber-600" />
                    ) : (
                      <span className="text-zinc-500">#{entry.position}</span>
                    )}
                  </div>

                  <div className="w-6 h-6 rounded bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 flex-shrink-0">
                    <IconRenderer name={entry.avatar} className="w-3.5 h-3.5 stroke-[1.75]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs truncate ${
                          isUser ? 'font-semibold text-cyan-300' : 'font-medium text-zinc-200'
                        }`}
                      >
                        {entry.name}
                      </span>
                      {isUser && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-900/60 border border-cyan-700/60 text-cyan-300">
                          Você
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 block truncate">{entry.title}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-mono font-medium block ${
                      isUser ? 'text-cyan-300 font-semibold' : 'text-zinc-300'
                    }`}
                  >
                    {scoreDisplay}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
