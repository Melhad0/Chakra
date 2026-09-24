/**
 * audio.js - Procedural Web Audio API Sound Engine
 * Synthesizes dynamic sound effects without external audio asset dependencies.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        try {
            this.isMuted = localStorage.getItem("chakra_muted") === "true";
        } catch (_) {}
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem("chakra_muted", this.isMuted ? "true" : "false");
        } catch (_) {}
        return this.isMuted;
    }

    playTone(freq, type = "sine", duration = 0.1, gainVal = 0.1, freqEnd = null) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (freqEnd !== null) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + duration);
            }

            gain.gain.setValueAtTime(gainVal, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            console.warn("Audio error:", e);
        }
    }

    playNoise(duration = 0.15, gainVal = 0.08) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = 800;

            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(gainVal, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
        } catch (e) {
            console.warn("Audio noise error:", e);
        }
    }

    playClick() {
        // High ninja hand seal tap
        this.playTone(420, "triangle", 0.07, 0.08, 680);
    }

    playCrit() {
        // Sharp metallic blade sound + whoosh
        this.playTone(880, "sawtooth", 0.12, 0.12, 1200);
        this.playNoise(0.08, 0.05);
    }

    playJutsu() {
        // Deep chakra burst
        this.playTone(180, "sine", 0.35, 0.2, 55);
        this.playNoise(0.25, 0.1);
    }

    playBuy() {
        // Gentle confirmation chime
        this.playTone(523.25, "sine", 0.09, 0.07, 659.25);
    }

    playLevelUp() {
        // Ascending shinobi fanfare
        if (this.isMuted) return;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((f, idx) => {
            setTimeout(() => this.playTone(f, "triangle", 0.18, 0.1), idx * 70);
        });
    }

    playPrestige() {
        // Resonant ancient temple bell
        this.playTone(220, "sine", 1.2, 0.25, 110);
        setTimeout(() => this.playTone(330, "sine", 0.9, 0.15, 165), 150);
    }

    playAlert() {
        // Quick danger beep (Chunin Exam suspicion)
        this.playTone(700, "square", 0.08, 0.1, 850);
    }
}

export const sound = new SoundEngine();
