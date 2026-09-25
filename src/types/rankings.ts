import Decimal from 'break_infinity.js';

export type ShinobiRankId =
  | 'estudante'
  | 'gennin'
  | 'chunin'
  | 'tokubetsu_jonin'
  | 'jonin'
  | 'anbu'
  | 'sannin'
  | 'kage'
  | 'rikudou';

export type LeaderboardType =
  | 'sessionClicks'
  | 'allTimeClicks'
  | 'peakCps'
  | 'prestiges';

export interface RankPromotionReward {
  readonly title: string;
  readonly description: string;
  readonly effectType:
    | 'cps_global_pct'
    | 'click_power_pct'
    | 'gacha_ticket'
    | 'weapon_fragments'
    | 'generator_cost_pct'
    | 'ancestral_chakra'
    | 'cosmetic_aura'
    | 'global_multiplier';
  readonly value: number;
}

export interface ShinobiRankDefinition {
  readonly id: ShinobiRankId;
  readonly title: string;
  readonly subtitle: string;
  readonly minClicksAllTime: number;
  readonly minCPS: Decimal;
  readonly minPrestiges: number;
  readonly badgeClass: string;
  readonly borderClass: string;
  readonly accentColor: string;
  readonly reward: RankPromotionReward;
}

export interface RivalShinobi {
  readonly rankPosition: number;
  readonly name: string;
  readonly title: string;
  readonly rankId: ShinobiRankId;
  readonly avatar: string;
  readonly sessionClicks: number;
  readonly allTimeClicks: number;
  readonly peakCPS: Decimal;
  readonly prestiges: number;
  readonly quote: string;
}

export interface RankingSyncPayload {
  username: string;
  ninjaId: number;
  manualClicksSession: number;
  manualClicksAllTime: number;
  highestCpsRecord: string;
  totalPrestiges: number;
  currentRank: ShinobiRankId;
}

export interface GlobalLeaderboardEntry {
  ninjaId: number;
  username: string;
  rank: ShinobiRankId;
  scoreFormatted: string;
  highestCpsRecord: string;
  manualClicksAllTime: number;
  totalPrestiges: number;
  updatedAt: string;
}
