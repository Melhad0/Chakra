import Decimal from 'break_infinity.js';
import { D } from './BigNumber';
import { GeneratorItem } from '../types/economy';
import { getGeneratorMilestoneEffects } from '../constants/upgrades';
import { EquipmentItem, ElementType, EquippedGearSlots } from '../types/inventory';
import { CLAN_NODES } from './data';

/**
 * Constantes de Inflação Hardcore por Segmento de Nível do Gerador
 * n <= 50: r = 1.22
 * 50 < n <= 100: r = 1.28
 * n > 100: r = 1.35
 */
export const TIER1_MAX = 50;
export const TIER1_RATE = 1.22;

export const TIER2_MAX = 100;
export const TIER2_RATE = 1.28;

export const TIER3_RATE = 1.35;

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
 * n <= 50: 1.22^n
 * 50 < n <= 100: 1.22^50 * 1.28^(n - 50)
 * n > 100: 1.22^50 * 1.28^50 * 1.35^(n - 100)
 */
export function getGeneratorLevelMultiplier(level: number): Decimal {
  const safeLevel = Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
  if (safeLevel <= 0) return D(1);

  if (safeLevel <= TIER1_MAX) {
    return D(TIER1_RATE).pow(safeLevel);
  }

  const base50 = D(TIER1_RATE).pow(TIER1_MAX);
  if (safeLevel <= TIER2_MAX) {
    return base50.mul(D(TIER2_RATE).pow(safeLevel - TIER1_MAX));
  }

  const base100 = base50.mul(D(TIER2_RATE).pow(TIER2_MAX - TIER1_MAX));
  return base100.mul(D(TIER3_RATE).pow(safeLevel - TIER2_MAX));
}

/**
 * Calcula a porcentagem total de desconto sobre o custo do gerador
 * considerando Fūinjutsu, marcos de nível e recompensas de patente.
 * Rebalanceado Hardcore: Teto de 35% e bônus reduzidos.
 */
export function getGeneratorCostDiscount(
  _generatorId: string,
  level: number,
  upgrades: Record<string, boolean> = {},
  claimedRankRewards: Record<string, boolean> = {}
): number {
  let discount = 0;

  // Descontos de Fūinjutsu & Economia Hardcore
  if (upgrades['chakra_concentration']) discount += 0.02;
  if (upgrades['four_symbols_seal']) discount += 0.02;
  if (upgrades['eight_trigrams_seal']) discount += 0.03;
  if (upgrades['adamantine_chains']) discount += 0.03;
  if (upgrades['reaper_seal']) discount += 0.04;
  if (upgrades['karma_seal']) discount += 0.04;
  if (upgrades['uzumaki_adamantine_domain']) discount += 0.05;
  if (upgrades['uzumaki_creation_temple_v3']) discount += 0.06;
  if (upgrades['amenotejikara_shift']) discount += 0.06;
  if (upgrades['shibai_divine_domain_v3']) discount += 0.08;

  // Recompensa de Promoção Jōnin (-2%)
  if (claimedRankRewards['jonin']) discount += 0.02;

  // Marco de Gerador Nível 50 (-3% específico deste gerador)
  if (level >= 50) {
    discount += 0.03;
  }

  // Teto seguro de desconto acumulado hardcore: 35%
  return Math.min(0.35, discount);
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
  const safeLevel = Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
  const scaledBase = baseCost.mul(Math.max(0.65, 1 - discountFactor));
  return scaledBase.mul(getGeneratorLevelMultiplier(safeLevel));
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
  const safeQty = Number.isFinite(qty) ? Math.floor(qty) : 0;
  if (safeQty <= 0) return D(0);
  const safeLevel = Number.isFinite(currentLevel) ? Math.max(0, Math.floor(currentLevel)) : 0;
  if (safeQty === 1) return getSingleGeneratorCost(baseCost, safeLevel, discountFactor);

  const scaledBase = baseCost.mul(Math.max(0.65, 1 - discountFactor));

  // Para pequenos lotes (<= 100), computação iterativa garante exatidão nos limites de transição
  if (safeQty <= 100) {
    let total = D(0);
    for (let i = 0; i < safeQty; i++) {
      total = total.add(scaledBase.mul(getGeneratorLevelMultiplier(safeLevel + i)));
    }
    return total;
  }

  // Para lotes massivos, computação analítica por faixas
  let total = D(0);
  let remaining = safeQty;
  let cur = safeLevel;

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
 * Utiliza logaritmo natural diretamente em Decimal (factor.ln()) evitando overflow para Infinity.
 */
export function calculateMaxBuy(
  baseCost: Decimal,
  currentLevel: number,
  currentChakra: Decimal,
  discountFactor: number = 0
): number {
  const safeLevel = Number.isFinite(currentLevel) ? Math.max(0, Math.floor(currentLevel)) : 0;
  if (!currentChakra || currentChakra.lte(0)) return 0;

  const initialCost = getSingleGeneratorCost(baseCost, safeLevel, discountFactor);
  if (currentChakra.lt(initialCost)) return 0;

  let remainingChakra = currentChakra;
  let bought = 0;
  let cur = safeLevel;

  // Segmento 1: até 50 (r = 1.18)
  if (cur < TIER1_MAX) {
    const maxInTier = TIER1_MAX - cur;
    const tierCost = calculateBatchCost(baseCost, cur, maxInTier, discountFactor);
    if (remainingChakra.lt(tierCost)) {
      const initial = getSingleGeneratorCost(baseCost, cur, discountFactor);
      const r = TIER1_RATE;
      const factor = remainingChakra.mul(r - 1).div(initial).add(1);
      const n = factor.gt(1) ? Math.floor(factor.ln() / Math.log(r)) : 0;
      return Math.min(maxInTier, Math.max(0, n));
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
      const n = factor.gt(1) ? Math.floor(factor.ln() / Math.log(r)) : 0;
      return Math.min(bought + maxInTier, bought + Math.max(0, n));
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
    const n = factor.gt(1) ? Math.floor(factor.ln() / Math.log(r)) : 0;
    return bought + Math.max(0, n);
  } catch {
    return bought;
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
  const safeLevel = Number.isFinite(currentLevel) ? Math.max(0, Math.floor(currentLevel)) : 0;
  const safeQty = Number.isFinite(qty) ? Math.floor(qty) : 0;
  const sellQty = Math.min(safeQty, safeLevel);
  if (sellQty <= 0) return D(0);

  const startLevel = safeLevel - sellQty;
  const spent = calculateBatchCost(baseCost, startLevel, sellQty, discountFactor);
  return spent.mul(0.40);
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
 * Rebalanceado Hardcore para evitar inflação numérica precoce.
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
  isAvatarShinobi: boolean = false,
  equippedGear?: Partial<EquippedGearSlots> | null
): Decimal {
  let total = D(0);

  for (const key in generators) {
    const gen = generators[key];
    if (gen.level <= 0) continue;

    // 1. Multiplicador de Marco do Gerador (Tier Milestones: 25, 50, 100, 200, 300, 500)
    const milestone = getGeneratorMilestoneEffects(gen.level);
    let genMultiplier = milestone.cpsMultiplier;

    // 2. Upgrades de Ninjutsu / Invocação específicos (Rebalanceados Hardcore)
    if (key === 'academy_student' && upgrades['tree_climbing']) genMultiplier = genMultiplier.mul(1.5);
    if (key === 'shadow_clone' && upgrades['shadow_clone_scroll']) genMultiplier = genMultiplier.mul(1.3);
    if (key === 'shadow_clone' && upgrades['ninja_food_pill']) genMultiplier = genMultiplier.mul(1.5);
    if (key === 'shadow_clone' && upgrades['tajuu_shadow_clone_v2']) genMultiplier = genMultiplier.mul(2.0);
    if ((key === 'shadow_clone' || key === 'six_paths_clone') && upgrades['six_paths_clones_v3']) genMultiplier = genMultiplier.mul(3.5);
    if (key === 'genin' && upgrades['fire_ball_jutsu']) genMultiplier = genMultiplier.mul(1.8);
    if ((key === 'genin' || key === 'chunin') && upgrades['gravity_training']) genMultiplier = genMultiplier.mul(1.5);
    if ((key === 'genin' || key === 'chunin') && upgrades['katon_dragon_fire_v2']) genMultiplier = genMultiplier.mul(2.5);
    if ((key === 'chunin' || key === 'jonin') && upgrades['katon_great_fire_annihilation_v3']) genMultiplier = genMultiplier.mul(4.0);
    if ((key === 'jonin' || key === 'anbu') && upgrades['sharingan']) genMultiplier = genMultiplier.mul(1.5);
    if ((key === 'kage' || key === 'uchiha_elite') && upgrades['choku_tomoe']) genMultiplier = genMultiplier.mul(1.5);
    if (key === 'sannin' && upgrades['summoning_scroll']) genMultiplier = genMultiplier.mul(1.5);
    if (key === 'seven_swordsmen' && upgrades['water_dragon']) genMultiplier = genMultiplier.mul(2.0);
    if (key === 'seven_swordsmen' && upgrades['water_shark_bomb_v2']) genMultiplier = genMultiplier.mul(3.0);
    if ((key === 'seven_swordsmen' || key === 'akatsuki_member') && upgrades['water_great_shark_bullet_v3']) genMultiplier = genMultiplier.mul(4.5);
    if ((key === 'akatsuki_member' || key === 'taka_member') && upgrades['chidori_stream']) genMultiplier = genMultiplier.mul(1.8);
    if ((key === 'jonin' || key === 'anbu') && upgrades['kirin_thunder']) genMultiplier = genMultiplier.mul(2.5);
    if ((key === 'jonin' || key === 'anbu') && upgrades['kamui_raikiri_v3']) genMultiplier = genMultiplier.mul(4.0);
    if (key === 'jinchuriki' && upgrades['edo_tensei']) genMultiplier = genMultiplier.mul(1.5);
    if ((key === 'jinchuriki' || key === 'sound_five') && upgrades['shinra_tensei_v1']) genMultiplier = genMultiplier.mul(1.8);
    if ((key === 'akatsuki_member' || key === 'taka_member') && upgrades['c4_karura']) genMultiplier = genMultiplier.mul(2.2);
    if ((key === 'bijuu_manifestation' || key === 'six_paths_clone' || key === 'rinnegan_six_paths') && upgrades['chibaku_tensei_planetary']) genMultiplier = genMultiplier.mul(3.5);
    if ((key === 'rinnegan_six_paths' || key === 'juubi_primordial') && upgrades['tengai_shinsei_meteor_v3']) genMultiplier = genMultiplier.mul(5.0);
    if ((key === 'senju_elite' || key === 'hamura_guardian' || key === 'wood_golem_senju') && upgrades['senpo_shinsu_senju']) genMultiplier = genMultiplier.mul(4.0);

    const genCPS = gen.baseCPS.mul(gen.level).mul(genMultiplier);
    total = total.add(genCPS);
  }

  // 3. Multiplicadores Globais de Fūinjutsu & Eficiência (Controlados)
  if (upgrades['sealing_scroll']) total = total.mul(1.05);
  if (upgrades['tactical_kunai']) total = total.mul(1.08);
  if (upgrades['ninja_sandals']) total = total.mul(1.10);
  if (upgrades['uzumaki_adamantine_domain']) total = total.mul(1.15);
  if (upgrades['uzumaki_creation_temple_v3']) total = total.mul(1.30);
  if (upgrades['shibai_divine_domain_v3']) total = total.mul(1.40);

  // 4. Multiplicadores Globais de Senjutsu & Transformações (Rebalanceamento Hardcore)
  if (upgrades['sage_mode']) total = total.mul(1.25);
  if (upgrades['sage_mode_hashirama_v2']) total = total.mul(1.80);
  if (upgrades['kurama_mode']) total = total.mul(1.60);
  if (upgrades['baryon_fission_strike']) total = total.mul(2.20);
  if (upgrades['susanoo_ribcage_v1']) total = total.mul(1.40);
  if (upgrades['susanoo_armored_v2']) total = total.mul(1.80);
  if (upgrades['perfect_susanoo']) total = total.mul(2.40);
  if (upgrades['amaterasu_flames_v1']) total = total.mul(1.35);
  if (upgrades['amaterasu_enteraphy']) total = total.mul(1.70);
  if (upgrades['amaterasu_inferno_domain_v3']) total = total.mul(2.40);
  if (upgrades['mangekyo_kamui_v3']) total = total.mul(2.20);
  if (upgrades['six_paths_sage']) total = total.mul(2.20);
  if (upgrades['six_paths_senjutsu']) total = total.mul(2.20);
  if (upgrades['kamui_dimension']) total = total.mul(1.80);
  if (upgrades['infinite_tsukuyomi']) total = total.mul(1.50);
  if (upgrades['otsutsuki_power']) total = total.mul(2.50);
  if (upgrades['sage_art_wood']) total = total.mul(2.0);
  if (upgrades['divine_tree']) total = total.mul(2.80);
  if (upgrades['creation_all_things']) total = total.mul(3.20);
  if (upgrades['creation_rebirth']) total = total.mul(2.20);

  // 5. Clãs Ancestrais (Multiplicadores Dinâmicos de Todos os Nós Despertos)
  for (const id in clanNodes) {
    if (clanNodes[id]) {
      const node = CLAN_NODES[id];
      if (node && node.cpsMultiplier && node.cpsMultiplier > 1) {
        total = total.mul(node.cpsMultiplier);
      }
    }
  }

  // 6. Recompensas de Promoção de Patentes Ninja
  if (claimedRankRewards['gennin']) total = total.mul(1.05); // +5%
  if (claimedRankRewards['tokubetsu_jonin']) total = total.mul(1.10); // +10%
  if (claimedRankRewards['anbu']) total = total.mul(1.15); // +15%
  if (claimedRankRewards['sannin']) total = total.mul(1.25); // +25%
  if (claimedRankRewards['rikudou']) total = total.mul(1.50); // +50%

  // 7. Oito Portões Internos (Multiplicador Calibrado de 1.5x a 15x)
  if (gatesActive && gatesUnlocked > 0) {
    const gateMultiplier = getGatesMultiplier(gatesUnlocked);
    total = total.mul(gateMultiplier);
  }

  // 8. Buff de Presença Online (+10% por 30 minutos do tier 2h)
  if (onlinePresenceBuff) {
    total = total.mul(1.10);
  }

  // 9. Colapso e Exaustão Shinobi Severa: Redução de 92% no CPS (-92% = x0.08)
  if (exhaustion) {
    total = total.mul(0.08);
  }

  // 10. Multiplicadores de Missões Shinobi (Permanentes e Buffs Ativos)
  if (missionMultiplier && missionMultiplier !== 1) {
    total = total.mul(missionMultiplier);
  }

  // 11. Multiplicadores de Equipamento de Todos os Slots
  const itemsToApply: EquipmentItem[] = [];
  if (equippedGear) {
    for (const item of Object.values(equippedGear)) {
      if (item) itemsToApply.push(item);
    }
  } else {
    if (equippedArmor) itemsToApply.push(equippedArmor);
    if (equippedWeapon) itemsToApply.push(equippedWeapon);
  }

  for (const item of itemsToApply) {
    if (item.bonusCpsMult && item.bonusCpsMult.gt(1)) {
      total = total.mul(item.bonusCpsMult);
    }
    if (
      item.elementalAffinityReq &&
      unlockedElements?.includes(item.elementalAffinityReq) &&
      item.elementalBonusCpsMult
    ) {
      total = total.mul(item.elementalBonusCpsMult);
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

  // 14. Domínio dos Cinco Elementos - Avatar Shinobi (Multiplicador Global x1.5)
  if (isAvatarShinobi) {
    total = total.mul(1.5);
  }

  return total;
}

/**
 * Calcula o poder de clique manual com Equação Sub-linear Hardcore
 * Formula: ChakraPorClique = (BaseClick + alpha * (CPS_total)^0.48) * MultClique
 */
export function calculateClickPower(
  totalCPS: Decimal,
  upgrades: Record<string, boolean> = {},
  clanNodes: Record<string, boolean> = {},
  generators: Record<string, GeneratorItem> = {},
  claimedRankRewards: Record<string, boolean> = {},
  equippedWeapon?: EquipmentItem | null,
  equippedArmor?: EquipmentItem | null,
  unlockedElements?: ElementType[],
  equippedGear?: Partial<EquippedGearSlots> | null
): Decimal {
  const baseClick = D(1);

  // Somatório dos coeficientes alpha (calibrados para evitar cliques explosivos)
  let alpha = 0;
  if (upgrades['kyuubi_cloak']) alpha += 0.001;
  if (upgrades['reaper_seal']) alpha += 0.003;
  if (upgrades['daytime_tiger']) alpha += 0.004;
  if (upgrades['rasen_shuriken_v3']) alpha += 0.004;
  if (upgrades['perfect_susanoo']) alpha += 0.005;
  if (upgrades['amaterasu_enteraphy']) alpha += 0.006;
  if (upgrades['amaterasu_inferno_domain_v3']) alpha += 0.010;
  if (upgrades['baryon_fission_strike']) alpha += 0.010;
  if (clanNodes['mangekyo_sharingan_lineage']) alpha += 0.005;
  if (claimedRankRewards['sannin']) alpha += 0.002;

  // Marco Nível 100 dos Geradores: +0.08% de alpha por gerador
  for (const key in generators) {
    const gen = generators[key];
    if (gen && gen.level >= 100) {
      alpha += 0.0008;
    }
  }

  // Teto seguro de acúmulo de alpha: 0.05 (5%)
  alpha = Math.min(0.05, alpha);

  // Curva Sub-linear Hardcore com expoente 0.48: alpha * (CPS)^0.48
  let cpsTerm = D(0);
  if (alpha > 0 && totalCPS.gt(0)) {
    cpsTerm = totalCPS.pow(0.48).mul(alpha);
  }

  const clickBeforeMult = baseClick.add(cpsTerm);

  // Multiplicadores de Clique Manual (MultClique) calibrados
  let clickMult = D(1);
  if (upgrades['leaf_hurricane']) clickMult = clickMult.mul(1.5);
  if (upgrades['leaf_great_hurricane_v2']) clickMult = clickMult.mul(2.0);
  if (upgrades['leaf_dragon_whirlwind_v3']) clickMult = clickMult.mul(3.0);
  if (upgrades['bandana_genin']) clickMult = clickMult.mul(1.25);
  if (upgrades['blade_storm']) clickMult = clickMult.mul(1.15);
  if (upgrades['rasengan_mastery']) clickMult = clickMult.mul(1.5);
  if (upgrades['rasengan_oodama_v2']) clickMult = clickMult.mul(2.2);
  if (upgrades['rasen_shuriken_v3']) clickMult = clickMult.mul(3.5);
  if (upgrades['morning_peacock']) clickMult = clickMult.mul(2.0);
  if (upgrades['truth_seeking_orbs']) clickMult = clickMult.mul(2.0);
  if (upgrades['otsutsuki_power']) clickMult = clickMult.mul(2.5);
  if (upgrades['creation_all_things']) clickMult = clickMult.mul(2.8);
  if (upgrades['flying_raijin_slice']) clickMult = clickMult.mul(1.8);
  if (upgrades['flying_raijin_guiding_thunder_v2']) clickMult = clickMult.mul(2.5);
  if (upgrades['flying_raijin_jikuukan_v3']) clickMult = clickMult.mul(4.5);
  if (upgrades['night_guy_dragon']) clickMult = clickMult.mul(5.0);

  // Recompensas de Promoção de Patente (Clique)
  if (claimedRankRewards['chunin']) clickMult = clickMult.mul(1.08); // +8%
  if (claimedRankRewards['anbu']) clickMult = clickMult.mul(1.15); // +15%

  // Clãs Ancestrais: Multiplicadores de Poder de Clique de Todos os Nós Despertos
  for (const id in clanNodes) {
    if (clanNodes[id]) {
      const node = CLAN_NODES[id];
      if (node && node.clickMultiplier && node.clickMultiplier > 1) {
        clickMult = clickMult.mul(node.clickMultiplier);
      }
    }
  }

  // Multiplicadores de Equipamento de Todos os Slots
  const clickItemsToApply: EquipmentItem[] = [];
  if (equippedGear) {
    for (const item of Object.values(equippedGear)) {
      if (item) clickItemsToApply.push(item);
    }
  } else {
    if (equippedWeapon) clickItemsToApply.push(equippedWeapon);
    if (equippedArmor) clickItemsToApply.push(equippedArmor);
  }

  for (const item of clickItemsToApply) {
    if (item.bonusClickMult && item.bonusClickMult.gt(1)) {
      clickMult = clickMult.mul(item.bonusClickMult);
    }
    if (
      item.elementalAffinityReq &&
      unlockedElements?.includes(item.elementalAffinityReq) &&
      item.elementalBonusClickMult
    ) {
      clickMult = clickMult.mul(item.elementalBonusClickMult);
    }
  }

  // Passiva Elemental: Raio (Raiton) - +10% de poder/velocidade de clique
  if (unlockedElements?.includes('LIGHTNING')) {
    clickMult = clickMult.mul(1.10);
  }

  return clickBeforeMult.mul(clickMult);
}

/**
 * Patamar Mínimo de Chakra para Prestígio (50 Trilhões / 5e13)
 */
export const PRESTIGE_THRESHOLD = D('50000000000000'); // 5e13

/**
 * Fórmula de Conversão de Chakra Ancestral de Longo Prazo:
 * ChakraAncestral = floor((ChakraAcumuladoNaRun / 5e13)^0.28)
 */
export function calculatePendingAncestralChakra(totalChakraEarned: Decimal): number {
  if (totalChakraEarned.lt(PRESTIGE_THRESHOLD)) {
    return 0;
  }
  const ratio = totalChakraEarned.div(PRESTIGE_THRESHOLD);
  const points = Math.floor(ratio.pow(0.28).toNumber());
  return Math.max(1, points);
}

/**
 * Teto Máximo (Hard-Cap) para Recompensas de Presença Online:
 * 20% do custo do gerador mais avançado desbloqueado no momento (Nerf Hardcore)
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
  return highestUnlockedCost.mul(0.20);
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
