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

  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const hardCap = getOnlineRewardHardCap(generators);
  const currentRank = getCurrentRank(
    stats.manualClicksAllTime,
    stats.highestCPSRecord,
    stats.totalPrestiges
  );

  const formatTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleClaim = (tierId: string) => {
    const result = claimOnlinePresenceReward(tierId);
    setNotification({
      message: result.message,
      isError: !result.success,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Gift className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Provisões de Presença Shinobi
                <Badge variant="chakra">Economia Calibrada</Badge>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Recompensas balanceadas baseadas na média móvel estável e com teto anti-inflacionário.
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Dashboard de Métricas Econômicas */}
        <div className="p-4 bg-zinc-900/30 border-b border-zinc-850/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              <Clock className="w-3 h-3 text-zinc-400" />
              Tempo Online Ativo
            </div>
            <div className="mt-1 text-sm font-mono font-semibold text-zinc-100">
              {formatTime(stats.playtimeSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              <Zap className="w-3 h-3 text-amber-400" />
              CPS Estável (Média 60s)
            </div>
            <div className="mt-1 text-sm font-mono font-semibold text-amber-300">
              {formatBigNumber(stableRollingCPS)}/s
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              <Shield className="w-3 h-3 text-sky-400" />
              Teto Máximo (Hard-Cap)
            </div>
            <div className="mt-1 text-sm font-mono font-semibold text-sky-300">
              {formatBigNumber(hardCap)}
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {notification && (
          <div
            className={`mx-4 mt-3 p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
              notification.isError
                ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
            }`}
          >
            {notification.isError ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Buff Ativo */}
        {onlinePresenceBuffTimer > 0 && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs font-mono text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Bônus Vontade do Fogo (+10% CPS Ativo)</span>
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
              const currentIndex = SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);
              const requiredIndex = SHINOBI_RANKS.findIndex((r) => r.id === tier.minRank);
              if (minRankDef && requiredIndex !== -1 && currentIndex < requiredIndex) {
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
                    ? 'bg-zinc-900/80 border-amber-600/40 shadow-sm'
                    : 'bg-zinc-950/60 border-zinc-850/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-semibold text-zinc-100">{tier.title}</h4>
                      {isClaimed && <Badge variant="neutral">Resgatado</Badge>}
                      {tier.minRank && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                          Requer {requiredRankName || 'Gennin'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{tier.desc}</p>

                    {/* Estimativa de Chakra */}
                    {tier.cpsSeconds > 0 && (
                      <div className="mt-2 text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                        <span>Chakra estimado:</span>
                        <strong className="text-amber-300">+{formatBigNumber(potentialReward)}</strong>
                        <span className="text-zinc-500">
                          ({tier.cpsSeconds}s CPS, máx {formatBigNumber(hardCap)})
                        </span>
                      </div>
                    )}

                    {/* Barra de Progresso de Tempo */}
                    {!isClaimed && (
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                          <span>
                            {formatTime(Math.min(stats.playtimeSeconds, tier.timeSeconds))} / {formatTime(tier.timeSeconds)}
                          </span>
                          <span>{progressPct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-900 rounded-sm overflow-hidden">
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

                  {/* Botão de Resgate */}
                  <div className="flex-shrink-0 self-center">
                    <button
                      disabled={!canClaim}
                      onClick={() => handleClaim(tier.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition border flex items-center gap-1.5 ${
                        isClaimed
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                          : rankLocked
                          ? 'bg-zinc-900/50 border-zinc-800 text-rose-400 cursor-not-allowed'
                          : canClaim
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm cursor-pointer'
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
