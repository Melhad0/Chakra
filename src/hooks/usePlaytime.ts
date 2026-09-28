import { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ONLINE_PRESENCE_TIERS } from '../constants/rewards';
import { SHINOBI_RANKS, getCurrentRank } from '../constants/rankings';

export function usePlaytime() {
  const playtimeSeconds = useGameStore((state) => state.stats.playtimeSeconds);
  const claimedRewards = useGameStore((state) => state.onlinePresenceRewardsClaimed);
  const stats = useGameStore((state) => state.stats);
  const passedExams = useGameStore((state) => state.passedExams);

  return useMemo(() => {
    const totalSec = Math.floor(playtimeSeconds);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    let formatted = `${mins}m ${secs}s`;
    if (hrs > 0) {
      formatted = `${hrs}h ${formatted}`;
    }

    const currentRank = getCurrentRank(
      stats.manualClicksAllTime,
      stats.highestCPSRecord,
      stats.totalPrestiges,
      passedExams
    );
    const currentIndex = SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);

    // Identifica provisões prontas para resgate imediato e o próximo tier pendente no tempo
    let readyToClaimCount = 0;
    let nextTierRemainingSeconds: number | null = null;
    let nextTierTitle: string | null = null;

    for (const tier of ONLINE_PRESENCE_TIERS) {
      const isClaimed = !!claimedRewards[tier.id];
      if (isClaimed) continue;

      let rankLocked = false;
      if (tier.minRank) {
        const requiredIndex = SHINOBI_RANKS.findIndex((r) => r.id === tier.minRank);
        if (requiredIndex !== -1 && currentIndex < requiredIndex) {
          rankLocked = true;
        }
      }

      if (totalSec >= tier.timeSeconds) {
        if (!rankLocked) {
          readyToClaimCount++;
        }
      } else {
        const remaining = tier.timeSeconds - totalSec;
        if (nextTierRemainingSeconds === null || remaining < nextTierRemainingSeconds) {
          nextTierRemainingSeconds = remaining;
          nextTierTitle = tier.title;
        }
      }
    }

    let rewardCountdown = 'Concluído';
    if (readyToClaimCount > 0) {
      rewardCountdown = `${readyToClaimCount} Pronta(s)!`;
    } else if (nextTierRemainingSeconds !== null) {
      const rHrs = Math.floor(nextTierRemainingSeconds / 3600);
      const rMins = Math.floor((nextTierRemainingSeconds % 3600) / 60);
      const rSecs = nextTierRemainingSeconds % 60;
      if (rHrs > 0) {
        rewardCountdown = `${rHrs}h ${rMins}m`;
      } else {
        rewardCountdown = `${rMins}:${rSecs.toString().padStart(2, '0')}`;
      }
    }

    return {
      totalSeconds: totalSec,
      formatted,
      rewardCountdown,
      readyToClaimCount,
      nextTierRemainingSeconds,
      nextTierTitle,
    };
  }, [playtimeSeconds, claimedRewards, stats, passedExams]);
}
