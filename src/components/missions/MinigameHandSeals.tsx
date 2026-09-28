import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { audio } from '../../engine/audio';
import { Zap, CheckCircle2, RotateCcw, Flame, ShieldAlert, Award } from 'lucide-react';

interface HandSealDef {
  id: string;
  name: string;
  kanji: string;
  emoji: string;
  colorClass: string;
}

const SHINOBI_SEALS: HandSealDef[] = [
  { id: 'tora', name: 'Tigre (Tora)', kanji: '寅', emoji: '🐯', colorClass: 'border-amber-500 text-amber-400 bg-amber-950/40 hover:bg-amber-900/50' },
  { id: 'tatsu', name: 'Dragão (Tatsu)', kanji: '辰', emoji: '🐉', colorClass: 'border-emerald-500 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50' },
  { id: 'mi', name: 'Cobra (Mi)', kanji: '巳', emoji: '🐍', colorClass: 'border-teal-500 text-teal-400 bg-teal-950/40 hover:bg-teal-900/50' },
  { id: 'ushi', name: 'Boi (Ushi)', kanji: '丑', emoji: '🐂', colorClass: 'border-stone-500 text-stone-300 bg-stone-900/60 hover:bg-stone-850' },
  { id: 'tori', name: 'Pássaro (Tori)', kanji: '酉', emoji: '🦅', colorClass: 'border-cyan-500 text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/50' },
  { id: 'saru', name: 'Macaco (Saru)', kanji: '申', emoji: '🐒', colorClass: 'border-yellow-500 text-yellow-400 bg-yellow-950/40 hover:bg-yellow-900/50' },
  { id: 'inu', name: 'Cão (Inu)', kanji: '戌', emoji: '🐕', colorClass: 'border-blue-500 text-blue-400 bg-blue-950/40 hover:bg-blue-900/50' },
  { id: 'i', name: 'Javali (I)', kanji: '亥', emoji: '🐗', colorClass: 'border-rose-500 text-rose-400 bg-rose-950/40 hover:bg-rose-900/50' },
];

export interface MinigameResult {
  score: number;
  grade: 'S' | 'A' | 'B' | 'F';
  isCritical: boolean;
  bonusSuccessRate: number; // ex: 0.5 = +50%
}

interface MinigameHandSealsProps {
  onComplete?: (result: MinigameResult) => void;
  onCancel?: () => void;
  difficulty?: 'NORMAL' | 'HARD';
}

export const MinigameHandSeals: React.FC<MinigameHandSealsProps> = ({
  onComplete,
  onCancel,
  difficulty = 'NORMAL',
}) => {
  const sequenceLength = difficulty === 'HARD' ? 7 : 5;
  const initialTimeSec = difficulty === 'HARD' ? 6.5 : 8.0;

  // Gerar sequência aleatória de selos
  const generateSequence = useCallback(() => {
    const seq: HandSealDef[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      const randomSeal = SHINOBI_SEALS[Math.floor(Math.random() * SHINOBI_SEALS.length)];
      seq.push(randomSeal);
    }
    return seq;
  }, [sequenceLength]);

  const [targetSequence, setTargetSequence] = useState<HandSealDef[]>(() => generateSequence());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(initialTimeSec);
  const [gameState, setGameState] = useState<'PLAYING' | 'SUCCESS' | 'FAILED'>('PLAYING');
  const [finalResult, setFinalResult] = useState<MinigameResult | null>(null);
  const [shakeError, setShakeError] = useState<boolean>(false);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.05) {
          clearInterval(timer);
          handleGameOver(false, 0);
          return 0;
        }
        return prev - 0.05;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleGameOver = (isSuccess: boolean, remainingTime: number) => {
    if (isSuccess) {
      audio.playMissionSuccess();
      const timeBonusRatio = remainingTime / initialTimeSec;
      const isCritical = timeBonusRatio >= 0.45; // Se sobrou mais de 45% do tempo
      const grade = isCritical ? 'S' : timeBonusRatio >= 0.2 ? 'A' : 'B';
      const bonusSuccessRate = grade === 'S' ? 0.5 : grade === 'A' ? 0.35 : 0.2;
      const score = Math.round(1000 + remainingTime * 300);

      const res: MinigameResult = {
        score,
        grade,
        isCritical,
        bonusSuccessRate,
      };
      setFinalResult(res);
      setGameState('SUCCESS');
      if (onComplete) onComplete(res);
    } else {
      audio.playMissionFailure();
      const res: MinigameResult = {
        score: 0,
        grade: 'F',
        isCritical: false,
        bonusSuccessRate: 0,
      };
      setFinalResult(res);
      setGameState('FAILED');
      if (onComplete) onComplete(res);
    }
  };

  const handleSealClick = (sealId: string) => {
    if (gameState !== 'PLAYING') return;

    const expectedSeal = targetSequence[currentIndex];
    if (sealId === expectedSeal.id) {
      audio.playClick();
      const nextIdx = currentIndex + 1;
      if (nextIdx >= targetSequence.length) {
        // Concluiu todos com sucesso!
        setCurrentIndex(nextIdx);
        handleGameOver(true, timeLeft);
      } else {
        setCurrentIndex(nextIdx);
      }
    } else {
      // Erro: penalidade de tempo e feedback de erro
      audio.playCrit();
      setShakeError(true);
      setTimeout(() => setShakeError(false), 300);
      setTimeLeft((prev) => Math.max(0.1, prev - 1.2)); // -1.2s de penalidade
    }
  };

  const restart = () => {
    const newSeq = generateSequence();
    setTargetSequence(newSeq);
    setCurrentIndex(0);
    setTimeLeft(initialTimeSec);
    setGameState('PLAYING');
    setFinalResult(null);
  };

  const progressPercent = useMemo(() => {
    return Math.max(0, Math.min(100, (timeLeft / initialTimeSec) * 100));
  }, [timeLeft, initialTimeSec]);

  return (
    <div className={`p-6 bg-zinc-950/95 border rounded-3xl max-w-xl w-full shadow-2xl space-y-5 transition-all ${
      shakeError ? 'border-rose-500 scale-[0.99]' : 'border-zinc-800'
    }`}>
      {/* Cabeçalho do Minigame */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              Kuji-in: Rito dos Selos Shinobi
            </h3>
            <p className="text-[11px] font-mono text-zinc-400">
              Conclua a sequência de jutsus no tempo para garantir bônus críticos!
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

      {/* Barra de Tempo de Fluxo de Chakra */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Concentração de Chakra:
          </span>
          <span className={`font-bold ${timeLeft < 2.5 ? 'text-rose-400 animate-ping' : 'text-emerald-400'}`}>
            {timeLeft.toFixed(2)}s
          </span>
        </div>
        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
          <div
            style={{ width: `${progressPercent}%` }}
            className={`h-full rounded-full transition-all duration-75 ${
              progressPercent < 30 ? 'bg-rose-500' : progressPercent < 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>

      {/* Sequência Alvo de Selos */}
      <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-4 text-center space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
          Sequência Exigida ({currentIndex}/{targetSequence.length})
        </span>

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {targetSequence.map((seal, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex && gameState === 'PLAYING';

            return (
              <div
                key={`${seal.id}_${idx}`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 min-w-[56px] ${
                  isDone
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 scale-95 opacity-80'
                    : isCurrent
                    ? 'border-amber-400 bg-amber-950/60 text-amber-200 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
                }`}
              >
                <span className="text-lg sm:text-xl">{seal.emoji}</span>
                <span className="text-xs font-black font-mono">{seal.kanji}</span>
                <span className="text-[9px] font-mono truncate max-w-[50px]">{seal.name.split(' ')[0]}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Teclado de Selos para Clicar */}
      {gameState === 'PLAYING' && (
        <div className="grid grid-cols-4 gap-2">
          {SHINOBI_SEALS.map((seal) => (
            <button
              key={seal.id}
              onClick={() => handleSealClick(seal.id)}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-md ${seal.colorClass}`}
            >
              <span className="text-2xl">{seal.emoji}</span>
              <span className="text-xs font-bold font-mono">{seal.kanji}</span>
              <span className="text-[10px] font-mono tracking-tight">{seal.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tela de Desfecho do Minigame */}
      {gameState === 'SUCCESS' && finalResult && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block">
              Execução Perfeita! Rank {finalResult.grade}
            </span>
            <h4 className="text-base font-black text-emerald-200">
              {finalResult.isCritical ? '⚡ SUCEÇO CRÍTICO SHINOBI! (Espólios 2x)' : 'Sincronia Ninja Estabelecida!'}
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

      {gameState === 'FAILED' && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/60 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold block">
              Fluxo Interrompido
            </span>
            <h4 className="text-base font-black text-rose-200">
              Tempo Esgotado ou Selo Incorreto!
            </h4>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              O jutsu não sincronizou a tempo. Nenhuma penalidade será aplicada à missão, mas sem bônus adicionais.
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
