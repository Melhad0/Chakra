/**
 * effects.js - Motor de Cinética Visual, Física Vetorial e Game Juice
 * Controla:
 * - Dispersão parabólica de números de chakra e dano
 * - Tremores de tela focais (Screen Shake no palco do selo)
 * - Ondas de choque radiais
 * - Alternador de Modo Cinético (60 FPS) vs Modo Econômico
 */

class VisualEffectsEngine {
    constructor() {
        this.kineticMode = true; // true = 60 FPS full FX, false = economic/reduced motion
        try {
            const saved = localStorage.getItem("chakra_kinetic_mode");
            if (saved !== null) {
                this.kineticMode = saved === "true";
            } else if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.kineticMode = false;
            }
        } catch (_) {}

        this.floatingNumbers = [];
        this.shockwaves = [];
        this.stageContainer = null;
        this.lastTime = performance.now();
    }

    init(stageId = "click-stage") {
        this.stageContainer = document.getElementById(stageId);
    }

    toggleKineticMode() {
        this.kineticMode = !this.kineticMode;
        try {
            localStorage.setItem("chakra_kinetic_mode", this.kineticMode ? "true" : "false");
        } catch (_) {}
        const btn = document.getElementById("kinetic-toggle-btn");
        if (btn) {
            btn.innerText = this.kineticMode ? "⚡ Efeitos: 60 FPS" : "🌱 Efeitos: Econômico";
        }
        return this.kineticMode;
    }

    isKinetic() {
        return this.kineticMode;
    }

    /**
     * Spawn de Número Flutuante com Balística Parabólica
     * Vetor com ângulo entre 60° e 120° (para cima e leve abertura lateral)
     */
    spawnParabolicNumber(x, y, text, isCrit = false) {
        const container = this.stageContainer || document.body;
        const el = document.createElement("div");
        el.className = `kinetic-number ${isCrit ? "crit-number" : "normal-number"}`;
        el.innerText = text;

        container.appendChild(el);

        let localX = x;
        let localY = y;
        if (container !== document.body) {
            const rect = container.getBoundingClientRect();
            localX = x - rect.left;
            localY = y - rect.top;
        }

        // Ângulo aleatório entre 65° e 115° em radianos (balística parabólica)
        const angleDeg = 65 + Math.random() * 50;
        const angleRad = (angleDeg * Math.PI) / 180;
        const initialSpeed = isCrit ? (Math.random() * 4 + 7) : (Math.random() * 3 + 5);

        // Decomposição vetorial
        const vx = (Math.random() > 0.5 ? 1 : -1) * Math.cos(angleRad) * initialSpeed;
        const vy = -Math.sin(angleRad) * initialSpeed;

        let posX = localX + (Math.random() - 0.5) * 20;
        let posY = localY;
        let curVx = vx;
        let curVy = vy;
        const gravity = 0.24;
        let opacity = 1.0;
        let scale = isCrit ? 1.4 : 1.0;

        const animStart = performance.now();
        const duration = isCrit ? 900 : 750;

        const updateFrame = (now) => {
            const elapsed = now - animStart;
            if (elapsed >= duration || opacity <= 0) {
                el.remove();
                return;
            }

            posX += curVx;
            posY += curVy;
            curVy += gravity; // Aceleração gravitacional contínua

            // Fade out nos últimos 40% da vida útil
            if (elapsed > duration * 0.55) {
                opacity -= 0.045;
            }

            el.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`;
            el.style.opacity = Math.max(0, opacity);

            requestAnimationFrame(updateFrame);
        };

        requestAnimationFrame(updateFrame);
    }

    /**
     * Tremor de tela focalizado no palco do selo (sem sacudir a tela inteira)
     */
    triggerStageShake(intensity = 6, duration = 250) {
        if (!this.kineticMode) return;
        const target = this.stageContainer || document.getElementById("click-btn");
        if (!target) return;

        target.classList.remove("stage-shaking");
        void target.offsetWidth; // Força reflow CSS
        target.classList.add("stage-shaking");

        setTimeout(() => {
            target.classList.remove("stage-shaking");
        }, duration);
    }

    /**
     * Onda de choque radial translúcida ao clicar no selo
     */
    spawnRadialShockwave(centerX, centerY, isCrit = false) {
        if (!this.kineticMode) return;
        const container = this.stageContainer || document.body;

        let localX = centerX;
        let localY = centerY;
        if (container !== document.body) {
            const rect = container.getBoundingClientRect();
            localX = centerX - rect.left;
            localY = centerY - rect.top;
        }

        const wave = document.createElement("div");
        wave.className = `radial-shockwave ${isCrit ? "crit-shockwave" : ""}`;
        wave.style.left = `${localX}px`;
        wave.style.top = `${localY}px`;

        container.appendChild(wave);

        setTimeout(() => {
            wave.remove();
        }, 550);
    }

    /**
     * Flash de impacto ao causar dano em chefe do Gauntlet
     */
    triggerHitFlash(targetEl) {
        const el = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
        if (!el) return;
        el.classList.add("hit-flash");
        setTimeout(() => {
            el.classList.remove("hit-flash");
        }, 130);
    }

    /**
     * Animação direcional de corte de chakra atravessando o sprite
     */
    spawnSlashImpact(targetEl) {
        if (!targetEl || !this.kineticMode) return;
        const slash = document.createElement("div");
        slash.className = "slash-impact-line";
        const angle = (Math.random() - 0.5) * 80;
        slash.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        targetEl.appendChild(slash);
        setTimeout(() => slash.remove(), 260);
    }

    /**
     * Feixe de luz de chakra viajando entre nós da árvore genealógica
     */
    triggerLightBeam(fromNodeId, toNodeId) {
        const fromEl = document.getElementById(`node-${fromNodeId}`);
        const toEl = document.getElementById(`node-${toNodeId}`);
        if (!fromEl || !toEl || !this.kineticMode) return;

        fromEl.classList.add("node-pulsing");
        setTimeout(() => fromEl.classList.remove("node-pulsing"), 800);

        toEl.classList.add("node-unveiling");
        setTimeout(() => toEl.classList.remove("node-unveiling"), 1200);
    }
}

export const fx = new VisualEffectsEngine();
window.fx = fx;
