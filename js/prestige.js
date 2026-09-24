/**
 * prestige.js - Sistema de Prestígio / Renascimento Shinobi
 * Usa BigNumber para calcular pontos com precisão arbitrária e reseta o ciclo.
 */

import { gameState, recalculateStats, updateDOM, saveGame } from './game.js';
import { D } from './BigNumber.js';
import { sound } from './audio.js';

export function getPendingPrestigePoints() {
    const earned = D(gameState.total_chakra_earned);
    const threshold = D(10000000); // 10 Million base
    if (earned.lt(threshold)) return 0;

    // Formula: sqrt(earned / 1e7) * clan bonuses
    const ratio = earned.div(threshold).toNumber();
    let pts = Math.floor(Math.sqrt(ratio));

    if (gameState.clan_tree && gameState.clan_tree.rinne_sharingan) {
        pts = Math.floor(pts * 2.5);
    }
    return pts;
}

export function performPrestige() {
    const pts = getPendingPrestigePoints();
    if (pts > 0) {
        gameState.prestige_points = (gameState.prestige_points || 0) + pts;
        gameState.total_prestige_points = (gameState.total_prestige_points || 0) + pts;
        gameState.total_prestiges = (gameState.total_prestiges || 0) + 1;

        // Reset Run Progress, keep Clan Tree, Bijuus and Swords
        gameState.chakra = D(0);
        gameState.total_chakra_earned = D(0);

        for (let key in gameState.generators) {
            gameState.generators[key] = 0;
        }
        for (let key in gameState.upgrades) {
            gameState.upgrades[key] = false;
        }
        for (let key in gameState.missions) {
            gameState.missions[key] = { status: "idle", end_time: 0.0 };
        }

        sound.playPrestige();
        recalculateStats();
        updateDOM();
        saveGame();

        alert(`🌀 RENASCIMENTO SHINOBI CONCLUÍDO!\nVocê acumulou +${pts} pontos de Chakra Ancestral. Desperte novas linhagens na Árvore de Clãs!`);
    } else {
        alert("Você precisa acumular pelo menos 10 Milhões de Chakra total nesta vida para renascer!");
    }
}

export function buyPrestigeUpgrade(key, cost) {
    if (!gameState.prestige_upgrades) gameState.prestige_upgrades = {};
    if (!gameState.prestige_upgrades[key] && (gameState.prestige_points || 0) >= cost) {
        gameState.prestige_points -= cost;
        gameState.prestige_upgrades[key] = true;
        sound.playLevelUp();
        recalculateStats();
        updateDOM();
        saveGame();
    }
}
