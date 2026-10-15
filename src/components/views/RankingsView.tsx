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
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

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

  // Lista dinâmica do leaderboard
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
    <div className="w-screen h-screen flex flex-col bg-[#07080c] text-zinc-100 overflow-hidden select-none relative">
      {/* Luzes de Fundo Ambientais */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho Fixo Universal */}
      <ViewHeader
        title="Hall da Fama & Rankings Globais"
        subtitle="Quadro de Honra Oficial da Aldeia Shinobi sincronizado na nuvem"
        badgeText={`Graduação: ${currentRank.title}`}
        badgeVariant="chakra"
        icon={<Trophy className="w-4 h-4 text-amber-400 stroke-[2]" />}
      />

      {/* Conteúdo Principal em 2 Colunas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6 relative z-10">
        {/* ================================================================= */}
        {/* COLUNA ESQUERDA: QUADRO DE LÍDERES GLOBAIS                        */}
        {/* ================================================================= */}
        <section className="flex-1 bg-gradient-to-b from-zinc-900/80 via-zinc-950/85 to-[#090a0f]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl p-4 lg:p-6 flex flex-col overflow-hidden relative group/board">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent pointer-events-none" />

          {/* Topo dos Placares: Seletor de 4 Abas Segmentadas */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 gap-3 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800/80 flex-wrap shadow-inner">
              <button
                onClick={() => setActiveLeaderboard('peakCps')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  activeLeaderboard === 'peakCps'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pico de CPS</span>
              </button>

              <button
                onClick={() => setActiveLeaderboard('totalTroops')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  activeLeaderboard === 'totalTroops'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exército Shinobi</span>
              </button>

              <button
                onClick={() => setActiveLeaderboard('gauntletBoss')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  activeLeaderboard === 'gauntletBoss'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>Gauntlet Chefes</span>
              </button>

              <button
                onClick={() => setActiveLeaderboard('allTimeClicks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  activeLeaderboard === 'allTimeClicks'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Cliques Manuais</span>
              </button>
            </div>

            {/* Status e Botão de Sincronização */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{isCloudLoaded ? 'Nuvem Conectada' : 'Modo Offline'}</span>
              </div>

              {syncStatus && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold animate-pulse">
                  {syncStatus}
                </span>
              )}

              <button
                onClick={handleSyncRankings}
                disabled={isSyncing}
                title="Sincronizar dados com o banco Neon Postgres"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 hover:border-amber-500/50 rounded-xl text-xs font-mono text-zinc-200 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-zinc-400'}`} />
                <span className="font-semibold">Sincronizar</span>
              </button>
            </div>
          </div>

          {/* Destaque da Posição do Jogador com Efeito Holográfico */}
          <div className="my-3.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-zinc-900/90 to-zinc-950/90 border border-amber-500/40 flex items-center justify-between font-mono text-xs shadow-lg shadow-amber-950/10 flex-shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-full bg-amber-500/5 rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-400/60 flex items-center justify-center text-amber-300 font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                #{playerPosition}
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">
                  Sua Colocação no Ranking:
                </span>
                <strong className="text-white text-sm font-sans flex items-center gap-1.5">
                  {currentUser ? currentUser.fullName : 'Você'}
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                </strong>
              </div>
            </div>

            <div className="text-right relative z-10">
              <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">
                Registro Atual:
              </span>
              <strong className="text-amber-300 text-sm font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                {activeLeaderboard === 'peakCps' && `${formatBigNumber(highestCPS)} CPS`}
                {activeLeaderboard === 'totalTroops' && `${totalTroops.toLocaleString('pt-BR')} Tropas`}
                {activeLeaderboard === 'gauntletBoss' && `Chefe #${gauntletBossMax}`}
                {activeLeaderboard === 'allTimeClicks' && `${allTimeClicks.toLocaleString('pt-BR')} cliques`}
              </strong>
            </div>
          </div>

          {/* Tabela Comparativa do Ranking Shinobi */}
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-800/80 rounded-xl bg-zinc-950/50 shadow-inner">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-950/95 text-zinc-400 text-[10px] uppercase tracking-wider sticky top-0 border-b border-zinc-800 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-4 w-14 text-center">Pos</th>
                  <th className="py-3 px-4">Shinobi</th>
                  <th className="py-3 px-4">Patente</th>
                  <th className="py-3 px-4 text-right">Registro Recorde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {displayLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-zinc-500 font-mono text-xs">
                      Nenhum shinobi ranqueado ainda. Sincronize sua conta para inaugurar o Hall da Fama!
                    </td>
                  </tr>
                ) : (
                  displayLeaderboard.map((ninja, index) => {
                    const isCurrentPlayer = ninja.isPlayer;

                    return (
                      <tr
                        key={`${ninja.name}-${index}`}
                        className={`transition-all duration-200 group/row ${
                          isCurrentPlayer
                            ? 'bg-amber-950/30 font-bold text-amber-200 border-l-4 border-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]'
                            : 'hover:bg-zinc-850/50 text-zinc-300'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          {ninja.position === 1 ? (
                            <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400/60 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                              <Medal className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                          ) : ninja.position === 2 ? (
                            <div className="w-6 h-6 rounded-md bg-slate-300/20 border border-slate-300/60 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(203,213,225,0.3)]">
                              <Medal className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          ) : ninja.position === 3 ? (
                            <div className="w-6 h-6 rounded-md bg-amber-800/20 border border-amber-700/60 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(180,83,9,0.3)]">
                              <Medal className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                          ) : (
                            <span className="text-zinc-500 font-bold text-xs">#{ninja.position}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Tooltip
                            title={ninja.name}
                            badgeText={ninja.position <= 3 ? `Pódio #${ninja.position}` : `Top #${ninja.position}`}
                            badgeVariant={ninja.position === 1 ? 'amber' : ninja.position <= 3 ? 'cyan' : 'neutral'}
                            description="Registro oficial no Hall da Fama Shinobi sincronizado na nuvem."
                            metrics={[
                              { label: 'Posição', value: `#${ninja.position}`, colorClass: 'text-amber-400' },
                              { label: 'Patente Ninja', value: ninja.title },
                              { label: 'Métrica Registrada', value: formatMetricDisplay(ninja), colorClass: 'text-emerald-400' },
                            ]}
                            position="top"
                          >
                            <div className="flex items-center gap-2.5 cursor-pointer">
                              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-300 group-hover/row:scale-105 group-hover/row:border-zinc-700 transition-all">
                                <IconRenderer name={ninja.avatar} className="w-4 h-4 stroke-[1.8]" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold block truncate max-w-[200px] text-zinc-100 group-hover/row:text-amber-300 transition-colors">
                                  {ninja.name}
                                </span>
                              </div>
                            </div>
                          </Tooltip>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 font-sans text-xs">{ninja.title}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
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
        <aside className="w-full lg:w-96 bg-gradient-to-b from-zinc-900/80 via-zinc-950/85 to-[#090a0f]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl p-5 lg:p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar relative">
          <div className="space-y-6">
            {/* Cartão de Patente Atual com Glow e Tooltip */}
            <Tooltip
              title={`Graduação Atual: ${currentRank.title}`}
              badgeText={currentRank.subtitle}
              badgeVariant="amber"
              description="Sua graduação ninja oficial baseada em maestria marcial, produção de chakra e histórico de renascimentos."
              metrics={[
                ...(nextRank
                  ? [
                      { label: 'Próxima Graduação', value: nextRank.title, colorClass: 'text-amber-300' },
                      { label: 'Progresso Global', value: `${progress.overallProgress}%`, colorClass: 'text-emerald-400' },
                      {
                        label: 'Meta de Cliques',
                        value: `${allTimeClicks.toLocaleString('pt-BR')} / ${nextRank.minClicksAllTime.toLocaleString('pt-BR')}`,
                        colorClass: allTimeClicks >= nextRank.minClicksAllTime ? 'text-emerald-400' : 'text-zinc-500',
                      },
                      {
                        label: 'Meta de CPS',
                        value: `${formatBigNumber(highestCPS)} / ${formatBigNumber(nextRank.minCPS)}`,
                        colorClass: highestCPS.gte(nextRank.minCPS) ? 'text-emerald-400' : 'text-zinc-500',
                      },
                    ]
                  : [{ label: 'Graduação Máxima', value: 'Alcançada', colorClass: 'text-emerald-400' }]),
              ]}
              position="left"
              className="w-full"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800/90 shadow-md relative overflow-hidden cursor-help">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2">
                  Graduação Ninja Oficial
                </span>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex-shrink-0">
                    <Award className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{currentRank.title}</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentRank.subtitle}</p>
                  </div>
                </div>

                {/* Barra de Progresso até a próxima patente */}
                {nextRank && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                      <span>Próxima: <strong className="text-zinc-200">{nextRank.title}</strong></span>
                      <strong className="text-amber-400">{progress.overallProgress}%</strong>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-850">
                      <div
                        style={{ width: `${progress.overallProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Tooltip>

            {/* Lista de Patentes & Resgate de Recompensas de Promoção */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Recompensas de Graduação</span>
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
                    <Tooltip
                      key={rank.id}
                      title={`Patente: ${rank.title}`}
                      badgeText={isClaimed ? 'Resgatado' : qualifies ? 'Disponível' : 'Bloqueado'}
                      badgeVariant={isClaimed ? 'emerald' : qualifies ? 'amber' : 'neutral'}
                      description={rank.reward.description}
                      metrics={[
                        {
                          label: 'Cliques Totais',
                          value: `${allTimeClicks.toLocaleString('pt-BR')} / ${rank.minClicksAllTime.toLocaleString('pt-BR')}`,
                          colorClass: allTimeClicks >= rank.minClicksAllTime ? 'text-emerald-400' : 'text-zinc-500',
                        },
                        {
                          label: 'Recorde CPS',
                          value: `${formatBigNumber(highestCPS)} / ${formatBigNumber(rank.minCPS)}`,
                          colorClass: highestCPS.gte(rank.minCPS) ? 'text-emerald-400' : 'text-zinc-500',
                        },
                        {
                          label: 'Renascimentos',
                          value: `${prestiges} / ${rank.minPrestiges}`,
                          colorClass: prestiges >= rank.minPrestiges ? 'text-emerald-400' : 'text-zinc-500',
                        },
                        {
                          label: 'Recompensa',
                          value: `+${rank.reward.value}% ${rank.reward.title}`,
                          colorClass: 'text-amber-400',
                        },
                      ]}
                      position="left"
                      className="w-full"
                    >
                      <div
                        className={`p-3 rounded-xl border text-xs font-mono transition-all duration-200 ${
                          isClaimed
                            ? 'bg-zinc-950/40 border-zinc-850 opacity-60'
                            : qualifies
                            ? 'bg-emerald-950/25 border-emerald-500/60 shadow-md shadow-emerald-950/20 hover:border-emerald-400'
                            : 'bg-zinc-950/60 border-zinc-850/80 text-zinc-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-zinc-200">{rank.title}</span>
                          {isClaimed ? (
                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Resgatado</span>
                            </span>
                          ) : (
                            <button
                              disabled={!qualifies}
                              onClick={() => claimRankReward(rank.id)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all duration-200 border ${
                                qualifies
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] cursor-pointer hover:scale-105 active:scale-95'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-600 cursor-not-allowed'
                              }`}
                            >
                              Resgatar
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug truncate">
                          {rank.reward.description}
                        </p>
                      </div>
                    </Tooltip>
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
