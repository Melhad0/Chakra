import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import {
  SHINOBI_RANKS,
  RIVAL_SHINOBIS,
  getCurrentRank,
  getNextRank,
  calculateRankProgress,
} from '../../constants/rankings';
import { GAUNTLET_BOSSES } from '../../data/gauntletBosses';
import { LeaderboardType, GlobalLeaderboardEntry, RankingSyncPayload } from '../../types/rankings';
import { IconRenderer } from '../common/IconRenderer';
import { apiUrl } from '../../config/api';
import {
  Trophy,
  Medal,
  Target,
  Zap,
  RefreshCw,
  Gift,
  CheckCircle2,
  Users,
  Swords,
  Globe2,
} from 'lucide-react';

export const RankingDashboard: React.FC = () => {
  const stats = useGameStore((s) => s.stats);
  const claimedRankRewards = useGameStore((s) => s.claimedRankRewards);
  const claimRankReward = useGameStore((s) => s.claimRankReward);
  const currentUser = useGameStore((s) => s.currentUser);
  const passedExams = useGameStore((s) => s.passedExams);
  const generators = useGameStore((s) => s.generators);
  const gauntlet = useGameStore((s) => s.gauntlet);

  const [activeLeaderboard, setActiveLeaderboard] = useState<LeaderboardType>('peakCps');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [cloudRankings, setCloudRankings] = useState<GlobalLeaderboardEntry[]>([]);
  const [isCloudLoaded, setIsCloudLoaded] = useState<boolean>(false);

  const sessionClicks = stats.manualClicksSession || stats.manualClicksCurrentSession || 0;
  const allTimeClicks = stats.manualClicksAllTime;
  const highestCPS = stats.highestCPSRecord;
  const prestiges = stats.totalPrestiges;

  const totalTroops = useMemo(() => {
    return Object.values(generators).reduce((acc, g) => acc + g.level, 0);
  }, [generators]);

  const gauntletBossMax = gauntlet.highestBossDefeated || gauntlet.maxUnlockedBoss || 0;

  // Determina patente atual e próxima
  const currentRank = useMemo(
    () => getCurrentRank(allTimeClicks, highestCPS, prestiges, passedExams),
    [allTimeClicks, highestCPS, prestiges, passedExams]
  );
  const nextRank = useMemo(() => getNextRank(currentRank.id), [currentRank.id]);

  const progress = useMemo(
    () => calculateRankProgress(currentRank, nextRank, allTimeClicks, highestCPS, prestiges),
    [currentRank, nextRank, allTimeClicks, highestCPS, prestiges]
  );

  const fetchTopRankings = useCallback(async (cat: LeaderboardType) => {
    try {
      const categoryParam =
        cat === 'peakCps' ? 'cps' :
        cat === 'totalTroops' ? 'troops' :
        cat === 'gauntletBoss' ? 'gauntlet' : 'clicks';

      const usernameParam = currentUser?.username
        ? `&username=${encodeURIComponent(currentUser.username)}`
        : '';

      const res = await fetch(apiUrl(`/api/rankings/top?category=${categoryParam}${usernameParam}&limit=50`));
      if (res.ok) {
        const payload = await res.json();
        if (payload.status === 'success' && Array.isArray(payload.rankings) && payload.rankings.length > 0) {
          setCloudRankings(payload.rankings);
          setIsCloudLoaded(true);
          return;
        }
      }
      setIsCloudLoaded(false);
    } catch {
      setIsCloudLoaded(false);
    }
  }, [currentUser?.username]);

  // Sync com o Backend Neon (/api/rankings/sync)
  const handleSyncRankings = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      let numericCPS = 0;
      try {
        numericCPS = highestCPS.toNumber();
      } catch {
        numericCPS = 0;
      }

      const payload: RankingSyncPayload = {
        username: currentUser.username,
        ninjaId: currentUser.ninjaId,
        manualClicksSession: sessionClicks,
        manualClicksAllTime: allTimeClicks,
        highestCpsRecord: highestCPS.toString(),
        highestCpsNum: numericCPS,
        totalTroopsRecruited: totalTroops,
        gauntletBossMax: gauntletBossMax,
        totalPrestiges: prestiges,
        currentRank: currentRank.id,
        avatar: currentUser.avatar || 'naruto',
        ninjaTitle: currentRank.title,
      };

      const res = await fetch(apiUrl('/api/rankings/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSyncStatus('Sincronizado na Nuvem');
        setTimeout(() => setSyncStatus(null), 3000);
        await fetchTopRankings(activeLeaderboard);
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
    fetchTopRankings(activeLeaderboard);
  }, [activeLeaderboard, fetchTopRankings]);

  // Auto-sync a cada 60s
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentUser && currentUser.username !== 'convidado') {
        handleSyncRankings();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentUser, sessionClicks, allTimeClicks, highestCPS, prestiges, totalTroops, gauntletBossMax]);

  // Monta tabela comparativa dinâmica do Hall da Fama / Rivalry Board
  const rivalryList = useMemo(() => {
    if (isCloudLoaded && cloudRankings.length > 0) {
      return cloudRankings.map((entry, idx) => {
        const isUser =
          currentUser?.username &&
          entry.username.toLowerCase() === currentUser.username.toLowerCase();

        return {
          position: idx + 1,
          isUser: !!isUser,
          name: isUser ? (currentUser?.fullName || entry.username) : entry.username,
          title: entry.ninjaTitle || entry.currentRank || 'Shinobi Ativo',
          avatar: entry.avatar || 'naruto',
          highestCPS: entry.highestCpsRecord || '0',
          totalTroops: entry.totalTroopsRecruited || 0,
          gauntletBoss: entry.gauntletBossMax || 0,
          allTimeClicks: entry.manualClicksAllTime || 0,
          prestiges: entry.totalPrestiges || 0,
        };
      });
    }

    const userEntry = {
      isUser: true,
      name: currentUser?.fullName || 'Você (Shinobi)',
      title: currentRank.title,
      avatar: currentUser?.avatar || 'naruto',
      sessionClicks,
      allTimeClicks,
      highestCPS: highestCPS.toString(),
      totalTroops,
      gauntletBoss: gauntletBossMax,
      prestiges,
    };

    const combined = RIVAL_SHINOBIS.map((r, idx) => ({
      isUser: false,
      name: r.name,
      title: r.title,
      avatar: r.avatar,
      sessionClicks: r.sessionClicks,
      allTimeClicks: r.allTimeClicks,
      highestCPS: r.peakCPS.toString(),
      totalTroops: Math.max(10, (10 - idx) * 35),
      gauntletBoss: Math.max(1, 15 - idx),
      prestiges: r.prestiges,
    }));

    combined.push(userEntry);

    // Ordenação dinâmica pelo placar selecionado
    if (activeLeaderboard === 'totalTroops') {
      combined.sort((a, b) => b.totalTroops - a.totalTroops);
    } else if (activeLeaderboard === 'gauntletBoss') {
      combined.sort((a, b) => b.gauntletBoss - a.gauntletBoss);
    } else if (activeLeaderboard === 'allTimeClicks') {
      combined.sort((a, b) => b.allTimeClicks - a.allTimeClicks);
    } else {
      combined.sort((a, b) => (D(b.highestCPS).gt(D(a.highestCPS)) ? 1 : -1));
    }

    return combined.map((entry, idx) => ({ ...entry, position: idx + 1 }));
  }, [
    isCloudLoaded,
    cloudRankings,
    activeLeaderboard,
    currentUser,
    currentRank,
    sessionClicks,
    allTimeClicks,
    highestCPS,
    totalTroops,
    gauntletBossMax,
    prestiges,
  ]);

  const leaderboards: Array<{ id: LeaderboardType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'peakCps', label: 'Pico de CPS', icon: Zap },
    { id: 'totalTroops', label: 'Tropas', icon: Users },
    { id: 'gauntletBoss', label: 'Chefes Gauntlet', icon: Swords },
    { id: 'allTimeClicks', label: 'Cliques', icon: Target },
  ];

  const formatLeaderboardScore = (ninja: {
    highestCPS: string;
    totalTroops: number;
    gauntletBoss: number;
    allTimeClicks: number;
  }) => {
    if (activeLeaderboard === 'peakCps') {
      return `${formatBigNumber(D(ninja.highestCPS))} CPS`;
    }
    if (activeLeaderboard === 'totalTroops') {
      return `${ninja.totalTroops.toLocaleString('pt-BR')} Tropas`;
    }
    if (activeLeaderboard === 'gauntletBoss') {
      const boss = GAUNTLET_BOSSES.find((b) => b.id === ninja.gauntletBoss);
      return boss ? `Chefe #${ninja.gauntletBoss} (${boss.name})` : `Chefe #${ninja.gauntletBoss}`;
    }
    return `${ninja.allTimeClicks.toLocaleString('pt-BR')} clq`;
  };

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

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              <Globe2 className="w-2.5 h-2.5 text-cyan-400" />
              <span>{isCloudLoaded ? 'Nuvem' : 'Local'}</span>
            </div>

            <button
              onClick={handleSyncRankings}
              disabled={isSyncing}
              title="Sincronizar com o Banco Neon Postgres"
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
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
          <div className="mt-2 pt-2 border-t border-zinc-850 text-center text-[10px] font-mono text-amber-400">
            🌟 Grau Máximo Alcançado: Rikudō Sennin Supremo
          </div>
        )}
      </div>

      {/* 2. Seletor de Categoria do Leaderboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-shrink-0">
        {leaderboards.map((board) => {
          const Icon = board.icon;
          const isActive = activeLeaderboard === board.id;
          return (
            <button
              key={board.id}
              onClick={() => setActiveLeaderboard(board.id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition border ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                  : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border-zinc-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{board.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tabela de Placares do Hall da Fama */}
      <div className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-850 rounded-xl bg-zinc-950/40">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-zinc-950/80 text-zinc-400 text-[10px] uppercase tracking-wider sticky top-0 border-b border-zinc-850 z-10 backdrop-blur-md">
            <tr>
              <th className="py-2 px-3 w-10 text-center">Pos</th>
              <th className="py-2 px-3">Shinobi</th>
              <th className="py-2 px-3">Título</th>
              <th className="py-2 px-3 text-right">Placar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {rivalryList.map((ninja) => (
              <tr
                key={`${ninja.name}-${ninja.position}`}
                className={`transition ${
                  ninja.isUser
                    ? 'bg-amber-950/30 text-amber-300 font-bold border-l-2 border-amber-400'
                    : 'hover:bg-zinc-900/50 text-zinc-300'
                }`}
              >
                <td className="py-2.5 px-3 text-center">
                  {ninja.position === 1 ? (
                    <Medal className="w-4 h-4 text-amber-400 mx-auto" />
                  ) : ninja.position === 2 ? (
                    <Medal className="w-4 h-4 text-zinc-300 mx-auto" />
                  ) : ninja.position === 3 ? (
                    <Medal className="w-4 h-4 text-amber-700 mx-auto" />
                  ) : (
                    <span className="text-zinc-500 font-bold">#{ninja.position}</span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-300">
                      <IconRenderer name={ninja.avatar} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate max-w-[130px] font-semibold">{ninja.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-zinc-400 truncate max-w-[110px]">
                  {ninja.title}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                  {formatLeaderboardScore(ninja)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Resumo de Recompensas de Patente Resgatáveis */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex-shrink-0">
        <h4 className="text-xs font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recompensas de Graduação</span>
        </h4>

        <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
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
                className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                  isClaimed
                    ? 'bg-zinc-900/30 border-zinc-850 opacity-60'
                    : qualifies
                    ? 'bg-emerald-950/20 border-emerald-700/50'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                }`}
              >
                <div>
                  <span className="font-semibold text-zinc-200">{rank.title}</span>
                  <p className="text-[10px] text-zinc-400">{rank.reward.title}</p>
                </div>

                {isClaimed ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Resgatado
                  </span>
                ) : (
                  <button
                    disabled={!qualifies}
                    onClick={() => claimRankReward(rank.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition border ${
                      qualifies
                        ? 'bg-emerald-600 text-zinc-950 border-emerald-500 hover:bg-emerald-500 cursor-pointer shadow-sm active:scale-95'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    Resgatar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
