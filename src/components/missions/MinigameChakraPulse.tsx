import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audio } from '../../engine/audio';
import { MinigameResult } from './MinigameHandSeals';
import { Activity, Sparkles, Award, RotateCcw, AlertTriangle } from 'lucide-react';

interface MinigameChakraPulseProps {
  onComplete?: (result: MinigameResult) => void;
  onCancel?: () => void;
}

export const MinigameChakraPulse: React.FC<MinigameChakraPulseProps> = ({
  onComplete,
  onCancel,
}) => {
  const [needlePos, setNeedlePos] = useState<number>(10);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failures, setFailures] = useState<number>(0);
  const [gameState, setGameState] = useState<'PLAYING' | 'SUCCESS' | 'FAILED'>('PLAYING');
  const [finalResult, setFinalResult] = useState<MinigameResult | null>(null);
  const [lastHitType, setLastHitType] = useState<'PERFECT' | 'GOOD' | 'MISS' | null>(null);

  const directionRef = useRef<number>(1);
  const speedRef = useRef<number>(1.2);
  const animFrameRef = useRef<number | null>(null);
  const posRef = useRef<number>(10);

  // Animação da agulha oscilante
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let lastTime = performance.now();
    const update = (time: number) => {
      const dt = (time - lastTime) / 16.66;
      lastTime = time;

      posRef.current += directionRef.current * speedRef.current * dt;

      if (posRef.current >= 95) {
        posRef.current = 95;
        directionRef.current = -1;
      } else if (posRef.current <= 5) {
        posRef.current = 5;
        directionRef.current = 1;
      }

      setNeedlePos(posRef.current);
      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  const handlePulseTap = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const currentPos = posRef.current;
    // Zona Perfeita (Dourada): 46% a 54%
    // Zona Boa (Verde): 36% a 64%
    const isPerfect = currentPos >= 46 && currentPos <= 54;
    const isGood = currentPos >= 36 && currentPos <= 64;

    if (isPerfect) {
      audio.playLevelUp();
      setLastHitType('PERFECT');
      const nextSuccess = successCount + 1;
      setSuccessCount(nextSuccess);
      speedRef.current += 0.35; // Acelera a cada acerto

      if (nextSuccess >= 3) {
        // Concluiu com 3 acertos
        const res: MinigameResult = {
          score: 1500,
          grade: 'S',
          isCritical: true,
          bonusSuccessRate: 0.5,
        };
        setFinalResult(res);
        setGameState('SUCCESS');
        if (onComplete) onComplete(res);
      }
    } else if (isGood) {
      audio.playClick();
      setLastHitType('GOOD');
      const nextSuccess = successCount + 1;
      setSuccessCount(nextSuccess);
      speedRef.current += 0.25;

      if (nextSuccess >= 3) {
        const res: MinigameResult = {
          score: 1100,
          grade: 'A',
          isCritical: false,
          bonusSuccessRate: 0.35,
        };
        setFinalResult(res);
        setGameState('SUCCESS');
        if (onComplete) onComplete(res);
      }
    } else {
      audio.playCrit();
      setLastHitType('MISS');
      const nextFailures = failures + 1;
      setFailures(nextFailures);

      if (nextFailures >= 2) {
        const res: MinigameResult = {
          score: 200,
          grade: 'F',
          isCritical: false,
          bonusSuccessRate: 0,
        };
        setFinalResult(res);
        setGameState('FAILED');
        if (onComplete) onComplete(res);
      }
    }
  }, [gameState, successCount, failures, onComplete]);

  const restart = () => {
    posRef.current = 10;
    speedRef.current = 1.2;
    directionRef.current = 1;
    setSuccessCount(0);
    setFailures(0);
    setLastHitType(null);
    setGameState('PLAYING');
    setFinalResult(null);
  };

  return (
    <div className="p-6 bg-zinc-950/95 border border-zinc-800 rounded-3xl max-w-xl w-full shadow-2xl space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              Sincronia de Pulso: Fluxo de Chakra
            </h3>
            <p className="text-[11px] font-mono text-zinc-400">
              Trave o pulso oscilante na zona de ressonância perfeita 3 vezes seguidas!
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-md border border-zinc-800"
          >
            Fechar
          </button>
        )}
      </div>

      {/* Indicadores de Progresso de Acertos e Falhas */}
      <div className="flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Sincronias Concluídas:</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                  idx < successCount
                    ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 text-rose-400">
          <span>Falhas:</span>
          <span className="font-bold">{failures}/2</span>
        </div>
      </div>

      {/* Medidor Oscilante de Chakra */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4">
        <div className="relative w-full h-10 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex items-center">
          {/* Zona Boa (Verde) */}
          <div
            className="absolute h-full bg-emerald-950/60 border-x border-emerald-600/50"
            style={{ left: '36%', width: '28%' }}
          />

          {/* Zona Perfeita (Dourada Central) */}
          <div
            className="absolute h-full bg-amber-500/40 border-x border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
            style={{ left: '46%', width: '8%' }}
          />

          {/* Agulha / Laser Oscilante */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)] z-10 transition-all duration-75"
            style={{ left: `${needlePos}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Feedback do Último Toque */}
        <div className="h-6 flex items-center justify-center font-mono text-xs font-bold">
          {lastHitType === 'PERFECT' && (
            <span className="text-amber-300 animate-bounce flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> PULSO DIVINO! (Crítico 100%)
            </span>
          )}
          {lastHitType === 'GOOD' && (
            <span className="text-emerald-400 flex items-center gap-1">
              ✓ Fluxo Estabilizado!
            </span>
          )}
          {lastHitType === 'MISS' && (
            <span className="text-rose-400 flex items-center gap-1">
              ✕ Fora de Ressonância! (-1 Tolerância)
            </span>
          )}
        </div>
      </div>

      {/* Botão de Disparo do Pulso */}
      {gameState === 'PLAYING' && (
        <button
          onClick={handlePulseTap}
          className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-sm font-black rounded-2xl shadow-xl shadow-cyan-950/60 border border-cyan-400 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Activity className="w-4 h-4 animate-spin" />
          <span>SINTONIZAR CHAKRA AGORA</span>
        </button>
      )}

      {/* Tela de Sucesso */}
      {gameState === 'SUCCESS' && finalResult && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block">
              Harmonia Plena Estabelecida! Rank {finalResult.grade}
            </span>
            <h4 className="text-base font-black text-emerald-200">
              {finalResult.isCritical ? '⚡ SUCEÇO CRÍTICO TOTAL! (Recompensas em Dobro)' : 'Frequência de Chakra Sincronizada!'}
            </h4>
            <p className="text-xs font-mono text-zinc-300 mt-1">
              Bônus de Sucesso na Missão: <strong>+{(finalResult.bonusSuccessRate * 100).toFixed(0)}%</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={restart}
              className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-mono rounded-xl border border-zinc-700 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Praticar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Tela de Falha */}
      {gameState === 'FAILED' && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/60 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold block">
              Dissonância de Energia
            </span>
            <h4 className="text-base font-black text-rose-200">
              Limite de Falhas Atingido!
            </h4>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              A agulha oscilou fora de ressonância. A missão prosseguirá com suas taxas naturais normais.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={restart}
              className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-mono rounded-xl border border-zinc-700 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Tentar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
