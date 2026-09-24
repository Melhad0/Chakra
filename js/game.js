/**
 * game.js - Motor Central do Chakra Clicker (Arquitetura Refatorada)
 * Stack: BreakInfinity (BigNumber), Web Audio API, Canvas Particles,
 * Game Loop Desacoplado com rAF + Delta Time, Fórmulas de Balanceamento Canônicas.
 */

import { Decimal, D, formatBigNumber, setNotationMode, getNotationMode } from './BigNumber.js';
import { sound } from './audio.js';
import { particles } from './particles.js';
import { fx } from './effects.js';
import { CLAN_TREE, buyClanNode, renderClanTree } from './clans.js';
import { chuninExamManager } from './exam.js';
import { gauntletManager } from './gauntlet.js';
import { rankingsManager } from './rankings.js';
import { presenceRewardManager } from './rewards.js';
import { startMission, speedUpMission, claimMission, updateMissionsProgress, handleMissionClick, startParryGame, triggerParry, switchTrainingGame, startJutsuGame, startBalanceGame, balanceClick } from './missions.js';
import { performPrestige, buyPrestigeUpgrade, getPendingPrestigePoints } from './prestige.js';
import { rollGacha, equipSword } from './gacha.js';

export function formatNumber(num) {
    return formatBigNumber(num);
}

// Curva de custo clássica solicitada: Custo = Base * 1.15^Qtd
export const COST_MULTIPLIER = 1.15;

export const BASE_COSTS = {
    academy_student: 98,
    shadow_clone: 650,
    genin: 3900,
    chunin: 22750,
    jonin: 130000,
    anbu: 780000,
    sannin: 4550000,
    kage: 29250000,
    jinchuriki: 195000000,
    rikudou: 1300000000,
    toad_summon: 9750000000,
    slug_summon: 65000000000,
    snake_summon: 487500000000,
    sound_five: 3250000000000,
    seven_swordsmen: 22750000000000,
    akatsuki_member: 162500000000000,
    taka_member: 1170000000000000,
    edo_tensei_warrior: 7800000000000000,
    hyuga_elite: 55250000000000000,
    uchiha_elite: 390000000000000000,
    senju_elite: "2925000000000000000",
    otsutsuki_spirit: "22750000000000000000",
    bijuu_manifestation: "182000000000000000000",
    six_paths_clone: "1430000000000000000000",
    shinobi_alliance_division: "11700000000000000000000",
    kaguya_creation: "97500000000000000000000",
    hamura_guardian: "780000000000000000000000",
    indras_reincarnation: "6500000000000000000000000",
    asuras_reincarnation: "55250000000000000000000000",
    otsutsuki_god: "487500000000000000000000000"
};

export const BASE_CPS_MAP = {
    academy_student: 0.5,
    shadow_clone: 2,
    genin: 8,
    chunin: 35.0,
    jonin: 150.0,
    anbu: 600.0,
    sannin: 2500.0,
    kage: 12000.0,
    jinchuriki: 65000,
    rikudou: 350000.0,
    toad_summon: 1800000.0,
    slug_summon: 8500000.0,
    snake_summon: 40000000.0,
    sound_five: 180000000.0,
    seven_swordsmen: 800000000.0,
    akatsuki_member: 3500000000.0,
    taka_member: 15000000000.0,
    edo_tensei_warrior: 65000000000.0,
    hyuga_elite: 280000000000.0,
    uchiha_elite: 1200000000000.0,
    senju_elite: 5000000000000.0,
    otsutsuki_spirit: 25000000000000.0,
    bijuu_manifestation: 120000000000000.0,
    six_paths_clone: 600000000000000.0,
    shinobi_alliance_division: "3000000000000000",
    kaguya_creation: "15000000000000000",
    hamura_guardian: "80000000000000000",
    indras_reincarnation: "400000000000000000",
    asuras_reincarnation: "2000000000000000000",
    otsutsuki_god: "10000000000000000000"
};

export const GATE_NAMES = [
    "Portão da Abertura",
    "Portão da Cura",
    "Portão da Vida",
    "Portão da Dor",
    "Portão do Limite",
    "Portão da Visão",
    "Portão da Maravilha",
    "Portão da Morte"
];

export const GATE_COSTS = [
    5000,
    25000,
    100000,
    500000,
    2500000,
    10000000,
    50000000,
    250000000
];

export const MISSION_INFO = {
    protect_village: { duration: 60, reqs: [{ gen: "chunin", qty: 1 }], rewardChakra: 15000, rewardPrestige: 0, price: 10000 },
    infiltrate_akatsuki: { duration: 300, reqs: [{ gen: "jonin", qty: 1 }], rewardChakra: 100000, rewardPrestige: 1, price: 50000 },
    kyuubi_battle: { duration: 900, reqs: [{ gen: "kage", qty: 1 }], rewardChakra: 2500000, rewardPrestige: 2, price: 250000 },
    camp_zabuza: { duration: 120, reqs: [{ gen: "jonin", qty: 1 }, { gen: "genin", qty: 2 }], rewardChakra: 50000, rewardPrestige: 1, price: 25000, next: "camp_forest_death" },
    camp_forest_death: { duration: 300, reqs: [{ gen: "chunin", qty: 1 }, { gen: "genin", qty: 3 }], rewardChakra: 250000, rewardPrestige: 2, price: 100000, next: "camp_orochimaru" },
    camp_orochimaru: { duration: 600, reqs: [{ gen: "sannin", qty: 1 }, { gen: "chunin", qty: 2 }], rewardChakra: 1200000, rewardPrestige: 3, price: 500000, next: "camp_final_valley" },
    camp_final_valley: { duration: 900, reqs: [{ gen: "jonin", qty: 2 }, { gen: "genin", qty: 5 }], rewardChakra: 5000000, rewardPrestige: 5, price: 2000000, next: null }
};

export const SWORDS_INFO = {
    kubikiribocho: { name: "Kubikiribōchō", icon: "🗡️", desc: "A Lâmina Decapitadora. Cliques ganham +2% do seu CPS global." },
    samehada: { name: "Samehada", icon: "🦈", desc: "A Pele de Tubarão. Aliados ficam +10% mais eficientes." },
    kusanagi: { name: "Kusanagi", icon: "🐍", desc: "A Espada de Sasuke. Duplica o poder do seu clique manual." },
    totsuka: { name: "Totsuka", icon: "🍶", desc: "A Lâmina de Itachi. Multiplica o seu CPS global em 1.2x." },
    hiramekarei: { name: "Hiramekarei", icon: "🐟", desc: "A Espada de Chojuro. Reduz o tempo de missões em 15%." },
    kiba: { name: "Presas Kiba", icon: "⚡", desc: "As Lâminas de Trovão. Cliques têm 15% de chance de Crítico (5x)." }
};

export const BIJUUS = {
    "1": { name: "Shukaku (1 Cauda)", avatar: "🦝", stat: "Foco: Defesa Sand" },
    "2": { name: "Matatabi (2 Caudas)", avatar: "🐱", stat: "Foco: Chamas Azuis" },
    "3": { name: "Isobu (3 Caudas)", avatar: "🐢", stat: "Foco: Coral de Água" },
    "4": { name: "Son Gokū (4 Caudas)", avatar: "🦍", stat: "Foco: Estilo Lava" },
    "5": { name: "Kokuō (5 Caudas)", avatar: "🐴", stat: "Foco: Estilo Vapor" },
    "6": { name: "Saiken (6 Caudas)", avatar: "🐌", stat: "Foco: Ácido Corrosivo" },
    "7": { name: "Chōmei (7 Caudas)", avatar: "🪲", stat: "Foco: Voo de Inseto" },
    "8": { name: "Gyūki (8 Caudas)", avatar: "🐙", stat: "Foco: Tinta de Polvo" },
    "9": { name: "Kurama (9 Caudas)", avatar: "🦊", stat: "Foco: Chakra da Raposa" },
    "10": { name: "Jūbi (10 Caudas)", avatar: "👁️", stat: "Foco: Chakra Divino" }
};

export const BIJUU_STAGES = {
    1: "Estágio 1: Selo Inicial",
    2: "Estágio 2: Manifestação Parcial",
    3: "Estágio 3: Manto de Chakra",
    4: "Estágio 4: Besta Desperta",
    5: "Estágio 5: Fusão Lendária (Máximo)"
};

// Global Game State
export let currentUsername = "";
export let sessionClicks = 0;

export let gameState = {
    chakra: D(0),
    total_chakra_earned: D(0),
    clicks: 0,
    peak_cps: D(0),
    prestige_points: 0,
    total_prestige_points: 0,
    total_prestiges: 0,
    is_chunin: false,
    chunin_exam: { passed: false, current_phase: 1, high_score: 0 },
    clan_tree: {},
    gauntlet: { defeated_ids: {}, highest_defeated: 0 },
    presence_rewards: {},
    gacha_tickets: 0,
    sword_fragments: 0,
    crit_buff_timer: 0,
    presence_buff_timer: 0,
    prestige_upgrades: {
        clan_heritage: false,
        forbidden_scroll: false,
        tailed_chakra_beast: false,
        ancestral_voice: false,
        shadow_clone_mastery: false,
        jonin_elite: false,
        kage_council: false,
        chakra_absorption: false,
        will_of_fire: false,
        bijuu_resonance: false,
        anbu_shadow: false,
        jinchuriki_bond: false,
        rikudou_blessing: false,
        ninja_alliance: false,
        fourth_hokage: false,
        hashirama_cells: false,
        mangekyou_sharingan: false,
        sage_contract: false,
        eight_gates_mastery: false,
        akatsuki_intel: false,
        tenseigan: false,
        byakugan: false,
        reanimation_army: false,
        heaven_star: false
    },
    generators: {
        academy_student: 0,
        shadow_clone: 0,
        genin: 0,
        chunin: 0,
        jonin: 0,
        anbu: 0,
        sannin: 0,
        kage: 0,
        jinchuriki: 0,
        rikudou: 0,
        toad_summon: 0,
        slug_summon: 0,
        snake_summon: 0,
        sound_five: 0,
        seven_swordsmen: 0,
        akatsuki_member: 0,
        taka_member: 0,
        edo_tensei_warrior: 0,
        hyuga_elite: 0,
        uchiha_elite: 0,
        senju_elite: 0,
        otsutsuki_spirit: 0,
        bijuu_manifestation: 0,
        six_paths_clone: 0,
        shinobi_alliance_division: 0,
        kaguya_creation: 0,
        hamura_guardian: 0,
        indras_reincarnation: 0,
        asuras_reincarnation: 0,
        otsutsuki_god: 0
    },
    upgrades: {
        bandana_genin: false,
        sealing_scroll: false,
        tactical_kunai: false,
        tree_climbing: false,
        ninja_sandals: false,
        chakra_concentration: false,
        shadow_clone_scroll: false,
        ninja_food_pill: false,
        sharingan: false,
        sage_mode: false,
        kyuubi_cloak: false,
        summoning_scroll: false,
        choku_tomoe: false,
        gravity_training: false,
        reaper_seal: false,
        kurama_mode: false,
        blade_storm: false,
        rasengan_mastery: false,
        perfect_susanoo: false,
        edo_tensei: false,
        truth_seeking_orbs: false,
        six_paths_sage: false,
        infinite_tsukuyomi: false,
        otsutsuki_power: false,
        divine_tree: false,
        creation_all_things: false
    },
    achievements: {
        first_click: false,
        reach_100: false,
        ten_clones: false,
        have_kakashi: false,
        reach_1m: false,
        sage_master: false,
        infinite_chakra: false,
        clicks_1000: false,
        first_summon: false,
        ultimate_master: false,
        tailed_chakra: false,
        hero_of_konoha: false
    },
    missions: {
        protect_village: { status: "idle", end_time: 0.0 },
        infiltrate_akatsuki: { status: "idle", end_time: 0.0 },
        kyuubi_battle: { status: "idle", end_time: 0.0 },
        camp_zabuza: { status: "idle", end_time: 0.0, completed: false },
        camp_forest_death: { status: "idle", end_time: 0.0, completed: false },
        camp_orochimaru: { status: "idle", end_time: 0.0, completed: false },
        camp_final_valley: { status: "idle", end_time: 0.0, completed: false }
    },
    swords: {
        kubikiribocho: false,
        samehada: false,
        kusanagi: false,
        totsuka: false,
        hiramekarei: false,
        kiba: false
    },
    swords_levels: {
        kubikiribocho: 1,
        samehada: 1,
        kusanagi: 1,
        totsuka: 1,
        hiramekarei: 1,
        kiba: 1
    },
    equipped_sword: "",
    bijuu: {
        chosen: "",
        level: 1,
        completed_goals: []
    },
    gates_unlocked: 0
};

export let calculatedCps = D(0);
export let calculatedClickPower = D(1);
export let calculatedCritChance = 0.05;
export let calculatedCritMult = D(2);

export let shopMode = 'buy';
export let shopQty = 1;

export let gatesActiveTime = 0.0;
export let gatesCooldown = 0.0;
export let exhaustionTime = 0.0;
export let trainingBuffTimer = 0.0;

export function setUsername(val) { currentUsername = val; }

// --- THEME & NOTATION CONTROLS ---
export function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeUI(isLight);
}
window.toggleTheme = toggleTheme;

function updateThemeUI(isLight) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (icon) icon.innerText = isLight ? '☀️' : '🌙';
    if (text) text.innerText = isLight ? 'Tema Claro' : 'Tema Escuro';
}

export function toggleNotation() {
    const current = getNotationMode();
    const next = current === "suffix" ? "scientific" : "suffix";
    setNotationMode(next);
    const btn = document.getElementById('notation-toggle-btn');
    if (btn) btn.innerText = next === "scientific" ? "Notação: 1.00e15" : "Notação: Sufixos (K, M, B)";
    updateDOM();
}
window.toggleNotation = toggleNotation;

// --- NAVIGATION TABS ---
export function switchTab(tabId) {
    const tabs = ['upgrades', 'clans', 'exam', 'gauntlet', 'rankings', 'rewards', 'missions', 'bijuu', 'gacha'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const panel = document.getElementById(`tab-content-${t}`);
        if (btn) btn.classList.toggle('active', t === tabId);
        if (panel) panel.classList.toggle('hidden', t !== tabId);
    });

    sound.playBuy();

    if (tabId === 'clans') {
        renderClanTree(gameState, saveGame, updateDOM);
    } else if (tabId === 'gauntlet') {
        gauntletManager.renderUI();
    } else if (tabId === 'rankings') {
        rankingsManager.renderUI(gameState, sessionClicks);
    } else if (tabId === 'rewards') {
        presenceRewardManager.renderUI(gameState, calculatedCps);
    }
}
window.switchTab = switchTab;

// --- SHOP CONTROLS (BUY / SELL & QUANTITY) ---
export function setShopMode(mode) {
    shopMode = mode;
    const btnBuy = document.getElementById('btn-mode-buy');
    const btnSell = document.getElementById('btn-mode-sell');
    if (btnBuy) btnBuy.classList.toggle('active', mode === 'buy');
    if (btnSell) btnSell.classList.toggle('active', mode === 'sell');
    updateDOM();
}
window.setShopMode = setShopMode;

export function setShopQty(qty) {
    shopQty = qty;
    const b1 = document.getElementById('btn-qty-1');
    const b10 = document.getElementById('btn-qty-10');
    const b100 = document.getElementById('btn-qty-100');
    const bMax = document.getElementById('btn-qty-max');
    if (b1) b1.classList.toggle('active', qty === 1);
    if (b10) b10.classList.toggle('active', qty === 10);
    if (b100) b100.classList.toggle('active', qty === 100);
    if (bMax) bMax.classList.toggle('active', qty === 'max');
    updateDOM();
}
window.setShopQty = setShopQty;

export function getMaxBuyable(key) {
    const count = gameState.generators[key] || 0;
    let base = D(BASE_COSTS[key] || 100);
    if (gameState.upgrades.chakra_concentration) base = base.mul(0.95);
    const r = COST_MULTIPLIER;
    const initial = base.mul(D(r).pow(count));
    const currentChakra = D(gameState.chakra);
    if (currentChakra.lt(initial)) return 0;

    try {
        const factor = currentChakra.mul(r - 1).div(initial).add(1);
        const logVal = Math.log(factor.toNumber());
        const n = Math.floor(logVal / Math.log(r));
        return Math.max(1, n);
    } catch (_) {
        return 1;
    }
}

export function getEffectiveQty(key, mode, qty) {
    if (qty === 'max') {
        if (mode === 'buy') {
            return Math.max(1, getMaxBuyable(key));
        } else {
            const count = gameState.generators[key] || 0;
            return Math.max(1, count);
        }
    }
    return typeof qty === 'number' ? qty : 1;
}

export function getGeneratorCostRange(key, mode, qty) {
    const effectiveQty = getEffectiveQty(key, mode, qty);
    const count = gameState.generators[key] || 0;
    let base = D(BASE_COSTS[key] || 100);

    if (gameState.upgrades.chakra_concentration) {
        base = base.mul(0.95);
    }

    const r = COST_MULTIPLIER; // 1.15

    if (mode === 'buy') {
        if (effectiveQty <= 0) return base.mul(D(r).pow(count));
        if (effectiveQty === 1) {
            return base.mul(D(r).pow(count));
        }
        const initial = base.mul(D(r).pow(count));
        const sumMultiplier = D(r).pow(effectiveQty).sub(1).div(r - 1);
        return initial.mul(sumMultiplier);
    } else {
        const sellQty = Math.min(effectiveQty, count);
        if (sellQty <= 0) return D(0);
        let refund = D(0);
        for (let i = 0; i < sellQty; i++) {
            refund = refund.add(base.mul(D(r).pow(count - 1 - i)));
        }
        return refund.mul(0.8); // 80% refund
    }
}

export function buyGenerator(key) {
    const count = gameState.generators[key] || 0;
    const effectiveQty = getEffectiveQty(key, shopMode, shopQty);
    if (effectiveQty <= 0) return;

    if (shopMode === 'buy') {
        const cost = getGeneratorCostRange(key, 'buy', effectiveQty);
        if (D(gameState.chakra).gte(cost) && effectiveQty > 0) {
            gameState.chakra = D(gameState.chakra).sub(cost);
            gameState.generators[key] = count + effectiveQty;
            sound.playBuy();
            recalculateStats();
            updateDOM();
            saveGame();
        } else {
            sound.playAlert();
        }
    } else {
        const sellQty = Math.min(effectiveQty, count);
        if (sellQty > 0) {
            const refund = getGeneratorCostRange(key, 'sell', sellQty);
            gameState.chakra = D(gameState.chakra).add(refund);
            gameState.generators[key] = count - sellQty;
            sound.playBuy();
            recalculateStats();
            updateDOM();
            saveGame();
        }
    }
}
window.buyGenerator = buyGenerator;

export function buyUpgrade(key, costVal) {
    const cost = D(costVal);
    if (!gameState.upgrades[key] && D(gameState.chakra).gte(cost)) {
        gameState.chakra = D(gameState.chakra).sub(cost);
        gameState.upgrades[key] = true;
        sound.playLevelUp();
        recalculateStats();
        updateDOM();
        saveGame();
    }
}
window.buyUpgrade = buyUpgrade;

// --- RECALCULATE STATS (MATH BALANCING WITH BIGNUMBER) ---
export function recalculateStats() {
    let cps = D(0);

    for (let key in gameState.generators) {
        let base = D(BASE_CPS_MAP[key] || 0);
        let count = gameState.generators[key] || 0;
        if (count <= 0) continue;

        let mult = D(1.0);
        if (key === 'shadow_clone' && gameState.upgrades.ninja_food_pill) mult = mult.mul(2.0);
        if (key === 'academy_student' && gameState.upgrades.tree_climbing) mult = mult.mul(2.0);
        if (key === 'shadow_clone' && gameState.upgrades.shadow_clone_scroll) mult = mult.mul(1.5);
        if ((key === 'genin' || key === 'chunin') && gameState.upgrades.gravity_training) mult = mult.mul(2.0);
        if ((key === 'jonin' || key === 'anbu') && gameState.upgrades.sharingan) mult = mult.mul(2.0);
        if (key === 'sannin' && gameState.upgrades.summoning_scroll) mult = mult.mul(2.0);
        if (key === 'kage' && gameState.upgrades.choku_tomoe) mult = mult.mul(2.0);
        if (key === 'jinchuriki' && gameState.upgrades.edo_tensei) mult = mult.mul(2.0);

        // Prestige upgrade bonuses
        if (key === 'jonin' && gameState.prestige_upgrades.jonin_elite) mult = mult.mul(2.0);
        if (key === 'anbu' && gameState.prestige_upgrades.anbu_shadow) mult = mult.mul(2.5);
        if (key === 'jinchuriki' && gameState.prestige_upgrades.jinchuriki_bond) mult = mult.mul(3.0);
        if (key === 'kage' && gameState.prestige_upgrades.kage_council) mult = mult.mul(3.0);
        if (key === 'rikudou' && gameState.prestige_upgrades.rikudou_blessing) mult = mult.mul(4.0);

        cps = cps.add(base.mul(count).mul(mult));
    }

    // Global CPS Multipliers
    if (gameState.upgrades.sage_mode) cps = cps.mul(3.0);
    if (gameState.upgrades.kurama_mode) cps = cps.mul(4.0);
    if (gameState.upgrades.six_paths_sage) cps = cps.mul(5.0);
    if (gameState.upgrades.infinite_tsukuyomi) cps = cps.mul(2.0);
    if (gameState.upgrades.otsutsuki_power) cps = cps.mul(6.0);
    if (gameState.upgrades.divine_tree) cps = cps.mul(8.0);
    if (gameState.upgrades.creation_all_things) cps = cps.mul(10.0);

    if (gameState.prestige_upgrades.forbidden_scroll) cps = cps.mul(1.25);
    if (gameState.prestige_upgrades.ninja_alliance) cps = cps.mul(1.30);
    if (gameState.prestige_upgrades.heaven_star) cps = cps.mul(3.0);

    // Chunin Exam Completion Bonus (Canonical 2x CPS Global)
    if (gameState.is_chunin || (gameState.chunin_exam && gameState.chunin_exam.passed)) {
        cps = cps.mul(2.0);
    }

    // Presence Buff (2-hour online reward)
    if (gameState.presence_buff_timer > 0) {
        cps = cps.mul(1.20);
    }

    // Clan Geneology Tree Multipliers
    if (gameState.clan_tree) {
        const statsObj = {
            cpsMultiplier: D(1.0),
            clickMultiplier: D(1.0),
            clickCpsRatio: 0,
            critChance: 0.05,
            critMultiplier: D(2.0),
            missionRewardMult: 1.0,
            offlineEfficiency: 0.75,
            prestigeGainMultiplier: 1.0
        };

        for (let nodeId in gameState.clan_tree) {
            if (gameState.clan_tree[nodeId] && CLAN_TREE[nodeId] && CLAN_TREE[nodeId].effect) {
                CLAN_TREE[nodeId].effect(statsObj);
            }
        }

        cps = cps.mul(statsObj.cpsMultiplier);
        calculatedCritChance = statsObj.critChance;
        calculatedCritMult = statsObj.critMultiplier;
    }

    // Equipped Sword Bonus
    const equipped = gameState.equipped_sword || "";
    const swordLvl = (gameState.swords_levels && gameState.swords_levels[equipped]) || 1;
    const swordMultVal = 1.0 + (swordLvl - 1) * 0.25;

    if (equipped === 'samehada') cps = cps.mul(1.0 + 0.10 * swordMultVal);
    if (equipped === 'totsuka') cps = cps.mul(1.0 + 0.20 * swordMultVal);

    // Eight Inner Gates (Portões Internos)
    if (gatesActiveTime > 0 && gameState.gates_unlocked > 0) {
        const mult = 1.0 + (gameState.gates_unlocked * 1.5);
        cps = cps.mul(mult);
    }

    // Exhaustion Debuff
    if (exhaustionTime > 0) {
        cps = cps.mul(0.1); // -90% during collapse
    }

    // Training Buff
    if (trainingBuffTimer > 0) {
        cps = cps.mul(1.5);
    }

    // --- CLICK POWER CALCULATION ---
    let clickPower = D(1.0);
    if (gameState.upgrades.bandana_genin) clickPower = clickPower.mul(1.5);
    if (gameState.upgrades.blade_storm) clickPower = clickPower.mul(1.3);
    if (gameState.upgrades.rasengan_mastery) clickPower = clickPower.mul(2.0);
    if (gameState.upgrades.truth_seeking_orbs) clickPower = clickPower.mul(3.0);
    if (gameState.upgrades.otsutsuki_power) clickPower = clickPower.mul(4.0);
    if (gameState.upgrades.creation_all_things) clickPower = clickPower.mul(5.0);

    // Percentage of CPS converted to Click Power
    let cpsToClickRatio = 0.0;
    if (gameState.upgrades.kyuubi_cloak) cpsToClickRatio += 0.005;
    if (gameState.upgrades.reaper_seal) cpsToClickRatio += 0.02;
    if (gameState.upgrades.perfect_susanoo) cpsToClickRatio += 0.03;
    if (gameState.clan_tree && gameState.clan_tree.mangekyo_sharingan_lineage) cpsToClickRatio += 0.03;
    if (equipped === 'kubikiribocho') cpsToClickRatio += 0.02 * swordMultVal;

    if (cpsToClickRatio > 0) {
        clickPower = clickPower.add(cps.mul(cpsToClickRatio));
    }

    if (equipped === 'kusanagi') clickPower = clickPower.mul(2.0 * swordMultVal);

    // Presence 10m buff
    if (gameState.crit_buff_timer > 0) {
        calculatedCritChance += 0.25;
    }

    calculatedCps = cps;
    calculatedClickPower = clickPower;

    // Track peak CPS for rankings
    if (!gameState.peak_cps) gameState.peak_cps = D(0);
    if (calculatedCps.gt(gameState.peak_cps)) {
        gameState.peak_cps = calculatedCps;
    }
}

// --- DOM UPDATE & RENDERING ---
export function updateDOM() {
    const chakraEl = document.getElementById('chakra-counter');
    const cpsEl = document.getElementById('cps-counter');
    const clickPowerEl = document.getElementById('click-power-display');
    const totalClicksEl = document.getElementById('total-clicks');
    const totalEarnedEl = document.getElementById('total-earned');
    const hudAncestral = document.getElementById('hud-ancestral-val');
    const hudRank = document.getElementById('hud-rank-title');
    const critEl = document.getElementById('click-crit-display');
    const presenceLabel = document.getElementById('hud-presence-label');

    if (chakraEl) chakraEl.innerText = formatBigNumber(gameState.chakra);
    if (cpsEl) cpsEl.innerText = `${formatBigNumber(calculatedCps)} CPS`;
    if (clickPowerEl) clickPowerEl.innerText = `Clique: +${formatBigNumber(calculatedClickPower)}`;
    if (totalClicksEl) totalClicksEl.innerText = (gameState.clicks || 0).toLocaleString();
    if (totalEarnedEl) totalEarnedEl.innerText = formatBigNumber(gameState.total_chakra_earned);
    if (hudAncestral) hudAncestral.innerText = (gameState.prestige_points || 0).toLocaleString();
    if (hudRank) hudRank.innerText = rankingsManager.getShinobiRank ? rankingsManager.getShinobiRank(gameState.total_chakra_earned).title : "Gennin";
    if (critEl) critEl.innerText = `Crítico: ${(calculatedCritChance * 100).toFixed(0)}% (${calculatedCritMult.toFixed(1)}x)`;
    if (presenceLabel) presenceLabel.innerText = presenceRewardManager.getNextClaimTimeFormatted ? presenceRewardManager.getNextClaimTimeFormatted() : "5m";

    // Generator Cards
    const genKeys = Object.keys(BASE_COSTS);
    for (let i = 0; i < genKeys.length; i++) {
        const key = genKeys[i];
        const costEl = document.getElementById(`cost-${key}`);
        const qtyEl = document.getElementById(`qty-${key}`);
        if (costEl) {
            const effectiveQty = getEffectiveQty(key, shopMode, shopQty);
            if (shopMode === 'buy') {
                const cost = getGeneratorCostRange(key, 'buy', effectiveQty);
                costEl.innerText = `Comprar x${effectiveQty}: ${formatBigNumber(cost)} Chakra`;
            } else {
                const count = gameState.generators[key] || 0;
                const sellQty = Math.min(effectiveQty, count);
                const refund = getGeneratorCostRange(key, 'sell', sellQty);
                costEl.innerText = `Vender x${sellQty}: +${formatBigNumber(refund)} Chakra`;
            }
        }
        if (qtyEl) qtyEl.innerText = gameState.generators[key] || 0;

        const cardEl = document.querySelector(`.generator-card[onclick*="${key}"]`);
        if (cardEl) {
            let visible = true;
            if (i > 0) {
                const prevKey = genKeys[i - 1];
                visible = (gameState.generators[prevKey] || 0) > 0 || (gameState.total_chakra_earned && D(gameState.total_chakra_earned).gte(BASE_COSTS[key] * 0.3));
            }
            if (visible) cardEl.classList.remove('hidden');
            else cardEl.classList.add('hidden');
        }
    }

    // Upgrades UI
    for (let key in gameState.upgrades) {
        const el = document.getElementById(`upg-${key}`);
        if (el) {
            if (gameState.upgrades[key]) {
                el.classList.add('bought');
                el.classList.remove('hidden');
            } else {
                el.classList.remove('bought');
            }
        }
    }

    // Eight Inner Gates (8 Portões)
    const currentGates = gameState.gates_unlocked || 0;
    for (let i = 1; i <= 8; i++) {
        const el = document.getElementById(`gate-${i}`);
        if (el) {
            el.classList.toggle('unlocked', i <= currentGates);
            el.classList.toggle('active-release', gatesActiveTime > 0 && i <= currentGates);
        }
    }

    const gateBtn = document.getElementById('gate-upgrade-btn');
    const gateTitle = document.getElementById('gate-upgrade-title');
    const gateCost = document.getElementById('gate-upgrade-cost');
    if (gateBtn && gateTitle && gateCost) {
        if (currentGates >= 8) {
            gateTitle.innerText = "Todos os 8 Portões Abertos!";
            gateCost.innerText = "";
            gateBtn.disabled = true;
            gateBtn.innerText = "Força Máxima Desbloqueada 🌟";
        } else {
            const nextName = GATE_NAMES[currentGates];
            const nextCost = GATE_COSTS[currentGates];
            gateTitle.innerText = `Próximo: ${nextName}`;
            gateCost.innerText = `Custo: ${formatBigNumber(D(nextCost))} Chakra`;
            gateBtn.disabled = D(gameState.chakra).lt(nextCost);
            gateBtn.innerText = `Abrir ${nextName} 🔓`;
        }
    }

    const releaseBtn = document.getElementById('gate-release-btn');
    const timerLabel = document.getElementById('gate-timer-display');
    if (releaseBtn && timerLabel) {
        if (currentGates === 0) {
            releaseBtn.disabled = true;
            timerLabel.innerText = "Abra pelo menos o 1º portão";
        } else if (exhaustionTime > 0) {
            releaseBtn.disabled = true;
            timerLabel.innerText = `💀 Exausto: ${exhaustionTime.toFixed(1)}s`;
        } else if (gatesActiveTime > 0) {
            releaseBtn.disabled = true;
            timerLabel.innerText = `🔥 PORTÕES ATIVOS: ${gatesActiveTime.toFixed(1)}s`;
        } else if (gatesCooldown > 0) {
            releaseBtn.disabled = true;
            timerLabel.innerText = `⏳ Recarga: ${gatesCooldown.toFixed(1)}s`;
        } else {
            releaseBtn.disabled = false;
            timerLabel.innerText = `Liberar Força (+${(currentGates * 150)}% CPS)`;
        }
    }

    // Prestige UI
    const pendingPts = getPendingPrestigePoints();
    const pendEl = document.getElementById('prestige-pending-points');
    const pActionBtn = document.getElementById('prestige-action-btn');
    const pCounter = document.getElementById('prestige-points-counter');

    if (pendEl) pendEl.innerText = pendingPts.toLocaleString();
    if (pActionBtn) pActionBtn.disabled = (pendingPts <= 0);
    if (pCounter) pCounter.innerText = `Chakra Ancestral: ${(gameState.prestige_points || 0).toLocaleString()} Pontos`;
}

// --- SETUP CLICK ANIMATION & CANVAS FX ---
export function setupClickAnimation() {
    const btn = document.getElementById('click-btn');
    if (!btn) return;

    particles.setAuraAnchor(btn);
    fx.init('click-stage');

    btn.addEventListener('click', (e) => {
        sessionClicks++;
        gameState.clicks = (gameState.clicks || 0) + 1;

        let isCrit = Math.random() < calculatedCritChance;
        let clickVal = calculatedClickPower;
        if (isCrit) {
            clickVal = clickVal.mul(calculatedCritMult);
            sound.playCrit();
            fx.triggerStageShake();
        } else {
            sound.playClick();
        }

        gameState.chakra = D(gameState.chakra).add(clickVal);
        gameState.total_chakra_earned = D(gameState.total_chakra_earned).add(clickVal);

        const rect = btn.getBoundingClientRect();
        const x = e.clientX || (rect.left + rect.width / 2);
        const y = e.clientY || (rect.top + rect.height / 2);

        // Dinâmica Cinética: Onda de choque radial e balística parabólica
        fx.spawnRadialShockwave(x, y, isCrit);
        fx.spawnParabolicNumber(x, y, `+${formatBigNumber(clickVal)}`, isCrit);
        particles.spawnBurst(x, y, isCrit ? 22 : 12, isCrit ? "crit" : "chakra");

        updateDOM();
    });
}

// Bridge for Clan Tree
window.chakraGameBuyClanNode = (nodeId) => {
    buyClanNode(nodeId, gameState, saveGame, updateDOM);
    recalculateStats();
    updateDOM();
};

window.chakraGauntletAttack = () => {
    gauntletManager.attackManual(calculatedClickPower);
};

window.chakraGameUpdateRankings = () => {
    rankingsManager.renderUI(gameState, sessionClicks);
};

// --- GATES HANDLERS ---
export function buyGate() {
    const currentGates = gameState.gates_unlocked || 0;
    if (currentGates >= 8) return;
    const cost = GATE_COSTS[currentGates];
    if (D(gameState.chakra).gte(cost)) {
        gameState.chakra = D(gameState.chakra).sub(cost);
        gameState.gates_unlocked = currentGates + 1;
        sound.playLevelUp();
        recalculateStats();
        updateDOM();
        saveGame();
    } else {
        sound.playAlert();
        alert("Chakra insuficiente para abrir este portão!");
    }
}
window.buyGate = buyGate;

export function triggerGateRelease() {
    const currentGates = gameState.gates_unlocked || 0;
    if (currentGates === 0) return;
    if (gatesActiveTime > 0 || gatesCooldown > 0 || exhaustionTime > 0) return;

    gatesActiveTime = 20.0;
    gatesCooldown = 60.0;
    sound.playJutsu();
    recalculateStats();
    updateDOM();
    saveGame();
}
window.triggerGateRelease = triggerGateRelease;

// --- STATE PERSISTENCE (SERIALIZATION / DESERIALIZATION) ---
export function serializeState(state) {
    const serialized = JSON.parse(JSON.stringify(state));
    serialized.chakra = D(state.chakra).toString();
    serialized.total_chakra_earned = D(state.total_chakra_earned).toString();
    serialized.peak_cps = D(state.peak_cps || 0).toString();
    return serialized;
}

export function deserializeState(raw) {
    if (!raw) return;
    for (let key in raw) {
        if (key === 'chakra' || key === 'total_chakra_earned' || key === 'peak_cps') {
            gameState[key] = D(raw[key] || 0);
        } else if (typeof raw[key] === 'object' && raw[key] !== null) {
            if (!gameState[key]) gameState[key] = {};
            Object.assign(gameState[key], raw[key]);
        } else {
            gameState[key] = raw[key];
        }
    }
}

export function saveGame() {
    if (!currentUsername) return;
    const payload = serializeState(gameState);

    // Save locally
    try {
        localStorage.setItem(`chakra_save_${currentUsername}`, JSON.stringify(payload));
    } catch (_) {}

    // Save to Flask API if reachable
    fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername, state: payload })
    }).catch(() => {
        // Local-only mode fallback
    });
}

export function loadGame() {
    // Attempt local load first for zero-latency start
    try {
        const localSave = localStorage.getItem(`chakra_save_${currentUsername}`);
        if (localSave) {
            deserializeState(JSON.parse(localSave));
        }
    } catch (_) {}

    // Synchronize with Flask API if available
    fetch(`/api/load?username=${currentUsername}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.state) {
                deserializeState(data.state);
                if (data.offline_seconds > 5 && data.offline_chakra > 0) {
                    const offChakra = D(data.offline_chakra);
                    gameState.chakra = D(gameState.chakra).add(offChakra);
                    gameState.total_chakra_earned = D(gameState.total_chakra_earned).add(offChakra);
                    alert(`⏱️ TREINAMENTO OFFLINE:\nVocê esteve fora por ${Math.floor(data.offline_seconds)} segundos.\nSeus ninjas geraram: +${formatBigNumber(offChakra)} Chakra!`);
                }
            }
            recalculateStats();
            updateDOM();
        })
        .catch(() => {
            recalculateStats();
            updateDOM();
        });

    recalculateStats();
    updateDOM();
}

// --- DECOUPLED GAME LOOP (rAF + DELTA TIME ACCUMULATOR) ---
let lastTime = performance.now();
let accumulator = 0;
const TICK_RATE = 1000 / 20; // 50ms = 20 logical ticks per second

function updateGameState(dt) {
    if (!currentUsername) return;

    // Active Timers
    if (gatesActiveTime > 0) {
        gatesActiveTime -= dt;
        if (gatesActiveTime <= 0) {
            gatesActiveTime = 0;
            if (gameState.gates_unlocked === 8) {
                gameState.chakra = D(0); // Colapso do 8º Portão
                exhaustionTime = 10.0;
                alert("🔴 PORTÃO DA MORTE: Colapso corporal! Chakra zerado e 10s de exaustão.");
            } else {
                alert("Os Portões Internos se fecharam.");
            }
            recalculateStats();
        }
    }

    if (gatesCooldown > 0) {
        gatesCooldown = Math.max(0, gatesCooldown - dt);
    }

    if (exhaustionTime > 0) {
        exhaustionTime = Math.max(0, exhaustionTime - dt);
        if (exhaustionTime === 0) {
            alert("Você se recuperou da exaustão.");
            recalculateStats();
        }
    }

    if (trainingBuffTimer > 0) {
        trainingBuffTimer = Math.max(0, trainingBuffTimer - dt);
        if (trainingBuffTimer === 0) recalculateStats();
    }

    if (gameState.crit_buff_timer > 0) {
        gameState.crit_buff_timer = Math.max(0, gameState.crit_buff_timer - dt);
    }

    if (gameState.presence_buff_timer > 0) {
        gameState.presence_buff_timer = Math.max(0, gameState.presence_buff_timer - dt);
    }

    // Passive Chakra Generation
    if (calculatedCps.gt(0)) {
        const deltaChakra = calculatedCps.mul(dt);
        gameState.chakra = D(gameState.chakra).add(deltaChakra);
        gameState.total_chakra_earned = D(gameState.total_chakra_earned).add(deltaChakra);
    }

    // Subsystem ticks
    presenceRewardManager.tick(dt);
    gauntletManager.tick(dt, calculatedCps);
    updateMissionsProgress();
}

function gameLoop(currentTime) {
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    accumulator += Math.min(deltaTime, 1000); // Prevent spiral of death

    while (accumulator >= TICK_RATE) {
        updateGameState(TICK_RATE / 1000);
        accumulator -= TICK_RATE;
    }

    particles.updateAndRender(deltaTime / 1000);
    updateDOM();
    requestAnimationFrame(gameLoop);
}

// Autosave every 10 seconds
setInterval(() => {
    if (currentUsername) saveGame();
}, 10000);

export function logout() {
    localStorage.removeItem('username');
    window.location.href = "login.html";
}
window.logout = logout;

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    let user = localStorage.getItem('username');
    if (!user) {
        user = 'Shinobi';
        localStorage.setItem('username', user);
    }
    setUsername(user);
    const displayEl = document.getElementById('display-username');
    if (displayEl) displayEl.innerText = user;

    particles.init('fx-canvas');
    loadGame();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeUI(true);
    } else {
        updateThemeUI(false);
    }

    setupClickAnimation();

    // Initialize Subsystems
    chuninExamManager.init(gameState, saveGame, updateDOM);
    gauntletManager.init(gameState, saveGame, updateDOM);
    switchTab('gauntlet');

    // Start decoupled rAF Game Loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});

// Hooks for HTML
window.startMission = startMission;
window.speedUpMission = speedUpMission;
window.claimMission = claimMission;
window.handleMissionClick = handleMissionClick;
window.performPrestige = performPrestige;
window.buyPrestigeUpgrade = buyPrestigeUpgrade;
window.rollGacha = rollGacha;
window.equipSword = equipSword;
window.startParryGame = startParryGame;
window.triggerParry = triggerParry;
window.switchTrainingGame = switchTrainingGame;
window.startJutsuGame = startJutsuGame;
window.startBalanceGame = startBalanceGame;
window.balanceClick = balanceClick;
window.toggleMute = () => {
    const isMuted = sound.toggleMute();
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.innerText = isMuted ? "🔇 Som: Desligado" : "🔊 Som: Ligado";
};
window.openChuninExam = () => {
    chuninExamManager.openExamModal();
};
window.closeChuninExam = () => {
    chuninExamManager.closeExamModal();
};
