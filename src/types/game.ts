import Decimal from 'break_infinity.js';
import { GeneratorItem } from './economy';

export type ElementalAffinity = 'Fire' | 'Wind' | 'Lightning' | 'Earth' | 'Water';

export interface PlayerStats {
  manualClicksCurrentSession: number;
  manualClicksSession?: number;
  manualClicksAllTime: number;
  highestCPSRecord: Decimal;
  totalPrestiges: number;
  playtimeSeconds: number;
  totalChakraEarned: Decimal;
}

export interface InnerGate {
  id: number;
  name: string;
  cost: number;
  unlocked: boolean;
}

export interface GameState {
  chakra: Decimal;
  chakraAncestral: Decimal;
  activeElement: ElementalAffinity;
  generators: Record<string, GeneratorItem>;
  upgrades: Record<string, boolean>;
  clanNodes: Record<string, boolean>;
  gatesUnlocked: number;
  gatesActiveTimer: number;
  gatesCooldownTimer: number;
  exhaustionTimer: number;
  stats: PlayerStats;
  lastSaveTimestamp: number;
}
