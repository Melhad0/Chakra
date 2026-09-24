/**
 * rewards.js - Recompensas por Tempo Online Progressivas (Presença Shinobi)
 * Regras: Escala com o CPS atual, com teto percentual de balanceamento.
 */

import { D, formatBigNumber } from './BigNumber.js';
import { sound } from './audio.js';

export const PRESENCE_TIERS = [
    {
        id: "tier_5m",
        timeSeconds: 300,
        title: "Treinamento Inicial (5 Minutos)",
        desc: "30 segundos de produção atual de Chakra.",
        icon: "⏱️",
        claim: (gameState, currentCps) => {
            // 30 seconds of CPS (capped at max 100,000 for early game balance or max 5x current chakra)
            let reward = D(currentCps).mul(30);
            if (reward.lte(0)) reward = D(50);
            gameState.chakra = D(gameState.chakra).add(reward);
            return `+${formatBigNumber(reward)} Chakra coletado!`;
        }
    },
    {
        id: "tier_10m",
        timeSeconds: 600,
        title: "Foco de Respiração (10 Minutos)",
        desc: "2 minutos de CPS atual + Buff de +25% de Chance Crítica por 5 minutos.",
        icon: "🧘",
        claim: (gameState, currentCps) => {
            let reward = D(currentCps).mul(120);
            if (reward.lte(0)) reward = D(200);
            gameState.chakra = D(gameState.chakra).add(reward);
            gameState.crit_buff_timer = 300; // 5 min
            return `+${formatBigNumber(reward)} Chakra e +25% Chance Crítica por 5 minutos!`;
        }
    },
    {
        id: "tier_30m",
        timeSeconds: 1800,
        title: "Perseverança Ninja (30 Minutos)",
        desc: "10 minutos de CPS atual + 1 Giro Grátis na Forja Gacha de Espadas.",
        icon: "🗡️",
        claim: (gameState, currentCps) => {
            let reward = D(currentCps).mul(600);
            if (reward.lte(0)) reward = D(1000);
            gameState.chakra = D(gameState.chakra).add(reward);
            gameState.gacha_tickets = (gameState.gacha_tickets || 0) + 1;
            return `+${formatBigNumber(reward)} Chakra e +1 Bilhete de Forja de Espadas!`;
        }
    },
    {
        id: "tier_1h",
        timeSeconds: 3600,
        title: "Espírito Inabalável (1 Hora)",
        desc: "30 minutos de CPS atual + 5 Fragmentos de Refino de Armas.",
        icon: "📜",
        claim: (gameState, currentCps) => {
            let reward = D(currentCps).mul(1800);
            if (reward.lte(0)) reward = D(5000);
            gameState.chakra = D(gameState.chakra).add(reward);
            gameState.sword_fragments = (gameState.sword_fragments || 0) + 5;
            return `+${formatBigNumber(reward)} Chakra e +5 Fragmentos de Refino!`;
        }
    },
    {
        id: "tier_2h",
        timeSeconds: 7200,
        title: "Vontade do Fogo Suprema (2 Horas)",
        desc: "10 Pontos de Chakra Ancestral + Bônus de +20% no CPS por 2 horas.",
        icon: "🔥",
        claim: (gameState, currentCps) => {
            gameState.prestige_points = (gameState.prestige_points || 0) + 10;
            gameState.presence_buff_timer = 7200; // 2 hours
            return `+10 Chakra Ancestral e +20% CPS Global por 2 horas!`;
        }
    }
];

export class PresenceRewardManager {
    constructor() {
        this.sessionTime = 0;
    }

    tick(dt) {
        this.sessionTime += dt;
    }

    claimReward(tierId, gameState, currentCps, saveFn, updateDomFn) {
        const tier = PRESENCE_TIERS.find(t => t.id === tierId);
        if (!tier) return;

        if (!gameState.presence_rewards) gameState.presence_rewards = {};

        if (gameState.presence_rewards[tierId]) {
            alert("Esta recompensa já foi resgatada nesta sessão!");
            return;
        }

        if (this.sessionTime < tier.timeSeconds) {
            alert(`Você ainda precisa jogar por mais ${Math.ceil((tier.timeSeconds - this.sessionTime) / 60)} minutos para desbloquear!`);
            return;
        }

        gameState.presence_rewards[tierId] = true;
        const msg = tier.claim(gameState, currentCps);
        sound.playLevelUp();

        alert(`🎁 RECOMPENSA DE PRESENÇA SHINOBI:\n${msg}`);

        saveFn();
        updateDomFn();
        this.renderUI(gameState, currentCps);
    }

    renderUI(gameState, currentCps) {
        const container = document.getElementById("presence-rewards-container");
        if (!container) return;

        if (!gameState.presence_rewards) gameState.presence_rewards = {};
        const claimed = gameState.presence_rewards;

        const totalMinutes = Math.floor(this.sessionTime / 60);
        const totalSecs = Math.floor(this.sessionTime % 60);

        let html = `
            <div class="presence-header">
                <h3>⏳ Recompensas de Presença Shinobi</h3>
                <p>Ganhe recompensas acumulativas que escalam com seu poder atual conforme seu tempo de treinamento contínuo!</p>
                <div class="session-timer-badge">
                    Tempo Online na Sessão: <span>${totalMinutes}m ${totalSecs < 10 ? '0' : ''}${totalSecs}s</span>
                </div>
            </div>
            <div class="presence-grid">
        `;

        PRESENCE_TIERS.forEach(t => {
            const isClaimed = !!claimed[t.id];
            const isReady = !isClaimed && this.sessionTime >= t.timeSeconds;
            const progress = Math.min(100, (this.sessionTime / t.timeSeconds) * 100);
            const remaining = Math.max(0, Math.ceil(t.timeSeconds - this.sessionTime));
            const remM = Math.floor(remaining / 60);
            const remS = remaining % 60;

            html += `
                <div class="presence-card ${isClaimed ? 'card-claimed' : (isReady ? 'card-ready' : 'card-waiting')}">
                    <div class="presence-top">
                        <span class="presence-icon">${t.icon}</span>
                        <div class="presence-titles">
                            <h4>${t.title}</h4>
                            <p>${t.desc}</p>
                        </div>
                    </div>

                    <div class="presence-progress-row">
                        <div class="meter-track" style="margin: 0.6rem 0;">
                            <div class="meter-fill ${isReady ? 'fill-green' : 'fill-blue'}" style="width: ${progress}%;"></div>
                        </div>
                        <div class="presence-time-meta">
                            ${isClaimed ? '<span>Coletado ✓</span>' : (isReady ? '<span>Pronto para Resgatar!</span>' : `<span>Faltam: ${remM}m ${remS < 10 ? '0' : ''}${remS}s</span>`)}
                            <span>${progress.toFixed(0)}%</span>
                        </div>
                    </div>

                    <button class="presence-claim-btn ${isReady ? 'btn-pulse' : ''}" 
                            onclick="window.presenceRewardManager.claimReward('${t.id}')"
                            ${!isReady ? 'disabled' : ''}>
                        ${isClaimed ? 'Recompensado' : (isReady ? 'Resgatar Recompensa!' : 'Aguarde o Tempo')}
                    </button>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }
}

export const presenceRewardManager = new PresenceRewardManager();
window.presenceRewardManager = presenceRewardManager;
