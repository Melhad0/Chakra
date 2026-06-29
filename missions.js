import { gameState, MISSION_INFO, updateDOM, saveGame, calculatedCps } from './game.js';

export function getMissionLogMessage(missionId, pct) {
    if (pct <= 0) return "Iniciando missão...";
    if (pct >= 100) return "Missão concluída! Reivindique os prêmios.";
    const logs = {
        protect_village: [
            "👣 Rastreando bandidos perto do portão...",
            "⚔️ Confrontando bandidos na floresta!",
            "💨 Flanqueando com Clones de Sombra...",
            "✨ Vila protegida! Retornando..."
        ],
        infiltrate_akatsuki: [
            "⛰️ Localizando entrada secreta do esconderijo...",
            "👁️ Sharingan ativo! Desarmando armadilhas...",
            "💥 Batalha intensa contra defesas Akatsuki!",
            "📜 Segredos recuperados! Fugindo..."
        ],
        kyuubi_battle: [
            "🦊 Selo enfraquecido! Kyuubi rugindo!",
            "🪵 Estilo Madeira contendo o chakra...",
            "🌀 Rasengan Gigante atingindo o alvo!",
            "🔴 Executando Selo de Oito Trigramas..."
        ],
        camp_zabuza: [
            "🛶 Viajando sob a névoa para o País das Ondas...",
            "⚔️ Kakashi enfrenta Zabuza Momochi!",
            "❄️ Naruto e Sasuke presos no Espelho de Cristais de Gelo de Haku!",
            "🦊 Chakra da Raposa desperta! Ponte concluída!"
        ],
        camp_forest_death: [
            "🌳 Adentrando os portões da Floresta da Morte...",
            "🐍 Emboscados por cobras gigantes e Orochimaru!",
            "💥 Sasuke ativa a marca da maldição! Luta pela sobrevivência...",
            "📜 Pergaminhos do Céu e da Terra obtidos! Rumo à torre!"
        ],
        camp_orochimaru: [
            "🏯 Invasão iniciada! Destruição de Konoha pelos ninjas do Som e da Areia...",
            "🌀 Invocação da Serpente de Três Cabeças nos muros!",
            "🪵 Terceiro Hokage enfrenta Orochimaru no telhado com o Selo Ceifador!",
            "🕊️ Vontade do Fogo prevalece! Invasão repelida!"
        ],
        camp_final_valley: [
            "👣 Perseguição ativa para resgatar Sasuke...",
            "💥 Quarteto do Som derrotado pelos genins!",
            "⚡ Chidori vs Rasengan no Vale do Fim!",
            "🦊 Transformações ao limite! O destino foi traçado..."
        ]
    };
    const list = logs[missionId];
    if (!list) return "Executando táticas ninja...";
    const index = Math.min(Math.floor(pct / 25), 3);
    return list[index];
}

export function speedUpMission(missionId, event) {
    const activeMission = gameState.missions[missionId];
    if (activeMission && activeMission.status === "running") {
        activeMission.end_time -= 1000;
        
        const rect = event.target.getBoundingClientRect();
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.style.color = 'var(--accent-color)';
        particle.style.textShadow = '0 0 8px var(--primary-glow)';
        particle.innerText = `⚡ -1s`;
        
        const x = event.clientX || (rect.left + rect.width / 2);
        const y = event.clientY || (rect.top + rect.height / 2);
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
        
        updateMissionsProgress();
    }
}

export function startMission(missionId) {
    const mission = MISSION_INFO[missionId];
    const activeMission = gameState.missions[missionId];
    
    if (activeMission.status !== "idle") return;
    
    if (mission.reqs) {
        for (const req of mission.reqs) {
            const userQty = gameState.generators[req.gen] || 0;
            if (userQty < req.qty) {
                const nameMap = {
                    shadow_clone: "Clone(s) das Sombras",
                    genin: "Genin(s)",
                    chunin: "Chunin(s)",
                    jonin: "Jonin(s)",
                    anbu: "ANBU(s)",
                    sannin: "Sannin(s)",
                    kage: "Kage(s)",
                    jinchuriki: "Jinchuriki(s)",
                    rikudou: "Deus(es) Shinobi"
                };
                const genName = nameMap[req.gen] || req.gen;
                alert(`Você precisa de pelo menos ${req.qty} ${genName} para iniciar esta missão.`);
                return;
            }
        }
    } else {
        const userQty = gameState.generators[mission.reqGen] || 0;
        if (userQty < mission.reqQty) {
            alert(`Você precisa de pelo menos ${mission.reqQty} ${mission.reqGen} para iniciar esta missão.`);
            return;
        }
    }
    
    let duration = mission.duration;
    if (gameState.prestige_upgrades.ancestral_voice) {
        duration *= 0.8;
    }
    if (gameState.equipped_sword === "hiramekarei") {
        duration *= 0.85;
    }
    
    activeMission.status = "running";
    activeMission.end_time = Date.now() + (duration * 1000);
    
    const logEl = document.getElementById(`log-${missionId}`);
    const speedBtn = document.getElementById(`btn-speed-${missionId}`);
    if (logEl) {
        logEl.classList.remove('hidden');
        logEl.innerText = "Iniciando missão...";
    }
    if (speedBtn) {
        speedBtn.classList.remove('hidden');
    }
    
    updateDOM();
    saveGame();
}

export function updateMissionsProgress() {
    const now = Date.now();
    for (let missionId in gameState.missions) {
        const mission = gameState.missions[missionId];
        const info = MISSION_INFO[missionId];
        const logEl = document.getElementById(`log-${missionId}`);
        const speedBtn = document.getElementById(`btn-speed-${missionId}`);
        const bar = document.getElementById(`bar-${missionId}`);
        const btn = document.getElementById(`btn-mission-${missionId}`);
        
        if (mission.status === "running") {
            const remaining = mission.end_time - now;
            
            if (remaining <= 0) {
                mission.status = "completed";
                if (bar) bar.style.width = "100%";
                if (btn) {
                    btn.innerText = "Reivindicar Recompensas";
                    btn.disabled = false;
                }
                if (logEl) {
                    logEl.classList.remove('hidden');
                    logEl.innerText = "Missão concluída! Reivindique os prêmios.";
                }
                if (speedBtn) {
                    speedBtn.classList.add('hidden');
                }
            } else {
                let duration = info.duration;
                if (gameState.prestige_upgrades.ancestral_voice) duration *= 0.8;
                if (gameState.equipped_sword === "hiramekarei") duration *= 0.85;
                const pct = ((duration * 1000 - remaining) / (duration * 1000)) * 100;
                if (bar) bar.style.width = `${pct}%`;
                if (btn) {
                    btn.innerText = `Executando... (${Math.ceil(remaining / 1000)}s)`;
                    btn.disabled = true;
                }
                if (logEl) {
                    logEl.classList.remove('hidden');
                    logEl.innerText = getMissionLogMessage(missionId, pct);
                }
                if (speedBtn) {
                    speedBtn.classList.remove('hidden');
                }
            }
        } else if (mission.status === "completed") {
            if (bar) bar.style.width = "100%";
            if (btn) {
                btn.innerText = "Reivindicar Recompensas";
                btn.disabled = false;
            }
            if (logEl) {
                logEl.classList.remove('hidden');
                logEl.innerText = "Missão concluída! Reivindique os prêmios.";
            }
            if (speedBtn) {
                speedBtn.classList.add('hidden');
            }
        } else {
            const PREV_MISSION = {
                camp_forest_death: "camp_zabuza",
                camp_orochimaru: "camp_forest_death",
                camp_final_valley: "camp_orochimaru"
            };
            const prevId = PREV_MISSION[missionId];
            if (prevId && gameState.missions[prevId] && !gameState.missions[prevId].completed) {
                if (btn) {
                    const arcNames = {
                        camp_forest_death: "Bloqueado (Complete o Arco 1)",
                        camp_orochimaru: "Bloqueado (Complete o Arco 2)",
                        camp_final_valley: "Bloqueado (Complete o Arco 3)"
                    };
                    btn.innerText = arcNames[missionId] || "Bloqueado";
                    btn.disabled = true;
                }
                const cardEl = document.getElementById(`mis-${missionId}`);
                if (cardEl) cardEl.classList.add('camp-locked');
            } else {
                if (btn) {
                    let durStr = info.duration >= 60 ? `${info.duration / 60} min` : `${info.duration}s`;
                    btn.innerText = missionId.startsWith('camp_') ? `Iniciar Batalha (${durStr})` : `Iniciar Missão (${durStr})`;
                    btn.disabled = false;
                }
                const cardEl = document.getElementById(`mis-${missionId}`);
                if (cardEl) cardEl.classList.remove('camp-locked');
            }
            
            if (logEl) {
                logEl.classList.add('hidden');
                logEl.innerText = "Aguardando início...";
            }
            if (speedBtn) {
                speedBtn.classList.add('hidden');
            }
        }
    }
}

export function claimMission(missionId) {
    const mission = gameState.missions[missionId];
    const info = MISSION_INFO[missionId];
    
    if (mission.status === "completed") {
        gameState.chakra += info.rewardChakra;
        gameState.total_chakra_earned += info.rewardChakra;
        
        if (info.rewardPrestige > 0) {
            gameState.prestige_points += info.rewardPrestige;
            gameState.total_prestige_points += info.rewardPrestige;
        }
        
        mission.status = "idle";
        mission.completed = true;
        mission.end_time = 0.0;
        
        const bar = document.getElementById(`bar-${missionId}`);
        const btn = document.getElementById(`btn-mission-${missionId}`);
        const logEl = document.getElementById(`log-${missionId}`);
        const speedBtn = document.getElementById(`btn-speed-${missionId}`);
        
        if (bar) bar.style.width = "0%";
        if (btn) {
            let durStr = info.duration >= 60 ? `${info.duration / 60} min` : `${info.duration}s`;
            btn.innerText = `Iniciar Missão (${durStr})`;
            btn.disabled = false;
        }
        if (logEl) {
            logEl.classList.add('hidden');
            logEl.innerText = "Aguardando início...";
        }
        if (speedBtn) {
            speedBtn.classList.add('hidden');
        }
        
        updateDOM();
        saveGame();
    }
}

export function handleMissionClick(missionId) {
    const activeMission = gameState.missions[missionId];
    if (!activeMission) return;
    if (activeMission.status === "completed") {
        claimMission(missionId);
    } else if (activeMission.status === "idle") {
        startMission(missionId);
    }
}

// === PARRY MINI-GAME LOGIC ===
let parryInterval = null;
let parryPosition = 0;
let parryDirection = 2; // speed
let parryStreak = 0;
let parryGameActive = false;

export function startParryGame() {
    if (parryGameActive) return;
    
    parryGameActive = true;
    parryPosition = 0;
    // Speed increases with streak
    parryDirection = 2 + Math.min(parryStreak * 0.4, 6);
    
    const indicator = document.getElementById('parry-slider-indicator');
    const startBtn = document.getElementById('parry-start-btn');
    const actionBtn = document.getElementById('parry-action-btn');
    const feedback = document.getElementById('parry-feedback');
    const projectile = document.getElementById('parry-projectile');
    
    if (startBtn) startBtn.disabled = true;
    if (actionBtn) actionBtn.disabled = false;
    if (feedback) {
        feedback.style.color = "var(--text-color)";
        feedback.innerText = "Prepare-se para defletir!";
    }
    if (projectile) {
        projectile.classList.remove('hidden');
        projectile.style.left = '10%';
        projectile.style.transform = 'scale(1) rotate(0deg)';
    }
    
    // Set random position for green target zone (between 50% and 80%)
    const targetZone = document.querySelector('.parry-target-zone');
    const targetMin = 45 + Math.random() * 20; // 45 to 65
    // target width shrinks as streak increases
    const targetWidth = Math.max(8, 16 - parryStreak * 0.5); 
    if (targetZone) {
        targetZone.style.left = `${targetMin}%`;
        targetZone.style.width = `${targetWidth}%`;
    }
    
    parryInterval = setInterval(() => {
        parryPosition += parryDirection;
        if (indicator) indicator.style.left = `${parryPosition}%`;
        
        // Move projectile across arena
        if (projectile) {
            projectile.style.left = `${10 + (parryPosition * 0.7)}%`;
        }
        
        if (parryPosition >= 100) {
            clearInterval(parryInterval);
            failParry("Muito lento! Recebeu o golpe.");
        }
    }, 16);
}

export function triggerParry() {
    if (!parryGameActive) return;
    clearInterval(parryInterval);
    parryGameActive = false;
    
    const targetZone = document.querySelector('.parry-target-zone');
    const actionBtn = document.getElementById('parry-action-btn');
    const startBtn = document.getElementById('parry-start-btn');
    const feedback = document.getElementById('parry-feedback');
    const projectile = document.getElementById('parry-projectile');
    
    if (actionBtn) actionBtn.disabled = true;
    if (startBtn) startBtn.disabled = false;
    
    const targetLeft = parseFloat(targetZone.style.left);
    const targetWidth = parseFloat(targetZone.style.width);
    const targetRight = targetLeft + targetWidth;
    
    if (parryPosition >= targetLeft && parryPosition <= targetRight) {
        // Success!
        parryStreak++;
        const multiplier = 1 + parryStreak * 0.15;
        
        // Base reward scales with total earned chakra to keep it relevant
        const baseChakra = 200 + Math.max(100, Math.floor(gameState.total_chakra_earned * 0.015));
        const reward = Math.floor(baseChakra * multiplier);
        
        gameState.chakra += reward;
        gameState.total_chakra_earned += reward;
        
        if (feedback) {
            feedback.style.color = "lightgreen";
            feedback.innerText = `💥 PARRY PERFEITO! +${reward.toLocaleString()} Chakra!`;
        }
        
        // Deflect projectile back animation
        if (projectile) {
            projectile.style.transition = 'all 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
            projectile.style.left = '10%';
            projectile.style.transform = 'scale(1.4) rotate(-180deg)';
            setTimeout(() => {
                projectile.classList.add('hidden');
                projectile.style.transition = '';
            }, 150);
        }
        
        updateParryUI();
        updateDOM();
        saveGame();
    } else {
        failParry("Errou o tempo! Defesa quebrada.");
    }
}

function failParry(reason) {
    parryStreak = 0;
    parryGameActive = false;
    clearInterval(parryInterval);
    
    const actionBtn = document.getElementById('parry-action-btn');
    const startBtn = document.getElementById('parry-start-btn');
    const feedback = document.getElementById('parry-feedback');
    const projectile = document.getElementById('parry-projectile');
    
    if (actionBtn) actionBtn.disabled = true;
    if (startBtn) startBtn.disabled = false;
    
    if (feedback) {
        feedback.style.color = "var(--primary-color)";
        feedback.innerText = reason;
    }
    if (projectile) {
        projectile.classList.add('hidden');
    }
    
    updateParryUI();
}

function updateParryUI() {
    const streakDisplay = document.getElementById('parry-streak-display');
    const bonusDisplay = document.getElementById('parry-bonus-display');
    if (streakDisplay) streakDisplay.innerText = parryStreak;
    if (bonusDisplay) bonusDisplay.innerText = `+${(parryStreak * 15)}%`;
}

// === SWITCH TRAINING GAME ===
export function switchTrainingGame(gameId) {
    const games = ['parry', 'jutsu', 'chakra'];
    games.forEach(g => {
        const tab = document.getElementById(`train-tab-${g}`);
        const panel = document.getElementById(`train-game-${g}`);
        if (tab) tab.classList.toggle('active', g === gameId);
        if (panel) panel.classList.toggle('hidden', g !== gameId);
    });
}

// === JUTSU SEQUENCE GAME LOGIC ===
let jutsuActive = false;
let jutsuSequence = [];
let jutsuInputIndex = 0;
let jutsuTimer = null;
let jutsuTimeLeft = 0;
const KEY_KEYS = ["w", "a", "s", "d"];
const KEY_ARROWS = { "w": "⬆️", "a": "⬅️", "s": "⬇️", "d": "➡️" };

export function startJutsuGame() {
    if (jutsuActive) return;
    jutsuActive = true;
    jutsuInputIndex = 0;
    
    const len = gameState.total_chakra_earned >= 1000000 ? 7 : 5;
    jutsuSequence = [];
    for (let i = 0; i < len; i++) {
        const randKey = KEY_KEYS[Math.floor(Math.random() * KEY_KEYS.length)];
        jutsuSequence.push(randKey);
    }
    
    const seqContainer = document.getElementById('jutsu-sequence-keys');
    if (seqContainer) {
        seqContainer.innerHTML = "";
        jutsuSequence.forEach((key, index) => {
            const span = document.createElement('span');
            span.id = `jutsu-key-${index}`;
            span.className = "jutsu-key-node";
            span.innerText = KEY_ARROWS[key];
            seqContainer.appendChild(span);
        });
    }
    
    const feedback = document.getElementById('jutsu-feedback');
    if (feedback) {
        feedback.style.color = "var(--text-color)";
        feedback.innerText = "DIGITE A SEQUÊNCIA RAPIDAMENTE!";
    }
    
    const statusEl = document.getElementById('jutsu-input-status');
    if (statusEl) statusEl.innerText = `Digite: ${KEY_ARROWS[jutsuSequence[0]]}`;
    
    const startBtn = document.getElementById('jutsu-start-btn');
    if (startBtn) startBtn.disabled = true;
    
    const timerFill = document.getElementById('jutsu-timer-bar');
    jutsuTimeLeft = 100;
    const duration = len === 5 ? 3000 : 4500;
    const decrement = 100 / (duration / 40);
    
    if (jutsuTimer) clearInterval(jutsuTimer);
    jutsuTimer = setInterval(() => {
        jutsuTimeLeft -= decrement;
        if (timerFill) timerFill.style.width = `${Math.max(0, jutsuTimeLeft)}%`;
        
        if (jutsuTimeLeft <= 0) {
            clearInterval(jutsuTimer);
            failJutsu("Tempo Esgotado! Selos rompidos.");
        }
    }, 40);
}

window.addEventListener('keydown', (e) => {
    if (!jutsuActive) return;
    const pressed = e.key.toLowerCase();
    
    if (KEY_KEYS.includes(pressed)) {
        e.preventDefault();
        const expected = jutsuSequence[jutsuInputIndex];
        
        if (pressed === expected) {
            const node = document.getElementById(`jutsu-key-${jutsuInputIndex}`);
            if (node) node.classList.add('correct');
            
            jutsuInputIndex++;
            if (jutsuInputIndex >= jutsuSequence.length) {
                completeJutsu();
            } else {
                const nextKey = jutsuSequence[jutsuInputIndex];
                const statusEl = document.getElementById('jutsu-input-status');
                if (statusEl) statusEl.innerText = `Próximo: ${KEY_ARROWS[nextKey]}`;
            }
        } else {
            failJutsu("Sequência errada! O fluxo de chakra explodiu.");
        }
    }
});

function completeJutsu() {
    jutsuActive = false;
    clearInterval(jutsuTimer);
    
    const startBtn = document.getElementById('jutsu-start-btn');
    if (startBtn) startBtn.disabled = false;
    
    const feedback = document.getElementById('jutsu-feedback');
    const reward = Math.floor(500 + Math.max(300, gameState.total_chakra_earned * 0.035));
    gameState.chakra += reward;
    gameState.total_chakra_earned += reward;
    
    if (feedback) {
        feedback.style.color = "lightgreen";
        feedback.innerText = `🔥 KATON: JUTSU BOLA DE FOGO! +${reward.toLocaleString()} Chakra!`;
    }
    
    const statusEl = document.getElementById('jutsu-input-status');
    if (statusEl) statusEl.innerText = "Jutsu Executado!";
    
    updateDOM();
    saveGame();
}

function failJutsu(reason) {
    jutsuActive = false;
    clearInterval(jutsuTimer);
    
    const startBtn = document.getElementById('jutsu-start-btn');
    if (startBtn) startBtn.disabled = false;
    
    const feedback = document.getElementById('jutsu-feedback');
    if (feedback) {
        feedback.style.color = "var(--primary-color)";
        feedback.innerText = reason;
    }
    
    const statusEl = document.getElementById('jutsu-input-status');
    if (statusEl) statusEl.innerText = "Falhou!";
}

// === CHAKRA BALANCE GAME LOGIC ===
let balanceActive = false;
let balanceVal = 50;
let balanceStability = 100;
let balanceInterval = null;
let balanceVelocity = 0;
let balanceTicks = 0;

export function startBalanceGame() {
    if (balanceActive) return;
    balanceActive = true;
    balanceVal = 50;
    balanceStability = 100;
    balanceVelocity = 0;
    balanceTicks = 0;
    
    const startBtn = document.getElementById('balance-start-btn');
    const clickBtn = document.getElementById('balance-click-btn');
    const feedback = document.getElementById('balance-feedback');
    
    if (startBtn) startBtn.disabled = true;
    if (clickBtn) clickBtn.disabled = false;
    
    if (feedback) {
        feedback.style.color = "var(--text-color)";
        feedback.innerText = "Mantenha o Yin-Yang no centro!";
    }
    
    if (balanceInterval) clearInterval(balanceInterval);
    balanceInterval = setInterval(() => {
        balanceTicks++;
        
        balanceVelocity += 0.08 + (Math.random() - 0.5) * 0.25;
        balanceVal += balanceVelocity;
        
        if (balanceVal <= 0) {
            balanceVal = 0;
            balanceVelocity = 0;
        }
        if (balanceVal >= 100) {
            balanceVal = 100;
            balanceVelocity = 0;
        }
        
        const cursor = document.getElementById('balance-cursor');
        if (cursor) cursor.style.left = `${balanceVal}%`;
        
        const safeZoneMin = 40;
        const safeZoneMax = 60;
        
        if (balanceVal < safeZoneMin || balanceVal > safeZoneMax) {
            balanceStability -= 2.5;
        } else {
            balanceStability = Math.min(100, balanceStability + 0.5);
        }
        
        const stabDisplay = document.getElementById('balance-stability-display');
        if (stabDisplay) stabDisplay.innerText = `${Math.floor(balanceStability)}%`;
        
        if (balanceStability <= 0) {
            failBalance("Sobrecarga de Chakra! Você perdeu o equilíbrio.");
        } else if (balanceTicks >= 250) {
            completeBalance();
        }
    }, 30);
}

export function balanceClick() {
    if (!balanceActive) return;
    balanceVelocity -= 3.2;
}

function completeBalance() {
    balanceActive = false;
    clearInterval(balanceInterval);
    
    const startBtn = document.getElementById('balance-start-btn');
    const clickBtn = document.getElementById('balance-click-btn');
    const feedback = document.getElementById('balance-feedback');
    
    if (startBtn) startBtn.disabled = false;
    if (clickBtn) clickBtn.disabled = true;
    
    if (window.setTrainingBuff) {
        window.setTrainingBuff(120);
    }
    
    if (feedback) {
        feedback.style.color = "lightgreen";
        feedback.innerText = "☯️ ESTABILIDADE COMPLETA! +50% CPS por 2 Minutos!";
    }
    
    updateDOM();
    saveGame();
}

function failBalance(reason) {
    balanceActive = false;
    clearInterval(balanceInterval);
    
    const startBtn = document.getElementById('balance-start-btn');
    const clickBtn = document.getElementById('balance-click-btn');
    const feedback = document.getElementById('balance-feedback');
    
    if (startBtn) startBtn.disabled = false;
    if (clickBtn) clickBtn.disabled = true;
    
    if (feedback) {
        feedback.style.color = "var(--primary-color)";
        feedback.innerText = reason;
    }
}
