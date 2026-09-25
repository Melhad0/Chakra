import Decimal from 'break_infinity.js';

export type EquipmentSlotType = 'ARMOR' | 'WEAPON';
export type WeaponCategory = 'SWORD' | 'SPEAR' | 'HEAVY' | 'BLADE';
export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
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
  equippedArmor: EquipmentItem | null;
  equippedWeapon: EquipmentItem | null;
  unlockedElements: ElementType[]; // De 1 até os 5 elementos
  inventoryBag: (InventorySlotItem | null)[]; // Grade fixa (32 slots)
  elementalSacrificePenaltyMult: number; // Penalidades cumulativas de CPS (-25% por sacrifício)
  isAvatarShinobi: boolean; // Despertou todos os 5 elementos (x3.0 CPS)
}
