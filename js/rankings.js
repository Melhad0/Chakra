/**
 * rankings.js - Sistema de Rankings Segmentado & Patamares Shinobi
 * Categorias:
 * 1. Mestre dos Selos (Cliques na sessão)
 * 2. Lenda Histórica (Cliques na história)
 * 3. Pico de Poder (Maior CPS registrado)
 * 4. Ciclo de Reencarnações (Total de Prestígios)
 */

import { D, formatBigNumber } from './BigNumber.js';

export const SHINOBI_RANKS = [
    { name: "Estudante da Academia", badge: "🎒", reqCps: 0, title: "Iniciante dos Selos" },
    { name: "Gennin", badge: "🍃", reqCps: 15, title: "Protetor da Folha" },
    { name: "Chūnin", badge: "⚔️", reqCps: 500, title: "Líder de Esquadrão" },
    { name: "Tokubetsu Jōnin", badge: "📜", reqCps: 5000, title: "Especialista Tático" },
    { name: "Jōnin", badge: "🗡️", reqCps: 50000, title: "Elite de Elite" },
    { name: "ANBU", badge: "👺", reqCps: 500000, title: "Sombra Oculta" },
    { name: "Sábio (Sage)", badge: "🐸", reqCps: 10000000, title: "Mestre do Senjutsu" },
    { name: "Kage", badge: "👑", reqCps: 500000000, title: "Líder da Vila" },
    { name: "Lenda Shinobi", badge: "⚡", reqCps: 100000000000, title: "Poder Ancestral" },
    { name: "Deus Shinobi (Rikudou)", badge: "👁️", reqCps: 100000000000000, title: "Criador dos Mundos" }
];

export class RankingsManager {
    constructor() {
        this.currentTab = "session_clicks"; // "session_clicks", "total_clicks", "peak_cps", "prestige_cycles"
    }

    getShinobiRank(peakCps) {
        const cps = D(peakCps);
        let currentRank = SHINOBI_RANKS[0];
        let nextRank = SHINOBI_RANKS[1];

        for (let i = SHINOBI_RANKS.length - 1; i >= 0; i--) {
            if (cps.gte(SHINOBI_RANKS[i].reqCps)) {
                currentRank = SHINOBI_RANKS[i];
                nextRank = SHINOBI_RANKS[i + 1] || null;
                break;
            }
        }
        return { currentRank, nextRank };
    }

    renderUI(gameState, sessionClicks) {
        const container = document.getElementById("rankings-container");
        if (!container) return;

        const peakCps = D(gameState.peak_cps || gameState.cps || 0);
        const { currentRank, nextRank } = this.getShinobiRank(peakCps);

        let progressPct = 100;
        if (nextRank) {
            const curReq = D(currentRank.reqCps);
            const nextReq = D(nextRank.reqCps);
            const diff = nextReq.sub(curReq);
            const prog = peakCps.sub(curReq).max(0);
            progressPct = Math.min(100, Math.max(0, prog.div(diff).toNumber() * 100));
        }

        const username = localStorage.getItem("username") || "Shinobi";

        // Simulated Leaderboard entries for flavor and competitive feel
        const leaderboards = {
            session_clicks: [
                { rank: 1, name: "Naruto Uzumaki", score: "12,500 Cliques", badge: "🦊" },
                { rank: 2, name: `${username} (Você)`, score: `${(sessionClicks || 0).toLocaleString()} Cliques`, badge: "⭐", isPlayer: true },
                { rank: 3, name: "Rock Lee", score: "8,900 Cliques", badge: "💪" },
                { rank: 4, name: "Might Guy", score: "7,800 Cliques", badge: "🔥" },
                { rank: 5, name: "Sasuke Uchiha", score: "6,400 Cliques", badge: "⚡" },
                { rank: 6, name: "Kiba Inuzuka", score: "4,200 Cliques", badge: "🐕" }
            ],
            total_clicks: [
                { rank: 1, name: "Hashirama Senju", score: "250,000 Cliques", badge: "🌲" },
                { rank: 2, name: "Minato Namikaze", score: "180,000 Cliques", badge: "🟡" },
                { rank: 3, name: `${username} (Você)`, score: `${(gameState.clicks || 0).toLocaleString()} Cliques`, badge: "⭐", isPlayer: true },
                { rank: 4, name: "Tobirama Senju", score: "95,000 Cliques", badge: "🌊" },
                { rank: 5, name: "Jiraiya", score: "72,000 Cliques", badge: "🐸" }
            ],
            peak_cps: [
                { rank: 1, name: "Hagoromo Otsutsuki", score: "100.0 Qd CPS", badge: "👁️" },
                { rank: 2, name: "Madara Rikudou", score: "50.0 T CPS", badge: "🌙" },
                { rank: 3, name: `${username} (Você)`, score: `${formatBigNumber(peakCps)} CPS`, badge: "⭐", isPlayer: true },
                { rank: 4, name: "Naruto (Modo Kurama)", score: "1.0 T CPS", badge: "🦊" },
                { rank: 5, name: "Sasuke (Rinnegan)", score: "850.0 B CPS", badge: "⚡" }
            ],
            prestige_cycles: [
                { rank: 1, name: "Indra & Asura (Reencarnados)", score: "100 Ciclos", badge: "♾️" },
                { rank: 2, name: "Orochimaru (Trocas de Corpo)", score: "45 Ciclos", badge: "🐍" },
                { rank: 3, name: `${username} (Você)`, score: `${gameState.total_prestiges || 0} Ciclos`, badge: "⭐", isPlayer: true },
                { rank: 4, name: "Danzo Shimura", score: "10 Ciclos", badge: "👁️" }
            ]
        };

        const activeList = leaderboards[this.currentTab] || leaderboards.session_clicks;

        let html = `
            <div class="rankings-header">
                <h3>🏆 Sistema de Classificações Shinobi</h3>
                <p>Monitore seus patamares de poder ninja e compare seu desempenho contra as maiores lendas do mundo shinobi.</p>
            </div>

            <!-- Patamar Ninja do Jogador -->
            <div class="shinobi-rank-card">
                <div class="rank-badge">${currentRank.badge}</div>
                <div class="rank-details">
                    <span class="rank-subtitle">Patamar Shinobi Atual</span>
                    <h2 class="rank-title">${currentRank.name}</h2>
                    <span class="rank-motto">"${currentRank.title}"</span>

                    <div class="rank-progress-block">
                        <div class="rank-progress-label">
                            <span>Progresso para ${nextRank ? nextRank.name : 'Nível Máximo'}:</span>
                            <span>${nextRank ? `${progressPct.toFixed(1)}%` : 'Dominado'}</span>
                        </div>
                        <div class="meter-track">
                            <div class="meter-fill fill-gold" style="width: ${progressPct}%;"></div>
                        </div>
                        <div class="rank-cps-req">
                            <span>Pico Atual: ${formatBigNumber(peakCps)} CPS</span>
                            ${nextRank ? `<span>Meta: ${formatBigNumber(D(nextRank.reqCps))} CPS</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navegação de Categorias de Ranking -->
            <div class="ranking-tabs">
                <button class="rank-cat-btn ${this.currentTab === 'session_clicks' ? 'active' : ''}" 
                        onclick="window.rankingsManager.switchTab('session_clicks')">
                    ✋ Mestre dos Selos (Sessão)
                </button>
                <button class="rank-cat-btn ${this.currentTab === 'total_clicks' ? 'active' : ''}" 
                        onclick="window.rankingsManager.switchTab('total_clicks')">
                    📜 Lenda Histórica (Cliques)
                </button>
                <button class="rank-cat-btn ${this.currentTab === 'peak_cps' ? 'active' : ''}" 
                        onclick="window.rankingsManager.switchTab('peak_cps')">
                    ⚡ Pico de Poder (CPS)
                </button>
                <button class="rank-cat-btn ${this.currentTab === 'prestige_cycles' ? 'active' : ''}" 
                        onclick="window.rankingsManager.switchTab('prestige_cycles')">
                    🌀 Ciclo de Reencarnações
                </button>
            </div>

            <!-- Tabela de Classificação -->
            <div class="leaderboard-table-card">
                <div class="leaderboard-table-header">
                    <span class="col-pos">#</span>
                    <span class="col-ninja">Shinobi</span>
                    <span class="col-score">Pontuação</span>
                </div>
                <div class="leaderboard-rows">
                    ${activeList.map(item => `
                        <div class="leaderboard-row ${item.isPlayer ? 'player-row' : ''}">
                            <span class="col-pos pos-${item.rank}">
                                ${item.rank === 1 ? '🥇' : (item.rank === 2 ? '🥈' : (item.rank === 3 ? '🥉' : item.rank))}
                            </span>
                            <span class="col-ninja">
                                <span class="ninja-icon">${item.badge}</span>
                                <span class="ninja-name">${item.name}</span>
                            </span>
                            <span class="col-score">${item.score}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    switchTab(tab) {
        this.currentTab = tab;
        if (window.chakraGameUpdateRankings) {
            window.chakraGameUpdateRankings();
        }
    }
}

export const rankingsManager = new RankingsManager();
window.rankingsManager = rankingsManager;
