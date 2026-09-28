import { D } from '../engine/BigNumber';
import {
  EquipmentItem,
  FarmMaterialItem,
  BossEquipmentSlotKey,
  BOSS_EQUIPMENT_SLOTS,
  ElementType,
} from '../types/inventory';
import { ItemRarity } from '../types/rarity';
import { RAW_BOSS_LOOT_CONFIGS, RawBossGearItem } from './bossLootData';

export interface BossLootDefinition {
  bossId: number;
  bossName: string;
  equipment: EquipmentItem;
  equipmentSet: Record<BossEquipmentSlotKey, EquipmentItem>;
  material: Omit<FarmMaterialItem, 'stackCount'>;
}

export interface BossLootRollResult {
  equipmentDrop: EquipmentItem | null;
  equipmentDrops: EquipmentItem[];
  farmMaterial: FarmMaterialItem;
  dropProbability: number;
  rolledProbability: number;
}

/**
 * Curva Matemática de Chance de Drop Base / Fallback:
 * P_drop(n) = max(0.005, 0.25 * 0.96^(n - 1))
 */
export function calculateBossDropProbability(n: number): number {
  const prob = 0.25 * Math.pow(0.96, Math.max(0, n - 1));
  return Math.max(0.005, prob);
}

/**
 * Curva de Chance de Drop Individual por Slot:
 * P_slot(n) = max(0.002, 0.05 * 0.96^(n - 1))
 */
export function calculateBossSlotDropProbability(n: number): number {
  const prob = 0.05 * Math.pow(0.96, Math.max(0, n - 1));
  return Math.max(0.002, prob);
}

interface BossBasePower {
  cps: number;
  click: number;
  critChance: number;
  critMult: number;
}

const BOSS_BASE_POWERS: Record<number, BossBasePower> = {
  1: { cps: 1.05, click: 1.15, critChance: 0.05, critMult: 1.2 },
  2: { cps: 1.08, click: 1.2, critChance: 0.06, critMult: 1.22 },
  3: { cps: 1.12, click: 1.25, critChance: 0.07, critMult: 1.25 },
  4: { cps: 1.16, click: 1.3, critChance: 0.08, critMult: 1.28 },
  5: { cps: 1.2, click: 1.35, critChance: 0.09, critMult: 1.3 },
  6: { cps: 1.25, click: 1.45, critChance: 0.1, critMult: 1.35 },
  7: { cps: 1.3, click: 1.55, critChance: 0.11, critMult: 1.4 },
  8: { cps: 1.35, click: 1.65, critChance: 0.12, critMult: 1.45 },
  9: { cps: 1.45, click: 1.8, critChance: 0.13, critMult: 1.5 },
  10: { cps: 1.6, click: 2.0, critChance: 0.14, critMult: 1.55 },
  11: { cps: 1.75, click: 2.25, critChance: 0.15, critMult: 1.6 },
  12: { cps: 1.95, click: 2.55, critChance: 0.16, critMult: 1.65 },
  13: { cps: 2.2, click: 2.9, critChance: 0.18, critMult: 1.7 },
  14: { cps: 2.5, click: 3.3, critChance: 0.2, critMult: 1.75 },
  15: { cps: 2.85, click: 3.8, critChance: 0.22, critMult: 1.8 },
  16: { cps: 3.25, click: 4.35, critChance: 0.24, critMult: 1.9 },
  17: { cps: 3.7, click: 5.0, critChance: 0.26, critMult: 2.0 },
  18: { cps: 4.2, click: 5.75, critChance: 0.28, critMult: 2.1 },
  19: { cps: 4.8, click: 6.6, critChance: 0.3, critMult: 2.2 },
  20: { cps: 5.5, click: 7.6, critChance: 0.32, critMult: 2.35 },
  21: { cps: 6.5, click: 9.0, critChance: 0.34, critMult: 2.5 },
  22: { cps: 7.8, click: 11.0, critChance: 0.36, critMult: 2.65 },
  23: { cps: 9.5, click: 13.5, critChance: 0.38, critMult: 2.8 },
  24: { cps: 11.8, click: 17.0, critChance: 0.4, critMult: 3.0 },
  25: { cps: 15.0, click: 22.0, critChance: 0.42, critMult: 3.2 },
  26: { cps: 19.5, click: 29.0, critChance: 0.44, critMult: 3.4 },
  27: { cps: 25.5, click: 38.5, critChance: 0.46, critMult: 3.65 },
  28: { cps: 33.5, click: 51.0, critChance: 0.48, critMult: 3.9 },
  29: { cps: 44.0, click: 68.0, critChance: 0.5, critMult: 4.2 },
  30: { cps: 58.0, click: 90.0, critChance: 0.52, critMult: 4.5 },
  31: { cps: 78.0, click: 125.0, critChance: 0.55, critMult: 4.85 },
  32: { cps: 105.0, click: 170.0, critChance: 0.58, critMult: 5.2 },
  33: { cps: 145.0, click: 235.0, critChance: 0.6, critMult: 5.6 },
  34: { cps: 200.0, click: 330.0, critChance: 0.63, critMult: 6.0 },
  35: { cps: 280.0, click: 470.0, critChance: 0.66, critMult: 6.5 },
  36: { cps: 390.0, click: 670.0, critChance: 0.69, critMult: 7.0 },
  37: { cps: 540.0, click: 950.0, critChance: 0.72, critMult: 7.5 },
  38: { cps: 750.0, click: 1350.0, critChance: 0.75, critMult: 8.0 },
  39: { cps: 1000.0, click: 1850.0, critChance: 0.78, critMult: 8.5 },
  40: { cps: 1400.0, click: 2700.0, critChance: 0.8, critMult: 9.0 },
};

function getBossBasePower(bossId: number): BossBasePower {
  if (BOSS_BASE_POWERS[bossId]) return BOSS_BASE_POWERS[bossId];
  const factor = Math.pow(1.35, Math.max(0, bossId - 40));
  return {
    cps: 1400 * factor,
    click: 2700 * factor,
    critChance: Math.min(0.95, 0.8 + (bossId - 40) * 0.01),
    critMult: 9.0 + (bossId - 40) * 0.5,
  };
}

const SLOT_WEIGHTS: Record<
  BossEquipmentSlotKey,
  {
    cpsWeight: number;
    clickWeight: number;
    critWeight: number;
    critMultWeight: number;
    defaultIcon: string;
  }
> = {
  CHESTPLATE: { cpsWeight: 1.35, clickWeight: 0.4, critWeight: 0.3, critMultWeight: 0.4, defaultIcon: 'Shield' },
  HELMET: { cpsWeight: 1.15, clickWeight: 0.6, critWeight: 0.6, critMultWeight: 0.6, defaultIcon: 'Shield' },
  GLOVES: { cpsWeight: 0.7, clickWeight: 1.25, critWeight: 0.8, critMultWeight: 0.8, defaultIcon: 'Hand' },
  BOOTS: { cpsWeight: 0.8, clickWeight: 1.15, critWeight: 0.7, critMultWeight: 0.7, defaultIcon: 'Footprints' },
  CLOAK: { cpsWeight: 1.0, clickWeight: 1.0, critWeight: 0.7, critMultWeight: 0.75, defaultIcon: 'Feather' },
  BACKPACK: { cpsWeight: 1.1, clickWeight: 0.7, critWeight: 0.4, critMultWeight: 0.5, defaultIcon: 'Briefcase' },
  NECKLACE: { cpsWeight: 1.25, clickWeight: 0.85, critWeight: 0.75, critMultWeight: 0.85, defaultIcon: 'CircleDot' },
  MASK: { cpsWeight: 0.9, clickWeight: 1.05, critWeight: 1.1, critMultWeight: 1.2, defaultIcon: 'Eye' },
  WEAPON_RANGED: { cpsWeight: 0.95, clickWeight: 1.1, critWeight: 1.25, critMultWeight: 1.15, defaultIcon: 'Disc' },
  WEAPON_MELEE: { cpsWeight: 1.0, clickWeight: 1.35, critWeight: 1.0, critMultWeight: 1.1, defaultIcon: 'Swords' },
};

export function buildBossEquipmentItem(
  bossId: number,
  bossName: string,
  rarity: ItemRarity,
  slot: BossEquipmentSlotKey,
  raw: RawBossGearItem,
  primaryElement?: ElementType
): EquipmentItem {
  const base = getBossBasePower(bossId);
  const weights = SLOT_WEIGHTS[slot];

  const cpsVal = Math.max(1.02, 1 + (base.cps - 1) * weights.cpsWeight);
  const clickVal = Math.max(1.05, 1 + (base.click - 1) * weights.clickWeight);
  const critChanceVal = Math.min(0.95, base.critChance * weights.critWeight);
  const critMultVal = Math.max(1.1, 1 + (base.critMult - 1) * weights.critMultWeight);

  const elementalAffinityReq = raw.elementalAffinityReq || primaryElement;
  const id = `eq_boss_${bossId}_${slot.toLowerCase()}`;

  const item: EquipmentItem = {
    id,
    name: raw.name,
    rarity,
    type: slot,
    description: raw.description,
    iconName: raw.iconName || weights.defaultIcon,
    bonusCpsMult: D(Number(cpsVal.toFixed(2))),
    bonusClickMult: D(Number(clickVal.toFixed(2))),
    bonusCritChance: Number(critChanceVal.toFixed(3)),
    bonusCritMult: D(Number(critMultVal.toFixed(2))),
    originBossId: bossId,
    originBossName: bossName,
  };

  if (slot === 'WEAPON_MELEE' || slot === 'WEAPON_RANGED') {
    item.weaponCategory = raw.weaponCategory || (slot === 'WEAPON_RANGED' ? 'SHURIKEN' : 'SWORD');
  }

  if (elementalAffinityReq) {
    item.elementalAffinityReq = elementalAffinityReq;
    item.elementalBonusCpsMult = D(1.25);
    item.elementalBonusClickMult = D(1.35);
  }

  return item;
}

/**
 * Catálogo Oficial dos 40 Chefes:
 * CADA CHEFE POSSUI UM ARSENAL COMPLETO DE 10 EQUIPAMENTOS (EXCLUINDO RUNAS)
 */
export const BOSS_LOOT_CATALOG: Record<number, BossLootDefinition> = {};

for (const [idStr, config] of Object.entries(RAW_BOSS_LOOT_CONFIGS)) {
  const bossId = Number(idStr);
  const equipmentSet = {} as Record<BossEquipmentSlotKey, EquipmentItem>;

  for (const slot of BOSS_EQUIPMENT_SLOTS) {
    const rawItem = config.items[slot];
    equipmentSet[slot] = buildBossEquipmentItem(
      bossId,
      config.bossName,
      config.rarity,
      slot,
      rawItem,
      config.primaryElement
    );
  }

  // Peça de destaque primária (geralmente WEAPON_MELEE ou WEAPON_RANGED)
  const primaryEquipment = equipmentSet.WEAPON_MELEE || equipmentSet.WEAPON_RANGED || equipmentSet.HELMET;

  BOSS_LOOT_CATALOG[bossId] = {
    bossId,
    bossName: config.bossName,
    equipment: primaryEquipment,
    equipmentSet,
    material: {
      id: config.material.id,
      name: config.material.name,
      rarity: config.rarity,
      type: 'MATERIAL',
      description: config.material.description,
      iconName: config.material.iconName,
      baseGoldValue: D(config.material.baseGoldValue),
      originBossId: bossId,
      originBossName: config.bossName,
    },
  };
}

/**
 * Procedural fallback para chefes além do ID 40
 */
export function getBossLootDefinition(bossId: number): BossLootDefinition {
  if (BOSS_LOOT_CATALOG[bossId]) {
    return BOSS_LOOT_CATALOG[bossId];
  }

  const rarity: ItemRarity =
    bossId >= 90
      ? 'ADM'
      : bossId >= 75
      ? 'DIVINE'
      : bossId >= 60
      ? 'MYTHIC'
      : bossId >= 45
      ? 'LEGENDARY'
      : bossId >= 35
      ? 'EPIC'
      : bossId >= 25
      ? 'VERY_RARE'
      : 'RARE';

  const bossName = `Chefe Celestial #${bossId}`;
  const equipmentSet = {} as Record<BossEquipmentSlotKey, EquipmentItem>;

  for (const slot of BOSS_EQUIPMENT_SLOTS) {
    equipmentSet[slot] = buildBossEquipmentItem(bossId, bossName, rarity, slot, {
      name: `Artefato Astral de ${slot} #${bossId}`,
      description: `Equipamento cósmico supremo resgatado da queda do colossal chefe da fase #${bossId}.`,
      iconName: SLOT_WEIGHTS[slot].defaultIcon,
    });
  }

  return {
    bossId,
    bossName,
    equipment: equipmentSet.WEAPON_MELEE,
    equipmentSet,
    material: {
      id: `mat_procedural_boss_${bossId}`,
      name: `Essência Astral Suprema de Boss #${bossId}`,
      rarity,
      type: 'MATERIAL',
      description: `Material de altíssima cotação mercadológica recuperado da fase #${bossId}.`,
      iconName: 'Sparkles',
      baseGoldValue: D(5000000).mul(bossId),
      originBossId: bossId,
      originBossName: bossName,
    },
  };
}

/**
 * Executa a rolagem estocástica de saque com base no ID do chefe.
 * Realiza rolagem independente por slot para as 10 peças de equipamento.
 */
export function rollBossLoot(bossId: number): BossLootRollResult {
  const definition = getBossLootDefinition(bossId);
  const baseProb = calculateBossDropProbability(bossId);
  const slotProb = calculateBossSlotDropProbability(bossId);

  const equipmentDrops: EquipmentItem[] = [];

  // Rolagem independente por slot para cada uma das 10 peças
  for (const slot of BOSS_EQUIPMENT_SLOTS) {
    if (Math.random() < slotProb) {
      equipmentDrops.push({ ...definition.equipmentSet[slot] });
    }
  }

  // Fallback: Se nenhuma peça dropou na rolagem individual, testa a probabilidade base global
  // Se suceder, seleciona 1 peça aleatória entre as 10 para garantir emoção
  if (equipmentDrops.length === 0 && Math.random() < baseProb) {
    const randomSlot = BOSS_EQUIPMENT_SLOTS[Math.floor(Math.random() * BOSS_EQUIPMENT_SLOTS.length)];
    equipmentDrops.push({ ...definition.equipmentSet[randomSlot] });
  }

  // Farm materials dropam 100% com 1 a 5 unidades aleatórias
  const stackCount = Math.floor(Math.random() * 5) + 1;
  const farmMaterial: FarmMaterialItem = {
    ...definition.material,
    stackCount,
  };

  return {
    equipmentDrop: equipmentDrops.length > 0 ? equipmentDrops[0] : null,
    equipmentDrops,
    farmMaterial,
    dropProbability: baseProb,
    rolledProbability: Math.random(),
  };
}
