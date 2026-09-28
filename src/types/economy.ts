import Decimal from 'break_infinity.js';

export type TroopTierCategory = 'INICIANTE' | 'ELITE' | 'LENDARIO' | 'COSMICO' | 'DIVINO';

export interface GeneratorItem {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly baseCost: Decimal;
  readonly baseCPS: Decimal;
  level: number;
  unlocked: boolean;
  readonly tierCategory?: TroopTierCategory;
  readonly lore?: string;
}

export type ShopMode = 'buy' | 'sell';
export type ShopQty = 1 | 10 | 25 | 100 | 'max';

export interface UpgradeItem {
  readonly id: string;
  readonly name: string;
  readonly cost: Decimal;
  readonly description: string;
  readonly icon: string;
  purchased: boolean;
  readonly targetGenerator?: string;
  readonly multiplier?: number;
}
