import Decimal from 'break_infinity.js';

export type UpgradeCategory = 'taijutsu' | 'ninjutsu' | 'senjutsu' | 'fuinjutsu';

export type UpgradeEffectType =
  | 'click_flat'
  | 'click_multiplier'
  | 'click_cps_ratio'
  | 'crit_chance'
  | 'crit_multiplier'
  | 'generator_multiplier'
  | 'global_cps'
  | 'generator_cost_discount'
  | 'offline_efficiency'
  | 'gate_bonus'
  | 'elemental_synergy';

export interface TechniqueUpgrade {
  readonly id: string;
  readonly name: string;
  readonly category: UpgradeCategory;
  readonly description: string;
  readonly cost: Decimal;
  readonly icon: string;
  readonly effectType: UpgradeEffectType;
  readonly multiplier?: number;
  readonly targetGenerator?: string;
  readonly requiredBossId?: number;
  readonly customFogChakra?: Decimal;
}

export interface GeneratorMilestoneEffect {
  readonly cpsMultiplier: Decimal;
  readonly costDiscount: number;
  readonly clickCpsRatio: number;
  readonly tierName: string;
  readonly badgeColor: string;
  readonly nextMilestoneLevel: number | null;
}
