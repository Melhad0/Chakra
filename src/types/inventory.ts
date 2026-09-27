import Decimal from 'break_infinity.js';

export type EquipmentSlotType =
  | 'ARMOR' // Alias legado -> CHESTPLATE
  | 'WEAPON' // Alias legado -> WEAPON_MELEE
  | 'HELMET'
  | 'CHESTPLATE'
  | 'BOOTS'
  | 'GLOVES'
  | 'BACKPACK'
  | 'WEAPON_MELEE'
  | 'WEAPON_RANGED'
  | 'CLOAK'
  | 'MASK'
  | 'NECKLACE'
  | 'RUNE';

export type GearSlotKey =
  | 'HELMET'
  | 'CHESTPLATE'
  | 'BOOTS'
  | 'GLOVES'
  | 'BACKPACK'
  | 'WEAPON_MELEE'
  | 'WEAPON_RANGED'
  | 'CLOAK'
  | 'MASK'
  | 'NECKLACE'
  | 'RUNE';

export type EquippedGearSlots = Record<GearSlotKey, EquipmentItem | null>;

export const DEFAULT_EQUIPPED_GEAR: EquippedGearSlots = {
  HELMET: null,
  CHESTPLATE: null,
  BOOTS: null,
  GLOVES: null,
  BACKPACK: null,
  WEAPON_MELEE: null,
  WEAPON_RANGED: null,
  CLOAK: null,
  MASK: null,
  NECKLACE: null,
  RUNE: null,
};

export function normalizeEquipmentSlot(slot: EquipmentSlotType): GearSlotKey {
  if (slot === 'ARMOR') return 'CHESTPLATE';
  if (slot === 'WEAPON') return 'WEAPON_MELEE';
  return slot as GearSlotKey;
}

export type WeaponCategory = 'SWORD' | 'SPEAR' | 'HEAVY' | 'BLADE' | 'BOW' | 'SHURIKEN';
import { ItemRarity } from './rarity';
export type { ItemRarity };
export type ElementType = 'FIRE' | 'WIND' | 'LIGHTNING' | 'EARTH' | 'WATER';

export interface BaseItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  description: string;
  iconName: string; // Ícone da biblioteca lucide-react
  originBossId?: number; // Chefe de onde se originou
  originBossName?: string;
}

export interface EquipmentItem extends BaseItem {
  type: EquipmentSlotType;
  weaponCategory?: WeaponCategory;
  bonusCpsMult: Decimal;          // Multiplicador de CPS (ex: 1.15 = +15%)
  bonusClickMult: Decimal;        // Multiplicador de Clique (ex: 1.25 = +25%)
  bonusCritChance?: number;       // % de crítico extra (ex: 0.05 = +5%)
  bonusCritMult?: Decimal;        // Multiplicador de crítico
  elementalAffinityReq?: ElementType; // Bônus extra se o jogador possuir o elemento
  elementalBonusCpsMult?: Decimal;
  elementalBonusClickMult?: Decimal;
}

export interface FarmMaterialItem extends BaseItem {
  type: 'MATERIAL';
  stackCount: number;
  baseGoldValue: Decimal;         // Valor futuro de revenda na Loja
}

export type InventorySlotItem = EquipmentItem | FarmMaterialItem;

export interface PlayerInventoryState {
  equippedArmor: EquipmentItem | null; // Retrocompatibilidade (alias para equippedGear.CHESTPLATE)
  equippedWeapon: EquipmentItem | null; // Retrocompatibilidade (alias para equippedGear.WEAPON_MELEE)
  equippedGear: EquippedGearSlots; // Todos os 11 slots de equipamento oficial
  unlockedElements: ElementType[]; // De 1 até os 5 elementos
  inventoryBag: (InventorySlotItem | null)[]; // Grade fixa (32 slots)
  elementalSacrificePenaltyMult: number; // Penalidades cumulativas de CPS (-25% por sacrifício)
  isAvatarShinobi: boolean; // Despertou todos os 5 elementos (x3.0 CPS)
}
