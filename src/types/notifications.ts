import { ItemRarity } from './rarity';

export interface ItemDropToast {
  id: string;
  name: string;
  rarity: ItemRarity;
  iconName?: string;
  subtext?: string;
  timestamp: number;
}
