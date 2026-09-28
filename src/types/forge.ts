import { EquipmentItem, EquipmentSlotType, ItemRarity } from './inventory';

export interface ForgeRecipe {
  id: string;
  name: string;
  description: string;
  lore: string;
  costFragments: number;
  rarity: ItemRarity;
  slotType: EquipmentSlotType;
  iconName: string;
  resultItem: EquipmentItem;
  requiredRankTier: number;
  badge?: string;
}

export interface RefinementCost {
  fragments: number;
  level: number;
}
