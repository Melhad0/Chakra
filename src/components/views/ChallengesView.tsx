import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import Decimal from 'break_infinity.js';
import { calculateTotalCPS, calculateClickPower } from '../../engine/formulas';
import { audio } from '../../engine/audio';
import { GAUNTLET_BOSSES, calculateEffectiveBossReward } from '../../constants/bosses';
import { BossData } from '../../types/combat';
import { Badge } from '../common/Badge';
import { IconRenderer } from '../common/IconRenderer';
import { ViewHeader } from './ViewHeader';
import {
  Swords,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Lock,
} from 'lucide-react';

export const ChallengesView: React.FC = () => {
  const clanNodes = useGameStore((s) => s.clanNodes);
  const generators = useGameStore((s) => s.generators);
  const upgrades = useGameStore((s) => s.upgrades);
  const gatesUnlocked = useGameStore((s) => s.gatesUnlocked);
  const gatesActiveTimer = useGameStore((s) => s.gatesActiveTimer);
  const exhaustionTimer = useGameStore((s) => s.exhaustionTimer);
  const onlinePresenceBuffTimer = useGameStore((s) => s.onlinePresenceBuffTimer);
  const stableRollingCPS = useGameStore((s) => s.stableRollingCPS);

  // Estado Gauntlet do Zustand Store
  const gauntlet = useGameStore((s) => s.gauntlet);
  const startBossFight = useGameStore((s) => s.startBossFight);
  const onBossVictory = useGameStore((s) => s.onBossVictory);
  const onBossDefeat = useGameStore((s) => s.onBossDefeat);

  // Chefe selecionado para visualização no painel
  const [selectedBossId, setSelectedBossId] = useState<number>(gauntlet.currentActiveBossId);

  // Mantém selectedBossId sincronizado quando o chefe ativo avança
  useEffect(() => {
    setSelectedBossId(gauntlet.currentActiveBossId);
  }, [gauntlet.currentActiveBossId]);

  const currentBoss: BossData =
    GAUNTLET_BOSSES.find((b) => b.id === selectedBossId) || GAUNTLET_BOSSES[0];

  const isActiveTarget = currentBoss.id === gauntlet.currentActiveBossId;
  const isCleared = currentBoss.id <= gauntlet.highestBossDefeated;
  const isLocked = currentBoss.id > gauntlet.currentActiveBossId;

  // Gerenciamento de Cooldown de Recuperação de Esquadrão
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const cooldownExpiresAt = gauntlet.cooldownExpiresAt;
  const isCooldownActive = !!(cooldownExpiresAt && cooldownExpiresAt > now);
  const cooldownRemainingMs = isCooldownActive && cooldownExpiresAt ? cooldownExpiresAt - now : 0;

  const formatCooldown = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}s`;
  };

  // Estados locais do combate ativo
  const [bossHp, setBossHp] = useState<Decimal>(currentBoss.hp);
  const [ghostHp, setGhostHp] = useState<Decimal>(currentBoss.hp);
  const [combatTimer, setCombatTimer] = useState<number>(currentBoss.timer);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [lastDmgInfo, setLastDmgInfo] = useState<{ amount: number; isCrit: boolean; note?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('Todos');
  const [defeatMessage, setDefeatMessage] = useState<string | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);

  // Estados específicos de mecânicas de chefes
  const [puppetsRemaining, setPuppetsRemaining] = useState<number>(10);
  const [isIaiSilenced, setIsIaiSilenced] = useState<boolean>(false);
  const [isBakuActive, setIsBakuActive] = useState<boolean>(false);
  const [lastClickTimestamp, setLastClickTimestamp] = useState<number>(0);
  const [forbiddenWord, setForbiddenWord] = useState<string>('CHAKRA');
  const [muuFissionActive, setMuuFissionActive] = useState<boolean>(false);
  const [cloneHpA, setCloneHpA] = useState<Decimal>(currentBoss.hp.div(2));
  const [cloneHpB, setCloneHpB] = useState<Decimal>(currentBoss.hp.div(2));
  const [toneriQteActive, setToneriQteActive] = useState<boolean>(false);
  const [toneriClicks, setToneriClicks] = useState<number>(0);
  const [toneriTimer, setToneriTimer] = useState<number>(1.5);
  const [isshikiCubes, setIsshikiCubes] = useState<number>(3);

  const prevBossIdRef = useRef<number>(currentBoss.id);

  // Reset de combate ao trocar de chefe ou encerrar luta
  useEffect(() => {
    setBossHp(currentBoss.hp);
    setGhostHp(currentBoss.hp);
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
  }, [currentBoss.id, currentBoss.hp, currentBoss.timer, gauntlet.isFighting]);

  // Rastro fantasma de dano recebido
  useEffect(() => {
    const timer = setTimeout(() => {
      setGhostHp(bossHp);
    }, 300);
    return () => clearTimeout(timer);
  }, [bossHp]);

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
      exhaustionTimer > 0,
      {},
      onlinePresenceBuffTimer > 0
    );
  }, [generators, upgrades, effectiveClanNodes, gatesUnlocked, gatesActiveTimer, exhaustionTimer, onlinePresenceBuffTimer]);

  const clickPower = useMemo(() => {
    let p = calculateClickPower(currentCPS, upgrades, effectiveClanNodes);
    if (isIaiSilenced) {
      p = D(1);
    }
    return p;
  }, [currentCPS, upgrades, effectiveClanNodes, isIaiSilenced]);

  const playerBaseDamage = Math.max(5, Math.floor(clickPower.toNumber()));

  // =========================================================================
  // LOOP DE COMBATE DO GAUNTLET (EXECUTA EXCLUSIVAMENTE COM isFighting = true)
  // =========================================================================
  useEffect(() => {
    if (!gauntlet.isFighting) return;

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

        // Mecânica Mifune: Silêncio Iai
        if (currentBoss.mechanic.type === 'mifune_iai') {
          const elapsed = currentBoss.timer - nextTimer;
          const cycle = Math.floor(elapsed) % 8;
          setIsIaiSilenced(cycle < 2);
        }

        // Mecânica Danzō: Vórtice do Baku
        if (currentBoss.mechanic.type === 'danzo_baku') {
          const elapsed = currentBoss.timer - nextTimer;
          const cycle = Math.floor(elapsed) % 10;
          setIsBakuActive(cycle < 3);
        }

        // Mecânica Tayuya: Dreno passivo
        if (currentBoss.mechanic.type === 'tayuya_drain' && Math.floor(nextTimer * 10) % 50 === 0) {
          useGameStore.setState((s) => ({
            chakra: s.chakra.mul(0.99),
          }));
        }

        return nextTimer;
      });

      // 3. Dano Passivo por Segundo (CPS)
      if (currentBoss.mechanic.type !== 'raikage_armor' && currentCPS.gt(0)) {
        let dpsTick = currentCPS.mul(0.1);

        // Calibração: Chefe 30+ possui blindagem passiva (-40% CPS)
        if (currentBoss.id >= 30) {
          dpsTick = dpsTick.mul(0.60);
        }

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
          setBossHp((prev) => {
            const next = prev.sub(dpsTick);
            if (next.lte(0)) {
              triggerVictory();
              return D(0);
            }
            return next;
          });
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
    gauntlet.isFighting,
    currentBoss,
    currentCPS,
    puppetsRemaining,
    muuFissionActive,
    toneriQteActive,
  ]);

  const triggerVictory = () => {
    audio.playLevelUp();
    const effectiveReward = calculateEffectiveBossReward(currentBoss.id, stableRollingCPS);
    setVictoryMessage(
      `Vitória confirmada sobre #${currentBoss.id} ${currentBoss.name}! Recompensa única de ${formatBigNumber(
        effectiveReward
      )} Chakra concedida. Esquadrão em descanso tático por 45s.`
    );
    setTimeout(() => setVictoryMessage(null), 5000);

    onBossVictory(currentBoss.id);
  };

  const triggerDefeat = (reason: string) => {
    audio.playCrit();
    setDefeatMessage(
      `COLAPSO DE ESQUADRÃO!\n${reason}\nPenalidade de descanso de 90s aplicada antes de nova tentativa.`
    );
    setTimeout(() => setDefeatMessage(null), 6000);

    onBossDefeat();

    setPuppetsRemaining(10);
    setMuuFissionActive(false);
    setToneriQteActive(false);
    setIsshikiCubes(3);
  };

  const handleStartFight = () => {
    if (isCooldownActive || isCleared || isLocked) return;
    const ok = startBossFight();
    if (ok) {
      audio.playLevelUp();
      setDefeatMessage(null);
      setVictoryMessage(null);
    }
  };

  const handleAttackBoss = (isCenterHit: boolean = true) => {
    if (!gauntlet.isFighting) return;

    const attackNow = Date.now();

    if (isBakuActive && attackNow - lastClickTimestamp < 350) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Vórtice do Baku ativo. Ataque absorvido.' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }
    setLastClickTimestamp(attackNow);

    if (currentBoss.mechanic.type === 'kankuro_poison' && Math.random() < 0.2) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Névoa de veneno. Ataque errou o alvo!' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }

    if (currentBoss.mechanic.type === 'baki_wind' && !isCenterHit) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Lâmina de Vento. Apenas acerto central vulnerável.' });
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

    const isCrit = Math.random() < critChance;

    const hpRatio = bossHp.div(currentBoss.hp).toNumber();
    let finalCrit = isCrit;
    if (currentBoss.mechanic.type === 'jirobo_shield' && hpRatio >= 0.7) {
      finalCrit = false;
    }

    if (finalCrit) {
      audio.playCrit();
    } else {
      audio.playClick();
    }

    let calculatedDmg = finalCrit ? Math.floor(playerBaseDamage * critMult) : playerBaseDamage;

    if (currentBoss.mechanic.type === 'mizuki_rage' && combatTimer >= currentBoss.timer - 10) {
      calculatedDmg = Math.max(1, Math.floor(calculatedDmg / 2));
    }

    const dmg = D(Math.max(1, calculatedDmg));
    setLastDmgInfo({ amount: dmg.toNumber(), isCrit: finalCrit });
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

  const filteredBosses = useMemo(() => {
    return GAUNTLET_BOSSES.filter((b) => {
      const matchTier = tierFilter === 'Todos' || b.tier === tierFilter;
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toString() === searchQuery.trim();
      return matchTier && matchSearch;
    });
  }, [tierFilter, searchQuery]);

  const hpPercent = Math.max(0, Math.min(100, bossHp.div(currentBoss.hp).mul(100).toNumber()));
  const ghostPercent = Math.max(0, Math.min(100, ghostHp.div(currentBoss.hp).mul(100).toNumber()));
  const timerPercent = Math.max(0, Math.min(100, (combatTimer / currentBoss.timer) * 100));

  const effectiveRewardChakra = calculateEffectiveBossReward(currentBoss.id, stableRollingCPS);

  return (
    <div className="w-full h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden select-none">
      {/* Cabeçalho Universal com botão Retornar à Aldeia */}
      <ViewHeader
        title="Arena de Desafios"
        subtitle="Confrontos Táticos de Progressão Linear Estrita • Sem Replay"
        badgeText={
          isCooldownActive
            ? `Recuperação: ${formatCooldown(cooldownRemainingMs)}`
            : gauntlet.isFighting
            ? `Fase #${currentBoss.id} • Em Combate`
            : `Fase #${gauntlet.currentActiveBossId} • Alvo Ativo`
        }
        badgeVariant={isCooldownActive ? 'cyan' : gauntlet.isFighting ? 'danger' : 'chakra'}
      />

      {/* Conteúdo Principal Dividido em Arena Central e Catálogo Cronológico */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* ================================================================= */}
        {/* PALCO CENTRAL DE DUELO COM AMBIENTAÇÃO HEROICA                    */}
        {/* ================================================================= */}
        <section className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar relative">
          {/* TOPO: Informações do Chefe e Status de Conclusão */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-zinc-900 border flex items-center justify-center transition-all ${
                    isHit
                      ? 'border-rose-500 scale-95 text-rose-400'
                      : isCleared
                      ? 'border-emerald-600/60 text-emerald-400'
                      : isActiveTarget
                      ? 'border-rose-700/80 text-rose-300'
                      : 'border-zinc-800 text-zinc-500'
                  }`}
                >
                  <IconRenderer name={currentBoss.avatar} className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400 font-bold">
                      Fase #{currentBoss.id}
                    </span>
                    <h2 className="text-base font-bold text-zinc-100">{currentBoss.name}</h2>
                    {isCleared ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> CONCLUÍDO
                      </span>
                    ) : isActiveTarget ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950/60 border border-rose-800/60 text-rose-300 animate-pulse">
                        <Swords className="w-3 h-3" /> ALVO ATIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500">
                        <Lock className="w-3 h-3" /> BLOQUEADO
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-zinc-400 block mt-0.5">
                    {currentBoss.title} • {currentBoss.level} ({currentBoss.arc})
                  </span>
                </div>
              </div>

              {/* Distintivos de Dificuldade e Recompensas Únicas */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="neutral">{currentBoss.tier}</Badge>
                <div className="px-2.5 py-1 rounded-lg bg-zinc-950/70 border border-zinc-800 text-right font-mono text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase block">Recompensa Única</span>
                  <span className="text-orange-400 font-bold">+{formatBigNumber(effectiveRewardChakra)}</span>
                  <span className="text-amber-300 text-[10px] ml-1.5">+{currentBoss.bountyAncestral} Anc</span>
                  {currentBoss.weaponFragments && (
                    <span className="text-purple-400 text-[10px] ml-1.5 font-bold">
                      +{currentBoss.weaponFragments} Frag
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BANNERS DE FEEDBACK (VITÓRIA, DERROTA OU RECUPERAÇÃO ATIVA) */}
            {isCooldownActive && (
              <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between gap-3 text-amber-300 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Descanso Tático de Esquadrão:</strong> Reorganizando táticas para evitar exaustão.
                  </span>
                </div>
                <div className="font-bold text-amber-200 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-700/60 whitespace-nowrap">
                  Recuperação: {formatCooldown(cooldownRemainingMs)}
                </div>
              </div>
            )}

            {victoryMessage && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{victoryMessage}</span>
              </div>
            )}

            {defeatMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="whitespace-pre-line">{defeatMessage}</span>
              </div>
            )}

            {/* BARRAS DE VIDA (HP) E TEMPO RESTANTE */}
            <div className="mt-4 space-y-3">
              {/* Barra de Vida com Ghost Bar e Dano Flutuante */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-400" /> Integridade do Chefe
                  </span>
                  <span className="text-zinc-200 font-bold">
                    {formatBigNumber(bossHp)} / {formatBigNumber(currentBoss.hp)} ({hpPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-zinc-950 rounded-lg overflow-hidden relative border border-zinc-800 p-0.5">
                  {/* Rastro fantasma de dano */}
                  <div
                    style={{ width: `${ghostPercent}%` }}
                    className="absolute top-0.5 bottom-0.5 left-0.5 bg-amber-500/40 rounded-md transition-all duration-500"
                  />
                  {/* Barra de HP frontal */}
                  <div
                    style={{ width: `${hpPercent}%` }}
                    className={`h-full rounded-md transition-all duration-100 ${
                      hpPercent <= 25 ? 'bg-rose-600' : hpPercent <= 60 ? 'bg-orange-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* Barra de Tempo do Combate */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" /> Janela Tática de Ataque
                  </span>
                  <span
                    className={`font-bold ${
                      combatTimer <= 5 && gauntlet.isFighting ? 'text-rose-400 animate-pulse' : 'text-zinc-300'
                    }`}
                  >
                    {combatTimer.toFixed(1)}s / {currentBoss.timer}s
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-md overflow-hidden border border-zinc-800/80">
                  <div
                    style={{ width: `${timerPercent}%` }}
                    className={`h-full transition-all duration-100 ${
                      combatTimer <= 5 && gauntlet.isFighting ? 'bg-rose-500' : 'bg-zinc-400'
                    }`}
                  />
                </div>
              </div>

              {/* Fissão Corpórea de Muu */}
              {muuFissionActive && (
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[10px]">
                  <div className="p-2 rounded bg-zinc-950/80 border border-zinc-800">
                    <span className="text-zinc-400 block mb-0.5">Clone Alfa</span>
                    <span className="text-rose-400 font-bold">{formatBigNumber(cloneHpA)} HP</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/80 border border-zinc-800">
                    <span className="text-zinc-400 block mb-0.5">Clone Beta</span>
                    <span className="text-rose-400 font-bold">{formatBigNumber(cloneHpB)} HP</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTRO: ÁREA DE INTERAÇÃO OU DISPARO DE COMBATE */}
          <div className="my-6 flex flex-col items-center justify-center">
            {/* Estado 1: Chefe já Derrotado (Concluído) */}
            {isCleared ? (
              <div className="text-center p-6 rounded-2xl bg-zinc-950/60 border border-zinc-850 max-w-md w-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mb-1">Chefe Concluído e Derrotado</h3>
                <p className="text-xs text-zinc-400 font-mono mb-4 leading-relaxed">
                  As recompensas de #{currentBoss.id} {currentBoss.name} já foram totalmente resgatadas neste ciclo.
                  O modo de farm repetitivo foi extinto para manter a integridade da economia shinobi.
                </p>
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 border border-zinc-700 transition"
                >
                  Confronto Já Superado (Bloqueado)
                </button>
              </div>
            ) : isLocked ? (
              /* Estado 2: Chefe Futuro Bloqueado */
              <div className="text-center p-6 rounded-2xl bg-zinc-950/60 border border-zinc-850 max-w-md w-full">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-3">
                  <Lock className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-zinc-300 mb-1">Chefe Bloqueado</h3>
                <p className="text-xs text-zinc-500 font-mono mb-4">
                  Supere o chefe ativo #{gauntlet.currentActiveBossId} para ter acesso a esta barreira.
                </p>
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 border border-zinc-700 transition"
                >
                  Barreira Bloqueada
                </button>
              </div>
            ) : !gauntlet.isFighting ? (
              /* Estado 3: Chefe Ativo Pronto para Combate (Verifica Cooldown) */
              <div className="text-center p-6 rounded-2xl bg-zinc-950/60 border border-zinc-850 max-w-md w-full">
                <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto mb-3">
                  <Swords className="w-7 h-7 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mb-1">Confronto Decisivo: #{currentBoss.id}</h3>
                <p className="text-xs text-zinc-400 font-mono mb-4 leading-relaxed">
                  {currentBoss.justification}
                </p>

                {isCooldownActive ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 border border-zinc-700 transition"
                    >
                      Recuperação de Esquadrão: {formatCooldown(cooldownRemainingMs)}
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500 block">
                      Aguarde o término do descanso tático para iniciar o duelo.
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleStartFight}
                    className="w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-lg shadow-rose-950/40 active:scale-95 transition cursor-pointer"
                  >
                    Iniciar Combate ({currentBoss.timer}s)
                  </button>
                )}
              </div>
            ) : (
              /* Estado 4: LUTA ATIVA (isFighting = true) */
              <div className="w-full max-w-lg flex flex-col items-center">
                {/* Feedback de Dano */}
                <div className="h-6 flex items-center justify-center mb-2">
                  {lastDmgInfo && (
                    <span
                      className={`text-xs font-mono font-bold animate-bounce ${
                        lastDmgInfo.note
                          ? 'text-amber-400'
                          : lastDmgInfo.isCrit
                          ? 'text-amber-300 scale-110'
                          : 'text-zinc-200'
                      }`}
                    >
                      {lastDmgInfo.note || `-${formatBigNumber(lastDmgInfo.amount)} Dano`}
                    </span>
                  )}
                </div>

                {/* Botão de Ataque Central */}
                <button
                  onClick={() => handleAttackBoss(true)}
                  className={`w-36 h-36 rounded-full bg-gradient-to-b from-rose-950 to-zinc-950 border-2 flex flex-col items-center justify-center shadow-2xl transition-all duration-100 cursor-pointer active:scale-90 ${
                    isHit ? 'border-rose-400 scale-95' : 'border-rose-800/80 hover:border-rose-500 hover:scale-105'
                  }`}
                >
                  <Swords className="w-10 h-10 text-rose-400 stroke-[1.75]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 font-semibold mt-2">
                    Golpear
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    -{formatBigNumber(playerBaseDamage)}
                  </span>
                </button>

                {/* Botão Adicional de Borda para Mecânica do Baki */}
                {currentBoss.mechanic.type === 'baki_wind' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAttackBoss(false)}
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-mono rounded-lg hover:bg-zinc-850"
                    >
                      Golpe na Borda
                    </button>
                    <button
                      onClick={() => handleAttackBoss(true)}
                      className="px-3 py-1.5 bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-mono font-bold rounded-lg hover:bg-rose-900"
                    >
                      Acerto Central Vulnerável
                    </button>
                  </div>
                )}

                {/* QTE Especial do Toneri */}
                {toneriQteActive && (
                  <div className="mt-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-700 flex items-center justify-between gap-3 w-full">
                    <div className="text-xs font-mono text-cyan-300">
                      QTE: Apare a Espada de Prata! ({toneriClicks}/3 cliques) • {toneriTimer.toFixed(1)}s
                    </div>
                    <button
                      onClick={handleToneriQteClick}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded-lg"
                    >
                      Aparar!
                    </button>
                  </div>
                )}

                {/* Cubos de Daikokuten do Isshiki */}
                {currentBoss.mechanic.type === 'isshiki_cubes' && isshikiCubes > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3 w-full">
                    <div className="text-xs font-mono text-zinc-400">
                      Cubos Negros ({isshikiCubes}/3): Clãs Suprimidos
                    </div>
                    <button
                      onClick={handleDestroyIsshikiCube}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-md border border-zinc-700 cursor-pointer"
                    >
                      Estilhaçar Cubo
                    </button>
                  </div>
                )}

                {/* Palavra Proibida de Kinkaku & Ginkaku */}
                {currentBoss.mechanic.type === 'kinkaku_words' && (
                  <div className="mt-4 p-3 rounded-xl bg-purple-950/50 border border-purple-800/60 flex items-center justify-between gap-3 w-full">
                    <div className="text-xs font-mono text-purple-300">
                      Palavra Tabu Detectada: <strong>"{forbiddenWord}"</strong>
                    </div>
                    <button
                      onClick={handleForbiddenWordClick}
                      className="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-mono rounded-md border border-purple-700 cursor-pointer"
                    >
                      Pronunciar (-15% Tempo)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mecânica Canônica do Chefe */}
            <div className="mt-4 max-w-lg text-center px-4 py-2 rounded-xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-400 font-mono">
              <span className="text-zinc-200 font-semibold mr-1">[{currentBoss.mechanic.title}]:</span>
              <span>{currentBoss.mechanic.description}</span>
            </div>
          </div>

          {/* RODAPÉ DA ARENA: Navegação Linear entre Chefes Catalogados */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                disabled={selectedBossId <= 1}
                onClick={() => setSelectedBossId((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" /> Chefe Anterior
              </button>

              <button
                disabled={selectedBossId >= GAUNTLET_BOSSES.length}
                onClick={() => setSelectedBossId((prev) => Math.min(GAUNTLET_BOSSES.length, prev + 1))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Próximo Chefe <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Atalho para Selecionar o Chefe Ativo Atual */}
            <button
              onClick={() => setSelectedBossId(gauntlet.currentActiveBossId)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono text-zinc-300 transition"
            >
              Focar no Alvo Ativo (#{gauntlet.currentActiveBossId})
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* PAINEL LATERAL CRONOLÓGICO DOS 40+ CHEFES                         */}
        {/* ================================================================= */}
        <aside className="w-full lg:w-96 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Cronologia de Oponentes
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                Progresso: {gauntlet.highestBossDefeated} / {GAUNTLET_BOSSES.length} Superados
              </span>
            </div>
            <Badge variant="chakra">{filteredBosses.length} Visíveis</Badge>
          </div>

          {/* Filtros e Busca */}
          <div className="my-3 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar chefe por nome ou #..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-mono">
              {['Todos', 'Inicial / Chūnin', 'Jōnin / Invasões', 'Kage / Lendário', 'Continental / Divino'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`px-2 py-0.5 rounded border whitespace-nowrap transition ${
                    tierFilter === t
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold'
                      : 'bg-zinc-950/40 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Lista com Rolagem Independente */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredBosses.map((boss) => {
              const isBossCleared = boss.id <= gauntlet.highestBossDefeated;
              const isBossActive = boss.id === gauntlet.currentActiveBossId;
              const isBossLocked = boss.id > gauntlet.currentActiveBossId;
              const isBossSelected = boss.id === selectedBossId;

              return (
                <div
                  key={boss.id}
                  onClick={() => setSelectedBossId(boss.id)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isBossSelected
                      ? 'bg-zinc-800/90 border-rose-500/60 text-zinc-100 shadow-md'
                      : isBossActive
                      ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700 text-zinc-300'
                      : isBossCleared
                      ? 'bg-zinc-950/50 border-zinc-850/80 hover:border-zinc-750 text-zinc-400'
                      : isBossLocked
                      ? 'opacity-50 bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-500'
                      : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                        isBossCleared
                          ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                          : isBossActive
                          ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <IconRenderer name={boss.avatar} className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold">#{boss.id}</span>
                        <h4 className="text-xs font-semibold text-zinc-200 truncate">{boss.name}</h4>
                      </div>
                      <span className="text-[10px] text-zinc-500 block truncate">{boss.level}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    {isBossCleared ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Vencido
                      </span>
                    ) : isBossActive ? (
                      <span className="text-[10px] font-mono text-rose-400 font-bold block">
                        Alvo Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600 block flex items-center justify-end gap-1">
                        <Lock className="w-2.5 h-2.5" /> Bloqueado
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-zinc-400 font-medium block">
                      {formatBigNumber(boss.hp)} HP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
