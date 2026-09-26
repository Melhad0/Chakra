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
  Lock,
  Sparkles,
  Award,
  Zap,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const ChuninExamView: React.FC = () => {
  const stats = useGameStore((s) => s.stats);
  const claimedRankRewards = useGameStore((s) => s.claimedRankRewards);
  const passedExams = useGameStore((s) => s.passedExams);
  const completeExam = useGameStore((s) => s.completeExam);
  const setView = useGameStore((s) => s.setView);

  // Status de aprovação oficial persistido
  const isChuninPassed = !!passedExams['chunin'];
  const isJoninPassed = !!passedExams['jonin'];

  // Seleção de Exame Ativo: Se já passou no Chūnin, abre por padrão no Jōnin
  const [selectedExamId, setSelectedExamId] = useState<'chunin' | 'jonin'>(
    isChuninPassed ? 'jonin' : 'chunin'
  );

  // Modal / Banner de Comemoração de Formatura recente
  const [showGraduationCelebration, setShowGraduationCelebration] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    title: string;
    description: string;
    benefits: string[];
  } | null>(null);

  // =========================================================================
  // EXAME CHŪNIN: FASES E ESTADOS
  // =========================================================================
  const [chuninStage, setChuninStage] = useState<1 | 2 | 3>(1);
  const [chuninExamPassed, setChuninExamPassed] = useState<boolean>(isChuninPassed);

  // Sincroniza com a store caso o jogador já tenha sido aprovado anteriormente
  useEffect(() => {
    if (isChuninPassed) {
      setChuninExamPassed(true);
    }
  }, [isChuninPassed]);

  // Elegibilidade Chūnin: requer pelo menos 100 cliques all-time (Patente Gennin)
  const isChuninEligible = stats.manualClicksAllTime >= 100 || !!claimedRankRewards['gennin'];

  // FASE 1 CHŪNIN: TRAPAÇA FURTIVA (IBIKI MORINO)
  const [cheatProgress, setCheatProgress] = useState<number>(0);
  const [_proctorAngle, setProctorAngle] = useState<number>(0);
  const [isProctorLooking, setIsProctorLooking] = useState<boolean>(false);
  const [detectedCount, setDetectedCount] = useState<number>(0);
  const [chuninPhase1Success, setChuninPhase1Success] = useState<boolean>(false);

  useEffect(() => {
    if (selectedExamId !== 'chunin' || chuninStage !== 1 || chuninPhase1Success) return;

    const interval = setInterval(() => {
      setProctorAngle((prev) => {
        const next = (prev + 5) % 360;
        const looking = next >= 60 && next <= 120;
        setIsProctorLooking(looking);
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [selectedExamId, chuninStage, chuninPhase1Success]);

  const handleCheatTick = () => {
    if (chuninPhase1Success) return;

    if (isProctorLooking) {
      audio.playCrit();
      setDetectedCount((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          setCheatProgress(0);
          alert('Ibiki Morino: Desclassificado! 5 advertências por postura suspeita. Reiniciando a prova.');
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
        setChuninPhase1Success(true);
      }
      return next;
    });
  };

  // FASE 2 CHŪNIN: FLORESTA DA MORTE (CÉU E TERRA)
  const [forestTimer, setForestTimer] = useState<number>(180);
  const [hasHeavenScroll, setHasHeavenScroll] = useState<boolean>(false);
  const [hasEarthScroll, setHasEarthScroll] = useState<boolean>(false);
  const [squadHp, setSquadHp] = useState<number>(100);
  const [forestEventLog, setForestEventLog] = useState<string>(
    'Você adentrou o Portão 44 da Floresta da Morte.'
  );
  const [chuninPhase2Success, setChuninPhase2Success] = useState<boolean>(false);

  useEffect(() => {
    if (selectedExamId !== 'chunin' || chuninStage !== 2 || chuninPhase2Success) return;

    const interval = setInterval(() => {
      setForestTimer((prev) => {
        if (prev <= 1) {
          alert('Tempo esgotado na Floresta da Morte! Reiniciando a incursão.');
          setHasHeavenScroll(false);
          setHasEarthScroll(false);
          setSquadHp(100);
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedExamId, chuninStage, chuninPhase2Success]);

  const handleForestSearch = () => {
    audio.playClick();
    const roll = Math.random();

    if (!hasHeavenScroll && roll < 0.4) {
      audio.playLevelUp();
      setHasHeavenScroll(true);
      setForestEventLog('Emboscada bem-sucedida! Pergaminho do Céu obtido da equipe adversária.');
    } else if (!hasEarthScroll && roll < 0.4) {
      audio.playLevelUp();
      setHasEarthScroll(true);
      setForestEventLog('Pergaminho da Terra recuperado após neutralizar marionetes venenosas!');
    } else if (roll < 0.7) {
      audio.playCrit();
      setSquadHp((prev) => {
        const next = Math.max(10, prev - 15);
        setForestEventLog(
          `Combate na copa das árvores contra o Time do Som! Vitalidade do esquadrão: ${next}%.`
        );
        return next;
      });
    } else {
      setForestEventLog('Trilha desimpedida. Pegadas de cobras gigantes avistadas na lama.');
    }

    if (hasHeavenScroll && hasEarthScroll) {
      audio.playLevelUp();
      setChuninPhase2Success(true);
      setForestEventLog('Ambos os pergaminhos reunidos! A Torre Central foi alcançada com louvor.');
    }
  };

  // FASE 3 CHŪNIN: TORNEIO DA ARENA FINAL (PARRY 1V1)
  const [rivalHp, setRivalHp] = useState<number>(100);
  const [playerArenaHp, _setPlayerArenaHp] = useState<number>(100);
  const [parryRingScale, setParryRingScale] = useState<number>(1.8);
  const [parryFeedback, setParryFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (selectedExamId !== 'chunin' || chuninStage !== 3 || chuninExamPassed) return;

    const interval = setInterval(() => {
      setParryRingScale((prev) => {
        const next = prev - 0.05;
        if (next <= 0.8) {
          setParryFeedback('Janela de Parry perdida! Mantenha a guarda.');
          setTimeout(() => setParryFeedback(null), 500);
          return 1.8;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [selectedExamId, chuninStage, chuninExamPassed]);

  const handleParryClick = () => {
    const isPerfect = parryRingScale >= 0.95 && parryRingScale <= 1.15;
    const isGood = parryRingScale >= 0.85 && parryRingScale <= 1.25;

    if (isPerfect) {
      audio.playCrit();
      setRivalHp((hp) => {
        const next = Math.max(0, hp - 25);
        if (next <= 0) {
          audio.playLevelUp();
          setChuninExamPassed(true);
          completeExam('chunin');
          setCelebrationDetails({
            title: 'Graduação Concluída: Ninja Chūnin Oficial!',
            description:
              'Você superou a prova de Ibiki Morino, conquistou os pergaminhos da Floresta da Morte e triunfou na Arena Central.',
            benefits: [
              'Patamar Shinobi atualizado para Ninja Chūnin na caixa principal!',
              'Missões de Rank C desbloqueadas imediatamente no Mural de Missões.',
              'Concessão do Colete Tático Verde de Konohagakure (+10% em Clicks Manuais).',
              '+500.000 de Chakra, +5 Ancestrais, 1 Bilhete Gacha e 3 Fragmentos de Armas.',
              'Acesso liberado ao Exame Jōnin de Elite & Mestria no Pavilhão!',
            ],
          });
          setShowGraduationCelebration(true);
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
      setParryFeedback('Timing Impreciso!');
    }

    setTimeout(() => setParryFeedback(null), 700);
  };

  // =========================================================================
  // EXAME JŌNIN DE ELITE & MESTRIA: FASES E ESTADOS
  // =========================================================================
  const [joninStage, setJoninStage] = useState<1 | 2 | 3>(1);
  const [joninExamPassed, setJoninExamPassed] = useState<boolean>(isJoninPassed);

  useEffect(() => {
    if (isJoninPassed) {
      setJoninExamPassed(true);
    }
  }, [isJoninPassed]);

  // Elegibilidade Jōnin: Requer aprovação no Exame Chūnin
  const isJoninEligible = isChuninPassed;

  // FASE 1 JŌNIN: O TESTE DOS GUIZOS DE KAKASHI HATAKE (VELOCIDADE REFLEXIVA)
  const [bellMeterPosition, setBellMeterPosition] = useState<number>(10);
  const [bellMeterDirection, setBellMeterDirection] = useState<'right' | 'left'>('right');
  const [bellsCaptured, setBellsCaptured] = useState<number>(0);
  const [kakashiFeedback, setKakashiFeedback] = useState<string | null>(null);
  const [joninPhase1Success, setJoninPhase1Success] = useState<boolean>(false);

  useEffect(() => {
    if (selectedExamId !== 'jonin' || joninStage !== 1 || joninPhase1Success) return;

    const interval = setInterval(() => {
      setBellMeterPosition((pos) => {
        let next = bellMeterDirection === 'right' ? pos + 3.5 : pos - 3.5;
        if (next >= 95) {
          setBellMeterDirection('left');
          return 95;
        }
        if (next <= 5) {
          setBellMeterDirection('right');
          return 5;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [selectedExamId, joninStage, joninPhase1Success, bellMeterDirection]);

  const handleCatchBellClick = () => {
    if (joninPhase1Success) return;

    // Zona de sucesso do guizo: 42% a 58%
    const isTargetHit = bellMeterPosition >= 42 && bellMeterPosition <= 58;

    if (isTargetHit) {
      audio.playCrit();
      const nextBells = bellsCaptured + 1;
      setBellsCaptured(nextBells);
      setKakashiFeedback(
        `Kakashi: "Impressionante reflexo! Guizo ${nextBells}/2 arrancado com sucesso."`
      );

      if (nextBells >= 2) {
        audio.playLevelUp();
        setJoninPhase1Success(true);
        setKakashiFeedback(
          'Kakashi: "Excelente espírito de equipe e velocidade. Você superou o Teste dos Guizos!"'
        );
      }
    } else {
      audio.playClick();
      setKakashiFeedback(
        'Kakashi desvia com o Shunshin lendo o Icha Icha: "Muito lento, shinobi!"'
      );
    }

    setTimeout(() => setKakashiFeedback(null), 1200);
  };

  // FASE 2 JŌNIN: RESSONÂNCIA ELEMENTAL DAS CINCO TRANSFORMAÇÕES
  const [elementalHarmony, setElementalHarmony] = useState<number>(0);
  const [targetElementPrompt, setTargetElementPrompt] = useState<string>('Katon');
  const [joninPhase2Success, setJoninPhase2Success] = useState<boolean>(false);

  const elementsList = [
    { name: 'Katon', label: 'Fogo (Katon)', color: 'text-orange-400 border-orange-500/50 bg-orange-950/40' },
    { name: 'Suiton', label: 'Água (Suiton)', color: 'text-blue-400 border-blue-500/50 bg-blue-950/40' },
    { name: 'Doton', label: 'Terra (Doton)', color: 'text-amber-500 border-amber-600/50 bg-amber-950/40' },
    { name: 'Futon', label: 'Vento (Futon)', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40' },
    { name: 'Raiton', label: 'Raio (Raiton)', color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40' },
  ];

  const handleInfuseElement = (elemName: string) => {
    if (joninPhase2Success) return;

    if (elemName === targetElementPrompt) {
      audio.playCrit();
      setElementalHarmony((prev) => {
        const next = Math.min(100, prev + 25);
        if (next >= 100) {
          audio.playLevelUp();
          setJoninPhase2Success(true);
        }
        return next;
      });

      // Sorteia o próximo elemento demandado pelo pergaminho
      const remaining = elementsList.filter((e) => e.name !== elemName);
      const nextChoice = remaining[Math.floor(Math.random() * remaining.length)].name;
      setTargetElementPrompt(nextChoice);
    } else {
      audio.playClick();
      setElementalHarmony((prev) => Math.max(0, prev - 10));
    }
  };

  // FASE 3 JŌNIN: DUELO CONTRA O CAPITÃO DA FORÇA ANBU MASCARADA
  const [anbuHp, setAnbuHp] = useState<number>(100);
  const [anbuRingScale, setAnbuRingScale] = useState<number>(1.8);
  const [anbuFeedback, setAnbuFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (selectedExamId !== 'jonin' || joninStage !== 3 || joninExamPassed) return;

    const interval = setInterval(() => {
      setAnbuRingScale((prev) => {
        const next = prev - 0.06;
        if (next <= 0.75) {
          setAnbuFeedback('Golpe de Espada ANBU! Guarda rompida.');
          setTimeout(() => setAnbuFeedback(null), 500);
          return 1.8;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [selectedExamId, joninStage, joninExamPassed]);

  const handleAnbuParryClick = () => {
    const isPerfect = anbuRingScale >= 0.95 && anbuRingScale <= 1.15;
    const isGood = anbuRingScale >= 0.85 && anbuRingScale <= 1.25;

    if (isPerfect) {
      audio.playCrit();
      setAnbuHp((hp) => {
        const next = Math.max(0, hp - 25);
        if (next <= 0) {
          audio.playLevelUp();
          setJoninExamPassed(true);
          completeExam('jonin');
          setCelebrationDetails({
            title: 'Graduação Suprema: Ninja Jōnin de Elite!',
            description:
              'Você tomou os guizos de Kakashi, harmonizou as 5 transformações de chakra e superou o Capitão Mascarado da ANBU.',
            benefits: [
              'Patamar Shinobi promovido a Ninja Jōnin de Elite na box principal!',
              'Desbloqueio de Missões de alto escalão Rank B e Rank A no Mural.',
              'Desconto de -3% permanente no custo de todos os geradores de chakra.',
              '+10.000.000 de Chakra, +20 Ancestrais e 10 Fragmentos de Armas Raras concedidos.',
              'Reconhecimento como Comandante de Esquadrões de Konohagakure!',
            ],
          });
          setShowGraduationCelebration(true);
        }
        return next;
      });
      setAnbuFeedback('PARRY JŌNIN PERFEITO! Ruptura de Selo ANBU (-25 HP)');
      setAnbuRingScale(1.8);
    } else if (isGood) {
      audio.playClick();
      setAnbuHp((hp) => Math.max(0, hp - 10));
      setAnbuFeedback('Defesa com Kunai (-10 HP)');
      setAnbuRingScale(1.8);
    } else {
      audio.playCrit();
      setAnbuFeedback('Guarda ANBU impenetrável!');
    }

    setTimeout(() => setAnbuFeedback(null), 600);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#08090d] text-zinc-100 overflow-hidden select-none">
      {/* Cabeçalho Fixo Universal */}
      <ViewHeader
        title="Pavilhão de Exames Oficiais de Konohagakure"
        subtitle="Ritos Sagrados de Graduação Shinobi para Elevação de Patamares e Missões"
        badgeText={
          selectedExamId === 'chunin'
            ? isChuninPassed
              ? 'Chūnin Graduado'
              : `Exame Chūnin • Fase ${chuninStage}`
            : isJoninPassed
            ? 'Jōnin de Elite Graduado'
            : `Exame Jōnin • Fase ${joninStage}`
        }
        badgeVariant={
          (selectedExamId === 'chunin' && isChuninPassed) ||
          (selectedExamId === 'jonin' && isJoninPassed)
            ? 'production'
            : 'warning'
        }
        icon={<Scroll className="w-4 h-4 text-amber-400 stroke-[1.75]" />}
      />

      <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto custom-scrollbar gap-4 lg:gap-6 max-w-6xl mx-auto w-full">
        {/* ================================================================= */}
        {/* SELETOR SUPERIOR DE EXAMES: CHŪNIN vs JŌNIN DE ELITE               */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between gap-3 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-2.5 shadow-xl flex-wrap">
          <div className="flex items-center gap-2">
            {/* Botão Exame Chūnin */}
            <button
              onClick={() => setSelectedExamId('chunin')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                selectedExamId === 'chunin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <Scroll className="w-4 h-4" />
              <span>Exame Chūnin</span>
              {isChuninPassed && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 text-[10px]">
                  Concluído ✔
                </span>
              )}
            </button>

            {/* Botão Exame Jōnin de Elite */}
            <button
              onClick={() => setSelectedExamId('jonin')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                selectedExamId === 'jonin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>Exame Jōnin de Elite</span>
              {isJoninPassed ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 text-[10px]">
                  Concluído ✔
                </span>
              ) : isChuninPassed ? (
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 text-[10px] animate-pulse">
                  Próximo Desafio!
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 text-[10px] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Requer Chūnin
                </span>
              )}
            </button>
          </div>

          {/* Atalho direto para o Mural de Missões */}
          <button
            onClick={() => setView('MISSIONS')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 transition cursor-pointer shadow-sm"
          >
            <span>Ver Mural de Missões</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* MODAL / BANNER DE FORMATURA APÓS VITÓRIA EM EXAME                  */}
        {/* ================================================================= */}
        {showGraduationCelebration && celebrationDetails && (
          <div className="p-6 bg-gradient-to-r from-emerald-950/90 via-zinc-900/95 to-amber-950/90 border-2 border-emerald-500/80 rounded-3xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <Badge variant="production">Decreto Oficial de Konohagakure</Badge>
                  <h2 className="text-xl font-black text-zinc-100 tracking-tight mt-0.5">
                    {celebrationDetails.title}
                  </h2>
                  <p className="text-xs text-zinc-300 font-mono mt-0.5">
                    {celebrationDetails.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGraduationCelebration(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-mono px-3 py-1 bg-zinc-900/80 rounded-lg border border-zinc-700 cursor-pointer"
              >
                Dispensar
              </button>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-2">
                Conquistas & Desbloqueios Concedidos:
              </span>
              <ul className="space-y-1.5 text-xs font-mono text-zinc-300">
                {celebrationDetails.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {selectedExamId === 'chunin' && (
                <button
                  onClick={() => {
                    setShowGraduationCelebration(false);
                    setSelectedExamId('jonin');
                  }}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  <span>Avançar para o Exame Jōnin de Elite</span>
                </button>
              )}

              <button
                onClick={() => setView('MISSIONS')}
                className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Scroll className="w-4 h-4" />
                <span>Explorar Missões Desbloqueadas</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA: EXAME CHŪNIN                                                 */}
        {/* ================================================================= */}
        {selectedExamId === 'chunin' && (
          <div className="space-y-4">
            {/* Certificado de Conclusão se já for Chūnin */}
            {isChuninPassed && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-600/50 flex items-center justify-center text-emerald-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-200">
                      Exame Chūnin Aprovado com Louvor
                    </h3>
                    <p className="text-xs font-mono text-emerald-400/80">
                      Você é oficialmente um Ninja Chūnin. O próximo patamar aguarda no Exame Jōnin de Elite!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedExamId('jonin')}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Iniciar Exame Jōnin</span>
                  </button>
                </div>
              </div>
            )}

            {/* Trilha de Fases do Exame Chūnin */}
            <nav className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
              {/* Passo 1 */}
              <button
                onClick={() => setChuninStage(1)}
                className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                  chuninStage === 1
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                    : chuninPhase1Success
                    ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    chuninPhase1Success
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {chuninPhase1Success ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider block">1ª Etapa</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Trapaça Furtiva</h4>
                </div>
              </button>

              <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />

              {/* Passo 2 */}
              <button
                disabled={!chuninPhase1Success && !isChuninPassed}
                onClick={() => setChuninStage(2)}
                className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                  !chuninPhase1Success && !isChuninPassed
                    ? 'opacity-40 cursor-not-allowed bg-zinc-950/30 border-zinc-850'
                    : chuninStage === 2
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                    : chuninPhase2Success
                    ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    chuninPhase2Success
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {chuninPhase2Success ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider block">2ª Etapa</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Floresta da Morte</h4>
                </div>
              </button>

              <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />

              {/* Passo 3 */}
              <button
                disabled={!chuninPhase2Success && !isChuninPassed}
                onClick={() => setChuninStage(3)}
                className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                  !chuninPhase2Success && !isChuninPassed
                    ? 'opacity-40 cursor-not-allowed bg-zinc-950/30 border-zinc-850'
                    : chuninStage === 3
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                    : chuninExamPassed
                    ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    chuninExamPassed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {chuninExamPassed ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider block">3ª Etapa</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Torneio da Arena</h4>
                </div>
              </button>
            </nav>

            {/* CONTEÚDO DA FASE SELECIONADA DO CHŪNIN */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl relative">
              {/* Elegibilidade */}
              {!isChuninEligible && (
                <div className="mb-6 p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-center gap-3 text-amber-300 text-xs font-mono">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>
                    <strong>Requisito de Inscrição:</strong> É necessário possuir ao menos 100 cliques all-time (Patente Ninja Gennin) para submeter-se ao exame.
                  </span>
                </div>
              )}

              {/* FASE 1: TRAPAÇA FURTIVA */}
              {chuninStage === 1 && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="warning">Avaliação Teórica Rigorosa</Badge>
                      <h2 className="text-lg font-bold text-zinc-100 mt-1">
                        Sala de Teste Teórico de Ibiki Morino
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono mt-1">
                        Cole respostas sem ser detectado pelo olhar severo dos sentinelas da ANBU.
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-zinc-500 mr-2">Advertências:</span>
                      <strong className={detectedCount >= 3 ? 'text-rose-400' : 'text-zinc-200'}>
                        {detectedCount} / 5
                      </strong>
                    </div>
                  </div>

                  {/* Campo de Visão do Fiscal */}
                  <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-3">
                      <Eye
                        className={`w-8 h-8 transition-colors duration-200 ${
                          isProctorLooking ? 'text-rose-500 animate-pulse' : 'text-zinc-600'
                        }`}
                      />
                      <span className="font-mono text-xs font-semibold">
                        {isProctorLooking ? (
                          <span className="text-rose-400">Fiscal Observando! Pare de colar!</span>
                        ) : (
                          <span className="text-emerald-400">Fiscal Distraído. Momento propício!</span>
                        )}
                      </span>
                    </div>

                    <div className="w-full max-w-md bg-zinc-900 h-3 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        style={{ width: `${cheatProgress}%` }}
                        className="bg-amber-500 h-full transition-all duration-150 rounded-full"
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      Pergaminho Respondido: {cheatProgress}%
                    </span>
                  </div>

                  {/* Ação */}
                  <div className="flex justify-center">
                    {chuninPhase1Success ? (
                      <button
                        onClick={() => setChuninStage(2)}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        Fase 1 Concluída! Avançar para a Floresta da Morte <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        disabled={!isChuninEligible}
                        onClick={handleCheatTick}
                        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg active:scale-95 cursor-pointer"
                      >
                        Copiar Informações Secretas
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FASE 2: FLORESTA DA MORTE */}
              {chuninStage === 2 && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="cyan">Sobrevivência no Portão 44</Badge>
                      <h2 className="text-lg font-bold text-zinc-100 mt-1">
                        Floresta da Morte: Pergaminhos do Céu e da Terra
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono mt-1">
                        Explore as copas densas, derrote esquadrões rivais e junte os dois pergaminhos sagrados.
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs space-y-1">
                      <div>
                        <span className="text-zinc-500 mr-2">Tempo Restante:</span>
                        <strong className="text-amber-400">{forestTimer}s</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 mr-2">Vitalidade da Equipe:</span>
                        <strong className="text-emerald-400">{squadHp}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status dos Pergaminhos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        hasHeavenScroll
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">Pergaminho do Céu</span>
                      {hasHeavenScroll ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>

                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        hasEarthScroll
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">Pergaminho da Terra</span>
                      {hasEarthScroll ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Diário de Incursão */}
                  <div className="p-3 bg-zinc-950/90 border border-zinc-800/80 rounded-xl font-mono text-xs text-zinc-400">
                    <span className="text-zinc-500 mr-2">[Relatório]:</span>
                    <span>{forestEventLog}</span>
                  </div>

                  {/* Ação */}
                  <div className="flex justify-center">
                    {chuninPhase2Success ? (
                      <button
                        onClick={() => setChuninStage(3)}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        Pergaminhos Reunidos! Entrar na Arena Central <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleForestSearch}
                        className="px-8 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <Swords className="w-4 h-4 text-orange-400" /> Explorar Bosque e Emboscar Equipe
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FASE 3: TORNEIO DA ARENA */}
              {chuninStage === 3 && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="chakra">Duelo Decisivo da Arena Principal</Badge>
                      <h2 className="text-lg font-bold text-zinc-100 mt-1">
                        Duelo 1v1 com Timing de Contra-Ataque (Parry)
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono mt-1">
                        Aguarde o anel externo alinhar-se com o círculo central e clique para desferir um contra-ataque de punho suave.
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

                  {/* Arena de Parry */}
                  <div className="p-8 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative min-h-[220px]">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center relative">
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

                  {/* Ação */}
                  <div className="flex justify-center">
                    {chuninExamPassed ? (
                      <div className="text-center space-y-3">
                        <div className="p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 justify-center">
                          <Trophy className="w-5 h-5 text-amber-400" /> Graduado Oficialmente como Ninja Chūnin!
                        </div>
                        <div className="flex items-center gap-3 justify-center">
                          <button
                            onClick={() => setSelectedExamId('jonin')}
                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
                          >
                            <Flame className="w-4 h-4" /> Avançar para o Exame Jōnin de Elite
                          </button>
                          <button
                            onClick={() => setView('MISSIONS')}
                            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
                          >
                            <Scroll className="w-4 h-4" /> Ir para as Missões Rank C
                          </button>
                        </div>
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
        )}

        {/* ================================================================= */}
        {/* ABA: EXAME JŌNIN DE ELITE & MESTRIA                               */}
        {/* ================================================================= */}
        {selectedExamId === 'jonin' && (
          <div className="space-y-4">
            {/* Se o jogador ainda não é Chūnin, exibe bloqueio tático */}
            {!isJoninEligible ? (
              <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-200">
                    Acesso ao Exame Jōnin Bloqueado
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto mt-1">
                    O Conselho de Konoha exige que todo shinobi seja aprovado no <strong>Exame Chūnin</strong> e conquiste seu colete tático antes de liderar esquadrões de elite.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExamId('chunin')}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Scroll className="w-4 h-4" />
                  <span>Realizar o Exame Chūnin Agora</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Banner de Graduação se já for Jōnin */}
                {isJoninPassed && (
                  <div className="p-4 bg-cyan-950/30 border border-cyan-800/60 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-900/50 border border-cyan-600/50 flex items-center justify-center text-cyan-300">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-cyan-200">
                          Ninja Jōnin de Elite Consagrado
                        </h3>
                        <p className="text-xs font-mono text-cyan-400/80">
                          Comandante de Alto Escalão de Konohagakure. Missões Rank B e A disponíveis!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setView('MISSIONS')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Scroll className="w-3.5 h-3.5" />
                      <span>Quadro de Missões Jōnin</span>
                    </button>
                  </div>
                )}

                {/* Stepper do Exame Jōnin */}
                <nav className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
                  {/* Passo 1 Jōnin */}
                  <button
                    onClick={() => setJoninStage(1)}
                    className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      joninStage === 1
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md'
                        : joninPhase1Success
                        ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        joninPhase1Success
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {joninPhase1Success ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider block">1ª Etapa</span>
                      <h4 className="text-xs font-semibold text-zinc-200">Guizos de Kakashi</h4>
                    </div>
                  </button>

                  <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />

                  {/* Passo 2 Jōnin */}
                  <button
                    disabled={!joninPhase1Success && !isJoninPassed}
                    onClick={() => setJoninStage(2)}
                    className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      !joninPhase1Success && !isJoninPassed
                        ? 'opacity-40 cursor-not-allowed bg-zinc-950/30 border-zinc-850'
                        : joninStage === 2
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md'
                        : joninPhase2Success
                        ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        joninPhase2Success
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {joninPhase2Success ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider block">2ª Etapa</span>
                      <h4 className="text-xs font-semibold text-zinc-200">Ressonância Elemental</h4>
                    </div>
                  </button>

                  <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />

                  {/* Passo 3 Jōnin */}
                  <button
                    disabled={!joninPhase2Success && !isJoninPassed}
                    onClick={() => setJoninStage(3)}
                    className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      !joninPhase2Success && !isJoninPassed
                        ? 'opacity-40 cursor-not-allowed bg-zinc-950/30 border-zinc-850'
                        : joninStage === 3
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md'
                        : joninExamPassed
                        ? 'bg-zinc-950/60 border-emerald-800/40 text-emerald-400'
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        joninExamPassed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {joninExamPassed ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider block">3ª Etapa</span>
                      <h4 className="text-xs font-semibold text-zinc-200">Capitão da ANBU</h4>
                    </div>
                  </button>
                </nav>

                {/* CONTEÚDO DAS FASES DO EXAME JŌNIN */}
                <section className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl relative">
                  {/* FASE 1 JŌNIN: GUIZOS DE KAKASHI */}
                  {joninStage === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="cyan">Avaliação de Sobrevivência & Reflexos</Badge>
                          <h2 className="text-lg font-bold text-zinc-100 mt-1">
                            O Teste dos Guizos de Kakashi Hatake
                          </h2>
                          <p className="text-xs text-zinc-400 font-mono mt-1">
                            O Jonin Kakashi lê despretensiosamente. Clique no instante em que o cursor de velocidade alinhar-se com a zona do guizo!
                          </p>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className="text-zinc-500 mr-2">Guizos Obtidos:</span>
                          <strong className="text-amber-400">{bellsCaptured} / 2</strong>
                        </div>
                      </div>

                      {/* Medidor de Velocidade do Guizo */}
                      <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4">
                        <div className="w-full max-w-lg relative">
                          {/* Barra de trilho */}
                          <div className="h-6 bg-zinc-900 rounded-full border border-zinc-800 relative overflow-hidden">
                            {/* Zona Alvo Central do Guizo */}
                            <div className="absolute left-[42%] right-[42%] inset-y-0 bg-amber-500/30 border-x-2 border-amber-400 flex items-center justify-center">
                              <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                                Zona do Guizo
                              </span>
                            </div>

                            {/* Cursor oscilante */}
                            <div
                              style={{ left: `${bellMeterPosition}%` }}
                              className="absolute top-0 bottom-0 w-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee] transition-all duration-75 -translate-x-1/2"
                            />
                          </div>
                        </div>

                        {kakashiFeedback && (
                          <div className="font-mono text-xs text-cyan-300 font-semibold animate-in fade-in">
                            {kakashiFeedback}
                          </div>
                        )}
                      </div>

                      {/* Ação */}
                      <div className="flex justify-center">
                        {joninPhase1Success ? (
                          <button
                            onClick={() => setJoninStage(2)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            Guizos Conquistados! Avançar para Ressonância Elemental <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleCatchBellClick}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg active:scale-95 cursor-pointer"
                          >
                            Agarrar Guizo de Kakashi
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FASE 2 JŌNIN: RESSONÂNCIA ELEMENTAL */}
                  {joninStage === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="cyan">Maestria das Transformações da Natureza</Badge>
                          <h2 className="text-lg font-bold text-zinc-100 mt-1">
                            Harmonia das Cinco Transformações de Chakra
                          </h2>
                          <p className="text-xs text-zinc-400 font-mono mt-1">
                            Canalize a frequência solicitada pelo Pergaminho Ancestral clicando no elemento correspondente para atingir 100% de estabilidade.
                          </p>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className="text-zinc-500 mr-2">Harmonia Elemental:</span>
                          <strong className="text-emerald-400">{elementalHarmony}%</strong>
                        </div>
                      </div>

                      {/* Barra de Progresso Elemental */}
                      <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4">
                        <div className="text-center">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                            Elemento em Ressonância Solicitado
                          </span>
                          <span className="text-sm font-black font-mono text-amber-300 uppercase px-3 py-1 bg-amber-950/40 border border-amber-500/50 rounded-lg">
                            Canalizar: {targetElementPrompt}
                          </span>
                        </div>

                        <div className="w-full max-w-md bg-zinc-900 h-3 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            style={{ width: `${elementalHarmony}%` }}
                            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-150 rounded-full"
                          />
                        </div>

                        {/* Botões dos 5 Elementos */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-xl mt-2">
                          {elementsList.map((elem) => (
                            <button
                              key={elem.name}
                              onClick={() => handleInfuseElement(elem.name)}
                              className={`p-3 rounded-xl border font-mono text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${elem.color}`}
                            >
                              <Zap className="w-4 h-4" />
                              <span>{elem.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ação */}
                      <div className="flex justify-center">
                        {joninPhase2Success ? (
                          <button
                            onClick={() => setJoninStage(3)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            Chakra Harmonizado! Avançar para o Duelo com a ANBU <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-zinc-500">
                            Equilibre as 5 correntes até atingir 100% de Harmonia
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FASE 3 JŌNIN: CAPITÃO DA ANBU */}
                  {joninStage === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="danger">Avaliação Tática de Alto Escalão</Badge>
                          <h2 className="text-lg font-bold text-zinc-100 mt-1">
                            Duelo contra o Capitão Mascarado da Força ANBU
                          </h2>
                          <p className="text-xs text-zinc-400 font-mono mt-1">
                            Ataques de altíssima cadência. Acerte os parrys com reflexos de Jōnin para quebrar a lâmina de chakra do adversário.
                          </p>
                        </div>

                        <div className="text-right font-mono text-xs space-y-1">
                          <div>
                            <span className="text-zinc-400 mr-2">Vitalidade ANBU:</span>
                            <strong className="text-rose-400">{anbuHp}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Arena ANBU */}
                      <div className="p-8 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative min-h-[220px]">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-700 flex items-center justify-center relative">
                          <div
                            style={{
                              transform: `scale(${anbuRingScale})`,
                              transition: 'transform 0.045s linear',
                            }}
                            className={`absolute inset-0 rounded-full border-2 pointer-events-none ${
                              anbuRingScale >= 0.95 && anbuRingScale <= 1.15
                                ? 'border-cyan-400 shadow-[0_0_15px_#06b6d4]'
                                : 'border-rose-500'
                            }`}
                          />
                          <Swords className="w-8 h-8 text-cyan-400" />
                        </div>

                        {anbuFeedback && (
                          <div className="mt-4 font-mono font-bold text-xs text-cyan-300 animate-in fade-in">
                            {anbuFeedback}
                          </div>
                        )}
                      </div>

                      {/* Ação */}
                      <div className="flex justify-center">
                        {joninExamPassed ? (
                          <div className="text-center space-y-3">
                            <div className="p-3 bg-cyan-950/50 border border-cyan-700/60 rounded-xl text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 justify-center">
                              <Trophy className="w-5 h-5 text-amber-400" /> Graduado Oficialmente como Ninja Jōnin de Elite!
                            </div>
                            <button
                              onClick={() => setView('MISSIONS')}
                              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
                            >
                              <Scroll className="w-4 h-4" /> Comandar Missões de Elite (Rank B & A)
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleAnbuParryClick}
                            className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg active:scale-95 cursor-pointer"
                          >
                            Executar Parry Avançado contra ANBU
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
