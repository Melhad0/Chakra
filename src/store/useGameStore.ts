import { create } from 'zustand';
import Decimal from 'break_infinity.js';
import { D, formatBigNumber } from '../engine/BigNumber';
import { ElementalAffinity, PlayerStats } from '../types/game';
import { GeneratorItem, ShopMode, ShopQty } from '../types/economy';
import {
  BossNavigationState,
  ShinobiCombatStats,
  MAX_COMBAT_LEVEL,
  POINTS_PER_LEVEL,
} from '../types/combat';
import { ShinobiUser } from '../types/auth';
import { ShinobiRankId, ShinobiRankDefinition, ShinobiPromotionId } from '../types/rankings';
import { ActiveGameView } from '../types/navigation';
import { INITIAL_GENERATORS, INITIAL_UPGRADES, GATE_DATA, CLAN_NODES } from '../engine/data';
import { TECHNIQUE_UPGRADES, UPGRADES_BY_ID } from '../constants/upgrades';
import {
  SHINOBI_RANKS_MAP,
  SHINOBI_RANKS,
  SHINOBI_PROMOTION_MISSIONS_MAP,
  getCurrentRank,
} from '../constants/rankings';
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
  calculateBossXp,
  calculateRequiredXp,
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
  EquippedGearSlots,
  GearSlotKey,
  DEFAULT_EQUIPPED_GEAR,
  normalizeEquipmentSlot,
} from '../types/inventory';
import { normalizeItemRarity, RARITY_ORDER } from '../types/rarity';
import { ItemDropToast } from '../types/notifications';
import { rollBossLoot } from '../constants/equipmentCatalog';
import { GachaDropResult } from '../types/gacha';
import { rollGachaSingle } from '../constants/gachaPool';
import { FORGE_RECIPES_CATALOG } from '../constants/forgeCatalog';
import { audio } from '../engine/audio';
import { apiUrl } from '../config/api';

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
  isEightGatesSidebarOpen: boolean;
  toggleEightGatesSidebar: () => void;
  setEightGatesSidebarOpen: (open: boolean) => void;
  isLeftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;

  // Recompensas de Presença Online & Média Móvel
  stableRollingCPS: Decimal;
  onlinePresenceRewardsClaimed: Record<string, boolean>;
  onlinePresenceBuffTimer: number;
  isOnlineRewardModalOpen: boolean;
  openOnlineRewardModal: () => void;
  closeOnlineRewardModal: () => void;
  claimOnlinePresenceReward: (tierId: string) => { success: boolean; message: string };
  claimAllOnlinePresenceRewards: () => { success: boolean; message: string; count: number };

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
  setCurrentActiveBossId: (bossId: number) => void;
  toggleGauntletAutoAdvance: () => void;
  toggleGauntletAutoLoop: () => void;
  setGauntletCombatAutomation: (mode: 'MANUAL' | 'ADVANCE' | 'LOOP') => void;

  // Notificações Pop-up de Recebimento de Itens (Drops & Saques)
  itemDropToasts: ItemDropToast[];
  pushItemDropToast: (toast: Omit<ItemDropToast, 'id' | 'timestamp'>) => void;
  dismissItemDropToast: (id: string) => void;

  // Sistema de Progressão RPG de Combate (Desafios)
  combatStats: ShinobiCombatStats;
  distributeCombatStats: (stat: 'strength' | 'vitality' | 'agility', amount: number) => boolean;
  awardCombatXp: (amount: Decimal) => { leveledUp: boolean; newLevel: number; pointsGained: number };

  // Recompensas de Patentes & Rankings
  claimedRankRewards: Record<string, boolean>;
  claimRankReward: (rankId: ShinobiRankId) => boolean;
  buyAllAffordableUpgrades: () => number;

  // Sistema de Exames Shinobi & Promoção de Patamares
  passedExams: Record<string, boolean>;
  completeExam: (examRankId: ShinobiRankId) => {
    success: boolean;
    message: string;
    promotedRank: ShinobiRankDefinition;
  };
  completePromotion: (rankId: ShinobiRankId) => {
    success: boolean;
    message: string;
    promotedRank: ShinobiRankDefinition;
  };

  // Quadro de Missões Shinobi (Ranks E a SS)
  activeMission: ActiveMissionState;
  missionPermanentCpsMult: number;
  missionBuffTimer: number;
  missionBuffMult: number;
  gachaTickets: number;
  forgeFragments: number;
  startMission: (missionId: string, choiceId: string) => boolean;
  resolveMissionChoice: () => MissionOutcome | null;
  resolveMissionWithMinigameBonus: (bonusSuccessRate: number, isCritical: boolean) => MissionOutcome | null;
  rushMissionCooldownWithTicket: () => boolean;
  speedUpRunningMissionWithTicket: () => boolean;
  clearMissionOutcome: () => void;

  // Pavilhão Gacha e Forja Lendária
  performGachaPull: (count: 1 | 10) => GachaDropResult[] | null;
  craftForgeWeapon: (recipeId: string) => boolean;
  refineEquippedItem: (slotKey: GearSlotKey) => boolean;
  dismantleBagItem: (slotIndex: number) => number;

  // Módulo Completo de Equipamentos, Inventário & Afinidade Elemental
  inventory: PlayerInventoryState;
  equipItem: (slotIndex: number) => boolean;
  unequipItem: (slotType: EquipmentSlotType) => boolean;
  discardItem: (slotIndex: number) => void;
  sacrificeForElement: (targetElement: ElementType, weaponSlotIndex?: number) => { success: boolean; message: string };
  addLootToInventory: (loot: {
    equipmentDrop?: EquipmentItem | null;
    equipmentDrops?: EquipmentItem[];
    farmMaterial: FarmMaterialItem;
  }) => { addedEquipment: boolean; addedMaterial: boolean };

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
  loadGame: (targetUser?: ShinobiUser | null) => Promise<void>;
  isCloudSyncing: boolean;
  cloudSyncStatus: 'synced' | 'saving' | 'error' | 'local_only';
  lastCloudSyncTimestamp: number | null;
  syncCloudSave: () => Promise<boolean>;

  // Autenticação & Sessão Shinobi (IAM)
  currentUser: ShinobiUser | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setCurrentUser: (user: ShinobiUser | null) => void;
  guestLogin: () => void;
  logout: () => void;

  // Chat Shinobi
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

export const STORAGE_KEY = 'chakra_clicker_save_react_v2';
export const SHINOBI_USER_KEY = 'chakra_shinobi_user';

export function getUserStorageKey(username?: string | null): string {
  if (username && username.trim().toLowerCase() !== 'convidado') {
    return `chakra_clicker_save_${username.trim().toLowerCase()}_v2`;
  }
  return STORAGE_KEY;
}
let nextFxId = 1;

export const ALL_CANONICAL_ELEMENTS: ElementType[] = ['FIRE', 'WIND', 'LIGHTNING', 'EARTH', 'WATER'];

export function getRandomNatalElement(): ElementType {
  return ALL_CANONICAL_ELEMENTS[Math.floor(Math.random() * ALL_CANONICAL_ELEMENTS.length)];
}

export function createInitialInventory(initialElement?: ElementType): PlayerInventoryState {
  return {
    equippedArmor: null,
    equippedWeapon: null,
    equippedGear: { ...DEFAULT_EQUIPPED_GEAR },
    unlockedElements: [initialElement || getRandomNatalElement()],
    inventoryBag: [],
    elementalSacrificePenaltyMult: 1.0,
    isAvatarShinobi: false,
  };
}

function serializeInventory(inv: PlayerInventoryState) {
  const serializeEquip = (item: EquipmentItem | null) =>
    item
      ? {
          ...item,
          bonusCpsMult: item.bonusCpsMult.toString(),
          bonusClickMult: item.bonusClickMult.toString(),
          bonusCritMult: item.bonusCritMult ? item.bonusCritMult.toString() : undefined,
          elementalBonusCpsMult: item.elementalBonusCpsMult ? item.elementalBonusCpsMult.toString() : undefined,
          elementalBonusClickMult: item.elementalBonusClickMult ? item.elementalBonusClickMult.toString() : undefined,
        }
      : null;

  const currentGear = inv.equippedGear || {
    ...DEFAULT_EQUIPPED_GEAR,
    CHESTPLATE: inv.equippedArmor,
    WEAPON_MELEE: inv.equippedWeapon,
  };

  const serializedGear: Record<string, any> = {};
  for (const [key, itm] of Object.entries(currentGear)) {
    serializedGear[key] = serializeEquip(itm);
  }

  return {
    equippedArmor: serializeEquip(inv.equippedArmor || currentGear.CHESTPLATE),
    equippedWeapon: serializeEquip(inv.equippedWeapon || currentGear.WEAPON_MELEE),
    equippedGear: serializedGear,
    unlockedElements: inv.unlockedElements,
    elementalSacrificePenaltyMult: inv.elementalSacrificePenaltyMult,
    isAvatarShinobi: inv.isAvatarShinobi,
    inventoryBag: inv.inventoryBag.filter(Boolean).map((item) => {
      if (!item) return null;
      if (item.type === 'MATERIAL') {
        return {
          ...item,
          baseGoldValue: item.baseGoldValue.toString(),
        };
      }
      return serializeEquip(item);
    }),
  };
}

function deserializeInventory(raw: any): PlayerInventoryState {
  if (!raw) return createInitialInventory();

  const parseItem = (item: any): InventorySlotItem | null => {
    if (!item) return null;
    const normalizedRarity = normalizeItemRarity(item.rarity);
    if (item.type === 'MATERIAL') {
      return {
        ...item,
        rarity: normalizedRarity,
        baseGoldValue: D(item.baseGoldValue || 0),
      };
    }
    return {
      ...item,
      rarity: normalizedRarity,
      bonusCpsMult: D(item.bonusCpsMult || 1),
      bonusClickMult: D(item.bonusClickMult || 1),
      bonusCritMult: item.bonusCritMult ? D(item.bonusCritMult) : undefined,
      elementalBonusCpsMult: item.elementalBonusCpsMult ? D(item.elementalBonusCpsMult) : undefined,
      elementalBonusClickMult: item.elementalBonusClickMult ? D(item.elementalBonusClickMult) : undefined,
    };
  };

  const rawBag = Array.isArray(raw.inventoryBag) ? raw.inventoryBag : [];
  const bag: InventorySlotItem[] = [];
  for (let i = 0; i < rawBag.length; i++) {
    if (rawBag[i]) {
      const parsed = parseItem(rawBag[i]);
      if (parsed) {
        bag.push(parsed);
      }
    }
  }

  const unlockedElements: ElementType[] =
    Array.isArray(raw.unlockedElements) && raw.unlockedElements.length > 0
      ? raw.unlockedElements
      : [getRandomNatalElement()];

  const rawGear = raw.equippedGear || {};
  const parsedGear: EquippedGearSlots = { ...DEFAULT_EQUIPPED_GEAR };

  for (const key of Object.keys(DEFAULT_EQUIPPED_GEAR) as GearSlotKey[]) {
    if (rawGear[key]) {
      parsedGear[key] = parseItem(rawGear[key]) as EquipmentItem;
    }
  }

  // Fallbacks para saves legados que só tinham equippedArmor / equippedWeapon
  if (!parsedGear.CHESTPLATE && raw.equippedArmor) {
    parsedGear.CHESTPLATE = parseItem(raw.equippedArmor) as EquipmentItem;
  }
  if (!parsedGear.WEAPON_MELEE && raw.equippedWeapon) {
    parsedGear.WEAPON_MELEE = parseItem(raw.equippedWeapon) as EquipmentItem;
  }

  return {
    equippedArmor: parsedGear.CHESTPLATE,
    equippedWeapon: parsedGear.WEAPON_MELEE,
    equippedGear: parsedGear,
    unlockedElements,
    inventoryBag: bag,
    elementalSacrificePenaltyMult: typeof raw.elementalSacrificePenaltyMult === 'number' ? raw.elementalSacrificePenaltyMult : 1.0,
    isAvatarShinobi: !!raw.isAvatarShinobi,
  };
}

function restoreStateFromSaveData(state: GameStoreState, data: any): Partial<GameStoreState> {
  if (!data || typeof data !== 'object') return {};

  const restoredGenerators = { ...state.generators };
  if (data.generators) {
    for (const key in data.generators) {
      if (restoredGenerators[key]) {
        const genVal = data.generators[key];
        const rawLvl = typeof genVal === 'object' && genVal !== null ? genVal.level : Number(genVal);
        const lvl = Number.isFinite(rawLvl) && rawLvl >= 0 ? Math.floor(rawLvl) : 0;
        restoredGenerators[key] = {
          ...restoredGenerators[key],
          level: lvl,
          unlocked: typeof genVal === 'object' && genVal !== null ? !!genVal.unlocked : !!lvl,
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
    passedExams: data.passedExams || {},
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
          cooldownExpiresAt: null,
          isFighting: false,
          bossCurrentHp: data.gauntlet.bossCurrentHp
            ? D(data.gauntlet.bossCurrentHp)
            : calculateBossHP(data.gauntlet.currentActiveBossId || 1),
          bossTimeRemaining: data.gauntlet.bossTimeRemaining || 30,
          autoAdvance: !!data.gauntlet.autoAdvance,
          autoLoop: !!data.gauntlet.autoLoop,
        }
      : state.gauntlet,
    combatStats: data.combatStats
      ? {
          level: Math.min(MAX_COMBAT_LEVEL, Math.max(1, data.combatStats.level || 1)),
          currentXp: D(data.combatStats.currentXp || 0),
          requiredXp: data.combatStats.requiredXp
            ? D(data.combatStats.requiredXp)
            : calculateRequiredXp(data.combatStats.level || 1),
          unspentStatPoints: Math.max(0, data.combatStats.unspentStatPoints || 0),
          strength: Math.max(10, data.combatStats.strength || 10),
          vitality: Math.max(10, data.combatStats.vitality || 10),
          agility: Math.max(5, data.combatStats.agility || 5),
        }
      : state.combatStats,
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
  isCloudSyncing: false,
  cloudSyncStatus: 'local_only',
  lastCloudSyncTimestamp: null,
  syncCloudSave: async () => {
    const s = get();
    if (!s.currentUser || s.currentUser.username === 'convidado') return false;
    s.saveGame();
    return true;
  },
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  isChatOpen: false,
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setCurrentUser: (user: ShinobiUser | null) => {
    if (user) {
      try {
        localStorage.setItem(SHINOBI_USER_KEY, JSON.stringify(user));
      } catch {}
      set({ currentUser: user });
      get().loadGame(user);
    } else {
      localStorage.removeItem(SHINOBI_USER_KEY);
      set({ currentUser: null, cloudSyncStatus: 'local_only' });
    }
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
    get().saveGame();
    localStorage.removeItem(SHINOBI_USER_KEY);
    set({ currentUser: null, cloudSyncStatus: 'local_only' });
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
  passedExams: {},

  // Módulo de Inventário & Afinidade de Chakra
  inventory: createInitialInventory(),

  equipItem: (slotIndex: number) => {
    const s = get();
    if (slotIndex < 0 || slotIndex >= s.inventory.inventoryBag.length) return false;
    const item = s.inventory.inventoryBag[slotIndex];
    if (!item || item.type === 'MATERIAL') return false;

    const targetSlot = normalizeEquipmentSlot(item.type);
    const newBag = [...s.inventory.inventoryBag];
    const currentGear = s.inventory.equippedGear || { ...DEFAULT_EQUIPPED_GEAR };
    const prevEquipped = currentGear[targetSlot] || null;

    if (prevEquipped) {
      // Substituição direta no mesmo slot
      newBag[slotIndex] = prevEquipped;
    } else {
      // Item foi equipado e nada estava equipado: remove da mochila adaptativa
      newBag.splice(slotIndex, 1);
    }

    const newEquippedGear: EquippedGearSlots = {
      ...currentGear,
      [targetSlot]: item,
    };

    set((state) => ({
      inventory: {
        ...state.inventory,
        equippedGear: newEquippedGear,
        equippedArmor: newEquippedGear.CHESTPLATE,
        equippedWeapon: newEquippedGear.WEAPON_MELEE,
        inventoryBag: newBag,
      },
    }));
    audio.playLevelUp();
    return true;
  },

  unequipItem: (slotType: EquipmentSlotType) => {
    const s = get();
    const targetSlot = normalizeEquipmentSlot(slotType);
    const currentGear = s.inventory.equippedGear || { ...DEFAULT_EQUIPPED_GEAR };
    const itemToUnequip = currentGear[targetSlot];
    if (!itemToUnequip) return false;

    const newBag = [...s.inventory.inventoryBag];
    // Mochila adaptativa: anexa diretamente o item de volta aos slots existentes
    newBag.push(itemToUnequip);

    const newEquippedGear: EquippedGearSlots = {
      ...currentGear,
      [targetSlot]: null,
    };

    set((state) => ({
      inventory: {
        ...state.inventory,
        equippedGear: newEquippedGear,
        equippedArmor: newEquippedGear.CHESTPLATE,
        equippedWeapon: newEquippedGear.WEAPON_MELEE,
        inventoryBag: newBag,
      },
    }));
    audio.playClick();
    return true;
  },

  discardItem: (slotIndex: number) => {
    const s = get();
    if (slotIndex < 0 || slotIndex >= s.inventory.inventoryBag.length) return;
    set((state) => {
      const newBag = [...state.inventory.inventoryBag];
      newBag.splice(slotIndex, 1); // Remoção adaptativa imediata
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

    // 4º Elemento: 5.000 CA + Sacrifício de Arma ÉPICA ou superior (Épica, Lendária, Mítica, Divina ou ADM)
    if (currentCount === 3) {
      if (s.chakraAncestral.lt(5000)) {
        return { success: false, message: 'Chakra Ancestral insuficiente. Requer 5.000 CA.' };
      }
      if (weaponSlotIndex === undefined || weaponSlotIndex < 0 || weaponSlotIndex >= s.inventory.inventoryBag.length) {
        return { success: false, message: 'Selecione uma arma de raridade Épica ou superior da mochila para sacrificar.' };
      }
      const weaponItem = s.inventory.inventoryBag[weaponSlotIndex];
      const isWeapon =
        weaponItem &&
        (weaponItem.type === 'WEAPON' ||
          weaponItem.type === 'WEAPON_MELEE' ||
          weaponItem.type === 'WEAPON_RANGED');
      if (!isWeapon || !['EPIC', 'LEGENDARY', 'MYTHIC', 'DIVINE', 'ADM'].includes(weaponItem.rarity)) {
        return { success: false, message: 'O item selecionado não é uma arma Épica, Lendária, Mítica, Divina ou ADM válida.' };
      }

      set((state) => {
        const newBag = [...state.inventory.inventoryBag];
        newBag.splice(weaponSlotIndex, 1); // Remoção adaptativa
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
        message: '4º Elemento despertado! A arma lendária foi completamente incinerada no ritual de sacrifício.',
      };
    }

    // 5º Elemento: 50.000 CA + Arma LENDÁRIA, MÍTICA, DIVINA ou ADM + Dreno de 40% do Chakra Atual (Avatar Shinobi)
    if (currentCount === 4) {
      if (s.chakraAncestral.lt(50000)) {
        return { success: false, message: 'Chakra Ancestral insuficiente. Requer 50.000 CA.' };
      }
      if (weaponSlotIndex === undefined || weaponSlotIndex < 0 || weaponSlotIndex >= s.inventory.inventoryBag.length) {
        return { success: false, message: 'Selecione uma arma Lendária, Mítica, Divina ou ADM para o sacrifício supremo.' };
      }
      const weaponItem = s.inventory.inventoryBag[weaponSlotIndex];
      const isWeapon =
        weaponItem &&
        (weaponItem.type === 'WEAPON' ||
          weaponItem.type === 'WEAPON_MELEE' ||
          weaponItem.type === 'WEAPON_RANGED');
      if (!isWeapon || !['LEGENDARY', 'MYTHIC', 'DIVINE', 'ADM'].includes(weaponItem.rarity)) {
        return { success: false, message: 'O item selecionado não é uma arma Lendária, Mítica, Divina ou ADM válida.' };
      }

      set((state) => {
        const newBag = [...state.inventory.inventoryBag];
        newBag.splice(weaponSlotIndex, 1); // Remoção adaptativa
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

  addLootToInventory: (loot: {
    equipmentDrop?: EquipmentItem | null;
    equipmentDrops?: EquipmentItem[];
    farmMaterial: FarmMaterialItem;
  }) => {
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
        // Mochila adaptativa: anexa novo material sem restrição
        newBag.push({ ...loot.farmMaterial });
        addedMaterial = true;
      }

      // 2. Processa Peças de Equipamento (múltiplas ou única com retrocompatibilidade)
      const itemsToAdd: EquipmentItem[] = [];
      if (loot.equipmentDrops && loot.equipmentDrops.length > 0) {
        itemsToAdd.push(...loot.equipmentDrops);
      } else if (loot.equipmentDrop) {
        itemsToAdd.push(loot.equipmentDrop);
      }

      for (const item of itemsToAdd) {
        newBag.push({ ...item });
        addedEquipment = true;
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
  isEightGatesSidebarOpen: false,
  toggleEightGatesSidebar: () => set((state) => ({ isEightGatesSidebarOpen: !state.isEightGatesSidebarOpen })),
  setEightGatesSidebarOpen: (open: boolean) => set({ isEightGatesSidebarOpen: open }),
  isLeftSidebarOpen: true,
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  setLeftSidebarOpen: (open: boolean) => set({ isLeftSidebarOpen: open }),
  isRightSidebarOpen: true,
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  setRightSidebarOpen: (open: boolean) => set({ isRightSidebarOpen: open }),

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
    autoAdvance: false,
    autoLoop: false,
  },

  // Notificações Pop-up de Recebimento de Itens (Drops & Saques)
  itemDropToasts: [],

  // Sistema de Atributos & Progressão Shinobi (Nível 1 a 700)
  combatStats: {
    level: 1,
    currentXp: D(0),
    requiredXp: calculateRequiredXp(1),
    unspentStatPoints: 0,
    strength: 10,
    vitality: 10,
    agility: 5,
  },

  distributeCombatStats: (stat: 'strength' | 'vitality' | 'agility', amount: number) => {
    const s = get();
    if (s.combatStats.unspentStatPoints < amount || amount <= 0) {
      return false;
    }
    audio.playClick();
    set((state) => ({
      combatStats: {
        ...state.combatStats,
        unspentStatPoints: state.combatStats.unspentStatPoints - amount,
        [stat]: state.combatStats[stat] + amount,
      },
    }));
    return true;
  },

  awardCombatXp: (amount: Decimal) => {
    let leveledUp = false;
    let newLevel = 1;
    let pointsGained = 0;

    set((state) => {
      const stats = { ...state.combatStats };
      if (stats.level >= MAX_COMBAT_LEVEL) {
        return state;
      }

      let currentXp = stats.currentXp.add(amount);
      let requiredXp = stats.requiredXp;
      let level = stats.level;
      let unspentPoints = stats.unspentStatPoints;

      while (currentXp.gte(requiredXp) && level < MAX_COMBAT_LEVEL) {
        currentXp = currentXp.sub(requiredXp);
        level += 1;
        unspentPoints += POINTS_PER_LEVEL;
        requiredXp = calculateRequiredXp(level);
        leveledUp = true;
        pointsGained += POINTS_PER_LEVEL;
      }

      if (level >= MAX_COMBAT_LEVEL) {
        currentXp = D(0);
        requiredXp = calculateRequiredXp(MAX_COMBAT_LEVEL);
      }

      newLevel = level;

      return {
        combatStats: {
          ...stats,
          level,
          currentXp,
          requiredXp,
          unspentStatPoints: unspentPoints,
        },
      };
    });

    if (leveledUp) {
      audio.playLevelUp();
    }

    return { leveledUp, newLevel, pointsGained };
  },

  // Gerenciamento de Notificações Pop-up de Drops (0.7s)
  pushItemDropToast: (toast: Omit<ItemDropToast, 'id' | 'timestamp'>) => {
    const newToast: ItemDropToast = {
      ...toast,
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      timestamp: Date.now(),
    };
    set((state) => ({
      // Mantém no máximo os 4 toasts mais recentes em tela para evitar poluição visual
      itemDropToasts: [...state.itemDropToasts.slice(-3), newToast],
    }));
  },

  dismissItemDropToast: (id: string) => {
    set((state) => ({
      itemDropToasts: state.itemDropToasts.filter((t) => t.id !== id),
    }));
  },

  // Automação Tática de Desafios (Auto-Avanço & Loop)
  toggleGauntletAutoAdvance: () => {
    set((state) => {
      const nextAdvance = !state.gauntlet.autoAdvance;
      return {
        gauntlet: {
          ...state.gauntlet,
          autoAdvance: nextAdvance,
          // Se ativar Auto-Avanço, desativa o Loop por exclusividade mútua
          autoLoop: nextAdvance ? false : state.gauntlet.autoLoop,
        },
      };
    });
  },

  toggleGauntletAutoLoop: () => {
    set((state) => {
      const nextLoop = !state.gauntlet.autoLoop;
      return {
        gauntlet: {
          ...state.gauntlet,
          autoLoop: nextLoop,
          // Se ativar Loop, desativa o Auto-Avanço por exclusividade mútua
          autoAdvance: nextLoop ? false : state.gauntlet.autoAdvance,
        },
      };
    });
  },

  setGauntletCombatAutomation: (mode: 'MANUAL' | 'ADVANCE' | 'LOOP') => {
    set((state) => ({
      gauntlet: {
        ...state.gauntlet,
        autoAdvance: mode === 'ADVANCE',
        autoLoop: mode === 'LOOP',
      },
    }));
  },

  setCurrentActiveBossId: (bossId: number) => {
    const targetBoss = GAUNTLET_BOSSES.find((b) => b.id === bossId);
    if (!targetBoss) return;
    set((state) => ({
      gauntlet: {
        ...state.gauntlet,
        currentActiveBossId: bossId,
        bossCurrentHp: targetBoss.hp,
        bossTimeRemaining: targetBoss.timer || 30,
        isFighting: false,
        cooldownExpiresAt: null,
      },
    }));
  },

  startBossFight: () => {
    const s = get();
    const currentBoss =
      GAUNTLET_BOSSES.find((b) => b.id === s.gauntlet.currentActiveBossId) || GAUNTLET_BOSSES[0];
    set((state) => ({
      gauntlet: {
        ...state.gauntlet,
        isFighting: true,
        bossCurrentHp: currentBoss.hp,
        bossTimeRemaining: currentBoss.timer || 30,
        cooldownExpiresAt: null,
      },
    }));
    return true;
  },

  onBossVictory: (bossId: number) => {
    const s = get();
    const currentBoss = GAUNTLET_BOSSES.find((b) => b.id === bossId) || GAUNTLET_BOSSES[0];
    const rewardChakra = calculateEffectiveBossReward(bossId, s.stableRollingCPS);
    const rewardAncestral = currentBoss.bountyAncestral || 1;

    // 1. Rolagem de saque estocástica (10 slots independentes)
    const lootRoll = rollBossLoot(bossId);
    s.addLootToInventory({
      equipmentDrop: lootRoll.equipmentDrop,
      equipmentDrops: lootRoll.equipmentDrops,
      farmMaterial: lootRoll.farmMaterial,
    });

    // 2. Concede XP de combate shinobi
    const xpReward = calculateBossXp(bossId);
    s.awardCombatXp(xpReward);

    // 3. Notificações Pop-up de Recebimento de Itens
    const droppedGears = lootRoll.equipmentDrops && lootRoll.equipmentDrops.length > 0
      ? lootRoll.equipmentDrops
      : lootRoll.equipmentDrop
      ? [lootRoll.equipmentDrop]
      : [];

    for (const gear of droppedGears) {
      s.pushItemDropToast({
        name: gear.name,
        rarity: gear.rarity,
        iconName: gear.iconName,
        subtext: 'Equipamento Obtido',
      });
    }

    if (lootRoll.farmMaterial) {
      s.pushItemDropToast({
        name: `${lootRoll.farmMaterial.name} (+${lootRoll.farmMaterial.stackCount})`,
        rarity: lootRoll.farmMaterial.rarity,
        iconName: lootRoll.farmMaterial.iconName,
        subtext: 'Material de Forja',
      });
    }

    // 4. Efeito sonoro: Se algum item for acima de Lendário (Mítico, Divino, ADM), toca som celestial!
    const allDroppedItems = [...droppedGears, lootRoll.farmMaterial].filter(Boolean);
    const hasAboveLegendary = allDroppedItems.some((item) => {
      const order = RARITY_ORDER[item.rarity] || 0;
      return order > RARITY_ORDER.LEGENDARY; // Tier > 7 (MYTHIC, DIVINE, ADM)
    });

    if (hasAboveLegendary) {
      audio.playMythicItemDrop();
    } else {
      audio.playLevelUp();
    }

    // 5. Gestão de Estado de Combate e Modos de Automação
    set((state) => {
      const nextHighest = Math.max(state.gauntlet.highestBossDefeated, bossId);
      const isAutoAdvance = !!state.gauntlet.autoAdvance;
      const isAutoLoop = !!state.gauntlet.autoLoop;

      // CENÁRIO A: AUTO-AVANÇO ATIVO (Push Mode)
      if (isAutoAdvance) {
        const hasNext = bossId < GAUNTLET_BOSSES.length;
        const nextActiveId = hasNext ? bossId + 1 : bossId;
        const nextBoss = GAUNTLET_BOSSES.find((b) => b.id === nextActiveId) || GAUNTLET_BOSSES[0];

        return {
          chakra: state.chakra.add(rewardChakra),
          chakraAncestral: state.chakraAncestral.add(rewardAncestral),
          gauntlet: {
            ...state.gauntlet,
            highestBossDefeated: nextHighest,
            maxUnlockedBoss: nextHighest,
            currentActiveBossId: nextActiveId,
            isFighting: hasNext, // Continua lutando se houver próximo chefe
            bossCurrentHp: nextBoss.hp,
            bossTimeRemaining: nextBoss.timer || 30,
            cooldownExpiresAt: null,
          },
        };
      }

      // CENÁRIO B: REPETIR BATALHA EM LOOP ATIVO (Farm Mode)
      if (isAutoLoop) {
        return {
          chakra: state.chakra.add(rewardChakra),
          chakraAncestral: state.chakraAncestral.add(rewardAncestral),
          gauntlet: {
            ...state.gauntlet,
            highestBossDefeated: nextHighest,
            maxUnlockedBoss: nextHighest,
            currentActiveBossId: bossId, // Permanece no mesmo chefe
            isFighting: true,            // Reinicia a luta imediatamente em loop
            bossCurrentHp: currentBoss.hp,
            bossTimeRemaining: currentBoss.timer || 30,
            cooldownExpiresAt: null,
          },
        };
      }

      // CENÁRIO C: MANUAL (PADRÃO - REMOVIDO AVANÇO AUTOMÁTICO COMPULSÓRIO)
      // O chefe derrotado permanece na tela; o combate encerra; o próximo fica desbloqueado na lista
      return {
        chakra: state.chakra.add(rewardChakra),
        chakraAncestral: state.chakraAncestral.add(rewardAncestral),
        gauntlet: {
          ...state.gauntlet,
          highestBossDefeated: nextHighest,
          maxUnlockedBoss: nextHighest,
          currentActiveBossId: bossId, // Mantém o chefe atual
          isFighting: false,
          bossCurrentHp: currentBoss.hp,
          bossTimeRemaining: currentBoss.timer || 30,
          cooldownExpiresAt: null,
        },
      };
    });
  },

  onBossDefeat: () => {
    audio.playCrit();
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
          cooldownExpiresAt: null,
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

  setGauntletBossIndex: (index: number) => {
    get().setCurrentActiveBossId(index);
  },

  setGauntletCombatMode: (mode: 'PUSH' | 'FARM') => {
    if (mode === 'PUSH') {
      get().setGauntletCombatAutomation('ADVANCE');
    } else {
      get().setGauntletCombatAutomation('LOOP');
    }
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
      s.stats.totalPrestiges,
      s.passedExams
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

  rushMissionCooldownWithTicket: () => {
    const s = get();
    if (s.gachaTickets < 1) return false;
    const now = Date.now();
    if (!s.activeMission.cooldownExpiresAt || s.activeMission.cooldownExpiresAt <= now) return false;

    set((state) => ({
      gachaTickets: state.gachaTickets - 1,
      activeMission: {
        ...state.activeMission,
        cooldownExpiresAt: null,
      },
    }));
    audio.playLevelUp();
    return true;
  },

  speedUpRunningMissionWithTicket: () => {
    const s = get();
    if (s.gachaTickets < 1) return false;
    const now = Date.now();
    if (!s.activeMission.activeMissionId || !s.activeMission.resolvesAt || s.activeMission.resolvesAt <= now) return false;

    set((state) => ({
      gachaTickets: state.gachaTickets - 1,
      activeMission: {
        ...state.activeMission,
        resolvesAt: now,
      },
    }));
    audio.playLevelUp();
    return true;
  },

  resolveMissionWithMinigameBonus: (bonusSuccessRate: number, isCritical: boolean) => {
    const s = get();
    if (!s.activeMission.activeMissionId || !s.activeMission.selectedChoiceId) return null;

    const mission = SHINOBI_MISSIONS_CATALOG.find((m) => m.id === s.activeMission.activeMissionId);
    if (!mission) return null;

    const choice = mission.choices.find((c) => c.id === s.activeMission.selectedChoiceId);
    if (!choice) return null;

    const roll = Math.random();
    const effectiveProb = Math.min(1.0, choice.successProbability + bonusSuccessRate);
    const isSuccess = isCritical || roll <= effectiveProb;
    let outcome = isSuccess ? { ...choice.successOutcome } : { ...choice.failureOutcome };

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
      const dropMult = isCritical ? 2 : 1;

      if (isCritical) {
        outcome = {
          ...outcome,
          narrativeResult: `⚡ [SUCESSO CRÍTICO SHINOBI]: ${outcome.narrativeResult} (Espólios dobrados pelo desempenho perfeito!)`,
        };
      }

      if (outcome.rewardChakraSeconds) {
        const cpsBase = s.stableRollingCPS && s.stableRollingCPS.gt(0) ? s.stableRollingCPS : D(10);
        extraChakra = extraChakra.add(cpsBase.mul(outcome.rewardChakraSeconds * dropMult));
      }
      if (outcome.rewardChakraFixed) {
        extraChakra = extraChakra.add(outcome.rewardChakraFixed.mul(dropMult));
      }
      if (outcome.rewardAncestral) {
        extraAncestral += outcome.rewardAncestral * dropMult;
      }
      if (outcome.rewardGachaTickets) {
        extraTickets += outcome.rewardGachaTickets * dropMult;
      }
      if (outcome.rewardForgeFragments) {
        extraFragments += outcome.rewardForgeFragments * dropMult;
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

  performGachaPull: (count: 1 | 10) => {
    const s = get();
    if (s.gachaTickets < count) return null;

    const drops: GachaDropResult[] = [];
    const newItems: EquipmentItem[] = [];
    let extraFrags = 0;
    let extraAncestral = 0;
    let extraCpsSeconds = 0;

    for (let i = 0; i < count; i++) {
      const isGuaranteed = count === 10 && i === count - 1;
      const drop = rollGachaSingle(isGuaranteed);
      drops.push(drop);

      if (drop.type === 'EQUIPMENT' && drop.equipment) {
        newItems.push(drop.equipment);
      } else if (drop.type === 'FORGE_FRAGMENTS' && drop.amount) {
        extraFrags += drop.amount;
      } else if (drop.type === 'ANCESTRAL_CHAKRA' && drop.amount) {
        extraAncestral += drop.amount;
      } else if (drop.type === 'CPS_BURST' && drop.cpsSeconds) {
        extraCpsSeconds += drop.cpsSeconds;
      }
    }

    const cpsBase = s.stableRollingCPS && s.stableRollingCPS.gt(0) ? s.stableRollingCPS : D(10);
    const chakraGain = cpsBase.mul(extraCpsSeconds);

    set((state) => ({
      gachaTickets: state.gachaTickets - count,
      forgeFragments: state.forgeFragments + extraFrags,
      chakraAncestral: state.chakraAncestral.add(extraAncestral),
      chakra: state.chakra.add(chakraGain),
      inventory: {
        ...state.inventory,
        inventoryBag: [...state.inventory.inventoryBag, ...newItems],
      },
    }));

    audio.playLevelUp();
    return drops;
  },

  craftForgeWeapon: (recipeId: string) => {
    const s = get();
    const recipe = FORGE_RECIPES_CATALOG.find((r) => r.id === recipeId);
    if (!recipe) return false;
    if (s.forgeFragments < recipe.costFragments) return false;

    const craftedItem: EquipmentItem = {
      ...recipe.resultItem,
      id: `${recipe.resultItem.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    set((state) => ({
      forgeFragments: state.forgeFragments - recipe.costFragments,
      inventory: {
        ...state.inventory,
        inventoryBag: [...state.inventory.inventoryBag, craftedItem],
      },
    }));

    audio.playLevelUp();
    return true;
  },

  refineEquippedItem: (slotKey: GearSlotKey) => {
    const s = get();
    const currentGear = s.inventory.equippedGear || { ...DEFAULT_EQUIPPED_GEAR };
    const item = currentGear[slotKey];
    if (!item) return false;

    const currentLevel = (item as any).refinementLevel || 0;
    if (currentLevel >= 10) return false;

    const cost = Math.min(600, Math.floor(15 * Math.pow(1.6, currentLevel)));
    if (s.forgeFragments < cost) return false;

    const refinedItem: EquipmentItem = {
      ...item,
      bonusCpsMult: item.bonusCpsMult.mul(1.1),
      bonusClickMult: item.bonusClickMult.mul(1.1),
      bonusCritChance: (item.bonusCritChance || 0) + 0.01,
      name: currentLevel === 0 ? `${item.name} +1` : item.name.replace(/\+\d+$/, `+${currentLevel + 1}`),
    };
    (refinedItem as any).refinementLevel = currentLevel + 1;

    const newEquippedGear: EquippedGearSlots = {
      ...currentGear,
      [slotKey]: refinedItem,
    };

    set((state) => ({
      forgeFragments: state.forgeFragments - cost,
      inventory: {
        ...state.inventory,
        equippedGear: newEquippedGear,
        equippedArmor: newEquippedGear.CHESTPLATE,
        equippedWeapon: newEquippedGear.WEAPON_MELEE,
      },
    }));

    audio.playLevelUp();
    return true;
  },

  dismantleBagItem: (slotIndex: number) => {
    const s = get();
    const item = s.inventory.inventoryBag[slotIndex];
    if (!item) return 0;

    let frags = 2;
    switch (item.rarity) {
      case 'COMMON':
        frags = 2;
        break;
      case 'UNCOMMON':
        frags = 5;
        break;
      case 'RARE':
        frags = 12;
        break;
      case 'EPIC':
        frags = 30;
        break;
      case 'LEGENDARY':
        frags = 80;
        break;
      case 'MYTHIC':
        frags = 250;
        break;
    }

    const newBag = [...s.inventory.inventoryBag];
    newBag.splice(slotIndex, 1);

    set((state) => ({
      forgeFragments: state.forgeFragments + frags,
      inventory: {
        ...state.inventory,
        inventoryBag: newBag,
      },
    }));

    audio.playClick();
    return frags;
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
        s.stats.totalPrestiges,
        s.passedExams
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
        gachaTickets: state.gachaTickets + (tier.gachaTickets || 0),
        forgeFragments: state.forgeFragments + (tier.weaponFragments || 0),
        onlinePresenceBuffTimer: nextBuffTimer,
        onlinePresenceRewardsClaimed: {
          ...state.onlinePresenceRewardsClaimed,
          [tierId]: true,
        },
      };
    });

    const rewardsList: string[] = [];
    if (rewardChakra.gt(0)) {
      rewardsList.push(`+${formatBigNumber(rewardChakra)} Chakra`);
    }
    if (tier.ancestralChakra) {
      rewardsList.push(`+${tier.ancestralChakra} Chakra Ancestral`);
    }
    if (tier.gachaTickets) {
      rewardsList.push(`+${tier.gachaTickets} Bilhete(s) Gacha`);
    }
    if (tier.weaponFragments) {
      rewardsList.push(`+${tier.weaponFragments} Fragmento(s) de Forja`);
    }
    if (tier.buffDurationSeconds) {
      rewardsList.push(`+${tier.buffCpsPct || 10}% CPS (${Math.round(tier.buffDurationSeconds / 60)}m)`);
    }

    return {
      success: true,
      message: `Provisão [${tier.title}] resgatada! ${rewardsList.join(', ')}`,
    };
  },

  claimAllOnlinePresenceRewards: () => {
    const s = get();
    const currentRank = getCurrentRank(
      s.stats.manualClicksAllTime,
      s.stats.highestCPSRecord,
      s.stats.totalPrestiges,
      s.passedExams
    );
    const currentIndex = SHINOBI_RANKS.findIndex((r) => r.id === currentRank.id);

    const eligibleTiers = ONLINE_PRESENCE_TIERS.filter((tier) => {
      if (s.onlinePresenceRewardsClaimed[tier.id]) return false;
      if (s.stats.playtimeSeconds < tier.timeSeconds) return false;
      if (tier.minRank) {
        const requiredIndex = SHINOBI_RANKS.findIndex((r) => r.id === tier.minRank);
        if (requiredIndex !== -1 && currentIndex < requiredIndex) {
          return false;
        }
      }
      return true;
    });

    if (eligibleTiers.length === 0) {
      return { success: false, message: 'Nenhuma provisão pronta para resgate no momento.', count: 0 };
    }

    let totalRewardChakra = D(0);
    let totalAncestral = 0;
    let totalTickets = 0;
    let totalFragments = 0;
    let maxBuffTimer = 0;
    const newClaimed = { ...s.onlinePresenceRewardsClaimed };

    for (const tier of eligibleTiers) {
      const rewardChakra = calculatePresenceRewardChakra(
        tier.cpsSeconds,
        s.stableRollingCPS,
        s.generators
      );
      totalRewardChakra = totalRewardChakra.add(rewardChakra);
      if (tier.ancestralChakra) totalAncestral += tier.ancestralChakra;
      if (tier.gachaTickets) totalTickets += tier.gachaTickets;
      if (tier.weaponFragments) totalFragments += tier.weaponFragments;
      if (tier.buffDurationSeconds && tier.buffDurationSeconds > maxBuffTimer) {
        maxBuffTimer = tier.buffDurationSeconds;
      }
      newClaimed[tier.id] = true;
    }

    audio.playLevelUp();

    set((state) => ({
      chakra: state.chakra.add(totalRewardChakra),
      chakraAncestral: state.chakraAncestral.add(totalAncestral),
      gachaTickets: state.gachaTickets + totalTickets,
      forgeFragments: state.forgeFragments + totalFragments,
      onlinePresenceBuffTimer: Math.max(state.onlinePresenceBuffTimer, maxBuffTimer),
      onlinePresenceRewardsClaimed: newClaimed,
    }));

    const summaryParts: string[] = [];
    if (totalRewardChakra.gt(0)) summaryParts.push(`+${formatBigNumber(totalRewardChakra)} Chakra`);
    if (totalAncestral > 0) summaryParts.push(`+${totalAncestral} Chakra Ancestral`);
    if (totalTickets > 0) summaryParts.push(`+${totalTickets} Bilhetes Gacha`);
    if (totalFragments > 0) summaryParts.push(`+${totalFragments} Frag. Forja`);

    return {
      success: true,
      message: `${eligibleTiers.length} provisões resgatadas com sucesso! ${summaryParts.join(', ')}`,
      count: eligibleTiers.length,
    };
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

  completeExam: (examRankId: ShinobiRankId) => {
    return get().completePromotion(examRankId);
  },

  completePromotion: (rankId: ShinobiRankId) => {
    const s = get();
    const targetRank = SHINOBI_RANKS_MAP[rankId] || SHINOBI_RANKS[0];

    // Se já passou, não duplica recompensa, não pode repetir!
    if (s.passedExams[rankId]) {
      return {
        success: false,
        message: `A graduação para ${targetRank.title} já foi oficializada e não pode ser repetida!`,
        promotedRank: targetRank,
      };
    }

    const mission = SHINOBI_PROMOTION_MISSIONS_MAP[rankId as ShinobiPromotionId];
    audio.playLevelUp();

    let bonusChakra = mission ? mission.bonusRewards.chakra : D(0);
    let bonusAncestral = mission ? mission.bonusRewards.ancestral : D(0);
    let bonusGachaTickets = mission ? mission.bonusRewards.gachaTickets : 0;
    let bonusForgeFragments = mission ? mission.bonusRewards.forgeFragments : 0;

    // Fallbacks para ranks caso a missão não esteja no mapa
    if (!mission) {
      if (rankId === 'gennin') {
        bonusChakra = D(25000);
        bonusAncestral = D(1);
        bonusGachaTickets = 1;
        bonusForgeFragments = 2;
      } else if (rankId === 'chunin') {
        bonusChakra = D(500000);
        bonusAncestral = D(5);
        bonusGachaTickets = 1;
        bonusForgeFragments = 5;
      } else if (rankId === 'jonin') {
        bonusChakra = D(10000000);
        bonusAncestral = D(20);
        bonusGachaTickets = 3;
        bonusForgeFragments = 12;
      }
    }

    set((state) => ({
      passedExams: {
        ...state.passedExams,
        [rankId]: true,
      },
      claimedRankRewards: {
        ...state.claimedRankRewards,
        [rankId]: true, // Ativa automaticamente a recompensa e bônus de patente
      },
      chakra: state.chakra.add(bonusChakra),
      chakraAncestral: state.chakraAncestral.add(bonusAncestral),
      gachaTickets: state.gachaTickets + bonusGachaTickets,
      forgeFragments: state.forgeFragments + bonusForgeFragments,
      stats: {
        ...state.stats,
        totalChakraEarned: state.stats.totalChakraEarned.add(bonusChakra),
      },
    }));

    // Auto-save imediato para salvar no storage local e nuvem
    get().saveGame();

    return {
      success: true,
      message: `Graduação concluída com louvor! Você foi promovido a ${targetRank.title}!`,
      promotedRank: targetRank,
    };
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
      // Bloqueio por pré-requisito (ex: V2 requer V1, V3 requer V2)
      if (
        upg.requiredUpgradeId &&
        !s.upgrades[upg.requiredUpgradeId] &&
        !newPurchased[upg.requiredUpgradeId]
      ) {
        continue;
      }

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
      s.inventory.isAvatarShinobi,
      s.inventory.equippedGear
    );

    const baseClickPower = calculateClickPower(
      currentCPS,
      s.upgrades,
      s.clanNodes,
      s.generators,
      s.claimedRankRewards,
      s.inventory.equippedWeapon,
      s.inventory.equippedArmor,
      s.inventory.unlockedElements,
      s.inventory.equippedGear
    );

    // Chance de Crítico
    let critChance = 0.05;
    let critMult = 2.0;
    for (const id in s.clanNodes) {
      if (s.clanNodes[id] && CLAN_NODES[id]?.critChanceBonus) {
        critChance += CLAN_NODES[id].critChanceBonus! / 100;
      }
    }
    if (s.claimedRankRewards['tokubetsu_jonin']) critChance += 0.05;
    if (s.upgrades['lion_combo']) critChance += 0.05;
    if (s.clanNodes['mangekyo_sharingan_lineage']) critMult = 3.0;
    if (s.upgrades['night_guy']) critMult *= 2.5;

    // Bônus de Crítico por Equipamentos de Todos os Slots
    const allEquippedItems = s.inventory.equippedGear
      ? Object.values(s.inventory.equippedGear).filter((itm): itm is EquipmentItem => !!itm)
      : [s.inventory.equippedArmor, s.inventory.equippedWeapon].filter((itm): itm is EquipmentItem => !!itm);

    for (const eqItem of allEquippedItems) {
      if (eqItem.bonusCritChance) {
        critChance += eqItem.bonusCritChance;
      }
      if (eqItem.bonusCritMult) {
        critMult *= eqItem.bonusCritMult.toNumber();
      }
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
      stageShaking: false,
      floatingNumbers: newFloatingNumbers,
      shockwaves: newShockwaves,
    }));
  },

  buyGenerator: (id: string) => {
    const s = get();
    const gen = s.generators[id];
    if (!gen) return;

    const safeLevel = Number.isFinite(gen.level) && gen.level >= 0 ? Math.floor(gen.level) : 0;
    const discount = getGeneratorCostDiscount(id, safeLevel, s.upgrades, s.claimedRankRewards);

    if (s.shopMode === 'buy') {
      let qtyToBuy: number = typeof s.shopQty === 'number' ? s.shopQty : 1;
      if (s.shopQty === 'max') {
        qtyToBuy = getMaxBuyable(gen.baseCost, safeLevel, s.chakra, discount);
      }

      if (!Number.isFinite(qtyToBuy) || qtyToBuy <= 0) return;

      const cost = getBulkCost(gen.baseCost, safeLevel, qtyToBuy, discount);
      if (
        cost &&
        cost.gt(0) &&
        Number.isFinite(cost.mantissa) &&
        !Number.isNaN(cost.mantissa) &&
        s.chakra.gte(cost)
      ) {
        audio.playBuy();
        set((state) => ({
          chakra: state.chakra.sub(cost),
          generators: {
            ...state.generators,
            [id]: {
              ...gen,
              level: safeLevel + qtyToBuy,
              unlocked: true,
            },
          },
        }));
      }
    } else {
      // Venda
      const numericQty = typeof s.shopQty === 'number' ? s.shopQty : 1;
      const qtyToSell: number = s.shopQty === 'max' ? safeLevel : Math.min(numericQty, safeLevel);
      if (qtyToSell > 0) {
        const refund = getBulkSellRefund(gen.baseCost, safeLevel, qtyToSell, discount);
        audio.playBuy();
        set((state) => ({
          chakra: state.chakra.add(refund),
          generators: {
            ...state.generators,
            [id]: {
              ...gen,
              level: Math.max(0, safeLevel - qtyToSell),
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

    // Se requer técnica anterior (V1 para V2 ou V2 para V3)
    if (upg.requiredUpgradeId && !s.upgrades[upg.requiredUpgradeId]) return;

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
        state.inventory.isAvatarShinobi,
        state.inventory.equippedGear
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
        passedExams: s.passedExams,
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
          cooldownExpiresAt: null,
          isFighting: false,
          bossCurrentHp: s.gauntlet.bossCurrentHp.toString(),
          bossTimeRemaining: s.gauntlet.bossTimeRemaining,
          autoAdvance: s.gauntlet.autoAdvance ?? false,
          autoLoop: s.gauntlet.autoLoop ?? false,
        },
        combatStats: {
          level: s.combatStats.level,
          currentXp: s.combatStats.currentXp.toString(),
          requiredXp: s.combatStats.requiredXp.toString(),
          unspentStatPoints: s.combatStats.unspentStatPoints,
          strength: s.combatStats.strength,
          vitality: s.combatStats.vitality,
          agility: s.combatStats.agility,
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
      
      const userKey = getUserStorageKey(s.currentUser?.username);
      localStorage.setItem(userKey, JSON.stringify(serializable));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));

      // Sincronização em nuvem se o usuário estiver autenticado (Neon Postgres)
      if (s.currentUser && s.currentUser.username && s.currentUser.username !== 'convidado') {
        set({ isCloudSyncing: true, cloudSyncStatus: 'saving' });
        fetch(apiUrl('/api/save'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: s.currentUser.username,
            state: serializable,
          }),
        })
          .then((res) => {
            if (res.ok) {
              set({
                isCloudSyncing: false,
                cloudSyncStatus: 'synced',
                lastCloudSyncTimestamp: Date.now(),
              });
            } else {
              set({ isCloudSyncing: false, cloudSyncStatus: 'error' });
            }
          })
          .catch(() => {
            set({ isCloudSyncing: false, cloudSyncStatus: 'local_only' });
          });
      }
    } catch {
      // Safe fallback
    }
  },

  loadGame: async (targetUser?: ShinobiUser | null) => {
    const s = get();
    const activeUser = targetUser !== undefined ? targetUser : s.currentUser;
    const userStorageKey = getUserStorageKey(activeUser?.username);

    let localData: any = null;
    try {
      const raw = localStorage.getItem(userStorageKey) || localStorage.getItem(STORAGE_KEY);
      if (raw) {
        localData = JSON.parse(raw);
        set((st) => restoreStateFromSaveData(st, localData));
      }
    } catch (e) {
      console.warn('Erro ao restaurar do localStorage:', e);
    }

    // Carregamento da nuvem no Neon Postgres
    if (activeUser && activeUser.username && activeUser.username !== 'convidado') {
      try {
        set({ isCloudSyncing: true, cloudSyncStatus: 'saving' });
        const res = await fetch(apiUrl(`/api/load?username=${encodeURIComponent(activeUser.username)}`));
        if (res.ok) {
          const payload = await res.json();
          if (payload.status === 'success' && payload.state) {
            const cloudState = payload.state;
            const cloudTimestamp = cloudState.lastSaveTimestamp || (cloudState.last_saved_time ? cloudState.last_saved_time * 1000 : 0);
            const localTimestamp = localData?.lastSaveTimestamp || 0;

            if (cloudTimestamp >= localTimestamp || !localData) {
              set((st) => ({
                ...restoreStateFromSaveData(st, cloudState),
                isCloudSyncing: false,
                cloudSyncStatus: 'synced',
                lastCloudSyncTimestamp: cloudTimestamp,
              }));
              try {
                localStorage.setItem(userStorageKey, JSON.stringify(cloudState));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
              } catch {}
            } else if (localData && localTimestamp > cloudTimestamp) {
              // Local possui progresso mais recente (ex: jogou offline), sincroniza para o Neon
              get().saveGame();
            } else {
              set({ isCloudSyncing: false, cloudSyncStatus: 'synced' });
            }
            return;
          }
        }
        set({ isCloudSyncing: false, cloudSyncStatus: 'local_only' });
      } catch {
        set({ isCloudSyncing: false, cloudSyncStatus: 'local_only' });
      }
    }
  },
}));
