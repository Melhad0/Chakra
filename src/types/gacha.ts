import { EquipmentItem, ItemRarity } from './inventory';

export type GachaDropType = 'EQUIPMENT' | 'FORGE_FRAGMENTS' | 'ANCESTRAL_CHAKRA' | 'CPS_BURST';

export interface GachaDropResult {
  id: string;
  name: string;
  type: GachaDropType;
  rarity: ItemRarity;
  iconName: string;
  description: string;
  equipment?: EquipmentItem;
  amount?: number;
  cpsSeconds?: number;
}
