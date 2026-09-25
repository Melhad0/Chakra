import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { audio } from '../../engine/audio';
import { ViewHeader } from './ViewHeader';
import { Badge } from '../common/Badge';
import {
  Scroll,
  Eye,
  Shield,
  Swords,
  AlertTriangle,
  CheckCircle2,
  Target,
  Trophy,
  ChevronRight,
} from 'lucide-react';

export const ChuninExamView: React.FC = () => {
  const stats = useGameStore((s) => s.stats);
  const claimedRankRewards = useGameStore((s) => s.claimedRankRewards);

  // Fases do Exame: 1 (Escrita), 2 (Floresta da Morte), 3 (Torneio)
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [examPassed, setExamPassed] = useState<boolean>(false);

  // Elegibilidade: requer pelo menos 100 cliques all-time (Patente Gennin)
  const isEligible = stats.manualClicksAllTime >= 100 || !!claimedRankRewards['gennin'];

  // =========================================================================
  // FASE 1: TRAPAÇA FURTIVA (PROVA ESCRITA DE IBIKI MORINO)
  // =========================================================================
  const [cheatProgress, setCheatProgress] = useState<number>(0);
  const [_proctorAngle, setProctorAngle] = useState<number>(0);
  const [isProctorLooking, setIsProctorLooking] = useState<boolean>(false);
  const [detectedCount, setDetectedCount] = useState<number>(0);
  const [phase1Success, setPhase1Success] = useState<boolean>(false);

  // Movimento de varredura do fiscal Ibiki Morino
  useEffect(() => {
    if (activeStage !== 1 || phase1Success) return;

    const interval = setInterval(() => {
      setProctorAngle((prev) => {
        const next = (prev + 5) % 360;
        // O fiscal olha para o jogador quando o ângulo está entre 60 e 120 graus
        const looking = next >= 60 && next <= 120;
        setIsProctorLooking(looking);
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [activeStage, phase1Success]);

  // Ação de colar na Fase 1
  const handleCheatTick = () => {
    if (phase1Success) return;

    if (isProctorLooking) {
      audio.playCrit();
      setDetectedCount((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          // Desclassificado
          setCheatProgress(0);
          alert('Ibiki Morino: Desclassificado! 5 avisos por postura suspeita. Reiniciando a prova.');
          return 0;
        }
        return next;
      });
      return;
    }

    audio.playClick();
    setCheatProgress((prev) => {
      const next = Math.min(100, prev + 8);
      if (next >= 100) {
        audio.playLevelUp();
        setPhase1Success(true);
      }
      return next;
    });
  };

  // =========================================================================
  // FASE 2: FLORESTA DA MORTE (PERGAMINHOS DO CÉU E DA TERRA)
  // =========================================================================
  const [forestTimer, setForestTimer] = useState<number>(180);
  const [hasHeavenScroll, setHasHeavenScroll] = useState<boolean>(false);
  const [hasEarthScroll, setHasEarthScroll] = useState<boolean>(false);
  const [squadHp, setSquadHp] = useState<number>(100);
  const [forestEventLog, setForestEventLog] = useState<string>('Você adentrou o Portão 44 da Floresta da Morte.');
  const [phase2Success, setPhase2Success] = useState<boolean>(false);

  useEffect(() => {
    if (activeStage !== 2 || phase2Success) return;

    const interval = setInterval(() => {
      setForestTimer((prev) => {
        if (prev <= 1) {
          alert('Tempo esgotado na Floresta da Morte! Reiniciando a expedição.');
          setHasHeavenScroll(false);
          setHasEarthScroll(false);
          setSquadHp(100);
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStage, phase2Success]);

  const handleForestSearch = () => {
    audio.playClick();
    const roll = Math.random();

    if (!hasHeavenScroll && roll < 0.4) {
      audio.playLevelUp();
      setHasHeavenScroll(true);
      setForestEventLog('Emboscada bem-sucedida! Pergaminho do Céu obtido da equipe de Ame.');
    } else if (!hasEarthScroll && roll < 0.4) {
      audio.playLevelUp();
      setHasEarthScroll(true);
      setForestEventLog('Pergaminho da Terra recuperado após neutralizar marionetes venenosas!');
    } else if (roll < 0.7) {
      // Confronto
      audio.playCrit();
      setSquadHp((prev) => {
        const next = Math.max(10, prev - 15);
        setForestEventLog(`Combate na copa das árvores contra o Time do Som! Vitalidade do esquadrão: ${next}%.`);
        return next;
      });
    } else {
      setForestEventLog('Trilha vazia. Pegadas de cobras gigantes avistadas na lama.');
    }

    if (hasHeavenScroll && hasEarthScroll) {
      audio.playLevelUp();
      setPhase2Success(true);
      setForestEventLog('Ambos os pergaminhos reunidos! A Torre Central foi destrancada com louvor.');
    }
  };

  // =========================================================================
  // FASE 3: TORNEIO DA ARENA (PARRY / CONTRA-ATAQUE 1V1)
  // =========================================================================
  const [rivalHp, setRivalHp] = useState<number>(100);
  const [playerArenaHp, setPlayerArenaHp] = useState<number>(100);
  const [parryRingScale, setParryRingScale] = useState<number>(1.8);
  const [parryFeedback, setParryFeedback] = useState<string | null>(null);

  // Anel de Parry se contraindo
  useEffect(() => {
    if (activeStage !== 3 || examPassed) return;

    const interval = setInterval(() => {
      setParryRingScale((prev) => {
        const next = prev - 0.05;
        if (next <= 0.8) {
          // Golpe do rival acertou
          setPlayerArenaHp((hp) => {
            const nextHp = Math.max(0, hp - 12);
            if (nextHp <= 0) {
              alert('Derrota na Arena! A equipe médica de Konoha interveio. Reiniciando o duelo.');
              return 100;
            }
            return nextHp;
          });
          setParryFeedback('Acerto Sofrido! Janela de Parry perdida.');
          setTimeout(() => setParryFeedback(null), 500);
          return 1.8;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [activeStage, examPassed]);

  const handleParryClick = () => {
    // Janela perfeita: anel entre 0.95 e 1.15
    const isPerfect = parryRingScale >= 0.95 && parryRingScale <= 1.15;
    const isGood = parryRingScale >= 0.85 && parryRingScale <= 1.25;

    if (isPerfect) {
      audio.playCrit();
      setRivalHp((hp) => {
        const next = Math.max(0, hp - 25);
        if (next <= 0) {
          audio.playLevelUp();
          setExamPassed(true);
          useGameStore.setState((s) => ({
            chakra: s.chakra.add(500000),
            chakraAncestral: s.chakraAncestral.add(5),
          }));
        }
        return next;
      });
      setParryFeedback('PARRY PERFEITO! Contra-ataque de Punho Suave (-25 HP)');
      setParryRingScale(1.8);
    } else if (isGood) {
      audio.playClick();
      setRivalHp((hp) => Math.max(0, hp - 10));
      setParryFeedback('Bloqueio Parcial (-10 HP)');
      setParryRingScale(1.8);
    } else {
      audio.playCrit();
      setParryFeedback('Parry Errado!');
    }

    setTimeout(() => setParryFeedback(null), 700);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#08090d] text-zinc-100 overflow-hidden select-none">
      {/* Cabeçalho Fixo Universal */}
      <ViewHeader
        title="Pavilhão do Exame Chūnin Oficial"
        subtitle="As Três Fases Clássicas de Graduação Ninja de Konohagakure"
        badgeText={examPassed ? 'Graduado Chūnin' : `Fase ${activeStage} em Andamento`}
        badgeVariant={examPassed ? 'production' : 'warning'}
        icon={<Scroll className="w-4 h-4 text-amber-400 stroke-[1.75]" />}
      />

      <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto custom-scrollbar gap-4 lg:gap-6 max-w-6xl mx-auto w-full">
        {/* ================================================================= */}
        {/* TRILHA DE FASES SUPERIOR COM STEPPER                              */}
        {/* ================================================================= */}
        <nav className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
          {/* Passo 1 */}
          <button
            onClick={() => setActiveStage(1)}
            className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 ${
              activeStage === 1
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                : phase1Success
                ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                phase1Success
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
              }`}
            >
              {phase1Success ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider block">1ª Etapa</span>
              <h4 className="text-xs font-semibold text-zinc-200">Trapaça Furtiva</h4>
            </div>
          </button>

          <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />

          {/* Passo 2 */}
          <button
            disabled={!phase1Success}
            onClick={() => setActiveStage(2)}
            className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 ${
              !phase1Success
                ? 'opacity-40 cursor-not-allowed bg-zinc-950/30 border-zinc-850'
                : activeStage === 2
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                : phase2Success
                ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                phase2Success
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
              }`}
            >
              {phase2Success ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider block">2ª Etapa</span>
              <h4 className="text-xs font-semibold text-zinc-200">Floresta da Morte</h4>
            </div>
          </button>

          <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />

          {/* Passo 3 */}
          <button
            disabled={!phase2Success}
            onClick={() => setActiveStage(3)}
            className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 ${
              !phase2Success
                ? 'opacity-40 cursor-not-allowed bg-zinc-950/30 border-zinc-850'
                : activeStage === 3
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                : examPassed
                ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                examPassed
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
              }`}
            >
              {examPassed ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider block">3ª Etapa</span>
              <h4 className="text-xs font-semibold text-zinc-200">Torneio da Arena</h4>
            </div>
          </button>
        </nav>

        {/* CONTROLE DE ELEGIBILIDADE */}
        {!isEligible && (
          <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-2xl flex items-center gap-3 text-amber-300 font-mono text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <div>
              <h4 className="font-bold">Alistamento Pendente de Requisitos</h4>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                O Exame Chūnin requer formalização como Ninja Gennin (mínimo de 100 cliques manuais acumulados).
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PALCO DA FASE ATIVA: MINIGAME INTERATIVO                          */}
        {/* ================================================================= */}
        <section className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col justify-between">
          {/* FASE 1: TRAPAÇA FURTIVA */}
          {activeStage === 1 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="chakra">Prova Teórica de 10 Questões</Badge>
                  <h2 className="text-lg font-bold text-zinc-100 mt-1">
                    Trapaceie sem ser Detectado pelos Fiscais
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Cole as respostas de ninjas mais inteligentes enquanto o fiscal Ibiki Morino olha para outro lado.
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-zinc-400 block">Suspeita dos Fiscais:</span>
                  <span className={detectedCount >= 3 ? 'text-rose-400 font-bold' : 'text-zinc-200 font-semibold'}>
                    {detectedCount} de 5 Advertências
                  </span>
                </div>
              </div>

              {/* Sensor Visual do Fiscal */}
              <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                <div
                  className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                    isProctorLooking
                      ? 'border-rose-500 bg-rose-950/40 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <Eye className="w-12 h-12 stroke-[1.5]" />
                </div>

                <span
                  className={`mt-3 text-xs font-mono font-bold tracking-wider uppercase ${
                    isProctorLooking ? 'text-rose-400 animate-pulse' : 'text-zinc-500'
                  }`}
                >
                  {isProctorLooking ? 'O FISCAL ESTÁ OLHANDO!' : 'O fiscal está distraído'}
                </span>

                {/* Barra de Progresso da Cola */}
                <div className="w-full max-w-md mt-6">
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>Gabarito da Prova Preenchido:</span>
                    <strong className="text-amber-300">{cheatProgress}%</strong>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      style={{ width: `${cheatProgress}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-150"
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Colar */}
              <div className="flex justify-center">
                {phase1Success ? (
                  <button
                    onClick={() => setActiveStage(2)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Prova Concluída! Avançar para a Floresta da Morte
                  </button>
                ) : (
                  <button
                    onClick={handleCheatTick}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Espiar Gabarito Furtivamente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FASE 2: FLORESTA DA MORTE */}
          {activeStage === 2 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="danger">Sobrevivência Selvagem • 120 Horas</Badge>
                  <h2 className="text-lg font-bold text-zinc-100 mt-1">
                    Conquista dos Pergaminhos do Céu & da Terra
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Sobreviva aos perigos e vença esquadrões rivais para alcançar a Torre Central com os dois pergaminhos.
                  </p>
                </div>

                <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 text-right font-mono">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Tempo Restante</span>
                  <span className="text-xl font-bold text-rose-400">{forestTimer}s</span>
                </div>
              </div>

              {/* Status dos Pergaminhos e Esquadrão */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 ${
                    hasHeavenScroll
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Scroll className="w-6 h-6 stroke-[1.5]" />
                  <div>
                    <h4 className="text-xs font-bold">Pergaminho do Céu</h4>
                    <span className="text-[10px] font-mono">
                      {hasHeavenScroll ? 'Recuperado com Sucesso' : 'Em posse de equipe rival'}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 ${
                    hasEarthScroll
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Scroll className="w-6 h-6 stroke-[1.5]" />
                  <div>
                    <h4 className="text-xs font-bold">Pergaminho da Terra</h4>
                    <span className="text-[10px] font-mono">
                      {hasEarthScroll ? 'Recuperado com Sucesso' : 'Em posse de equipe rival'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-emerald-400 stroke-[1.5]" />
                  <div>
                    <h4 className="text-xs font-bold">Vitalidade do Esquadrão</h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{squadHp}% HP</span>
                  </div>
                </div>
              </div>

              {/* Log de Eventos da Floresta */}
              <div className="p-4 bg-zinc-950/80 border border-zinc-850 rounded-xl font-mono text-xs text-zinc-300">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
                  Relatório de Batedores:
                </span>
                <p>{forestEventLog}</p>
              </div>

              {/* Botões de Ação na Floresta */}
              <div className="flex justify-center gap-3">
                {phase2Success ? (
                  <button
                    onClick={() => setActiveStage(3)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Torre Central Desbloqueada! Avançar para o Torneio
                  </button>
                ) : (
                  <button
                    onClick={handleForestSearch}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-mono font-bold transition border border-zinc-700 shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Swords className="w-4 h-4 text-orange-400" /> Explorar Bosque e Emboscar Equipe
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FASE 3: TORNEIO DA ARENA (PARRY / CONTRA-ATAQUE) */}
          {activeStage === 3 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="chakra">Duelo Decisivo da Arena Principal</Badge>
                  <h2 className="text-lg font-bold text-zinc-100 mt-1">
                    Duelo 1v1 com Timing de Contra-Ataque (Parry)
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Aguarde o anel externo se alinhar com o círculo central e clique no momento exato para desferir um contra-ataque perfeito.
                  </p>
                </div>

                <div className="text-right font-mono text-xs space-y-1">
                  <div>
                    <span className="text-zinc-400 mr-2">Seu HP:</span>
                    <strong className="text-emerald-400">{playerArenaHp}%</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 mr-2">Rival:</span>
                    <strong className="text-rose-400">{rivalHp}%</strong>
                  </div>
                </div>
              </div>

              {/* Arena com Círculo de Parry */}
              <div className="p-8 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative min-h-[220px]">
                {/* Anel Alvo Central */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center relative">
                  {/* Anel em contração dinâmica */}
                  <div
                    style={{
                      transform: `scale(${parryRingScale})`,
                      transition: 'transform 0.05s linear',
                    }}
                    className={`absolute inset-0 rounded-full border-2 pointer-events-none ${
                      parryRingScale >= 0.95 && parryRingScale <= 1.15
                        ? 'border-emerald-400 shadow-[0_0_15px_#10b981]'
                        : 'border-orange-500'
                    }`}
                  />
                  <Target className="w-8 h-8 text-zinc-400" />
                </div>

                {parryFeedback && (
                  <div className="mt-4 font-mono font-bold text-xs text-amber-300 animate-in fade-in">
                    {parryFeedback}
                  </div>
                )}
              </div>

              {/* Botão de Parry */}
              <div className="flex justify-center">
                {examPassed ? (
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 justify-center">
                      <Trophy className="w-5 h-5 text-amber-400" /> Parabéns! Promovido a Ninja Chūnin Oficial!
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Recompensas concedidas: +500.000 Chakra e +5 Chakra Ancestral
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleParryClick}
                    className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg active:scale-95 cursor-pointer"
                  >
                    Executar Bloqueio Perfeito (Parry)
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
