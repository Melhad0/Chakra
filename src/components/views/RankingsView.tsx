import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import {
  SHINOBI_RANKS,
  getCurrentRank,
  getNextRank,
  calculateRankProgress,
} from '../../constants/rankings';
import { GAUNTLET_BOSSES } from '../../data/gauntletBosses';
import { LeaderboardType, GlobalLeaderboardEntry, RankingSyncPayload } from '../../types/rankings';
import { IconRenderer } from '../common/IconRenderer';
import { ViewHeader } from './ViewHeader';
import { apiUrl } from '../../config/api';
import {
  Trophy,
  Award,
  Medal,
  Target,
  Zap,
  RefreshCw,
  Gift,
  Users,
  Swords,
  Globe2,
} from 'lucide-react';

export const RankingsView: React.FC = () => {
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
  const [cloudPlayerRank, setCloudPlayerRank] = useState<number | null>(null);
  const [isCloudLoaded, setIsCloudLoaded] = useState<boolean>(false);

  const sessionClicks = stats.manualClicksSession || stats.manualClicksCurrentSession || 0;
  const allTimeClicks = stats.manualClicksAllTime;
  const highestCPS = stats.highestCPSRecord;
  const prestiges = stats.totalPrestiges;

  // Total de tropas recrutadas
  const totalTroops = useMemo(() => {
    return Object.values(generators).reduce((acc, g) => acc + g.level, 0);
  }, [generators]);

  // Chefe máximo derrotado no Gauntlet
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

  // Busca do Leaderboard Global no Neon Postgres
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
          if (payload.playerRank) {
            setCloudPlayerRank(payload.playerRank);
          }
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

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentUser && currentUser.username !== 'convidado') {
        handleSyncRankings();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentUser, sessionClicks, allTimeClicks, highestCPS, prestiges, totalTroops, gauntletBossMax]);

  // Lista dinâmica do leaderboard (Alimentado 100% pelo Neon Postgres)
  const displayLeaderboard = useMemo(() => {
    if (isCloudLoaded) {
      if (cloudRankings.length === 0) {
        if (!currentUser) return [];
        return [
          {
            position: 1,
            isPlayer: true,
            name: currentUser.fullName || currentUser.username,
            title: currentRank.title,
            avatar: currentUser.avatar || 'naruto',
            highestCPS: highestCPS.toString(),
            totalTroops,
            gauntletBoss: gauntletBossMax,
            allTimeClicks,
            prestiges,
          },
        ];
      }

      return cloudRankings.map((entry, index) => {
        const isCurrentPlayer =
          currentUser?.username &&
          entry.username.toLowerCase() === currentUser.username.toLowerCase();

        return {
          position: index + 1,
          isPlayer: !!isCurrentPlayer,
          name: isCurrentPlayer ? (currentUser?.fullName || entry.username) : entry.username,
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

    if (!currentUser) return [];

    return [
      {
        position: 1,
        isPlayer: true,
        name: currentUser.fullName || currentUser.username,
        title: currentRank.title,
        avatar: currentUser.avatar || 'naruto',
        highestCPS: highestCPS.toString(),
        totalTroops,
        gauntletBoss: gauntletBossMax,
        allTimeClicks,
        prestiges,
      },
    ];
  }, [
    isCloudLoaded,
    cloudRankings,
    currentUser,
    currentRank,
    highestCPS,
    totalTroops,
    gauntletBossMax,
    allTimeClicks,
    prestiges,
  ]);

  const playerPosition = useMemo(() => {
    if (cloudPlayerRank) return cloudPlayerRank;
    const found = displayLeaderboard.find((r) => r.isPlayer);
    return found ? found.position : 1;
  }, [cloudPlayerRank, displayLeaderboard]);

  const formatMetricDisplay = (entry: {
    highestCPS: string;
    totalTroops: number;
    gauntletBoss: number;
    allTimeClicks: number;
  }) => {
    if (activeLeaderboard === 'peakCps') {
      return `${formatBigNumber(D(entry.highestCPS))} CPS`;
    }
    if (activeLeaderboard === 'totalTroops') {
      return `${entry.totalTroops.toLocaleString('pt-BR')} Tropas`;
    }
    if (activeLeaderboard === 'gauntletBoss') {
      const boss = GAUNTLET_BOSSES.find((b) => b.id === entry.gauntletBoss);
      return boss ? `Chefe #${entry.gauntletBoss} (${boss.name})` : `Chefe #${entry.gauntletBoss}`;
    }
    return `${entry.allTimeClicks.toLocaleString('pt-BR')} clq`;
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#08090d] text-zinc-100 overflow-hidden select-none">
      {/* Cabeçalho Fixo Universal */}
      <ViewHeader
        title="Hall da Fama e Rankings Globais Shinobi"
        subtitle="Quadro de Honra Oficial da Aldeia da Folha sincronizado no Neon Postgres"
        badgeText={`Graduação: ${currentRank.title}`}
        badgeVariant="chakra"
        icon={<Trophy className="w-4 h-4 text-amber-400 stroke-[1.75]" />}
      />

      {/* Conteúdo Principal em 2 Colunas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6">
        {/* ================================================================= */}
        {/* COLUNA ESQUERDA: QUADRO DE LÍDERES GLOBAIS                        */}
        {/* ================================================================= */}
        <section className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-5 lg:p-6 flex flex-col overflow-hidden">
          {/* Topo do Placares: Seletor de 4 Abas Segmentadas */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800/80 flex-wrap">
              <button
                onClick={() => setActiveLeaderboard('peakCps')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'peakCps'
                    ? 'bg-zinc-800 text-emerald-300 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pico de Poder (CPS)</span>
              </button>

              <button
                onClick={() => setActiveLeaderboard('totalTroops')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'totalTroops'
                    ? 'bg-zinc-800 text-cyan-300 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exército Shinobi</span>
              </button>

              <button
                onClick={() => setActiveLeaderboard('gauntletBoss')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'gauntletBoss'
                    ? 'bg-zinc-800 text-rose-300 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>Mestres do Gauntlet</span>
              </button>

              <button
                onClick={() => setActiveLeaderboard('allTimeClicks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeLeaderboard === 'allTimeClicks'
                    ? 'bg-zinc-800 text-amber-300 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Cliques Manuais</span>
              </button>
            </div>

            {/* Status e Botão de Sincronização */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-850">
                <Globe2 className="w-3 h-3 text-cyan-400" />
                <span>{isCloudLoaded ? 'Neon Nuvem' : 'Local'}</span>
              </div>

              {syncStatus && (
                <span className="text-[11px] font-mono text-emerald-400 font-medium">{syncStatus}</span>
              )}

              <button
                onClick={handleSyncRankings}
                disabled={isSyncing}
                title="Sincronizar dados com o banco Neon Postgres"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          {/* Destaque da Posição do Jogador */}
          <div className="my-3.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-zinc-950/80 to-zinc-950/80 border border-amber-800/40 flex items-center justify-between font-mono text-xs shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm shadow-md">
                #{playerPosition}
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">
                  Sua Colocação Global no Placar:
                </span>
                <strong className="text-zinc-100 text-sm">{currentUser ? currentUser.fullName : 'Você'}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">
                Sua Métrica Atual:
              </span>
              <strong className="text-amber-300 text-sm">
                {activeLeaderboard === 'peakCps' && `${formatBigNumber(highestCPS)} CPS`}
                {activeLeaderboard === 'totalTroops' && `${totalTroops.toLocaleString('pt-BR')} Tropas`}
                {activeLeaderboard === 'gauntletBoss' && `Chefe #${gauntletBossMax}`}
                {activeLeaderboard === 'allTimeClicks' && `${allTimeClicks.toLocaleString('pt-BR')} cliques`}
              </strong>
            </div>
          </div>

          {/* Tabela Comparativa do Ranking Shinobi */}
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-800/80 rounded-xl bg-zinc-950/40">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-950/90 text-zinc-400 text-[10px] uppercase tracking-wider sticky top-0 border-b border-zinc-800 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">Pos</th>
                  <th className="py-2.5 px-4">Shinobi</th>
                  <th className="py-2.5 px-4">Patente</th>
                  <th className="py-2.5 px-4 text-right">Registro Recorde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {displayLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500 font-mono text-xs">
                      Nenhum shinobi ranqueado ainda no Neon PostgreSQL. Cadastre-se ou sincronize para inaugurar o Hall da Fama!
                    </td>
                  </tr>
                ) : (
                  displayLeaderboard.map((ninja, index) => {
                    const isCurrentPlayer = ninja.isPlayer;

                    return (
                      <tr
                        key={`${ninja.name}-${index}`}
                        className={`transition ${
                          isCurrentPlayer
                            ? 'bg-amber-950/40 font-bold text-amber-300 border-l-2 border-amber-400'
                            : 'hover:bg-zinc-850/40 text-zinc-300'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
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
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-300">
                              <IconRenderer name={ninja.avatar} className="w-4 h-4 stroke-[1.8]" />
                            </div>
                            <div>
                              <span className="font-semibold block truncate max-w-[200px]">{ninja.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{ninja.title}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                          {formatMetricDisplay(ninja)}
                        </td>
                      </tr>
                    );
                  })
                )}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-zinc-200">{rank.title}</span>
                        {isClaimed ? (
                          <span className="text-[10px] text-emerald-400 font-bold">Resgatado</span>
                        ) : (
                          <button
                            disabled={!qualifies}
                            onClick={() => claimRankReward(rank.id)}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition border ${
                              qualifies
                                ? 'bg-emerald-600 text-zinc-950 border-emerald-500 hover:bg-emerald-500 cursor-pointer shadow-sm active:scale-95'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                          >
                            Resgatar
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{rank.reward.description}</p>
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
