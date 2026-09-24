import { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';

export function usePlaytime() {
  const playtimeSeconds = useGameStore((state) => state.stats.playtimeSeconds);

  return useMemo(() => {
    const totalSec = Math.floor(playtimeSeconds);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    let formatted = `${mins}m ${secs}s`;
    if (hrs > 0) {
      formatted = `${hrs}h ${formatted}`;
    }

    // Intervalo de presença para próxima recompensa (5 minutos)
    const nextRewardIn = Math.max(0, 300 - (totalSec % 300));
    const nextRewardMin = Math.floor(nextRewardIn / 60);
    const nextRewardSec = nextRewardIn % 60;
    const rewardCountdown = `${nextRewardMin}:${nextRewardSec.toString().padStart(2, '0')}`;

    return {
      totalSeconds: totalSec,
      formatted,
      rewardCountdown,
    };
  }, [playtimeSeconds]);
}
