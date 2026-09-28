import Decimal from 'break_infinity.js';
import { GachaDropResult } from '../types/gacha';
import { ItemRarity } from '../types/inventory';

export const GACHA_ITEMS_POOL: GachaDropResult[] = [
  // --- RAROS (50% base) ---
  {
    id: 'gacha_shuriken_fuma',
    name: 'Shuriken Gigante de Fūma',
    type: 'EQUIPMENT',
    rarity: 'RARE',
    iconName: 'Crosshair',
    description: 'Arma de lâmina quádrupla dobrável com balanceamento ninja superior.',
    equipment: {
      id: 'gacha_shuriken_fuma',
      name: 'Shuriken Gigante de Fūma',
      description: 'Lâminas dobráveis que fatiam correntes de vento em disparos velozes.',
      rarity: 'RARE',
      type: 'WEAPON_RANGED',
      iconName: 'Crosshair',
      bonusCpsMult: new Decimal(1.25),
      bonusClickMult: new Decimal(1.35),
      bonusCritChance: 0.04,
    },
  },
  {
    id: 'gacha_anbu_tanto',
    name: 'Tantō de Operações Especiais ANBU',
    type: 'EQUIPMENT',
    rarity: 'RARE',
    iconName: 'Swords',
    description: 'Espada curta de lâmina reta forjada para execuções silenciosas.',
    equipment: {
      id: 'gacha_anbu_tanto',
      name: 'Tantō de Operações Especiais ANBU',
      description: 'Lâmina ágil de infiltração que potencializa o foco de combate.',
      rarity: 'RARE',
      type: 'WEAPON_MELEE',
      iconName: 'Swords',
      bonusCpsMult: new Decimal(1.3),
      bonusClickMult: new Decimal(1.5),
      bonusCritChance: 0.05,
    },
  },
  {
    id: 'gacha_resource_frags_small',
    name: 'Saco de Fragmentos de Minério Shinobi',
    type: 'FORGE_FRAGMENTS',
    rarity: 'RARE',
    iconName: 'Boxes',
    description: 'Minérios refinados recolhidos das fornalhas secretas do País do Ferro.',
    amount: 15,
  },
  {
    id: 'gacha_resource_chakra_burst',
    name: 'Pílula de Alimento Shinobi Concentrada',
    type: 'CPS_BURST',
    rarity: 'RARE',
    iconName: 'Sparkles',
    description: 'Restaura vigor instantâneo concedendo o equivalente a 180s de produção de chakra.',
    cpsSeconds: 180,
  },

  // --- ÉPICOS (32% base) ---
  {
    id: 'gacha_anbu_mask_raven',
    name: 'Máscara Ritualística ANBU do Corvo',
    type: 'EQUIPMENT',
    rarity: 'EPIC',
    iconName: 'Eye',
    description: 'Máscara de porcelana que catalisa foco sensorial e oculta a intenção assassina.',
    equipment: {
      id: 'gacha_anbu_mask_raven',
      name: 'Máscara Ritualística ANBU do Corvo',
      description: 'Catalisador ocular que confere bônus expressivos ao fluxo de chakra.',
      rarity: 'EPIC',
      type: 'MASK',
      iconName: 'Eye',
      bonusCpsMult: new Decimal(1.8),
      bonusClickMult: new Decimal(1.6),
      bonusCritChance: 0.07,
      bonusCritMult: new Decimal(1.45),
    },
  },
  {
    id: 'gacha_akatsuki_cloak',
    name: 'Manto das Nuvens Vermelhas da Akatsuki',
    type: 'EQUIPMENT',
    rarity: 'EPIC',
    iconName: 'Feather',
    description: 'Manto negro resistente a rajadas elementais com insígnia temida pelos cinco países.',
    equipment: {
      id: 'gacha_akatsuki_cloak',
      name: 'Manto das Nuvens Vermelhas da Akatsuki',
      description: 'Manto forrado com ligas térmicas que estabilizam as técnicas do usuário.',
      rarity: 'EPIC',
      type: 'CLOAK',
      iconName: 'Feather',
      bonusCpsMult: new Decimal(2.1),
      bonusClickMult: new Decimal(1.75),
      bonusCritChance: 0.08,
      bonusCritMult: new Decimal(1.5),
    },
  },
  {
    id: 'gacha_resource_ancestral_medium',
    name: 'Pergaminho de Essência Ancestral',
    type: 'ANCESTRAL_CHAKRA',
    rarity: 'EPIC',
    iconName: 'Scroll',
    description: 'Inscrições antigas que canalizam 8 pontos de Chakra Ancestral de prestígio.',
    amount: 8,
  },
  {
    id: 'gacha_resource_frags_medium',
    name: 'Baú de Fragmentos da Forja da Névoa',
    type: 'FORGE_FRAGMENTS',
    rarity: 'EPIC',
    iconName: 'Boxes',
    description: 'Contém 45 fragmentos de ligas metálicas resistentes a jutsus de água.',
    amount: 45,
  },

  // --- LENDÁRIOS (14% base) ---
  {
    id: 'gacha_kusanagi_sasuke',
    name: 'Espada Kusanagi Relampejante de Sasuke',
    type: 'EQUIPMENT',
    rarity: 'LEGENDARY',
    iconName: 'Zap',
    description: 'Chokutō sem guarda com lâmina indestrutível que conduz Chidori sem dissipação.',
    equipment: {
      id: 'gacha_kusanagi_sasuke',
      name: 'Espada Kusanagi Relampejante de Sasuke',
      description: 'Condução absoluta de relâmpago que aniquila barreiras de chakra.',
      rarity: 'LEGENDARY',
      type: 'WEAPON_MELEE',
      iconName: 'Zap',
      bonusCpsMult: new Decimal(4.2),
      bonusClickMult: new Decimal(3.8),
      bonusCritChance: 0.14,
      bonusCritMult: new Decimal(2.2),
    },
  },
  {
    id: 'gacha_hidan_scythe',
    name: 'Foice de Três Lâminas Sangrenta de Jashin',
    type: 'EQUIPMENT',
    rarity: 'LEGENDARY',
    iconName: 'Swords',
    description: 'Arma cerimonial vermelha presa a um cabo longo que conecta maldições viscerais.',
    equipment: {
      id: 'gacha_hidan_scythe',
      name: 'Foice de Três Lâminas Sangrenta de Jashin',
      description: 'Arma de ritual sangrento com poder devastador sobre a produção inimiga.',
      rarity: 'LEGENDARY',
      type: 'WEAPON_MELEE',
      iconName: 'Swords',
      bonusCpsMult: new Decimal(3.8),
      bonusClickMult: new Decimal(4.5),
      bonusCritChance: 0.16,
      bonusCritMult: new Decimal(2.4),
    },
  },
  {
    id: 'gacha_resource_ancestral_large',
    name: 'Tomo Sagrado das Nove Bestas de Cauda',
    type: 'ANCESTRAL_CHAKRA',
    rarity: 'LEGENDARY',
    iconName: 'Scroll',
    description: 'Inscrições proibidas que concedem instantaneamente 25 Chakra Ancestral.',
    amount: 25,
  },

  // --- MÍTICOS (4% base) ---
  {
    id: 'gacha_hashirama_necklace',
    name: 'Colar de Cristal de Chakra do Primeiro Hokage',
    type: 'EQUIPMENT',
    rarity: 'MYTHIC',
    iconName: 'CircleDot',
    description: 'Pedra de cristal precioso lapidada por Hashirama Senju com poder de conter Bijūs.',
    equipment: {
      id: 'gacha_hashirama_necklace',
      name: 'Colar de Cristal de Chakra do Primeiro Hokage',
      description: 'Amplificador mítico que estabiliza energias titânicas e multiplica a produção global.',
      rarity: 'MYTHIC',
      type: 'NECKLACE',
      iconName: 'CircleDot',
      bonusCpsMult: new Decimal(12.0),
      bonusClickMult: new Decimal(7.0),
      bonusCritChance: 0.22,
      bonusCritMult: new Decimal(3.0),
    },
  },
  {
    id: 'gacha_six_paths_magatama',
    name: 'Colar de Magatamas do Sábio dos Seis Caminhos',
    type: 'EQUIPMENT',
    rarity: 'MYTHIC',
    iconName: 'Sparkles',
    description: 'Seis orbes celestiais de matéria negra divina manifestadas diretamente por Hagoromo.',
    equipment: {
      id: 'gacha_six_paths_magatama',
      name: 'Colar de Magatamas do Sábio dos Seis Caminhos',
      description: 'Relíquia suprema do clã Ōtsutsuki que dobra o patamar cósmico do usuário.',
      rarity: 'MYTHIC',
      type: 'RUNE',
      iconName: 'Sparkles',
      bonusCpsMult: new Decimal(18.0),
      bonusClickMult: new Decimal(12.0),
      bonusCritChance: 0.28,
      bonusCritMult: new Decimal(4.0),
    },
  },
];

export function rollGachaSingle(forceEpicOrHigher = false): GachaDropResult {
  const roll = Math.random();
  let targetRarity: ItemRarity = 'RARE';

  if (forceEpicOrHigher) {
    if (roll < 0.08) {
      targetRarity = 'MYTHIC';
    } else if (roll < 0.38) {
      targetRarity = 'LEGENDARY';
    } else {
      targetRarity = 'EPIC';
    }
  } else {
    if (roll < 0.04) {
      targetRarity = 'MYTHIC';
    } else if (roll < 0.18) {
      targetRarity = 'LEGENDARY';
    } else if (roll < 0.5) {
      targetRarity = 'EPIC';
    } else {
      targetRarity = 'RARE';
    }
  }

  const matchingItems = GACHA_ITEMS_POOL.filter((item) => item.rarity === targetRarity);
  const picked = matchingItems[Math.floor(Math.random() * matchingItems.length)];

  // Retorna uma cópia independente com ID único de instância para equipamentos
  if (picked.equipment) {
    return {
      ...picked,
      equipment: {
        ...picked.equipment,
        id: `${picked.equipment.id}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      },
    };
  }

  return { ...picked };
}
