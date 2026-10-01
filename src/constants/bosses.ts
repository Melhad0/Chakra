export * from '../data/gauntletBosses';
export {
  GAUNTLET_BOSSES,
  calculateBossHP,
  calculateBossBounty,
  calculateEffectiveBossReward,
  BASE_BOSS_REWARD,
  HP_BASE,
  HP_GROWTH,
} from '../data/gauntletBosses';

import Decimal from 'break_infinity.js';
import { D } from '../engine/BigNumber';

/**
 * Dano de Ataque Desferido pelo Chefe contra o Shinobi (Hardcore)
 * Escala progressiva severa: 28 * (1.15)^(bossId - 1) + bossId * 8
 */
export function calculateBossAttackDamage(bossId: number): number {
  return Math.max(25, Math.round(28 * Math.pow(1.15, Math.max(0, bossId - 1)) + bossId * 8));
}

/**
 * Cadência / Intervalo de Ataque do Chefe (em segundos)
 * O chefe ataca com velocidade aumentada (2.2s de tempo de preparação/cast)
 */
export function calculateBossAttackInterval(_bossId: number): number {
  return 2.2;
}

/**
 * Recompensa de Experiência (XP) ao derrotar um chefe
 * XP = 250 * (bossId)^1.75
 */
export function calculateBossXp(bossId: number): Decimal {
  const xp = Math.round(250 * Math.pow(Math.max(1, bossId), 1.75));
  return D(xp);
}

/**
 * Requisito de XP para o próximo nível (Nível 1 até 700)
 * XP_req = 150 * (level)^1.85 + 500
 */
export function calculateRequiredXp(level: number): Decimal {
  if (level >= 700) return D('999999999999999');
  const req = Math.round(150 * Math.pow(Math.max(1, level), 1.85) + 500);
  return D(req);
}

/**
 * Vida Máxima (HP) do Jogador
 * Base = 100 + (Vitalidade * 45) * Multiplicadores de Trajes/Armaduras
 */
export function calculatePlayerMaxHp(vitality: number, armorMultiplier: Decimal = D(1)): number {
  const base = 100 + vitality * 45;
  const mult = armorMultiplier.gt(1) ? armorMultiplier.toNumber() : 1;
  return Math.round(base * mult);
}

/**
 * Dano de Ataque do Jogador contra Chefes (Independente do CPS!)
 * Base = 15 + (Força * 8) * Multiplicadores de Armas
 */
export function calculatePlayerDamage(strength: number, weaponMultiplier: Decimal = D(1)): number {
  const base = 15 + strength * 8;
  const mult = weaponMultiplier.gt(1) ? weaponMultiplier.toNumber() : 1;
  return Math.round(base * mult);
}

/**
 * Chance de Esquiva do Jogador contra Ataques de Chefes (Agilidade)
 * Curva severa com teto hardcore rebaixado de 75% para 35%
 */
export function calculateDodgeChance(agility: number): number {
  const pct = (agility / (agility + 750)) * 60;
  return Math.min(35, Math.max(0, Math.round(pct * 10) / 10));
}

