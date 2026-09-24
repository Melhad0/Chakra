import { gameState, SWORDS_INFO, recalculateStats, updateDOM, saveGame } from './game.js';

export function rollGacha() {
    const cost = 50000;
    if (gameState.chakra < cost) {
        alert("Você não tem Chakra suficiente!");
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
    
    gameState.chakra -= cost;
    updateDOM();
    
    const rollBtn = document.getElementById('gacha-roll-btn');
    rollBtn.disabled = true;
    
    const swordKeys = Object.keys(SWORDS_INFO);
    const animEl = document.getElementById('gacha-sword-anim');
    const nameEl = document.getElementById('gacha-result-name');
    const descEl = document.getElementById('gacha-result-desc');
    
    let count = 0;
    const interval = setInterval(() => {
        const randomKey = swordKeys[Math.floor(Math.random() * swordKeys.length)];
        animEl.innerText = SWORDS_INFO[randomKey].icon;
        nameEl.innerText = SWORDS_INFO[randomKey].name;
        descEl.innerText = SWORDS_INFO[randomKey].desc;
        count++;
        
        if (count >= 15) {
            clearInterval(interval);
            
            const wonKey = unobtained[Math.floor(Math.random() * unobtained.length)];
            gameState.swords[wonKey] = true;
            
            if (!gameState.equipped_sword) {
                gameState.equipped_sword = wonKey;
            }
            
            animEl.innerText = SWORDS_INFO[wonKey].icon;
            nameEl.innerText = "Forjou: " + SWORDS_INFO[wonKey].name + "!";
            descEl.innerText = SWORDS_INFO[wonKey].desc;
            
            recalculateStats();
            updateDOM();
            saveGame();
            
            rollBtn.disabled = false;
        }
    }, 100);
}

export function equipSword(key) {
    if (gameState.swords[key]) {
        gameState.equipped_sword = key;
        recalculateStats();
        updateDOM();
        saveGame();
    }
}
