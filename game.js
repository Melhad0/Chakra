import { startMission, speedUpMission, claimMission, updateMissionsProgress, handleMissionClick, startParryGame, triggerParry, switchTrainingGame, startJutsuGame, startBalanceGame, balanceClick } from './missions.js';
import { performPrestige, buyPrestigeUpgrade, getPendingPrestigePoints } from './prestige.js';
import { rollGacha, equipSword } from './gacha.js';

// Configuration constants
export const BASE_COSTS = {
    shadow_clone: 15,
    genin: 100,
    chunin: 500,
    jonin: 3000,
    anbu: 10000,
    sannin: 50000,
    kage: 1000000,
    jinchuriki: 10000000,
    rikudou: 100000000
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
    
    // Campanha Naruto Clássico
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
    kiba: { name: "Presas Kiba", icon: "⚡", desc: "As Lâmina de Trovão. Cliques têm 15% de chance de Crítico (5x)." }
};

// State variables
export let currentUsername = "";
export let authMode = "login";

export function setUsername(val) { currentUsername = val; }
export function setAuthMode(val) { authMode = val; }

export let gameState = {
    chakra: 0.0,
    total_chakra_earned: 0.0,
    clicks: 0,
    prestige_points: 0,
    total_prestige_points: 0,
    prestige_upgrades: {
        clan_heritage: false,
        forbidden_scroll: false,
        tailed_chakra_beast: false,
        ancestral_voice: false
    },
    generators: {
        shadow_clone: 0,
        genin: 0,
        chunin: 0,
        jonin: 0,
        anbu: 0,
        sannin: 0,
        kage: 0,
        jinchuriki: 0,
        rikudou: 0
    },
    upgrades: {
        bandana_genin: false,
        ninja_food_pill: false,
        sharingan: false,
        sage_mode: false,
        kyuubi_cloak: false,
        summoning_scroll: false,
        choku_tomoe: false,
        gravity_training: false,
        reaper_seal: false,
        kurama_mode: false
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
    equipped_sword: ""
};

export let calculatedCps = 0.0;
export let calculatedClickPower = 1.0;
export let shopMode = 'buy';
export let shopQty = 1;

export let gatesActiveTime = 0.0;
export let gatesCooldown = 0.0;
export let exhaustionTime = 0.0;
export let trainingBuffTimer = 0.0;

let lastRenderedSwordsState = "";
let lastRenderedBijuuState = "";
let lastRenderedBuffsState = "";

// Theme controls
export function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeUI(isLight);
}

function updateThemeUI(isLight) {
    document.getElementById('theme-icon').innerText = isLight ? '☀️' : '🌙';
    document.getElementById('theme-text').innerText = isLight ? 'Tema Claro' : 'Tema Escuro';
}

// Navigation Tabs
export function switchTab(tabId) {
    const tabs = ['upgrades', 'missions', 'bijuu', 'prestige', 'gacha'];
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            tabs.forEach(t => {
                document.getElementById(`tab-btn-${t}`).classList.toggle('active', t === tabId);
                document.getElementById(`tab-content-${t}`).classList.toggle('hidden', t !== tabId);
            });
        });
    } else {
        tabs.forEach(t => {
            document.getElementById(`tab-btn-${t}`).classList.toggle('active', t === tabId);
            document.getElementById(`tab-content-${t}`).classList.toggle('hidden', t !== tabId);
        });
    }
}

// Shop controls
export function setShopMode(mode) {
    shopMode = mode;
    document.getElementById('btn-mode-buy').classList.toggle('active', mode === 'buy');
    document.getElementById('btn-mode-sell').classList.toggle('active', mode === 'sell');
    updateDOM();
}

export function setShopQty(qty) {
    shopQty = qty;
    document.getElementById('btn-qty-1').classList.toggle('active', qty === 1);
    document.getElementById('btn-qty-10').classList.toggle('active', qty === 10);
    document.getElementById('btn-qty-100').classList.toggle('active', qty === 100);
    updateDOM();
}

export function getGeneratorCostRange(key, mode, qty) {
    const count = gameState.generators[key] || 0;
    const base = BASE_COSTS[key];
    const multiplier = 1.25;
    
    if (mode === 'buy') {
        let totalCost = 0;
        for (let i = 0; i < qty; i++) {
            totalCost += Math.floor(base * Math.pow(multiplier, count + i));
        }
        return totalCost;
    } else {
        const sellQty = Math.min(qty, count);
        if (sellQty <= 0) return 0;
        let totalCostVal = 0;
        for (let i = 0; i < sellQty; i++) {
            totalCostVal += Math.floor(base * Math.pow(multiplier, count - 1 - i));
        }
        return Math.floor(totalCostVal * 0.8);
    }
}

export function buyGenerator(key) {
    const count = gameState.generators[key] || 0;
    if (shopMode === 'buy') {
        const cost = getGeneratorCostRange(key, 'buy', shopQty);
        if (gameState.chakra >= cost) {
            gameState.chakra -= cost;
            gameState.generators[key] = count + shopQty;
            recalculateStats();
            updateDOM();
            saveGame();
        }
    } else {
        const sellQty = Math.min(shopQty, count);
        if (sellQty > 0) {
            const refund = getGeneratorCostRange(key, 'sell', shopQty);
            gameState.chakra += refund;
            gameState.generators[key] = count - sellQty;
            recalculateStats();
            updateDOM();
            saveGame();
        }
    }
}

export function buyUpgrade(key, cost) {
    if (!gameState.upgrades[key] && gameState.chakra >= cost) {
        gameState.chakra -= cost;
        gameState.upgrades[key] = true;
        recalculateStats();
        updateDOM();
        saveGame();
    }
}

export function recalculateStats() {
    const baseCpsMap = {
        shadow_clone: 1.0,
        genin: 5.0,
        chunin: 25.0,
        jonin: 100.0,
        anbu: 400.0,
        sannin: 2000.0,
        kage: 10000.0,
        jinchuriki: 50000.0,
        rikudou: 300000.0
    };

    let cps = 0.0;
    for (let key in gameState.generators) {
        let base = baseCpsMap[key] || 0;
        let count = gameState.generators[key] || 0;
        let mult = 1.0;
        if (key === 'shadow_clone' && gameState.upgrades.ninja_food_pill) {
            mult *= 2.0;
        }
        if ((key === 'genin' || key === 'chunin') && gameState.upgrades.gravity_training) {
            mult *= 2.0;
        }
        if (key === 'jonin' || key === 'anbu') {
            if (gameState.upgrades.sharingan) mult *= 2.0;
            if (gameState.upgrades.choku_tomoe) mult *= 2.0;
        }
        if ((key === 'sannin' || key === 'kage' || key === 'jinchuriki' || key === 'rikudou') && gameState.upgrades.summoning_scroll) {
            mult *= 2.0;
        }
        cps += count * base * mult;
    }

    if (gameState.upgrades.sage_mode) cps *= 3.0;
    if (gameState.upgrades.kurama_mode) cps *= 4.0;
    
    if (gameState.prestige_upgrades.forbidden_scroll) cps *= 1.25;

    const equipped = gameState.equipped_sword || "";
    const swordLvl = (gameState.swords_levels && gameState.swords_levels[equipped]) || 1;
    const swordMultVal = 1.0 + (swordLvl - 1) * 0.25;

    if (equipped === 'samehada') cps *= (1.0 + 0.10 * swordMultVal);
    if (equipped === 'totsuka') cps *= (1.0 + 0.20 * swordMultVal);

    let clickPower = 1.0;
    if (gameState.upgrades.bandana_genin) clickPower *= 1.5; // nerfed from 2.0
    if (gameState.upgrades.kyuubi_cloak) clickPower += 0.005 * cps; // nerfed from 0.01
    if (gameState.upgrades.reaper_seal) clickPower += 0.02 * cps; // nerfed from 0.05
    
    if (gameState.prestige_upgrades.clan_heritage) clickPower *= 1.25; // nerfed from 1.5
    if (gameState.prestige_upgrades.tailed_chakra_beast) clickPower += 0.01 * cps; // nerfed from 0.02
    
    if (equipped === 'kubikiribocho') clickPower += 0.01 * cps * swordMultVal;
    if (equipped === 'kusanagi') clickPower *= (1.0 + 0.5 * swordMultVal);

    // Bijuu multiplier
    if (gameState.bijuu && gameState.bijuu.chosen) {
        const multipliers = [1.0, 1.0, 1.5, 2.5, 5.0, 10.0];
        const multVal = multipliers[Math.min(gameState.bijuu.level, multipliers.length - 1)] || 1.0;
        cps *= multVal;
        clickPower *= multVal;
    }

    // Eight Inner Gates passive
    const gatesUnl = gameState.gates_unlocked || 0;
    if (gatesUnl > 0) {
        const gatesPassive = 1.0 + gatesUnl * 0.10;
        cps *= gatesPassive;
        clickPower *= gatesPassive;
    }

    // Eight Inner Gates release active
    if (gatesActiveTime > 0 && gatesUnl > 0) {
        const activeMult = 1.0 + gatesUnl * 1.5;
        cps *= activeMult;
        clickPower *= activeMult;
    }

    // Active training buff (+50% CPS)
    if (trainingBuffTimer > 0) {
        cps *= 1.5;
    }

    // Exhaustion debuff (0 CPS)
    if (exhaustionTime > 0) {
        cps = 0;
    }

    calculatedCps = cps;
    calculatedClickPower = clickPower;
}

export function updateDOM() {
    document.getElementById('chakra-counter').innerText = Math.floor(gameState.chakra).toLocaleString();
    document.getElementById('cps-counter').innerText = calculatedCps.toFixed(1) + ' CPS';
    document.getElementById('click-power-display').innerText = 'Clique: +' + calculatedClickPower.toFixed(1);
    document.getElementById('total-clicks').innerText = gameState.clicks;
    document.getElementById('total-earned').innerText = Math.floor(gameState.total_chakra_earned).toLocaleString();

    const pendingPts = getPendingPrestigePoints();
    document.getElementById('prestige-pending-points').innerText = pendingPts;
    document.getElementById('prestige-action-btn').disabled = (pendingPts <= 0);
    document.getElementById('prestige-points-counter').innerText = `Chakra Ancestral: ${gameState.prestige_points} Pontos`;
    
    const prestMultDisplay = document.getElementById('prestige-multiplier-display');
    if (gameState.total_prestige_points > 0) {
        prestMultDisplay.innerText = `Renascido x${gameState.total_prestige_points}`;
    } else {
        prestMultDisplay.innerText = "";
    }

    for (let key in gameState.prestige_upgrades) {
        const card = document.getElementById(`pu-${key}`);
        if (card) {
            card.classList.toggle('purchased', gameState.prestige_upgrades[key]);
        }
    }

    for (let key in BASE_COSTS) {
        const costEl = document.getElementById(`cost-${key}`);
        const qtyEl = document.getElementById(`qty-${key}`);
        if (costEl) {
            if (shopMode === 'buy') {
                const cost = getGeneratorCostRange(key, 'buy', shopQty);
                costEl.innerText = `Comprar x${shopQty}: ${cost.toLocaleString()} Chakra`;
            } else {
                const count = gameState.generators[key] || 0;
                const sellQty = Math.min(shopQty, count);
                const refund = getGeneratorCostRange(key, 'sell', shopQty);
                costEl.innerText = `Vender x${sellQty}: +${refund.toLocaleString()} Chakra`;
            }
        }
        if (qtyEl) qtyEl.innerText = gameState.generators[key];
    }

    for (let key in gameState.upgrades) {
        const btn = document.getElementById(`up-${key}`);
        if (btn) {
            if (gameState.upgrades[key]) {
                btn.classList.add('purchased');
                btn.disabled = true;
            } else {
                btn.classList.remove('purchased');
                btn.disabled = false;
            }
        }
    }

    for (let key in gameState.achievements) {
        const achEl = document.getElementById(`ach-${key}`);
        if (achEl) {
            achEl.classList.toggle('locked', !gameState.achievements[key]);
            achEl.classList.toggle('unlocked', gameState.achievements[key]);
        }
    }

    const rollBtn = document.getElementById('gacha-roll-btn');
    if (rollBtn) {
        const unobtained = [];
        for (let key in gameState.swords) {
            if (!gameState.swords[key]) {
                unobtained.push(key);
            }
        }
        if (unobtained.length === 0) {
            rollBtn.disabled = true;
            rollBtn.innerText = "Todas as Espadas Forjadas!";
        } else {
            rollBtn.disabled = gameState.chakra < 50000;
            rollBtn.innerText = "Forjar Espada (50k Chakra)";
        }
    }

    const listEl = document.getElementById('swords-list');
    if (listEl) {
        const stateSignature = JSON.stringify({
            swords: gameState.swords,
            swords_levels: gameState.swords_levels,
            equipped: gameState.equipped_sword
        });
        
        if (lastRenderedSwordsState !== stateSignature) {
            lastRenderedSwordsState = stateSignature;
            listEl.innerHTML = "";
            for (let key in SWORDS_INFO) {
                const info = SWORDS_INFO[key];
                const hasIt = gameState.swords && gameState.swords[key];
                const isEquipped = gameState.equipped_sword === key;
                
                const card = document.createElement('div');
                card.className = `sword-item-card ${hasIt ? '' : 'locked'} ${isEquipped ? 'equipped' : ''}`;
                
                const lvl = (gameState.swords_levels && gameState.swords_levels[key]) || 1;
                const descText = hasIt ? getDynamicSwordDesc(key, lvl) : info.desc;
                
                let buttonHtml = "";
                if (hasIt) {
                    const cost = Math.floor(25000 * Math.pow(2.2, lvl - 1));
                    const costStr = cost >= 1000000 ? `${(cost / 1000000).toFixed(1)}M` : `${(cost / 1000).toFixed(0)}k`;
                    
                    const equipBtn = isEquipped 
                        ? `<button class="sword-equip-btn equipped" disabled>Empunhada</button>`
                        : `<button class="sword-equip-btn" onclick="equipSword('${key}')">Empunhar</button>`;
                    
                    buttonHtml = `
                        <div class="sword-actions-container">
                            <div class="sword-level-tag" style="font-size: 0.8rem; color: var(--accent-color); font-weight: 800; margin-bottom: 0.25rem;">Nível ${lvl}</div>
                            <div class="sword-buttons-row">
                                ${equipBtn}
                                <button class="sword-upgrade-btn" onclick="upgradeSword('${key}', ${cost})">Refinar (${costStr})</button>
                            </div>
                        </div>
                    `;
                } else {
                    buttonHtml = `
                        <div class="sword-actions-container">
                            <span style="font-size: 0.8rem; color: var(--text-muted);">Bloqueada</span>
                        </div>
                    `;
                }
                
                card.innerHTML = `
                    <div class="sword-icon">${info.icon}</div>
                    <div class="sword-details" style="width: 100%;">
                        <span class="sword-name">${info.name}</span>
                        <span class="sword-bonus">${descText}</span>
                        ${buttonHtml}
                    </div>
                `;
                listEl.appendChild(card);
            }
        }
    }
    
    // Bijuu rendering
    const bijuuSelector = document.getElementById('bijuu-selector-screen');
    const bijuuActive = document.getElementById('bijuu-active-screen');
    
    if (bijuuSelector && bijuuActive) {
        const level = (gameState.bijuu && gameState.bijuu.level) || 1;
        const goals = getBijuuGoals(level);
        const bijuuStateSig = JSON.stringify({
            chosen: (gameState.bijuu && gameState.bijuu.chosen) || "",
            level: level,
            goals_met: goals.map(g => g.check())
        });
        
        if (lastRenderedBijuuState !== bijuuStateSig) {
            lastRenderedBijuuState = bijuuStateSig;
            if (!gameState.bijuu || !gameState.bijuu.chosen) {
                bijuuSelector.classList.remove('hidden');
                bijuuActive.classList.add('hidden');
            } else {
                bijuuSelector.classList.add('hidden');
                bijuuActive.classList.remove('hidden');
                
                const bijuuId = gameState.bijuu.chosen;
                const bijuuInfo = BIJUUS[bijuuId];
                
                document.getElementById('bijuu-avatar-display').innerText = bijuuInfo.avatar;
                document.getElementById('bijuu-name-display').innerText = bijuuInfo.name;
                document.getElementById('bijuu-stage-display').innerText = BIJUU_STAGES[level] || `Estágio ${level}`;
                
                const multipliers = [1.0, 1.0, 1.5, 2.5, 5.0, 10.0];
                const multVal = multipliers[Math.min(level, multipliers.length - 1)] || 1.0;
                document.getElementById('bijuu-mult-display').innerText = `${multVal}x (CPS & Cliques)`;
                
                const nextLvl = level + 1;
                const nextLvlEl = document.getElementById('bijuu-next-level-display');
                const evolveBtn = document.getElementById('bijuu-evolve-btn');
                
                if (nextLvl > 5) {
                    if (nextLvlEl) nextLvlEl.innerText = "Máximo";
                    if (evolveBtn) {
                        evolveBtn.disabled = true;
                        evolveBtn.innerText = "Nível Máximo Alcançado!";
                    }
                    const goalsList = document.getElementById('bijuu-goals-list');
                    if (goalsList) goalsList.innerHTML = `<li style="color: var(--secondary-color); font-weight: bold;">Sua Bijuu atingiu o ápice do seu poder!</li>`;
                } else {
                    if (nextLvlEl) nextLvlEl.innerText = nextLvl;
                    
                    const goalsList = document.getElementById('bijuu-goals-list');
                    if (goalsList) {
                        goalsList.innerHTML = "";
                        let allMet = true;
                        goals.forEach(goal => {
                            const met = goal.check();
                            if (!met) allMet = false;
                            
                            const li = document.createElement('li');
                            li.className = met ? "goal-met" : "goal-pending";
                            li.innerHTML = `${met ? "✅" : "❌"} ${goal.desc}`;
                            goalsList.appendChild(li);
                        });
                        
                        if (evolveBtn) {
                            evolveBtn.disabled = !allMet;
                            evolveBtn.innerText = allMet ? "Evoluir Bijuu! ⚡" : "Objetivos Pendentes";
                        }
                    }
                }
            }
        }
    }

    // Eight Inner Gates rendering
    const currentGates = gameState.gates_unlocked || 0;
    for (let i = 1; i <= 8; i++) {
        const el = document.getElementById(`gate-${i}`);
        if (el) {
            el.className = `gate-node ${i <= currentGates ? 'unlocked' : 'locked'}`;
            if (gatesActiveTime > 0 && i <= currentGates) {
                el.classList.add('active-release');
            }
        }
    }
    
    const gateBtn = document.getElementById('gate-upgrade-btn');
    const gateTitle = document.getElementById('gate-upgrade-title');
    const gateCost = document.getElementById('gate-upgrade-cost');
    
    if (gateBtn && gateTitle && gateCost) {
        if (currentGates >= 8) {
            gateTitle.innerText = "Todos os Portões Abertos!";
            gateCost.innerText = "";
            gateBtn.disabled = true;
            gateBtn.innerText = "Força Máxima Desbloqueada";
        } else {
            const nextName = GATE_NAMES[currentGates];
            const nextCost = GATE_COSTS[currentGates];
            gateTitle.innerText = `Próximo Portão: ${nextName}`;
            gateCost.innerText = `Custo: ${nextCost.toLocaleString()} Chakra`;
            gateBtn.disabled = gameState.chakra < nextCost;
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
            timerLabel.innerText = `Pronto! Multiplicador: +${(currentGates * 150)}%`;
        }
    }

    // Active buffs list rendering
    const buffsContainer = document.getElementById('active-buffs-container');
    if (buffsContainer) {
        const buffsSig = `${Math.ceil(gatesActiveTime)}-${Math.ceil(exhaustionTime)}-${Math.ceil(trainingBuffTimer)}`;
        if (lastRenderedBuffsState !== buffsSig) {
            lastRenderedBuffsState = buffsSig;
            buffsContainer.innerHTML = "";
            
            if (gatesActiveTime > 0) {
                const div = document.createElement('div');
                div.className = 'buff-badge red-pulse';
                div.innerHTML = `🔴 8 Portões: +${((gameState.gates_unlocked || 0) * 150)}% (${gatesActiveTime.toFixed(0)}s)`;
                buffsContainer.appendChild(div);
            }
            
            if (exhaustionTime > 0) {
                const div = document.createElement('div');
                div.className = 'buff-badge black-exhaustion';
                div.innerHTML = `💀 Exaustão: 0 CPS (${exhaustionTime.toFixed(0)}s)`;
                buffsContainer.appendChild(div);
            }
            
            if (trainingBuffTimer > 0) {
                const div = document.createElement('div');
                div.className = 'buff-badge green-pulse';
                div.innerHTML = `🔥 Treino de Chakra: +50% CPS (${trainingBuffTimer.toFixed(0)}s)`;
                buffsContainer.appendChild(div);
            }
        }
    }

    const clicksVal = gameState.clicks || 0;
    const tabJutsu = document.getElementById('train-tab-jutsu');
    const tabChakra = document.getElementById('train-tab-chakra');
    if (tabJutsu) {
        if (clicksVal < 100) {
            tabJutsu.classList.add('tab-locked');
            tabJutsu.innerHTML = "🔒 Sequência de Jutsu (100)";
        } else {
            tabJutsu.classList.remove('tab-locked');
            tabJutsu.innerHTML = "🔥 Sequência de Jutsu";
        }
    }
    if (tabChakra) {
        if (clicksVal < 300) {
            tabChakra.classList.add('tab-locked');
            tabChakra.innerHTML = "🔒 Controle de Chakra (300)";
        } else {
            tabChakra.classList.remove('tab-locked');
            tabChakra.innerHTML = "☯️ Controle de Chakra";
        }
    }
}export function loadGame() {
    fetch(`/api/load?username=${currentUsername}`)
        .then(res => res.json())
        .then(data => {
            gameState = data.state;
            calculatedCps = data.cps;
            calculatedClickPower = data.click_power;
            
            updateDOM();

            if (data.offline_seconds > 5 && data.offline_chakra > 0) {
                document.getElementById('offline-time-val').innerText = Math.floor(data.offline_seconds);
                document.getElementById('offline-chakra-val').innerText = Math.floor(data.offline_chakra).toLocaleString();
                document.getElementById('offline-modal').classList.remove('hidden');
            }
        })
        .catch(err => console.error("Erro ao carregar save:", err));
}

export function saveGame() {
    fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername, state: gameState })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            gameState.achievements = data.state.achievements;
            gameState.last_saved_time = data.state.last_saved_time;
            calculatedCps = data.cps;
            calculatedClickPower = data.click_power;
            updateDOM();
            
            if (data.new_achievements && data.new_achievements.length > 0) {
                data.new_achievements.forEach(key => {
                    const achEl = document.getElementById(`ach-${key}`);
                    if (achEl) {
                        achEl.classList.add('just-unlocked');
                        setTimeout(() => achEl.classList.remove('just-unlocked'), 2500);
                    }
                });
            }
        }
    })
    .catch(err => console.error("Erro ao salvar progresso:", err));
}

function setupClickAnimation() {
    const btn = document.getElementById('click-btn');
    if (!btn) return;
    
    btn.addEventListener('click', (e) => {
        if (!currentUsername) return;
        
        let clickPowerVal = calculatedClickPower;
        let isCrit = false;
        if (gameState.equipped_sword === 'kiba') {
            const lvl = (gameState.swords_levels && gameState.swords_levels.kiba) || 1;
            const mult = 1.0 + (lvl - 1) * 0.25;
            if (Math.random() < Math.min(0.5, 0.15 * mult)) {
                clickPowerVal *= (5 * mult);
                isCrit = true;
            }
        }
        
        gameState.chakra += clickPowerVal;
        gameState.total_chakra_earned += clickPowerVal;
        gameState.clicks += 1;
        
        if (gameState.clicks % 10 === 0) {
            saveGame();
        }

        updateDOM();
        
        // Click shockwave ring animation
        const shockwave = document.createElement('div');
        shockwave.className = 'click-shockwave';
        btn.appendChild(shockwave);
        setTimeout(() => shockwave.remove(), 600);

        const rect = btn.getBoundingClientRect();
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        if (isCrit) {
            particle.innerText = `⚡ CRÍTICO! +${clickPowerVal.toFixed(1)}`;
            particle.style.color = '#ffd700';
            particle.style.fontSize = '1.75rem';
            particle.style.textShadow = '0 0 10px #ffaa00';
        } else {
            particle.innerText = `+${clickPowerVal.toFixed(1)}`;
        }
        
        const x = e.clientX || (rect.left + rect.width / 2);
        const y = e.clientY || (rect.top + rect.height / 2);
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    });
}

export function buyGate() {
    const currentGates = gameState.gates_unlocked || 0;
    if (currentGates >= 8) return;
    const cost = GATE_COSTS[currentGates];
    if (gameState.chakra >= cost) {
        gameState.chakra -= cost;
        gameState.gates_unlocked = currentGates + 1;
        recalculateStats();
        updateDOM();
        saveGame();
    } else {
        alert("Chakra insuficiente para abrir este portão!");
    }
}

export function triggerGateRelease() {
    const currentGates = gameState.gates_unlocked || 0;
    if (currentGates === 0) return;
    if (gatesActiveTime > 0 || gatesCooldown > 0 || exhaustionTime > 0) return;

    gatesActiveTime = 20.0;
    gatesCooldown = 60.0;
    
    recalculateStats();
    updateDOM();
    saveGame();
}

export function closeModal() {
    document.getElementById('offline-modal').classList.add('hidden');
}

// Bind to window for inline onclick hooks in HTML
// Bind to window for inline onclick hooks in HTML
window.startMission = startMission;
window.speedUpMission = speedUpMission;
window.claimMission = claimMission;
window.handleMissionClick = handleMissionClick;
window.performPrestige = performPrestige;
window.buyPrestigeUpgrade = buyPrestigeUpgrade;
window.rollGacha = rollGacha;
window.equipSword = equipSword;
window.toggleTheme = toggleTheme;
window.switchTab = switchTab;
window.buyGenerator = buyGenerator;
window.buyUpgrade = buyUpgrade;
window.setShopMode = setShopMode;
window.setShopQty = setShopQty;
window.closeModal = closeModal;
window.startParryGame = startParryGame;
window.triggerParry = triggerParry;
window.selectBijuu = selectBijuu;
window.evolveBijuu = evolveBijuu;
window.upgradeSword = upgradeSword;
window.setTrainingBuff = setTrainingBuff;
window.switchTrainingGame = switchTrainingGame;
window.startJutsuGame = startJutsuGame;
window.startBalanceGame = startBalanceGame;
window.balanceClick = balanceClick;
window.buyGate = buyGate;
window.triggerGateRelease = triggerGateRelease;

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

export function getBijuuGoals(level) {
    if (level === 1) {
        return [
            { id: "chakra_10k", desc: "Acumular 10.000 Chakra total", check: () => gameState.total_chakra_earned >= 10000 },
            { id: "clicks_100", desc: "Realizar 100 Cliques manuais", check: () => gameState.clicks >= 100 }
        ];
    } else if (level === 2) {
        return [
            { id: "chakra_500k", desc: "Acumular 500.000 Chakra total", check: () => gameState.total_chakra_earned >= 500000 },
            { id: "chunins_5", desc: "Ter pelo menos 5 Chunins aliados", check: () => (gameState.generators.chunin || 0) >= 5 }
        ];
    } else if (level === 3) {
        return [
            { id: "chakra_10m", desc: "Acumular 10.000.000 Chakra total", check: () => gameState.total_chakra_earned >= 10000000 },
            { id: "swords_1", desc: "Ter pelo menos 1 Espada Lendária", check: () => Object.values(gameState.swords).some(x => x === true) }
        ];
    } else if (level === 4) {
        return [
            { id: "chakra_100m", desc: "Acumular 100.000.000 Chakra total", check: () => gameState.total_chakra_earned >= 100000000 },
            { id: "final_valley", desc: "Concluir a batalha do Vale do Fim", check: () => gameState.missions.camp_final_valley && gameState.missions.camp_final_valley.completed }
        ];
    }
    return [];
}

export function selectBijuu(id) {
    if (gameState.bijuu && gameState.bijuu.chosen) return;
    if (!gameState.bijuu) {
        gameState.bijuu = { chosen: "", level: 1, completed_goals: [] };
    }
    gameState.bijuu.chosen = id;
    gameState.bijuu.level = 1;
    gameState.bijuu.completed_goals = [];
    
    recalculateStats();
    updateDOM();
    saveGame();
}

export function evolveBijuu() {
    if (!gameState.bijuu || !gameState.bijuu.chosen) return;
    const goals = getBijuuGoals(gameState.bijuu.level);
    const allMet = goals.every(g => g.check());
    
    if (!allMet) {
        alert("Você ainda não atendeu todos os objetivos para evoluir sua Bijuu!");
        return;
    }
    
    gameState.bijuu.level += 1;
    alert(`Sua Bijuu evoluiu para o ${BIJUU_STAGES[gameState.bijuu.level]}!`);
    
    recalculateStats();
    updateDOM();
    saveGame();
}

export function getDynamicSwordDesc(key, lvl) {
    const mult = 1.0 + (lvl - 1) * 0.25;
    const descs = {
        kubikiribocho: `A Lâmina Decapitadora. Cliques ganham +${(2 * mult).toFixed(1)}% do seu CPS global.`,
        samehada: `A Pele de Tubarão. Aliados ficam +${(10 * mult).toFixed(1)}% mais eficientes.`,
        kusanagi: `A Espada de Sasuke. Multiplica o poder do seu clique manual em ${(1.0 + 0.5 * mult).toFixed(2)}x.`,
        totsuka: `A Lâmina de Itachi. Multiplica o seu CPS global em ${(1.0 + 0.20 * mult).toFixed(2)}x.`,
        hiramekarei: `A Espada de Chojuro. Reduz o tempo de missões em ${(15 * mult).toFixed(1)}%.`,
        kiba: `As Lâminas de Trovão. Cliques têm ${(15 * mult).toFixed(1)}% de chance de Crítico (${(5 * mult).toFixed(1)}x).`
    };
    return descs[key] || "";
}

export function upgradeSword(swordId, cost) {
    if (gameState.chakra < cost) {
        alert("Chakra insuficiente para refinar esta espada!");
        return;
    }
    
    if (!gameState.swords_levels) {
        gameState.swords_levels = {
            kubikiribocho: 1,
            samehada: 1,
            kusanagi: 1,
            totsuka: 1,
            hiramekarei: 1,
            kiba: 1
        };
    }
    
    gameState.chakra -= cost;
    gameState.swords_levels[swordId] = (gameState.swords_levels[swordId] || 1) + 1;
    
    recalculateStats();
    updateDOM();
    saveGame();
}

export function setTrainingBuff(duration) {
    trainingBuffTimer = duration;
    recalculateStats();
}

export function logout() {
    localStorage.removeItem('username');
    window.location.href = "login.html";
}

window.logout = logout;

// Initialize theme & game state on load
window.addEventListener('load', () => {
    let user = localStorage.getItem('username');
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    setUsername(user);
    const displayEl = document.getElementById('display-username');
    if (displayEl) displayEl.innerText = user;
    loadGame();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeUI(true);
    } else {
        updateThemeUI(false);
    }
    setupClickAnimation();
});

// Passive background game loop (100ms)
setInterval(() => {
    if (!currentUsername) return;
    
    // Decrement active timers by 0.1s
    if (gatesActiveTime > 0) {
        gatesActiveTime -= 0.1;
        if (gatesActiveTime <= 0) {
            gatesActiveTime = 0;
            // Backlash for Gate 8
            if (gameState.gates_unlocked === 8) {
                gameState.chakra = 0; // Drain chakra!
                exhaustionTime = 10.0; // 10s exhaustion
                alert("🔴 PORTÃO DA MORTE: Seu corpo entrou em colapso! Chakra reduzido a 0 e exaustão por 10 segundos.");
            } else {
                alert("Os Portões Internos se fecharam.");
            }
            recalculateStats();
        }
    }
    if (gatesCooldown > 0) {
        gatesCooldown -= 0.1;
        if (gatesCooldown < 0) gatesCooldown = 0;
    }
    if (exhaustionTime > 0) {
        exhaustionTime -= 0.1;
        if (exhaustionTime <= 0) {
            exhaustionTime = 0;
            alert("Você se recuperou da exaustão.");
            recalculateStats();
        }
    }
    if (trainingBuffTimer > 0) {
        trainingBuffTimer -= 0.1;
        if (trainingBuffTimer <= 0) {
            trainingBuffTimer = 0;
            alert("O bônus de treinamento de Chakra expirou.");
            recalculateStats();
        }
    }
    
    if (calculatedCps > 0) {
        gameState.chakra += calculatedCps / 10;
        gameState.total_chakra_earned += calculatedCps / 10;
    }
    
    updateMissionsProgress();
    updateDOM();
}, 100);

// Autosave every 10 seconds
setInterval(() => {
    if (currentUsername) saveGame();
}, 10000);
