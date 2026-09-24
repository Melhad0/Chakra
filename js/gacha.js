/**
 * gacha.js - Forja Gacha de Espadas Lendárias
 * Suporta custo em BigNumber e uso de bilhetes conquistados em desafios/presença.
 */

import { gameState, SWORDS_INFO, recalculateStats, updateDOM, saveGame } from './game.js';
import { D } from './BigNumber.js';
import { sound } from './audio.js';

export function rollGacha() {
    const cost = D(50000);
    const hasTicket = (gameState.gacha_tickets || 0) > 0;

    if (!hasTicket && D(gameState.chakra).lt(cost)) {
        alert("Você não tem Chakra suficiente nem Bilhetes de Forja!");
        return;
    }

    const unobtained = [];
    for (let key in gameState.swords) {
        if (!gameState.swords[key]) {
            unobtained.push(key);
        }
    }

    if (unobtained.length === 0) {
        alert("Você já forjou todas as espadas lendárias!");
        return;
    }

    if (hasTicket) {
        gameState.gacha_tickets--;
    } else {
        gameState.chakra = D(gameState.chakra).sub(cost);
    }
    updateDOM();

    const rollBtn = document.getElementById('gacha-roll-btn');
    if (rollBtn) rollBtn.disabled = true;

    const swordKeys = Object.keys(SWORDS_INFO);
    const animEl = document.getElementById('gacha-sword-anim');
    const nameEl = document.getElementById('gacha-result-name');
    const descEl = document.getElementById('gacha-result-desc');

    sound.playCrit();
    let count = 0;
    const interval = setInterval(() => {
        const randomKey = swordKeys[Math.floor(Math.random() * swordKeys.length)];
        if (animEl) animEl.innerText = SWORDS_INFO[randomKey].icon;
        if (nameEl) nameEl.innerText = SWORDS_INFO[randomKey].name;
        if (descEl) descEl.innerText = SWORDS_INFO[randomKey].desc;
        count++;

        if (count >= 15) {
            clearInterval(interval);

            const wonKey = unobtained[Math.floor(Math.random() * unobtained.length)];
            gameState.swords[wonKey] = true;

            if (!gameState.equipped_sword) {
                gameState.equipped_sword = wonKey;
            }

            sound.playLevelUp();
            if (animEl) animEl.innerText = SWORDS_INFO[wonKey].icon;
            if (nameEl) nameEl.innerText = "Forjou: " + SWORDS_INFO[wonKey].name + "!";
            if (descEl) descEl.innerText = SWORDS_INFO[wonKey].desc;

            recalculateStats();
            updateDOM();
            saveGame();

            if (rollBtn) rollBtn.disabled = false;
        }
    }, 100);
}

export function equipSword(key) {
    if (gameState.swords[key]) {
        gameState.equipped_sword = key;
        sound.playBuy();
        recalculateStats();
        updateDOM();
        saveGame();
    }
}
