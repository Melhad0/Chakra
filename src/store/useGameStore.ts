import { create } from 'zustand';
import Decimal from 'break_infinity.js';
import { D, formatBigNumber } from '../engine/BigNumber';
import { ElementalAffinity, PlayerStats } from '../types/game';
import { GeneratorItem, ShopMode, ShopQty } from '../types/economy';
import { BossNavigationState } from '../types/combat';
import { ShinobiUser } from '../types/auth';
import { INITIAL_GENERATORS, INITIAL_UPGRADES, GATE_DATA, CLAN_NODES } from '../engine/data';
import {
  calculateTotalCPS,
  calculateClickPower,
  getBulkCost,
  getBulkSellRefund,
  getMaxBuyable,
} from '../engine/formulas';
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

  // Oito Portões Internos
  gatesUnlocked: number;
  gatesActiveTimer: number;
  gatesCooldownTimer: number;
  exhaustionTimer: number;

  // Estatísticas & Persistência
  stats: PlayerStats;
  lastSaveTimestamp: number;

  // Configurações de Interface
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
  setGauntletBossIndex: (index: number) => void;
  setGauntletCombatMode: (mode: 'PUSH' | 'FARM') => void;
  recordGauntletVictory: (defeatedBossId: number) => void;
  handleGauntletDefeat: () => void;

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
  upgrades: Object.keys(INITIAL_UPGRADES).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
  clanNodes: {},

  gatesUnlocked: 0,
  gatesActiveTimer: 0,
  gatesCooldownTimer: 0,
  exhaustionTimer: 0,

  stats: {
    manualClicksCurrentSession: 0,
    manualClicksAllTime: 0,
    highestCPSRecord: D(0),
    totalPrestiges: 0,
    playtimeSeconds: 0,
    totalChakraEarned: D(0),
  },
  lastSaveTimestamp: Date.now(),

  shopMode: 'buy',
  shopQty: 1,
  activeTab: 'gauntlet',
  kineticMode: true,
  stageShaking: false,

  floatingNumbers: [],
  shockwaves: [],

  // Gauntlet Roguelike (1-N)
  gauntlet: {
    currentBossIndex: 0,
    maxUnlockedBoss: 0,
    combatMode: 'PUSH',
  },

  setGauntletBossIndex: (index: number) => {
    set((state) => ({
      gauntlet: { ...state.gauntlet, currentBossIndex: Math.max(0, Math.min(39, index)) },
    }));
  },

  setGauntletCombatMode: (mode: 'PUSH' | 'FARM') => {
    set((state) => ({
      gauntlet: { ...state.gauntlet, combatMode: mode },
    }));
  },

  recordGauntletVictory: (defeatedBossId: number) => {
    set((state) => {
      const nextMax = Math.max(state.gauntlet.maxUnlockedBoss, defeatedBossId);
      const nextIndex =
        state.gauntlet.combatMode === 'PUSH'
          ? Math.min(state.gauntlet.currentBossIndex + 1, 39)
          : state.gauntlet.currentBossIndex;

      return {
        gauntlet: {
          ...state.gauntlet,
          maxUnlockedBoss: nextMax,
          currentBossIndex: nextIndex,
        },
      };
    });
  },

  handleGauntletDefeat: () => {
    set((state) => {
      if (state.gauntlet.combatMode === 'PUSH') {
        // Ciclo Punitivo Roguelike: Retorno Compulsório ao Chefe 1
        return {
          gauntlet: {
            ...state.gauntlet,
            currentBossIndex: 0,
          },
        };
      }
      return state;
    });
  },

  clickChakra: (coords) => {
    const s = get();
    const gatesActive = s.gatesActiveTimer > 0;
    const isExhausted = s.exhaustionTimer > 0;

    const currentCPS = calculateTotalCPS(
      s.generators,
      s.upgrades,
      s.clanNodes,
      s.gatesUnlocked,
      gatesActive,
      isExhausted
    );

    const baseClickPower = calculateClickPower(currentCPS, s.upgrades, s.clanNodes);

    // Chance de Crítico
    let critChance = 0.05;
    let critMult = 2.0;
    if (s.clanNodes['sharingan_awakening']) critChance += 0.10;
    if (s.clanNodes['mangekyo_sharingan_lineage']) critMult = 3.0;

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

    set((state) => ({
      chakra: state.chakra.add(finalAmount),
      stats: {
        ...state.stats,
        manualClicksCurrentSession: state.stats.manualClicksCurrentSession + 1,
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

    if (s.shopMode === 'buy') {
      let qtyToBuy: number = typeof s.shopQty === 'number' ? s.shopQty : 1;
      if (s.shopQty === 'max') {
        qtyToBuy = Math.max(1, getMaxBuyable(gen.baseCost, gen.level, s.chakra));
      }

      const cost = getBulkCost(gen.baseCost, gen.level, qtyToBuy);
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
        const refund = getBulkSellRefund(gen.baseCost, gen.level, qtyToSell);
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
    const upg = INITIAL_UPGRADES[id];
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

      if (activeGates > 0) {
        activeGates = Math.max(0, activeGates - dt);
        if (activeGates === 0 && state.gatesUnlocked === 8) {
          exhaust = 10.0;
        }
      }

      if (cdGates > 0) {
        cdGates = Math.max(0, cdGates - dt);
      }

      if (exhaust > 0) {
        exhaust = Math.max(0, exhaust - dt);
      }

      const totalCPS = calculateTotalCPS(
        state.generators,
        state.upgrades,
        state.clanNodes,
        state.gatesUnlocked,
        activeGates > 0,
        exhaust > 0
      );

      const deltaChakra = totalCPS.mul(dt);
      const newTotalEarned = state.stats.totalChakraEarned.add(deltaChakra);
      const newHighestCPS = totalCPS.gt(state.stats.highestCPSRecord) ? totalCPS : state.stats.highestCPSRecord;

      return {
        chakra: state.chakra.add(deltaChakra),
        gatesActiveTimer: activeGates,
        gatesCooldownTimer: cdGates,
        exhaustionTimer: exhaust,
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
        generators: Object.fromEntries(
          Object.entries(s.generators).map(([k, v]) => [k, { level: v.level, unlocked: v.unlocked }])
        ),
        upgrades: s.upgrades,
        clanNodes: s.clanNodes,
        gatesUnlocked: s.gatesUnlocked,
        gauntlet: s.gauntlet,
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
          generators: restoredGenerators,
          upgrades: { ...state.upgrades, ...(data.upgrades || {}) },
          clanNodes: data.clanNodes || {},
          gatesUnlocked: data.gatesUnlocked || 0,
          gauntlet: data.gauntlet
            ? {
                currentBossIndex: data.gauntlet.currentBossIndex || 0,
                maxUnlockedBoss: data.gauntlet.maxUnlockedBoss || 0,
                combatMode: data.gauntlet.combatMode || 'PUSH',
              }
            : state.gauntlet,
          stats: {
            ...state.stats,
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
