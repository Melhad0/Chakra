import { gameState, recalculateStats, updateDOM, saveGame } from './game.js';

export function getPendingPrestigePoints() {
    const earned = gameState.total_chakra_earned;
    if (earned < 10000000) return 0;
    return Math.floor(Math.sqrt(earned / 10000000));
}

export function performPrestige() {
    const pts = getPendingPrestigePoints();
    if (pts > 0) {
        gameState.prestige_points += pts;
        gameState.total_prestige_points += pts;
        
        // Reset Progress
        gameState.chakra = 0.0;
        gameState.total_chakra_earned = 0.0;
        
        for (let key in gameState.generators) {
            gameState.generators[key] = 0;
        }
        for (let key in gameState.upgrades) {
            gameState.upgrades[key] = false;
        }
        for (let key in gameState.missions) {
            gameState.missions[key] = { status: "idle", end_time: 0.0 };
        }
        
        recalculateStats();
        updateDOM();
        saveGame();
    }
}

export function buyPrestigeUpgrade(key, cost) {
    if (!gameState.prestige_upgrades[key] && gameState.prestige_points >= cost) {
        gameState.prestige_points -= cost;
        gameState.prestige_upgrades[key] = true;
        recalculateStats();
        updateDOM();
        saveGame();
    }
}
