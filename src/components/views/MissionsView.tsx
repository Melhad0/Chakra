import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import { SHINOBI_MISSIONS_CATALOG } from '../../constants/missionsCatalog';
import { ShinobiMission, MissionRank } from '../../types/missions';
import { SHINOBI_RANKS, getCurrentRank } from '../../constants/rankings';
import { ViewHeader } from './ViewHeader';
import { MinigameHandSeals, MinigameResult } from '../missions/MinigameHandSeals';
import { MinigameChakraPulse } from '../missions/MinigameChakraPulse';
import { GachaTemplePanel } from '../missions/GachaTemplePanel';
import { LegendaryForgePanel } from '../missions/LegendaryForgePanel';
import {
  Scroll,
  ShieldAlert,
  Dice5,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  X,
  ArrowRight,
  TrendingUp,
  Percent,
  Zap,
  Hammer,
  FastForward,
  Activity,
} from 'lucide-react';

export const MissionsView: React.FC = () => {
  const stats = useGameStore((s) => s.stats);
  const stableRollingCPS = useGameStore((s) => s.stableRollingCPS);
  const activeMission = useGameStore((s) => s.activeMission);
  const startMission = useGameStore((s) => s.startMission);
  const resolveMissionChoice = useGameStore((s) => s.resolveMissionChoice);
  const resolveMissionWithMinigameBonus = useGameStore((s) => s.resolveMissionWithMinigameBonus);
  const rushMissionCooldownWithTicket = useGameStore((s) => s.rushMissionCooldownWithTicket);
  const speedUpRunningMissionWithTicket = useGameStore((s) => s.speedUpRunningMissionWithTicket);
  const clearMissionOutcome = useGameStore((s) => s.clearMissionOutcome);
  const gachaTickets = useGameStore((s) => s.gachaTickets);
  const forgeFragments = useGameStore((s) => s.forgeFragments);
  const missionPermanentCpsMult = useGameStore((s) => s.missionPermanentCpsMult);
  const passedExams = useGameStore((s) => s.passedExams);

  // Aba Ativa Principal
  const [activeMainTab, setActiveMainTab] = useState<'MISSIONS' | 'MINIGAMES' | 'GACHA' | 'FORGE'>('MISSIONS');

  // Tipo de Minigame no Dojo de Treino
  const [selectedDojoMinigame, setSelectedDojoMinigame] = useState<'SEALS' | 'PULSE'>('SEALS');

  // Modal de Minigame para a Missão em Andamento
  const [missionMinigameModal, setMissionMinigameModal] = useState<'SEALS' | 'PULSE' | null>(null);

  // Patente do Jogador
  const currentRank = useMemo(() => {
    return getCurrentRank(stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges, passedExams);
  }, [stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges, passedExams]);

  const playerRankIndex = useMemo(() => {
    return SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);
  }, [currentRank]);

  // Filtro por Rank
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('Todos');

  // Modal de Dilema Tático
  const [inspectingMission, setInspectingMission] = useState<ShinobiMission | null>(null);

  // Timer Reativo para Contagens Regressivas (atualiza a cada 250ms)
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  // Cooldown do Mural
  const isMuralCooldownActive = !!(
    activeMission.cooldownExpiresAt && activeMission.cooldownExpiresAt > now
  );
  const muralCooldownRemainingMs = isMuralCooldownActive && activeMission.cooldownExpiresAt
    ? activeMission.cooldownExpiresAt - now
    : 0;

  // Missão Ativa em Execução
  const isMissionRunning = !!(
    activeMission.activeMissionId &&
    activeMission.resolvesAt &&
    activeMission.resolvesAt > now
  );

  const isMissionReadyToResolve = !!(
    activeMission.activeMissionId &&
    activeMission.resolvesAt &&
    now >= activeMission.resolvesAt
  );

  const runningMission = useMemo(() => {
    if (!activeMission.activeMissionId) return null;
    return SHINOBI_MISSIONS_CATALOG.find((m) => m.id === activeMission.activeMissionId) || null;
  }, [activeMission.activeMissionId]);

  const runningChoice = useMemo(() => {
    if (!runningMission || !activeMission.selectedChoiceId) return null;
    return runningMission.choices.find((c) => c.id === activeMission.selectedChoiceId) || null;
  }, [runningMission, activeMission.selectedChoiceId]);

  const missionProgressPercent = useMemo(() => {
    if (!activeMission.startedAt || !activeMission.resolvesAt) return 0;
    const total = activeMission.resolvesAt - activeMission.startedAt;
    const elapsed = now - activeMission.startedAt;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [activeMission.startedAt, activeMission.resolvesAt, now]);

  const missionRemainingSeconds = useMemo(() => {
    if (!activeMission.resolvesAt) return 0;
    return Math.max(0, Math.ceil((activeMission.resolvesAt - now) / 1000));
  }, [activeMission.resolvesAt, now]);

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}s`;
  };

  const getRankBadgeClass = (rank: MissionRank): string => {
    switch (rank) {
      case 'E':
      case 'D':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40';
      case 'C':
      case 'B':
        return 'text-cyan-400 bg-cyan-950/30 border-cyan-800/40';
      case 'A':
      case 'S':
        return 'text-rose-400 bg-rose-950/30 border-rose-800/40';
      case 'SS':
        return 'text-purple-300 bg-purple-950/50 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] font-black';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  const filteredMissions = useMemo(() => {
    if (selectedRankFilter === 'Todos') return SHINOBI_MISSIONS_CATALOG;
    return SHINOBI_MISSIONS_CATALOG.filter((m) => m.rank === selectedRankFilter);
  }, [selectedRankFilter]);

  const handleConfirmChoice = (missionId: string, choiceId: string) => {
    const ok = startMission(missionId, choiceId);
    if (ok) {
      setInspectingMission(null);
    }
  };

  // Concluir Minigame vinculado à missão ativa
  const handleMissionMinigameComplete = (result: MinigameResult) => {
    setMissionMinigameModal(null);
    resolveMissionWithMinigameBonus(result.bonusSuccessRate, result.isCritical);
  };

  return (
    <div className="w-full h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden select-none">
      {/* Cabeçalho Universal com Atalho ESC */}
      <ViewHeader
        title="Quadro Oficial de Missões Shinobi"
        subtitle="Escala Canônica • Minigames Interativos • Templo Gacha & Forja Lendária"
        badgeText={
          isMuralCooldownActive
            ? `Cooldown: ${formatSeconds(Math.ceil(muralCooldownRemainingMs / 1000))}`
            : isMissionRunning
            ? `Missão em Andamento: ${formatSeconds(missionRemainingSeconds)}`
            : isMissionReadyToResolve
            ? 'Relatório Pronto para Desfecho!'
            : `Patente: ${currentRank.title}`
        }
        badgeVariant={
          isMuralCooldownActive
            ? 'cyan'
            : isMissionReadyToResolve
            ? 'production'
            : isMissionRunning
            ? 'danger'
            : 'chakra'
        }
      />

      {/* Barra de Navegação Superior entre Abas */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 px-4 lg:px-6 py-2.5 bg-zinc-900/60 overflow-x-auto custom-scrollbar flex-shrink-0">
        <button
          onClick={() => setActiveMainTab('MISSIONS')}
          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'MISSIONS'
              ? 'bg-zinc-800 border border-zinc-600 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
          }`}
        >
          <Scroll className="w-3.5 h-3.5 text-amber-400" />
          <span>Mural de Missões</span>
        </button>

        <button
          onClick={() => setActiveMainTab('MINIGAMES')}
          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'MINIGAMES'
              ? 'bg-zinc-800 border border-zinc-600 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Dojo de Minigames</span>
        </button>

        <button
          onClick={() => setActiveMainTab('GACHA')}
          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'GACHA'
              ? 'bg-zinc-800 border border-zinc-600 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Templo Gacha ({gachaTickets} Bilhetes)</span>
        </button>

        <button
          onClick={() => setActiveMainTab('FORGE')}
          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'FORGE'
              ? 'bg-zinc-800 border border-zinc-600 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
          }`}
        >
          <Hammer className="w-3.5 h-3.5 text-purple-400" />
          <span>A Forja Lendária ({forgeFragments} Frags)</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
        {/* BARRA SUPERIOR DE INVENTÁRIO TÁTICO E STATUS DO MURAL */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Card 1: Patente Atual */}
          <div className="p-3 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Patente Shinobi
              </span>
              <h4 className="text-xs font-bold text-zinc-200 truncate">{currentRank.title}</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Tier #{playerRankIndex}
            </span>
          </div>

          {/* Card 2: Fragmentos de Forja */}
          <div
            onClick={() => setActiveMainTab('FORGE')}
            className="p-3 bg-zinc-900/40 hover:bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 hover:border-purple-500/50 rounded-xl flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Fragmentos de Forja
              </span>
              <h4 className="text-xs font-bold text-purple-300 font-mono">
                {forgeFragments} Fragmentos
              </h4>
            </div>
            <Hammer className="w-4 h-4 text-purple-400 stroke-[1.75]" />
          </div>

          {/* Card 3: Bilhetes de Invocação Gacha */}
          <div
            onClick={() => setActiveMainTab('GACHA')}
            className="p-3 bg-zinc-900/40 hover:bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 hover:border-amber-500/50 rounded-xl flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Bilhetes de Invocação
              </span>
              <h4 className="text-xs font-bold text-amber-300 font-mono">
                {gachaTickets} Bilhetes
              </h4>
            </div>
            <Scroll className="w-4 h-4 text-amber-400 stroke-[1.75]" />
          </div>

          {/* Card 4: Multiplicador Permanente de Missões */}
          <div className="p-3 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Bênção Astral de Missões
              </span>
              <h4 className="text-xs font-bold text-emerald-400 font-mono">
                {missionPermanentCpsMult.toFixed(2)}x CPS
              </h4>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400 stroke-[1.75]" />
          </div>
        </div>

        {/* ALERTA DE COOLDOWN DO MURAL COM ATALHO DE BILHETE */}
        {isMuralCooldownActive && (
          <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-center justify-between gap-3 text-amber-300 text-xs font-mono flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-amber-400 flex-shrink-0" />
              <span>
                <strong>Mural em Recuperação:</strong> A aldeia está restabelecendo as patrulhas. (Tempo restante: {formatSeconds(Math.ceil(muralCooldownRemainingMs / 1000))})
              </span>
            </div>

            <button
              disabled={gachaTickets < 1}
              onClick={() => rushMissionCooldownWithTicket()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quebrar Cooldown (1 Bilhete)</span>
            </button>
          </div>
        )}

        {/* BANNER DE MISSÃO EM ANDAMENTO */}
        {runningMission && runningChoice && (
          <div className="p-4 bg-gradient-to-r from-zinc-900/90 to-zinc-950/90 border border-rose-800/50 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] border ${getRankBadgeClass(runningMission.rank)}`}>
                  RANK {runningMission.rank}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    {runningMission.title}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    Abordagem: <strong>{runningChoice.actionTitle}</strong> (Taxa de Êxito: {(runningChoice.successProbability * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Botões de Ação para a Missão */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Desafiar Minigame para garantir Sucesso Crítico 2x */}
                <button
                  onClick={() => setMissionMinigameModal('SEALS')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-md border border-cyan-400 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Desafiar Selos Ninja (Crítico 2x)</span>
                </button>

                <button
                  onClick={() => setMissionMinigameModal('PULSE')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl shadow-md border border-amber-300 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Sincronia de Pulso</span>
                </button>

                {/* Finalizar Imediatamente com 1 Bilhete */}
                {!isMissionReadyToResolve && (
                  <button
                    disabled={gachaTickets < 1}
                    onClick={() => speedUpRunningMissionWithTicket()}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-amber-300 font-mono text-xs font-bold rounded-xl border border-zinc-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FastForward className="w-3.5 h-3.5 text-amber-400" />
                    <span>Acelerar (1 Bilhete)</span>
                  </button>
                )}

                {/* Revelar Desfecho se já estiver pronto */}
                {isMissionReadyToResolve ? (
                  <button
                    onClick={() => resolveMissionChoice()}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400 animate-pulse transition cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Revelar Desfecho
                  </button>
                ) : (
                  <div className="flex items-center gap-2 font-mono text-xs text-rose-300 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-800/60">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Em Operação: {formatSeconds(missionRemainingSeconds)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de Progresso da Incursão */}
            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-0.5">
              <div
                style={{ width: `${missionProgressPercent}%` }}
                className={`h-full rounded-full transition-all duration-200 ${
                  isMissionReadyToResolve ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CONTEÚDO DA ABA: MURAL DE MISSÕES                                 */}
        {/* ================================================================= */}
        {activeMainTab === 'MISSIONS' && (
          <div className="space-y-4">
            {/* FILTROS POR RANK (RANKS E A SS) */}
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-mono">
                {['Todos', 'E', 'D', 'C', 'B', 'A', 'S', 'SS'].map((rank) => (
                  <button
                    key={rank}
                    onClick={() => setSelectedRankFilter(rank)}
                    className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      selectedRankFilter === rank
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-bold shadow-sm'
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    {rank === 'Todos' ? 'Todos os Ranks' : `Rank ${rank}`}
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono text-zinc-500">
                {filteredMissions.length} missões catalogadas
              </span>
            </div>

            {/* GRADE DE MISSÕES DO MURAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMissions.map((mission) => {
                const isRankLocked = playerRankIndex < mission.requiredRankTier;
                const isThisRunning = activeMission.activeMissionId === mission.id;
                const isAnyRunning = !!activeMission.activeMissionId;

                return (
                  <div
                    key={mission.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isThisRunning
                        ? 'bg-zinc-900/90 border-rose-500/70 shadow-lg'
                        : isRankLocked
                        ? 'bg-zinc-950/30 border-zinc-900 opacity-60'
                        : 'bg-zinc-900/40 hover:bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] border font-mono ${getRankBadgeClass(mission.rank)}`}>
                          RANK {mission.rank}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{mission.durationSeconds}s</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-zinc-100 mb-1">{mission.title}</h3>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-4">
                        {mission.loreBriefing}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[11px] font-mono text-zinc-500">
                        {isRankLocked ? (
                          <span className="flex items-center gap-1 text-zinc-500">
                            <Lock className="w-3 h-3" /> Requer: {mission.requiredRankName}
                          </span>
                        ) : (
                          <span className="text-emerald-400/80 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Patente Compatível
                          </span>
                        )}
                      </div>

                      {isThisRunning ? (
                        <span className="text-xs font-mono font-bold text-rose-300 animate-pulse">
                          Em Execução...
                        </span>
                      ) : (
                        <button
                          disabled={isRankLocked || isAnyRunning || isMuralCooldownActive}
                          onClick={() => setInspectingMission(mission)}
                          className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border-zinc-700 hover:border-zinc-600 flex items-center gap-1.5 shadow-sm"
                        >
                          <Dice5 className="w-3.5 h-3.5" />
                          Analisar Abordagens
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
        {/* CONTEÚDO DA ABA: DOJO DE MINIGAMES SHINOBI                        */}
        {/* ================================================================= */}
        {activeMainTab === 'MINIGAMES' && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDojoMinigame('SEALS')}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                  selectedDojoMinigame === 'SEALS'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Kuji-in: Rito dos Selos de Mão</span>
              </button>

              <button
                onClick={() => setSelectedDojoMinigame('PULSE')}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                  selectedDojoMinigame === 'PULSE'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Sincronia do Pulso de Chakra</span>
              </button>
            </div>

            {selectedDojoMinigame === 'SEALS' ? (
              <MinigameHandSeals difficulty="HARD" />
            ) : (
              <MinigameChakraPulse />
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CONTEÚDO DA ABA: TEMPLO GACHA (UTILIDADE DOS BILHETES)            */}
        {/* ================================================================= */}
        {activeMainTab === 'GACHA' && <GachaTemplePanel />}

        {/* ================================================================= */}
        {/* CONTEÚDO DA ABA: A FORJA LENDÁRIA (UTILIDADE DOS FRAGMENTOS)      */}
        {/* ================================================================= */}
        {activeMainTab === 'FORGE' && <LegendaryForgePanel />}
      </div>

      {/* ===================================================================== */}
      {/* MODAL DE MINIGAME PARA RESOLUÇÃO DA MISSÃO ATIVA                      */}
      {/* ===================================================================== */}
      {missionMinigameModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          {missionMinigameModal === 'SEALS' ? (
            <MinigameHandSeals
              onComplete={handleMissionMinigameComplete}
              onCancel={() => setMissionMinigameModal(null)}
              difficulty="NORMAL"
            />
          ) : (
            <MinigameChakraPulse
              onComplete={handleMissionMinigameComplete}
              onCancel={() => setMissionMinigameModal(null)}
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE ESCOLHA TÁTICA (DILEMA: DUAS CARTAS LADO A LADO)             */}
      {/* ===================================================================== */}
      {inspectingMission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Dilema */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] border font-mono ${getRankBadgeClass(inspectingMission.rank)}`}>
                    RANK {inspectingMission.rank}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    Duração: {inspectingMission.durationSeconds}s
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-100">{inspectingMission.title}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  {inspectingMission.loreBriefing}
                </p>
              </div>

              <button
                onClick={() => setInspectingMission(null)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                <Dice5 className="w-4 h-4" /> Escolha Obrigatória de Abordagem Tática
              </span>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Você poderá intervir a qualquer instante com os Minigames Shinobi para garantir Sucesso Crítico 2x!
              </p>
            </div>

            {/* Duas Cartas Comparativas Lado a Lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inspectingMission.choices.map((choice, idx) => {
                const estRewardChakra = choice.successOutcome.rewardChakraSeconds
                  ? stableRollingCPS.mul(choice.successOutcome.rewardChakraSeconds)
                  : D(0);

                return (
                  <div
                    key={choice.id}
                    className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-600 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Título da Opção e Taxa de Êxito */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {idx === 0 ? 'Opção A' : 'Opção B'}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                          <Percent className="w-3 h-3" />
                          <span>Taxa de Êxito: {(choice.successProbability * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-100 mb-1">{choice.actionTitle}</h4>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        {choice.tacticalDescription}
                      </p>

                      {/* Recompensas em Potencial (Sucesso) */}
                      <div className="mt-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 font-mono text-[11px] space-y-1">
                        <span className="text-emerald-400 font-semibold block uppercase text-[10px]">
                          Recompensas em Caso de Sucesso:
                        </span>
                        {choice.successOutcome.rewardChakraSeconds && (
                          <div className="text-zinc-300">
                            • +{choice.successOutcome.rewardChakraSeconds}s de CPS (~{formatBigNumber(estRewardChakra)} Chakra)
                          </div>
                        )}
                        {choice.successOutcome.rewardAncestral && (
                          <div className="text-amber-300 font-bold">
                            • +{choice.successOutcome.rewardAncestral} Chakra Ancestral
                          </div>
                        )}
                        {choice.successOutcome.rewardGachaTickets && (
                          <div className="text-amber-400">
                            • +{choice.successOutcome.rewardGachaTickets} Bilhete(s) Gacha
                          </div>
                        )}
                        {choice.successOutcome.rewardForgeFragments && (
                          <div className="text-purple-400">
                            • +{choice.successOutcome.rewardForgeFragments} Fragmentos de Forja
                          </div>
                        )}
                        {choice.successOutcome.permanentCpsMultiplier && (
                          <div className="text-fuchsia-300 font-bold">
                            • Multiplicador Permanente de {choice.successOutcome.permanentCpsMultiplier}x em todo o CPS!
                          </div>
                        )}
                      </div>

                      {/* Riscos de Penalidade (Falha) */}
                      <div className="mt-2.5 p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 font-mono text-[11px] space-y-1">
                        <span className="text-rose-400 font-semibold block uppercase text-[10px]">
                          Riscos em Caso de Falha:
                        </span>
                        {choice.failureOutcome.penaltyChakraLossPercent && (
                          <div className="text-rose-300">
                            • Drena {choice.failureOutcome.penaltyChakraLossPercent}% do saldo de Chakra acumulado.
                          </div>
                        )}
                        {choice.failureOutcome.penaltyExhaustionSeconds && (
                          <div className="text-rose-300">
                            • Exaustão de Esquadrão por {choice.failureOutcome.penaltyExhaustionSeconds}s (CPS severamente reduzido).
                          </div>
                        )}
                        {choice.failureOutcome.penaltyClickExhaustionSeconds && (
                          <div className="text-rose-300">
                            • Exaustão Muscular por {choice.failureOutcome.penaltyClickExhaustionSeconds}s no clique manual.
                          </div>
                        )}
                        {choice.failureOutcome.penaltyCooldownSeconds && (
                          <div className="text-rose-300">
                            • Mural de missões bloqueado por {choice.failureOutcome.penaltyCooldownSeconds}s.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmChoice(inspectingMission.id, choice.id)}
                      className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-xs font-bold rounded-xl border border-zinc-700 hover:border-zinc-500 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Iniciar Esta Abordagem</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE DESFECHO ANIMADO                                             */}
      {/* ===================================================================== */}
      {activeMission.lastOutcome && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300 ${
              activeMission.lastOutcome.isSuccess
                ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-emerald-500/60 shadow-emerald-950/40'
                : 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-rose-500/60 shadow-rose-950/40'
            }`}
          >
            {/* Ícone e Título do Desfecho */}
            <div className="text-center space-y-2">
              <div
                className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto shadow-lg ${
                  activeMission.lastOutcome.isSuccess
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                    : 'bg-rose-950/60 border-rose-500 text-rose-400'
                }`}
              >
                {activeMission.lastOutcome.isSuccess ? (
                  <CheckCircle2 className="w-8 h-8 stroke-[2]" />
                ) : (
                  <ShieldAlert className="w-8 h-8 stroke-[2]" />
                )}
              </div>

              <h2
                className={`text-lg font-black tracking-wide uppercase ${
                  activeMission.lastOutcome.isSuccess ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeMission.lastOutcome.isSuccess
                  ? 'Missão Cumprida com Êxito!'
                  : 'Colapso / Falha Operacional!'}
              </h2>

              <p className="text-xs text-zinc-300 font-mono leading-relaxed px-2">
                {activeMission.lastOutcome.narrativeResult}
              </p>
            </div>

            {/* Extrato Detalhado de Consequências */}
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 font-mono text-xs space-y-2">
              <span className="text-[10px] font-semibold uppercase text-zinc-500 block">
                Impacto no Registro Shinobi:
              </span>

              {activeMission.lastOutcome.isSuccess ? (
                <div className="space-y-1 text-emerald-300">
                  {activeMission.lastOutcome.rewardChakraSeconds && (
                    <div>
                      • Provisões de Chakra: +{activeMission.lastOutcome.rewardChakraSeconds}s de CPS
                    </div>
                  )}
                  {activeMission.lastOutcome.rewardAncestral && (
                    <div className="text-amber-300 font-bold">
                      • Chakra Ancestral: +{activeMission.lastOutcome.rewardAncestral}
                    </div>
                  )}
                  {activeMission.lastOutcome.rewardGachaTickets && (
                    <div className="text-amber-400">
                      • Bilhete(s) Gacha da Forja: +{activeMission.lastOutcome.rewardGachaTickets}
                    </div>
                  )}
                  {activeMission.lastOutcome.rewardForgeFragments && (
                    <div className="text-purple-400">
                      • Fragmentos de Arma: +{activeMission.lastOutcome.rewardForgeFragments}
                    </div>
                  )}
                  {activeMission.lastOutcome.permanentCpsMultiplier && (
                    <div className="text-fuchsia-300 font-bold">
                      • Bônus Permanente de CPS: {activeMission.lastOutcome.permanentCpsMultiplier}x
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1 text-rose-300">
                  {activeMission.lastOutcome.penaltyChakraLossPercent && (
                    <div>
                      • Perda de Recursos: -{activeMission.lastOutcome.penaltyChakraLossPercent}% de Chakra
                    </div>
                  )}
                  {activeMission.lastOutcome.penaltyExhaustionSeconds && (
                    <div>
                      • Exaustão de Esquadrão: {activeMission.lastOutcome.penaltyExhaustionSeconds}s
                    </div>
                  )}
                  {activeMission.lastOutcome.penaltyClickExhaustionSeconds && (
                    <div>
                      • Exaustão Muscular no Clique: {activeMission.lastOutcome.penaltyClickExhaustionSeconds}s
                    </div>
                  )}
                  {activeMission.lastOutcome.penaltyCooldownSeconds && (
                    <div>
                      • Bloqueio Temporário do Mural: {activeMission.lastOutcome.penaltyCooldownSeconds}s
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => clearMissionOutcome()}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-xs font-bold rounded-xl border border-zinc-700 shadow-sm transition cursor-pointer"
            >
              Arquivar Relatório e Retornar ao Mural
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
