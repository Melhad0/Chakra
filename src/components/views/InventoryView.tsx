import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  EquipmentItem,
  InventorySlotItem,
  ElementType,
  ItemRarity,
} from '../../types/inventory';
import { ViewHeader } from './ViewHeader';
import {
  Briefcase,
  Shield,
  Swords,
  Disc,
  Feather,
  Flame,
  Boxes,
  Mountain,
  Scroll,
  Wind,
  Zap,
  Droplets,
  Sparkles,
  AlertTriangle,
  X,
  Check,
  Trash2,
  Lock,
  CheckCircle2,
  Crown,
  Info,
} from 'lucide-react';

const RARITY_CONFIG: Record<
  ItemRarity,
  {
    label: string;
    badgeClass: string;
    borderClass: string;
    glowClass: string;
    textClass: string;
  }
> = {
  COMMON: {
    label: 'Comum',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    borderClass: 'border-zinc-700',
    glowClass: '',
    textClass: 'text-zinc-300',
  },
  UNCOMMON: {
    label: 'Incomum',
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60',
    borderClass: 'border-emerald-600/60',
    glowClass: '',
    textClass: 'text-emerald-400',
  },
  RARE: {
    label: 'Raro',
    badgeClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/70',
    borderClass: 'border-cyan-500/70',
    glowClass: '',
    textClass: 'text-cyan-400',
  },
  EPIC: {
    label: 'Épico',
    badgeClass: 'bg-purple-950/60 text-purple-300 border-purple-500/80',
    borderClass: 'border-purple-500/80',
    glowClass: '',
    textClass: 'text-purple-400',
  },
  LEGENDARY: {
    label: 'Lendário',
    badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-400',
    borderClass: 'border-amber-400',
    glowClass: 'shadow-[0_0_10px_rgba(251,191,36,0.2)]',
    textClass: 'text-amber-400',
  },
  MYTHIC: {
    label: 'Mítico',
    badgeClass: 'bg-rose-950/60 text-rose-300 border-rose-500',
    borderClass: 'border-rose-500',
    glowClass: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    textClass: 'text-rose-400',
  },
};

const ELEMENT_CONFIG: Record<
  ElementType,
  {
    name: string;
    kanji: string;
    colorName: string;
    borderClass: string;
    activeBgClass: string;
    textClass: string;
    glowClass: string;
    passiveName: string;
    passiveDesc: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  FIRE: {
    name: 'Fogo (Katon)',
    kanji: '火',
    colorName: 'rose',
    borderClass: 'border-rose-500',
    activeBgClass: 'bg-rose-950/40 text-rose-300 border-rose-500/70',
    textClass: 'text-rose-400',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    passiveName: 'Chamas da Ira',
    passiveDesc: '+15% de Dano Crítico no clique manual',
    icon: Flame,
  },
  WIND: {
    name: 'Vento (Fūton)',
    kanji: '風',
    colorName: 'emerald',
    borderClass: 'border-emerald-500',
    activeBgClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/70',
    textClass: 'text-emerald-400',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    passiveName: 'Corrente Turbulenta',
    passiveDesc: '+10% de CPS passivo em todos os geradores',
    icon: Wind,
  },
  LIGHTNING: {
    name: 'Raio (Raiton)',
    kanji: '雷',
    colorName: 'cyan',
    borderClass: 'border-cyan-400',
    activeBgClass: 'bg-cyan-950/40 text-cyan-300 border-cyan-400/70',
    textClass: 'text-cyan-400',
    glowClass: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
    passiveName: 'Estímulo Sináptico',
    passiveDesc: '+10% de poder/velocidade no clique manual',
    icon: Zap,
  },
  EARTH: {
    name: 'Terra (Doton)',
    kanji: '土',
    colorName: 'amber',
    borderClass: 'border-amber-600',
    activeBgClass: 'bg-amber-950/40 text-amber-300 border-amber-600/70',
    textClass: 'text-amber-500',
    glowClass: 'shadow-[0_0_15px_rgba(217,119,6,0.3)]',
    passiveName: 'Endurecimento Fisiológico',
    passiveDesc: '-15% no tempo de penalidade pós-colapso de chefes',
    icon: Mountain,
  },
  WATER: {
    name: 'Água (Suiton)',
    kanji: '水',
    colorName: 'blue',
    borderClass: 'border-blue-400',
    activeBgClass: 'bg-blue-950/40 text-blue-300 border-blue-400/70',
    textClass: 'text-blue-400',
    glowClass: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]',
    passiveName: 'Fluidez Regenerativa',
    passiveDesc: '-20% no tempo de descanso pós-vitória em chefes',
    icon: Droplets,
  },
};

const ALL_ELEMENTS_LIST: ElementType[] = ['FIRE', 'WIND', 'LIGHTNING', 'EARTH', 'WATER'];

function renderItemIcon(iconName: string, className = 'w-6 h-6') {
  switch (iconName) {
    case 'Shield':
      return <Shield className={className} />;
    case 'Swords':
      return <Swords className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Feather':
      return <Feather className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Boxes':
      return <Boxes className={className} />;
    case 'Mountain':
      return <Mountain className={className} />;
    case 'Scroll':
      return <Scroll className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export const InventoryView: React.FC = () => {
  const chakra = useGameStore((s) => s.chakra);
  const chakraAncestral = useGameStore((s) => s.chakraAncestral);
  const inventory = useGameStore((s) => s.inventory);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipItem = useGameStore((s) => s.unequipItem);
  const discardItem = useGameStore((s) => s.discardItem);
  const sacrificeForElement = useGameStore((s) => s.sacrificeForElement);

  // Seleção de item inspecionado: { source: 'BAG' | 'ARMOR' | 'WEAPON', index?: number }
  const [selectedSlot, setSelectedSlot] = useState<{
    source: 'BAG' | 'ARMOR' | 'WEAPON';
    index?: number;
  } | null>(null);

  // Filtro de inventário
  const [filterType, setFilterType] = useState<'ALL' | 'EQUIPMENT' | 'MATERIAL'>('ALL');

  // Modal de Sacrifício Elemental
  const [sacrificeModalTarget, setSacrificeModalTarget] = useState<ElementType | null>(null);
  const [selectedSacrificeWeaponSlot, setSelectedSacrificeWeaponSlot] = useState<number | null>(null);
  const [sacrificeFeedback, setSacrificeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Item atualmente inspecionado
  const inspectedItem: InventorySlotItem | null = useMemo(() => {
    if (!selectedSlot) return null;
    if (selectedSlot.source === 'ARMOR') return inventory.equippedArmor;
    if (selectedSlot.source === 'WEAPON') return inventory.equippedWeapon;
    if (selectedSlot.source === 'BAG' && selectedSlot.index !== undefined) {
      return inventory.inventoryBag[selectedSlot.index] || null;
    }
    return null;
  }, [selectedSlot, inventory]);

  // Contagem de ocupação
  const occupiedSlotsCount = useMemo(() => {
    return inventory.inventoryBag.filter((slot) => slot !== null).length;
  }, [inventory.inventoryBag]);

  // Armas elegíveis para sacrifício (Épica+ para 4º elemento, Lendária+ para 5º elemento)
  const currentCount = inventory.unlockedElements.length;
  const eligibleSacrificeWeapons = useMemo(() => {
    if (currentCount !== 3 && currentCount !== 4) return [];
    const minRarities = currentCount === 3 ? ['EPIC', 'LEGENDARY', 'MYTHIC'] : ['LEGENDARY', 'MYTHIC'];
    const result: { item: EquipmentItem; slotIndex: number }[] = [];
    inventory.inventoryBag.forEach((slot, idx) => {
      if (slot && slot.type === 'WEAPON' && minRarities.includes(slot.rarity)) {
        result.push({ item: slot as EquipmentItem, slotIndex: idx });
      }
    });
    return result;
  }, [inventory.inventoryBag, currentCount]);

  // Execução do ritual de sacrifício
  const handleExecuteSacrifice = () => {
    if (!sacrificeModalTarget) return;
    const res = sacrificeForElement(
      sacrificeModalTarget,
      selectedSacrificeWeaponSlot !== null ? selectedSacrificeWeaponSlot : undefined
    );
    setSacrificeFeedback(res);
    if (res.success) {
      setSelectedSacrificeWeaponSlot(null);
      setTimeout(() => {
        setSacrificeModalTarget(null);
        setSacrificeFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* 1. TOPO OFICIAL */}
      <ViewHeader
        title="Arsenal Shinobi & Afinidades"
        subtitle="Paper Doll RPG, Gestão Modular de Mochila e Roda dos Cinco Elementos"
        badgeText={`${occupiedSlotsCount}/32 Slots`}
        badgeVariant="cyan"
        icon={<Briefcase className="w-4 h-4 text-cyan-400 stroke-[2]" />}
      />

      {/* 2. CORPO PRINCIPAL MODULAR */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 bg-zinc-950">
        {/* =========================================================================
            PAINEL ESQUERDO (5 COLUNAS): PAPER DOLL & RODA ELEMENTAL
           ========================================================================= */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* 4.1 PAPER DOLL (SILHUETA DO SHINOBI & SLOTS DE EQUIPAMENTO) */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-sans flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-cyan-400 stroke-[2]" />
                  Paper Doll Shinobi
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Slots táticos de indumentária e armamento em punho
                </span>
              </div>
              {inventory.isAvatarShinobi && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/50 text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(251,191,36,0.25)]">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Avatar Shinobi (x3.0 CPS)
                </span>
              )}
            </div>

            {/* Container Central com Silhueta e Slots de Batalha */}
            <div className="grid grid-cols-2 gap-4 my-2">
              {/* SLOT DE ARMADURA / OUTFIT */}
              <div
                onClick={() => {
                  if (inventory.equippedArmor) {
                    setSelectedSlot({ source: 'ARMOR' });
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col items-center text-center ${
                  inventory.equippedArmor
                    ? `${RARITY_CONFIG[inventory.equippedArmor.rarity].borderClass} ${
                        RARITY_CONFIG[inventory.equippedArmor.rarity].glowClass
                      } bg-zinc-900/70 hover:bg-zinc-850`
                    : 'border-zinc-800 bg-zinc-950/40 border-dashed hover:border-zinc-700'
                } ${selectedSlot?.source === 'ARMOR' ? 'ring-2 ring-cyan-400' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 mb-2 relative">
                  {inventory.equippedArmor ? (
                    renderItemIcon(inventory.equippedArmor.iconName, 'w-6 h-6 text-zinc-100')
                  ) : (
                    <Shield className="w-5 h-5 text-zinc-600 stroke-[1.5]" />
                  )}
                  {inventory.equippedArmor && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 text-[9px] px-1 py-0.2 rounded font-mono border ${
                        RARITY_CONFIG[inventory.equippedArmor.rarity].badgeClass
                      }`}
                    >
                      {inventory.equippedArmor.rarity.slice(0, 3)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block mb-0.5">
                  Slot de Armadura
                </span>
                <span
                  className={`text-xs font-semibold truncate max-w-full ${
                    inventory.equippedArmor
                      ? RARITY_CONFIG[inventory.equippedArmor.rarity].textClass
                      : 'text-zinc-600 italic'
                  }`}
                >
                  {inventory.equippedArmor ? inventory.equippedArmor.name : 'Vazio'}
                </span>

                {inventory.equippedArmor && (
                  <div className="mt-2 w-full flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-800/60 pt-1.5">
                    <span className="text-emerald-400 font-medium">
                      +{inventory.equippedArmor.bonusCpsMult.sub(1).mul(100).toFixed(0)}% CPS
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unequipItem('ARMOR');
                        if (selectedSlot?.source === 'ARMOR') setSelectedSlot(null);
                      }}
                      className="text-zinc-400 hover:text-rose-400 transition underline cursor-pointer"
                    >
                      Desequipar
                    </button>
                  </div>
                )}
              </div>

              {/* SLOT DE ARMA */}
              <div
                onClick={() => {
                  if (inventory.equippedWeapon) {
                    setSelectedSlot({ source: 'WEAPON' });
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col items-center text-center ${
                  inventory.equippedWeapon
                    ? `${RARITY_CONFIG[inventory.equippedWeapon.rarity].borderClass} ${
                        RARITY_CONFIG[inventory.equippedWeapon.rarity].glowClass
                      } bg-zinc-900/70 hover:bg-zinc-850`
                    : 'border-zinc-800 bg-zinc-950/40 border-dashed hover:border-zinc-700'
                } ${selectedSlot?.source === 'WEAPON' ? 'ring-2 ring-cyan-400' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400 mb-2 relative">
                  {inventory.equippedWeapon ? (
                    renderItemIcon(inventory.equippedWeapon.iconName, 'w-6 h-6 text-zinc-100')
                  ) : (
                    <Swords className="w-5 h-5 text-zinc-600 stroke-[1.5]" />
                  )}
                  {inventory.equippedWeapon && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 text-[9px] px-1 py-0.2 rounded font-mono border ${
                        RARITY_CONFIG[inventory.equippedWeapon.rarity].badgeClass
                      }`}
                    >
                      {inventory.equippedWeapon.rarity.slice(0, 3)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block mb-0.5">
                  Slot de Arma
                </span>
                <span
                  className={`text-xs font-semibold truncate max-w-full ${
                    inventory.equippedWeapon
                      ? RARITY_CONFIG[inventory.equippedWeapon.rarity].textClass
                      : 'text-zinc-600 italic'
                  }`}
                >
                  {inventory.equippedWeapon ? inventory.equippedWeapon.name : 'Vazio'}
                </span>

                {inventory.equippedWeapon && (
                  <div className="mt-2 w-full flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-800/60 pt-1.5">
                    <span className="text-orange-400 font-medium">
                      +{inventory.equippedWeapon.bonusClickMult.sub(1).mul(100).toFixed(0)}% Clique
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unequipItem('WEAPON');
                        if (selectedSlot?.source === 'WEAPON') setSelectedSlot(null);
                      }}
                      className="text-zinc-400 hover:text-rose-400 transition underline cursor-pointer"
                    >
                      Desequipar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo de Atributos Totais dos Equipamentos */}
            <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3 mt-1 flex items-center justify-around text-center text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Bônus CPS de Traje</span>
                <span className="text-emerald-400 font-bold">
                  {inventory.equippedArmor
                    ? `+${inventory.equippedArmor.bonusCpsMult.sub(1).mul(100).toFixed(0)}%`
                    : '+0%'}
                </span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Bônus Clique de Arma</span>
                <span className="text-orange-400 font-bold">
                  {inventory.equippedWeapon
                    ? `+${inventory.equippedWeapon.bonusClickMult.sub(1).mul(100).toFixed(0)}%`
                    : '+0%'}
                </span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Crítico Acumulado</span>
                <span className="text-purple-400 font-bold">
                  +{(((inventory.equippedWeapon?.bonusCritChance || 0) + (inventory.equippedArmor?.bonusCritChance || 0)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* RODA DOS CINCO ELEMENTOS CANÔNICOS & SACRIFÍCIO */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-sans flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 stroke-[2]" />
                  Roda dos Cinco Elementos Canônicos
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {inventory.unlockedElements.length}/5 Elementos Despertados no Chakra
                </span>
              </div>
              {inventory.elementalSacrificePenaltyMult < 1 && (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-900/60 px-2 py-0.5 rounded">
                  Tributo: -{((1 - inventory.elementalSacrificePenaltyMult) * 100).toFixed(1)}% CPS
                </span>
              )}
            </div>

            {/* Lista dos 5 Elementos */}
            <div className="flex flex-col gap-2.5 my-auto">
              {ALL_ELEMENTS_LIST.map((element) => {
                const conf = ELEMENT_CONFIG[element];
                const IconComponent = conf.icon;
                const isUnlocked = inventory.unlockedElements.includes(element);
                const isNatal = inventory.unlockedElements[0] === element;

                return (
                  <div
                    key={element}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isUnlocked
                        ? `${conf.activeBgClass} ${conf.glowClass}`
                        : 'bg-zinc-900/30 border-zinc-800/70 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                          isUnlocked
                            ? 'bg-zinc-950/70 border border-current shadow-sm'
                            : 'bg-zinc-900/50 border border-zinc-800 text-zinc-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold tracking-wide ${
                              isUnlocked ? 'text-zinc-100' : 'text-zinc-500'
                            }`}
                          >
                            {conf.name}
                          </span>
                          {isNatal && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-950/80 text-amber-300 border border-amber-600/40 font-bold uppercase">
                              Natal
                            </span>
                          )}
                          {isUnlocked && !isNatal && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-950/80 text-emerald-400 border border-emerald-600/40">
                              Desperto
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 block">
                          {conf.passiveDesc}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2]" />
                      ) : (
                        <button
                          onClick={() => {
                            setSacrificeModalTarget(element);
                            setSelectedSacrificeWeaponSlot(null);
                            setSacrificeFeedback(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-500 text-[11px] font-mono text-rose-300 transition shadow-sm cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <Lock className="w-3 h-3 text-rose-400" />
                          Despertar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aviso Informativo do Ritual */}
            <div className="mt-3 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                Cada despertar elemental além do natal exige um ritual severo com sacrifício de Chakra Ancestral,
                dreno permanente de CPS ou destruição de armas raras.
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PAINEL DIREITO (7 COLUNAS): GRADE RPG DE 32 SLOTS & TOOLTIP DINÂMICO
           ========================================================================= */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          {/* GRADE DE 32 SLOTS */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col flex-1 overflow-hidden">
            {/* Cabeçalho da Mochila */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-sans flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400 stroke-[2]" />
                  Mochila Shinobi (Grade 8×4)
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {occupiedSlotsCount} de 32 slots ocupados • Clique para inspecionar ou manejar
                </span>
              </div>

              {/* Filtro Rápido */}
              <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800/80 text-[11px] font-mono">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-0.5 rounded transition ${
                    filterType === 'ALL'
                      ? 'bg-zinc-800 text-zinc-100 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Todos ({occupiedSlotsCount})
                </button>
                <button
                  onClick={() => setFilterType('EQUIPMENT')}
                  className={`px-2.5 py-0.5 rounded transition ${
                    filterType === 'EQUIPMENT'
                      ? 'bg-zinc-800 text-cyan-300 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Equipamentos
                </button>
                <button
                  onClick={() => setFilterType('MATERIAL')}
                  className={`px-2.5 py-0.5 rounded transition ${
                    filterType === 'MATERIAL'
                      ? 'bg-zinc-800 text-amber-300 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Materiais
                </button>
              </div>
            </div>

            {/* Grade Responsiva 8x4 de Slots Quadrados */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl overflow-y-auto max-h-[300px] sm:max-h-[340px]">
              {inventory.inventoryBag.map((item, index) => {
                const isSelected = selectedSlot?.source === 'BAG' && selectedSlot.index === index;
                const isVisible =
                  filterType === 'ALL'
                    ? true
                    : filterType === 'EQUIPMENT'
                    ? item && item.type !== 'MATERIAL'
                    : item && item.type === 'MATERIAL';

                if (!item) {
                  return (
                    <div
                      key={`empty-slot-${index}`}
                      onClick={() => setSelectedSlot(null)}
                      className={`w-full aspect-square rounded-xl border border-zinc-850/80 bg-zinc-900/30 flex items-center justify-center relative hover:border-zinc-700/60 transition-all ${
                        filterType !== 'ALL' ? 'opacity-30' : ''
                      }`}
                    >
                      <span className="text-[10px] font-mono text-zinc-700">{index + 1}</span>
                    </div>
                  );
                }

                const rarityStyle = RARITY_CONFIG[item.rarity];

                return (
                  <div
                    key={`slot-item-${item.id}-${index}`}
                    onClick={() => setSelectedSlot({ source: 'BAG', index })}
                    className={`w-full aspect-square rounded-xl border flex items-center justify-center relative transition-all cursor-pointer bg-zinc-900/80 hover:scale-105 ${
                      rarityStyle.borderClass
                    } ${rarityStyle.glowClass} ${
                      isSelected ? 'ring-2 ring-cyan-400 shadow-cyan-500/20 shadow-lg' : ''
                    } ${!isVisible ? 'opacity-20' : ''}`}
                    title={`${item.name} (${rarityStyle.label})`}
                  >
                    {renderItemIcon(item.iconName, 'w-6 h-6 text-zinc-200')}

                    {/* Badge da Quantidade para Materiais de Farm */}
                    {item.type === 'MATERIAL' && (
                      <span className="absolute bottom-1 right-1 text-[10px] font-mono font-bold text-amber-300 bg-zinc-950/90 px-1 py-0.2 rounded border border-zinc-800">
                        x{item.stackCount}
                      </span>
                    )}

                    {/* Indicador de Tipo de Equipamento */}
                    {item.type !== 'MATERIAL' && (
                      <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-cyan-400/80" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* PAINEL DE DETALHES DINÂMICO DO ITEM SELECIONADO */}
            <div className="mt-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 flex-1 flex flex-col justify-between">
              {inspectedItem ? (
                <div className="flex flex-col h-full justify-between gap-3">
                  <div>
                    {/* Header do Item Inspecionado */}
                    <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-zinc-900 border flex items-center justify-center ${
                            RARITY_CONFIG[inspectedItem.rarity].borderClass
                          } ${RARITY_CONFIG[inspectedItem.rarity].glowClass}`}
                        >
                          {renderItemIcon(inspectedItem.iconName, 'w-6 h-6 text-zinc-100')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold tracking-wide ${
                                RARITY_CONFIG[inspectedItem.rarity].textClass
                              }`}
                            >
                              {inspectedItem.name}
                            </h4>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                                RARITY_CONFIG[inspectedItem.rarity].badgeClass
                              }`}
                            >
                              {RARITY_CONFIG[inspectedItem.rarity].label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {inspectedItem.type === 'MATERIAL'
                              ? 'Mercadoria / Material de Farm'
                              : inspectedItem.type === 'ARMOR'
                              ? 'Indumentária / Armadura Shinobi'
                              : `Armamento Ninja • ${inspectedItem.weaponCategory || 'Espada'}`}
                            {inspectedItem.originBossName && ` • Drop de ${inspectedItem.originBossName}`}
                          </span>
                        </div>
                      </div>

                      {/* Botão de Fechar Inspeção */}
                      <button
                        onClick={() => setSelectedSlot(null)}
                        className="text-zinc-500 hover:text-zinc-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Descrição de Lore */}
                    <p className="text-xs text-zinc-300 font-sans italic my-2.5 leading-relaxed bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-850/60">
                      "{inspectedItem.description}"
                    </p>

                    {/* Atributos Numéricos Precisos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                      {inspectedItem.type === 'MATERIAL' ? (
                        <>
                          <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block uppercase">Quantidade</span>
                            <span className="text-amber-300 font-bold">{inspectedItem.stackCount} unidades</span>
                          </div>
                          <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block uppercase">Valor Unitário</span>
                            <span className="text-orange-400 font-bold">
                              {formatBigNumber(inspectedItem.baseGoldValue)} Chakra
                            </span>
                          </div>
                          <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block uppercase">Cotação Total</span>
                            <span className="text-emerald-400 font-bold">
                              {formatBigNumber(inspectedItem.baseGoldValue.mul(inspectedItem.stackCount))} Chakra
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {inspectedItem.bonusCpsMult && inspectedItem.bonusCpsMult.gt(1) && (
                            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 block uppercase">Bônus de CPS</span>
                              <span className="text-emerald-400 font-bold">
                                +{inspectedItem.bonusCpsMult.sub(1).mul(100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          {inspectedItem.bonusClickMult && inspectedItem.bonusClickMult.gt(1) && (
                            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 block uppercase">Bônus de Clique</span>
                              <span className="text-orange-400 font-bold">
                                +{inspectedItem.bonusClickMult.sub(1).mul(100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          {inspectedItem.bonusCritChance && inspectedItem.bonusCritChance > 0 && (
                            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 block uppercase">Chance Crítica</span>
                              <span className="text-purple-400 font-bold">
                                +{(inspectedItem.bonusCritChance * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          {inspectedItem.bonusCritMult && inspectedItem.bonusCritMult.gt(1) && (
                            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 block uppercase">Dano Crítico</span>
                              <span className="text-purple-400 font-bold">
                                +{inspectedItem.bonusCritMult.sub(1).mul(100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          {inspectedItem.elementalAffinityReq && (
                            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 col-span-2">
                              <span className="text-[10px] text-zinc-500 block uppercase">Ressonância Elemental</span>
                              <span
                                className={`font-bold flex items-center gap-1.5 ${
                                  inventory.unlockedElements.includes(inspectedItem.elementalAffinityReq)
                                    ? 'text-cyan-400'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {ELEMENT_CONFIG[inspectedItem.elementalAffinityReq].name}:{' '}
                                {inventory.unlockedElements.includes(inspectedItem.elementalAffinityReq)
                                  ? 'Ativa (+Bônus Extra)'
                                  : 'Bloqueada (Elemento Inativo)'}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ações Táticas Rápidas */}
                  <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-2.5">
                    {inspectedItem.type !== 'MATERIAL' && selectedSlot?.source === 'BAG' && (
                      <button
                        onClick={() => {
                          if (selectedSlot.index !== undefined) {
                            equipItem(selectedSlot.index);
                            setSelectedSlot(null);
                          }
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[2]" />
                        Equipar no Shinobi
                      </button>
                    )}

                    {selectedSlot?.source === 'ARMOR' && (
                      <button
                        onClick={() => {
                          unequipItem('ARMOR');
                          setSelectedSlot(null);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Desequipar Armadura
                      </button>
                    )}

                    {selectedSlot?.source === 'WEAPON' && (
                      <button
                        onClick={() => {
                          unequipItem('WEAPON');
                          setSelectedSlot(null);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Desequipar Arma
                      </button>
                    )}

                    {selectedSlot?.source === 'BAG' && (
                      <button
                        onClick={() => {
                          if (selectedSlot.index !== undefined) {
                            discardItem(selectedSlot.index);
                            setSelectedSlot(null);
                          }
                        }}
                        title="Descartar item da mochila"
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-900/80 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 gap-2 p-6">
                  <Briefcase className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
                  <span className="text-xs font-semibold text-zinc-400">Nenhum Item Selecionado</span>
                  <p className="text-[11px] font-mono text-zinc-500 max-w-sm">
                    Clique em qualquer quadrado da mochila ou nos slots do Paper Doll para inspecionar
                    atributos, bônus multiplicativos e lore canônica.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE AVISO E CONFIRMAÇÃO DO RITUAL DE SACRIFÍCIO ELEMENTAL
         ========================================================================= */}
      {sacrificeModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-rose-900/60 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-700/60 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider text-rose-300 uppercase font-sans">
                    Ritual de Sacrifício Elemental
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Despertar da afinidade {ELEMENT_CONFIG[sacrificeModalTarget].name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSacrificeModalTarget(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explicação e Custos Extremos */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl flex flex-col gap-2.5 text-xs font-mono">
              <span className="text-zinc-300 font-bold block border-b border-zinc-800 pb-1">
                Tributos Exigidos para o {currentCount + 1}º Elemento:
              </span>

              {/* Custos por Estágio */}
              {currentCount === 1 && (
                <>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Chakra Ancestral Necessário:</span>
                    <span className="text-purple-400 font-bold">50 CA</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Sacrifício de Sangue (Vital):</span>
                    <span className="font-bold">-25% de CPS Base Permanente</span>
                  </div>
                </>
              )}

              {currentCount === 2 && (
                <>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Chakra Ancestral Necessário:</span>
                    <span className="text-purple-400 font-bold">500 CA</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Sacrifício de Sangue (Vital):</span>
                    <span className="font-bold">-25% de CPS Base Permanente</span>
                  </div>
                </>
              )}

              {currentCount === 3 && (
                <>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Chakra Ancestral Necessário:</span>
                    <span className="text-purple-400 font-bold">5.000 CA</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Sacrifício de Arsenal:</span>
                    <span className="font-bold">Desintegração de Arma Épica ou Superior</span>
                  </div>
                </>
              )}

              {currentCount === 4 && (
                <>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Chakra Ancestral Necessário:</span>
                    <span className="text-purple-400 font-bold">50.000 CA</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Sacrifício de Arsenal:</span>
                    <span className="font-bold">Destruição de Arma Lendária ou Mítica</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Tributo de Chakra:</span>
                    <span className="font-bold">
                      -40% do Saldo (-{formatBigNumber(chakra.mul(0.4))} Chakra)
                    </span>
                  </div>
                  <div className="mt-1 p-2 rounded bg-amber-950/40 border border-amber-500/50 text-amber-300 text-[11px]">
                    ★ Recompensa Suprema: Título de Mestre Elemental (Avatar Shinobi) e multiplicador global de x3.0 em todo o CPS!
                  </div>
                </>
              )}
            </div>

            {/* Seleção de Arma para Sacrifício (Estágios 4 e 5) */}
            {(currentCount === 3 || currentCount === 4) && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-300 font-mono">
                  Selecione a arma a ser incinerada irrevogavelmente:
                </span>
                {eligibleSacrificeWeapons.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 p-1 bg-zinc-950 border border-zinc-850 rounded-xl">
                    {eligibleSacrificeWeapons.map(({ item, slotIndex }) => (
                      <div
                        key={`sacrifice-opt-${slotIndex}`}
                        onClick={() => setSelectedSacrificeWeaponSlot(slotIndex)}
                        className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between text-xs font-mono ${
                          selectedSacrificeWeaponSlot === slotIndex
                            ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Swords className="w-4 h-4 text-orange-400" />
                          <span className="font-bold">{item.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded border ${
                              RARITY_CONFIG[item.rarity].badgeClass
                            }`}
                          >
                            {RARITY_CONFIG[item.rarity].label}
                          </span>
                        </div>
                        {selectedSacrificeWeaponSlot === slotIndex && (
                          <Check className="w-4 h-4 text-rose-400 stroke-[2]" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/50 text-rose-400 text-xs font-mono">
                    Nenhuma arma de raridade suficiente encontrada em sua mochila. Derrote chefes avançados do Gauntlet para conseguir armas Épicas, Lendárias ou Míticas.
                  </div>
                )}
              </div>
            )}

            {/* Feedback de Ação */}
            {sacrificeFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono border ${
                  sacrificeFeedback.success
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                }`}
              >
                {sacrificeFeedback.message}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setSacrificeModalTarget(null)}
                className="flex-1 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteSacrifice}
                disabled={
                  (currentCount === 1 && chakraAncestral.lt(50)) ||
                  (currentCount === 2 && chakraAncestral.lt(500)) ||
                  (currentCount === 3 && (chakraAncestral.lt(5000) || selectedSacrificeWeaponSlot === null)) ||
                  (currentCount === 4 && (chakraAncestral.lt(50000) || selectedSacrificeWeaponSlot === null))
                }
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 text-white font-bold text-xs font-mono transition shadow-lg shadow-rose-950/50 cursor-pointer disabled:cursor-not-allowed"
              >
                Confirmar Sacrifício
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
