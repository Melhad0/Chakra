import Decimal from 'break_infinity.js';
import { D } from './BigNumber';
import { GeneratorItem } from '../types/economy';
import { getGeneratorMilestoneEffects } from '../constants/upgrades';
import { EquipmentItem, ElementType } from '../types/inventory';

/**
 * Constantes de Inflação Hardcore por Segmento de Nível do Gerador
 * n <= 50: r = 1.18
 * 50 < n <= 100: r = 1.22
 * n > 100: r = 1.28
 */
export const TIER1_MAX = 50;
export const TIER1_RATE = 1.18;

export const TIER2_MAX = 100;
export const TIER2_RATE = 1.22;

export const TIER3_RATE = 1.28;

/**
 * Retorna a taxa de inflação geométrica do nível atual do gerador
 */
export function getGeneratorInflationRate(level: number): number {
  if (level < TIER1_MAX) return TIER1_RATE;
  if (level < TIER2_MAX) return TIER2_RATE;
  return TIER3_RATE;
}

/**
 * Multiplicador composto de custo acumulado pelo patamar de compras:
 * n <= 50: 1.18^n
 * 50 < n <= 100: 1.18^50 * 1.22^(n - 50)
 * n > 100: 1.18^50 * 1.22^50 * 1.28^(n - 100)
 */
export function getGeneratorLevelMultiplier(level: number): Decimal {
  if (level <= 0) return D(1);

  if (level <= TIER1_MAX) {
    return D(TIER1_RATE).pow(level);
  }

  const base50 = D(TIER1_RATE).pow(TIER1_MAX);
  if (level <= TIER2_MAX) {
    return base50.mul(D(TIER2_RATE).pow(level - TIER1_MAX));
  }

  const base100 = base50.mul(D(TIER2_RATE).pow(TIER2_MAX - TIER1_MAX));
  return base100.mul(D(TIER3_RATE).pow(level - TIER2_MAX));
}

/**
 * Calcula a porcentagem total de desconto sobre o custo do gerador
 * considerando Fūinjutsu, marcos de nível e recompensas de patente.
 */
export function getGeneratorCostDiscount(
  _generatorId: string,
  level: number,
  upgrades: Record<string, boolean> = {},
  claimedRankRewards: Record<string, boolean> = {}
): number {
  let discount = 0;

  // Descontos de Fūinjutsu & Economia
  if (upgrades['chakra_concentration']) discount += 0.05;
  if (upgrades['four_symbols_seal']) discount += 0.04;
  if (upgrades['eight_trigrams_seal']) discount += 0.06;
  if (upgrades['adamantine_chains']) discount += 0.08;
  if (upgrades['karma_seal']) discount += 0.10;

  // Recompensa de Promoção Jōnin (-3%)
  if (claimedRankRewards['jonin']) discount += 0.03;

  // Marco de Gerador Nível 50 (-5% específico deste gerador)
  if (level >= 50) {
    discount += 0.05;
  }

  // Teto seguro de desconto acumulado: 75%
  return Math.min(0.75, discount);
}

/**
 * Retorna o custo de um único gerador para um determinado nível considerando
 * a curva exponencial escalonada e descontos.
 */
export function getSingleGeneratorCost(
  baseCost: Decimal,
  level: number,
  discountFactor: number = 0
): Decimal {
  const scaledBase = baseCost.mul(Math.max(0.25, 1 - discountFactor));
  return scaledBase.mul(getGeneratorLevelMultiplier(level));
}

/**
 * Calcula o custo total de um lote de geradores usando progressão geométrica segmentada.
 */
export function calculateBatchCost(
  baseCost: Decimal,
  currentLevel: number,
  qty: number,
  discountFactor: number = 0
): Decimal {
  if (qty <= 0) return D(0);
  if (qty === 1) return getSingleGeneratorCost(baseCost, currentLevel, discountFactor);

  const scaledBase = baseCost.mul(Math.max(0.25, 1 - discountFactor));

  // Para pequenos lotes (<= 100), computação iterativa garante exatidão nos limites de transição
  if (qty <= 100) {
    let total = D(0);
    for (let i = 0; i < qty; i++) {
      total = total.add(scaledBase.mul(getGeneratorLevelMultiplier(currentLevel + i)));
    }
    return total;
  }

  // Para lotes massivos, computação analítica por faixas
  let total = D(0);
  let remaining = qty;
  let cur = currentLevel;

  // Faixa 1: até 50 (taxa 1.18)
  if (cur < TIER1_MAX && remaining > 0) {
    const countInTier = Math.min(remaining, TIER1_MAX - cur);
    const initial = scaledBase.mul(D(TIER1_RATE).pow(cur));
    const r = TIER1_RATE;
    const sumMult = D(r).pow(countInTier).sub(1).div(r - 1);
    total = total.add(initial.mul(sumMult));
    remaining -= countInTier;
    cur += countInTier;
  }

  // Faixa 2: 50 a 100 (taxa 1.22)
  if (cur >= TIER1_MAX && cur < TIER2_MAX && remaining > 0) {
    const countInTier = Math.min(remaining, TIER2_MAX - cur);
    const initial = scaledBase.mul(D(TIER1_RATE).pow(TIER1_MAX)).mul(D(TIER2_RATE).pow(cur - TIER1_MAX));
    const r = TIER2_RATE;
    const sumMult = D(r).pow(countInTier).sub(1).div(r - 1);
    total = total.add(initial.mul(sumMult));
    remaining -= countInTier;
    cur += countInTier;
  }

  // Faixa 3: > 100 (taxa 1.28)
  if (cur >= TIER2_MAX && remaining > 0) {
    const base100 = D(TIER1_RATE).pow(TIER1_MAX).mul(D(TIER2_RATE).pow(TIER2_MAX - TIER1_MAX));
    const initial = scaledBase.mul(base100).mul(D(TIER3_RATE).pow(cur - TIER2_MAX));
    const r = TIER3_RATE;
    const sumMult = D(r).pow(remaining).sub(1).div(r - 1);
    total = total.add(initial.mul(sumMult));
  }

  return total;
}

export const getBulkCost = calculateBatchCost;

/**
 * Calcula a quantidade máxima de geradores compráveis com o chakra atual.
 */
export function calculateMaxBuy(
  baseCost: Decimal,
  currentLevel: number,
  currentChakra: Decimal,
  discountFactor: number = 0
): number {
  const initialCost = getSingleGeneratorCost(baseCost, currentLevel, discountFactor);
  if (currentChakra.lt(initialCost)) return 0;

  let remainingChakra = currentChakra;
  let bought = 0;
  let cur = currentLevel;

  // Segmento 1: até 50 (r = 1.18)
  if (cur < TIER1_MAX) {
    const maxInTier = TIER1_MAX - cur;
    const tierCost = calculateBatchCost(baseCost, cur, maxInTier, discountFactor);
    if (remainingChakra.lt(tierCost)) {
      const initial = getSingleGeneratorCost(baseCost, cur, discountFactor);
      const r = TIER1_RATE;
      const factor = remainingChakra.mul(r - 1).div(initial).add(1);
      const n = Math.floor(Math.log(factor.toNumber()) / Math.log(r));
      return Math.max(1, n);
    }
    remainingChakra = remainingChakra.sub(tierCost);
    bought += maxInTier;
    cur = TIER1_MAX;
  }

  // Segmento 2: 50 a 100 (r = 1.22)
  if (cur < TIER2_MAX) {
    const maxInTier = TIER2_MAX - cur;
    const tierCost = calculateBatchCost(baseCost, cur, maxInTier, discountFactor);
    if (remainingChakra.lt(tierCost)) {
      const initial = getSingleGeneratorCost(baseCost, cur, discountFactor);
      const r = TIER2_RATE;
      const factor = remainingChakra.mul(r - 1).div(initial).add(1);
      const n = Math.floor(Math.log(factor.toNumber()) / Math.log(r));
      return Math.max(1, bought + Math.max(0, n));
    }
    remainingChakra = remainingChakra.sub(tierCost);
    bought += maxInTier;
    cur = TIER2_MAX;
  }

  // Segmento 3: > 100 (r = 1.28)
  const initial = getSingleGeneratorCost(baseCost, cur, discountFactor);
  const r = TIER3_RATE;
  try {
    const factor = remainingChakra.mul(r - 1).div(initial).add(1);
    const n = Math.floor(Math.log(factor.toNumber()) / Math.log(r));
    return Math.max(1, bought + Math.max(0, n));
  } catch {
    return Math.max(1, bought);
  }
}

export const getMaxBuyable = calculateMaxBuy;

/**
 * Calcula o reembolso de venda (80% do valor efetivo pago)
 */
export function getBulkSellRefund(
  baseCost: Decimal,
  currentLevel: number,
  qty: number,
  discountFactor: number = 0
): Decimal {
  const sellQty = Math.min(qty, currentLevel);
  if (sellQty <= 0) return D(0);

  const startLevel = currentLevel - sellQty;
  const spent = calculateBatchCost(baseCost, startLevel, sellQty, discountFactor);
  return spent.mul(0.8);
}

/**
 * Multiplicador Calibrado dos Oito Portões Internos (Picos Controlados de 1.5x a 15x)
 */
export function getGatesMultiplier(gatesUnlocked: number): number {
  if (gatesUnlocked <= 0) return 1.0;
  const multipliers = [1.0, 1.5, 2.0, 3.0, 4.5, 6.5, 9.0, 12.0, 15.0];
  return multipliers[Math.min(8, gatesUnlocked)] || 1.0;
}

/**
 * Calcula a taxa total de CPS com multiplicadores de técnicas, marcos de geradores,
 * portões internos calibrados, penalidade de exaustão e buff de presença.
 */
export function calculateTotalCPS(
  generators: Record<string, GeneratorItem>,
  upgrades: Record<string, boolean> = {},
  clanNodes: Record<string, boolean> = {},
  gatesUnlocked: number = 0,
  gatesActive: boolean = false,
  exhaustion: boolean = false,
  claimedRankRewards: Record<string, boolean> = {},
  onlinePresenceBuff: boolean = false,
  missionMultiplier: number = 1,
  equippedArmor?: EquipmentItem | null,
  equippedWeapon?: EquipmentItem | null,
  unlockedElements?: ElementType[],
  elementalSacrificePenaltyMult: number = 1,
  isAvatarShinobi: boolean = false
): Decimal {
  let total = D(0);

  for (const key in generators) {
    const gen = generators[key];
    if (gen.level <= 0) continue;

    // 1. Multiplicador de Marco do Gerador (Tier Milestones: 25, 50, 100, 200, 300, 500)
    const milestone = getGeneratorMilestoneEffects(gen.level);
    let genMultiplier = milestone.cpsMultiplier;

    // 2. Upgrades de Ninjutsu / Invocação específicos
    if (key === 'academy_student' && upgrades['tree_climbing']) genMultiplier = genMultiplier.mul(2.0);
    if (key === 'shadow_clone' && upgrades['shadow_clone_scroll']) genMultiplier = genMultiplier.mul(1.5);
    if (key === 'shadow_clone' && upgrades['ninja_food_pill']) genMultiplier = genMultiplier.mul(2.0);
    if (key === 'genin' && upgrades['fire_ball_jutsu']) genMultiplier = genMultiplier.mul(2.5);
    if ((key === 'genin' || key === 'chunin') && upgrades['gravity_training']) genMultiplier = genMultiplier.mul(2.0);
    if ((key === 'jonin' || key === 'anbu') && upgrades['sharingan']) genMultiplier = genMultiplier.mul(2.0);
    if (key === 'sannin' && upgrades['summoning_scroll']) genMultiplier = genMultiplier.mul(2.0);
    if (key === 'seven_swordsmen' && upgrades['water_dragon']) genMultiplier = genMultiplier.mul(3.0);
    if (key === 'kage' && upgrades['choku_tomoe']) genMultiplier = genMultiplier.mul(2.0);
    if (key === 'akatsuki_member' && upgrades['chidori_stream']) genMultiplier = genMultiplier.mul(2.5);
    if (key === 'jinchuriki' && upgrades['edo_tensei']) genMultiplier = genMultiplier.mul(2.0);

    const genCPS = gen.baseCPS.mul(gen.level).mul(genMultiplier);
    total = total.add(genCPS);
  }

  // 3. Multiplicadores Globais de Fūinjutsu & Eficiência
  if (upgrades['sealing_scroll']) total = total.mul(1.10);
  if (upgrades['tactical_kunai']) total = total.mul(1.15);
  if (upgrades['ninja_sandals']) total = total.mul(1.20);

  // 4. Multiplicadores Globais de Senjutsu & Transformações
  if (upgrades['sage_mode']) total = total.mul(1.50);
  if (upgrades['kurama_mode']) total = total.mul(2.50);
  if (upgrades['six_paths_sage']) total = total.mul(5.0);
  if (upgrades['infinite_tsukuyomi']) total = total.mul(2.0);
  if (upgrades['otsutsuki_power']) total = total.mul(6.0);
  if (upgrades['sage_art_wood']) total = total.mul(4.0);
  if (upgrades['divine_tree']) total = total.mul(8.0);
  if (upgrades['creation_all_things']) total = total.mul(10.0);
  if (upgrades['six_paths_senjutsu']) total = total.mul(5.0);

  // 5. Clãs Ancestrais
  if (clanNodes['primordial_chakra']) total = total.mul(1.50);
  if (clanNodes['uzumaki_vitality']) total = total.mul(2.0);
  if (clanNodes['senju_wood_release']) total = total.mul(3.0);
  if (clanNodes['chakra_fruit']) total = total.mul(5.0);

  // 6. Recompensas de Promoção de Patentes Ninja
  if (claimedRankRewards['gennin']) total = total.mul(1.05); // +5%
  if (claimedRankRewards['tokubetsu_jonin']) total = total.mul(1.15); // +15%
  if (claimedRankRewards['anbu']) total = total.mul(1.20); // +20%
  if (claimedRankRewards['sannin']) total = total.mul(1.50); // +50%
  if (claimedRankRewards['rikudou']) total = total.mul(2.0); // Dobro global

  // 7. Oito Portões Internos (Multiplicador Calibrado de 1.5x a 15x)
  if (gatesActive && gatesUnlocked > 0) {
    const gateMultiplier = getGatesMultiplier(gatesUnlocked);
    total = total.mul(gateMultiplier);
  }

  // 8. Buff de Presença Online (+10% por 30 minutos do tier 2h)
  if (onlinePresenceBuff) {
    total = total.mul(1.10);
  }

  // 9. Colapso e Exaustão Shinobi Severa: Redução de 85% no CPS (-85% = x0.15)
  if (exhaustion) {
    total = total.mul(0.15);
  }

  // 10. Multiplicadores de Missões Shinobi (Permanentes e Buffs Ativos)
  if (missionMultiplier && missionMultiplier !== 1) {
    total = total.mul(missionMultiplier);
  }

  // 11. Multiplicadores de Equipamento (Armadura & Arma)
  if (equippedArmor) {
    if (equippedArmor.bonusCpsMult && equippedArmor.bonusCpsMult.gt(1)) {
      total = total.mul(equippedArmor.bonusCpsMult);
    }
    if (
      equippedArmor.elementalAffinityReq &&
      unlockedElements?.includes(equippedArmor.elementalAffinityReq) &&
      equippedArmor.elementalBonusCpsMult
    ) {
      total = total.mul(equippedArmor.elementalBonusCpsMult);
    }
  }

  if (equippedWeapon) {
    if (equippedWeapon.bonusCpsMult && equippedWeapon.bonusCpsMult.gt(1)) {
      total = total.mul(equippedWeapon.bonusCpsMult);
    }
    if (
      equippedWeapon.elementalAffinityReq &&
      unlockedElements?.includes(equippedWeapon.elementalAffinityReq) &&
      equippedWeapon.elementalBonusCpsMult
    ) {
      total = total.mul(equippedWeapon.elementalBonusCpsMult);
    }
  }

  // 12. Passiva Elemental: Vento (Fūton) - +10% no CPS passivo de todos os geradores
  if (unlockedElements?.includes('WIND')) {
    total = total.mul(1.10);
  }

  // 13. Penalidade Permanente por Sacrifício de Linhagem (2º e 3º Elementos: -25% por sacrifício)
  if (elementalSacrificePenaltyMult && elementalSacrificePenaltyMult > 0 && elementalSacrificePenaltyMult < 1) {
    total = total.mul(elementalSacrificePenaltyMult);
  }

  // 14. Domínio dos Cinco Elementos - Avatar Shinobi (Multiplicador Global x3.0)
  if (isAvatarShinobi) {
    total = total.mul(3.0);
  }

  return total;
}

/**
 * Calcula o poder de clique manual com Equação Sub-linear (alpha-scaling com expoente 0.65)
 * Formula: ChakraPorClique = (BaseClick + alpha * (CPS_total)^0.65) * MultClique
 */
export function calculateClickPower(
  totalCPS: Decimal,
  upgrades: Record<string, boolean> = {},
  clanNodes: Record<string, boolean> = {},
  generators: Record<string, GeneratorItem> = {},
  claimedRankRewards: Record<string, boolean> = {},
  equippedWeapon?: EquipmentItem | null,
  equippedArmor?: EquipmentItem | null,
  unlockedElements?: ElementType[]
): Decimal {
  const baseClick = D(1);

  // Somatório dos coeficientes alpha (nerfados em 60% para conter avalanche)
  let alpha = 0;
  if (upgrades['kyuubi_cloak']) alpha += 0.002; // de 0.005 -> 0.002
  if (upgrades['reaper_seal']) alpha += 0.008; // de 0.020 -> 0.008
  if (upgrades['daytime_tiger']) alpha += 0.010; // de 0.025 -> 0.010
  if (upgrades['perfect_susanoo']) alpha += 0.012; // de 0.030 -> 0.012
  if (clanNodes['mangekyo_sharingan_lineage']) alpha += 0.012; // de 0.030 -> 0.012
  if (claimedRankRewards['sannin']) alpha += 0.004; // de 0.010 -> 0.004

  // Marco Nível 100 dos Geradores: +0.2% de alpha por gerador
  for (const key in generators) {
    const gen = generators[key];
    if (gen && gen.level >= 100) {
      alpha += 0.002;
    }
  }

  // Curva Sub-linear de Retornos Decrescentes: alpha * (CPS)^0.65
  let cpsTerm = D(0);
  if (alpha > 0 && totalCPS.gt(0)) {
    cpsTerm = totalCPS.pow(0.65).mul(alpha);
  }

  const clickBeforeMult = baseClick.add(cpsTerm);

  // Multiplicadores de Clique Manual (MultClique)
  let clickMult = D(1);
  if (upgrades['leaf_hurricane']) clickMult = clickMult.mul(2.0);
  if (upgrades['bandana_genin']) clickMult = clickMult.mul(1.5);
  if (upgrades['blade_storm']) clickMult = clickMult.mul(1.3);
  if (upgrades['rasengan_mastery']) clickMult = clickMult.mul(2.0);
  if (upgrades['morning_peacock']) clickMult = clickMult.mul(3.0);
  if (upgrades['truth_seeking_orbs']) clickMult = clickMult.mul(3.0);
  if (upgrades['otsutsuki_power']) clickMult = clickMult.mul(4.0);
  if (upgrades['creation_all_things']) clickMult = clickMult.mul(5.0);

  // Recompensas de Promoção de Patente (Clique)
  if (claimedRankRewards['chunin']) clickMult = clickMult.mul(1.10); // +10%
  if (claimedRankRewards['anbu']) clickMult = clickMult.mul(1.25); // +25%

  // Clã Uchiha Susano'o Primordial
  if (clanNodes['perfect_susanoo_lineage']) {
    clickMult = clickMult.mul(10.0);
  }

  // Multiplicadores de Equipamento (Arma e Armadura)
  if (equippedWeapon) {
    if (equippedWeapon.bonusClickMult && equippedWeapon.bonusClickMult.gt(1)) {
      clickMult = clickMult.mul(equippedWeapon.bonusClickMult);
    }
    if (
      equippedWeapon.elementalAffinityReq &&
      unlockedElements?.includes(equippedWeapon.elementalAffinityReq) &&
      equippedWeapon.elementalBonusClickMult
    ) {
      clickMult = clickMult.mul(equippedWeapon.elementalBonusClickMult);
    }
  }

  if (equippedArmor) {
    if (equippedArmor.bonusClickMult && equippedArmor.bonusClickMult.gt(1)) {
      clickMult = clickMult.mul(equippedArmor.bonusClickMult);
    }
    if (
      equippedArmor.elementalAffinityReq &&
      unlockedElements?.includes(equippedArmor.elementalAffinityReq) &&
      equippedArmor.elementalBonusClickMult
    ) {
      clickMult = clickMult.mul(equippedArmor.elementalBonusClickMult);
    }
  }

  // Passiva Elemental: Raio (Raiton) - +10% de poder/velocidade de clique
  if (unlockedElements?.includes('LIGHTNING')) {
    clickMult = clickMult.mul(1.10);
  }

  return clickBeforeMult.mul(clickMult);
}

/**
 * Patamar Mínimo de Chakra para Prestígio (10 Trilhões / 10^13)
 */
export const PRESTIGE_THRESHOLD = D('10000000000000'); // 1e13

/**
 * Fórmula de Conversão de Chakra Ancestral de Longo Prazo:
 * ChakraAncestral = floor((ChakraAcumuladoNaRun / 10^13)^0.35)
 */
export function calculatePendingAncestralChakra(totalChakraEarned: Decimal): number {
  if (totalChakraEarned.lt(PRESTIGE_THRESHOLD)) {
    return 0;
  }
  const ratio = totalChakraEarned.div(PRESTIGE_THRESHOLD);
  const points = Math.floor(ratio.pow(0.35).toNumber());
  return Math.max(1, points);
}

/**
 * Teto Máximo (Hard-Cap) para Recompensas de Presença Online:
 * 50% do custo do gerador mais avançado desbloqueado no momento
 */
export function getOnlineRewardHardCap(generators: Record<string, GeneratorItem>): Decimal {
  let highestUnlockedCost = D(1000);
  for (const key in generators) {
    const gen = generators[key];
    if (gen && (gen.unlocked || gen.level > 0)) {
      const cost = getSingleGeneratorCost(gen.baseCost, gen.level);
      if (cost.gt(highestUnlockedCost)) {
        highestUnlockedCost = cost;
      }
    }
  }
  return highestUnlockedCost.mul(0.5);
}

/**
 * Calcula a recompensa em Chakra por tempo de presença online
 * baseado no CPS estável móvel e limitado estritamente pelo Hard-Cap.
 */
export function calculatePresenceRewardChakra(
  cpsSeconds: number,
  stableRollingCPS: Decimal,
  generators: Record<string, GeneratorItem>
): Decimal {
  if (cpsSeconds <= 0) return D(0);
  const baseReward = stableRollingCPS.mul(cpsSeconds);
  const hardCap = getOnlineRewardHardCap(generators);
  return Decimal.min(baseReward, hardCap).round();
}
