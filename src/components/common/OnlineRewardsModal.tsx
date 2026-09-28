import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ONLINE_PRESENCE_TIERS } from '../../constants/rewards';
import { formatBigNumber } from '../../engine/BigNumber';
import { getOnlineRewardHardCap, calculatePresenceRewardChakra } from '../../engine/formulas';
import { SHINOBI_RANKS, getCurrentRank } from '../../constants/rankings';
import { Badge } from './Badge';
import {
  Clock,
  Gift,
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  X,
  AlertCircle,
  Zap,
  Ticket,
  Flame,
  Wrench,
  CheckCheck,
  Trophy,
} from 'lucide-react';

export const OnlineRewardsModal: React.FC = () => {
  const isOpen = useGameStore((s) => s.isOnlineRewardModalOpen);
  const closeModal = useGameStore((s) => s.closeOnlineRewardModal);
  const stableRollingCPS = useGameStore((s) => s.stableRollingCPS);
  const generators = useGameStore((s) => s.generators);
  const stats = useGameStore((s) => s.stats);
  const onlinePresenceRewardsClaimed = useGameStore((s) => s.onlinePresenceRewardsClaimed);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const claimOnlinePresenceReward = useGameStore((s) => s.claimOnlinePresenceReward);
  const claimAllOnlinePresenceRewards = useGameStore((s) => s.claimAllOnlinePresenceRewards);
  const passedExams = useGameStore((s) => s.passedExams);

  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const hardCap = getOnlineRewardHardCap(generators);
  const currentRank = getCurrentRank(
    stats.manualClicksAllTime,
    stats.highestCPSRecord,
    stats.totalPrestiges,
    passedExams
  );
  const currentRankIndex = SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);

  const formatTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Contabilização de progresso global
  const claimedCount = ONLINE_PRESENCE_TIERS.filter((t) => !!onlinePresenceRewardsClaimed[t.id]).length;
  const readyTiers = ONLINE_PRESENCE_TIERS.filter((t) => {
    if (onlinePresenceRewardsClaimed[t.id]) return false;
    if (stats.playtimeSeconds < t.timeSeconds) return false;
    if (t.minRank) {
      const requiredIndex = SHINOBI_RANKS.findIndex((r) => r.id === t.minRank);
      if (requiredIndex !== -1 && currentRankIndex < requiredIndex) return false;
    }
    return true;
  });

  const handleClaim = (tierId: string) => {
    const result = claimOnlinePresenceReward(tierId);
    setNotification({
      message: result.message,
      isError: !result.success,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleClaimAll = () => {
    const result = claimAllOnlinePresenceRewards();
    setNotification({
      message: result.message,
      isError: !result.success,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-850 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Gift className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
                Provisões de Presença Shinobi
                <Badge variant="chakra">Metas Perpétuas</Badge>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Suprimentos e recompensas acumuladas conforme seu tempo de dedicação ao treinamento ninja.
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
            title="Fechar"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Dashboard de Métricas Econômicas */}
        <div className="p-4 bg-zinc-900/30 border-b border-zinc-850/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              <Clock className="w-3 h-3 text-zinc-400" />
              Tempo Ativo Total
            </div>
            <div className="mt-1 text-sm font-mono font-semibold text-zinc-100">
              {formatTime(stats.playtimeSeconds)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              <Zap className="w-3 h-3 text-amber-400" />
              CPS Estável (Média 60s)
            </div>
            <div className="mt-1 text-sm font-mono font-semibold text-amber-300">
              {formatBigNumber(stableRollingCPS)}/s
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              <Shield className="w-3 h-3 text-sky-400" />
              Teto Máximo (Hard-Cap)
            </div>
            <div className="mt-1 text-sm font-mono font-semibold text-sky-300">
              {formatBigNumber(hardCap)}
            </div>
          </div>
        </div>

        {/* Barra de Progresso Global & Ações em Lote */}
        <div className="px-5 py-3 bg-zinc-900/20 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Progresso das Provisões:
              </span>
              <span className="font-semibold text-zinc-200">
                {claimedCount} / {ONLINE_PRESENCE_TIERS.length} Concluídas ({((claimedCount / ONLINE_PRESENCE_TIERS.length) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
              <div
                style={{ width: `${(claimedCount / ONLINE_PRESENCE_TIERS.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              disabled={readyTiers.length === 0}
              onClick={handleClaimAll}
              className={`w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition border ${
                readyTiers.length > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Resgatar Todas ({readyTiers.length})</span>
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {notification && (
          <div
            className={`mx-4 mt-3 p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150 ${
              notification.isError
                ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            }`}
          >
            {notification.isError ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            )}
            <span className="leading-snug">{notification.message}</span>
          </div>
        )}

        {/* Buff Ativo */}
        {onlinePresenceBuffTimer > 0 && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs font-mono text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Bônus Vontade do Fogo Ativo</span>
            </div>
            <span className="font-bold">{Math.ceil(onlinePresenceBuffTimer)}s restantes</span>
          </div>
        )}

        {/* Lista de Tiers de Presença */}
        <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
          {ONLINE_PRESENCE_TIERS.map((tier) => {
            const isClaimed = !!onlinePresenceRewardsClaimed[tier.id];
            const hasTime = stats.playtimeSeconds >= tier.timeSeconds;

            let rankLocked = false;
            let requiredRankName = '';
            if (tier.minRank) {
              const minRankDef = SHINOBI_RANKS.find((r) => r.id === tier.minRank);
              const requiredIndex = SHINOBI_RANKS.findIndex((r) => r.id === tier.minRank);
              if (minRankDef && requiredIndex !== -1 && currentRankIndex < requiredIndex) {
                rankLocked = true;
                requiredRankName = minRankDef.title;
              }
            }

            const canClaim = !isClaimed && hasTime && !rankLocked;
            const potentialReward = calculatePresenceRewardChakra(
              tier.cpsSeconds,
              stableRollingCPS,
              generators
            );
            const progressPct = Math.min(100, Math.max(0, (stats.playtimeSeconds / tier.timeSeconds) * 100));

            return (
              <div
                key={tier.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isClaimed
                    ? 'bg-zinc-950/40 border-zinc-850 opacity-60'
                    : canClaim
                    ? 'bg-amber-950/15 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                    : 'bg-zinc-950/60 border-zinc-850/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">{tier.title}</h4>
                      {isClaimed && <Badge variant="neutral">Resgatado</Badge>}
                      {canClaim && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-semibold">
                          Pronto para Coletar!
                        </span>
                      )}
                      {tier.minRank && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            rankLocked
                              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60'
                          }`}
                        >
                          Requer {requiredRankName || 'Gennin'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{tier.desc}</p>

                    {/* Chips de Recompensas Detalhadas */}
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      {tier.cpsSeconds > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                          <Zap className="w-3 h-3 text-amber-400" />
                          +{formatBigNumber(potentialReward)} Chakra ({tier.cpsSeconds}s CPS)
                        </span>
                      )}
                      {!!tier.ancestralChakra && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                          <Flame className="w-3 h-3 text-emerald-400" />
                          +{tier.ancestralChakra} Chakra Ancestral
                        </span>
                      )}
                      {!!tier.gachaTickets && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                          <Ticket className="w-3 h-3 text-purple-400" />
                          +{tier.gachaTickets} Bilhete(s) Gacha
                        </span>
                      )}
                      {!!tier.weaponFragments && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[10px] font-mono">
                          <Wrench className="w-3 h-3 text-sky-400" />
                          +{tier.weaponFragments} Frag. Forja
                        </span>
                      )}
                      {!!tier.buffDurationSeconds && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono">
                          <Sparkles className="w-3 h-3 text-rose-400" />
                          +{tier.buffCpsPct || 10}% CPS ({Math.round(tier.buffDurationSeconds / 60)}m)
                        </span>
                      )}
                    </div>

                    {/* Barra de Progresso de Tempo */}
                    {!isClaimed && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                          <span>
                            {formatTime(Math.min(stats.playtimeSeconds, tier.timeSeconds))} / {formatTime(tier.timeSeconds)}
                          </span>
                          <span>{progressPct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-850">
                          <div
                            style={{ width: `${progressPct}%` }}
                            className={`h-full transition-all duration-300 rounded-sm ${
                              hasTime ? 'bg-amber-400' : 'bg-zinc-700'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Resgate Individual */}
                  <div className="flex-shrink-0 sm:self-center">
                    <button
                      disabled={!canClaim}
                      onClick={() => handleClaim(tier.id)}
                      className={`w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition border flex items-center justify-center gap-1.5 ${
                        isClaimed
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                          : rankLocked
                          ? 'bg-zinc-900/50 border-rose-900/40 text-rose-400 cursor-not-allowed'
                          : canClaim
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-sm cursor-pointer'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" /> Resgatado
                        </>
                      ) : rankLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-rose-400" /> Patente Baixa
                        </>
                      ) : canClaim ? (
                        <>
                          <Gift className="w-3.5 h-3.5 text-amber-300" /> Resgatar
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-zinc-500" /> Em Progresso
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
