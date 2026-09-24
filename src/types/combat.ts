import Decimal from 'break_infinity.js';

export type ArcName = 'Todos' | 'Clássico' | 'Filler Clássico' | 'Shippuden' | 'Filler Shippuden' | 'Guerra & Otsutsuki';

export interface GauntletEnemy {
  readonly id: number;
  readonly name: string;
  readonly arc: ArcName;
  readonly title: string;
  readonly avatar: string;
  readonly baseHp: Decimal;
}

export type ChuninPhaseId = 1 | 2 | 3;

export interface ArenaOpponent {
  readonly name: string;
  readonly title: string;
  readonly hp: number;
  readonly maxHp: number;
  readonly avatar: string;
  readonly qtePrompt: string;
  readonly qteDuration: number;
}
