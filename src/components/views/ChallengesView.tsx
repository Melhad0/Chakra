import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber, D } from '../../engine/BigNumber';
import Decimal from 'break_infinity.js';
import { audio } from '../../engine/audio';
import {
  GAUNTLET_BOSSES,
  calculateEffectiveBossReward,
  calculateBossAttackDamage,
  calculateBossAttackInterval,
  calculateBossXp,
  calculatePlayerMaxHp,
  calculatePlayerDamage,
  calculateDodgeChance,
} from '../../constants/bosses';
import { BossData, MAX_COMBAT_LEVEL } from '../../types/combat';
import {
  getBossLootDefinition,
  calculateBossDropProbability,
  calculateBossSlotDropProbability,
} from '../../constants/equipmentCatalog';
import { BOSS_EQUIPMENT_SLOTS, BossEquipmentSlotKey } from '../../types/inventory';
import { getRarityConfig } from '../../types/rarity';
import { Badge } from '../common/Badge';
import { IconRenderer } from '../common/IconRenderer';
import { ViewHeader } from './ViewHeader';
import { BattlefieldBackground } from '../challenges/BattlefieldBackground';
import {
  Swords,
  ChevronLeft,
  ChevronRight,
  Shield,
  Heart,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Plus,
  Flame,
  Search,
  Activity,
  Package,
  FastForward,
  Repeat,
} from 'lucide-react';

const SLOT_SHORT_LABELS: Record<BossEquipmentSlotKey, string> = {
  HELMET: 'Capacete',
  CHESTPLATE: 'Armadura',
  GLOVES: 'Luvas',
  BOOTS: 'Botas',
  CLOAK: 'Capa',
  BACKPACK: 'Mochila',
  NECKLACE: 'Colar',
  MASK: 'Máscara',
  WEAPON_RANGED: 'Ranged',
  WEAPON_MELEE: 'Melee',
};

export const ChallengesView: React.FC = () => {
  const stableRollingCPS = useGameStore((s) => s.stableRollingCPS);
  const gauntlet = useGameStore((s) => s.gauntlet);
  const combatStats = useGameStore((s) => s.combatStats);
  const inventory = useGameStore((s) => s.inventory);
  const clanNodes = useGameStore((s) => s.clanNodes);

  const startBossFight = useGameStore((s) => s.startBossFight);
  const onBossVictory = useGameStore((s) => s.onBossVictory);
  const onBossDefeat = useGameStore((s) => s.onBossDefeat);
  const distributeCombatStats = useGameStore((s) => s.distributeCombatStats);
  const setCurrentActiveBossId = useGameStore((s) => s.setCurrentActiveBossId);
  const toggleGauntletAutoAdvance = useGameStore((s) => s.toggleGauntletAutoAdvance);
  const toggleGauntletAutoLoop = useGameStore((s) => s.toggleGauntletAutoLoop);

  // Chefe selecionado na navegação (inicia no chefe ativo ou no 1)
  const [selectedBossId, setSelectedBossId] = useState<number>(gauntlet.currentActiveBossId || 1);
  const [hospitalCooldownRemaining, setHospitalCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    const updateCd = () => {
      if (gauntlet.cooldownExpiresAt && gauntlet.cooldownExpiresAt > Date.now()) {
        setHospitalCooldownRemaining(Math.max(0, Math.ceil((gauntlet.cooldownExpiresAt - Date.now()) / 1000)));
      } else {
        setHospitalCooldownRemaining(0);
      }
    };
    updateCd();
    const interval = setInterval(updateCd, 1000);
    return () => clearInterval(interval);
  }, [gauntlet.cooldownExpiresAt]);

  // Sincroniza quando o chefe ativo avança
  useEffect(() => {
    if (gauntlet.currentActiveBossId) {
      setSelectedBossId(gauntlet.currentActiveBossId);
    }
  }, [gauntlet.currentActiveBossId]);

  const currentBoss: BossData = useMemo(() => {
    return GAUNTLET_BOSSES.find((b) => b.id === selectedBossId) || GAUNTLET_BOSSES[0];
  }, [selectedBossId]);

  const isCleared = currentBoss.id <= gauntlet.highestBossDefeated;
  const isLocked = currentBoss.id > Math.max(gauntlet.highestBossDefeated + 1, gauntlet.currentActiveBossId);
  const isActiveTarget = currentBoss.id === gauntlet.currentActiveBossId;

  // Multiplicadores de Trajes e Armas equipadas no Inventário
  const weaponMultiplier = useMemo(() => {
    const melee = inventory?.equippedGear?.WEAPON_MELEE;
    const ranged = inventory?.equippedGear?.WEAPON_RANGED;
    const legacy = inventory?.equippedWeapon;
    const item = melee || legacy || ranged;
    return item?.bonusClickMult && item.bonusClickMult.gt(1) ? item.bonusClickMult : D(1);
  }, [inventory]);

  const armorMultiplier = useMemo(() => {
    const chest = inventory?.equippedGear?.CHESTPLATE;
    const legacy = inventory?.equippedArmor;
    const item = chest || legacy;
    return item?.bonusCpsMult && item.bonusCpsMult.gt(1) ? item.bonusCpsMult : D(1);
  }, [inventory]);

  // Atributos de Combate do Jogador
  const playerMaxHp = useMemo(() => {
    return calculatePlayerMaxHp(combatStats.vitality, armorMultiplier);
  }, [combatStats.vitality, armorMultiplier]);

  const playerBaseDamage = useMemo(() => {
    return calculatePlayerDamage(combatStats.strength, weaponMultiplier);
  }, [combatStats.strength, weaponMultiplier]);

  const playerDodgeChance = useMemo(() => {
    return calculateDodgeChance(combatStats.agility);
  }, [combatStats.agility]);

  // Atributos de Ataque do Chefe
  const bossAttackDamage = useMemo(() => {
    return calculateBossAttackDamage(currentBoss.id);
  }, [currentBoss.id]);

  const bossAttackIntervalSec = useMemo(() => {
    return calculateBossAttackInterval(currentBoss.id);
  }, [currentBoss.id]);

  // Estados locais de Combate
  const [bossHp, setBossHp] = useState<Decimal>(currentBoss.hp);
  const [ghostHp, setGhostHp] = useState<Decimal>(currentBoss.hp);
  const [playerHp, setPlayerHp] = useState<number>(playerMaxHp);
  const [playerGhostHp, setPlayerGhostHp] = useState<number>(playerMaxHp);
  const [bossAttackProgress, setBossAttackProgress] = useState<number>(0); // 0 a 100%

  const [isHit, setIsHit] = useState<boolean>(false);
  const [isPlayerHit, setIsPlayerHit] = useState<boolean>(false);
  const [lastDmgInfo, setLastDmgInfo] = useState<{ amount: number; isCrit: boolean; note?: string } | null>(null);
  const [playerDmgFeedback, setPlayerDmgFeedback] = useState<string | null>(null);

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

  // Aba ativa nos painéis táticos: 'COMBAT' | 'STATS' | 'DROPS'
  const [activeSideTab, setActiveSideTab] = useState<'STATS' | 'DROPS' | 'LIST'>('STATS');

  // Inicializa e reseta valores ao mudar de chefe ou iniciar combate
  useEffect(() => {
    setBossHp(currentBoss.hp);
    setGhostHp(currentBoss.hp);
    setPlayerHp(playerMaxHp);
    setPlayerGhostHp(playerMaxHp);
    setBossAttackProgress(0);
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

    const forbiddenWords = ['CHAKRA', 'FOGO', 'RASENGAN', 'SELO', 'NINJA', 'KATON', 'SHINOBI'];
    setForbiddenWord(forbiddenWords[Math.floor(Math.random() * forbiddenWords.length)]);
  }, [currentBoss.id, currentBoss.hp, playerMaxHp, gauntlet.isFighting]);

  // Efeito rastro fantasma no HP do chefe e jogador
  useEffect(() => {
    const timer = setTimeout(() => setGhostHp(bossHp), 250);
    return () => clearTimeout(timer);
  }, [bossHp]);

  useEffect(() => {
    const timer = setTimeout(() => setPlayerGhostHp(playerHp), 250);
    return () => clearTimeout(timer);
  }, [playerHp]);

  // =========================================================================
  // GATILHOS DE VITÓRIA E DERROTA
  // =========================================================================
  const triggerVictory = useCallback(() => {
    const effectiveReward = calculateEffectiveBossReward(currentBoss.id, stableRollingCPS);
    const xpGained = calculateBossXp(currentBoss.id);

    setVictoryMessage(
      `Vitória conquistada contra #${currentBoss.id} ${currentBoss.name}!\nRecompensa: +${formatBigNumber(
        effectiveReward
      )} Chakra, +${currentBoss.bountyAncestral} Ancestral e +${formatBigNumber(xpGained)} XP de Combate!`
    );
    setTimeout(() => setVictoryMessage(null), 4000);

    onBossVictory(currentBoss.id);

    // Se o modo de Loop contínuo estiver ativado, reinicia imediatamente o combate contra o mesmo chefe
    if (gauntlet.autoLoop) {
      setBossHp(currentBoss.hp);
      setGhostHp(currentBoss.hp);
      setPlayerHp(playerMaxHp);
      setPlayerGhostHp(playerMaxHp);
      setBossAttackProgress(0);
      setPuppetsRemaining(10);
      setIsIaiSilenced(false);
      setIsBakuActive(false);
      setMuuFissionActive(false);
      setCloneHpA(currentBoss.hp.div(2));
      setCloneHpB(currentBoss.hp.div(2));
      setToneriQteActive(false);
      setToneriClicks(0);
      setIsshikiCubes(3);
    }
  }, [currentBoss, onBossVictory, stableRollingCPS, gauntlet.autoLoop, playerMaxHp]);

  const triggerDefeat = useCallback(
    (reason: string) => {
      audio.playCrit();
      setDefeatMessage(
        `DERROTA EM COMBATE!\n${reason}\nSeu shinobi foi hospitalizado e necessita de 45s de descanso para recuperar as forças.`
      );
      setTimeout(() => setDefeatMessage(null), 8000);

      onBossDefeat();
      setBossAttackProgress(0);
      setPlayerHp(playerMaxHp);
      setPuppetsRemaining(10);
      setMuuFissionActive(false);
      setToneriQteActive(false);
      setIsshikiCubes(3);
    },
    [onBossDefeat, playerMaxHp]
  );

  // =========================================================================
  // LOOP DE COMBATE: ATAQUES DO CHEFE (MAIS LENTOS QUE O JOGADOR, ~3.0s)
  // =========================================================================
  const playerHpRef = useRef(playerHp);
  playerHpRef.current = playerHp;

  useEffect(() => {
    if (!gauntlet.isFighting) return;

    const tickMs = 50;
    const progressPerTick = (100 / (bossAttackIntervalSec * 1000)) * tickMs;

    const interval = setInterval(() => {
      // 1. QTE Toneri
      if (toneriQteActive) {
        setToneriTimer((prev) => {
          const next = prev - 0.05;
          if (next <= 0) {
            setToneriQteActive(false);
            triggerDefeat('Toneri desferiu a Espada de Prata Reencarnada com força letal!');
            return 0;
          }
          return next;
        });
      }

      // 2. Progresso do Ataque do Chefe
      setBossAttackProgress((prevProgress) => {
        const nextProgress = prevProgress + progressPerTick;

        if (nextProgress >= 100) {
          // Chefe desfere o golpe contra o Shinobi!
          const rollDodge = Math.random() * 100;
          const dodged = rollDodge < playerDodgeChance;

          if (dodged) {
            audio.playClick();
            setPlayerDmgFeedback('ESQUIVOU! 💨 (0 Dano)');
            setTimeout(() => setPlayerDmgFeedback(null), 800);
          } else {
            audio.playCrit();
            setIsPlayerHit(true);
            setTimeout(() => setIsPlayerHit(false), 200);

            setPlayerDmgFeedback(`-${bossAttackDamage} HP`);
            setTimeout(() => setPlayerDmgFeedback(null), 800);

            const nextHp = Math.max(0, playerHpRef.current - bossAttackDamage);
            setPlayerHp(nextHp);

            if (nextHp <= 0) {
              triggerDefeat(`Sua vida chegou a zero sob a fúria do golpe de ${currentBoss.name}.`);
            }
          }

          return 0; // Reinicia a barra de cast de ataque
        }

        return nextProgress;
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [
    gauntlet.isFighting,
    bossAttackIntervalSec,
    bossAttackDamage,
    playerDodgeChance,
    currentBoss.name,
    toneriQteActive,
    triggerDefeat,
  ]);

  // =========================================================================
  // AUTO-ATAQUE RÍTMICO DO JOGADOR (1 GOLPE A CADA 0.8s)
  // O jogador ataca consistentemente com maior cadência que o chefe (3.0s)
  // =========================================================================
  const bossHpRef = useRef(bossHp);
  bossHpRef.current = bossHp;

  useEffect(() => {
    if (!gauntlet.isFighting) return;

    const autoStrikeInterval = setInterval(() => {
      // O auto-ataque causa 70% do dano base para recompensar cliques manuais adicionais
      const autoDmg = Math.max(1, Math.round(playerBaseDamage * 0.7));
      const dmgDecimal = D(autoDmg);

      setBossHp((prev) => {
        const next = prev.sub(dmgDecimal);
        if (next.lte(0)) {
          triggerVictory();
          return D(0);
        }
        return next;
      });
    }, 850);

    return () => clearInterval(autoStrikeInterval);
  }, [gauntlet.isFighting, playerBaseDamage, triggerVictory]);

  // =========================================================================
  // GOLPE MANUAL DO JOGADOR (INDEPENDENTE DO CPS, BASEADO EM FORÇA + ARMAS)
  // =========================================================================
  const handleAttackBoss = (isCenterHit: boolean = true) => {
    if (!gauntlet.isFighting) return;

    const attackNow = Date.now();

    // Mecânica Danzō: Baku Vortex
    if (isBakuActive && attackNow - lastClickTimestamp < 350) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Vórtice do Baku ativo! Golpe dispersado.' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }
    setLastClickTimestamp(attackNow);

    // Mecânica Mifune: Iai Silenciado
    if (currentBoss.mechanic.type === 'mifune_iai' && isIaiSilenced) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Lâmina Iai de Mifune! Ataque silenciado.' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }

    // Mecânica Kankurō: Névoa de Veneno (20% de erro)
    if (currentBoss.mechanic.type === 'kankuro_poison' && Math.random() < 0.2) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Névoa venenosa! Ataque errou o alvo!' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }

    // Mecânica Baki: Apenas acerto central causa dano
    if (currentBoss.mechanic.type === 'baki_wind' && !isCenterHit) {
      setLastDmgInfo({ amount: 0, isCrit: false, note: 'Lâmina de Vento! Apenas o centro é vulnerável!' });
      setTimeout(() => setLastDmgInfo(null), 500);
      return;
    }

    // Mecânica Chiyo: 10 Marionetes antes do corpo real
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
    setTimeout(() => setIsHit(false), 100);

    // Cálculo de Crítico
    let critChance = 0.05;
    let critMult = 2.0;
    if (clanNodes?.['sharingan_awakening']) critChance += 0.1;
    if (clanNodes?.['mangekyo_sharingan_lineage']) critMult = 3.0;

    // Equipamentos bônus de crítico
    const gearList = inventory?.equippedGear
      ? Object.values(inventory.equippedGear).filter(Boolean)
      : [];
    for (const g of gearList) {
      if (g?.bonusCritChance) critChance += g.bonusCritChance;
      if (g?.bonusCritMult) critMult *= g.bonusCritMult.toNumber();
    }

    const isCrit = Math.random() < critChance;
    const hpRatio = bossHp.div(currentBoss.hp).toNumber();

    // Mecânica Jirobō: Casca de Rocha imune a críticos acima de 70% HP
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

    // Mecânica Mizuki: Fúria reduz dano pela metade nos primeiros 10s
    if (currentBoss.mechanic.type === 'mizuki_rage' && bossAttackProgress < 50) {
      calculatedDmg = Math.max(1, Math.floor(calculatedDmg * 0.7));
    }

    const dmg = D(Math.max(1, calculatedDmg));
    setLastDmgInfo({ amount: dmg.toNumber(), isCrit: finalCrit });
    setTimeout(() => setLastDmgInfo(null), 500);

    // Mecânica Mū: Fissão Corpórea aos 50% HP
    if (currentBoss.mechanic.type === 'muu_fission' && !muuFissionActive && hpRatio <= 0.5) {
      setMuuFissionActive(true);
      setCloneHpA(bossHp.div(2));
      setCloneHpB(bossHp.div(2));
    }

    // Mecânica Toneri: QTE aos 50% HP
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

  // Início Manual de Batalha (Com Cooldown Hospitalar se Derrotado)
  const handleStartFight = () => {
    if (isLocked || hospitalCooldownRemaining > 0) return;
    setPlayerHp(playerMaxHp);
    setPlayerGhostHp(playerMaxHp);
    setBossHp(currentBoss.hp);
    setGhostHp(currentBoss.hp);
    setBossAttackProgress(0);
    setDefeatMessage(null);
    setVictoryMessage(null);

    // Define o chefe selecionado como ativo no store caso ainda não seja
    if (gauntlet.currentActiveBossId !== currentBoss.id) {
      setCurrentActiveBossId(currentBoss.id);
    }

    startBossFight();
    audio.playLevelUp();
  };

  // Recuar de combate
  const handleRetreat = () => {
    audio.playClick();
    onBossDefeat();
    setBossAttackProgress(0);
    setPlayerHp(playerMaxHp);
  };

  // Manipuladores de Mecânicas Especiais
  const handleForbiddenWordClick = () => {
    audio.playCrit();
    setPlayerHp((prev) => {
      const penalty = Math.round(playerMaxHp * 0.15);
      const next = Math.max(1, prev - penalty);
      setLastDmgInfo({
        amount: 0,
        isCrit: false,
        note: `Palavra Tabu "${forbiddenWord}": -${penalty} HP!`,
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
        setLastDmgInfo({ amount: 0, isCrit: true, note: 'Espada de Prata bloqueada com sucesso!' });
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
        note: `Cubo de Daikokuten destruído (${next} restantes)`,
      });
      setTimeout(() => setLastDmgInfo(null), 800);
      return next;
    });
  };

  // Distribuição de Atributos RPG
  const handleAddStat = (stat: 'strength' | 'vitality' | 'agility', amount: number) => {
    if (combatStats.unspentStatPoints <= 0) return;
    const finalAmount = Math.min(combatStats.unspentStatPoints, amount);
    distributeCombatStats(stat, finalAmount);
  };

  // Dados de Drops e Recompensas do Chefe Selecionado
  const lootDef = useMemo(() => {
    return getBossLootDefinition(currentBoss.id);
  }, [currentBoss.id]);

  const dropRatePct = useMemo(() => {
    return (calculateBossDropProbability(currentBoss.id) * 100).toFixed(1);
  }, [currentBoss.id]);

  const slotDropRatePct = useMemo(() => {
    return (calculateBossSlotDropProbability(currentBoss.id) * 100).toFixed(1);
  }, [currentBoss.id]);

  const [selectedLootSlot, setSelectedLootSlot] = useState<BossEquipmentSlotKey>('WEAPON_MELEE');

  const isItemOwned = useCallback(
    (itemId?: string) => {
      if (!itemId || !inventory) return false;
      if (
        inventory.equippedGear &&
        Object.values(inventory.equippedGear).some((item) => item?.id === itemId)
      ) {
        return true;
      }
      return inventory.inventoryBag.some((item) => item?.id === itemId);
    },
    [inventory]
  );

  const bossXpReward = useMemo(() => {
    return calculateBossXp(currentBoss.id);
  }, [currentBoss.id]);

  const effectiveRewardChakra = useMemo(() => {
    return calculateEffectiveBossReward(currentBoss.id, stableRollingCPS);
  }, [currentBoss.id, stableRollingCPS]);

  // Lista de Chefes Filtrada
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

  // Porcentagens visuais de barras
  const bossHpPercent = Math.max(0, Math.min(100, bossHp.div(currentBoss.hp).mul(100).toNumber()));
  const bossGhostPercent = Math.max(0, Math.min(100, ghostHp.div(currentBoss.hp).mul(100).toNumber()));
  const playerHpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
  const playerGhostPercent = Math.max(0, Math.min(100, (playerGhostHp / playerMaxHp) * 100));

  // XP Progressão
  const xpPercent = useMemo(() => {
    if (combatStats.level >= MAX_COMBAT_LEVEL) return 100;
    const current = combatStats.currentXp.toNumber();
    const req = combatStats.requiredXp.toNumber();
    return Math.min(100, Math.max(0, (current / (req || 1)) * 100));
  }, [combatStats]);

  return (
    <div className="w-full h-full bg-[#05070d] text-zinc-100 flex flex-col overflow-hidden select-none relative">
      {/* CABEÇALHO DA ARENA */}
      <div className="relative z-10">
        <ViewHeader
          title="Desafios Shinobi & Grande Guerra"
          subtitle="Combates Manuais por Turno de Ação • Progressão RPG com Nível Máximo 700"
          badgeText={
            gauntlet.isFighting
              ? `Fase #${currentBoss.id} • Em Combate`
              : `Fase #${gauntlet.currentActiveBossId} • Alvo Ativo`
          }
          badgeVariant={gauntlet.isFighting ? 'danger' : 'chakra'}
        />
      </div>

      {/* ÁREA PRINCIPAL: PALCO DE BATALHA + PAINÉIS DE ATRIBUTOS E CATÁLOGO */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden relative z-10">
        {/* ================================================================= */}
        {/* 1. PALCO CENTRAL DE DUELO COM CENÁRIO DE GUERRA (ESTILO PRINT 2)   */}
        {/* ================================================================= */}
        <section className="flex-1 relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950/95 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar select-none group/arena min-h-[520px]">
          {/* Cenário de Guerra com God Rays, Radar e Orbes Encapsulado na Box */}
          <BattlefieldBackground bossId={currentBoss.id} isFighting={gauntlet.isFighting} />

          {/* TOPO: Informações do Chefe */}
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2 bg-zinc-950/40 backdrop-blur-md p-3.5 rounded-xl border border-white/5 shadow-md">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-zinc-900/80 backdrop-blur-sm border flex items-center justify-center transition-all ${
                    isHit
                      ? 'border-rose-500 scale-95 text-rose-400'
                      : isCleared
                      ? 'border-emerald-600/70 text-emerald-400'
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/70 border border-emerald-800/70 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> CONCLUÍDO
                      </span>
                    ) : isActiveTarget ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950/70 border border-rose-800/70 text-rose-300 animate-pulse">
                        <Swords className="w-3 h-3" /> ALVO ATIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900/80 border border-zinc-800 text-zinc-500">
                        <Lock className="w-3 h-3" /> BLOQUEADO
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-zinc-400 block mt-0.5">
                    {currentBoss.title} • {currentBoss.level} ({currentBoss.arc})
                  </span>
                </div>
              </div>

              {/* Distintivos & Recompensas em Destaque */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="neutral">{currentBoss.tier}</Badge>
                <div className="px-2.5 py-1 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-white/10 text-right font-mono text-xs shadow">
                  <span className="text-[10px] text-zinc-500 uppercase block">Recompensa</span>
                  <span className="text-orange-400 font-bold">+{formatBigNumber(effectiveRewardChakra)}</span>
                  <span className="text-amber-300 text-[10px] ml-1.5 font-semibold">+{currentBoss.bountyAncestral} Anc</span>
                  <span className="text-cyan-400 text-[10px] ml-1.5 font-semibold">+{formatBigNumber(bossXpReward)} XP</span>
                </div>
              </div>
            </div>

            {/* FEEDBACK BANNERS (VITÓRIA OU DERROTA) */}
            {victoryMessage && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-700/80 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-lg animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="whitespace-pre-line">{victoryMessage}</span>
              </div>
            )}

            {defeatMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/85 backdrop-blur-md border border-rose-700/90 text-rose-300 text-xs font-mono flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="whitespace-pre-line">{defeatMessage}</span>
                </div>
                {hospitalCooldownRemaining <= 0 && (
                  <button
                    onClick={handleStartFight}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Repetir
                  </button>
                )}
              </div>
            )}

            {/* DUAL COMBAT HUD: BARRA DO CHEFE + BARRA DO JOGADOR + CAST DE ATAQUE */}
            <div className="mt-3 space-y-3 bg-zinc-950/45 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
              {/* 1. Barra de Vida do Chefe */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-400" /> Integridade do Chefe ({currentBoss.name})
                  </span>
                  <span className="text-zinc-200 font-bold">
                    {formatBigNumber(bossHp)} / {formatBigNumber(currentBoss.hp)} ({bossHpPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-zinc-950/80 rounded-lg overflow-hidden relative border border-white/10 p-0.5 shadow-inner">
                  <div
                    style={{ width: `${bossGhostPercent}%` }}
                    className="absolute top-0.5 bottom-0.5 left-0.5 bg-amber-500/40 rounded-md transition-all duration-400"
                  />
                  <div
                    style={{ width: `${bossHpPercent}%` }}
                    className={`h-full rounded-md transition-all duration-100 ${
                      bossHpPercent <= 25 ? 'bg-rose-600' : bossHpPercent <= 60 ? 'bg-orange-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* 2. Barra de Telegraph do Golpe do Chefe */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-amber-400/90 flex items-center gap-1.5">
                    <Flame className={`w-3.5 h-3.5 ${gauntlet.isFighting ? 'animate-pulse text-orange-400' : 'text-zinc-500'}`} />
                    Ataque do Chefe ({bossAttackDamage} Dano • Cada {bossAttackIntervalSec.toFixed(1)}s)
                  </span>
                  <span className={`font-bold ${bossAttackProgress >= 80 && gauntlet.isFighting ? 'text-rose-400 animate-pulse' : 'text-zinc-400'}`}>
                    {gauntlet.isFighting ? `${Math.round(bossAttackProgress)}%` : 'Aguardando Início'}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-950/80 rounded-md overflow-hidden border border-white/10 p-0.5">
                  <div
                    style={{ width: `${gauntlet.isFighting ? bossAttackProgress : 0}%` }}
                    className={`h-full rounded transition-all duration-75 ${
                      bossAttackProgress >= 80 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Barra de Vida do Jogador (Shinobi) */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className={`w-3.5 h-3.5 ${isPlayerHit ? 'text-rose-500 animate-ping' : 'text-emerald-400'}`} />
                    Sua Vida (Shinobi)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 shadow">
                      💨 Esquiva: {playerDodgeChance}%
                    </span>
                    <span className="text-zinc-200 font-bold">
                      {formatBigNumber(playerHp)} / {formatBigNumber(playerMaxHp)} ({playerHpPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-3.5 bg-zinc-950/80 rounded-lg overflow-hidden relative border border-white/10 p-0.5 shadow-inner">
                  <div
                    style={{ width: `${playerGhostPercent}%` }}
                    className="absolute top-0.5 bottom-0.5 left-0.5 bg-rose-500/40 rounded-md transition-all duration-400"
                  />
                  <div
                    style={{ width: `${playerHpPercent}%` }}
                    className={`h-full rounded-md transition-all duration-100 ${
                      playerHpPercent <= 25 ? 'bg-rose-600' : playerHpPercent <= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Mecânica Muu Fissão */}
              {muuFissionActive && (
                <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[10px]">
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
          <div className="relative z-10 my-4 flex flex-col items-center justify-center">
            {/* PAINEL TÁTICO DE AUTOMAÇÃO DE COMBATE */}
            <div className="w-full max-w-md flex items-center justify-center gap-2.5 mb-3 p-2 rounded-xl bg-zinc-950/60 backdrop-blur-md border border-white/10 shadow-lg">
              {/* Botão 1: Passar para o Próximo Chefe Automático */}
              <button
                type="button"
                onClick={toggleGauntletAutoAdvance}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gauntlet.autoAdvance
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/50'
                    : 'bg-zinc-900/70 hover:bg-zinc-850 border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Avança e inicia a batalha contra o próximo chefe automaticamente ao vencer."
              >
                <FastForward className={`w-3.5 h-3.5 flex-shrink-0 ${gauntlet.autoAdvance ? 'text-cyan-300 animate-pulse' : 'text-zinc-500'}`} />
                <span className="truncate">Auto-Avançar</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                    gauntlet.autoAdvance
                      ? 'bg-cyan-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {gauntlet.autoAdvance ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Botão 2: Repetir a Batalha em Forma de Loop */}
              <button
                type="button"
                onClick={toggleGauntletAutoLoop}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gauntlet.autoLoop
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400/50'
                    : 'bg-zinc-900/70 hover:bg-zinc-850 border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Repete o confronto contra este mesmo chefe continuamente para farmar drops e materiais."
              >
                <Repeat className={`w-3.5 h-3.5 flex-shrink-0 ${gauntlet.autoLoop ? 'text-emerald-300 animate-spin' : 'text-zinc-500'}`} />
                <span className="truncate">Loop Batalha</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                    gauntlet.autoLoop
                      ? 'bg-emerald-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {gauntlet.autoLoop ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {isLocked ? (
              /* Estado 1: Chefe Futuro Bloqueado */
              <div className="text-center p-6 rounded-2xl bg-zinc-950/50 backdrop-blur-md border border-white/10 max-w-md w-full shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-500 mx-auto mb-3 shadow">
                  <Lock className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-zinc-300 mb-1">Barreira Territorial Trancada</h3>
                <p className="text-xs text-zinc-400 font-mono mb-4 leading-relaxed">
                  Supere o chefe anterior da Grande Guerra para desbloquear este confronto decisivo.
                </p>
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium opacity-50 cursor-not-allowed bg-zinc-900 text-zinc-600 border border-zinc-800"
                >
                  Confronto Bloqueado
                </button>
              </div>
            ) : !gauntlet.isFighting ? (
              /* Estado 2: Pronto para Iniciar Combate Manual */
              <div className="text-center p-6 rounded-2xl bg-zinc-950/50 backdrop-blur-md border border-white/10 max-w-md w-full shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-950/80 to-orange-950/80 border border-rose-600/70 flex items-center justify-center text-rose-400 mx-auto mb-3 shadow-lg shadow-rose-950/50">
                  <Swords className="w-7 h-7 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mb-1">
                  Confronto Decisivo: #{currentBoss.id} {currentBoss.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mb-4 leading-relaxed">
                  {currentBoss.justification}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center font-mono text-[10px]">
                  <div className="p-2 rounded-lg bg-zinc-900/70 backdrop-blur-sm border border-white/10">
                    <span className="text-zinc-500 block">Seu Dano</span>
                    <span className="text-amber-400 font-bold">{formatBigNumber(playerBaseDamage)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/70 backdrop-blur-sm border border-white/10">
                    <span className="text-zinc-500 block">Sua Vida</span>
                    <span className="text-emerald-400 font-bold">{formatBigNumber(playerMaxHp)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/70 backdrop-blur-sm border border-white/10">
                    <span className="text-zinc-500 block">Dano Chefe</span>
                    <span className="text-rose-400 font-bold">{bossAttackDamage}</span>
                  </div>
                </div>

                <button
                  disabled={hospitalCooldownRemaining > 0}
                  onClick={handleStartFight}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                    hospitalCooldownRemaining > 0
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border border-rose-500 shadow-xl shadow-rose-950/60 active:scale-95 cursor-pointer'
                  }`}
                >
                  {hospitalCooldownRemaining > 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                      Recuperação Médica ({hospitalCooldownRemaining}s)
                    </>
                  ) : (
                    <>
                      <Swords className="w-4 h-4" /> Iniciar Batalha
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Estado 3: BATALHA ATIVA */
              <div className="w-full max-w-lg flex flex-col items-center">
                {/* Feedback Dinâmico de Dano e Esquiva */}
                <div className="h-7 flex items-center justify-center mb-2 gap-3">
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
                      {lastDmgInfo.note || `Golpe: -${formatBigNumber(lastDmgInfo.amount)} HP`}
                    </span>
                  )}
                  {playerDmgFeedback && (
                    <span className="text-xs font-mono font-bold text-rose-400 animate-pulse">
                      Chefe: {playerDmgFeedback}
                    </span>
                  )}
                </div>

                {/* BOTÃO DE ATAQUE MANUAL DO JOGADOR */}
                <button
                  onClick={() => handleAttackBoss(true)}
                  className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-b from-rose-950/90 via-zinc-950/90 to-black/95 backdrop-blur-md border-2 flex flex-col items-center justify-center shadow-2xl transition-all duration-100 cursor-pointer active:scale-90 ${
                    isHit ? 'border-rose-400 scale-95 shadow-rose-900/90' : 'border-rose-700/80 hover:border-rose-500 hover:scale-105'
                  }`}
                >
                  <Swords className="w-10 h-10 text-rose-400 stroke-[1.75]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-200 font-bold mt-2">
                    Golpear
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 font-semibold">
                    ~{formatBigNumber(playerBaseDamage)} Dano
                  </span>
                </button>

                <span className="text-[10px] font-mono text-zinc-400 mt-2 bg-zinc-950/60 px-2 py-0.5 rounded-full border border-white/5">
                  (Auto-ataque a cada 0.8s + cliques manuais livres)
                </span>

                {/* Botão de Borda para Mecânica do Baki */}
                {currentBoss.mechanic.type === 'baki_wind' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAttackBoss(false)}
                      className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-sm border border-white/10 text-zinc-400 text-xs font-mono rounded-lg hover:bg-zinc-800"
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
                  <div className="mt-3 p-3 rounded-xl bg-cyan-950/90 backdrop-blur-md border border-cyan-500 flex items-center justify-between gap-3 w-full animate-pulse shadow-lg">
                    <div className="text-xs font-mono text-cyan-300 font-bold">
                      QTE: Bloqueie a Espada de Prata! ({toneriClicks}/3 cliques) • {toneriTimer.toFixed(1)}s
                    </div>
                    <button
                      onClick={handleToneriQteClick}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded-lg cursor-pointer"
                    >
                      Bloquear!
                    </button>
                  </div>
                )}

                {/* Cubos de Daikokuten do Isshiki */}
                {currentBoss.mechanic.type === 'isshiki_cubes' && isshikiCubes > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 w-full">
                    <div className="text-xs font-mono text-zinc-400">
                      Cubos Negros ({isshikiCubes}/3)
                    </div>
                    <button
                      onClick={handleDestroyIsshikiCube}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-md border border-zinc-700 cursor-pointer"
                    >
                      Estilhaçar Cubo
                    </button>
                  </div>
                )}

                {/* Palavra Tabu de Kinkaku */}
                {currentBoss.mechanic.type === 'kinkaku_words' && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-950/80 backdrop-blur-md border border-purple-700/80 flex items-center justify-between gap-3 w-full">
                    <div className="text-xs font-mono text-purple-300">
                      Palavra Tabu: <strong>"{forbiddenWord}"</strong>
                    </div>
                    <button
                      onClick={handleForbiddenWordClick}
                      className="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-mono rounded-md border border-purple-700 cursor-pointer"
                    >
                      Pronunciar (-15% HP)
                    </button>
                  </div>
                )}

                {/* Botão de Recuo Tático */}
                <button
                  onClick={handleRetreat}
                  className="mt-3 text-xs font-mono text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Recuar do Confronto
                </button>
              </div>
            )}

            {/* Mecânica do Chefe */}
            <div className="mt-3 max-w-lg text-center px-4 py-2 rounded-xl bg-zinc-950/50 backdrop-blur-md border border-white/10 text-xs text-zinc-300 font-mono shadow">
              <span className="text-zinc-200 font-semibold mr-1">[{currentBoss.mechanic.title}]:</span>
              <span>{currentBoss.mechanic.description}</span>
            </div>
          </div>

          {/* RODAPÉ DA ARENA: Navegação entre Chefes */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                disabled={selectedBossId <= 1}
                onClick={() => setSelectedBossId((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-800 border border-white/10 text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed transition backdrop-blur-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <button
                disabled={selectedBossId >= GAUNTLET_BOSSES.length}
                onClick={() => setSelectedBossId((prev) => Math.min(GAUNTLET_BOSSES.length, prev + 1))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-800 border border-white/10 text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed transition backdrop-blur-sm cursor-pointer"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedBossId(gauntlet.currentActiveBossId)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 transition backdrop-blur-sm cursor-pointer"
            >
              Focar no Alvo Ativo (#{gauntlet.currentActiveBossId})
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. PAINEL LATERAL MULTIFUNCIONAL (ATRIBUTOS, DROPS & CATÁLOGO)    */}
        {/* ================================================================= */}
        <aside className="w-full lg:w-[420px] bg-zinc-950/75 backdrop-blur-md border border-zinc-800/90 rounded-2xl shadow-2xl p-4 flex flex-col overflow-hidden">
          {/* NAVEGAÇÃO DE ABAS DO PAINEL LATERAL */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/80 mb-3">
            <button
              onClick={() => setActiveSideTab('STATS')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'STATS'
                  ? 'bg-amber-600/90 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Atributos RPG
              {combatStats.unspentStatPoints > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveSideTab('DROPS')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'DROPS'
                  ? 'bg-rose-600/90 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Drops & Saques
            </button>

            <button
              onClick={() => setActiveSideTab('LIST')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'LIST'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Oponentes ({filteredBosses.length})
            </button>
          </div>

          {/* =============================================================== */}
          {/* ABA 1: DISTRIBUIÇÃO DE ATRIBUTOS SHINOBI (NÍVEL ATÉ 700)        */}
          {/* =============================================================== */}
          {activeSideTab === 'STATS' && (
            <div className="flex-1 flex flex-col overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {/* Card de Nível & XP */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 via-zinc-900/70 to-zinc-950 border border-amber-800/40 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      NÍVEL SHINOBI {combatStats.level}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      (Máx: {MAX_COMBAT_LEVEL})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-700/50 text-emerald-400 font-mono text-[9px] font-semibold flex items-center gap-1" title="Pontos salvos relacionalmente no banco de dados Neon">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Neon DB
                    </span>
                    <div className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono text-[11px] font-bold">
                      {combatStats.unspentStatPoints} pts Livres
                    </div>
                  </div>
                </div>

                {/* Barra de XP */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>Progresso de Experiência</span>
                    <span>
                      {combatStats.level >= MAX_COMBAT_LEVEL
                        ? 'Nível Máximo Atingido'
                        : `${formatBigNumber(combatStats.currentXp)} / ${formatBigNumber(combatStats.requiredXp)} (${xpPercent.toFixed(1)}%)`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      style={{ width: `${xpPercent}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Informação de Regra de Nível */}
              <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                💡 Cada nível ganho ao derrotar chefes concede <strong>+8 pontos de atributos</strong> para distribuir.
              </div>

              {/* Atributo 1: FORÇA (DANO) */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-950/60 border border-orange-700/60 flex items-center justify-center text-orange-400 font-bold">
                      ⚔️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Força (Ataque)</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Dano do Jogador: <strong>{formatBigNumber(playerBaseDamage)}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-orange-400">
                    {combatStats.strength}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-zinc-800/60">
                  <button
                    disabled={combatStats.unspentStatPoints < 1}
                    onClick={() => handleAddStat('strength', 1)}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded text-xs font-mono font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 1
                  </button>
                  <button
                    disabled={combatStats.unspentStatPoints < 5}
                    onClick={() => handleAddStat('strength', 5)}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded text-xs font-mono font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 5
                  </button>
                  <button
                    disabled={combatStats.unspentStatPoints < 1}
                    onClick={() => handleAddStat('strength', combatStats.unspentStatPoints)}
                    className="flex-1 py-1 bg-orange-950/80 hover:bg-orange-600 border border-orange-800 disabled:opacity-40 disabled:hover:bg-orange-950/80 rounded text-xs font-mono font-bold text-orange-300 hover:text-white transition cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Atributo 2: VIDA (HP MÁXIMO) */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-bold">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Vida (Vitalidade)</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        HP Máximo: <strong>{formatBigNumber(playerMaxHp)}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {combatStats.vitality}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-zinc-800/60">
                  <button
                    disabled={combatStats.unspentStatPoints < 1}
                    onClick={() => handleAddStat('vitality', 1)}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded text-xs font-mono font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 1
                  </button>
                  <button
                    disabled={combatStats.unspentStatPoints < 5}
                    onClick={() => handleAddStat('vitality', 5)}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded text-xs font-mono font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 5
                  </button>
                  <button
                    disabled={combatStats.unspentStatPoints < 1}
                    onClick={() => handleAddStat('vitality', combatStats.unspentStatPoints)}
                    className="flex-1 py-1 bg-emerald-950/80 hover:bg-emerald-600 border border-emerald-800 disabled:opacity-40 disabled:hover:bg-emerald-950/80 rounded text-xs font-mono font-bold text-emerald-300 hover:text-white transition cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Atributo 3: AGILIDADE (ESQUIVA DE GOLPES) */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-bold">
                      💨
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Agilidade (Esquiva)</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Chance de Esquiva: <strong>{playerDodgeChance}%</strong> (Teto 75%)
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-cyan-400">
                    {combatStats.agility}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-zinc-800/60">
                  <button
                    disabled={combatStats.unspentStatPoints < 1}
                    onClick={() => handleAddStat('agility', 1)}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-cyan-600 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded text-xs font-mono font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 1
                  </button>
                  <button
                    disabled={combatStats.unspentStatPoints < 5}
                    onClick={() => handleAddStat('agility', 5)}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-cyan-600 disabled:opacity-40 disabled:hover:bg-zinc-800 rounded text-xs font-mono font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 5
                  </button>
                  <button
                    disabled={combatStats.unspentStatPoints < 1}
                    onClick={() => handleAddStat('agility', combatStats.unspentStatPoints)}
                    className="flex-1 py-1 bg-cyan-950/80 hover:bg-cyan-600 border border-cyan-800 disabled:opacity-40 disabled:hover:bg-cyan-950/80 rounded text-xs font-mono font-bold text-cyan-300 hover:text-white transition cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ABA 2: PREVIEW DE DROPS E PROBABILIDADE % DO CHEFE SELECIONADO  */}
          {/* =============================================================== */}
          {activeSideTab === 'DROPS' && (
            <div className="flex-1 flex flex-col overflow-y-auto space-y-3 custom-scrollbar pr-1">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">
                    Recompensas de #{currentBoss.id} {currentBoss.name}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Tabela Estocástica Oficial de Saque
                  </span>
                </div>
                <Badge variant="chakra">Tier {currentBoss.tier}</Badge>
              </div>

              {/* Arsenal Completo do Chefe - Grade Compacta 5x2 com Tooltip/Preview */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Arsenal do Chefe (10 Equipamentos)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 font-mono text-[9px] font-bold">
                      {slotDropRatePct}% / slot
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/40 text-amber-400 font-mono text-[9px]">
                      {dropRatePct}% global
                    </span>
                  </div>
                </div>

                {/* Grade 5x2 de Seleção de Slots */}
                <div className="grid grid-cols-5 gap-1.5">
                  {BOSS_EQUIPMENT_SLOTS.map((slotKey) => {
                    const item = lootDef.equipmentSet[slotKey];
                    const isSelected = selectedLootSlot === slotKey;
                    const owned = item ? isItemOwned(item.id) : false;
                    const rarity = item ? getRarityConfig(item.rarity) : null;

                    return (
                      <button
                        key={slotKey}
                        type="button"
                        onClick={() => setSelectedLootSlot(slotKey)}
                        className={`relative group p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                            : owned
                            ? 'bg-zinc-900/80 border-emerald-800/60 hover:border-emerald-600/80 hover:bg-zinc-850'
                            : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                        }`}
                        title={`${SLOT_SHORT_LABELS[slotKey]}: ${item?.name || ''}`}
                      >
                        {/* Badge de posse ✓ */}
                        {owned && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[9px] font-black shadow-sm z-10">
                            ✓
                          </span>
                        )}

                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center ${
                            rarity ? rarity.borderClass : 'border-zinc-700'
                          } border bg-zinc-900/90 mb-1`}
                        >
                          <IconRenderer
                            name={item?.iconName || 'Shield'}
                            className={`w-3.5 h-3.5 ${
                              isSelected
                                ? 'text-amber-300'
                                : owned
                                ? 'text-emerald-300'
                                : rarity
                                ? rarity.textClass
                                : 'text-zinc-400'
                            }`}
                          />
                        </div>

                        <span
                          className={`text-[8px] font-mono uppercase tracking-tight truncate w-full text-center leading-none ${
                            isSelected ? 'text-amber-300 font-bold' : owned ? 'text-emerald-400' : 'text-zinc-400'
                          }`}
                        >
                          {SLOT_SHORT_LABELS[slotKey]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Card de Detalhes da Peça em Inspeção */}
                {(() => {
                  const activeItem = lootDef.equipmentSet[selectedLootSlot] || lootDef.equipment;
                  if (!activeItem) return null;
                  const eqRarity = getRarityConfig(activeItem.rarity);
                  const owned = isItemOwned(activeItem.id);

                  return (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-lg bg-zinc-900 border flex items-center justify-center flex-shrink-0 ${
                            eqRarity.borderClass
                          } ${eqRarity.glowClass} ${eqRarity.bgGradientClass || ''}`}
                        >
                          <IconRenderer
                            name={activeItem.iconName || 'Swords'}
                            className="w-5 h-5 text-zinc-100"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className={`text-xs font-bold truncate ${eqRarity.textClass}`}>
                              {activeItem.name}
                            </h5>
                            {owned ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 font-bold flex-shrink-0">
                                ✓ OBTIDO
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 flex-shrink-0">
                                NÃO OBTIDO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${eqRarity.badgeClass}`}
                            >
                              {eqRarity.label}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              • {SLOT_SHORT_LABELS[selectedLootSlot]} {activeItem.weaponCategory ? `(${activeItem.weaponCategory})` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] font-mono text-zinc-400 leading-relaxed bg-zinc-950/50 p-2 rounded-lg border border-zinc-850">
                        {activeItem.description}
                      </p>

                      {/* Bônus de Atributos do Equipamento */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <div className="px-2 py-1 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono flex items-center justify-between">
                          <span className="text-zinc-500">Bônus CPS:</span>
                          <span className="text-emerald-400 font-bold">x{activeItem.bonusCpsMult.toFixed(2)}</span>
                        </div>
                        <div className="px-2 py-1 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono flex items-center justify-between">
                          <span className="text-zinc-500">Bônus Clique:</span>
                          <span className="text-amber-400 font-bold">x{activeItem.bonusClickMult.toFixed(2)}</span>
                        </div>
                        {activeItem.bonusCritChance !== undefined && activeItem.bonusCritChance > 0 && (
                          <div className="px-2 py-1 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono flex items-center justify-between">
                            <span className="text-zinc-500">Chance Crítico:</span>
                            <span className="text-cyan-400 font-bold">+{(activeItem.bonusCritChance * 100).toFixed(1)}%</span>
                          </div>
                        )}
                        {activeItem.bonusCritMult !== undefined && activeItem.bonusCritMult.gt(1) && (
                          <div className="px-2 py-1 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono flex items-center justify-between">
                            <span className="text-zinc-500">Dano Crítico:</span>
                            <span className="text-purple-400 font-bold">x{activeItem.bonusCritMult.toFixed(2)}</span>
                          </div>
                        )}
                        {activeItem.elementalAffinityReq && (
                          <div className="col-span-2 px-2 py-1 rounded bg-cyan-950/30 border border-cyan-800/40 text-[10px] font-mono flex items-center justify-between">
                            <span className="text-cyan-400">Afinidade Elemental:</span>
                            <span className="text-cyan-300 font-bold">{activeItem.elementalAffinityReq} (+25% CPS / +35% Clique)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Material de Farm Garantido */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                    Material de Farm
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-bold">
                    100% (1 a 5x)
                  </span>
                </div>

                {(() => {
                  const matRarity = getRarityConfig(lootDef.material.rarity);
                  return (
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg bg-zinc-900 border flex items-center justify-center flex-shrink-0 text-cyan-400 ${
                          matRarity.borderClass
                        } ${matRarity.glowClass}`}
                      >
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-zinc-200 truncate">{lootDef.material.name}</h5>
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase font-bold inline-block mt-0.5 ${matRarity.badgeClass}`}
                        >
                          {matRarity.label}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bônus de XP de Combate Shinobi */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200">Experiência Shinobi</h5>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Progresso direto de atributos
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  +{formatBigNumber(bossXpReward)} XP
                </span>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ABA 3: CRONOLOGIA COMPLETA DE OPONENTES                         */}
          {/* =============================================================== */}
          {activeSideTab === 'LIST' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filtro e Busca */}
              <div className="my-2 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar oponente por nome ou #..."
                    className="w-full pl-9 pr-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-mono">
                  {['Todos', 'Inicial / Chūnin', 'Jōnin / Invasões', 'Kage / Lendário', 'Continental / Divino'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTierFilter(t)}
                      className={`px-2 py-0.5 rounded border whitespace-nowrap transition cursor-pointer ${
                        tierFilter === t
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300'
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
                  const isBossLocked = boss.id > Math.max(gauntlet.highestBossDefeated + 1, gauntlet.currentActiveBossId);
                  const isBossSelected = boss.id === selectedBossId;

                  return (
                    <div
                      key={boss.id}
                      onClick={() => setSelectedBossId(boss.id)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isBossSelected
                          ? 'bg-zinc-800/90 border-rose-500/80 text-zinc-100 shadow-md'
                          : isBossActive
                          ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700 text-zinc-300'
                          : isBossCleared
                          ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
                          : isBossLocked
                          ? 'opacity-50 bg-zinc-900/30 border-zinc-850 hover:border-zinc-800 text-zinc-500'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
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
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
