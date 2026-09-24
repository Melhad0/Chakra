/**
 * particles.js - HTML5 Canvas Shinobi Particle Engine
 * Renders chakra auras, floating text, and elemental jutsu bursts.
 */

class ParticleEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.texts = [];
        this.auraCenter = null;
        this.auraActive = true;
        this.auraTimer = 0;
    }

    init(canvasId = "fx-canvas") {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setAuraAnchor(element) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        this.auraCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    spawnBurst(x, y, count = 16, type = "chakra") {
        const palettes = {
            chakra: ["#00e5ff", "#2979ff", "#00b0ff", "#80d8ff"],
            fire: ["#ff3d00", "#ff6d00", "#ffab00", "#ff1744"],
            lightning: ["#d500f9", "#651fff", "#00e5ff", "#f50057"],
            wind: ["#00e676", "#1de9b6", "#a7ffeb", "#69f0ae"],
            kyuubi: ["#ff1744", "#d50000", "#ff5252", "#ff9100"],
            crit: ["#ffd700", "#ffab00", "#ff6d00", "#ffffff"],
            smoke: ["#f5f5f5", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#ffffff"]
        };

        const colors = palettes[type] || palettes.chakra;
        const isSmoke = type === "smoke";

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = isSmoke ? (Math.random() * 4 + 1.5) : (Math.random() * 5 + 2);
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (isSmoke ? 0.8 : 1),
                size: isSmoke ? (Math.random() * 8 + 5) : (Math.random() * 4 + 2),
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: isSmoke ? (Math.random() * 0.02 + 0.015) : (Math.random() * 0.03 + 0.02),
                spin: (Math.random() - 0.5) * 0.2,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }

    spawnFloatingText(x, y, text, isCrit = false) {
        this.texts.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y - 10,
            vy: -2.2,
            text,
            isCrit,
            alpha: 1,
            decay: 0.02
        });
    }

    updateAndRender(dt) {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Ambient Chakra Aura behind Seal if available
        if (this.auraActive && this.auraCenter) {
            this.auraTimer += dt * 3;
            if (Math.random() < 0.35) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 55 + 10;
                this.particles.push({
                    x: this.auraCenter.x + Math.cos(angle) * dist,
                    y: this.auraCenter.y + Math.sin(angle) * dist,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -Math.random() * 1.8 - 0.5,
                    size: Math.random() * 3 + 1.5,
                    color: Math.random() > 0.5 ? "#00e5ff" : "#ff7043",
                    alpha: 0.7,
                    decay: 0.025
                });
            }
        }

        // Render Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Render Floating Texts
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.y += t.vy;
            t.alpha -= t.decay;

            if (t.alpha <= 0) {
                this.texts.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, t.alpha);
            this.ctx.font = t.isCrit ? "bold 20px 'Shojumaru', 'Outfit', sans-serif" : "bold 15px 'Outfit', sans-serif";
            this.ctx.fillStyle = t.isCrit ? "#ffd700" : "#ffffff";
            this.ctx.shadowBlur = t.isCrit ? 12 : 6;
            this.ctx.shadowColor = t.isCrit ? "#ff3d00" : "#00e5ff";
            this.ctx.textAlign = "center";
            this.ctx.fillText(t.text, t.x, t.y);
            this.ctx.restore();
        }
    }
}

export const particles = new ParticleEngine();
