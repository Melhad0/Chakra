import Decimal from 'break_infinity.js';

export type ArcName =
  | 'Todos'
  | 'Clássico'
  | 'Filler Clássico'
  | 'Shippuden'
  | 'Filler Shippuden'
  | 'Guerra & Otsutsuki'
  | 'Boruto & Pós-Guerra';

export type BossTier =
  | 'Inicial / Chūnin'
  | 'Jōnin / Invasões'
  | 'Kage / Lendário'
  | 'Continental / Divino';

export type BossMechanicType =
  | 'mizuki_rage'
  | 'ebisu_rush'
  | 'kankuro_poison'
  | 'baki_wind'
  | 'tayuya_drain'
  | 'sakon_regen'
  | 'jirobo_shield'
  | 'chiyo_puppets'
  | 'mifune_iai'
  | 'kinkaku_words'
  | 'danzo_baku'
  | 'muu_fission'
  | 'raikage_armor'
  | 'toneri_qte'
  | 'isshiki_cubes'
  | 'standard';

export interface BossMechanic {
  type: BossMechanicType;
  title: string;
  description: string;
}

export interface BossData {
  id: number;
  name: string;
  title: string;
  level: string;
  tier: BossTier;
  arc: string;
  avatar: string;
  justification: string;
  hp: Decimal;
  timer: number;
  bountyChakra: Decimal;
  bountyAncestral: number;
  weaponFragments?: number;
  gachaTickets?: number;
  mechanic: BossMechanic;
}

export interface BossGauntletState {
  currentActiveBossId: number;        // ID do chefe atualmente selecionado/ativo (1 a N)
  highestBossDefeated: number;        // Recorde histórico da conta
  cooldownExpiresAt: number | null;   // Timestamp UNIX do fim do cooldown
  isFighting: boolean;
  bossCurrentHp: Decimal;
  bossTimeRemaining: number;
  maxUnlockedBoss: number;            // Alias retrocompatível (sempre = highestBossDefeated)
  autoAdvance?: boolean;              // Passar para o próximo chefe automático
  autoLoop?: boolean;                 // Repetir a batalha em forma de loop
}

export type BossNavigationState = BossGauntletState;

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

export const MAX_COMBAT_LEVEL = 700;
export const POINTS_PER_LEVEL = 8;

export interface ShinobiCombatStats {
  level: number;              // Nível atual (1 até 700)
  currentXp: Decimal;         // XP acumulado no nível atual
  requiredXp: Decimal;        // XP necessário para o próximo nível
  unspentStatPoints: number;  // Pontos de atributo livres para distribuição
  strength: number;           // Força: Aumenta o Dano causado aos chefes
  vitality: number;           // Vida: Aumenta a Vida Máxima (HP) do jogador
  agility: number;            // Agilidade: Aumenta a Chance de Esquiva de golpes
}

export interface BossLootPreview {
  equipmentName: string;
  equipmentRarity: string;
  equipmentDropChancePct: number;
  materialName: string;
  materialDropChancePct: number;
  xpReward: Decimal;
}

