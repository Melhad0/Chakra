/**
 * clans.js - Árvore Genealógica Shinobi (Clãs & Linhagem de Prestígio)
 * Features an interactive Fog of War Skill Tree with multiplicative lineage bonuses.
 */

import { D, formatBigNumber } from './BigNumber.js';
import { sound } from './audio.js';

export const CLAN_TREE = {
    primordial_chakra: {
        id: "primordial_chakra",
        name: "Chakra Primordial",
        branch: "root",
        icon: "🌀",
        cost: 1,
        desc: "O despertar da centelha original de Hagoromo Otsutsuki. +50% em todo o CPS global.",
        parent: null,
        effect: (stats) => { stats.cpsMultiplier = stats.cpsMultiplier.mul(1.5); }
    },

    // --- RAMO SENJU & UZUMAKI (Vitalidade, Regeneração & Escalonamento de Geradores) ---
    uzumaki_vitality: {
        id: "uzumaki_vitality",
        name: "Linhagem Uzumaki",
        branch: "senju",
        icon: "🍥",
        cost: 3,
        desc: "Sangue ancestral do Clã Uzumaki. +100% de capacidade e +50% na produção dos geradores básicos.",
        parent: "primordial_chakra",
        effect: (stats) => { stats.cpsMultiplier = stats.cpsMultiplier.mul(1.5); }
    },
    senju_wood_release: {
        id: "senju_wood_release",
        name: "Liberação de Madeira (Mokuton)",
        branch: "senju",
        icon: "🌲",
        cost: 8,
        desc: "Domínio sobre a vitalidade vegetal. Dobra a produção de todos os ninjas e geradores.",
        parent: "uzumaki_vitality",
        effect: (stats) => { stats.cpsMultiplier = stats.cpsMultiplier.mul(2.0); }
    },
    sage_body: {
        id: "sage_body",
        name: "Corpo do Sábio",
        branch: "senju",
        icon: "🧘",
        cost: 20,
        desc: "Constituição física dos Seis Caminhos. Multiplica todo o CPS global por 3x.",
        parent: "senju_wood_release",
        effect: (stats) => { stats.cpsMultiplier = stats.cpsMultiplier.mul(3.0); }
    },
    thousand_hands: {
        id: "thousand_hands",
        name: "Verdadeiras Mil Mãos",
        branch: "senju",
        icon: "🗿",
        cost: 60,
        desc: "A estátua budista suprema de Hashirama. Multiplica o CPS por 5x.",
        parent: "sage_body",
        effect: (stats) => { stats.cpsMultiplier = stats.cpsMultiplier.mul(5.0); }
    },

    // --- RAMO UCHIHA (Multiplicadores de Clique, Crítico & Jutsus Oculares) ---
    sharingan_awakening: {
        id: "sharingan_awakening",
        name: "Despertar do Sharingan",
        branch: "uchiha",
        icon: "👁️",
        cost: 3,
        desc: "Percepção refinada. +10% de Chance de Crítico e cliques manuais causam 2x mais dano.",
        parent: "primordial_chakra",
        effect: (stats) => {
            stats.critChance += 0.10;
            stats.clickMultiplier = stats.clickMultiplier.mul(2.0);
        }
    },
    mangekyo_sharingan_lineage: {
        id: "mangekyo_sharingan_lineage",
        name: "Mangekyō Sharingan",
        branch: "uchiha",
        icon: "🔴",
        cost: 8,
        desc: "O olho que reflete o coração. O clique manual passa a gerar +3% do seu CPS global.",
        parent: "sharingan_awakening",
        effect: (stats) => { stats.clickCpsRatio += 0.03; }
    },
    amaterasu_flame: {
        id: "amaterasu_flame",
        name: "Chamas Negras do Amaterasu",
        branch: "uchiha",
        icon: "🔥",
        cost: 20,
        desc: "Fogo inextinguível. Triplica o multiplicador de dano de acertos críticos (3x Crítico).",
        parent: "mangekyo_sharingan_lineage",
        effect: (stats) => { stats.critMultiplier = stats.critMultiplier.mul(3.0); }
    },
    perfect_susanoo_lineage: {
        id: "perfect_susanoo_lineage",
        name: "Susano'o Perfeito Divino",
        branch: "uchiha",
        icon: "⚔️",
        cost: 60,
        desc: "Armadura do Deus das Tempestades. Multiplica o poder de clique manual por 10x.",
        parent: "amaterasu_flame",
        effect: (stats) => { stats.clickMultiplier = stats.clickMultiplier.mul(10.0); }
    },

    // --- RAMO HYŪGA (Precisão, Minigames & Defesa Absoluta) ---
    byakugan_vision: {
        id: "byakugan_vision",
        name: "Visão dos 360 Graus (Byakugan)",
        branch: "hyuga",
        icon: "⚪",
        cost: 3,
        desc: "Leitura dos pontos de chakra (Tenketsu). +50% nas recompensas de missões e minigames.",
        parent: "primordial_chakra",
        effect: (stats) => { stats.missionRewardMult *= 1.5; }
    },
    eight_trigrams_palms: {
        id: "eight_trigrams_palms",
        name: "Oito Trigramas: 64 Golpes",
        branch: "hyuga",
        icon: "☯️",
        cost: 8,
        desc: "Golpes precisos no sistema circulatório. Cada clique manual tem 15% de chance de gerar 5x Chakra.",
        parent: "byakugan_vision",
        effect: (stats) => { stats.critChance += 0.15; }
    },
    kaiten_absolute_defense: {
        id: "kaiten_absolute_defense",
        name: "Giro Divino (Kaiten)",
        branch: "hyuga",
        icon: "🛡️",
        cost: 20,
        desc: "Defesa impenetrável. Garante 100% de eficiência no cálculo de treino e ganho de Chakra offline.",
        parent: "eight_trigrams_palms",
        effect: (stats) => { stats.offlineEfficiency = 1.0; }
    },
    tenseigan_manifestation: {
        id: "tenseigan_manifestation",
        name: "Manifestação do Tenseigan",
        branch: "hyuga",
        icon: "💠",
        cost: 60,
        desc: "A pupila da reencarnação de Hamura. Multiplica todo o ganho de Chakra e CPS por 4x.",
        parent: "kaiten_absolute_defense",
        effect: (stats) => {
            stats.cpsMultiplier = stats.cpsMultiplier.mul(4.0);
            stats.clickMultiplier = stats.clickMultiplier.mul(4.0);
        }
    },

    // --- NÓS CÓSMICOS OTSUTSUKI (Apex da Linhagem) ---
    chakra_fruit: {
        id: "chakra_fruit",
        name: "Fruto da Árvore Divina",
        branch: "otsutsuki",
        icon: "🍎",
        cost: 150,
        desc: "A essência concentrada de um planeta. Multiplica todo o CPS e Poder de Clique por 8x.",
        parent: "thousand_hands", // Or requires 2 maxed branches
        effect: (stats) => {
            stats.cpsMultiplier = stats.cpsMultiplier.mul(8.0);
            stats.clickMultiplier = stats.clickMultiplier.mul(8.0);
        }
    },
    rinne_sharingan: {
        id: "rinne_sharingan",
        name: "Olho da Lua (Rinne Sharingan)",
        branch: "otsutsuki",
        icon: "🌌",
        cost: 400,
        desc: "O olho cósmico de Kaguya. Aumenta em 2.5x todos os pontos de Chakra Ancestral obtidos em renascimentos.",
        parent: "chakra_fruit",
        effect: (stats) => { stats.prestigeGainMultiplier *= 2.5; }
    }
};

export function isClanNodeVisible(nodeId, unlockedClans) {
    const node = CLAN_TREE[nodeId];
    if (!node) return false;
    if (node.parent === null) return true; // Root always visible
    // Visible if parent is unlocked (Fog of War mechanism)
    return !!unlockedClans[node.parent];
}

export function canUnlockClanNode(nodeId, unlockedClans, currentPrestigePoints) {
    const node = CLAN_TREE[nodeId];
    if (!node) return false;
    if (unlockedClans[nodeId]) return false; // Already unlocked
    if (node.parent && !unlockedClans[node.parent]) return false; // Parent must be unlocked
    return currentPrestigePoints >= node.cost;
}

export function buyClanNode(nodeId, gameState, saveFn, updateDomFn) {
    const node = CLAN_TREE[nodeId];
    if (!node) return;

    if (!gameState.clan_tree) {
        gameState.clan_tree = {};
    }

    if (gameState.clan_tree[nodeId]) {
        alert("Esta linhagem já foi despertada!");
        return;
    }

    if (!canUnlockClanNode(nodeId, gameState.clan_tree, gameState.prestige_points)) {
        alert(`Você precisa de ${node.cost} Chakra Ancestral e do nó ancestral desbloqueado!`);
        return;
    }

    gameState.prestige_points -= node.cost;
    gameState.clan_tree[nodeId] = true;

    sound.playLevelUp();
    saveFn();
    updateDomFn();
    renderClanTree(gameState, saveFn, updateDomFn);
}

export function renderClanTree(gameState, saveFn, updateDomFn) {
    const container = document.getElementById("clan-tree-container");
    if (!container) return;

    if (!gameState.clan_tree) gameState.clan_tree = {};
    const unlocked = gameState.clan_tree;

    const branches = {
        root: { name: "Origem Primordial", nodes: ["primordial_chakra"] },
        senju: { name: "Linhagem Senju & Uzumaki (Vitalidade & CPS)", nodes: ["uzumaki_vitality", "senju_wood_release", "sage_body", "thousand_hands"] },
        uchiha: { name: "Linhagem Uchiha (Clique, Crítico & Dano)", nodes: ["sharingan_awakening", "mangekyo_sharingan_lineage", "amaterasu_flame", "perfect_susanoo_lineage"] },
        hyuga: { name: "Linhagem Hyūga (Precisão & Defesa Absoluta)", nodes: ["byakugan_vision", "eight_trigrams_palms", "kaiten_absolute_defense", "tenseigan_manifestation"] },
        otsutsuki: { name: "Clã Otsutsuki (Poder Supremo)", nodes: ["chakra_fruit", "rinne_sharingan"] }
    };

    let html = `
        <div class="clan-tree-header">
            <h3>🌀 Árvore Genealógica Shinobi</h3>
            <p>Gaste seu <strong>Chakra Ancestral</strong> acumulado em renascimentos para despertar linhagens lendárias permanentes.</p>
            <div class="ancestral-badge">Chakra Ancestral Disponível: <span>${gameState.prestige_points || 0}</span></div>
        </div>
        <div class="clan-branches-wrapper">
    `;

    for (let branchKey in branches) {
        const b = branches[branchKey];
        html += `
            <div class="clan-branch-col branch-${branchKey}">
                <div class="branch-title">${b.name}</div>
                <div class="branch-nodes-list">
        `;

        b.nodes.forEach(nodeId => {
            const node = CLAN_TREE[nodeId];
            const isUnlocked = !!unlocked[nodeId];
            const isVisible = isClanNodeVisible(nodeId, unlocked);
            const canAfford = canUnlockClanNode(nodeId, unlocked, gameState.prestige_points);

            if (!isVisible) {
                // Fog of War node
                html += `
                    <div class="clan-node fog-node">
                        <div class="node-icon">❓</div>
                        <div class="node-info">
                            <span class="node-name">Linhagem Oculta</span>
                            <span class="node-status">Requer linhagem ancestral anterior</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="clan-node ${isUnlocked ? 'unlocked' : (canAfford ? 'available' : 'locked')}" 
                         id="node-${node.id}">
                        <div class="node-icon">${node.icon}</div>
                        <div class="node-content">
                            <div class="node-top-row">
                                <span class="node-name">${node.name}</span>
                                <span class="node-cost ${isUnlocked ? 'cost-acquired' : ''}">
                                    ${isUnlocked ? 'Desperto ✓' : `${node.cost} Ancestral`}
                                </span>
                            </div>
                            <p class="node-desc">${node.desc}</p>
                            ${!isUnlocked ? `
                                <button class="unlock-node-btn ${canAfford ? 'btn-glow' : 'btn-disabled'}" 
                                        onclick="window.buyClanNode('${node.id}')" 
                                        ${!canAfford ? 'disabled' : ''}>
                                    ${canAfford ? 'Despertar Linhagem' : 'Chakra Insuficiente'}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

window.buyClanNode = (nodeId) => {
    // Game.js hook will bridge this
    if (window.chakraGameBuyClanNode) {
        window.chakraGameBuyClanNode(nodeId);
    }
};
