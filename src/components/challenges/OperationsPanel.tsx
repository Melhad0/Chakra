import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import Decimal from 'break_infinity.js';
import { CLAN_NODES } from '../../engine/data';
import { calculateTotalCPS, calculateClickPower } from '../../engine/formulas';
import { audio } from '../../engine/audio';
import { GAUNTLET_BOSSES } from '../../data/gauntletBosses';
import { BossData } from '../../types/combat';
import { Badge } from '../common/Badge';
import { IconRenderer } from '../common/IconRenderer';
import {
  Swords,
  Scroll,
  GitFork,
  Trophy,
  Zap,
  ChevronLeft,
  ChevronRight,
  Info,
  Shield,
  Clock,
  Skull,
  AlertTriangle,
  Flame,
  Target,
  CheckCircle2,
  HelpCircle,
  Award,
  Wind,
} from 'lucide-react';

export const OperationsPanel: React.FC = () => {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const chakra = useGameStore((s) => s.chakra);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const clanNodes = useGameStore((s) => s.clanNodes);
  const buyClanNode = useGameStore((s) => s.buyClanNode);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);

  // Estado Gauntlet do Zustand Store
  const gauntlet = useGameStore((s) => s.gauntlet);
  const setGauntletBossIndex = useGameStore((s) => s.setGauntletBossIndex);
  const setGauntletCombatMode = useGameStore((s) => s.setGauntletCombatMode);
  const recordGauntletVictory = useGameStore((s) => s.recordGauntletVictory);
  const handleGauntletDefeat = useGameStore((s) => s.handleGauntletDefeat);

  const currentBoss: BossData = GAUNTLET_BOSSES[gauntlet.currentBossIndex] || GAUNTLET_BOSSES[0];

  // Estados locais da luta do Gauntlet
  const [bossHp, setBossHp] = useState<Decimal>(currentBoss.hp);
  const [combatTimer, setCombatTimer] = useState<number>(currentBoss.timer);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [lastDmgInfo, setLastDmgInfo] = useState<{ amount: number; isCrit: boolean; note?: string } | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('Todos');
  const [defeatMessage, setDefeatMessage] = useState<string | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);

  // Estados específicos das 15 mecânicas dos chefes
  const [puppetsRemaining, setPuppetsRemaining] = useState<number>(10); // Chiyo
  const [isIaiSilenced, setIsIaiSilenced] = useState<boolean>(false); // Mifune
  const [isBakuActive, setIsBakuActive] = useState<boolean>(false); // Danzō
  const [lastClickTimestamp, setLastClickTimestamp] = useState<number>(0);
  const [forbiddenWord, setForbiddenWord] = useState<string>('CHAKRA'); // Kinkaku & Ginkaku
  const [muuFissionActive, setMuuFissionActive] = useState<boolean>(false); // Muu
  const [cloneHpA, setCloneHpA] = useState<Decimal>(currentBoss.hp.div(2));
  const [cloneHpB, setCloneHpB] = useState<Decimal>(currentBoss.hp.div(2));
  const [toneriQteActive, setToneriQteActive] = useState<boolean>(false); // Toneri
  const [toneriClicks, setToneriClicks] = useState<number>(0);
  const [toneriTimer, setToneriTimer] = useState<number>(1.5);
  const [isshikiCubes, setIsshikiCubes] = useState<number>(3); // Isshiki

  const prevBossIdRef = useRef<number>(currentBoss.id);

  // Reset de combate ao trocar de chefe
  useEffect(() => {
    setBossHp(currentBoss.hp);
    setCombatTimer(currentBoss.timer);
    setPuppetsRemaining(10);
    setIsIaiSilenced(false);
    setIsBakuActive(false);
    setMuuFissionActive(false);
    setCloneHpA(currentBoss.hp.div(2));
    setCloneHpB(currentBoss.hp.div(2));
    setToneriQteActive(false);
    setToneriClicks(0);
    setToneriTimer(1.5);
    setIsshikiCubes(3);

    const forbiddenWords = ['CHAKRA', 'FOGO', 'RASENGAN', 'SELO', 'NINJA'];
    setForbiddenWord(forbiddenWords[Math.floor(Math.random() * forbiddenWords.length)]);
    prevBossIdRef.current = currentBoss.id;
  }, [currentBoss.id, currentBoss.hp, currentBoss.timer]);

  // Cálculo de Poder do Shinobi
  const effectiveClanNodes = useMemo(() => {
    if (currentBoss.mechanic.type === 'isshiki_cubes' && isshikiCubes > 0) {
      return {};
    }
    return clanNodes;
  }, [clanNodes, currentBoss.mechanic.type, isshikiCubes]);

  const currentCPS = useMemo(() => {
    return calculateTotalCPS(
      generators,
      upgrades,
      effectiveClanNodes,
      gatesUnlocked,
      gatesActiveTimer > 0,
      exhaustionTimer > 0
    );
  }, [generators, upgrades, effectiveClanNodes, gatesUnlocked, gatesActiveTimer, exhaustionTimer]);

  const clickPower = useMemo(() => {
    let p = calculateClickPower(currentCPS, upgrades, effectiveClanNodes);
    if (isIaiSilenced) {
      p = D(1);
    }
    return p;
  }, [currentCPS, upgrades, effectiveClanNodes, isIaiSilenced]);

  const playerBaseDamage = Math.max(5, Math.floor(clickPower.toNumber()));

  // =========================================================================
  // LOOP DE COMBATE DO GAUNTLET
  // =========================================================================
  useEffect(() => {
    if (activeTab !== 'gauntlet') return;

    const interval = setInterval(() => {
      // 1. QTE do Toneri
      if (toneriQteActive) {
        setToneriTimer((prev) => {
          const next = prev - 0.1;
          if (next <= 0) {
            setToneriQteActive(false);
            triggerDefeat('Toneri Otsutsuki executou o corte fatal da Espada de Prata Reencarnada.');
            return 0;
          }
          return next;
        });
      }

      // 2. Cronômetro Geral de Combate
      setCombatTimer((prevTimer) => {
        const nextTimer = prevTimer - 0.1;

        if (nextTimer <= 0) {
          triggerDefeat(`O limite de tempo (${currentBoss.timer}s) esgotou contra ${currentBoss.name}.`);
          return currentBoss.timer;
        }

        // Mecânica Mifune: corte a cada 8s silencia por 2s
        if (currentBoss.mechanic.type === 'mifune_iai') {
          const elapsed = currentBoss.timer - nextTimer;
          const cycle = Math.floor(elapsed) % 8;
          setIsIaiSilenced(cycle < 2);
        }

        // Mecânica Danzō: Baku suga ar a cada 10s por 3s
        if (currentBoss.mechanic.type === 'danzo_baku') {
          const elapsed = currentBoss.timer - nextTimer;
          const cycle = Math.floor(elapsed) % 10;
          setIsBakuActive(cycle < 3);
        }

        // Mecânica Tayuya: drena 1% de chakra a cada 5s
        if (currentBoss.mechanic.type === 'tayuya_drain' && Math.floor(nextTimer * 10) % 50 === 0) {
          useGameStore.setState((s) => ({
            chakra: s.chakra.mul(0.99),
          }));
        }

        return nextTimer;
      });

      // 3. Dano Passivo por Segundo (CPS)
      if (currentBoss.mechanic.type !== 'raikage_armor' && currentCPS.gt(0)) {
        const dpsTick = currentCPS.mul(0.1);

        if (currentBoss.mechanic.type === 'chiyo_puppets' && puppetsRemaining > 0) {
          return;
        }

        if (currentBoss.mechanic.type === 'sakon_regen' && currentCPS.lt(150)) {
          const regen = currentBoss.hp.mul(0.02 * 0.1);
          setBossHp((prev) => Decimal.min(currentBoss.hp, prev.add(regen)));
          return;
        }

        if (muuFissionActive) {
          const halfDmg = dpsTick.div(2);
          setCloneHpA((p) => Decimal.max(0, p.sub(halfDmg)));
          setCloneHpB((p) => Decimal.max(0, p.sub(halfDmg)));
          setBossHp((prev) => Decimal.max(0, prev.sub(dpsTick)));
        } else {
          setBossHp((prev) => {
            const next = prev.sub(dpsTick);
            if (next.lte(0)) {
              triggerVictory();
              return D(0);
            }
            return next;
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    activeTab,
    currentBoss,
    currentCPS,
    puppetsRemaining,
    muuFissionActive,
    toneriQteActive,
    gauntlet.combatMode,
  ]);

  // Disparo de Vitória
  const triggerVictory = () => {
    audio.playLevelUp();
    setVictoryMessage(`Vitória sobre #${currentBoss.id} ${currentBoss.name}. Recompensas concedidas.`);
    setTimeout(() => setVictoryMessage(null), 3000);

    useGameStore.setState((state) => ({
      chakra: state.chakra.add(currentBoss.bountyChakra),
      chakraAncestral: state.chakraAncestral.add(currentBoss.bountyAncestral),
    }));

    recordGauntletVictory(currentBoss.id);
  };

  // Disparo de Derrota (Punição Roguelike)
  const triggerDefeat = (reason: string) => {
    audio.playCrit();

    if (gauntlet.combatMode === 'PUSH') {
      handleGauntletDefeat();
      setDefeatMessage(`COLAPSO SHINOBI NO MODO PUSH\n${reason}\nRetorno compulsório à Fase #1.`);
      setTimeout(() => setDefeatMessage(null), 5000);
      setBossHp(GAUNTLET_BOSSES[0].hp);
      setCombatTimer(GAUNTLET_BOSSES[0].timer);
    } else {
      setDefeatMessage(`DERROTA NO MODO TREINO\n${reason}\nO chefe foi reiniciado sem perda de progresso.`);
      setTimeout(() => setDefeatMessage(null), 4000);
      setBossHp(currentBoss.hp);
      setCombatTimer(currentBoss.timer);
    }

    setPuppetsRemaining(10);
    setMuuFissionActive(false);
    setToneriQteActive(false);
    setIsshikiCubes(3);
  };

  // Ataque Manual de Clique
  const handleAttackBoss = (isCenterHit: boolean = true) => {
    const now = Date.now();

    if (isBakuActive && now - lastClickTimestamp < 350) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Vórtice do Baku ativo. Ataque bloqueado.' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }
    setLastClickTimestamp(now);

    if (currentBoss.mechanic.type === 'kankuro_poison' && Math.random() < 0.2) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Névoa de veneno. Ataque errou.' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }

    if (currentBoss.mechanic.type === 'baki_wind' && !isCenterHit) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Lâmina de Vento. Apenas o centro é vulnerável.' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }

    if (currentBoss.mechanic.type === 'chiyo_puppets' && puppetsRemaining > 0) {
      audio.playClick();
      setPuppetsRemaining((prev) => {
        const next = prev - 1;
        setLastDmgInfo({ amount: 1, isCrit: false, note: `Marionete neutralizada (${next}/10)` });
        setTimeout(() => setLastDmgInfo(null), 500);
        return next;
      });
      return;
    }

    setIsHit(true);
    setTimeout(() => setIsHit(false), 120);

    let critChance = 0.05;
    let critMult = 2.0;
    if (effectiveClanNodes['sharingan_awakening']) critChance += 0.1;
    if (effectiveClanNodes['mangekyo_sharingan_lineage']) critMult = 3.0;

    let isCrit = Math.random() < critChance;

    const hpRatio = bossHp.div(currentBoss.hp).toNumber();
    if (currentBoss.mechanic.type === 'jirobo_shield' && hpRatio >= 0.7) {
      isCrit = false;
    }

    if (isCrit) {
      audio.playCrit();
    } else {
      audio.playClick();
    }

    let calculatedDmg = isCrit ? Math.floor(playerBaseDamage * critMult) : playerBaseDamage;

    if (currentBoss.mechanic.type === 'mizuki_rage' && combatTimer >= currentBoss.timer - 10) {
      calculatedDmg = Math.max(1, Math.floor(calculatedDmg / 2));
    }

    const dmg = D(Math.max(1, calculatedDmg));
    setLastDmgInfo({ amount: dmg.toNumber(), isCrit });
    setTimeout(() => setLastDmgInfo(null), 600);

    if (currentBoss.mechanic.type === 'muu_fission' && !muuFissionActive && hpRatio <= 0.5) {
      setMuuFissionActive(true);
      setCloneHpA(bossHp.div(2));
      setCloneHpB(bossHp.div(2));
    }

    if (currentBoss.mechanic.type === 'toneri_qte' && !toneriQteActive && hpRatio <= 0.5 && toneriClicks === 0) {
      setToneriQteActive(true);
      setToneriTimer(1.5);
    }

    if (muuFissionActive) {
      const half = dmg.div(2);
      setCloneHpA((p) => Decimal.max(0, p.sub(half)));
      setCloneHpB((p) => Decimal.max(0, p.sub(half)));
      setBossHp((prev) => {
        const next = prev.sub(dmg);
        if (next.lte(0)) {
          triggerVictory();
          return D(0);
        }
        return next;
      });
    } else {
      setBossHp((prev) => {
        const next = prev.sub(dmg);
        if (next.lte(0)) {
          triggerVictory();
          return D(0);
        }
        return next;
      });
    }
  };

  const handleForbiddenWordClick = () => {
    audio.playCrit();
    setCombatTimer((prev) => {
      const penalty = prev * 0.15;
      const next = Math.max(0.1, prev - penalty);
      setLastDmgInfo({
        amount: 0,
        isCrit: false,
        note: `Palavra Proibida "${forbiddenWord}": -15% de Tempo`,
      });
      setTimeout(() => setLastDmgInfo(null), 1000);
      return next;
    });
  };

  const handleToneriQteClick = () => {
    audio.playClick();
    setToneriClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setToneriQteActive(false);
        setLastDmgInfo({ amount: 0, isCrit: true, note: 'Espada de Prata aparada com sucesso.' });
        setTimeout(() => setLastDmgInfo(null), 1000);
      }
      return next;
    });
  };

  const handleDestroyIsshikiCube = () => {
    audio.playCrit();
    setIsshikiCubes((prev) => {
      const next = Math.max(0, prev - 1);
      setLastDmgInfo({
        amount: 0,
        isCrit: true,
        note: `Cubo de Daikokuten estilhaçado (${next} restantes)`,
      });
      setTimeout(() => setLastDmgInfo(null), 800);
      return next;
    });
  };

  const handleSelectBoss = (idx: number) => {
    if (idx < 0 || idx >= GAUNTLET_BOSSES.length) return;
    setGauntletBossIndex(idx);
  };

  const filteredBosses = useMemo(() => {
    if (tierFilter === 'Todos') return GAUNTLET_BOSSES;
    return GAUNTLET_BOSSES.filter((b) => b.tier === tierFilter);
  }, [tierFilter]);

  const hpPercent = Math.max(0, Math.min(100, bossHp.div(currentBoss.hp).mul(100).toNumber()));
  const timerPercent = Math.max(0, Math.min(100, (combatTimer / currentBoss.timer) * 100));

  return (
    <aside className="h-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 transition-colors rounded-xl p-4 flex flex-col overflow-hidden shadow-sm">
      {/* Abas Deslizantes Minimalistas */}
      <nav className="flex items-center gap-1.5 pb-2.5 border-b border-zinc-800/80 overflow-x-auto custom-scrollbar flex-shrink-0">
        <button
          onClick={() => setActiveTab('gauntlet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition border ${
            activeTab === 'gauntlet'
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
          }`}
        >
          <Swords className="w-3.5 h-3.5 stroke-[1.75]" /> Desafios (1-40)
        </button>

        <button
          onClick={() => setActiveTab('clans')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition border ${
            activeTab === 'clans'
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 stroke-[1.75]" /> Árvore de Clãs
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition border ${
            activeTab === 'exam'
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
          }`}
        >
          <Scroll className="w-3.5 h-3.5 stroke-[1.75]" /> Exame Chūnin
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition border ${
            activeTab === 'rankings'
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/40'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 stroke-[1.75]" /> Ranks
        </button>
      </nav>

      {/* Conteúdo Dinâmico */}
      <div className="flex-1 overflow-y-auto mt-2.5 pr-1 custom-scrollbar">
        {/* ================================================================= */}
        {/* 1. ABA GAUNTLET (40 CHEFES - ROGUELIKE & NAVEGAÇÃO 1-N)           */}
        {/* ================================================================= */}
        {activeTab === 'gauntlet' && (
          <div className="space-y-3">
            {/* BARRA DE CONTROLE: MODO DE COMBATE (PUSH vs FARM) & RECORDE DA RUN */}
            <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400 stroke-[1.75]" /> Modo
                </span>
                <div className="flex rounded-md bg-zinc-900 p-0.5 border border-zinc-800">
                  <button
                    onClick={() => setGauntletCombatMode('PUSH')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition flex items-center gap-1.5 border ${
                      gauntlet.combatMode === 'PUSH'
                        ? 'bg-zinc-800 text-rose-300 border-rose-900/50 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                    }`}
                  >
                    <Skull className="w-3 h-3 stroke-[1.75]" /> PUSH
                  </button>

                  <button
                    onClick={() => setGauntletCombatMode('FARM')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition flex items-center gap-1.5 border ${
                      gauntlet.combatMode === 'FARM'
                        ? 'bg-zinc-800 text-cyan-300 border-cyan-900/50 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                    }`}
                  >
                    <Shield className="w-3 h-3 stroke-[1.75]" /> FARM
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="font-mono text-zinc-400">
                  Recorde: <strong className="text-zinc-200">Fase #{gauntlet.maxUnlockedBoss}</strong>
                </span>
                {gauntlet.combatMode === 'PUSH' ? (
                  <Badge variant="danger" dot>Retorno ao #1</Badge>
                ) : (
                  <Badge variant="cyan" dot>Treino Livre</Badge>
                )}
              </div>
            </div>

            {/* BANNERS DE ALERTA SEM EMOJIS */}
            {victoryMessage && (
              <div className="p-2.5 rounded-md bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 text-xs font-mono font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[1.75] flex-shrink-0" />
                <span>{victoryMessage}</span>
              </div>
            )}

            {defeatMessage && (
              <div className="p-2.5 rounded-md bg-rose-950/20 border border-rose-800/40 text-rose-400 text-xs font-mono font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 stroke-[1.75] flex-shrink-0" />
                <span className="whitespace-pre-line">{defeatMessage}</span>
              </div>
            )}

            {/* ARENA DE DUELO ATIVO COM TIMER DPS CHECK */}
            <div className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl relative overflow-hidden shadow-sm">
              {/* Cronômetro de Combate */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Clock className="w-3 h-3 stroke-[1.75]" /> Tempo de Combate
                  </span>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                      combatTimer <= 5
                        ? 'bg-rose-950/40 border-rose-800/50 text-rose-400 font-bold animate-pulse'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 font-medium'
                    }`}
                  >
                    {combatTimer.toFixed(1)}s / {currentBoss.timer}s
                  </span>
                </div>
                {/* Barra Regressiva de Tempo Fina */}
                <div className="w-full h-1.5 bg-zinc-900 rounded-sm overflow-hidden mt-1.5">
                  <div
                    style={{ width: `${timerPercent}%` }}
                    className={`h-full transition-all duration-100 rounded-sm ${
                      combatTimer <= 5 ? 'bg-rose-500' : 'bg-zinc-400'
                    }`}
                  />
                </div>
              </div>

              {/* Informações do Chefe Atual */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-14 h-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0 relative transition ${
                    isHit ? 'border-orange-500 text-orange-400 scale-95' : ''
                  }`}
                >
                  <IconRenderer name={currentBoss.avatar} className="w-6 h-6 stroke-[1.5]" />
                  {currentBoss.mechanic.type !== 'standard' && (
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-orange-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="chakra">Fase #{currentBoss.id}</Badge>
                      <Badge variant="neutral">{currentBoss.tier}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {lastDmgInfo && (
                        <span
                          className={`text-[11px] font-mono font-medium ${
                            lastDmgInfo.note
                              ? 'text-amber-400'
                              : lastDmgInfo.isCrit
                              ? 'text-amber-300 font-bold'
                              : 'text-zinc-300'
                          }`}
                        >
                          {lastDmgInfo.note
                            ? lastDmgInfo.note
                            : `-${formatBigNumber(lastDmgInfo.amount)} ${lastDmgInfo.isCrit ? 'CRÍTICO' : ''}`}
                        </span>
                      )}
                      <span className="text-xs font-mono font-medium text-zinc-400">
                        {formatBigNumber(bossHp)} / {formatBigNumber(currentBoss.hp)} HP
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-zinc-100 mt-1.5 leading-tight">{currentBoss.name}</h4>
                  <p className="text-[11px] text-zinc-400 truncate">{currentBoss.title}</p>

                  {/* Lore e Descrição da Mecânica Canônica */}
                  <div className="mt-2 p-2 rounded-md bg-zinc-900/60 border border-zinc-850 text-[11px] text-zinc-400 leading-snug flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5 stroke-[1.75]" />
                    <div>
                      <span className="text-zinc-300 font-medium mr-1">[{currentBoss.mechanic.title}]:</span>
                      <span>{currentBoss.mechanic.description}</span>
                    </div>
                  </div>

                  {/* Barra de Vida Fina */}
                  <div className="w-full h-2 bg-zinc-900 rounded-sm overflow-hidden mt-2 relative">
                    <div
                      style={{ width: `${hpPercent}%` }}
                      className="h-full bg-orange-500 rounded-sm transition-all duration-200"
                    />
                  </div>

                  {/* Recompensas */}
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-400">
                      Recompensa: +{formatBigNumber(currentBoss.bountyChakra)} Chakra
                    </span>
                    <span className="text-amber-300">
                      +{currentBoss.bountyAncestral} Ancestral
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges de Mecânicas Interativas */}
              {currentBoss.mechanic.type === 'mizuki_rage' && combatTimer >= currentBoss.timer - 10 && (
                <div className="mt-2 p-2 bg-amber-950/20 border border-amber-800/40 rounded-md text-[10px] font-mono text-amber-300 flex items-center justify-between">
                  <span>Defesa Dobrada (-50% dano de clique)</span>
                  <span>{(combatTimer - (currentBoss.timer - 10)).toFixed(1)}s</span>
                </div>
              )}

              {currentBoss.mechanic.type === 'jirobo_shield' && bossHp.div(currentBoss.hp).toNumber() >= 0.7 && (
                <div className="mt-2 p-2 bg-zinc-900/60 border border-zinc-700/60 rounded-md text-[10px] font-mono text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 stroke-[1.75]" />
                  <span>Escudo de Terra: Imunidade a Acertos Críticos</span>
                </div>
              )}

              {currentBoss.mechanic.type === 'chiyo_puppets' && puppetsRemaining > 0 && (
                <div className="mt-2 p-2 bg-zinc-900/60 border border-zinc-700/60 rounded-md text-[10px] font-mono text-zinc-300 flex items-center justify-between">
                  <span>Marionetes de Proteção Ativas:</span>
                  <span className="font-bold text-orange-400">{puppetsRemaining} / 10 Restantes</span>
                </div>
              )}

              {isIaiSilenced && (
                <div className="mt-2 p-2 bg-rose-950/20 border border-rose-800/40 rounded-md text-[10px] font-mono text-rose-300 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Corte Iaidō: Jutsus e Bônus Silenciados por 2s</span>
                </div>
              )}

              {currentBoss.mechanic.type === 'kinkaku_words' && (
                <div className="mt-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-md flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Palavra Proibida: <strong className="text-zinc-200">{forbiddenWord}</strong>
                  </span>
                  <button
                    onClick={handleForbiddenWordClick}
                    className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-[10px] font-mono rounded border border-rose-800/50"
                  >
                    Invocar &quot;{forbiddenWord}&quot; (-15% Tempo)
                  </button>
                </div>
              )}

              {isBakuActive && (
                <div className="mt-2 p-2 bg-amber-950/20 border border-amber-800/40 rounded-md text-[10px] font-mono text-amber-300 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Vórtice do Baku: Cadência de Ataque Reduzida</span>
                </div>
              )}

              {muuFissionActive && (
                <div className="mt-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-md space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Fissão Jinton (2 Corpos)</span>
                    <span>A: {formatBigNumber(cloneHpA)} | B: {formatBigNumber(cloneHpB)}</span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    <div
                      style={{ width: `${Math.max(0, Math.min(100, cloneHpA.div(currentBoss.hp.div(2)).mul(100).toNumber()))}%` }}
                      className="bg-zinc-400 rounded-sm"
                    />
                    <div
                      style={{ width: `${Math.max(0, Math.min(100, cloneHpB.div(currentBoss.hp.div(2)).mul(100).toNumber()))}%` }}
                      className="bg-orange-500 rounded-sm"
                    />
                  </div>
                </div>
              )}

              {currentBoss.mechanic.type === 'raikage_armor' && (
                <div className="mt-2 p-2 bg-cyan-950/20 border border-cyan-800/40 rounded-md text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Armadura Raiton: Imunidade a CPS Passivo</span>
                </div>
              )}

              {toneriQteActive && (
                <div className="mt-2 p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-center space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-100 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 stroke-[1.75]" />
                    QTE: Corte Reencarnado (3 Cliques)
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    Tempo: {toneriTimer.toFixed(1)}s | Cliques: {toneriClicks}/3
                  </div>
                  <button
                    onClick={handleToneriQteClick}
                    className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-mono text-xs rounded border border-zinc-700 active:scale-95 transition"
                  >
                    Aparar Espada de Prata ({toneriClicks}/3)
                  </button>
                </div>
              )}

              {currentBoss.mechanic.type === 'isshiki_cubes' && isshikiCubes > 0 && (
                <div className="mt-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-md flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono text-zinc-400">
                    Cubos de Daikokuten ({isshikiCubes}/3): Árvore Suprimida
                  </div>
                  <button
                    onClick={handleDestroyIsshikiCube}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-[10px] font-mono rounded border border-zinc-700"
                  >
                    Estilhaçar Cubo
                  </button>
                </div>
              )}

              {/* Botões de Ação de Baixo Relevo */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  disabled={
                    gauntlet.currentBossIndex === 0 ||
                    (gauntlet.combatMode === 'PUSH' && gauntlet.currentBossIndex <= 0)
                  }
                  onClick={() => handleSelectBoss(gauntlet.currentBossIndex - 1)}
                  title="Chefe Anterior"
                  className="p-2 rounded-md bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
                </button>

                {currentBoss.mechanic.type === 'baki_wind' ? (
                  <div className="flex-1 flex gap-1">
                    <button
                      onClick={() => handleAttackBoss(false)}
                      className="py-2 px-2.5 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-mono rounded-md hover:bg-zinc-850"
                    >
                      Borda
                    </button>
                    <button
                      onClick={() => handleAttackBoss(true)}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 text-xs font-mono font-medium rounded-md border border-zinc-700 active:scale-95 transition flex items-center justify-center gap-1.5"
                    >
                      <Target className="w-3.5 h-3.5 stroke-[1.75]" /> Centro Exato (-{formatBigNumber(playerBaseDamage)})
                    </button>
                    <button
                      onClick={() => handleAttackBoss(false)}
                      className="py-2 px-2.5 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-mono rounded-md hover:bg-zinc-850"
                    >
                      Borda
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAttackBoss(true)}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 text-xs font-mono font-medium rounded-md border border-zinc-700 active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 stroke-[1.75]" /> Atacar (-{formatBigNumber(playerBaseDamage)} Dano)
                  </button>
                )}

                <button
                  disabled={
                    gauntlet.currentBossIndex === GAUNTLET_BOSSES.length - 1 ||
                    (gauntlet.combatMode === 'PUSH' && gauntlet.currentBossIndex >= gauntlet.maxUnlockedBoss)
                  }
                  onClick={() => handleSelectBoss(gauntlet.currentBossIndex + 1)}
                  title="Próximo Chefe"
                  className="p-2 rounded-md bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            </div>

            {/* PROGRESSÃO ORDINAL 1-N & FILTROS POR TIER */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Catálogo (Fases 1 a 40)
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Fase #{currentBoss.id} / 40
                </span>
              </div>

              {/* Filtro Rápido por Tier com Botões de Baixo Relevo */}
              <div className="flex gap-1 overflow-x-auto pb-1.5 custom-scrollbar text-[10px] font-mono">
                {[
                  { label: 'Todos (40)', val: 'Todos' },
                  { label: 'Chūnin (1-8)', val: 'Inicial / Chūnin' },
                  { label: 'Jōnin (9-21)', val: 'Jōnin / Invasões' },
                  { label: 'Kage (22-33)', val: 'Kage / Lendário' },
                  { label: 'Divino (34-40)', val: 'Continental / Divino' },
                ].map((tier) => (
                  <button
                    key={tier.val}
                    onClick={() => setTierFilter(tier.val)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap border transition ${
                      tierFilter === tier.val
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm font-medium'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Grid dos 40 Chefes com Iconografia Vetorial */}
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {filteredBosses.map((boss) => {
                  const originalIndex = GAUNTLET_BOSSES.findIndex((b) => b.id === boss.id);
                  const isSelected = gauntlet.currentBossIndex === originalIndex;
                  const isDefeated = boss.id <= gauntlet.maxUnlockedBoss;
                  const isLocked =
                    gauntlet.combatMode === 'PUSH' && originalIndex > gauntlet.currentBossIndex;

                  return (
                    <div
                      key={boss.id}
                      onClick={() => !isLocked && handleSelectBoss(originalIndex)}
                      className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                        isLocked
                          ? 'opacity-40 cursor-not-allowed bg-zinc-950/40 border-zinc-850/60'
                          : isSelected
                          ? 'bg-zinc-850 border-zinc-700 text-zinc-100 shadow-sm cursor-pointer'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-zinc-200 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 flex-shrink-0">
                          <IconRenderer name={boss.avatar} className="w-3.5 h-3.5 stroke-[1.75]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-zinc-500">#{boss.id}</span>
                            <span className="font-medium truncate text-xs text-zinc-200">{boss.name}</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 block truncate">{boss.level}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-1">
                        {isDefeated ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-medium block">
                            Vencido
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-mono text-orange-400 font-medium block">
                            Ativo
                          </span>
                        ) : isLocked ? (
                          <span className="text-[10px] font-mono text-zinc-600 block">
                            Bloqueado
                          </span>
                        ) : null}
                        <span className="text-[10px] font-mono text-zinc-400 font-medium block">
                          {formatBigNumber(boss.hp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. ABA ÁRVORE DE CLÃS COM NÉVOA DA GUERRA                         */}
        {/* ================================================================= */}
        {activeTab === 'clans' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Chakra Ancestral
              </span>
              <span className="text-sm font-mono font-medium text-amber-300">
                {chakraAncestral.toString()}
              </span>
            </div>

            <div className="space-y-2">
              {Object.values(CLAN_NODES).map((node) => {
                const isUnlocked = !!clanNodes[node.id];
                const isVisible = !node.parent || !!clanNodes[node.parent];
                const canAfford = chakraAncestral.gte(node.cost);

                if (!isVisible) {
                  return (
                    <div
                      key={node.id}
                      className="p-3 bg-zinc-950/40 border border-dashed border-zinc-800/60 rounded-lg opacity-50 flex items-center gap-3"
                    >
                      <HelpCircle className="w-5 h-5 text-zinc-600 stroke-[1.5]" />
                      <div>
                        <span className="text-xs font-medium text-zinc-400 block">Linhagem Oculta</span>
                        <span className="text-[10px] font-mono text-zinc-600">Requer nó ancestral prévio</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={node.id}
                    className={`p-3 rounded-lg border transition ${
                      isUnlocked
                        ? 'bg-zinc-850/80 border-zinc-700'
                        : canAfford
                        ? 'bg-zinc-900/60 border-zinc-700/80 hover:border-zinc-600'
                        : 'bg-zinc-950/40 border-zinc-850 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 flex-shrink-0">
                          <IconRenderer name={node.icon} className="w-4 h-4 stroke-[1.75]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-200">{node.name}</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{node.desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {isUnlocked ? (
                          <Badge variant="production">Desperto</Badge>
                        ) : (
                          `Custo: ${node.cost} Ancestral`
                        )}
                      </span>

                      {!isUnlocked && (
                        <button
                          disabled={!canAfford}
                          onClick={() => buyClanNode(node.id)}
                          className={`px-3 py-1 rounded text-[11px] font-medium transition border ${
                            canAfford
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700 shadow-sm'
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          }`}
                        >
                          Despertar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. ABA EXAME CHŪNIN                                              */}
        {/* ================================================================= */}
        {activeTab === 'exam' && (
          <div className="space-y-3 p-1">
            <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Scroll className="w-4 h-4 text-zinc-400 stroke-[1.75]" /> Exame Chūnin Oficial
              </h4>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Supere as três etapas do exame (Prova Teórica, Floresta da Morte e Torneio 1v1).
              </p>

              <div className="space-y-2 text-left text-xs mb-4 font-mono">
                <div className="p-2.5 bg-zinc-900/60 rounded-md border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">1ª Fase: Prova Teórica</span>
                  <Badge variant="neutral">Furtividade</Badge>
                </div>
                <div className="p-2.5 bg-zinc-900/60 rounded-md border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">2ª Fase: Floresta da Morte</span>
                  <Badge variant="neutral">180s Limite</Badge>
                </div>
                <div className="p-2.5 bg-zinc-900/60 rounded-md border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">3ª Fase: Torneio na Arena</span>
                  <Badge variant="chakra">QTE & Parry</Badge>
                </div>
              </div>

              <button
                onClick={() => alert('O Exame Chūnin começará! Bônus permanente concedido.')}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-mono text-xs rounded-md border border-zinc-700 shadow-sm transition"
              >
                Iniciar Desafio do Exame
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. ABA RANKINGS                                                  */}
        {/* ================================================================= */}
        {activeTab === 'rankings' && (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 block mb-2">
              Quadro de Honra Shinobi
            </span>
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-md flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400 stroke-[1.75]" /> 1º Hokage Hashirama
              </span>
              <span className="font-mono text-zinc-400">9.99 Qi</span>
            </div>
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-md flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" /> 2º Madara Uchiha
              </span>
              <span className="font-mono text-zinc-400">8.50 Qi</span>
            </div>
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-md flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600 stroke-[1.75]" /> 3º Naruto Uzumaki
              </span>
              <span className="font-mono text-zinc-400">5.00 Qi</span>
            </div>
            <div className="p-2.5 bg-zinc-900 border border-zinc-700 rounded-md flex items-center justify-between text-xs font-medium">
              <span className="text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 stroke-[1.75]" /> Você (Shinobi)
              </span>
              <span className="font-mono text-orange-400 font-semibold">{formatBigNumber(chakra)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
