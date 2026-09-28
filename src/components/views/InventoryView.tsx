import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatBigNumber } from '../../engine/BigNumber';
import {
  EquipmentItem,
  FarmMaterialItem,
  InventorySlotItem,
  ElementType,
  GearSlotKey,
  ItemRarity,
  normalizeEquipmentSlot,
} from '../../types/inventory';
import { getRarityConfig } from '../../types/rarity';
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
  Crosshair,
  Eye,
  Footprints,
  Hand,
  CircleDot,
  Layers,
  PackageOpen,
  Filter,
} from 'lucide-react';

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
    borderClass: 'border-blue-500',
    activeBgClass: 'bg-blue-950/40 text-blue-300 border-blue-500/70',
    textClass: 'text-blue-400',
    glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    passiveName: 'Fluidez Regenerativa',
    passiveDesc: '-20% no tempo de descanso pós-vitória em chefes',
    icon: Droplets,
  },
};

const ALL_ELEMENTS_LIST: ElementType[] = ['FIRE', 'WIND', 'LIGHTNING', 'EARTH', 'WATER'];

// Metadados dos 11 Slots Oficiais de Equipamento Shinobi
interface GearSlotMetadata {
  key: GearSlotKey;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isCircular?: boolean;
  description: string;
}

const GEAR_SLOTS_METADATA: Record<GearSlotKey, GearSlotMetadata> = {
  HELMET: {
    key: 'HELMET',
    label: 'Capacete / Protetor',
    shortLabel: 'Capacete',
    icon: Crown,
    description: 'Bandana e elmo ninja regulamentar',
  },
  CHESTPLATE: {
    key: 'CHESTPLATE',
    label: 'Peitoral / Colete',
    shortLabel: 'Peitoral',
    icon: Shield,
    description: 'Colete blindado e armadura corporal shinobi',
  },
  GLOVES: {
    key: 'GLOVES',
    label: 'Luvas / Manoplas',
    shortLabel: 'Luvas',
    icon: Hand,
    description: 'Manoplas de chakra e proteção palmar',
  },
  BOOTS: {
    key: 'BOOTS',
    label: 'Botas / Sandálias',
    shortLabel: 'Botas',
    icon: Footprints,
    description: 'Sandálias ágeis com sola de aderência de chakra',
  },
  WEAPON_MELEE: {
    key: 'WEAPON_MELEE',
    label: 'Arma Corpo a Corpo',
    shortLabel: 'Melee',
    icon: Swords,
    description: 'Katanas, tantōs e lâminas de combate próximo',
  },
  WEAPON_RANGED: {
    key: 'WEAPON_RANGED',
    label: 'Arma de Longo Alcance',
    shortLabel: 'Ranged',
    icon: Crosshair,
    description: 'Shurikens gigantes, arcos e dispositivos balísticos',
  },
  MASK: {
    key: 'MASK',
    label: 'Máscara Shinobi',
    shortLabel: 'Máscara',
    icon: Eye,
    isCircular: true,
    description: 'Máscara ANBU de ocultação e canalização ocular',
  },
  CLOAK: {
    key: 'CLOAK',
    label: 'Capa / Manto',
    shortLabel: 'Capa',
    icon: Feather,
    description: 'Manto ninja resistente a intempéries e jutsus',
  },
  BACKPACK: {
    key: 'BACKPACK',
    label: 'Mochila Tática',
    shortLabel: 'Mochila',
    icon: Briefcase,
    description: 'Bolsa de suprimentos, pergaminhos e munição',
  },
  NECKLACE: {
    key: 'NECKLACE',
    label: 'Colar / Amuleto',
    shortLabel: 'Colar',
    icon: CircleDot,
    description: 'Amuleto ancestral e catalisador espiritual',
  },
  RUNE: {
    key: 'RUNE',
    label: 'Runa / Magatama',
    shortLabel: 'Runa',
    icon: Sparkles,
    description: 'Orbe com selo de chakra e runas de Rikudō',
  },
};

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
    case 'Crown':
      return <Crown className={className} />;
    case 'Crosshair':
      return <Crosshair className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Footprints':
      return <Footprints className={className} />;
    case 'Hand':
      return <Hand className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'CircleDot':
      return <CircleDot className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

/**
 * Padrão Geométrico Rúnico Animado para o Fundo dos Slots (Inspirado no Design Dark RPG)
 */
const RunicSigilPattern: React.FC<{
  rarityColor?: string;
  isEquipped?: boolean;
  isCircular?: boolean;
}> = ({ rarityColor = '#8b5cf6', isEquipped = false, isCircular = false }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ${
      isEquipped ? 'opacity-30 group-hover:opacity-55' : 'opacity-15 group-hover:opacity-30'
    }`}
    viewBox="0 0 100 100"
    fill="none"
  >
    {/* Círculos Concêntricos com Traços Rúnicos */}
    <circle
      cx="50"
      cy="50"
      r="46"
      stroke={rarityColor}
      strokeWidth={isCircular ? '1.5' : '1'}
      strokeDasharray="3 3"
      opacity="0.65"
    />
    <circle cx="50" cy="50" r="40" stroke={rarityColor} strokeWidth="0.8" opacity="0.45" />

    {/* Geometria Sagrada de Selamento Ninja (Octagrama & Linhas de Chakra) */}
    <polygon
      points="50,15 62,38 85,50 62,62 50,85 38,62 15,50 38,38"
      stroke={rarityColor}
      strokeWidth="0.9"
      opacity="0.5"
    />
    <polygon
      points="50,22 70,50 50,78 30,50"
      stroke={rarityColor}
      strokeWidth="0.75"
      strokeDasharray="2 2"
      opacity="0.4"
    />

    {/* Círculo Central Focal */}
    <circle cx="50" cy="50" r="14" stroke={rarityColor} strokeWidth="1.2" opacity="0.7" />
    <circle cx="50" cy="50" r="6" stroke={rarityColor} strokeWidth="0.8" opacity="0.5" />
    <circle cx="50" cy="50" r="2.5" fill={rarityColor} opacity="0.85" />

    {/* Eixos Diagonais Translúcidos */}
    <line x1="20" y1="20" x2="80" y2="80" stroke={rarityColor} strokeWidth="0.6" opacity="0.3" />
    <line x1="80" y1="20" x2="20" y2="80" stroke={rarityColor} strokeWidth="0.6" opacity="0.3" />
  </svg>
);

/**
 * Silhueta Ninja Translúcida no Fundo do Paperdoll
 */
const NinjaPaperdollSilhouette: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
    <svg
      className="w-full h-full max-h-[460px] text-zinc-700/15 drop-shadow-[0_0_30px_rgba(0,0,0,0.85)]"
      viewBox="0 0 300 500"
      fill="currentColor"
    >
      {/* Capuz e Cabeça */}
      <path d="M150 40 Q 120 40 120 80 Q 120 120 150 125 Q 180 120 180 80 Q 180 40 150 40 Z" opacity="0.8" />
      {/* Manto / Capa / Ombros */}
      <path d="M150 100 L90 145 L70 240 L110 320 L130 190 L150 200 L170 190 L190 320 L230 240 L210 145 Z" opacity="0.55" />
      {/* Tronco / Colete */}
      <path d="M130 120 L170 120 L180 210 L165 240 L135 240 L120 210 Z" opacity="0.75" />
      {/* Braço Esquerdo */}
      <path d="M115 135 L65 200 L75 250 L95 240 L85 190 L125 155 Z" opacity="0.6" />
      {/* Braço Direito */}
      <path d="M185 135 L235 200 L225 250 L205 240 L215 190 L175 155 Z" opacity="0.6" />
      {/* Pernas e Botas */}
      <path d="M135 245 L120 370 L110 460 L140 465 L145 370 L150 260 L155 370 L160 465 L190 460 L180 370 L165 245 Z" opacity="0.7" />
    </svg>
  </div>
);

export type ItemCategoryFilter = 'ALL' | 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'MATERIAL';
export type ItemRarityFilter = 'ALL' | ItemRarity;

const RARITY_PILLS: {
  id: ItemRarityFilter;
  label: string;
  dotColor: string;
  badgeActive: string;
  badgeInactive: string;
}[] = [
  { id: 'ALL', label: 'Todas', dotColor: 'bg-zinc-400', badgeActive: 'bg-zinc-800 text-zinc-100 border-zinc-600', badgeInactive: 'text-zinc-400 hover:text-zinc-200 border-zinc-800 bg-zinc-950/40' },
  { id: 'COMMON', label: 'Comum', dotColor: 'bg-zinc-400', badgeActive: 'bg-zinc-800 text-zinc-200 border-zinc-500 shadow-sm', badgeInactive: 'text-zinc-400 hover:text-zinc-200 border-zinc-800 bg-zinc-950/40' },
  { id: 'UNCOMMON', label: 'Incomum', dotColor: 'bg-emerald-400', badgeActive: 'bg-emerald-950/80 text-emerald-200 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]', badgeInactive: 'text-emerald-500/80 hover:text-emerald-400 border-emerald-950/80 bg-zinc-950/40' },
  { id: 'RARE', label: 'Raro', dotColor: 'bg-cyan-400', badgeActive: 'bg-cyan-950/80 text-cyan-200 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]', badgeInactive: 'text-cyan-500/80 hover:text-cyan-400 border-cyan-950/80 bg-zinc-950/40' },
  { id: 'EPIC', label: 'Épico', dotColor: 'bg-purple-400', badgeActive: 'bg-purple-950/80 text-purple-200 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]', badgeInactive: 'text-purple-500/80 hover:text-purple-400 border-purple-950/80 bg-zinc-950/40' },
  { id: 'LEGENDARY', label: 'Lendário', dotColor: 'bg-amber-400', badgeActive: 'bg-amber-950/80 text-amber-200 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)]', badgeInactive: 'text-amber-500/80 hover:text-amber-400 border-amber-950/80 bg-zinc-950/40' },
  { id: 'MYTHIC', label: 'Mítico', dotColor: 'bg-rose-400', badgeActive: 'bg-rose-950/80 text-rose-200 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.35)]', badgeInactive: 'text-rose-500/80 hover:text-rose-400 border-rose-950/80 bg-zinc-950/40' },
  { id: 'DIVINE', label: 'Divino', dotColor: 'bg-white', badgeActive: 'bg-zinc-800 text-white border-cyan-300 shadow-[0_0_15px_rgba(255,255,255,0.4)] ring-1 ring-cyan-400/50', badgeInactive: 'text-zinc-300 hover:text-white border-zinc-800 bg-zinc-950/40' },
];

export const InventoryView: React.FC = () => {
  const inventory = useGameStore((s) => s.inventory);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipItem = useGameStore((s) => s.unequipItem);
  const discardItem = useGameStore((s) => s.discardItem);
  const sacrificeForElement = useGameStore((s) => s.sacrificeForElement);

  // Sub-abas do Inventário: 'EQUIPMENT' (Paperdoll & Mochila) vs 'ELEMENTS' (Roda dos 5 Elementos)
  const [activeTab, setActiveTab] = useState<'EQUIPMENT' | 'ELEMENTS'>('EQUIPMENT');

  // Seleção de item inspecionado: { source: 'BAG' | 'GEAR', index?: number, gearKey?: GearSlotKey }
  const [selectedSlot, setSelectedSlot] = useState<{
    source: 'BAG' | 'GEAR';
    index?: number;
    gearKey?: GearSlotKey;
  } | null>(null);

  // Filtros Avançados da Mochila (Classe e Raridade)
  const [filterCategory, setFilterCategory] = useState<ItemCategoryFilter>('ALL');
  const [filterRarity, setFilterRarity] = useState<ItemRarityFilter>('ALL');
  const [selectedGearSlotFilter, setSelectedGearSlotFilter] = useState<GearSlotKey | null>(null);

  // Modal de Sacrifício Elemental
  const [sacrificeModalTarget, setSacrificeModalTarget] = useState<ElementType | null>(null);
  const [selectedSacrificeWeaponSlot, setSelectedSacrificeWeaponSlot] = useState<number | null>(null);
  const [sacrificeFeedback, setSacrificeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Mapeamento seguro de equippedGear com fallback
  const currentGear = useMemo(() => {
    return (
      inventory.equippedGear || {
        HELMET: null,
        CHESTPLATE: inventory.equippedArmor,
        BOOTS: null,
        GLOVES: null,
        BACKPACK: null,
        WEAPON_MELEE: inventory.equippedWeapon,
        WEAPON_RANGED: null,
        CLOAK: null,
        MASK: null,
        NECKLACE: null,
        RUNE: null,
      }
    );
  }, [inventory]);

  // Contagem de peças equipadas
  const equippedCount = useMemo(() => {
    return Object.values(currentGear).filter((item) => item !== null).length;
  }, [currentGear]);

  // Item atualmente inspecionado
  const inspectedItem: InventorySlotItem | null = useMemo(() => {
    if (!selectedSlot) return null;
    if (selectedSlot.source === 'GEAR' && selectedSlot.gearKey) {
      return currentGear[selectedSlot.gearKey] || null;
    }
    if (selectedSlot.source === 'BAG' && selectedSlot.index !== undefined) {
      return inventory.inventoryBag[selectedSlot.index] || null;
    }
    return null;
  }, [selectedSlot, currentGear, inventory]);

  // Contagem de ocupação real da mochila adaptativa
  const occupiedSlotsCount = useMemo(() => {
    return inventory.inventoryBag.filter((slot) => slot !== null).length;
  }, [inventory.inventoryBag]);

  // Contagens em tempo real por Raridade
  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: 0,
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0,
      MYTHIC: 0,
      DIVINE: 0,
      ADM: 0,
    };
    for (const item of inventory.inventoryBag) {
      if (item) {
        counts.ALL++;
        if (counts[item.rarity] !== undefined) {
          counts[item.rarity]++;
        }
      }
    }
    return counts;
  }, [inventory.inventoryBag]);

  // Itens da mochila filtrados de forma estritamente adaptativa
  const filteredBagItems = useMemo(() => {
    return inventory.inventoryBag
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter((entry): entry is { item: InventorySlotItem; originalIndex: number } => {
        const { item } = entry;
        if (!item) return false;

        // 1. Filtro por Raridade
        if (filterRarity !== 'ALL' && item.rarity !== filterRarity) {
          return false;
        }

        // 2. Filtro por Classe / Categoria
        if (filterCategory === 'MATERIAL') {
          if (item.type !== 'MATERIAL') return false;
        } else if (filterCategory === 'WEAPON') {
          if (
            item.type !== 'WEAPON' &&
            item.type !== 'WEAPON_MELEE' &&
            item.type !== 'WEAPON_RANGED'
          ) {
            return false;
          }
        } else if (filterCategory === 'ARMOR') {
          const armorTypes = ['HELMET', 'CHESTPLATE', 'BOOTS', 'GLOVES', 'CLOAK', 'ARMOR'];
          if (!armorTypes.includes(item.type)) return false;
        } else if (filterCategory === 'ACCESSORY') {
          const accTypes = ['BACKPACK', 'MASK', 'NECKLACE', 'RUNE'];
          if (!accTypes.includes(item.type)) return false;
        }

        // 3. Filtro específico do Paper Doll
        if (selectedGearSlotFilter && item.type !== 'MATERIAL') {
          const norm = normalizeEquipmentSlot(item.type);
          if (norm !== selectedGearSlotFilter) return false;
        }

        return true;
      });
  }, [inventory.inventoryBag, filterRarity, filterCategory, selectedGearSlotFilter]);

  // Cálculo cumulativo dos atributos de todos os 11 slots equipados
  const totalGearStats = useMemo(() => {
    let totalCpsMult = 1.0;
    let totalClickMult = 1.0;
    let totalCritChance = 0;
    let totalCritMult = 0;

    for (const item of Object.values(currentGear)) {
      if (!item) continue;
      if (item.bonusCpsMult && item.bonusCpsMult.gt(1)) {
        totalCpsMult *= item.bonusCpsMult.toNumber();
      }
      if (item.bonusClickMult && item.bonusClickMult.gt(1)) {
        totalClickMult *= item.bonusClickMult.toNumber();
      }
      if (item.bonusCritChance) {
        totalCritChance += item.bonusCritChance;
      }
      if (item.bonusCritMult && item.bonusCritMult.gt(1)) {
        totalCritMult += item.bonusCritMult.sub(1).mul(100).toNumber();
      }
    }

    return {
      cpsPct: Math.round((totalCpsMult - 1) * 100),
      clickPct: Math.round((totalClickMult - 1) * 100),
      critChancePct: Math.round(totalCritChance * 100),
      critMultPct: Math.round(totalCritMult),
    };
  }, [currentGear]);

  // Armas elegíveis para sacrifício elemental
  const currentCount = inventory.unlockedElements.length;
  const eligibleSacrificeWeapons = useMemo(() => {
    if (currentCount !== 3 && currentCount !== 4) return [];
    const minRarities =
      currentCount === 3
        ? ['EPIC', 'LEGENDARY', 'MYTHIC', 'DIVINE', 'ADM']
        : ['LEGENDARY', 'MYTHIC', 'DIVINE', 'ADM'];
    const result: { item: EquipmentItem; slotIndex: number }[] = [];
    inventory.inventoryBag.forEach((slot, idx) => {
      const isWeapon =
        slot &&
        slot.type !== 'MATERIAL' &&
        (slot.type === 'WEAPON' || slot.type === 'WEAPON_MELEE' || slot.type === 'WEAPON_RANGED');
      if (isWeapon && minRarities.includes(slot.rarity)) {
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

  /**
   * Renderizador de Slot Individual do Paper Doll com Efeito Rúnico e Iluminação
   */
  const renderGearSlot = (slotKey: GearSlotKey) => {
    const meta = GEAR_SLOTS_METADATA[slotKey];
    const item = currentGear[slotKey];
    const isSelected = selectedSlot?.source === 'GEAR' && selectedSlot.gearKey === slotKey;
    const isFilterTarget = selectedGearSlotFilter === slotKey;
    const rarityStyle = item ? getRarityConfig(item.rarity) : null;
    const IconComponent = meta.icon;

    return (
      <div
        key={`gear-slot-${slotKey}`}
        onClick={() => {
          if (item) {
            setSelectedSlot({ source: 'GEAR', gearKey: slotKey });
            setSelectedGearSlotFilter(null);
          } else {
            setSelectedSlot(null);
            setSelectedGearSlotFilter((prev) => (prev === slotKey ? null : slotKey));
          }
        }}
        className={`group relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden ${
          meta.isCircular
            ? 'w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2'
            : 'w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border'
        } ${
          item && rarityStyle
            ? `${rarityStyle.borderClass} ${rarityStyle.glowClass} ${rarityStyle.bgGradientClass || 'bg-zinc-950/90'} hover:scale-105 active:scale-95`
            : isFilterTarget
            ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-400/50'
            : 'border-zinc-800/80 hover:border-purple-500/60 bg-zinc-950/60 hover:bg-zinc-900/80 border-dashed'
        } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-zinc-950' : ''}`}
        title={`${meta.label}${item ? `: ${item.name} (${rarityStyle?.label})` : ' (Vazio - Clique para equipar)'}`}
      >
        {/* Fundo de Selo Rúnico / Chakra Arcane Sigil */}
        <RunicSigilPattern
          rarityColor={rarityStyle ? rarityStyle.colorHex : '#8b5cf6'}
          isEquipped={!!item}
          isCircular={meta.isCircular}
        />

        {/* Efeito Dinâmico de Reflexo Luminoso no Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Conteúdo Central do Slot */}
        {item ? (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="group-hover:scale-110 transition-transform duration-200">
              {renderItemIcon(item.iconName, 'w-6 h-6 sm:w-7 sm:h-7 text-zinc-100 drop-shadow-md')}
            </div>

            {/* Badge de Raridade no Canto */}
            <span
              className={`absolute -top-1.5 -right-1.5 text-[8px] px-1 py-0.2 rounded font-mono font-bold border uppercase ${
                rarityStyle?.badgeClass
              }`}
            >
              {item.rarity.slice(0, 3)}
            </span>

            {/* Tag Elemental se houver afinidade */}
            {item.elementalAffinityReq && (
              <span className="absolute -bottom-1.5 -left-1 text-[8px] px-1 rounded-full bg-zinc-950/90 border border-zinc-700 font-mono text-cyan-300">
                {ELEMENT_CONFIG[item.elementalAffinityReq].kanji}
              </span>
            )}
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
            <IconComponent
              className={`w-5 h-5 mb-0.5 transition-colors ${
                isFilterTarget ? 'text-cyan-400' : 'text-zinc-600 group-hover:text-purple-300'
              }`}
            />
            <span
              className={`text-[8px] font-mono tracking-wider uppercase font-semibold leading-tight ${
                isFilterTarget ? 'text-cyan-300' : 'text-zinc-600 group-hover:text-zinc-300'
              }`}
            >
              {meta.shortLabel}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* 1. CABEÇALHO OFICIAL */}
      <ViewHeader
        title="Arsenal Shinobi & Afinidades"
        subtitle="Paper Doll RPG, Gestão Modular de Mochila e Roda dos Cinco Elementos"
        badgeText={`${occupiedSlotsCount} Mochila • ${equippedCount}/11 Equipado`}
        badgeVariant="cyan"
        icon={<Briefcase className="w-4 h-4 text-cyan-400 stroke-[2]" />}
      />

      {/* 2. SUB-ABAS DE NAVEGAÇÃO INTERNA */}
      <div className="flex items-center gap-2 px-6 pt-2.5 pb-2 border-b border-zinc-800/80 bg-zinc-900/50 flex-shrink-0">
        <button
          onClick={() => setActiveTab('EQUIPMENT')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'EQUIPMENT'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
          }`}
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Equipamentos & Mochila</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300">
            {equippedCount}/11
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ELEMENTS')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'ELEMENTS'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Roda dos Cinco Elementos</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              inventory.isAvatarShinobi
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {inventory.unlockedElements.length}/5
          </span>
        </button>
      </div>

      {/* =========================================================================
          ABA 1: EQUIPAMENTOS & MOCHILA (PAPER DOLL 11 SLOTS + GRADE 32 ITENS)
         ========================================================================= */}
      {activeTab === 'EQUIPMENT' && (
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 bg-zinc-950">
          {/* =======================================================================
              COLUNA ESQUERDA: PAPER DOLL SHINOBI (11 SLOTS COM FUNDO RÚNICO)
             ======================================================================= */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col shadow-xl flex-1 min-h-[460px]">
              {/* Header do Paper Doll */}
              <div className="flex items-center justify-between mb-2 z-10">
                <div>
                  <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-sans flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-cyan-400 stroke-[2]" />
                    Paper Doll Shinobi
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    11 Slots Táticos de Indumentária, Armamento & Relíquias
                  </span>
                </div>
                {inventory.isAvatarShinobi && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/50 text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(251,191,36,0.25)]">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Avatar Shinobi
                  </span>
                )}
              </div>

              {/* Silhueta Central do Ninja no Fundo */}
              <NinjaPaperdollSilhouette />

              {/* GRADE DE 11 SLOTS EM 3 COLUNAS HARMONIOSAS (INSPIRADO NO PRINT RPG) */}
              <div className="relative z-10 flex-1 flex flex-col justify-around py-2">
                {/* 1. TOPO: CAPACETE (CENTRALIZADO) */}
                <div className="flex justify-center mb-1">
                  {renderGearSlot('HELMET')}
                </div>

                {/* 2. MEIO SUPERIOR: MELEE (ESQ) | PEITORAL (CENTRO) | CAPA (DIR) */}
                <div className="flex items-center justify-between px-2 sm:px-6">
                  {renderGearSlot('WEAPON_MELEE')}
                  {renderGearSlot('CHESTPLATE')}
                  {renderGearSlot('CLOAK')}
                </div>

                {/* 3. MEIO CENTRAL: RANGED (ESQ) | LUVAS (CENTRO) | MOCHILA (DIR) */}
                <div className="flex items-center justify-between px-2 sm:px-6 my-1">
                  {renderGearSlot('WEAPON_RANGED')}
                  {renderGearSlot('GLOVES')}
                  {renderGearSlot('BACKPACK')}
                </div>

                {/* 4. MEIO INFERIOR: MÁSCARA (ESQ CIRCULAR) | BOTAS (CENTRO) | ESPAÇO STATS (DIR) */}
                <div className="flex items-center justify-between px-2 sm:px-6">
                  {renderGearSlot('MASK')}
                  {renderGearSlot('BOOTS')}
                  {/* Tag de Dica / Filtro */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 flex flex-col items-center justify-center text-center p-1 rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-[9px] font-mono text-zinc-500">
                    <Layers className="w-4 h-4 text-zinc-600 mb-0.5" />
                    <span>{equippedCount}/11 Peças</span>
                  </div>
                </div>

                {/* 5. BASE: DUO DE RELÍQUIAS & ACESSÓRIOS (COLAR & RUNA LADO A LADO) */}
                <div className="flex justify-center items-center gap-4 mt-2">
                  {renderGearSlot('NECKLACE')}
                  {renderGearSlot('RUNE')}
                </div>
              </div>

              {/* RESUMO DE ATRIBUTOS TOTAIS DOS EQUIPAMENTOS */}
              <div className="relative z-10 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">CPS Trajes</span>
                  <span className="text-emerald-400 font-bold">+{totalGearStats.cpsPct}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Clique Armas</span>
                  <span className="text-orange-400 font-bold">+{totalGearStats.clickPct}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Crítico Bônus</span>
                  <span className="text-purple-400 font-bold">+{totalGearStats.critChancePct}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Dano Crítico</span>
                  <span className="text-cyan-400 font-bold">+{totalGearStats.critMultPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================================
              COLUNA DIREITA: MOCHILA SHINOBI ADAPTATIVA (FILTROS DE CLASSE/RARIDADE)
             ======================================================================= */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-hidden">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col flex-1 overflow-hidden">
              {/* Header da Mochila */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-sans flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400 stroke-[2]" />
                    Mochila Shinobi Adaptativa
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {occupiedSlotsCount} {occupiedSlotsCount === 1 ? 'item carregado' : 'itens carregados'} • Capacidade dinâmica auto-expansível
                  </span>
                </div>

                {/* Filtro por Categorias/Classes */}
                <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800/80 text-[11px] font-mono">
                  <button
                    onClick={() => {
                      setFilterCategory('ALL');
                      setSelectedGearSlotFilter(null);
                    }}
                    className={`px-2.5 py-0.5 rounded transition ${
                      filterCategory === 'ALL' && !selectedGearSlotFilter
                        ? 'bg-zinc-800 text-zinc-100 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterCategory('WEAPON')}
                    className={`px-2.5 py-0.5 rounded transition ${
                      filterCategory === 'WEAPON'
                        ? 'bg-red-950/70 text-red-300 border border-red-800/60 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Armas
                  </button>
                  <button
                    onClick={() => setFilterCategory('ARMOR')}
                    className={`px-2.5 py-0.5 rounded transition ${
                      filterCategory === 'ARMOR'
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Armaduras
                  </button>
                  <button
                    onClick={() => setFilterCategory('ACCESSORY')}
                    className={`px-2.5 py-0.5 rounded transition ${
                      filterCategory === 'ACCESSORY'
                        ? 'bg-purple-950/70 text-purple-300 border border-purple-800/60 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Acessórios
                  </button>
                  <button
                    onClick={() => {
                      setFilterCategory('MATERIAL');
                      setSelectedGearSlotFilter(null);
                    }}
                    className={`px-2.5 py-0.5 rounded transition ${
                      filterCategory === 'MATERIAL'
                        ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Materiais
                  </button>
                </div>
              </div>

              {/* Barra de Filtros por Raridade com Contadores em Tempo Real */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 mb-2.5 custom-scrollbar">
                <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1 pl-0.5 pr-1 flex-shrink-0">
                  <Filter className="w-3 h-3 text-zinc-400" />
                  Raridade:
                </span>
                {RARITY_PILLS.map((pill) => {
                  const isActive = filterRarity === pill.id;
                  const count = rarityCounts[pill.id] ?? 0;
                  return (
                    <button
                      key={`rarity-pill-${pill.id}`}
                      onClick={() => setFilterRarity(pill.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all flex-shrink-0 cursor-pointer border ${
                        isActive ? pill.badgeActive : pill.badgeInactive
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pill.dotColor}`} />
                      <span>{pill.label}</span>
                      <span
                        className={`text-[9px] px-1 rounded-full ${
                          isActive
                            ? 'bg-zinc-950/80 text-zinc-200'
                            : 'bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Indicador de Filtro Ativo por Slot do Paper Doll */}
              {selectedGearSlotFilter && (
                <div className="mb-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/50 rounded-lg flex items-center justify-between text-xs font-mono text-cyan-300">
                  <span>Filtrando para o Slot: {GEAR_SLOTS_METADATA[selectedGearSlotFilter].label}</span>
                  <button
                    onClick={() => setSelectedGearSlotFilter(null)}
                    className="text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Grade Adaptativa de Itens (Estendida para preencher o espaço vertical) */}
              {filteredBagItems.length > 0 ? (
                <div className="flex-1 min-h-0 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 content-start auto-rows-max gap-2 p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl overflow-y-auto custom-scrollbar">
                  {filteredBagItems.map(({ item, originalIndex }) => {
                    const isSelected = selectedSlot?.source === 'BAG' && selectedSlot.index === originalIndex;
                    const rarityStyle = getRarityConfig(item.rarity);
                    return (
                      <div
                        key={`slot-item-${item.id}-${originalIndex}`}
                        onClick={() => setSelectedSlot({ source: 'BAG', index: originalIndex })}
                        className={`w-full aspect-square rounded-xl border flex items-center justify-center relative transition-all cursor-pointer ${
                          rarityStyle.bgGradientClass || 'bg-zinc-900/80'
                        } hover:scale-105 ${
                          rarityStyle.borderClass
                        } ${rarityStyle.glowClass} ${
                          isSelected ? 'ring-2 ring-cyan-400 shadow-cyan-500/20 shadow-lg scale-105' : ''
                        }`}
                        title={`${item.name} (${rarityStyle.label})`}
                      >
                        {renderItemIcon(item.iconName, 'w-6 h-6 text-zinc-200')}

                        {/* Badge da Quantidade para Materiais */}
                        {item.type === 'MATERIAL' && (
                          <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold text-amber-300 bg-zinc-950/90 px-1 py-0.2 rounded border border-zinc-800">
                            x{(item as FarmMaterialItem).stackCount}
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
              ) : (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 bg-zinc-950/50 border border-dashed border-zinc-800/80 rounded-xl text-zinc-500 gap-2">
                  <PackageOpen className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
                  <span className="text-xs font-semibold text-zinc-400">
                    {inventory.inventoryBag.length === 0
                      ? 'Sua mochila está vazia no momento.'
                      : 'Nenhum item corresponde aos filtros selecionados.'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">
                    {inventory.inventoryBag.length === 0
                      ? 'Derrote chefes ou complete missões para obter itens e equipamentos.'
                      : 'Experimente alterar ou limpar os filtros de classe e raridade.'}
                  </span>
                </div>
              )}

              {/* CARD DE DETALHES DINÂMICO DO ITEM INSPECIONADO (EXIBIDO SOMENTE QUANDO HÁ ITEM SELECIONADO) */}
              {inspectedItem && (() => {
                const inspectedRarity = getRarityConfig(inspectedItem.rarity);
                return (
                  <div className="mt-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex-shrink-0 flex flex-col justify-between shadow-xl">
                    <div className="flex flex-col h-full justify-between gap-2.5">
                      <div>
                        {/* Header do Item Inspecionado */}
                        <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl bg-zinc-900 border flex items-center justify-center ${
                                inspectedRarity.borderClass
                              } ${inspectedRarity.glowClass} ${
                                inspectedRarity.bgGradientClass || ''
                              }`}
                            >
                              {renderItemIcon(inspectedItem.iconName, 'w-6 h-6 text-zinc-100')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`text-sm font-bold tracking-wide ${
                                    inspectedRarity.textClass
                                  }`}
                                >
                                  {inspectedItem.name}
                                </h4>
                                <span
                                  className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                                    inspectedRarity.badgeClass
                                  }`}
                                >
                                  {inspectedRarity.label}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {inspectedItem.type === 'MATERIAL'
                                  ? 'Mercadoria / Material de Farm'
                                  : `Slot de Destino: ${
                                      GEAR_SLOTS_METADATA[normalizeEquipmentSlot(inspectedItem.type)]?.label ||
                                      inspectedItem.type
                                    }`}
                                {inspectedItem.originBossName && ` • Drop de ${inspectedItem.originBossName}`}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedSlot(null)}
                            className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Lore */}
                        <p className="text-xs text-zinc-300 font-sans italic my-2 leading-relaxed bg-zinc-900/30 p-2 rounded-lg border border-zinc-850/60">
                          "{inspectedItem.description}"
                        </p>

                        {/* Atributos do Item */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                          {inspectedItem.type === 'MATERIAL' ? (
                            <>
                              <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 block uppercase">Quantidade</span>
                                <span className="text-amber-300 font-bold">{inspectedItem.stackCount}x</span>
                              </div>
                              <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 block uppercase">Cotação Unitária</span>
                                <span className="text-orange-400 font-bold">
                                  {formatBigNumber(inspectedItem.baseGoldValue)}
                                </span>
                              </div>
                              <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 block uppercase">Valor Total</span>
                                <span className="text-emerald-400 font-bold">
                                  {formatBigNumber(inspectedItem.baseGoldValue.mul(inspectedItem.stackCount))}
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
                                  <span className="text-[10px] text-zinc-500 block uppercase">
                                    Afinidade Elemental
                                  </span>
                                  <span
                                    className={`font-bold flex items-center gap-1.5 ${
                                      inventory.unlockedElements.includes(inspectedItem.elementalAffinityReq)
                                        ? 'text-cyan-400'
                                        : 'text-zinc-500'
                                    }`}
                                  >
                                    {ELEMENT_CONFIG[inspectedItem.elementalAffinityReq].name}:{' '}
                                    {inventory.unlockedElements.includes(inspectedItem.elementalAffinityReq)
                                      ? 'Ressonância Ativa'
                                      : 'Elemento Não Desperto'}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Ações Táticas */}
                      <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-2">
                        {inspectedItem.type !== 'MATERIAL' && selectedSlot?.source === 'BAG' && (
                          <button
                            onClick={() => {
                              if (selectedSlot.index !== undefined) {
                                const normSlot = normalizeEquipmentSlot(inspectedItem.type);
                                equipItem(selectedSlot.index);
                                setSelectedSlot({ source: 'GEAR', gearKey: normSlot });
                              }
                            }}
                            className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4 stroke-[2]" />
                            Equipar no Slot ({GEAR_SLOTS_METADATA[normalizeEquipmentSlot(inspectedItem.type)]?.shortLabel || 'Gear'})
                          </button>
                        )}

                        {selectedSlot?.source === 'GEAR' && selectedSlot.gearKey && (
                          <button
                            onClick={() => {
                              unequipItem(selectedSlot.gearKey!);
                              setSelectedSlot(null);
                            }}
                            className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Desequipar ({GEAR_SLOTS_METADATA[selectedSlot.gearKey].shortLabel})
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
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 2: RODA DOS CINCO ELEMENTOS CANÔNICOS (ABERTA APENAS QUANDO CLICADA)
         ========================================================================= */}
      {activeTab === 'ELEMENTS' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-zinc-950 custom-scrollbar">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Header da Roda */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <h3 className="text-base font-bold tracking-wider text-zinc-100 uppercase font-sans flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 stroke-[2]" />
                    Roda dos Cinco Elementos Canônicos de Chakra
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    A afinidade elemental define o fluxo de poder do shinobi. Desperte os 5 elementos
                    para transcender como Avatar Shinobi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs font-mono font-bold text-zinc-200 border border-zinc-700">
                    {inventory.unlockedElements.length}/5 Despertos
                  </span>
                  {inventory.isAvatarShinobi && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-xs font-mono font-bold text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.3)] flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" /> Avatar Shinobi (x3.0 CPS)
                    </span>
                  )}
                  {inventory.elementalSacrificePenaltyMult < 1 && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-950/40 text-[11px] font-mono text-rose-300 border border-rose-800/60">
                      Tributo Ativo: -{((1 - inventory.elementalSacrificePenaltyMult) * 100).toFixed(0)}% CPS
                    </span>
                  )}
                </div>
              </div>

              {/* Grid dos 5 Elementos Canônicos */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {ALL_ELEMENTS_LIST.map((element) => {
                  const conf = ELEMENT_CONFIG[element];
                  const isUnlocked = inventory.unlockedElements.includes(element);
                  const isNatal = inventory.unlockedElements[0] === element;
                  const IconComponent = conf.icon;

                  return (
                    <div
                      key={`element-card-${element}`}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isUnlocked
                          ? `${conf.borderClass} ${conf.glowClass} bg-zinc-900/80`
                          : 'border-zinc-800/80 bg-zinc-950/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            isUnlocked
                              ? 'bg-zinc-950/80 border border-current shadow-sm'
                              : 'bg-zinc-900/50 border border-zinc-800 text-zinc-600'
                          } ${conf.textClass}`}
                        >
                          <IconComponent className="w-5 h-5 stroke-[2]" />
                        </div>
                        <span className="text-xl font-bold font-mono text-zinc-500">{conf.kanji}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4 className={`text-xs font-bold ${isUnlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                            {conf.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-amber-300 font-semibold block mb-0.5">
                          {conf.passiveName}
                        </span>
                        <p className="text-[10px] font-mono text-zinc-400 leading-relaxed mb-3">
                          {conf.passiveDesc}
                        </p>
                      </div>

                      <div>
                        {isUnlocked ? (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isNatal ? 'Elemento Natal' : 'Desperto'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSacrificeModalTarget(element);
                              setSelectedSacrificeWeaponSlot(null);
                              setSacrificeFeedback(null);
                            }}
                            className="w-full py-1.5 px-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/70 hover:border-rose-500 text-[11px] font-mono text-rose-300 transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 font-semibold"
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

              {/* Explicação do Ritual */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-2.5 text-xs font-mono text-zinc-400 leading-relaxed">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  O despertar de afinidades além do elemento natal exige o <strong>Ritual do Sacrifício</strong>:
                  consumo de Chakra Ancestral, sacrifício permanente de CPS e entrega de armas de alta raridade
                  (Épicas e Lendárias) para romper as correntes de selamento dos clãs.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CONFIRMAÇÃO DO RITUAL DE SACRIFÍCIO ELEMENTAL
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

            {/* Custos e Tributos */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl flex flex-col gap-2.5 text-xs font-mono">
              <span className="text-zinc-300 font-bold block border-b border-zinc-800 pb-1">
                Tributos Exigidos para o {currentCount + 1}º Elemento:
              </span>

              {currentCount === 1 && (
                <>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Chakra Ancestral Necessário:</span>
                    <span className="text-purple-400 font-bold">50 CA</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Sacrifício de Sangue (Vital):</span>
                    <span className="font-bold">-25% de CPS Permanente</span>
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
                    <span className="font-bold">-25% de CPS Permanente</span>
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
                    <span>Sacrifício de Sangue (Vital):</span>
                    <span className="font-bold">-25% de CPS Permanente</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300 border-t border-zinc-800 pt-1">
                    <span>Oferenda de Lâmina Sagrada:</span>
                    <span className="font-bold">1x Arma Épica ou Superior</span>
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
                    <span>Sacrifício de Sangue (Vital):</span>
                    <span className="font-bold">-25% de CPS Permanente</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300 border-t border-zinc-800 pt-1">
                    <span>Oferenda de Lâmina Divina:</span>
                    <span className="font-bold">1x Arma Lendária, Mítica, Divina ou ADM</span>
                  </div>
                </>
              )}
            </div>

            {/* Seleção de Arma para Sacrifício (Estágios 3 e 4) */}
            {(currentCount === 3 || currentCount === 4) && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-zinc-300">
                  Selecione a Arma que será destruída no altar:
                </span>
                {eligibleSacrificeWeapons.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar">
                    {eligibleSacrificeWeapons.map(({ item, slotIndex }) => {
                      const itemRarity = getRarityConfig(item.rarity);
                      return (
                      <div
                        key={`sac-weapon-${slotIndex}`}
                        onClick={() => setSelectedSacrificeWeaponSlot(slotIndex)}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs font-mono ${
                          selectedSacrificeWeaponSlot === slotIndex
                            ? 'bg-rose-950/50 border-rose-500 ring-1 ring-rose-400'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center flex-shrink-0">
                          {renderItemIcon(item.iconName, 'w-4 h-4 text-zinc-200')}
                        </div>
                        <div className="truncate">
                          <span className={`font-bold block truncate ${itemRarity.textClass}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase">
                            {itemRarity.label}
                          </span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/60 text-xs font-mono text-rose-300 text-center">
                    Nenhuma arma com a raridade exigida na sua mochila! Derrote chefes para obter drops.
                  </div>
                )}
              </div>
            )}

            {/* Feedback de Erro ou Sucesso */}
            {sacrificeFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono ${
                  sacrificeFeedback.success
                    ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-700/70 text-rose-300'
                }`}
              >
                {sacrificeFeedback.message}
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex items-center gap-3 border-t border-zinc-800/80 pt-3">
              <button
                onClick={() => setSacrificeModalTarget(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-semibold transition cursor-pointer"
              >
                Recuar
              </button>
              <button
                onClick={handleExecuteSacrifice}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition shadow-lg cursor-pointer"
              >
                Consumar Sacrifício
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
