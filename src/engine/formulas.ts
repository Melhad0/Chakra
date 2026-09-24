import Decimal from 'break_infinity.js';
import { D } from './BigNumber';
import { GeneratorItem } from '../types/economy';

export const COST_MULTIPLIER = 1.15;

/**
 * Retorna o custo de um gerador para um determinado nível
 */
export function getSingleGeneratorCost(baseCost: Decimal, level: number): Decimal {
  return baseCost.mul(D(COST_MULTIPLIER).pow(level));
}

/**
 * Calcula a quantidade máxima de geradores compráveis
 * Fórmula: r^n <= 1 + (chakra * (r - 1) / initialCost)
 */
export function getMaxBuyable(baseCost: Decimal, currentLevel: number, currentChakra: Decimal): number {
  const initial = getSingleGeneratorCost(baseCost, currentLevel);
  if (currentChakra.lt(initial)) return 0;

  const r = COST_MULTIPLIER;
  try {
    const factor = currentChakra.mul(r - 1).div(initial).add(1);
    const n = Math.floor(Math.log(factor.toNumber()) / Math.log(r));
    return Math.max(1, n);
  } catch {
    return 1;
  }
}

/**
 * Calcula o custo total usando soma de progressão geométrica:
 * Custo = initial * (r^qty - 1) / (r - 1)
 */
export function getBulkCost(baseCost: Decimal, currentLevel: number, qty: number): Decimal {
  if (qty <= 0) return D(0);
  if (qty === 1) return getSingleGeneratorCost(baseCost, currentLevel);

  const initial = getSingleGeneratorCost(baseCost, currentLevel);
  const r = COST_MULTIPLIER;
  const sumMultiplier = D(r).pow(qty).sub(1).div(r - 1);
  return initial.mul(sumMultiplier);
}

/**
 * Calcula o reembolso de venda (80% do valor)
 */
export function getBulkSellRefund(baseCost: Decimal, currentLevel: number, qty: number): Decimal {
  const sellQty = Math.min(qty, currentLevel);
  if (sellQty <= 0) return D(0);

  let refund = D(0);
  const r = COST_MULTIPLIER;
  for (let i = 0; i < sellQty; i++) {
    refund = refund.add(baseCost.mul(D(r).pow(currentLevel - 1 - i)));
  }
  return refund.mul(0.8);
}

/**
 * Calcula a taxa total de CPS com multiplicadores e portões internos
 */
export function calculateTotalCPS(
  generators: Record<string, GeneratorItem>,
  upgrades: Record<string, boolean>,
  clanNodes: Record<string, boolean>,
  gatesUnlocked: number,
  gatesActive: boolean,
  exhaustion: boolean
): Decimal {
  let total = D(0);

  for (const key in generators) {
    const gen = generators[key];
    if (gen.level <= 0) continue;

    let genMultiplier = D(1);
    if (key === 'academy_student' && upgrades['tree_climbing']) genMultiplier = genMultiplier.mul(2);
    if (key === 'shadow_clone' && upgrades['ninja_food_pill']) genMultiplier = genMultiplier.mul(2);
    if (key === 'shadow_clone' && upgrades['shadow_clone_scroll']) genMultiplier = genMultiplier.mul(1.5);
    if ((key === 'genin' || key === 'chunin') && upgrades['gravity_training']) genMultiplier = genMultiplier.mul(2);
    if ((key === 'jonin' || key === 'anbu') && upgrades['sharingan']) genMultiplier = genMultiplier.mul(2);
    if (key === 'sannin' && upgrades['summoning_scroll']) genMultiplier = genMultiplier.mul(2);
    if (key === 'kage' && upgrades['choku_tomoe']) genMultiplier = genMultiplier.mul(2);
    if (key === 'jinchuriki' && upgrades['edo_tensei']) genMultiplier = genMultiplier.mul(2);

    const genCPS = gen.baseCPS.mul(gen.level).mul(genMultiplier);
    total = total.add(genCPS);
  }

  // Multiplicadores Globais de Upgrades
  if (upgrades['six_paths_sage']) total = total.mul(5);
  if (upgrades['infinite_tsukuyomi']) total = total.mul(2);
  if (upgrades['otsutsuki_power']) total = total.mul(6);
  if (upgrades['divine_tree']) total = total.mul(8);
  if (upgrades['creation_all_things']) total = total.mul(10);

  // Clãs
  if (clanNodes['primordial_chakra']) total = total.mul(1.5);
  if (clanNodes['uzumaki_vitality']) total = total.mul(2.0);
  if (clanNodes['senju_wood_release']) total = total.mul(3.0);
  if (clanNodes['chakra_fruit']) total = total.mul(5.0);

  // Oito Portões Internos
  if (gatesActive && gatesUnlocked > 0) {
    const gateMultiplier = 1.0 + gatesUnlocked * 1.5;
    total = total.mul(gateMultiplier);
  }

  // Exaustão do 8º Portão
  if (exhaustion) {
    total = total.mul(0.1);
  }

  return total;
}

/**
 * Calcula o poder de clique manual
 */
export function calculateClickPower(
  totalCPS: Decimal,
  upgrades: Record<string, boolean>,
  clanNodes: Record<string, boolean>
): Decimal {
  let click = D(1);

  if (upgrades['bandana_genin']) click = click.mul(1.5);
  if (upgrades['blade_storm']) click = click.mul(1.3);
  if (upgrades['rasengan_mastery']) click = click.mul(2.0);
  if (upgrades['truth_seeking_orbs']) click = click.mul(3.0);
  if (upgrades['otsutsuki_power']) click = click.mul(4.0);
  if (upgrades['creation_all_things']) click = click.mul(5.0);

  // Conversão de CPS para Clique
  let cpsRatio = 0;
  if (upgrades['kyuubi_cloak']) cpsRatio += 0.005;
  if (upgrades['reaper_seal']) cpsRatio += 0.02;
  if (upgrades['perfect_susanoo']) cpsRatio += 0.03;
  if (clanNodes['mangekyo_sharingan_lineage']) cpsRatio += 0.03;

  if (cpsRatio > 0) {
    click = click.add(totalCPS.mul(cpsRatio));
  }

  if (clanNodes['perfect_susanoo_lineage']) {
    click = click.mul(10.0);
  }

  return click;
}
