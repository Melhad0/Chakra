/**
 * exam.js - Sistema Completo do Exame Chūnin (Canônico e Funcional)
 * Fases:
 * 1. Prova Escrita (Trapaça Furtiva com Fiscais)
 * 2. Floresta da Morte (Sobrevivência & Saque de Pergaminhos - 3 Minutos)
 * 3. Torneio 1v1 da Arena (Combates com QTE / Parry)
 */

import { sound } from './audio.js';
import { particles } from './particles.js';
import { D, formatBigNumber } from './BigNumber.js';

export class ChuninExamManager {
    constructor() {
        this.gameState = null;
        this.saveFn = null;
        this.updateDomFn = null;

        this.currentPhase = 1; // 1, 2, or 3
        this.isOpen = false;

        // Phase 1: Prova Escrita
        this.suspicion = 0; // 0 to 100
        this.copiedAnswers = 0; // 0 to 100
        this.proctorLooking = false;
        this.proctorTimer = 0;
        this.isCheating = false;

        // Phase 2: Floresta da Morte
        this.forestTimeLeft = 180; // 3 minutes
        this.playerScroll = "Céu"; // "Céu" or "Terra"
        this.targetScroll = "Terra";
        this.hasOppositeScroll = false;
        this.forestEncounterIndex = 0;
        this.forestEnemyHp = 100;
        this.forestEnemyMaxHp = 100;

        // Phase 3: Torneio Arena
        this.arenaOpponentIndex = 0;
        this.opponents = [
            { name: "Shikamaru Nara", title: "Estrategista de Konoha", hp: 1500, maxHp: 1500, avatar: "♟️", qtePrompt: "DESVIE DA SOMBRA!", qteDuration: 2.5 },
            { name: "Temari", title: "Princesa do Vento de Suna", hp: 3500, maxHp: 3500, avatar: "🌪️", qtePrompt: "APARE O LEQUE DE VENTO!", qteDuration: 2.2 },
            { name: "Neji Hyūga", title: "Gênio do Clã Hyūga", hp: 8000, maxHp: 8000, avatar: "⚪", qtePrompt: "BLOQUEIE O JUUKEN!", qteDuration: 1.8 },
            { name: "Gaara do Deserto", title: "A Besta de Areia", hp: 20000, maxHp: 20000, avatar: "🏺", qtePrompt: "ESCAPE DO CAIXÃO DE AREIA!", qteDuration: 1.5 }
        ];
        this.qteActive = false;
        this.qteTimer = 0;
        this.qteSuccess = false;

        this.examInterval = null;
    }

    init(gameState, saveFn, updateDomFn) {
        this.gameState = gameState;
        this.saveFn = saveFn;
        this.updateDomFn = updateDomFn;
    }

    openExamModal() {
        if (!this.gameState.chunin_exam) {
            this.gameState.chunin_exam = {
                passed: false,
                current_phase: 1,
                high_score: 0
            };
        }

        this.isOpen = true;
        this.currentPhase = 1;
        this.resetPhase1();

        const modal = document.getElementById("chunin-exam-modal");
        if (modal) modal.classList.remove("hidden");

        this.startLoop();
        this.renderUI();
    }

    closeExamModal() {
        this.isOpen = false;
        this.stopLoop();
        const modal = document.getElementById("chunin-exam-modal");
        if (modal) modal.classList.add("hidden");
    }

    startLoop() {
        if (this.examInterval) clearInterval(this.examInterval);
        this.examInterval = setInterval(() => this.tick(0.1), 100);
    }

    stopLoop() {
        if (this.examInterval) {
            clearInterval(this.examInterval);
            this.examInterval = null;
        }
    }

    tick(dt) {
        if (!this.isOpen) return;

        if (this.currentPhase === 1) {
            this.tickPhase1(dt);
        } else if (this.currentPhase === 2) {
            this.tickPhase2(dt);
        } else if (this.currentPhase === 3) {
            this.tickPhase3(dt);
        }
    }

    // --- FASE 1: PROVA ESCRITA ---
    resetPhase1() {
        this.suspicion = 0;
        this.copiedAnswers = 0;
        this.proctorLooking = false;
        this.proctorTimer = Math.random() * 2 + 1.5;
        this.isCheating = false;
    }

    tickPhase1(dt) {
        this.proctorTimer -= dt;
        if (this.proctorTimer <= 0) {
            this.proctorLooking = !this.proctorLooking;
            this.proctorTimer = this.proctorLooking ? (Math.random() * 1.8 + 1.2) : (Math.random() * 2.5 + 1.5);
            if (this.proctorLooking) {
                sound.playAlert();
            }
        }

        if (this.isCheating) {
            if (this.proctorLooking) {
                this.suspicion += dt * 55; // Caught in the act!
                sound.playAlert();
                if (this.suspicion >= 100) {
                    this.failExam("Você foi pego colando pelos fiscais ANBU de Ibiki Morino! Reprovado no Exame Chūnin.");
                    return;
                }
            } else {
                this.copiedAnswers += dt * 18;
                // Natural suspicion slow decay when not looking
                this.suspicion = Math.max(0, this.suspicion - dt * 5);

                if (this.copiedAnswers >= 100) {
                    this.copiedAnswers = 100;
                    this.isCheating = false;
                    sound.playLevelUp();
                    alert("✅ FASE 1 CONCLUÍDA! Você copiou todas as respostas da 10ª Questão com sucesso! Indo para a Floresta da Morte.");
                    this.startPhase2();
                    return;
                }
            }
        } else {
            // Suspicion decays while passive
            this.suspicion = Math.max(0, this.suspicion - dt * 8);
        }

        this.updatePhase1DOM();
    }

    setCheating(isCheating) {
        this.isCheating = isCheating;
        if (isCheating && !this.proctorLooking) {
            sound.playClick();
        }
    }

    updatePhase1DOM() {
        const suspBar = document.getElementById("exam-suspicion-bar");
        const suspText = document.getElementById("exam-suspicion-text");
        const copyBar = document.getElementById("exam-copy-bar");
        const copyText = document.getElementById("exam-copy-text");
        const proctorStatus = document.getElementById("exam-proctor-status");
        const proctorEye = document.getElementById("exam-proctor-eye");

        if (suspBar) suspBar.style.width = `${Math.min(100, this.suspicion)}%`;
        if (suspText) suspText.innerText = `${Math.floor(this.suspicion)}%`;
        if (copyBar) copyBar.style.width = `${Math.min(100, this.copiedAnswers)}%`;
        if (copyText) copyText.innerText = `${Math.floor(this.copiedAnswers)}%`;

        if (proctorStatus && proctorEye) {
            if (this.proctorLooking) {
                proctorEye.innerText = "👁️🚨";
                proctorStatus.innerText = "FISCAL VIGILANTE! NÃO COLE AGORA!";
                proctorStatus.className = "proctor-warning";
            } else {
                proctorEye.innerText = "📝💤";
                proctorStatus.innerText = "Fiscal distraído anotando. COLE AGORA!";
                proctorStatus.className = "proctor-safe";
            }
        }
    }

    // --- FASE 2: FLORESTA DA MORTE ---
    startPhase2() {
        this.currentPhase = 2;
        this.forestTimeLeft = 180; // 3 min
        this.playerScroll = Math.random() > 0.5 ? "Céu" : "Terra";
        this.targetScroll = this.playerScroll === "Céu" ? "Terra" : "Céu";
        this.hasOppositeScroll = false;
        this.forestEncounterIndex = 0;
        this.setupForestEnemy();
        this.renderUI();
    }

    setupForestEnemy() {
        const enemies = [
            { name: "Time da Névoa (Gennins)", hp: 500 },
            { name: "Time da Chuva (Espiões)", hp: 1200 },
            { name: "Time do Som (Zaku & Dosu)", hp: 2500 }
        ];
        const e = enemies[this.forestEncounterIndex] || enemies[0];
        this.forestEnemyMaxHp = e.hp;
        this.forestEnemyHp = e.hp;
    }

    tickPhase2(dt) {
        this.forestTimeLeft -= dt;
        if (this.forestTimeLeft <= 0) {
            this.failExam("O tempo limite de 3 minutos na Floresta da Morte expirou! As portas da torre se fecharam.");
            return;
        }

        const timerEl = document.getElementById("forest-timer-val");
        if (timerEl) {
            const m = Math.floor(this.forestTimeLeft / 60);
            const s = Math.floor(this.forestTimeLeft % 60);
            timerEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
    }

    attackForestEnemy() {
        const clickDmg = 80;
        this.forestEnemyHp -= clickDmg;
        sound.playCrit();

        if (this.forestEnemyHp <= 0) {
            sound.playJutsu();
            this.forestEncounterIndex++;
            if (this.forestEncounterIndex >= 3) {
                this.hasOppositeScroll = true;
                sound.playLevelUp();
                alert(`📜 SAQUE COM SUCESSO! Você derrotou os rivais e pegou o Pergaminho da ${this.targetScroll}! Rumo à Torre Central!`);
                this.startPhase3();
                return;
            } else {
                this.setupForestEnemy();
            }
        }
        this.updatePhase2DOM();
    }

    updatePhase2DOM() {
        const hpBar = document.getElementById("forest-enemy-hp-bar");
        const hpText = document.getElementById("forest-enemy-hp-text");
        if (hpBar) hpBar.style.width = `${Math.max(0, (this.forestEnemyHp / this.forestEnemyMaxHp) * 100)}%`;
        if (hpText) hpText.innerText = `${Math.max(0, Math.floor(this.forestEnemyHp))} / ${this.forestEnemyMaxHp} HP`;
    }

    // --- FASE 3: TORNEIO DA ARENA (1v1) ---
    startPhase3() {
        this.currentPhase = 3;
        this.arenaOpponentIndex = 0;
        this.setupArenaOpponent();
        this.renderUI();
    }

    setupArenaOpponent() {
        const opp = this.opponents[this.arenaOpponentIndex];
        opp.hp = opp.maxHp;
        this.qteActive = false;
        this.qteTimer = 0;
        this.triggerQTE();
    }

    triggerQTE() {
        const opp = this.opponents[this.arenaOpponentIndex];
        this.qteActive = true;
        this.qteTimer = opp.qteDuration;
        this.qteSuccess = false;
        sound.playAlert();
        this.updatePhase3DOM();
    }

    tickPhase3(dt) {
        if (this.qteActive) {
            this.qteTimer -= dt;
            if (this.qteTimer <= 0) {
                // QTE missed! Player takes damage
                this.qteActive = false;
                sound.playAlert();
                alert(`⚠️ Você não reagiu a tempo ao ataque de ${this.opponents[this.arenaOpponentIndex].name}! Tente novamente.`);
                this.triggerQTE();
            }
        }
        this.updatePhase3DOM();
    }

    handleQTEPress() {
        if (!this.qteActive) return;

        this.qteActive = false;
        this.qteSuccess = true;
        sound.playCrit();

        const opp = this.opponents[this.arenaOpponentIndex];
        const dmg = Math.floor(opp.maxHp * 0.35 + 200);
        opp.hp -= dmg;

        if (opp.hp <= 0) {
            opp.hp = 0;
            sound.playJutsu();
            alert(`💥 VITÓRIA! Você derrotou ${opp.name}!`);

            this.arenaOpponentIndex++;
            if (this.arenaOpponentIndex >= this.opponents.length) {
                this.completeExamSuccess();
                return;
            } else {
                this.setupArenaOpponent();
            }
        } else {
            setTimeout(() => this.triggerQTE(), 800);
        }
        this.updatePhase3DOM();
    }

    completeExamSuccess() {
        sound.playLevelUp();
        this.gameState.chunin_exam.passed = true;
        this.gameState.is_chunin = true;

        alert(`🎖️ PARABÉNS SHINOBI! Você superou todas as 3 fases do Exame Chūnin e foi oficialmente promovido a CHŪNIN DA VILA DA FOLHA!\n\nRecompensas Permanentes:\n- Bônus Global: 2x em TODO o CPS!\n- Desbloqueio de Contratos de Invocação!\n- Título Shinobi nos Rankings!`);

        this.saveFn();
        this.updateDomFn();
        this.closeExamModal();
    }

    failExam(reason) {
        sound.playAlert();
        alert(`❌ REPROVADO NO EXAME CHŪNIN!\n\n${reason}\n\nVocê pode tentar novamente quando desejar.`);
        this.closeExamModal();
    }

    renderUI() {
        const content = document.getElementById("exam-modal-body");
        if (!content) return;

        if (this.currentPhase === 1) {
            content.innerHTML = `
                <div class="exam-phase-header">
                    <h4>1ª FASE: A PROVA ESCRITA</h4>
                    <p>O objetivo é colar as respostas sem levantar suspeitas dos fiscais de Ibiki Morino!</p>
                </div>
                <div class="proctor-panel">
                    <div class="proctor-vision-cone"></div>
                    <div id="exam-proctor-eye" class="proctor-big-eye">📝💤</div>
                    <div id="exam-proctor-status" class="proctor-safe">Fiscal distraído anotando. COLE AGORA!</div>
                </div>
                <div class="exam-meters">
                    <div class="meter-block">
                        <label>Respostas Copiadas: <span id="exam-copy-text">0%</span></label>
                        <div class="meter-track fluid-track"><div id="exam-copy-bar" class="meter-fill fill-green fluid-fill" style="width: 0%;"></div></div>
                    </div>
                    <div class="meter-block">
                        <label>Medidor de Suspeita ANBU: <span id="exam-suspicion-text">0%</span></label>
                        <div class="meter-track fluid-track"><div id="exam-suspicion-bar" class="meter-fill fill-red fluid-fill" style="width: 0%;"></div></div>
                    </div>
                </div>
                <div class="exam-actions">
                    <button id="cheat-btn" class="exam-action-btn"
                            onmousedown="window.chuninExamManager.setCheating(true)"
                            onmouseup="window.chuninExamManager.setCheating(false)"
                            ontouchstart="window.chuninExamManager.setCheating(true)"
                            ontouchend="window.chuninExamManager.setCheating(false)">
                        🕵️ SEGURE PARA COLAR COM JUTSU
                    </button>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Solte o botão imediatamente quando o fiscal olhar para você!</p>
                </div>
            `;
        } else if (this.currentPhase === 2) {
            content.innerHTML = `
                <div class="exam-phase-header">
                    <h4>2ª FASE: A FLORESTA DA MORTE</h4>
                    <p>Você possui o <strong>Pergaminho do ${this.playerScroll}</strong>. Derrote os esquadrões rivais e consiga o <strong>Pergaminho da ${this.targetScroll}</strong> antes do tempo esgotar!</p>
                    <div class="forest-countdown">⏳ Tempo Restante: <span id="forest-timer-val">3:00</span></div>
                </div>
                <div class="parallax-forest-stage">
                    <div class="forest-running-runner">🏃🍃</div>
                </div>
                <div class="forest-battle-arena">
                    <div class="forest-enemy-card">
                        <div class="enemy-avatar">🥷</div>
                        <div class="enemy-name">Esquadrão Rival ${this.forestEncounterIndex + 1}/3</div>
                        <div class="meter-track fluid-track" style="margin: 0.8rem 0;">
                            <div id="forest-enemy-hp-bar" class="meter-fill fill-red fluid-fill" style="width: 100%;"></div>
                        </div>
                        <span id="forest-enemy-hp-text">${this.forestEnemyHp} / ${this.forestEnemyMaxHp} HP</span>
                    </div>
                </div>
                <div class="exam-actions">
                    <button class="exam-action-btn battle-btn" onclick="window.chuninExamManager.attackForestEnemy()">
                        ⚔️ Atacar Esquadrão Rival!
                    </button>
                </div>
            `;
        } else if (this.currentPhase === 3) {
            const opp = this.opponents[this.arenaOpponentIndex];
            content.innerHTML = `
                <div class="exam-phase-header">
                    <h4>3ª FASE: TORNEIO 1v1 NA ARENA DE KONOHA</h4>
                    <p>Duelo Final contra os rivais de elite de outras vilas!</p>
                </div>
                <div class="arena-match-card">
                    <div class="arena-rival-badge">${opp.avatar}</div>
                    <div class="arena-rival-info">
                        <h3>${opp.name}</h3>
                        <p class="rival-title">${opp.title}</p>
                        <div class="meter-track fluid-track" style="margin: 0.5rem 0;">
                            <div id="arena-hp-bar" class="meter-fill fill-purple fluid-fill" style="width: ${(opp.hp / opp.maxHp) * 100}%;"></div>
                        </div>
                        <span id="arena-hp-text">${opp.hp} / ${opp.maxHp} HP</span>
                    </div>
                </div>
                <div class="arena-qte-container">
                    <div class="parry-timing-ring ring-shrink"></div>
                    <div id="qte-box" class="qte-box ${this.qteActive ? 'qte-active' : ''}">
                        <div id="qte-prompt" class="qte-prompt">${opp.qtePrompt}</div>
                        <button id="qte-action-btn" class="qte-btn" onclick="window.chuninExamManager.handleQTEPress()">
                            ⚡ REAGIR / APARAR AGORA!
                        </button>
                    </div>
                </div>
            `;
        }
    }

    updatePhase3DOM() {
        const opp = this.opponents[this.arenaOpponentIndex];
        if (!opp) return;

        const hpBar = document.getElementById("arena-hp-bar");
        const hpText = document.getElementById("arena-hp-text");
        if (hpBar) hpBar.style.width = `${Math.max(0, (opp.hp / opp.maxHp) * 100)}%`;
        if (hpText) hpText.innerText = `${Math.max(0, opp.hp)} / ${opp.maxHp} HP`;

        const qteBox = document.getElementById("qte-box");
        if (qteBox) {
            if (this.qteActive) {
                qteBox.classList.add("qte-active");
            } else {
                qteBox.classList.remove("qte-active");
            }
        }
    }
}

export const chuninExamManager = new ChuninExamManager();
window.chuninExamManager = chuninExamManager;
