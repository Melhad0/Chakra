import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ViewHeader } from './ViewHeader';
import { Badge } from '../common/Badge';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  SHINOBI_PROMOTION_MISSIONS,
  SHINOBI_PROMOTION_MISSIONS_MAP,
  SHINOBI_RANKS_MAP,
  getCurrentRank,
} from '../../constants/rankings';
import { ShinobiPromotionId } from '../../types/rankings';
import {
  Trophy,
  Award,
  CheckCircle2,
  Lock,
  Scroll,
  Zap,
  Flame,
  Target,
  Sparkles,
  ArrowRight,
  Shield,
  Check,
  ChevronRight,
  Gift,
  AlertCircle,
  Crown,
} from 'lucide-react';

export const RankPromotionView: React.FC = () => {
  const stats = useGameStore((s) => s.stats);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gauntlet = useGameStore((s) => s.gauntlet);
  const passedExams = useGameStore((s) => s.passedExams);
  const completePromotion = useGameStore((s) => s.completePromotion);
  const currentUser = useGameStore((s) => s.currentUser);
  const setView = useGameStore((s) => s.setView);

  // Patente atual oficial
  const currentRank = useMemo(
    () =>
      getCurrentRank(
        stats.manualClicksAllTime,
        stats.highestCPSRecord,
        stats.totalPrestiges,
        passedExams
      ),
    [stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges, passedExams]
  );

  // Primeira missão ainda não realizada
  const firstUnpassedMissionId = useMemo(() => {
    const unpassed = SHINOBI_PROMOTION_MISSIONS.find((m) => !passedExams[m.id]);
    return unpassed ? unpassed.id : 'rikudou';
  }, [passedExams]);

  const [selectedMissionId, setSelectedMissionId] = useState<ShinobiPromotionId>(
    firstUnpassedMissionId as ShinobiPromotionId
  );

  // Modal comemorativo
  const [celebrationData, setCelebrationData] = useState<{
    rankTitle: string;
    chakraBonus: string;
    ancestralBonus: string;
    permanentBonus: string;
    gachaTickets: number;
    forgeFragments: number;
    nextMissionId?: ShinobiPromotionId;
  } | null>(null);

  const activeMission = SHINOBI_PROMOTION_MISSIONS_MAP[selectedMissionId] || SHINOBI_PROMOTION_MISSIONS[0];
  const targetRankDef = SHINOBI_RANKS_MAP[activeMission.targetRankId] || SHINOBI_RANKS_MAP['gennin'];

  const isMissionPassed = !!passedExams[activeMission.id];

  const isPrerequisiteMet = useMemo(() => {
    if (activeMission.requiredRankId === 'estudante') return true;
    return !!passedExams[activeMission.requiredRankId];
  }, [activeMission.requiredRankId, passedExams]);

  const defeatedBossesCount = Math.max(0, gauntlet.highestBossDefeated, gauntlet.currentActiveBossId - 1);

  const reqStatus = useMemo(() => {
    const req = activeMission.requirements;

    // 1. Cliques Manuais
    const clicksCurrent = stats.manualClicksAllTime;
    const clicksTarget = req.minClicksAllTime;
    const clicksMet = clicksCurrent >= clicksTarget;
    const clicksPct = Math.min(100, Math.floor((clicksCurrent / Math.max(1, clicksTarget)) * 100));

    // 2. Produção CPS Recorde
    const cpsCurrent = stats.highestCPSRecord;
    const cpsTarget = req.minCPS;
    const cpsMet = cpsCurrent.gte(cpsTarget);
    const cpsPct = cpsTarget.gt(0)
      ? Math.min(100, Math.floor(cpsCurrent.div(cpsTarget).mul(100).toNumber()))
      : 100;

    // 3. Chakra Total Acumulado
    const chakraCurrent = stats.totalChakraEarned;
    const chakraTarget = req.minTotalChakra;
    const chakraMet = chakraCurrent.gte(chakraTarget);
    const chakraPct = chakraTarget.gt(0)
      ? Math.min(100, Math.floor(chakraCurrent.div(chakraTarget).mul(100).toNumber()))
      : 100;

    // 4. Requisitos Extras
    let extraMet = true;
    let extraLabel = '';
    let extraCurrent = '';
    let extraTarget = '';
    let extraPct = 100;

    if (req.minBossesDefeated !== undefined) {
      extraLabel = 'Chefes do Gauntlet Derrotados';
      extraCurrent = `${defeatedBossesCount}`;
      extraTarget = `${req.minBossesDefeated}`;
      extraMet = defeatedBossesCount >= req.minBossesDefeated;
      extraPct = Math.min(100, Math.floor((defeatedBossesCount / req.minBossesDefeated) * 100));
    } else if (req.minGatesUnlocked !== undefined) {
      extraLabel = 'Portões Internos Abertos';
      extraCurrent = `${gatesUnlocked}`;
      extraTarget = `${req.minGatesUnlocked}`;
      extraMet = gatesUnlocked >= req.minGatesUnlocked;
      extraPct = Math.min(100, Math.floor((gatesUnlocked / req.minGatesUnlocked) * 100));
    } else if (req.minPrestiges !== undefined) {
      extraLabel = 'Ressurgimentos (Prestígios)';
      extraCurrent = `${stats.totalPrestiges}`;
      extraTarget = `${req.minPrestiges}`;
      extraMet = stats.totalPrestiges >= req.minPrestiges;
      extraPct = Math.min(100, Math.floor((stats.totalPrestiges / req.minPrestiges) * 100));
    }

    const allMet = clicksMet && cpsMet && chakraMet && extraMet;

    return {
      clicks: { current: clicksCurrent, target: clicksTarget, met: clicksMet, pct: clicksPct },
      cps: { current: cpsCurrent, target: cpsTarget, met: cpsMet, pct: cpsPct },
      chakra: { current: chakraCurrent, target: chakraTarget, met: chakraMet, pct: chakraPct },
      extra: extraLabel
        ? { label: extraLabel, currentStr: extraCurrent, targetStr: extraTarget, met: extraMet, pct: extraPct }
        : null,
      allMet,
    };
  }, [activeMission, stats, gatesUnlocked, defeatedBossesCount]);

  const handleExecutePromotion = () => {
    if (isMissionPassed || !isPrerequisiteMet || !reqStatus.allMet) return;

    const res = completePromotion(activeMission.targetRankId);
    if (res && res.success) {
      const currentIdx = SHINOBI_PROMOTION_MISSIONS.findIndex((m) => m.id === activeMission.id);
      const nextMission = SHINOBI_PROMOTION_MISSIONS[currentIdx + 1];

      setCelebrationData({
        rankTitle: targetRankDef.title,
        chakraBonus: formatBigNumber(activeMission.bonusRewards.chakra),
        ancestralBonus: activeMission.bonusRewards.ancestral.toString(),
        permanentBonus: activeMission.bonusRewards.permanentEffectDescription,
        gachaTickets: activeMission.bonusRewards.gachaTickets,
        forgeFragments: activeMission.bonusRewards.forgeFragments,
        nextMissionId: nextMission ? nextMission.id : undefined,
      });

      if (nextMission) {
        setSelectedMissionId(nextMission.id);
      }
    }
  };

  const totalPassedCount = Object.keys(passedExams).filter(
    (k) => passedExams[k] && SHINOBI_PROMOTION_MISSIONS_MAP[k as ShinobiPromotionId]
  ).length;

  return (
    <div className="w-full h-full flex flex-col bg-[#07080c] text-zinc-100 overflow-hidden select-none relative">
      {/* Luzes de Fundo Ambientais */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. CABEÇALHO UNIFICADO DO SISTEMA */}
      <ViewHeader
        title="Quartel de Graduação Shinobi"
        subtitle="Missões Oficiais de Avaliação, Desempenho e Promoção de Patente Ninja"
        icon={<Award className="w-4 h-4 text-amber-400 stroke-[2]" />}
        badgeText={`Patente: ${currentRank.title}`}
      />

      {/* 2. BARRA DE STATUS DO SHINOBI & PROGRESSÃO */}
      <div className="px-6 py-2.5 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono relative z-10 shadow-sm">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">Shinobi:</span>
            <span className="text-white font-bold">{currentUser?.fullName || 'Ninja Operativo'}</span>
            <span className="text-cyan-400 font-bold">#{currentUser?.ninjaId || 1049}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Patente Atual:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] border ${currentRank.badgeClass}`}
            >
              {currentRank.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
            <span className="text-zinc-400">Graduações Concluídas:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {totalPassedCount} / {SHINOBI_PROMOTION_MISSIONS.length}
            </span>
            <div className="w-24 h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{
                  width: `${(totalPassedCount / SHINOBI_PROMOTION_MISSIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={() => setView('RANKINGS')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all duration-200 border border-zinc-750 hover:border-amber-500/50 cursor-pointer shadow-sm hover:-translate-y-0.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Hall da Fama</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* 3. TRILHA SEQUENCIAL DE MISSÕES DE PROMOÇÃO (STEPPER HORIZONTAL) */}
      <div className="px-6 py-3 bg-zinc-950/50 border-b border-zinc-800/80 overflow-x-auto custom-scrollbar flex-shrink-0 relative z-10">
        <div className="flex items-center gap-2 min-w-max">
          {SHINOBI_PROMOTION_MISSIONS.map((mission, index) => {
            const isPassed = !!passedExams[mission.id];
            const isSelected = selectedMissionId === mission.id;
            const isRequiredPassed =
              mission.requiredRankId === 'estudante' || !!passedExams[mission.requiredRankId];
            const isCurrentActive = !isPassed && isRequiredPassed;

            return (
              <React.Fragment key={mission.id}>
                {index > 0 && (
                  <div
                    className={`w-6 h-0.5 transition-colors ${
                      isPassed ? 'bg-emerald-500/70 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-zinc-800'
                    }`}
                  />
                )}
                <button
                  onClick={() => setSelectedMissionId(mission.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-850 border-amber-500 text-white shadow-lg shadow-amber-950/30 ring-1 ring-amber-400/50 scale-105'
                      : isPassed
                      ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                      : isCurrentActive
                      ? 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-500/60 text-amber-300 animate-pulse'
                      : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span className="text-sm">{mission.proctor.avatarEmoji}</span>
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-1">
                      <span>{SHINOBI_RANKS_MAP[mission.targetRankId]?.title || mission.title}</span>
                      {isPassed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                      ) : !isRequiredPassed ? (
                        <Lock className="w-3 h-3 text-zinc-600" />
                      ) : null}
                    </div>
                    <span className="text-[10px] text-zinc-400 block -mt-0.5">
                      {isPassed ? 'Concluído ✔' : isCurrentActive ? 'Missão Atual' : 'Bloqueado'}
                    </span>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 4. PALCO PRINCIPAL DA MISSÃO DE PROMOÇÃO SELECIONADA */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar relative z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* BANNER / CARTÃO HERO DA MISSÃO */}
          <div
            className={`p-6 rounded-2xl border backdrop-blur-2xl relative overflow-hidden shadow-2xl transition-all duration-300 ${
              isMissionPassed
                ? 'bg-gradient-to-br from-emerald-950/20 via-zinc-900/90 to-zinc-950/90 border-emerald-500/40 shadow-emerald-950/10'
                : !isPrerequisiteMet
                ? 'bg-zinc-900/50 border-zinc-800/80 opacity-80'
                : reqStatus.allMet
                ? 'bg-gradient-to-br from-amber-950/30 via-zinc-900/90 to-zinc-950/90 border-amber-500/60 shadow-amber-950/20 ring-1 ring-amber-500/30'
                : 'bg-gradient-to-br from-zinc-900/80 via-zinc-950/85 to-[#090a0f]/95 border-zinc-800/90'
            }`}
          >
            {/* Halo de fundo */}
            <div
              className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ${
                isMissionPassed
                  ? 'bg-emerald-500/15'
                  : reqStatus.allMet
                  ? 'bg-amber-500/20 animate-pulse-slow'
                  : 'bg-orange-500/10'
              }`}
            />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-850 border border-zinc-700 text-[11px] font-mono text-zinc-300">
                    Codinome: {activeMission.codename}
                  </span>

                  {isMissionPassed ? (
                    <Badge variant="production" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      Graduação Oficial Aprovada
                    </Badge>
                  ) : !isPrerequisiteMet ? (
                    <Badge variant="neutral" icon={<Lock className="w-3.5 h-3.5" />}>
                      Requer Patente Anterior
                    </Badge>
                  ) : reqStatus.allMet ? (
                    <Badge variant="chakra" icon={<Sparkles className="w-3.5 h-3.5" />}>
                      Apto para Promoção!
                    </Badge>
                  ) : (
                    <Badge variant="warning" icon={<Target className="w-3.5 h-3.5" />}>
                      Missão em Andamento
                    </Badge>
                  )}
                </div>

                <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-2 font-sans">
                  <span>{activeMission.title}</span>
                  <span className="text-amber-400 text-lg font-bold">
                    ➔ {targetRankDef.title}
                  </span>
                </h2>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-2xl">
                  {activeMission.loreDescription}
                </p>
              </div>

              {/* DIÁLOGO DO EXAMINADOR OFICIAL */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 md:max-w-xs flex-shrink-0 shadow-inner">
                <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-zinc-850">
                  <span className="text-xl">{activeMission.proctor.avatarEmoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">{activeMission.proctor.name}</h4>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      {activeMission.proctor.title}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] italic text-zinc-300 font-serif leading-snug">
                  "{activeMission.proctor.quote}"
                </p>
              </div>
            </div>

            {/* AVISO DE STATUS DA MISSÃO */}
            <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                {isMissionPassed ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Patente outorgada definitivamente. O shinobi avançou para o próximo nível hierárquico.
                  </span>
                ) : !isPrerequisiteMet ? (
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Você deve ser promovido para{' '}
                    <strong className="text-zinc-300">
                      {SHINOBI_RANKS_MAP[activeMission.requiredRankId]?.title}
                    </strong>{' '}
                    antes de assumir esta graduação.
                  </span>
                ) : reqStatus.allMet ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold animate-pulse">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Todos os requisitos foram atingidos! Clique no botão ao lado para oficializar o cargo.
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Atenda aos critérios de avaliação abaixo para solicitar a promoção oficial.
                  </span>
                )}
              </div>

              {/* BOTÃO PRINCIPAL DE GRADUAÇÃO */}
              <button
                disabled={isMissionPassed || !isPrerequisiteMet || !reqStatus.allMet}
                onClick={handleExecutePromotion}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer ${
                  isMissionPassed
                    ? 'bg-zinc-850 text-zinc-400 border border-zinc-750 cursor-not-allowed opacity-80'
                    : !isPrerequisiteMet
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                    : reqStatus.allMet
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse-slow hover:scale-105 active:scale-95'
                    : 'bg-zinc-900/60 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isMissionPassed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Graduação Concluída ✔</span>
                  </>
                ) : !isPrerequisiteMet ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Requer Rank Anterior</span>
                  </>
                ) : reqStatus.allMet ? (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Oficializar Graduação: {targetRankDef.title}</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Critérios Pendentes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. GRID DE REQUISITOS OBRIGATÓRIOS DA MISSÃO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Critérios de Avaliação Shinobi para {targetRankDef.title}</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">
                Progresso em tempo real
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
              {/* Card 1: Cliques Manuais */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  reqStatus.clicks.met
                    ? 'bg-emerald-950/20 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-zinc-400">Cliques Manuais</span>
                  {reqStatus.clicks.met ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Concluído
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[11px] font-bold">{reqStatus.clicks.pct}%</span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-bold text-zinc-100">
                    {reqStatus.clicks.current.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    / {reqStatus.clicks.target.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      reqStatus.clicks.met ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'
                    }`}
                    style={{ width: `${reqStatus.clicks.pct}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Produção CPS Recorde */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  reqStatus.cps.met
                    ? 'bg-emerald-950/20 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-zinc-400">Pico de CPS Global</span>
                  {reqStatus.cps.met ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Concluído
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[11px] font-bold">{reqStatus.cps.pct}%</span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-bold text-zinc-100">
                    +{formatBigNumber(reqStatus.cps.current)}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    / +{formatBigNumber(reqStatus.cps.target)} CPS
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      reqStatus.cps.met ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'
                    }`}
                    style={{ width: `${reqStatus.cps.pct}%` }}
                  />
                </div>
              </div>

              {/* Card 3: Chakra Total Acumulado */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  reqStatus.chakra.met
                    ? 'bg-emerald-950/20 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-zinc-400">Chakra Total</span>
                  {reqStatus.chakra.met ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Concluído
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[11px] font-bold">{reqStatus.chakra.pct}%</span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-bold text-zinc-100">
                    {formatBigNumber(reqStatus.chakra.current)}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    / {formatBigNumber(reqStatus.chakra.target)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      reqStatus.chakra.met ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'
                    }`}
                    style={{ width: `${reqStatus.chakra.pct}%` }}
                  />
                </div>
              </div>

              {/* Card 4: Requisito Tático Especial */}
              {reqStatus.extra ? (
                <div
                  className={`p-3.5 rounded-xl border transition-all duration-200 ${
                    reqStatus.extra.met
                      ? 'bg-emerald-950/20 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-zinc-400 truncate">{reqStatus.extra.label}</span>
                    {reqStatus.extra.met ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                        <Check className="w-3.5 h-3.5" /> Concluído
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[11px] font-bold">{reqStatus.extra.pct}%</span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-bold text-zinc-100">
                      {reqStatus.extra.currentStr}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      / {reqStatus.extra.targetStr}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        reqStatus.extra.met ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'
                      }`}
                      style={{ width: `${reqStatus.extra.pct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border bg-zinc-950/40 border-zinc-850/80 flex items-center justify-center text-center text-zinc-500 text-xs">
                  <span>Sem requisitos adicionais para esta graduação.</span>
                </div>
              )}
            </div>
          </div>

          {/* 6. PACOTE DE RECOMPENSAS & BÔNUS PERMANENTES DA PATENTE */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Outorgas & Benefícios Oficiais do Cargo {targetRankDef.title}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-[0_0_10px_rgba(255,107,0,0.2)]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block font-sans font-semibold">Bônus de Chakra</span>
                  <span className="text-sm font-bold text-orange-300">
                    +{formatBigNumber(activeMission.bonusRewards.chakra)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block font-sans font-semibold">Chakra Ancestral</span>
                  <span className="text-sm font-bold text-amber-300">
                    +{activeMission.bonusRewards.ancestral.toString()} Ancestrais
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Scroll className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block font-sans font-semibold">Espólios da Forja</span>
                  <span className="text-sm font-bold text-cyan-300">
                    +{activeMission.bonusRewards.gachaTickets} Bilhetes / +{activeMission.bonusRewards.forgeFragments} Frag.
                  </span>
                </div>
              </div>
            </div>

            {/* Bônus Permanente de Patente */}
            <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/40 flex items-center justify-between text-xs font-mono shadow-sm">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                <span className="text-emerald-200">
                  <strong className="text-emerald-100">Efeito Permanente da Patente:</strong>{' '}
                  {activeMission.bonusRewards.permanentEffectDescription}
                </span>
              </div>
              <Badge variant="production">Vitalício</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 7. MODAL COMEMORATIVO DE CONCLUSÃO DE GRADUAÇÃO */}
      {celebrationData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/60 rounded-2xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border-2 border-amber-400 text-amber-300 flex items-center justify-center mx-auto text-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                PROMOÇÃO OFICIAL CONCLUÍDA
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {celebrationData.rankTitle}
              </h2>
              <p className="text-xs text-zinc-300 font-sans mt-2">
                A vila reconhece seu valor, disciplina e superação de limites. O novo cargo foi registrado e seus bônus já estão ativos!
              </p>
            </div>

            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 font-mono text-xs text-left space-y-2 shadow-inner">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">Chakra Concedido:</span>
                <span className="text-orange-400 font-bold">+{celebrationData.chakraBonus}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">Ancestral Recebido:</span>
                <span className="text-amber-400 font-bold">+{celebrationData.ancestralBonus}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">Bilhetes / Fragmentos:</span>
                <span className="text-cyan-400 font-bold">
                  +{celebrationData.gachaTickets} / +{celebrationData.forgeFragments}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 text-[11px] text-emerald-300 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {celebrationData.permanentBonus}
              </div>
            </div>

            <button
              onClick={() => {
                setCelebrationData(null);
                if (celebrationData.nextMissionId) {
                  setSelectedMissionId(celebrationData.nextMissionId);
                }
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Avançar para a Próxima Graduação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { RankPromotionView as ChuninExamView };
