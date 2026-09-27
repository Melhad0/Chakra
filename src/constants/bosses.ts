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
 * Dano de Ataque Desferido pelo Chefe contra o Shinobi
 * Escala progressiva: 20 * (1.12)^(bossId - 1) + bossId * 5
 */
export function calculateBossAttackDamage(bossId: number): number {
  return Math.max(15, Math.round(20 * Math.pow(1.12, Math.max(0, bossId - 1)) + bossId * 5));
}

/**
 * Cadência / Intervalo de Ataque do Chefe (em segundos)
 * O chefe ataca mais lentamente que o jogador (3.0s de tempo de preparação/cast)
 */
export function calculateBossAttackInterval(_bossId: number): number {
  return 3.0;
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
 * Curva de retornos decrescentes com teto em 75%
 */
export function calculateDodgeChance(agility: number): number {
  const pct = (agility / (agility + 450)) * 100;
  return Math.min(75, Math.max(0, Math.round(pct * 10) / 10));
}

