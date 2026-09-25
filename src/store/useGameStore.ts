import { create } from 'zustand';
import Decimal from 'break_infinity.js';
import { D, formatBigNumber } from '../engine/BigNumber';
import { ElementalAffinity, PlayerStats } from '../types/game';
import { GeneratorItem, ShopMode, ShopQty } from '../types/economy';
import { BossNavigationState } from '../types/combat';
import { ShinobiUser } from '../types/auth';
import { ShinobiRankId } from '../types/rankings';
import { ActiveGameView } from '../types/navigation';
import { INITIAL_GENERATORS, INITIAL_UPGRADES, GATE_DATA, CLAN_NODES } from '../engine/data';
import { TECHNIQUE_UPGRADES, UPGRADES_BY_ID } from '../constants/upgrades';
import { SHINOBI_RANKS_MAP, SHINOBI_RANKS, getCurrentRank } from '../constants/rankings';
import { ONLINE_PRESENCE_TIERS } from '../constants/rewards';
import {
  calculateTotalCPS,
  calculateClickPower,
  getBulkCost,
  getBulkSellRefund,
  getMaxBuyable,
  getGeneratorCostDiscount,
  PRESTIGE_THRESHOLD,
  calculatePendingAncestralChakra,
  calculatePresenceRewardChakra,
} from '../engine/formulas';
import {
  GAUNTLET_BOSSES,
  calculateBossHP,
  calculateEffectiveBossReward,
} from '../constants/bosses';
import { ActiveMissionState, MissionOutcome } from '../types/missions';
import { SHINOBI_MISSIONS_CATALOG } from '../constants/missionsCatalog';
import {
  EquipmentSlotType,
  EquipmentItem,
  FarmMaterialItem,
  ElementType,
  PlayerInventoryState,
  InventorySlotItem,
} from '../types/inventory';
import { rollBossLoot } from '../constants/equipmentCatalog';
import { audio } from '../engine/audio';

export interface FloatingNumber {
  id: number;
  text: string;
  isCrit: boolean;
  x: number;
  y: number;
}

export interface Shockwave {
  id: number;
  isCrit: boolean;
  x: number;
  y: number;
}

export interface GameStoreState {
  // Estado Econômico & Core
  chakra: Decimal;
  chakraAncestral: Decimal;
  activeElement: ElementalAffinity;
  generators: Record<string, GeneratorItem>;
  upgrades: Record<string, boolean>;
  clanNodes: Record<string, boolean>;

  // Oito Portões Internos & Colapso Muscular
  gatesUnlocked: number;
  gatesActiveTimer: number;
  gatesCooldownTimer: number;
  exhaustionTimer: number;
  clickExhaustionTimer: number;

  // Recompensas de Presença Online & Média Móvel
  stableRollingCPS: Decimal;
  onlinePresenceRewardsClaimed: Record<string, boolean>;
  onlinePresenceBuffTimer: number;
  isOnlineRewardModalOpen: boolean;
  openOnlineRewardModal: () => void;
  closeOnlineRewardModal: () => void;
  claimOnlinePresenceReward: (tierId: string) => { success: boolean; message: string };

  // Prestígio & Renascimento Shinobi
  performPrestige: () => { success: boolean; points: number };

  // Estatísticas & Persistência
  stats: PlayerStats;
  lastSaveTimestamp: number;

  // Configurações de Interface & Navegação Modular
  currentView: ActiveGameView;
  setView: (view: ActiveGameView) => void;
  shopMode: ShopMode;
  shopQty: ShopQty;
  activeTab: string;
  kineticMode: boolean;
  stageShaking: boolean;

  // Efeitos Cinéticos Reativos
  floatingNumbers: FloatingNumber[];
  shockwaves: Shockwave[];

  // Gauntlet Roguelike (1-N)
  gauntlet: BossNavigationState;
  startBossFight: () => boolean;
  onBossVictory: (bossId: number) => void;
  onBossDefeat: () => void;
  damageBoss: (amount: Decimal) => void;
  setGauntletBossIndex: (index: number) => void;
  setGauntletCombatMode: (mode: 'PUSH' | 'FARM') => void;
  recordGauntletVictory: (defeatedBossId: number) => void;
  handleGauntletDefeat: () => void;

  // Recompensas de Patentes & Rankings
  claimedRankRewards: Record<string, boolean>;
  claimRankReward: (rankId: ShinobiRankId) => boolean;
  buyAllAffordableUpgrades: () => number;

  // Quadro de Missões Shinobi (Ranks E a SS)
  activeMission: ActiveMissionState;
  missionPermanentCpsMult: number;
  missionBuffTimer: number;
  missionBuffMult: number;
  gachaTickets: number;
  forgeFragments: number;
  startMission: (missionId: string, choiceId: string) => boolean;
  resolveMissionChoice: () => MissionOutcome | null;
  clearMissionOutcome: () => void;

  // Módulo Completo de Equipamentos, Inventário & Afinidade Elemental
  inventory: PlayerInventoryState;
  equipItem: (slotIndex: number) => boolean;
  unequipItem: (slotType: EquipmentSlotType) => boolean;
  discardItem: (slotIndex: number) => void;
  sacrificeForElement: (targetElement: ElementType, weaponSlotIndex?: number) => { success: boolean; message: string };
  addLootToInventory: (loot: { equipmentDrop: EquipmentItem | null; farmMaterial: FarmMaterialItem }) => { addedEquipment: boolean; addedMaterial: boolean };

  // Ações
  clickChakra: (coords?: { x: number; y: number }) => void;
  buyGenerator: (id: string) => void;
  buyUpgrade: (id: string) => void;
  buyClanNode: (id: string) => void;
  buyGate: () => void;
  triggerGateRelease: () => void;
  setShopMode: (mode: ShopMode) => void;
  setShopQty: (qty: ShopQty) => void;
  setActiveTab: (tab: string) => void;
  toggleKineticMode: () => void;
  removeFloatingNumber: (id: number) => void;
  removeShockwave: (id: number) => void;
  tick: (dt: number) => void;
  saveGame: () => void;
  loadGame: () => void;

  // Autenticação & Sessão Shinobi (IAM)
  currentUser: ShinobiUser | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setCurrentUser: (user: ShinobiUser | null) => void;
  guestLogin: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'chakra_clicker_save_react_v2';
const SHINOBI_USER_KEY = 'chakra_shinobi_user';
let nextFxId = 1;

export const ALL_CANONICAL_ELEMENTS: ElementType[] = ['FIRE', 'WIND', 'LIGHTNING', 'EARTH', 'WATER'];

export function getRandomNatalElement(): ElementType {
  return ALL_CANONICAL_ELEMENTS[Math.floor(Math.random() * ALL_CANONICAL_ELEMENTS.length)];
}

export function createInitialInventory(initialElement?: ElementType): PlayerInventoryState {
  return {
    equippedArmor: null,
    equippedWeapon: null,
    unlockedElements: [initialElement || getRandomNatalElement()],
    inventoryBag: Array(32).fill(null),
    elementalSacrificePenaltyMult: 1.0,
    isAvatarShinobi: false,
  };
}

function serializeInventory(inv: PlayerInventoryState) {
  return {
    equippedArmor: inv.equippedArmor
      ? {
          ...inv.equippedArmor,
          bonusCpsMult: inv.equippedArmor.bonusCpsMult.toString(),
          bonusClickMult: inv.equippedArmor.bonusClickMult.toString(),
          bonusCritMult: inv.equippedArmor.bonusCritMult ? inv.equippedArmor.bonusCritMult.toString() : undefined,
          elementalBonusCpsMult: inv.equippedArmor.elementalBonusCpsMult ? inv.equippedArmor.elementalBonusCpsMult.toString() : undefined,
          elementalBonusClickMult: inv.equippedArmor.elementalBonusClickMult ? inv.equippedArmor.elementalBonusClickMult.toString() : undefined,
        }
      : null,
    equippedWeapon: inv.equippedWeapon
      ? {
          ...inv.equippedWeapon,
          bonusCpsMult: inv.equippedWeapon.bonusCpsMult.toString(),
          bonusClickMult: inv.equippedWeapon.bonusClickMult.toString(),
          bonusCritMult: inv.equippedWeapon.bonusCritMult ? inv.equippedWeapon.bonusCritMult.toString() : undefined,
          elementalBonusCpsMult: inv.equippedWeapon.elementalBonusCpsMult ? inv.equippedWeapon.elementalBonusCpsMult.toString() : undefined,
          elementalBonusClickMult: inv.equippedWeapon.elementalBonusClickMult ? inv.equippedWeapon.elementalBonusClickMult.toString() : undefined,
        }
      : null,
    unlockedElements: inv.unlockedElements,
    elementalSacrificePenaltyMult: inv.elementalSacrificePenaltyMult,
    isAvatarShinobi: inv.isAvatarShinobi,
    inventoryBag: inv.inventoryBag.map((item) => {
      if (!item) return null;
      if (item.type === 'MATERIAL') {
        return {
          ...item,
          baseGoldValue: item.baseGoldValue.toString(),
        };
      }
      return {
        ...item,
        bonusCpsMult: item.bonusCpsMult.toString(),
        bonusClickMult: item.bonusClickMult.toString(),
        bonusCritMult: item.bonusCritMult ? item.bonusCritMult.toString() : undefined,
        elementalBonusCpsMult: item.elementalBonusCpsMult ? item.elementalBonusCpsMult.toString() : undefined,
        elementalBonusClickMult: item.elementalBonusClickMult ? item.elementalBonusClickMult.toString() : undefined,
      };
    }),
  };
}

function deserializeInventory(raw: any): PlayerInventoryState {
  if (!raw) return createInitialInventory();

  const parseItem = (item: any): InventorySlotItem | null => {
    if (!item) return null;
    if (item.type === 'MATERIAL') {
      return {
        ...item,
        baseGoldValue: D(item.baseGoldValue || 0),
      };
    }
    return {
      ...item,
      bonusCpsMult: D(item.bonusCpsMult || 1),
      bonusClickMult: D(item.bonusClickMult || 1),
      bonusCritMult: item.bonusCritMult ? D(item.bonusCritMult) : undefined,
      elementalBonusCpsMult: item.elementalBonusCpsMult ? D(item.elementalBonusCpsMult) : undefined,
      elementalBonusClickMult: item.elementalBonusClickMult ? D(item.elementalBonusClickMult) : undefined,
    };
  };

  const rawBag = Array.isArray(raw.inventoryBag) ? raw.inventoryBag : [];
  const bag: (InventorySlotItem | null)[] = Array(32).fill(null);
  for (let i = 0; i < 32; i++) {
    if (rawBag[i]) {
      bag[i] = parseItem(rawBag[i]);
    }
  }

  const unlockedElements: ElementType[] =
    Array.isArray(raw.unlockedElements) && raw.unlockedElements.length > 0
      ? raw.unlockedElements
      : [getRandomNatalElement()];

  return {
    equippedArmor: raw.equippedArmor ? (parseItem(raw.equippedArmor) as EquipmentItem) : null,
    equippedWeapon: raw.equippedWeapon ? (parseItem(raw.equippedWeapon) as EquipmentItem) : null,
    unlockedElements,
    inventoryBag: bag,
    elementalSacrificePenaltyMult: typeof raw.elementalSacrificePenaltyMult === 'number' ? raw.elementalSacrificePenaltyMult : 1.0,
    isAvatarShinobi: !!raw.isAvatarShinobi,
  };
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentUser: (() => {
    try {
      const raw = localStorage.getItem(SHINOBI_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setCurrentUser: (user: ShinobiUser | null) => {
    if (user) {
      try {
        localStorage.setItem(SHINOBI_USER_KEY, JSON.stringify(user));
      } catch {}
    } else {
      localStorage.removeItem(SHINOBI_USER_KEY);
    }
    set({ currentUser: user });
  },
  guestLogin: () => {
    const guestUser: ShinobiUser = {
      ninjaId: Math.floor(1000000 + Math.random() * 9000000),
      fullName: 'Shinobi Convidado',
      username: 'convidado',
      email: 'convidado@chakra.local',
      birthDate: '2000-01-01',
      createdAt: new Date().toISOString(),
    };
    get().setCurrentUser(guestUser);
  },
  logout: () => {
    localStorage.removeItem(SHINOBI_USER_KEY);
    set({ currentUser: null });
  },

  chakra: D(0),
  chakraAncestral: D(0),
  activeElement: 'Fire',
  generators: { ...INITIAL_GENERATORS },
  upgrades: {
    ...Object.keys(INITIAL_UPGRADES).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
    ...Object.keys(UPGRADES_BY_ID).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
  },
  clanNodes: {},
  claimedRankRewards: {},

  // Módulo de Inventário & Afinidade de Chakra
  inventory: createInitialInventory(),

  equipItem: (slotIndex: number) => {
    const s = get();
    if (slotIndex < 0 || slotIndex >= 32) return false;
    const item = s.inventory.inventoryBag[slotIndex];
    if (!item || item.type === 'MATERIAL') return false;

    const newBag = [...s.inventory.inventoryBag];

    if (item.type === 'ARMOR') {
      const prevEquipped = s.inventory.equippedArmor;
      newBag[slotIndex] = prevEquipped;
      set((state) => ({
        inventory: {
          ...state.inventory,
          equippedArmor: item,
          inventoryBag: newBag,
        },
      }));
      audio.playLevelUp();
      return true;
    } else if (item.type === 'WEAPON') {
      const prevEquipped = s.inventory.equippedWeapon;
      newBag[slotIndex] = prevEquipped;
      set((state) => ({
        inventory: {
          ...state.inventory,
          equippedWeapon: item,
          inventoryBag: newBag,
        },
      }));
      audio.playLevelUp();
      return true;
    }
    return false;
  },

  unequipItem: (slotType: EquipmentSlotType) => {
    const s = get();
    const itemToUnequip = slotType === 'ARMOR' ? s.inventory.equippedArmor : s.inventory.equippedWeapon;
    if (!itemToUnequip) return false;

    const newBag = [...s.inventory.inventoryBag];
    const freeSlotIdx = newBag.findIndex((slot) => slot === null);
    if (freeSlotIdx === -1) {
      return false; // Inventário cheio
    }

    newBag[freeSlotIdx] = itemToUnequip;
    set((state) => ({
      inventory: {
        ...state.inventory,
        equippedArmor: slotType === 'ARMOR' ? null : state.inventory.equippedArmor,
        equippedWeapon: slotType === 'WEAPON' ? null : state.inventory.equippedWeapon,
        inventoryBag: newBag,
      },
    }));
    audio.playClick();
    return true;
  },

  discardItem: (slotIndex: number) => {
    if (slotIndex < 0 || slotIndex >= 32) return;
    set((state) => {
      const newBag = [...state.inventory.inventoryBag];
      newBag[slotIndex] = null;
      return {
        inventory: {
          ...state.inventory,
          inventoryBag: newBag,
        },
      };
    });
    audio.playClick();
  },

  sacrificeForElement: (targetElement: ElementType, weaponSlotIndex?: number) => {
    const s = get();
    if (s.inventory.unlockedElements.includes(targetElement)) {
      return { success: false, message: 'Este elemento já foi despertado em seu canal de chakra.' };
    }

    const currentCount = s.inventory.unlockedElements.length;
    if (currentCount >= 5) {
      return { success: false, message: 'Todos os cinco elementos já foram dominados.' };
    }

    // 2º Elemento: 50 CA + Tributo Vital (-25% CPS permanente)
    if (currentCount === 1) {
      if (s.chakraAncestral.lt(50)) {
        return { success: false, message: 'Chakra Ancestral insuficiente. Requer 50 CA.' };
      }
      set((state) => ({
        chakraAncestral: state.chakraAncestral.sub(50),
        inventory: {
          ...state.inventory,
          unlockedElements: [...state.inventory.unlockedElements, targetElement],
          elementalSacrificePenaltyMult: state.inventory.elementalSacrificePenaltyMult * 0.75,
        },
      }));
      audio.playLevelUp();
      return {
        success: true,
        message: '2º Elemento despertado com sucesso! Sacrifício de linhagem de -25% de CPS aplicado.',
      };
    }

    // 3º Elemento: 500 CA + Tributo Vital (-25% CPS permanente)
    if (currentCount === 2) {
      if (s.chakraAncestral.lt(500)) {
        return { success: false, message: 'Chakra Ancestral insuficiente. Requer 500 CA.' };
      }
      set((state) => ({
        chakraAncestral: state.chakraAncestral.sub(500),
        inventory: {
          ...state.inventory,
          unlockedElements: [...state.inventory.unlockedElements, targetElement],
          elementalSacrificePenaltyMult: state.inventory.elementalSacrificePenaltyMult * 0.75,
        },
      }));
      audio.playLevelUp();
      return {
        success: true,
        message: '3º Elemento despertado com sucesso! Sacrifício de linhagem de -25% de CPS aplicado.',
      };
    }

    // 4º Elemento: 5.000 CA + Sacrifício de Arma ÉPICA ou superior
    if (currentCount === 3) {
      if (s.chakraAncestral.lt(5000)) {
        return { success: false, message: 'Chakra Ancestral insuficiente. Requer 5.000 CA.' };
      }
      if (weaponSlotIndex === undefined || weaponSlotIndex < 0 || weaponSlotIndex >= 32) {
        return { success: false, message: 'Selecione uma arma de raridade Épica ou superior da mochila para sacrificar.' };
      }
      const weaponItem = s.inventory.inventoryBag[weaponSlotIndex];
      if (!weaponItem || weaponItem.type !== 'WEAPON' || !['EPIC', 'LEGENDARY', 'MYTHIC'].includes(weaponItem.rarity)) {
        return { success: false, message: 'O item selecionado não é uma arma Épica, Lendária ou Mítica válida.' };
      }

      set((state) => {
        const newBag = [...state.inventory.inventoryBag];
        newBag[weaponSlotIndex] = null; // Destruição irrevogável
        return {
          chakraAncestral: state.chakraAncestral.sub(5000),
          inventory: {
            ...state.inventory,
            unlockedElements: [...state.inventory.unlockedElements, targetElement],
            inventoryBag: newBag,
          },
        };
      });
      audio.playLevelUp();
      return {
        success: true,
        message: '4º Elemento despertado! A arma rara foi completamente incinerada no ritual de sacrifício.',
      };
    }

    // 5º Elemento: 50.000 CA + Arma LENDÁRIA/MÍTICA + Dreno de 40% do Chakra Atual (Avatar Shinobi)
    if (currentCount === 4) {
      if (s.chakraAncestral.lt(50000)) {
        return { success: false, message: 'Chakra Ancestral insuficiente. Requer 50.000 CA.' };
      }
      if (weaponSlotIndex === undefined || weaponSlotIndex < 0 || weaponSlotIndex >= 32) {
        return { success: false, message: 'Selecione uma arma Lendária ou Mítica para o sacrifício supremo.' };
      }
      const weaponItem = s.inventory.inventoryBag[weaponSlotIndex];
      if (!weaponItem || weaponItem.type !== 'WEAPON' || !['LEGENDARY', 'MYTHIC'].includes(weaponItem.rarity)) {
        return { success: false, message: 'O item selecionado não é uma arma Lendária ou Mítica válida.' };
      }

      set((state) => {
        const newBag = [...state.inventory.inventoryBag];
        newBag[weaponSlotIndex] = null; // Destruição suprema
        return {
          chakra: state.chakra.mul(0.60), // Dreno de 40%
          chakraAncestral: state.chakraAncestral.sub(50000),
          inventory: {
            ...state.inventory,
            unlockedElements: [...state.inventory.unlockedElements, targetElement],
            inventoryBag: newBag,
            isAvatarShinobi: true, // Multiplicador x3.0 no CPS global!
          },
        };
      });
      audio.playLevelUp();
      return {
        success: true,
        message: 'Domínio dos Cinco Elementos Alcançado! Título de Mestre Elemental e bônus global de x3.0 CPS ativados!',
      };
    }

    return { success: false, message: 'Condições do ritual não atendidas.' };
  },

  addLootToInventory: (loot: { equipmentDrop: EquipmentItem | null; farmMaterial: FarmMaterialItem }) => {
    let addedEquipment = false;
    let addedMaterial = false;

    set((state) => {
      const newBag = [...state.inventory.inventoryBag];

      // 1. Processa Material de Farm (100% de drop, empilhável)
      const existingIdx = newBag.findIndex(
        (slot) => slot && slot.type === 'MATERIAL' && slot.id === loot.farmMaterial.id
      );

      if (existingIdx !== -1) {
        const existing = newBag[existingIdx] as FarmMaterialItem;
        newBag[existingIdx] = {
          ...existing,
          stackCount: existing.stackCount + loot.farmMaterial.stackCount,
        };
        addedMaterial = true;
      } else {
        const freeSlotIdx = newBag.findIndex((slot) => slot === null);
        if (freeSlotIdx !== -1) {
          newBag[freeSlotIdx] = { ...loot.farmMaterial };
          addedMaterial = true;
        }
      }

      // 2. Processa Peça de Equipamento (se dropou com sucesso)
      if (loot.equipmentDrop) {
        const freeSlotIdx = newBag.findIndex((slot) => slot === null);
        if (freeSlotIdx !== -1) {
          newBag[freeSlotIdx] = { ...loot.equipmentDrop };
          addedEquipment = true;
        }
      }

      return {
        inventory: {
          ...state.inventory,
          inventoryBag: newBag,
        },
      };
    });

    return { addedEquipment, addedMaterial };
  },

  gatesUnlocked: 0,
  gatesActiveTimer: 0,
  gatesCooldownTimer: 0,
  exhaustionTimer: 0,
  clickExhaustionTimer: 0,

  // Recompensas de Presença Online & Média Móvel
  stableRollingCPS: D(0),
  onlinePresenceRewardsClaimed: {},
  onlinePresenceBuffTimer: 0,
  isOnlineRewardModalOpen: false,
  openOnlineRewardModal: () => set({ isOnlineRewardModalOpen: true }),
  closeOnlineRewardModal: () => set({ isOnlineRewardModalOpen: false }),

  stats: {
    manualClicksCurrentSession: 0,
    manualClicksSession: 0,
    manualClicksAllTime: 0,
    highestCPSRecord: D(0),
    totalPrestiges: 0,
    playtimeSeconds: 0,
    totalChakraEarned: D(0),
  },
  lastSaveTimestamp: Date.now(),

  currentView: 'MAIN_COCKPIT',
  setView: (view: ActiveGameView) => set({ currentView: view }),
  shopMode: 'buy',
  shopQty: 1,
  activeTab: 'clans',
  kineticMode: true,
  stageShaking: false,

  floatingNumbers: [],
  shockwaves: [],

  // Gauntlet Roguelike (1-N)
  gauntlet: {
    currentActiveBossId: 1,
    highestBossDefeated: 0,
    maxUnlockedBoss: 0,
    cooldownExpiresAt: null,
    isFighting: false,
    bossCurrentHp: calculateBossHP(1),
    bossTimeRemaining: 30,
  },

  startBossFight: () => {
    const s = get();
    const now = Date.now();
    if (s.gauntlet.cooldownExpiresAt && now < s.gauntlet.cooldownExpiresAt) {
      return false;
    }
    const currentBoss =
      GAUNTLET_BOSSES.find((b) => b.id === s.gauntlet.currentActiveBossId) || GAUNTLET_BOSSES[0];
    set((state) => ({
      gauntlet: {
        ...state.gauntlet,
        isFighting: true,
        bossCurrentHp: currentBoss.hp,
        bossTimeRemaining: currentBoss.timer || 30,
      },
    }));
    return true;
  },

  onBossVictory: (bossId: number) => {
    const s = get();
    const currentBoss = GAUNTLET_BOSSES.find((b) => b.id === bossId) || GAUNTLET_BOSSES[0];
    const rewardChakra = calculateEffectiveBossReward(bossId, s.stableRollingCPS);
    const rewardAncestral = currentBoss.bountyAncestral || 1;

    audio.playLevelUp();

    // Rolagem estocástica de saque conforme a curva P_drop(n)
    const lootRoll = rollBossLoot(bossId);
    s.addLootToInventory({
      equipmentDrop: lootRoll.equipmentDrop,
      farmMaterial: lootRoll.farmMaterial,
    });

    // Passiva de Suiton (Água): -20% de tempo de descanso pós-vitória (45s -> 36s)
    const hasWater = s.inventory.unlockedElements.includes('WATER');
    const victoryCooldownMs = hasWater ? 36000 : 45000;

    set((state) => {
      const nextHighest = Math.max(state.gauntlet.highestBossDefeated, bossId);
      const nextActiveId = Math.min(bossId + 1, GAUNTLET_BOSSES.length);
      const nextBoss =
        GAUNTLET_BOSSES.find((b) => b.id === nextActiveId) || GAUNTLET_BOSSES[0];

      return {
        chakra: state.chakra.add(rewardChakra),
        chakraAncestral: state.chakraAncestral.add(rewardAncestral),
        gauntlet: {
          ...state.gauntlet,
          highestBossDefeated: nextHighest,
          maxUnlockedBoss: nextHighest,
          currentActiveBossId: nextActiveId,
          isFighting: false,
          bossCurrentHp: nextBoss.hp,
          bossTimeRemaining: nextBoss.timer || 30,
          cooldownExpiresAt: Date.now() + victoryCooldownMs,
        },
      };
    });
  },

  onBossDefeat: () => {
    audio.playCrit();
    const s = get();
    // Passiva de Doton (Terra): -15% no tempo de penalidade pós-colapso (90s -> 76.5s)
    const hasEarth = s.inventory.unlockedElements.includes('EARTH');
    const defeatCooldownMs = hasEarth ? 76500 : 90000;

    set((state) => {
      const currentBoss =
        GAUNTLET_BOSSES.find((b) => b.id === state.gauntlet.currentActiveBossId) ||
        GAUNTLET_BOSSES[0];

      return {
        gauntlet: {
          ...state.gauntlet,
          isFighting: false,
          bossCurrentHp: currentBoss.hp,
          bossTimeRemaining: currentBoss.timer || 30,
          cooldownExpiresAt: Date.now() + defeatCooldownMs,
        },
      };
    });
  },

  damageBoss: (amount: Decimal) => {
    set((state) => {
      if (!state.gauntlet.isFighting) return state;
      const nextHp = Decimal.max(0, state.gauntlet.bossCurrentHp.sub(amount));
      return {
        gauntlet: {
          ...state.gauntlet,
          bossCurrentHp: nextHp,
        },
      };
    });
  },

  setGauntletBossIndex: (_index: number) => {
    // Progressão linear estrita: desabilitado
  },

  setGauntletCombatMode: (_mode: 'PUSH' | 'FARM') => {
    // Extinto: progressão linear estrita sem farm
  },

  recordGauntletVictory: (defeatedBossId: number) => {
    get().onBossVictory(defeatedBossId);
  },

  handleGauntletDefeat: () => {
    get().onBossDefeat();
  },

  // Quadro de Missões Shinobi
  activeMission: {
    activeMissionId: null,
    selectedChoiceId: null,
    startedAt: null,
    resolvesAt: null,
    lastOutcome: null,
    cooldownExpiresAt: null,
  },
  missionPermanentCpsMult: 1,
  missionBuffTimer: 0,
  missionBuffMult: 1,
  gachaTickets: 0,
  forgeFragments: 0,

  startMission: (missionId: string, choiceId: string) => {
    const s = get();
    const now = Date.now();
    if (s.activeMission.activeMissionId && s.activeMission.resolvesAt && now < s.activeMission.resolvesAt) {
      return false;
    }
    if (s.activeMission.cooldownExpiresAt && now < s.activeMission.cooldownExpiresAt) {
      return false;
    }
    const mission = SHINOBI_MISSIONS_CATALOG.find((m) => m.id === missionId);
    if (!mission) return false;

    const currentRank = getCurrentRank(
      s.stats.manualClicksAllTime,
      s.stats.highestCPSRecord,
      s.stats.totalPrestiges
    );
    const rankIdx = SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);
    if (rankIdx < mission.requiredRankTier) return false;

    set({
      activeMission: {
        ...s.activeMission,
        activeMissionId: missionId,
        selectedChoiceId: choiceId,
        startedAt: now,
        resolvesAt: now + mission.durationSeconds * 1000,
        lastOutcome: null,
      },
    });
    return true;
  },

  resolveMissionChoice: () => {
    const s = get();
    if (!s.activeMission.activeMissionId || !s.activeMission.selectedChoiceId) return null;

    const mission = SHINOBI_MISSIONS_CATALOG.find((m) => m.id === s.activeMission.activeMissionId);
    if (!mission) return null;

    const choice = mission.choices.find((c) => c.id === s.activeMission.selectedChoiceId);
    if (!choice) return null;

    const roll = Math.random();
    const isSuccess = roll <= choice.successProbability;
    const outcome = isSuccess ? choice.successOutcome : choice.failureOutcome;

    let extraChakra = D(0);
    let extraAncestral = 0;
    let extraTickets = 0;
    let extraFragments = 0;
    let newPermMult = s.missionPermanentCpsMult;
    let newBuffTimer = s.missionBuffTimer;
    let newBuffMult = s.missionBuffMult;
    let newExhaust = s.exhaustionTimer;
    let newClickExhaust = s.clickExhaustionTimer;
    let muralCd: number | null = s.activeMission.cooldownExpiresAt;
    let chakraMultiplier = 1;

    if (isSuccess) {
      audio.playMissionSuccess();
      if (outcome.rewardChakraSeconds) {
        const cpsBase = s.stableRollingCPS && s.stableRollingCPS.gt(0) ? s.stableRollingCPS : D(10);
        extraChakra = extraChakra.add(cpsBase.mul(outcome.rewardChakraSeconds));
      }
      if (outcome.rewardChakraFixed) {
        extraChakra = extraChakra.add(outcome.rewardChakraFixed);
      }
      if (outcome.rewardAncestral) {
        extraAncestral += outcome.rewardAncestral;
      }
      if (outcome.rewardGachaTickets) {
        extraTickets += outcome.rewardGachaTickets;
      }
      if (outcome.rewardForgeFragments) {
        extraFragments += outcome.rewardForgeFragments;
      }
      if (outcome.permanentCpsMultiplier) {
        newPermMult *= outcome.permanentCpsMultiplier;
      }
      if (outcome.buffDurationSeconds) {
        newBuffTimer = Math.max(newBuffTimer, outcome.buffDurationSeconds);
        newBuffMult = outcome.buffCpsMultiplier || 2.0;
      }
    } else {
      audio.playMissionFailure();
      if (outcome.penaltyExhaustionSeconds) {
        newExhaust = Math.max(newExhaust, outcome.penaltyExhaustionSeconds);
      }
      if (outcome.penaltyClickExhaustionSeconds) {
        newClickExhaust = Math.max(newClickExhaust, outcome.penaltyClickExhaustionSeconds);
      }
      if (outcome.penaltyChakraLossPercent) {
        chakraMultiplier = Math.max(0, 1 - outcome.penaltyChakraLossPercent / 100);
      }
      if (outcome.penaltyCooldownSeconds) {
        muralCd = Date.now() + outcome.penaltyCooldownSeconds * 1000;
      }
    }

    set((state) => ({
      chakra: state.chakra.mul(chakraMultiplier).add(extraChakra),
      chakraAncestral: state.chakraAncestral.add(extraAncestral),
      gachaTickets: state.gachaTickets + extraTickets,
      forgeFragments: state.forgeFragments + extraFragments,
      missionPermanentCpsMult: newPermMult,
      missionBuffTimer: newBuffTimer,
      missionBuffMult: newBuffMult,
      exhaustionTimer: newExhaust,
      clickExhaustionTimer: newClickExhaust,
      stats: {
        ...state.stats,
        totalChakraEarned: state.stats.totalChakraEarned.add(extraChakra),
      },
      activeMission: {
        ...state.activeMission,
        activeMissionId: null,
        selectedChoiceId: null,
        startedAt: null,
        resolvesAt: null,
        lastOutcome: outcome,
        cooldownExpiresAt: muralCd,
      },
    }));

    return outcome;
  },

  clearMissionOutcome: () => {
    set((state) => ({
      activeMission: {
        ...state.activeMission,
        lastOutcome: null,
      },
    }));
  },

  claimOnlinePresenceReward: (tierId: string) => {
    const s = get();
    if (s.onlinePresenceRewardsClaimed[tierId]) {
      return { success: false, message: 'Recompensa já resgatada!' };
    }
    const tier = ONLINE_PRESENCE_TIERS.find((t) => t.id === tierId);
    if (!tier) return { success: false, message: 'Recompensa não encontrada.' };

    if (s.stats.playtimeSeconds < tier.timeSeconds) {
      return { success: false, message: `Requer ${tier.title} de tempo online ativo.` };
    }

    if (tier.minRank) {
      const currentRank = getCurrentRank(
        s.stats.manualClicksAllTime,
        s.stats.highestCPSRecord,
        s.stats.totalPrestiges
      );
      const minRankDef = SHINOBI_RANKS.find((r) => r.id === tier.minRank);
      const currentIndex = SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);
      const requiredIndex = SHINOBI_RANKS.findIndex((r) => r.id === tier.minRank);
      if (minRankDef && requiredIndex !== -1 && currentIndex < requiredIndex) {
        return { success: false, message: `Requer graduação ninja mínima: ${minRankDef.title}!` };
      }
    }

    const rewardChakra = calculatePresenceRewardChakra(
      tier.cpsSeconds,
      s.stableRollingCPS,
      s.generators
    );

    audio.playLevelUp();

    set((state) => {
      let nextAncestral = state.chakraAncestral;
      if (tier.ancestralChakra) {
        nextAncestral = nextAncestral.add(tier.ancestralChakra);
      }

      let nextBuffTimer = state.onlinePresenceBuffTimer;
      if (tier.buffDurationSeconds) {
        nextBuffTimer = Math.max(nextBuffTimer, tier.buffDurationSeconds);
      }

      return {
        chakra: state.chakra.add(rewardChakra),
        chakraAncestral: nextAncestral,
        onlinePresenceBuffTimer: nextBuffTimer,
        onlinePresenceRewardsClaimed: {
          ...state.onlinePresenceRewardsClaimed,
          [tierId]: true,
        },
      };
    });

    return { success: true, message: `Resgate concluído! +${formatBigNumber(rewardChakra)} Chakra recebido.` };
  },

  performPrestige: () => {
    const s = get();
    const pendingPoints = calculatePendingAncestralChakra(s.stats.totalChakraEarned);
    if (pendingPoints <= 0 || s.stats.totalChakraEarned.lt(PRESTIGE_THRESHOLD)) {
      return { success: false, points: 0 };
    }

    audio.playLevelUp();
    set((state) => ({
      chakra: D(0),
      generators: { ...INITIAL_GENERATORS },
      upgrades: {
        ...Object.keys(INITIAL_UPGRADES).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
        ...Object.keys(UPGRADES_BY_ID).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
      },
      gatesUnlocked: 0,
      gatesActiveTimer: 0,
      gatesCooldownTimer: 0,
      exhaustionTimer: 0,
      clickExhaustionTimer: 0,
      chakraAncestral: state.chakraAncestral.add(pendingPoints),
      gauntlet: {
        ...state.gauntlet,
        currentActiveBossId: 1,
        isFighting: false,
        cooldownExpiresAt: null,
        bossCurrentHp: calculateBossHP(1),
        bossTimeRemaining: 30,
      },
      stats: {
        ...state.stats,
        totalPrestiges: state.stats.totalPrestiges + 1,
        manualClicksCurrentSession: 0,
        manualClicksSession: 0,
        totalChakraEarned: D(0),
      },
    }));

    return { success: true, points: pendingPoints };
  },

  claimRankReward: (rankId: ShinobiRankId) => {
    const s = get();
    if (s.claimedRankRewards[rankId]) return false;

    const targetRank = SHINOBI_RANKS_MAP[rankId];
    if (!targetRank) return false;

    const qualifies =
      s.stats.manualClicksAllTime >= targetRank.minClicksAllTime &&
      s.stats.highestCPSRecord.gte(targetRank.minCPS) &&
      s.stats.totalPrestiges >= targetRank.minPrestiges;

    if (!qualifies) return false;

    audio.playLevelUp();
    set((state) => {
      let newAncestral = state.chakraAncestral;
      if (targetRank.reward.effectType === 'ancestral_chakra') {
        newAncestral = newAncestral.add(targetRank.reward.value);
      }
      return {
        chakraAncestral: newAncestral,
        claimedRankRewards: {
          ...state.claimedRankRewards,
          [rankId]: true,
        },
      };
    });
    return true;
  },

  buyAllAffordableUpgrades: () => {
    const s = get();
    const unbought = TECHNIQUE_UPGRADES
      .filter((u) => !s.upgrades[u.id])
      .sort((a, b) => (a.cost.lt(b.cost) ? -1 : 1));

    let currentChakra = s.chakra;
    const newPurchased: Record<string, boolean> = {};
    let count = 0;

    for (const upg of unbought) {
      if (currentChakra.gte(upg.cost)) {
        currentChakra = currentChakra.sub(upg.cost);
        newPurchased[upg.id] = true;
        count++;
      }
    }

    if (count > 0) {
      audio.playLevelUp();
      set((state) => ({
        chakra: currentChakra,
        upgrades: {
          ...state.upgrades,
          ...newPurchased,
        },
      }));
    }
    return count;
  },

  clickChakra: (coords) => {
    const s = get();

    // Bloqueio Total por Exaustão Muscular Severa (Colapso dos 8 Portões)
    if (s.clickExhaustionTimer > 0) {
      return;
    }

    const gatesActive = s.gatesActiveTimer > 0;
    const isExhausted = s.exhaustionTimer > 0;
    const hasOnlineBuff = s.onlinePresenceBuffTimer > 0;

    const missionMult = s.missionPermanentCpsMult * (s.missionBuffTimer > 0 ? s.missionBuffMult : 1);

    const currentCPS = calculateTotalCPS(
      s.generators,
      s.upgrades,
      s.clanNodes,
      s.gatesUnlocked,
      gatesActive,
      isExhausted,
      s.claimedRankRewards,
      hasOnlineBuff,
      missionMult,
      s.inventory.equippedArmor,
      s.inventory.equippedWeapon,
      s.inventory.unlockedElements,
      s.inventory.elementalSacrificePenaltyMult,
      s.inventory.isAvatarShinobi
    );

    const baseClickPower = calculateClickPower(
      currentCPS,
      s.upgrades,
      s.clanNodes,
      s.generators,
      s.claimedRankRewards,
      s.inventory.equippedWeapon,
      s.inventory.equippedArmor,
      s.inventory.unlockedElements
    );

    // Chance de Crítico
    let critChance = 0.05;
    let critMult = 2.0;
    if (s.clanNodes['sharingan_awakening']) critChance += 0.10;
    if (s.claimedRankRewards['tokubetsu_jonin']) critChance += 0.05;
    if (s.upgrades['lion_combo']) critChance += 0.05;
    if (s.clanNodes['mangekyo_sharingan_lineage']) critMult = 3.0;
    if (s.upgrades['night_guy']) critMult *= 2.5;

    // Bônus de Crítico por Equipamentos
    if (s.inventory.equippedWeapon?.bonusCritChance) {
      critChance += s.inventory.equippedWeapon.bonusCritChance;
    }
    if (s.inventory.equippedArmor?.bonusCritChance) {
      critChance += s.inventory.equippedArmor.bonusCritChance;
    }
    if (s.inventory.equippedWeapon?.bonusCritMult) {
      critMult *= s.inventory.equippedWeapon.bonusCritMult.toNumber();
    }
    if (s.inventory.equippedArmor?.bonusCritMult) {
      critMult *= s.inventory.equippedArmor.bonusCritMult.toNumber();
    }

    // Passiva Elemental: Fogo (Katon) - +15% de Dano Crítico
    if (s.inventory.unlockedElements.includes('FIRE')) {
      critMult *= 1.15;
    }

    const isCrit = Math.random() < critChance;
    const finalAmount = isCrit ? baseClickPower.mul(critMult) : baseClickPower;

    if (isCrit) {
      audio.playCrit();
    } else {
      audio.playClick();
    }

    const fxId = nextFxId++;
    const x = coords?.x ?? 0;
    const y = coords?.y ?? 0;

    const newFloatingNumbers = s.kineticMode
      ? [...s.floatingNumbers.slice(-15), { id: fxId, text: `+${formatBigNumber(finalAmount)}`, isCrit, x, y }]
      : s.floatingNumbers;

    const newShockwaves = s.kineticMode
      ? [...s.shockwaves.slice(-6), { id: fxId, isCrit, x, y }]
      : s.shockwaves;

    const nextSessionClicks = s.stats.manualClicksCurrentSession + 1;
    set((state) => ({
      chakra: state.chakra.add(finalAmount),
      stats: {
        ...state.stats,
        manualClicksCurrentSession: nextSessionClicks,
        manualClicksSession: nextSessionClicks,
        manualClicksAllTime: state.stats.manualClicksAllTime + 1,
        totalChakraEarned: state.stats.totalChakraEarned.add(finalAmount),
      },
      stageShaking: isCrit && state.kineticMode,
      floatingNumbers: newFloatingNumbers,
      shockwaves: newShockwaves,
    }));

    if (isCrit && s.kineticMode) {
      setTimeout(() => {
        set({ stageShaking: false });
      }, 250);
    }
  },

  buyGenerator: (id: string) => {
    const s = get();
    const gen = s.generators[id];
    if (!gen) return;

    const discount = getGeneratorCostDiscount(id, gen.level, s.upgrades, s.claimedRankRewards);

    if (s.shopMode === 'buy') {
      let qtyToBuy: number = typeof s.shopQty === 'number' ? s.shopQty : 1;
      if (s.shopQty === 'max') {
        qtyToBuy = Math.max(1, getMaxBuyable(gen.baseCost, gen.level, s.chakra, discount));
      }

      const cost = getBulkCost(gen.baseCost, gen.level, qtyToBuy, discount);
      if (s.chakra.gte(cost) && qtyToBuy > 0) {
        audio.playBuy();
        set((state) => ({
          chakra: state.chakra.sub(cost),
          generators: {
            ...state.generators,
            [id]: {
              ...gen,
              level: gen.level + qtyToBuy,
              unlocked: true,
            },
          },
        }));
      }
    } else {
      // Venda
      const numericQty = typeof s.shopQty === 'number' ? s.shopQty : 1;
      const qtyToSell: number = s.shopQty === 'max' ? gen.level : Math.min(numericQty, gen.level);
      if (qtyToSell > 0) {
        const refund = getBulkSellRefund(gen.baseCost, gen.level, qtyToSell, discount);
        audio.playBuy();
        set((state) => ({
          chakra: state.chakra.add(refund),
          generators: {
            ...state.generators,
            [id]: {
              ...gen,
              level: gen.level - qtyToSell,
            },
          },
        }));
      }
    }
  },

  buyUpgrade: (id: string) => {
    const s = get();
    const upg = UPGRADES_BY_ID[id] || INITIAL_UPGRADES[id];
    if (!upg || s.upgrades[id]) return;

    if (s.chakra.gte(upg.cost)) {
      audio.playLevelUp();
      set((state) => ({
        chakra: state.chakra.sub(upg.cost),
        upgrades: {
          ...state.upgrades,
          [id]: true,
        },
      }));
    }
  },

  buyClanNode: (id: string) => {
    const s = get();
    const node = CLAN_NODES[id];
    if (!node || s.clanNodes[id]) return;

    // Checa se o nó pai foi desbloqueado
    if (node.parent && !s.clanNodes[node.parent]) return;

    if (s.chakraAncestral.gte(node.cost)) {
      audio.playLevelUp();
      set((state) => ({
        chakraAncestral: state.chakraAncestral.sub(node.cost),
        clanNodes: {
          ...state.clanNodes,
          [id]: true,
        },
      }));
    }
  },

  buyGate: () => {
    const s = get();
    if (s.gatesUnlocked >= 8) return;

    const nextGate = GATE_DATA[s.gatesUnlocked];
    if (!nextGate) return;

    if (s.chakra.gte(nextGate.cost)) {
      audio.playLevelUp();
      set((state) => ({
        chakra: state.chakra.sub(nextGate.cost),
        gatesUnlocked: state.gatesUnlocked + 1,
      }));
    }
  },

  triggerGateRelease: () => {
    const s = get();
    if (s.gatesUnlocked === 0 || s.gatesActiveTimer > 0 || s.gatesCooldownTimer > 0 || s.exhaustionTimer > 0) return;

    audio.playJutsu();
    set({
      gatesActiveTimer: 20.0,
      gatesCooldownTimer: 60.0,
    });
  },

  setShopMode: (mode) => set({ shopMode: mode }),
  setShopQty: (qty) => set({ shopQty: qty }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleKineticMode: () => set((state) => ({ kineticMode: !state.kineticMode })),

  removeFloatingNumber: (id: number) => {
    set((state) => ({
      floatingNumbers: state.floatingNumbers.filter((n) => n.id !== id),
    }));
  },

  removeShockwave: (id: number) => {
    set((state) => ({
      shockwaves: state.shockwaves.filter((w) => w.id !== id),
    }));
  },

  tick: (dt: number) => {
    set((state) => {
      let activeGates = state.gatesActiveTimer;
      let cdGates = state.gatesCooldownTimer;
      let exhaust = state.exhaustionTimer;
      let clickExhaust = state.clickExhaustionTimer;
      let presenceBuff = state.onlinePresenceBuffTimer;

      if (activeGates > 0) {
        activeGates = Math.max(0, activeGates - dt);
        if (activeGates === 0) {
          // Mecânica de Colapso e Exaustão Shinobi:
          // Ao expirar a duração dos Portões, CPS cai 85% durante 20s e clique desativa por 5s
          exhaust = 20.0;
          clickExhaust = 5.0;
        }
      }

      if (cdGates > 0) {
        cdGates = Math.max(0, cdGates - dt);
      }

      if (exhaust > 0) {
        exhaust = Math.max(0, exhaust - dt);
      }

      if (clickExhaust > 0) {
        clickExhaust = Math.max(0, clickExhaust - dt);
      }

      if (presenceBuff > 0) {
        presenceBuff = Math.max(0, presenceBuff - dt);
      }

      let missionBuff = state.missionBuffTimer;
      if (missionBuff > 0) {
        missionBuff = Math.max(0, missionBuff - dt);
      }
      const missionMult = state.missionPermanentCpsMult * (missionBuff > 0 ? state.missionBuffMult : 1);

      const totalCPS = calculateTotalCPS(
        state.generators,
        state.upgrades,
        state.clanNodes,
        state.gatesUnlocked,
        activeGates > 0,
        exhaust > 0,
        state.claimedRankRewards,
        presenceBuff > 0,
        missionMult,
        state.inventory.equippedArmor,
        state.inventory.equippedWeapon,
        state.inventory.unlockedElements,
        state.inventory.elementalSacrificePenaltyMult,
        state.inventory.isAvatarShinobi
      );

      // Média móvel estável dos últimos 60 segundos (EMA com tau = 60s)
      const alpha = Math.min(1, Math.max(0, dt / 60));
      const prevRolling = state.stableRollingCPS || D(0);
      const updatedRolling = prevRolling.eq(0)
        ? totalCPS
        : prevRolling.mul(1 - alpha).add(totalCPS.mul(alpha));

      const deltaChakra = totalCPS.mul(dt);
      const newTotalEarned = state.stats.totalChakraEarned.add(deltaChakra);
      const newHighestCPS = totalCPS.gt(state.stats.highestCPSRecord) ? totalCPS : state.stats.highestCPSRecord;

      return {
        chakra: state.chakra.add(deltaChakra),
        gatesActiveTimer: activeGates,
        gatesCooldownTimer: cdGates,
        exhaustionTimer: exhaust,
        clickExhaustionTimer: clickExhaust,
        onlinePresenceBuffTimer: presenceBuff,
        missionBuffTimer: missionBuff,
        stableRollingCPS: updatedRolling,
        stats: {
          ...state.stats,
          playtimeSeconds: state.stats.playtimeSeconds + dt,
          totalChakraEarned: newTotalEarned,
          highestCPSRecord: newHighestCPS,
        },
      };
    });
  },

  saveGame: () => {
    const s = get();
    try {
      const serializable = {
        chakra: s.chakra.toString(),
        chakraAncestral: s.chakraAncestral.toString(),
        activeElement: s.activeElement,
        inventory: serializeInventory(s.inventory),
        generators: Object.fromEntries(
          Object.entries(s.generators).map(([k, v]) => [k, { level: v.level, unlocked: v.unlocked }])
        ),
        upgrades: s.upgrades,
        clanNodes: s.clanNodes,
        claimedRankRewards: s.claimedRankRewards,
        gatesUnlocked: s.gatesUnlocked,
        exhaustionTimer: s.exhaustionTimer,
        clickExhaustionTimer: s.clickExhaustionTimer,
        onlinePresenceRewardsClaimed: s.onlinePresenceRewardsClaimed,
        onlinePresenceBuffTimer: s.onlinePresenceBuffTimer,
        stableRollingCPS: s.stableRollingCPS.toString(),
        gachaTickets: s.gachaTickets,
        forgeFragments: s.forgeFragments,
        missionPermanentCpsMult: s.missionPermanentCpsMult,
        activeMission: {
          activeMissionId: s.activeMission.activeMissionId,
          selectedChoiceId: s.activeMission.selectedChoiceId,
          startedAt: s.activeMission.startedAt,
          resolvesAt: s.activeMission.resolvesAt,
          lastOutcome: s.activeMission.lastOutcome,
          cooldownExpiresAt: s.activeMission.cooldownExpiresAt,
        },
        gauntlet: {
          currentActiveBossId: s.gauntlet.currentActiveBossId,
          highestBossDefeated: s.gauntlet.highestBossDefeated,
          maxUnlockedBoss: s.gauntlet.highestBossDefeated,
          cooldownExpiresAt: s.gauntlet.cooldownExpiresAt,
          isFighting: s.gauntlet.isFighting,
          bossCurrentHp: s.gauntlet.bossCurrentHp.toString(),
          bossTimeRemaining: s.gauntlet.bossTimeRemaining,
        },
        stats: {
          manualClicksAllTime: s.stats.manualClicksAllTime,
          highestCPSRecord: s.stats.highestCPSRecord.toString(),
          totalPrestiges: s.stats.totalPrestiges,
          playtimeSeconds: Math.floor(s.stats.playtimeSeconds),
          totalChakraEarned: s.stats.totalChakraEarned.toString(),
        },
        lastSaveTimestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Safe fallback
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);

      set((state) => {
        const restoredGenerators = { ...state.generators };
        if (data.generators) {
          for (const key in data.generators) {
            if (restoredGenerators[key]) {
              restoredGenerators[key] = {
                ...restoredGenerators[key],
                level: data.generators[key].level || 0,
                unlocked: !!data.generators[key].unlocked,
              };
            }
          }
        }

        return {
          chakra: D(data.chakra || 0),
          chakraAncestral: D(data.chakraAncestral || 0),
          activeElement: data.activeElement || 'Fire',
          inventory: deserializeInventory(data.inventory),
          generators: restoredGenerators,
          upgrades: { ...state.upgrades, ...(data.upgrades || {}) },
          clanNodes: data.clanNodes || {},
          claimedRankRewards: data.claimedRankRewards || {},
          gatesUnlocked: data.gatesUnlocked || 0,
          exhaustionTimer: data.exhaustionTimer || 0,
          clickExhaustionTimer: data.clickExhaustionTimer || 0,
          onlinePresenceRewardsClaimed: data.onlinePresenceRewardsClaimed || {},
          onlinePresenceBuffTimer: data.onlinePresenceBuffTimer || 0,
          stableRollingCPS: D(data.stableRollingCPS || 0),
          gachaTickets: data.gachaTickets || 0,
          forgeFragments: data.forgeFragments || 0,
          missionPermanentCpsMult: data.missionPermanentCpsMult || 1,
          activeMission: data.activeMission
            ? {
                activeMissionId: data.activeMission.activeMissionId || null,
                selectedChoiceId: data.activeMission.selectedChoiceId || null,
                startedAt: data.activeMission.startedAt || null,
                resolvesAt: data.activeMission.resolvesAt || null,
                lastOutcome: data.activeMission.lastOutcome || null,
                cooldownExpiresAt: data.activeMission.cooldownExpiresAt || null,
              }
            : state.activeMission,
          gauntlet: data.gauntlet
            ? {
                currentActiveBossId: data.gauntlet.currentActiveBossId || 1,
                highestBossDefeated:
                  data.gauntlet.highestBossDefeated ?? data.gauntlet.maxUnlockedBoss ?? 0,
                maxUnlockedBoss:
                  data.gauntlet.highestBossDefeated ?? data.gauntlet.maxUnlockedBoss ?? 0,
                cooldownExpiresAt: data.gauntlet.cooldownExpiresAt || null,
                isFighting: false,
                bossCurrentHp: data.gauntlet.bossCurrentHp
                  ? D(data.gauntlet.bossCurrentHp)
                  : calculateBossHP(data.gauntlet.currentActiveBossId || 1),
                bossTimeRemaining: data.gauntlet.bossTimeRemaining || 30,
              }
            : state.gauntlet,
          stats: {
            ...state.stats,
            manualClicksCurrentSession: 0,
            manualClicksSession: 0,
            manualClicksAllTime: data.stats?.manualClicksAllTime || 0,
            highestCPSRecord: D(data.stats?.highestCPSRecord || 0),
            totalPrestiges: data.stats?.totalPrestiges || 0,
            playtimeSeconds: data.stats?.playtimeSeconds || 0,
            totalChakraEarned: D(data.stats?.totalChakraEarned || 0),
          },
        };
      });
    } catch {
      // Fallback
    }
  },
}));
