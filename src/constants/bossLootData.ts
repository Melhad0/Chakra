import { BossEquipmentSlotKey, ElementType, WeaponCategory } from '../types/inventory';
import { ItemRarity } from '../types/rarity';

export interface RawBossGearItem {
  name: string;
  description: string;
  iconName?: string;
  weaponCategory?: WeaponCategory;
  elementalAffinityReq?: ElementType;
}

export interface RawBossLootConfig {
  bossId: number;
  bossName: string;
  rarity: ItemRarity;
  primaryElement?: ElementType;
  material: {
    id: string;
    name: string;
    description: string;
    iconName: string;
    baseGoldValue: number;
  };
  items: Record<BossEquipmentSlotKey, RawBossGearItem>;
}

export const RAW_BOSS_LOOT_CONFIGS: Record<number, RawBossLootConfig> = {
  // =========================================================================
  // --- TIER 1: INICIAL / CHŪNIN (FASES 1 A 8) ---
  // =========================================================================

  // 1. Mizuki
  1: {
    bossId: 1,
    bossName: 'Mizuki',
    rarity: 'BASIC',
    material: {
      id: 'mat_mizuki_fang',
      name: 'Fragmento de Lâmina Enferrujada de Mizuki',
      description: 'Pedaço de aço rústico recuperado da emboscada no bosque proibido.',
      iconName: 'Disc',
      baseGoldValue: 50,
    },
    items: {
      HELMET: {
        name: 'Bandana Renegada de Konoha (Mizuki)',
        description: 'Faixa de testa com o símbolo da Folha arranhado com a ponta de uma kunai.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Colete de Instrutor da Folha (Mizuki)',
        description: 'Colete verde clássico da academia com compartimentos laterais de armazenamento.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas de Garras Mutantes de Mizuki',
        description: 'Luvas com pontas afiadas endurecidas pela poção mutagênica de Orochimaru.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias Ágeis de Fuga de Mizuki',
        description: 'Calçado leve de sola antiderrapante ideal para corrida por copas de árvores.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Camuflado dos Bosques de Konoha',
        description: 'Capa tingida com tons de folhagem utilizada para emboscadas noturnas.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Mochila do Pergaminho Proibido',
        description: 'Coldre cilíndrico de couro rústico projetado para transportar o pergaminho dos clones.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Frasco Amuleto da Poção de Fígado',
        description: 'Recipiente selado contendo vestígios do soro mutante de força física.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Falsa Viseira de Instrutor da Academia',
        description: 'Acessório de disfarce utilizado para manter a aparência de tutor leal.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Shuriken Gigante de Quatro Lâminas',
        description: 'Arma pesada de arremesso que Mizuki usou para emboscar Naruto na floresta.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Kunai Dentada de Emboscada de Mizuki',
        description: 'Lâmina de corte irregular forjada para combate de curta distância.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 2. Ebisu & Força Policial de Konoha
  2: {
    bossId: 2,
    bossName: 'Ebisu & Força Policial de Konoha',
    rarity: 'BASIC',
    material: {
      id: 'mat_ebisu_cloth',
      name: 'Tecido de Farda Policial de Konoha',
      description: 'Fibra resistente da farda da guarda interna da Aldeia da Folha.',
      iconName: 'Layers',
      baseGoldValue: 120,
    },
    items: {
      HELMET: {
        name: 'Bandana Preta do Instrutor Ebisu',
        description: 'Bandana estritamente alinhada segundo o código dos tutores de elite.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Uniforme Oficial de Jōnin Instrutor (Ebisu)',
        description: 'Traje escuro formal de alta disciplina e tecido reforçado contra atrito.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas Táticas da Força Policial da Folha',
        description: 'Luvas pretas com chapas metálicas nas costas para aparar lâminas.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias de Patrulha Urbana de Konoha',
        description: 'Calçado com acolchoamento acústico para vigília silenciosa pelas ruas da vila.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto com Brasão da Polícia de Konoha',
        description: 'Capa cerimonial azul e branca ostentando o símbolo das forças da lei.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Bolsa Tática de Shurikens de Cinto (Ebisu)',
        description: 'Bolsa compacta com divisórias magnéticas para munição ninja veloz.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Insígnia de Instrutor Privado de Konoha',
        description: 'Emblema concedido aos responsáveis pela tutela dos nobres e netos do Hokage.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Óculos Escuros Táticos de Ebisu',
        description: 'Óculos circulares clássicos que ocultam a dilatação das pupilas e jutsus visuais.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Senbon de Ferro Negro da Folha',
        description: 'Agulhas finas de precisão destinadas a atingir pontos de pressão (tenketsu).',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Tonfa Tática de Defesa de Konoha',
        description: 'Bastão defensivo de treino utilizado pelos instrutores de elite da academia.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 3. Kankurō
  3: {
    bossId: 3,
    bossName: 'Kankurō',
    rarity: 'COMMON',
    primaryElement: 'WIND',
    material: {
      id: 'mat_puppet_joint',
      name: 'Articulação Mecânica do Corvo',
      description: 'Engrenagem lubrificada de madeira e latão recuperada da marionete Karasu.',
      iconName: 'Boxes',
      baseGoldValue: 250,
    },
    items: {
      HELMET: {
        name: 'Capuz com Orelhas de Gato de Kankurō',
        description: 'Touca negra tradicional que disfarça a silhueta do marionetista no deserto.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Traje de Batalha de Marionetista de Suna',
        description: 'Túnica escura solta que permite guardar carretéis e mecanismos de chakra.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas de Emissão de Fios de Chakra (Kankurō)',
        description: 'Manoplas com ponteiras vazadas para canalização precisa de linhas azuis.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas do Deserto de Sunagakure',
        description: 'Botas de cano médio vedadas contra a intrusão de areia abrasiva.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Protetor de Tempestades de Areia',
        description: 'Tecido espesso impermeável a vendavais do País do Vento.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Mochila Enrolada da Marionete Corvo',
        description: 'Armação dorsal com ataduras que mantém o boneco de combate pronto para saque.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Frasco Amuleto de Veneno de Suna',
        description: 'Pequena ampola com toxina paralisante destilada dos escorpiões do deserto.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Pintura Facial Kabuki de Kankurō',
        description: 'Pintura tribal de teatro tradicional que intimida inimigos e mascara feições.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Dardos de Arremesso Ocultos de Suna',
        description: 'Munição fina e pontiaguda disparada da boca ou braços das marionetes.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lâmina Oculta de Karasu (Kankurō)',
        description: 'Lâmina retrátil envenenada montada nas articulações da marionete Corvo.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 4. Genno
  4: {
    bossId: 4,
    bossName: 'Genno',
    rarity: 'COMMON',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_paper_bomb_powder',
      name: 'Pólvora Refinada do País do Nevoeiro',
      description: 'Composto mineral altamente volátil preparado por Genno para armadilhas urbanas.',
      iconName: 'Flame',
      baseGoldValue: 350,
    },
    items: {
      HELMET: {
        name: 'Gorro Rústico de Carpinteiro de Genno',
        description: 'Chapéu simples de operário usado para se camuflar entre construtores de Konoha.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Colete de Operário com Bolsos Ocultos',
        description: 'Vestimenta de trabalho forrada com compartimentos para selos explosivos.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas de Fita Adesiva e Pólvora',
        description: 'Luvas resistentes a queimaduras e ideais para fixar detonadores com rapidez.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas Silenciosas de Infiltração Urbana',
        description: 'Solado macio que anula o ruído de passos em andaimes e telhados.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Sobretudo Empoeirado de Argamassa',
        description: 'Capa rústica marcada por cal e cimento para mascarar o odor de pólvora.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Bolsa Caçadora de Selos Explosivos de Genno',
        description: 'Mochila com centenas de papéis detonadores organizados por raio de ação.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Talismã com Detonador de Fio Oculto',
        description: 'Pingente de ferro que serve como âncora para linhas de detonação em massa.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Respirador contra Fumaça de Explosivos',
        description: 'Máscara facial de feltro e carvão para operar no epicentro de detonações.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Kunai Armada com Selos em Cadeia',
        description: 'Kunai equilibrada com feixe de selos explosivos temporizados.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Pá de Trincheira Afiada de Genno',
        description: 'Ferramenta pesada com borda amolada usada como arma de impacto letal.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },

  // 5. Amachi
  5: {
    bossId: 5,
    bossName: 'Amachi',
    rarity: 'COMMON',
    primaryElement: 'WATER',
    material: {
      id: 'mat_demon_fish_scale',
      name: 'Escama Mutagênica do Peixe-Diabo',
      description: 'Estrutura dérmica aquática mutante criada pelas pesquisas do País do Mar.',
      iconName: 'Droplets',
      baseGoldValue: 500,
    },
    items: {
      HELMET: {
        name: 'Tiara com Sensores Aquáticos de Amachi',
        description: 'Aro metálico com placas de leitura de ondas de choque subaquáticas.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Traje Anfíbio de Escamas Quiméricas',
        description: 'Armadura dérmica de natação veloz resistente a alta pressão hidrostática.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Garras Natatórias com Membranas de Amachi',
        description: 'Manoplas biológicas que cortam a água e rasgam oponentes em alta velocidade.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Nadadeiras Táticas de Propulsão Aquática',
        description: 'Calçado com aletas que multiplicam a aceleração sob correntezas.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Pele de Peixe-Diabo do Mar',
        description: 'Capa escorregadia que desvia de golpes corpo a corpo leves.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Tanque Dorsal de Soro Quimérico Marinho',
        description: 'Reservatório selado que injeta compostos regenerativos sob a pele.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Amuleto de Dente de Tubarão das Profundezas',
        description: 'Talismã esculpido em marfim de predador abissal do País do Mar.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Brânquias Artificiais de Respiração Submarina',
        description: 'Filtro facial hidrodinâmico para extração de oxigênio de águas turvas.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Arpão de Pressão Hidráulica de Amachi',
        description: 'Projétil metálico impulsionado por liberação explosiva de jatos d\'água.',
        iconName: 'Crosshair',
        weaponCategory: 'BOW',
      },
      WEAPON_MELEE: {
        name: 'Espada Serrilhada de Dentes de Coral',
        description: 'Lâmina larga de recife fossilizado forjada para estraçalhar armaduras.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 6. Ishidate
  6: {
    bossId: 6,
    bossName: 'Ishidate',
    rarity: 'UNCOMMON',
    primaryElement: 'EARTH',
    material: {
      id: 'mat_petrified_crystal',
      name: 'Fragmento de Rocha Petrificada de Ishidate',
      description: 'Pedaço de matéria orgânica convertida em pedra pura pela manopla mística.',
      iconName: 'Mountain',
      baseGoldValue: 700,
    },
    items: {
      HELMET: {
        name: 'Faixa Frontal de Quartzo de Ishidate',
        description: 'Protetor craniano decorado com pedras polidas da Lua Crescente.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura de Placas de Mármore Negro',
        description: 'Peitoral mineral de alta densidade imune a cortes superficiais.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manopla Mecânica de Petrificação de Ishidate',
        description: 'Aparelho lendário que converte tecido vivo em rocha maciça por contato.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas de Solo Rochoso de Ishidate',
        description: 'Botas de sola de ardósia que aumentam a aderência em terrenos pedregosos.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Seda Roxa com Bordas Minerais',
        description: 'Capa nobre pesada dos mercenários do País da Lua.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Mochila de Reagentes de Cristalização',
        description: 'Estojo de couro rígido com frascos químicos catalisadores de calcificação.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pingente de Olho Fossilizado Ancestral',
        description: 'Talismã de pedra bruta que emana ressonância elemental Doton.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Máscara Facial Esculpida em Granito',
        description: 'Proteção facial esculpida que anula impactos no queixo e bochechas.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Estilhaços de Rocha Petrificante de Arremesso',
        description: 'Projéteis minerais afiados que espalham o efeito de calcificação.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Bastão de Pedra Vulcanizada de Ishidate',
        description: 'Arma contundente maciça forjada em rocha ígnea de alta tenacidade.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },

  // 7. Dotō Kazahana
  7: {
    bossId: 7,
    bossName: 'Dotō Kazahana',
    rarity: 'UNCOMMON',
    primaryElement: 'WIND',
    material: {
      id: 'mat_black_chakra_shard',
      name: 'Fragmento da Armadura Negra de Chakra',
      description: 'Liga metálica especial capaz de absorver e dispersar ninjutsus elementais.',
      iconName: 'Shield',
      baseGoldValue: 950,
    },
    items: {
      HELMET: {
        name: 'Elmo de Titânio do País da Neve',
        description: 'Capacete reforçado com isolamento térmico e antenas de chakra.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura Negra de Chakra de Dotō',
        description: 'Peitoral mecânico futurista que neutraliza ataques mágicos de chakra.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas de Condução Raiton da Neve',
        description: 'Braçadeiras blindadas que disparam pulsos elétricos no impacto.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas Térmicas com Cravos de Gelo',
        description: 'Calçado com travas retráteis para corrida rápida sobre geleiras e nevascas.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Capa Real de Pele de Lobo Ártico',
        description: 'Manto aristocrático do usurpador do trono do País da Neve.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Bateria Dorsal de Chakra Polar',
        description: 'Reator cilíndrico que fornece energia ininterrupta à blindagem negra.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Chave Hexagonal do Gerador Geotérmico',
        description: 'Chave de cristal mística que controla o degelo do Vale do Fim da Neve.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira Polar com HUD Térmico de Dotō',
        description: 'Lentes tecnológicas que detectam a assinatura de calor dos oponentes.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Lançador de Arpões de Gelo Negro',
        description: 'Dispositivo mecânico de longo alcance para estilhaçar defesas.',
        iconName: 'Crosshair',
        weaponCategory: 'BOW',
      },
      WEAPON_MELEE: {
        name: 'Lâmina Retrátil Dupla de Chakra Negro',
        description: 'Garras de antebraço pressurizadas que emitem lâminas de energia roxa.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 8. Shiranami
  8: {
    bossId: 8,
    bossName: 'Shiranami',
    rarity: 'UNCOMMON',
    primaryElement: 'WATER',
    material: {
      id: 'mat_kanji_scroll_ink',
      name: 'Papiro com Tinta Mística Tsuchigumo',
      description: 'Rolo de escrita contendo fórmulas restritivas que aprisionam os movimentos.',
      iconName: 'Scroll',
      baseGoldValue: 1200,
    },
    items: {
      HELMET: {
        name: 'Faixa Frontal com Caracteres de Selamento',
        description: 'Faixa de tecido inscrita com kanjis de imunidade mental.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Túnica Tradicional do Clã Tsuchigumo',
        description: 'Manto azul e branco com costuras rúnicas do vilarejo das montanhas.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas de Tecelão de Linhas de Kanji',
        description: 'Luvas de seda que permitem desenhar caracteres de chakra no ar.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias de Passo Silencioso Tsuchigumo',
        description: 'Calçado cerimonial confeccionado com palha de bambu encantada.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Escriba das Sombras de Shiranami',
        description: 'Capa fluida que dissipa poeira e pequenos projéteis de vento.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Mochila de Rolos de Caligrafia Ninja',
        description: 'Bolsa dorsal de pergaminhos com fórmulas de paralisia e explosão.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pergaminho Sagrado do Jutsu da Ira Celestial',
        description: 'Pingente em miniatura da técnica proibida do clã de Hotaru.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Véu de Tinta Mística Protetora',
        description: 'Cortina translúcida de caracteres flutuantes que oculta o rosto de Shiranami.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Pincéis de Ferro de Lançamento de Kanji',
        description: 'Armas de arremesso que marcam o alvo com o kanji de restrição física.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Adaga de Contenção de Selamento (Shiranami)',
        description: 'Lâmina cerimonial que interrompe o fluxo de chakra ao perfurar o alvo.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // =========================================================================
  // --- TIER 2: JŌNIN / INVASÕES (FASES 9 A 21) ---
  // =========================================================================

  // 9. Jirōbō
  9: {
    bossId: 9,
    bossName: 'Jirōbō',
    rarity: 'RARE',
    primaryElement: 'EARTH',
    material: {
      id: 'mat_curse_mark_essence',
      name: 'Essência da Marca da Maldição da Terra',
      description: 'Líquido escuro coagulado da mutação de Selo Nível 2 de Orochimaru.',
      iconName: 'Skull',
      baseGoldValue: 2000,
    },
    items: {
      HELMET: {
        name: 'Bandana Rasgada do Som de Jirōbō',
        description: 'Protetor com o símbolo de Otogakure tensionado pela musculatura do selo.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura Corpórea de Rocha Megalítica',
        description: 'Casca rochosa natural desenvolvida durante a transformação do Selo Nível 2.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Punhos Sísmicos de Pedra de Jirōbō',
        description: 'Manoplas brutas de terra compactada capazes de pulverizar rochedos.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Passadas Colossais de Doton',
        description: 'Grevas pesadas de granito que afundam o solo e geram tremores locais.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Corda Gigante do Quarteto do Som',
        description: 'Corda roxa trançada característica dos servos de elite de Orochimaru.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Cesto Dorsal de Lajes Compactadas',
        description: 'Armação pesada usada para carregar rochedos para a Prisão de Terra.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Marca da Maldição da Terra em Pingente',
        description: 'Talismã que reverbera a energia senjutsu corrompida de Jirōbō.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Mandíbula Hipertrofiada de Nível 2',
        description: 'Placa óssea que protege o queixo e dentes do combatente brutal.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Monólitos de Arremesso de Rocha Pura',
        description: 'Blocos de pedra gigantescos arremessados com a força bruta do selo.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Martelo Telúrico da Prisão de Terra',
        description: 'Massa colossal esculpida em rocha densa para impacto maciço.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },

  // 10. Sakon e Ukon
  10: {
    bossId: 10,
    bossName: 'Sakon e Ukon',
    rarity: 'RARE',
    material: {
      id: 'mat_parasitic_cell_core',
      name: 'Núcleo Celular Parasitário de Ukon',
      description: 'Massa biológica regenerativa capaz de fundir tecidos vivos.',
      iconName: 'Activity',
      baseGoldValue: 2800,
    },
    items: {
      HELMET: {
        name: 'Tiara Rúnica dos Gêmeos do Som',
        description: 'Faixa com orbes metálicos que sincroniza as ondas cerebrais dos irmãos.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Traje Quimérico de Fusão de Sakon/Ukon',
        description: 'Colete elástico especial preparado para a saída e recolhimento de corpos.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas Simbióticas dos Irmãos Demônios',
        description: 'Luvas que estendem garras biológicas simultâneas de quatro braços.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Passadas Enegrecidas do Selo Nível 2',
        description: 'Sandálias manchadas por chakra demoníaco que aceleram fintas corporais.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Capa Fatiada das Sombras de Otogakure',
        description: 'Manto esfarrapado que cobre a protuberância dorsal de Ukon.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Bolsa de Reagentes Celulares de Orochimaru',
        description: 'Compartimento médico contendo nutrientes para recuperação rápida.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Amuleto de Sangue Duplo em Pingente',
        description: 'Pingente com duas gotas cristalizadas representando a alma dos gêmeos.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Rosto Espectral Saliente de Ukon',
        description: 'Máscara viva que intimida e cospe ataques de surpresa nas costas.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Shurikens Quádruplas Envenenadas',
        description: 'Lâminas de arremesso coordenadas disparadas por múltiplos braços.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Adaga da Fusão Celular Parasitária',
        description: 'Lâmina curva feita de tecido ósseo endurecido para penetração profunda.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 11. Tayuya
  11: {
    bossId: 11,
    bossName: 'Tayuya',
    rarity: 'RARE',
    primaryElement: 'WIND',
    material: {
      id: 'mat_doki_demon_horn',
      name: 'Chifre Espiritual dos Ogros Doki',
      description: 'Material ectoplasmático denso deixado após a dissipação dos gigantes de som.',
      iconName: 'Wind',
      baseGoldValue: 3600,
    },
    items: {
      HELMET: {
        name: 'Tiara com Chifres de Nível 2 de Tayuya',
        description: 'Adorno ósseo natural formado na testa durante a liberação demoníaca.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Túnica de Convocadora Espiritual (Tayuya)',
        description: 'Robe resistente com abertura que facilita a postura de sopro da flauta.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas com Ponteiras de Metal para Flauta',
        description: 'Dedais de bronze que vedam com perfeição os orifícios da flauta sonora.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias Ágeis de Recuo do Som',
        description: 'Calçado leve feito para manter distância enquanto comanda os ogros.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Fantasmagórico das Ilusões de Som',
        description: 'Capa translúcida que distorce a percepção espacial do adversário.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Coldre Acústico da Flauta Demoníaca',
        description: 'Estojo acolchoado que protege o instrumento contra choques físicos.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pingente de Notação Musical Macabra',
        description: 'Partitura minúscula gravada em aço com as melodias que controlam os Doki.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira Acústica Anti-Ressonância',
        description: 'Filtro sonoro que protege os ouvidos de Tayuya de sua própria ilusão.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Senbons de Ilusão Auditiva de Tayuya',
        description: 'Agulhas que assobiam em frequências enlouquecedoras ao cortar o ar.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Flauta Demoníaca de Som Puro (Tayuya)',
        description: 'Instrumento forjado no esconderijo do Som que emite genjutsus mortais.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 12. Baki da Areia
  12: {
    bossId: 12,
    bossName: 'Baki da Areia',
    rarity: 'RARE',
    primaryElement: 'WIND',
    material: {
      id: 'mat_vacuum_blade_scroll',
      name: 'Manuscrito da Espada de Vento de Baki',
      description: 'Instruções secretas para moldar lâminas de vácuo puro com a mão nua.',
      iconName: 'Wind',
      baseGoldValue: 4500,
    },
    items: {
      HELMET: {
        name: 'Turbante com Protetor de Sunagakure (Baki)',
        description: 'Véu de tecido resistente com o símbolo da Areia em metal polido.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Colete Tático de Comandante Jōnin de Suna',
        description: 'Armadura leve de couro com ombreiras reforçadas para combate rápido.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas Cortantes de Vácuo de Baki',
        description: 'Luvas finas que canalizam chakra Fūton nas pontas dos dedos.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas Militares do Alto Comando de Suna',
        description: 'Calçado com reforço de caneleira de aço para esquivas velozes no deserto.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Capa Dividida da Guarda de Sunagakure',
        description: 'Manto branco com cortes assimétricos que ondulam com o vendaval.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Bolsa de Mensagens Confidenciais de Guerra',
        description: 'Mochila com selo de cera oficial dos generais de Sunagakure.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Insígnia dos Conselheiros da Areia',
        description: 'Medalhão de bronze concedido aos guardiões diretos do Kazekage.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Véu de Areia Protetor Facial de Baki',
        description: 'Pano clássico que cobre metade do rosto contra tempestades e veneno.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Lâminas Retorcidas de Vento de Arremesso',
        description: 'Projéteis de aço forjados com curvas que cortam o ar sem emitir som.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espada de Vento Invisível (Kaze no Yaiba)',
        description: 'Arma de vácuo puro moldada pelo chakra de Baki que não pode ser bloqueada.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 13. Haido
  13: {
    bossId: 13,
    bossName: 'Haido',
    rarity: 'RARE',
    material: {
      id: 'mat_gelel_fragment',
      name: 'Fragmento Puro da Pedra de Gelel',
      description: 'Cristal mineral esmeralda repleto de vitalidade primordial e energia curativa.',
      iconName: 'Sparkles',
      baseGoldValue: 5500,
    },
    items: {
      HELMET: {
        name: 'Coroa de Ouro dos Cavaleiros de Gelel',
        description: 'Diadema dourado com ranhuras que canalizam a energia da pedra sagrada.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Armadura Sagrada de Cavaleiro Utópico',
        description: 'Peitoral reluzente forjado com ligas nobres e incrustações de Gelel.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas Imbuídas com Essência de Gelel',
        description: 'Manoplas pesadas que emitem pulsos de luz curativa e golpes devastadores.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Grevas Metálicas de Cavalaria Pesada',
        description: 'Proteções de perna polidas de alta resistência contra projéteis.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Real Branco e Dourado de Haido',
        description: 'Capa aristocrática forrada com seda nobre dos impérios esquecidos.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Reator Portátil de Essência de Gelel',
        description: 'Reservatório dorsal que mantém a energia esmeralda em fluxo constante.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Colar com o Coração da Pedra de Gelel',
        description: 'Amuleto com uma gema verde que acelera a regeneração das células.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira Régia de Platina e Vidro de Gelel',
        description: 'Protetor ocular blindado que enxerga correntes telúricas sob o solo.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Esferas Arremessáveis de Energia Gelel',
        description: 'Orbes condensados de força mineral que explodem em clarões esmeralda.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espada Longa de Cavaleiro de Gelel',
        description: 'Lâmina imensa que brilha com a luz da utopia prometida por Haido.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 14. Toroi da Nuvem
  14: {
    bossId: 14,
    bossName: 'Toroi da Nuvem',
    rarity: 'RARE',
    primaryElement: 'LIGHTNING',
    material: {
      id: 'mat_magnetic_iron_sand',
      name: 'Areia de Ferro Magnetizada de Toroi',
      description: 'Pó de minério altamente imantado pela Kekkei Genkai Jiton.',
      iconName: 'Zap',
      baseGoldValue: 6800,
    },
    items: {
      HELMET: {
        name: 'Protetor de Testa de Kumogakure (Toroi)',
        description: 'Bandana metálica imantada que repele pequenas agulhas metálicas.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Colete Branco de Jōnin de Elite de Kumo',
        description: 'Uniforme tradicional de Kumogakure com ombreira única acolchoada.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas com Polos Magnéticos Opostos',
        description: 'Braçadeiras que atraem e repelem armas de metal com um gesto.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas Leves de Salto Eletromagnético',
        description: 'Calçado com solado metálico que se impulsiona repelindo solo rochoso.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Condutividade Magnética de Toroi',
        description: 'Capa cinzenta entrelaçada com fios de cobre e ferro polarizado.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Estojo Triplo de Shurikens Gigantes Imantadas',
        description: 'Mochila dorsal de saque rápido para lâminas pesadas de Jiton.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Talismã Polar de Kumogakure',
        description: 'Pingente de bússola encantada que vibra na presença de chakra de relâmpago.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Protetor de Mandíbula de Aço Imantado',
        description: 'Placa facial que desvia trajetórias de kunais inimigas para longe do pescoço.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Shurikens Magnéticas de Trajetória Curva',
        description: 'Lâminas que perseguem alvos marcados com magnetismo polo oposto.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Maça de Ferro Indutivo de Toroi',
        description: 'Arma pesada que descarrega choques magnéticos nos ossos do oponente.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },

  // 15. Gari da Pedra
  15: {
    bossId: 15,
    bossName: 'Gari da Pedra',
    rarity: 'RARE',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_bakuton_core',
      name: 'Resíduo Mineral de Bakuton de Gari',
      description: 'Cristal vulcânico detonador que queima em contato com oxigênio sob pressão.',
      iconName: 'Flame',
      baseGoldValue: 8200,
    },
    items: {
      HELMET: {
        name: 'Bandana Vermelha de Iwagakure (Gari)',
        description: 'Faixa resistente a chamas da divisão especial de demolição de Iwa.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Colete Marrom Reforçado de Demolição',
        description: 'Armadura com camadas cerâmicas que dissipam calor e estilhaços.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas com Placas Detonadoras de Bakuton',
        description: 'Manoplas com núcleos explosivos que detonam ao desferir socos diretos.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas de Aterrissagem Anti-Detonação',
        description: 'Botas reforçadas para resistir à onda de choque de explosões sob os pés.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Militar de Iwagakure com Faixa Preta',
        description: 'Uniforme da unidade de elite de combate corpo a corpo das montanhas.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Mochila com Cargas Minerais Explosivas',
        description: 'Bolsa blindada com cartuchos de fósforo e minérios de Iwa.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Medalhão da Divisão de Explosões da Rocha',
        description: 'Insígnia de bravura dos ninjas que lutaram na linha de frente da guerra.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Vetor Facial de Dispersão de Onda de Choque',
        description: 'Filtro que protege tímpanos e pulmões do deslocamento de ar das explosões.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Granadas Ninja de Argila Detonante',
        description: 'Projéteis esféricos de arremesso que estilhaçam blindagens leves.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Manopla do Punho Explosivo Devastador (Gari)',
        description: 'Arma de impacto brutal que canaliza a Kekkei Genkai Bakuton em cada soco.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 16. Kushimaru Kuriarare
  16: {
    bossId: 16,
    bossName: 'Kushimaru Kuriarare',
    rarity: 'VERY_RARE',
    primaryElement: 'WATER',
    material: {
      id: 'mat_nuibari_steel_thread',
      name: 'Fio de Aço Cirúrgico da Nuibari',
      description: 'Filamento metálico ultrafino e inquebrável usado para coser adversários.',
      iconName: 'Layers',
      baseGoldValue: 10000,
    },
    items: {
      HELMET: {
        name: 'Ataduras de Cabeça dos Sete Espadachins',
        description: 'Faixas brancas ensanguentadas que sustentam a máscara da Névoa de Sangue.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Traje Sem Mangas dos Espadachins da Névoa',
        description: 'Roupa leve e ajustada para total liberdade de braços durante a costura rápida.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas Cirúrgicas de Precisão para Fios',
        description: 'Luvas de couro fino que evitam que os fios metálicos cortem os dedos do usuário.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Caneleiras Listradas da Névoa de Sangue',
        description: 'Calçado alto característico dos carrascos de Kirigakure.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Desfiado da Névoa Silenciosa',
        description: 'Capa escura e úmida que dissipa rastros de sangue em ambientes com neblina.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Carretel Dorsal de Fios da Nuibari',
        description: 'Tambor mecânico que libera quilômetros de fio metálico sem embaraçar.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Gargantilha de Agulhas de Acupuntura de Kiri',
        description: 'Talismã com pontas cirúrgicas que aumentam o dano crítico em pontos vitais.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Máscara Branca de Caçador ANBU de Kushimaru',
        description: 'Máscara de porcelana desfigurada com fendas oculares estreitas e frias.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Feixe de Agulhas Longas de Perfuração Nuibari',
        description: 'Projéteis pontiagudos de alta penetração que prendem o inimigo ao solo.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lâmina Costuradora Nuibari (Espada Lendária)',
        description: 'Espada longa fina em formato de agulha que perfura e cose inimigos em fila.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 17. Jinpachi Munashi
  17: {
    bossId: 17,
    bossName: 'Jinpachi Munashi',
    rarity: 'VERY_RARE',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_shibuki_blast_cloth',
      name: 'Rolo de Selos Ignífugos da Shibuki',
      description: 'Tecido especial resistente a temperaturas extremas que armazena explosões.',
      iconName: 'Flame',
      baseGoldValue: 12500,
    },
    items: {
      HELMET: {
        name: 'Bandagens Cranianas com Protetor de Kiri',
        description: 'Faixas rústicas que envolvem a cabeça de Jinpachi sobre o tapa-olho.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura Blindada Anti-Detonação de Shibuki',
        description: 'Colete reforçado com placas de aço temperado contra o recuo de explosões.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas de Couro Ignífugo Resistente a Fogo',
        description: 'Luvas grossas que aguentam o manuseio direto do cilindro detonador.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas com Travas de Solo de Jinpachi',
        description: 'Calçado com solado metálico para resistir à onda de choque frontal.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Sobretudo Queimado pelos Selos da Shibuki',
        description: 'Manto chamuscado por milhares de explosões nas batalhas dos Sete Espadachins.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Tambor Dorsal dos Rolos Contínuos de Detonação',
        description: 'Estrutura mecânica dorsal que recarrega o rolo da Espada Explosiva.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pavio Sagrado da Névoa de Sangue em Pingente',
        description: 'Talismã com pólvora condensada que potencializa o multiplicador de clique.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Tapa-Olho de Batalha e Viseira de Jinpachi',
        description: 'Proteção ocular de couro que mantém a visão focada em meio a fumaça e faíscas.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Bombas Esféricas de Fragmentação de Shibuki',
        description: 'Cargas arremessáveis que limpam o campo de batalha com detonações em raio.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espada Explosiva Shibuki (Espada Lendária)',
        description: 'Lâmina colossal combinada a um rolo de incontáveis selos detonadores.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },

  // 18. Chiyo Reanimada
  18: {
    bossId: 18,
    bossName: 'Chiyo Reanimada',
    rarity: 'VERY_RARE',
    primaryElement: 'WIND',
    material: {
      id: 'mat_monzaemon_white_silk',
      name: 'Seda Branca das Dez Marionetes de Monzaemon',
      description: 'Tecido sagrado ancestral que envolve a coleção das dez maiores obras de teatro.',
      iconName: 'Boxes',
      baseGoldValue: 15500,
    },
    items: {
      HELMET: {
        name: 'Lenço Branco Cerimonial da Anciã Chiyo',
        description: 'Tecido tradicional de Sunagakure usado pela veterana nas Três Grandes Guerras.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Túnica Tradicional dos Anciãos de Suna',
        description: 'Robe solto de alta costura com bolsos secretos para pergaminhos de marionete.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas com Escudo de Chakra Integrado (Chiyo)',
        description: 'Dispositivo mecânico no antebraço que projeta uma barreira translúcida.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias Leves de Mestre Marionetista',
        description: 'Calçado suave que permite recuo veloz enquanto controla dez alvos simultâneos.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Branco da Coleção de Monzaemon',
        description: 'Capa alva imaculada que reverbera a maestria dos jutsus de marionete de Suna.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Mochila dos Rolos de Invocação das Dez Obras',
        description: 'Bolsa de pergaminhos com os selos de liberação dos dez bonecos brancos.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Amuleto Secreto com Antídotos das Três Guerras',
        description: 'Frasco ancestral com neutralizadores desenvolvidos contra os venenos de Tsunade.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Véu Espiritual de Proteção da Marionete Mãe',
        description: 'Proteção de chakra que dissipa o impacto de projéteis e ninjutsus diretos.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Projéteis Mecânicos Ocultos das Marionetes',
        description: 'Feixes de shurikens e bombas de fumaça disparadas pelo exército branco.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lâminas Gêmeas de Chakra do Escudo Protetor',
        description: 'Garras curvas acopladas ao braço protético de Chiyo para defesa próxima.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 19. Pakura da Areia
  19: {
    bossId: 19,
    bossName: 'Pakura da Areia',
    rarity: 'EPIC',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_shakuton_vapor_ash',
      name: 'Cinzas de Evaporação Térmica de Shakuton',
      description: 'Pó mineral residual resultante da dessecação instantânea de matéria orgânica.',
      iconName: 'Flame',
      baseGoldValue: 19000,
    },
    items: {
      HELMET: {
        name: 'Faixa de Cabelo em Coque Duplo de Pakura',
        description: 'Adorno tradicional com o símbolo da Folha/Areia ajustado ao penteado de batalha.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Traje de Batalha com Costas Descobertas de Pakura',
        description: 'Vestimenta de combate que otimiza a emissão de calor térmico pelos poros.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Braçadeiras Incandescentes de Shakuton',
        description: 'Manoplas térmicas que irradiam calor capaz de evaporar armas de ferro.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias Térmicas de Areia Escaldante',
        description: 'Calçado com isolamento de quartzo imune a chamas e vapor superaquecido.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Alaranjado da Heroína do Shakuton',
        description: 'Capa leve que ondeia como chamas vivas ao redor do corpo de Pakura.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Bolsa de Concentração Térmica Solar',
        description: 'Compartimento dorsal que armazena núcleos incandescentes de Shakuton.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Amuleto de Brasas Eternas de Sunagakure',
        description: 'Gema solar que brilha continuamente com a fúria da heroína traída.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Véu de Miragem Térmica Ondulante',
        description: 'Onda de ar aquecido que distorce a localização exata de Pakura para o adversário.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Orbes Incandescentes de Dessecação (Shakuton)',
        description: 'Esferas solares flutuantes que vaporizam a umidade de quem tocarem.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lâmina de Calor Extremo de Pakura',
        description: 'Adaga envolta em labaredas translúcidas que cauteriza ferimentos ao cortar.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 20. Fū Yamanaka & Torune Aburame
  20: {
    bossId: 20,
    bossName: 'Fū Yamanaka & Torune Aburame',
    rarity: 'EPIC',
    material: {
      id: 'mat_rinkaichu_nest',
      name: 'Colônia Isolada de Nano-Insetos Rinkaichū',
      description: 'Cápsula selada com os ácaros venenosos microscópicos de Torune Aburame.',
      iconName: 'Skull',
      baseGoldValue: 23000,
    },
    items: {
      HELMET: {
        name: 'Capuz Negro de Operações Clandestinas da Raiz',
        description: 'Capuz sem insígnias visíveis que oculta feições e cabelos dos agentes.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Colete Tático Escuro da Fundação ANBU Raiz',
        description: 'Armadura reforçada com placas de titânio negro sem qualquer registro oficial.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas Isolantes de Rinkaichū (Torune Aburame)',
        description: 'Luvas herméticas de borracha espessa que impedem o contágio dos nano-insetos.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas Silenciosas de Eliminação da Raiz',
        description: 'Calçado com solado de feltro especial para aproximar-se de alvos sem ser detectado.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto com Capuz de Alta Camuflagem da Raiz',
        description: 'Capa preta impenetrável à detecção de chakra de ninjas sensores comuns.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Gaiola Dorsal dos Nano-Insetos Venenosos',
        description: 'Compartimento biológico que alimenta e preserva as colônias de Rinkaichū.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Marca do Selo Lingual de Silenciamento de Danzō',
        description: 'Selo rúnico em miniatura que impede a revelação de segredos sob tortura.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Máscara Facial Metálica de Torune Aburame',
        description: 'Viseira que protege o rosto contra a névoa ácida e toxinas microscópicas.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Frascos Pressurizados com Nuvens de Rinkaichū',
        description: 'Granadas de vidro que estouram liberando nuvens letais de nano-insetos.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Tanto Tático da ANBU Raiz (Fū Yamanaka)',
        description: 'Espada curta de saque rápido usada para decapitações silenciosas.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 21. Guren
  21: {
    bossId: 21,
    bossName: 'Guren',
    rarity: 'EPIC',
    primaryElement: 'EARTH',
    material: {
      id: 'mat_shoton_crystal_lotus',
      name: 'Camélia Cristalina Imortal de Shōton',
      description: 'Flor esculpida em cristal de jade puro que jamais perde seu brilho e dureza.',
      iconName: 'Sparkles',
      baseGoldValue: 28000,
    },
    items: {
      HELMET: {
        name: 'Tiara de Cristal de Jade Polido de Guren',
        description: 'Diadema translúcido que ressoa com a Liberação de Cristal.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Vestimenta Carmesim com Gola de Camélia',
        description: 'Robe escarlate elegante reforçado internamente com malha de cristal.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas Rígidas de Cristal Prismático',
        description: 'Braçadeiras minerais afiadas que bloqueiam katanas com facilidade.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sapatos Finos com Saltos de Cristal Puro',
        description: 'Calçado refinado com base mineral para passos firmes sobre superfícies cristalinas.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Carmesim com Padrão de Pétalas de Jade',
        description: 'Capa nobre que reflete a luz solar em clarões prismáticos cegantes.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Redoma Portátil da Camélia de Yūkimaru',
        description: 'Cápsula de vidro encantado que preserva a flor símbolo de seu laço.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pingente de Cristal de Memórias de Guren',
        description: 'Gema lapidada que protege contra ilusões e fortalece o chakra Doton.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira Refratária Prismática de Shōton',
        description: 'Lente de cristal que divide a visão em feixes geométricos precisos.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Shurikens Hexagonais de Cristal de Jade',
        description: 'Projéteis lapidados com seis pontas diamantinas de extrema precisão.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lâmina de Antebraço de Cristal de Jade (Guren)',
        description: 'Espada cristalina gerada diretamente sobre o punho para cortes cirúrgicos.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // =========================================================================
  // --- TIER 3: KAGE / LENDÁRIO (FASES 22 A 33) ---
  // =========================================================================

  // 22. Mifune
  22: {
    bossId: 22,
    bossName: 'Mifune',
    rarity: 'EPIC',
    material: {
      id: 'mat_iron_country_steel',
      name: 'Aço Nobre do País do Ferro (Kurosawa)',
      description: 'Lingote de metal temperado no topo das montanhas geladas pelos mestres ferreiros.',
      iconName: 'Shield',
      baseGoldValue: 35000,
    },
    items: {
      HELMET: {
        name: 'Elmo de Aço Samurai com Crista do País do Ferro',
        description: 'Capacete de guerra tradicional samurai com proteção nas têmporas e nuca.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura / Outfit Tradicional Samurai de Mifune',
        description: 'Armadura lamelar completa com placas articuladas de ferro sobrepostas.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas Samurais de Combate com Placas de Aço',
        description: 'Manoplas articuladas de precisão milimétrica para saque veloz Iaidō.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas de Batalha com Caneleiras de Ferro de Mifune',
        description: 'Calçado blindado com caneleiras rígidas para bloqueios com as pernas.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Capa Cerimonial do General dos Samurais',
        description: 'Manto azul-escuro com o brasão do País do Ferro sobre os ombros.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Mochila Tática de Bainhas Múltiplas de Mifune',
        description: 'Arranjo dorsal que acomoda katanas reservas e pedras de amolar.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Medalhão da Honra e Paz dos Samurais',
        description: 'Emblema concedido ao líder supremo que manteve a neutralidade nas guerras.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Respirador Metálico Anti-Veneno de Mifune',
        description: 'Máscara facial de aço com filtros que anula as toxinas de Hanzō.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Tanto de Arremesso Samurai de Aço Branco',
        description: 'Adagas pesadas perfeitamente balanceadas para arremessos em linha reta.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Katana Meitō Kurosawa (Mifune)',
        description: 'A lendária espada famosa pelo Corte Iai mais rápido do mundo shinobi.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 23. Shinnō
  23: {
    bossId: 23,
    bossName: 'Shinnō',
    rarity: 'EPIC',
    primaryElement: 'LIGHTNING',
    material: {
      id: 'mat_dark_chakra_stone',
      name: 'Fragmento do Reator de Chakra Escuro',
      description: 'Pedra negra condensada alimentada pelos pensamentos negativos das nações.',
      iconName: 'Zap',
      baseGoldValue: 42000,
    },
    items: {
      HELMET: {
        name: 'Faixa Rúnica Médica do País do Céu',
        description: 'Bandana inscrita com fórmulas de regeneração celular imediata.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Túnica Negra Energizada por Chakra Escuro',
        description: 'Traje que pulsa com filamentos roxos mantendo os músculos hipertrofiados.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas Cirúrgicas de Acupuntura de Chakra Negro',
        description: 'Luvas com canais condutores que injetam energia escura nos tenketsus.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Passadas Sísmicas dos Oito Portões Negros',
        description: 'Calçado reforçado para suportar o impacto da liberação do Portão da Morte.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Espetado da Mutação do Reibi',
        description: 'Capa sombria que ondeia com tentáculos fantasmagóricos de pura malícia.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Gerador Portátil de Chakra Negro Anima',
        description: 'Aparelho dorsal que canaliza a energia do monstro Zero-Caudas.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Amuleto com Coração Artificial do Reibi',
        description: 'Pingente orgânico que bombeia chakra escuro diretamente na corrente sanguínea.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Máscara Facial Metálica de Médico Cirurgião',
        description: 'Protetor facial que esconde o sorriso maníaco de Shinnō em combate.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Bisturis de Chakra Escuro de Alta Penetração',
        description: 'Projéteis cirúrgicos de energia negra que cortam canais de chakra.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Punho Colossal dos Oito Portões Internos (Shinnō)',
        description: 'Ataque corporal com o poder dos portões sem sofrer o colapso celular fatal.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 24. Rasa
  24: {
    bossId: 24,
    bossName: 'Rasa',
    rarity: 'EPIC',
    primaryElement: 'EARTH',
    material: {
      id: 'mat_sakin_gold_dust',
      name: 'Pó de Ouro Imantado de Rasa (Sakin)',
      description: 'Minério dourado pesadíssimo controlado pelo magnetismo do Quarto Kazekage.',
      iconName: 'Mountain',
      baseGoldValue: 50000,
    },
    items: {
      HELMET: {
        name: 'Chapéu Cerimonial Verde do Quarto Kazekage',
        description: 'O chapéu oficial de líder da Aldeia Oculta da Areia com o kanji Vento.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Traje de Batalha de Seda Nobre com Pó de Ouro',
        description: 'Vestimenta de alta linhagem entrelaçada com partículas densas de Sakin.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas com Anéis Eletromagnéticos de Sakin',
        description: 'Braçadeiras de ouro que modulam as ondas magnéticas do terreno.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas Revestidas com Areia Aurífera de Suna',
        description: 'Calçado sustentado por uma fina camada flutuante de partículas de ouro.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Kage com Bordados Dourados de Rasa',
        description: 'Capa cerimonial pesada que reflete o sol escaldante do deserto.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Urna Dorsal com Densas Ondas de Ouro',
        description: 'Recipiente gigante de transporte do pó de ouro utilizado contra o Shukaku.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Selo do Aprisionamento do Shukaku de Ouro',
        description: 'Pingente com a fórmula ancestral de contenção do Bijuu de Uma Cauda.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Véu de Areia Dourada Refletora de Rasa',
        description: 'Barreira magnética ao redor da face que cega oponentes com reflexos de luz.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Agulhas e Esferas Massivas de Pó de Ouro',
        description: 'Munição pesada de ouro que esmaga oponentes pelo peso colossal.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lança Magnética Densa de Sakin de Rasa',
        description: 'Arma perfurante compactada com ouro puro mais duro que o titânio.',
        iconName: 'Swords',
        weaponCategory: 'SPEAR',
      },
    },
  },

  // 25. Hiruko
  25: {
    bossId: 25,
    bossName: 'Hiruko',
    rarity: 'LEGENDARY',
    primaryElement: 'LIGHTNING',
    material: {
      id: 'mat_chimera_blood_crystal',
      name: 'Cristal Quimérico das Quatro Linhagens',
      description: 'Amálgama genético resultante da fusão dos jutsus de Meiton, Kōton, Jinton e Ranton.',
      iconName: 'Activity',
      baseGoldValue: 60000,
    },
    items: {
      HELMET: {
        name: 'Ataduras de Reconstrução Facial de Hiruko',
        description: 'Bandagens rúnicas que cobrem as cicatrizes da mutação quimérica.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura Corporal com Pele de Aço (Kōton)',
        description: 'Revestimento dérmico metálico invulnerável a golpes convencionais de lâmina.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas de Absorção de Jutsus (Meiton)',
        description: 'Marcação na palma da mão que suga e converte ninjutsus em energia própria.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Passadas Hipersônicas de Rapidez (Jinton)',
        description: 'Calçado com impulso de aceleração espacial que rompe a barreira do som.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto com Fita Vermelha de Quimera de Hiruko',
        description: 'Capa escura cerimonial dos renegados que desafiaram a Vontade do Fogo.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Casulo de Incubação do Jutsu Quimera Proibido',
        description: 'Estrutura dorsal selada onde os corpos dos ninjas com Kekkei Genkai eram absorvidos.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pacto das Quatro Kekkei Genkai em Pingente',
        description: 'Medalhão com quatro gemas coloridas representando os poderes assimilados.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Máscara de Sutura Facial Quimérica de Hiruko',
        description: 'Proteção metálica com fendas estreitas que intimida e oculta a deformação.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Dragões Flutuantes de Tempestade (Ranton)',
        description: 'Feixes de energia luminosa e relâmpago que perseguem o alvo com precisão.',
        iconName: 'Crosshair',
        weaponCategory: 'BOW',
      },
      WEAPON_MELEE: {
        name: 'Lâmina de Aço Negro Indestrutível de Kōton',
        description: 'Espada pesada moldada pelo próprio metal endurecido do corpo de Hiruko.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 26. Danzō Shimura
  26: {
    bossId: 26,
    bossName: 'Danzō Shimura',
    rarity: 'LEGENDARY',
    primaryElement: 'WIND',
    material: {
      id: 'mat_hashirama_implant_cell',
      name: 'Célula de Hashirama do Braço de Danzō',
      description: 'Tecido vivo do Primeiro Hokage que fornece vitalidade anormal e suporte aos Sharingans.',
      iconName: 'Leaf',
      baseGoldValue: 72000,
    },
    items: {
      HELMET: {
        name: 'Ataduras Ocultando o Sharingan de Shisui',
        description: 'Faixa branca que cobre o olho direito com o genjutsu supremo Kotoamatsukami.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Robe Escuro com Braço Selado de Danzō',
        description: 'Manto que oculta o braço enxertado com dez Sharingans e células de Hashirama.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Chapas de Contenção de Madeira no Pulso',
        description: 'Travas de metal reforçado para controlar o crescimento desgovernado do Mokuton.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias Rígidas de Comandante da Raiz',
        description: 'Calçado austero de líder militar que pisou sobre as sombras de Konoha.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Sobretudo Monocromático das Trevas de Konoha',
        description: 'Capa cinzenta pesada que representa a escuridão necessária para nutrir a Folha.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Pergaminho Proibido do Selo Reverso dos Quatro Símbolos',
        description: 'Mochila com os selos de sangue que ativam a autodestruição em caso de morte.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Braçadeira dos Dez Sharingans de Danzō',
        description: 'Talismã com os olhos roubados que permitem reiniciar a realidade via Izanagi.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Filtro Espiritual com Vórtice de Vento do Baku',
        description: 'Viseira que canaliza o sopro de vácuo da quimera comedora de pesadelos.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Shurikens Infladas com Lâminas de Vácuo (Fūton)',
        description: 'Projéteis giratórios cortantes imbuídos com vento comprimido mortal.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espada Curta da Vontade Obscura de Danzō',
        description: 'Tanto militar forjado para execuções sumárias em nome da segurança da vila.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 27. Muku / Demônio Satori
  27: {
    bossId: 27,
    bossName: 'Muku / Demônio Satori',
    rarity: 'LEGENDARY',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_satori_demon_feather',
      name: 'Pena Negra da Caixa da Iluminação Suprema',
      description: 'Pluma escura emanando o terror da relíquia ancestral Gokuraku Kōbako.',
      iconName: 'Feather',
      baseGoldValue: 85000,
    },
    items: {
      HELMET: {
        name: 'Chifres Carmesins do Demônio Ancestral Satori',
        description: 'Galhadas ósseas vermelhas que captam a intenção assassina no ar.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura de Penas Negras da Prisão de Sangue',
        description: 'Peitoral demoníaco impenetrável a golpes manuais sem energia natural (Senjutsu).',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Garras Demoníacas Condutoras de Terror',
        description: 'Garras monstruosas que dilaceram a carne e impõem pesadelos ao contato.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Patas Aladas de Esquiva Empática Inviolável',
        description: 'Membros inferiores alados que desviam de qualquer golpe prevendo o medo do agressor.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Asas Gigantescas de Penas de Sangue de Satori',
        description: 'Envergadura monstruosa que projeta tufões de vento escuro pelo campo de batalha.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Miniatura da Caixa da Iluminação Suprema (Gokuraku)',
        description: 'Relíquia cúbica de selamento que devora almas e gera monstros do medo.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Fórmula do Selo da Prisão de Fogo (Tenrō)',
        description: 'Talismã que incinera o chakra do prisioneiro caso tente moldar jutsus.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Mandíbula Monstruosa Voraz de Satori',
        description: 'Focinho de pesadelo que devora projéteis elementais disparados contra ele.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Esferas Negras Condutoras de Fogo Tenrō',
        description: 'Orbes incandescentes que aprisionam os canais de chakra da vítima em chamas.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lâmina de Vento e Penas Sombrias de Satori',
        description: 'Espada cortante gerada a partir da condensação das asas do demônio.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 28. Mukade
  28: {
    bossId: 28,
    bossName: 'Mukade',
    rarity: 'LEGENDARY',
    primaryElement: 'EARTH',
    material: {
      id: 'mat_ryumyaku_crystal_core',
      name: 'Núcleo das Linhas Ley de Ryūmyaku (Rōran)',
      description: 'Cristal pulsante conectado à fonte inesgotável de chakra temporal da cidade perdida.',
      iconName: 'Orbit',
      baseGoldValue: 100000,
    },
    items: {
      HELMET: {
        name: 'Coroa Mecânica de Controle de Ryūmyaku',
        description: 'Diadema metálico que sincroniza a mente de Mukade com a torre de Rōran.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Carapaça Blindada de Titânio de Centopeia',
        description: 'Armadura segmentada colossal que se regenera consumindo energia da Veia do Dragão.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas Hidráulicas de Reparo Instantâneo',
        description: 'Mecanismos que reconstroem peças e lâminas danificadas em segundos.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Esteiras Mecânicas de Deslocamento de Rōran',
        description: 'Locomoção blindada por esteiras que esmaga construções e muralhas.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Vapores Roxos de Ryūmyaku',
        description: 'Cortina de chakra denso que ferve o ar ao redor do colosso mecânico.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Reator Infinito da Veia de Dragão de Rōran',
        description: 'Gerador colossal acoplado às costas que garante suprimento inesgotável.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Cristal de Ressonância da Rainha Sara',
        description: 'Gema roubada da linhagem real que desativa travas de segurança dos mecanismos.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Face Articulada de Marionete Imperial Gigante',
        description: 'Máscara colossal com canhões ocultos que disparam raios purpúreos.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Bateria de Mísseis e Kunais de Ryūmyaku',
        description: 'Sistemas de artilharia pesada que bombardeiam o campo em salva contínua.',
        iconName: 'Crosshair',
        weaponCategory: 'BOW',
      },
      WEAPON_MELEE: {
        name: 'Pinças Gigantescas de Centopeia de Titânio',
        description: 'Lâminas monumentais capazes de partir edifícios de pedra ao meio.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },

  // 29. Kinkaku & Ginkaku
  29: {
    bossId: 29,
    bossName: 'Kinkaku & Ginkaku',
    rarity: 'LEGENDARY',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_sage_tools_relic_shard',
      name: 'Fragmento das Ferramentas Sagradas do Rikudō',
      description: 'Pedaço de liga divina deixada pelo Sábio dos Seis Caminhos.',
      iconName: 'Sun',
      baseGoldValue: 120000,
    },
    items: {
      HELMET: {
        name: 'Chifres Naturais dos Demônios de Ouro e Prata',
        description: 'Par de chifres maciços herdados da linhagem ancestral de Kumogakure.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura Ancestral dos Irmãos Ouro e Prata',
        description: 'Peitoral blindado decorado com dragões mitológicos da Nuvem antiga.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Braceletes Sagrados das Ferramentas do Rikudō',
        description: 'Manoplas pesadas preparadas para canalizar o chakra absurdo das relíquias.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas Titânicas Imbuídas com Manto da Raposa',
        description: 'Calçado banhado no chakra da Kyūbi que queima o chão a cada passo.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Quatro Caudas da Raposa Demoníaca',
        description: 'Capa de energia borbulhante vermelha que anula ataques físicos e corta o ar.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Cabaça Carmesim Sagrada Benihisago',
        description: 'A relíquia divina que suga e aprisiona as almas daqueles que pronunciam a palavra tabu.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Corda da Clareza Espiritual Kōkinjō',
        description: 'Corda divina que extrai a palavra-alma do adversário ao menor contato físico.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Bigodes Marcados da Raposa Demônio',
        description: 'Traços selvagens nas bochechas que ampliam o instinto predatório do combatente.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Leque dos Cinco Elementos Bashōsen (Kinkaku)',
        description: 'O lendário leque que conjura rajadas devastadoras de qualquer um dos cinco elementos.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espada das Sete Estrelas Shichiseiken (Ginkaku)',
        description: 'A espada larga sagrada que amaldiçoa e grava a palavra proibida na Benihisago.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 30. Terceiro Raikage
  30: {
    bossId: 30,
    bossName: 'Terceiro Raikage',
    rarity: 'LEGENDARY',
    primaryElement: 'LIGHTNING',
    material: {
      id: 'mat_black_lightning_essence',
      name: 'Faísca Imortal da Armadura Raiton do Raikage',
      description: 'Chakra elétrico condensado de altíssima frequência que jamais se extingue.',
      iconName: 'Zap',
      baseGoldValue: 145000,
    },
    items: {
      HELMET: {
        name: 'Faixa Frontal de Kumo com Juba Selvagem',
        description: 'Bandana de Kumogakure que segura os cabelos longos e imponentes do Raikage.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Colete Militar com a Cicatriz da Lança Elétrica',
        description: 'O lendário peitoral que sobreviveu à luta solitária contra 10.000 ninjas.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas dos Quatro Dedos da Lança Raiton (Nukite)',
        description: 'Braçadeiras que concentram relâmpago azul na ponta dos dedos em uma ponta impenetrável.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas de Aço Condutoras de Relâmpago Puro',
        description: 'Calçado blindado que dispara faíscas que quebram a barreira do som no arranque.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Raikage com Chamas Elétricas Azuis',
        description: 'Capa oficial do líder de Kumogakure envolta na Armadura Raiton impenetrável.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Urna de Âmbar para Selamento do Hachibi (Kohaku)',
        description: 'Recipiente sagrado capaz de trancar o Oito-Caudas com uma única palavra.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Talismã do Relâmpago Negro Sagrado (Kumo)',
        description: 'Medalhão transmitido apenas aos guerreiros que dominaram o Kuroi Raiton.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Respirador Raiton de Alta Voltagem',
        description: 'Viseira que filtra o ar ionizado gerado pelas correntes elétricas no peito.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Lanças Elétricas de Arremesso Raiton',
        description: 'Dardos de puro raio que perfuram montanhas em linha reta instantaneamente.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lança Celestial dos Quatro Dedos (Jigokuzuki)',
        description: 'A lança corporal suprema conhecida como o ataque mais perfurante do mundo shinobi.',
        iconName: 'Swords',
        weaponCategory: 'SPEAR',
      },
    },
  },

  // 31. Muu
  31: {
    bossId: 31,
    bossName: 'Muu',
    rarity: 'LEGENDARY',
    primaryElement: 'EARTH',
    material: {
      id: 'mat_jinton_atomic_dust',
      name: 'Partícula Cúbica de Desintegração de Jinton',
      description: 'Elemento Poeira puro resultante da combinação de Fogo, Vento e Terra.',
      iconName: 'Layers',
      baseGoldValue: 175000,
    },
    items: {
      HELMET: {
        name: 'Bandagens Totais de Cabeça do Segundo Tsuchikage',
        description: 'Enfaixamento completo que esconde as queimaduras de batalha de Muu.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Traje de Nulificação Total de Chakra de Muu',
        description: 'Túnica de múmia que dissipa qualquer assinatura sensorial de energia.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas com Núcleos Cúbicos de Poeira (Jinton)',
        description: 'Luvas finas que moldam cones e prismas de desintegração atômica instantânea.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Passos Flutuantes da Gravidade Reduzida de Muu',
        description: 'Calçado ultraleve que permite planar sobre o solo sem deixar pegadas.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Translúcido da Invisibilidade Total (Mujin)',
        description: 'Capa que apaga a forma física, cheiro e chakra do usuário no ar.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Pergaminhos Antigos da Criação do Jinton',
        description: 'Mochila com as fórmulas originais da Kekkei Tōta desenvolvidas por Muu.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Amuleto com a Primeira Partícula de Poeira',
        description: 'Pingente com um prisma geométrico transparente que desafia as leis físicas.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Faixas Faciais Seladoras de Presença de Muu',
        description: 'Bandagens que bloqueiam leituras de Byakugan e sensores sensoriais experientes.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Dardos Tridimensionais de Desintegração Atômica',
        description: 'Projéteis cúbicos de luz que reduzem a matéria celular a poeira pura.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espadas Gêmeas Cruzadas nas Costas de Muu',
        description: 'Par de lâminas leves e afiadíssimas que Muu empunha com maestria silenciosa.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 32. Hanzō da Salamandra
  32: {
    bossId: 32,
    bossName: 'Hanzō da Salamandra',
    rarity: 'LEGENDARY',
    primaryElement: 'WATER',
    material: {
      id: 'mat_ibuse_black_venom',
      name: 'Vesícula de Veneno Negro da Salamandra Ibuse',
      description: 'Glândula corrosiva de toxina paralisante mortal implantada no flanco de Hanzō.',
      iconName: 'Skull',
      baseGoldValue: 210000,
    },
    items: {
      HELMET: {
        name: 'Capacete com Crista Blindada de Amegakure (Hanzō)',
        description: 'Elmo de aço curvado que canaliza o fluxo de ar para os filtros do respirador.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Armadura Completa de Batalha com Selo do Veneno',
        description: 'Armadura de placas cinzentas resistentes a ácido e cortes de espada.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas Químicas Resistentes a Toxinas Mortais',
        description: 'Luvas seladas com membranas especiais para manusear as glândulas venenosas.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Botas com Esporões Anfíbios de Amegakure',
        description: 'Calçado com garras inferiores para firmeza sobre o dorso viscoso de Ibuse.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Chuva de Amegakure Resistente a Ácido',
        description: 'Capa preta impermeável que protege Hanzō da chuva constante de sua aldeia.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Bolsa de Selos Explosivos Subaquáticos de Hanzō',
        description: 'Mochila com detonadores marinhos acionados por correntes de água.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Bolsa Hermética com a Glândula de Ibuse',
        description: 'Talismã com a toxina lendária que derrotou os Três Sannin lendários.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Respirador Químico Lendário de Hanzō da Salamandra',
        description: 'A icônica máscara de ferro que impede que seu próprio hálito venenoso mate quem o cerca.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Foice com Corrente Kusarigama de Amegakure',
        description: 'Arma com longo alcance de arremesso que laça e dilacera membros à distância.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lâmina Kusarigama Envenenada de Hanzō',
        description: 'A foice afiada banhada na toxina negra da salamandra que nunca conheceu antídoto.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 33. Gengetsu Hōzuki
  33: {
    bossId: 33,
    bossName: 'Gengetsu Hōzuki',
    rarity: 'LEGENDARY',
    primaryElement: 'WATER',
    material: {
      id: 'mat_giant_clam_pearl',
      name: 'Pérola de Miragem do Marisco Gigante (Ōhamaguri)',
      description: 'Orbe nacarado místico que projeta ilusões hiper-realistas de névoa no horizonte.',
      iconName: 'Sparkles',
      baseGoldValue: 250000,
    },
    items: {
      HELMET: {
        name: 'Protetor de Kirigakure com Gola Alta de Seda',
        description: 'Bandana frontal ajustada sobre a gola exagerada e estilosa do Segundo Mizukage.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Sobretudo Elegante Listrado do Segundo Mizukage',
        description: 'Robe de alta linhagem do clã Hōzuki fluido e permeável ao jutsu de hidratação.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Luvas com Canais de Tiro do Revólver d\'Água',
        description: 'Luvas finas com aberturas nos indicadores para disparo do Mizudeppō.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sapatos Refinados com Sola de Óleo Suave',
        description: 'Calçado nobre que desliza com perfeição sobre superfícies aquosas e oleosas.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Capa de Névoa Miraculosa do Marisco Gigante',
        description: 'Manto etéreo que faz o corpo de Gengetsu parecer um reflexo inalcançável.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Cabaça Portátil com Mistura de Óleo e Vapor',
        description: 'Recipiente dorsal que abastece o clone expansivo infinito Jōki Boi.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Frasco Amuleto com Gotas de Miragem de Kiri',
        description: 'Pingente com essência do marisco que confunde as leituras dos olhos adversários.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Miragem Espectral do Rosto de Gengetsu',
        description: 'Reflexo de névoa que faz os ataques do adversário passarem pelo vazio.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Balas de Pressão Hidráulica do Revólver d\'Água',
        description: 'Gotas de água disparadas com a velocidade e impacto de projéteis de canhão.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Clone de Óleo Explosivo (Jōki Boi em Miniatura)',
        description: 'Lâmina de óleo líquido superaquecido que corta e explode ciclicamente.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // =========================================================================
  // --- TIER 4: CONTINENTAL / DIVINO (FASES 34 A 40) ---
  // =========================================================================

  // 34. Mōryō
  34: {
    bossId: 34,
    bossName: 'Mōryō',
    rarity: 'MYTHIC',
    material: {
      id: 'mat_moryo_dark_dragon_core',
      name: 'Coração de Chakra Ancestral de Mōryō',
      description: 'Núcleo corrompido do demônio imortal que comanda legiões espectrais de pedra.',
      iconName: 'Ghost',
      baseGoldValue: 350000,
    },
    items: {
      HELMET: {
        name: 'Coroa Pétrea da Entidade Sombria de Mōryō',
        description: 'Chifres de pedra negra que canalizam a energia das serpentes espectrais.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Armadura Espectral do Exército de Terracota',
        description: 'Peitoral mineral esculpido nos tempos primordiais que se reconstrói sozinho.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Tentáculos de Chakra Escuro em Forma de Manoplas',
        description: 'Chamas roxas sólidas que envolvem os punhos e drenam vitalidade ao contato.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Passadas Abissais de Terremoto Continental',
        description: 'Grevas colossais que estilhaçam o solo gerando fendas de lava negra.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto das Oito Serpentes Negras de Mōryō',
        description: 'Capa viva feita de dragões de sombra que atacam agressores pelas costas.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Sarcófago de Selamento da Sacerdotisa Shion',
        description: 'Urna mística com as campânulas de purificação e sino sagrado de Miroku.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Sino Sagrado de Purificação Ancestral',
        description: 'O sino mágico que ressoa com a luz capaz de queimar as trevas de Mōryō.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira Espectral dos Olhos de Chama Roxa',
        description: 'Fenda de fogo sombrio que enxerga as almas dos seres vivos a quilômetros.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Projéteis Serpentinos de Chama Sombria de Mōryō',
        description: 'Rajadas em forma de serpentes que devoram o chakra de quem atingem.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Lança das Trevas Purificadas de Mōryō',
        description: 'Arma colossal forjada na fornalha do vulcão sagrado pelo demônio imortal.',
        iconName: 'Swords',
        weaponCategory: 'SPEAR',
      },
    },
  },

  // 35. Shin Uchiha
  35: {
    bossId: 35,
    bossName: 'Shin Uchiha',
    rarity: 'MYTHIC',
    material: {
      id: 'mat_shin_cloned_mangekyo',
      name: 'Olho Mangekyō Sharingan Clonado de Shin',
      description: 'Globo ocular geneticamente replicado com o padrão de três pás telecinéticas.',
      iconName: 'Eye',
      baseGoldValue: 500000,
    },
    items: {
      HELMET: {
        name: 'Coroa Craniana de Sharingans Implantados de Shin',
        description: 'Topo da cabeça com dezenas de olhos ativos conectados à visão periférica total.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Robe Negro da Reencarnação da Akatsuki de Shin',
        description: 'Vestimenta escura com gola alta inspirada no fanatismo por Itachi Uchiha.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas com Selos Telecinéticos de Condução',
        description: 'Luvas que marcam qualquer arma de metal com a fórmula de manipulação mental.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Calçado Tático Leve de Teleporte Espacial',
        description: 'Sandálias pretas preparadas para saltos rápidos coordenados com a criatura ocular.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Capa com Nuvens Vermelhas da Nova Akatsuki',
        description: 'Manto clássico dos criminosos mais perigosos do mundo, reinventado por Shin.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Câmara Portátil de Clonagem de Tecido Uchiha',
        description: 'Mochila com cilindros de preservação de clones e órgãos de reposição imediata.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Cordão Genético com Mangekyōs de Shin',
        description: 'Amuleto que amplifica o raio de ação da telecinese sobre armas metálicas.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Criatura Espiã de Olho Único Telecinético',
        description: 'A pequena besta ocular conectada que permite teletransportar lâminas e alvos.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Nuvem de Bisturis Voadores Telecinéticos de Shin',
        description: 'Centenas de pequenas lâminas cirúrgicas manipuladas pelo pensamento.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espada Circular Telecinética de Shin Uchiha',
        description: 'Arma formada por lâminas unidas em anel que giram a velocidades ultrasônicas.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 36. Menma Uzumaki
  36: {
    bossId: 36,
    bossName: 'Menma Uzumaki',
    rarity: 'MYTHIC',
    primaryElement: 'WIND',
    material: {
      id: 'mat_black_kurama_fur',
      name: 'Pelugem Negra da Raposa Demônio das Sombras',
      description: 'Chakra condensado da Kurama Negra do Mundo do Tsukuyomi Limitado.',
      iconName: 'Flame',
      baseGoldValue: 750000,
    },
    items: {
      HELMET: {
        name: 'Cabelos Negros Espetados com Bandana de Konoha Negra',
        description: 'Protetor escuro sobre a testa do reflexo corrompido de Naruto Uzumaki.',
        iconName: 'Shield',
      },
      CHESTPLATE: {
        name: 'Traje Ninja das Sombras do Mundo do Espelho',
        description: 'Colete negro com calças escuras que absorvem a luz de jutsus convencionais.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Garras de Chakra da Kurama Negra de Menma',
        description: 'Manoplas carmesins sombrias que dilaceram barreiras com a força das nove caudas.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Sandálias Negras do Dai Rasenringu',
        description: 'Calçado com solado reforçado para resistir ao vácuo dos anéis gravitacionais.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Carmesim Escuro com Chamas Negras',
        description: 'Capa espetacular que queima continuamente com a energia do ódio espelhado.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Pergaminho da Lua Vermelha de Menma (Tsuki no Me)',
        description: 'Mochila com a fórmula de selamento que destruiu a vila de Konoha no filme.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Amuleto das Nove Bestas Mascaradas (Kitsune)',
        description: 'Pingente com a essência das nove invocações divinas comandadas por Menma.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Máscara de Raposa Kitsune Negra de Menma',
        description: 'A clássica máscara de porcelana com detalhes vermelhos e olhos vazios.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Anéis Gravitacionais Menores de Rasenringu',
        description: 'Discos pretos de gravidade colapsante que atraem e pulverizam oponentes.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Esfera Espiral Negra Colapsante (Dai Rasenringu)',
        description: 'O jutsu devastador que obliterou a vila da Folha com um único impacto.',
        iconName: 'Swords',
        weaponCategory: 'BLADE',
      },
    },
  },

  // 37. Toneri Otsutsuki
  37: {
    bossId: 37,
    bossName: 'Toneri Otsutsuki',
    rarity: 'DIVINE',
    primaryElement: 'WIND',
    material: {
      id: 'mat_tenseigan_lunar_jewel',
      name: 'Joia de Chakra do Tenseigan Supremo',
      description: 'Gema ciano cristalina que brilha com o poder de cortar a Lua ao meio.',
      iconName: 'Moon',
      baseGoldValue: 1200000,
    },
    items: {
      HELMET: {
        name: 'Tiara Celestial com Magatamas Lunares (Toneri)',
        description: 'Diadema divino que flutua sobre a fronte do herdeiro de Hamura Otsutsuki.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Robe Cerimonial Branco Otsutsuki com Magatamas',
        description: 'Túnica pura com gola alta e símbolos dos Seis Caminhos nas costas.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas de Chakra Ciano do Modo Tenseigan',
        description: 'Manoplas etéreas envoltas em chamas de chakra lunar divino.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Calçado Flutuante da Cidadela da Lua',
        description: 'Botas celestiais que não tocam o solo e permitem levitação orbital livre.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto de Chakra Ciano do Modo Tenseigan',
        description: 'A aura lendária que transforma Toneri em um semideus capaz de mover corpos celestes.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Altar de Contenção de Milhares de Byakugans',
        description: 'Orbe monumental que concentra o poder combinado da linhagem lunar.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pacto Sacerdotal de Hamura Otsutsuki',
        description: 'Cordão com orbes de jade sagrada herdada diretamente dos deuses primordiais.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira Ocular Translúcida de Chakra Lunar',
        description: 'Proteção cósmica que substitui os olhos ausentes pela visão do Tenseigan.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Gudōdamas Lunares de Busca Infalível (Toneri)',
        description: 'Esferas da Busca da Verdade moldadas em projéteis de aniquilação total.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Espada Dourada de Reencarnação (Kinbō Tenseibaku)',
        description: 'A colossal lâmina de chakra dourado que partiu a Lua com um único golpe.',
        iconName: 'Swords',
        weaponCategory: 'SWORD',
      },
    },
  },

  // 38. Urashiki Otsutsuki
  38: {
    bossId: 38,
    bossName: 'Urashiki Otsutsuki',
    rarity: 'DIVINE',
    primaryElement: 'LIGHTNING',
    material: {
      id: 'mat_stolen_time_bead',
      name: 'Orbe de Linhas Temporais Roubadas de Urashiki',
      description: 'Conta de vidro etéreo contendo frações de segundos extraídas do fluxo do tempo.',
      iconName: 'Orbit',
      baseGoldValue: 2000000,
    },
    items: {
      HELMET: {
        name: 'Chifre Frontal Curvado do Clã Otsutsuki',
        description: 'Estrutura óssea nobre curvada para a frente característica de Urashiki.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Túnica Nobre Branca com Faixas de Kaguya',
        description: 'Vestimenta aristocrática extraterrestre que repele energia residual cósmica.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas com Garras de Chakra Vermelho',
        description: 'Manoplas afiadas que conduzem linhas de pesca de chakra condensado.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Calçado de Levitação Espaço-Temporal de Urashiki',
        description: 'Sapatos divinos que caminham pelas dobras dimensionais sem atrito.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Nobre Branco com Bordas Douradas',
        description: 'Capa dos patrulheiros estelares do clã Otsutsuki encarregados de colher frutos.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Cesto Dorsal de Pesca Celestial de Almas',
        description: 'Cesto vermelho encantado que armazena os jutsus roubados dos shinobis.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pingente com o Rinnegan Vermelho de Tomoe',
        description: 'Amuleto dimensional que ativa a translocação instantânea de Urashiki.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira do Rinnegan Dourado de Previsão Temporal',
        description: 'Olhos que enxergam alguns segundos no futuro antecipando qualquer ataque.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Fio e Anzol Vermelho Extrator de Jutsus',
        description: 'Linha de pesca luminosa capaz de fisgar e puxar o chakra do alvo de longe.',
        iconName: 'Crosshair',
        weaponCategory: 'BOW',
      },
      WEAPON_MELEE: {
        name: 'Vara de Pesca Celestial Indestrutível de Urashiki',
        description: 'Bastão flexível divino usado como lança e chicote de altíssima penetração.',
        iconName: 'Swords',
        weaponCategory: 'SPEAR',
      },
    },
  },

  // 39. Kinshiki Otsutsuki
  39: {
    bossId: 39,
    bossName: 'Kinshiki Otsutsuki',
    rarity: 'DIVINE',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_red_chakra_forged_core',
      name: 'Fragmento de Chakra Vermelho Forjado de Kinshiki',
      description: 'Metal de energia cristalizada rubra capaz de partir montanhas com a densidade.',
      iconName: 'Swords',
      baseGoldValue: 3500000,
    },
    items: {
      HELMET: {
        name: 'Chifre Frontal Titânico em Forma de Elmo',
        description: 'Chifre único maciço que cobre a fronte e protege a cabeça de golpes de Susanoo.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Armadura Blindada dos Deuses da Destruição Otsutsuki',
        description: 'Peitoral titânico com densidade estelar invulnerável a golpes comuns.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas de Titã com Forja de Energia Rubra',
        description: 'Punhos colossais capazes de materializar machados e alabardas em nanossegundos.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Passadas Sísmicas Destruidoras de Planetas',
        description: 'Grevas gigantescas que abrem crateras e despedaçam a crosta do solo.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Manto Rasgado das Batalhas Interdimensionais',
        description: 'Capa esfarrapada cinzenta que testemunhou a devoração de múltiplos mundos.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Forja Dorsal Instantânea de Armas Divinas',
        description: 'Aparelho de luz vermelha que gera armamentos pesados sem custo de tempo.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pílula de Chakra Vermelho Ancestral de Frutos',
        description: 'Comprimido divino de chakra concentrado que regenera ferimentos mortais.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Viseira Pétrea dos Deuses Otsutsuki de Batalha',
        description: 'Proteção facial angular que intimida exércitos inteiros com um olhar.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Alabardas e Lanças Arremessáveis de Energia Rubra',
        description: 'Armas pesadíssimas disparadas com a força de um cometa em queda.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Machado Colossal de Chakra Vermelho Divino (Kinshiki)',
        description: 'A monstruosa lâmina rubra de duas mãos que rivalizou com a espada de Sasuke.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },

  // 40. Isshiki Otsutsuki
  40: {
    bossId: 40,
    bossName: 'Isshiki Otsutsuki',
    rarity: 'ADM',
    primaryElement: 'FIRE',
    material: {
      id: 'mat_daikokuten_black_cube',
      name: 'Fragmento do Cubo Negro de Daikokuten',
      description: 'Monólito de compressão atemporal que bloqueia jutsus sensoriais e anula gravidade.',
      iconName: 'Boxes',
      baseGoldValue: 10000000,
    },
    items: {
      HELMET: {
        name: 'Coroa Cósmica com Chifre Espiral do Rei Otsutsuki',
        description: 'O chifre majestoso que envolve o topo da cabeça do líder supremo da organização Kara.',
        iconName: 'Crown',
      },
      CHESTPLATE: {
        name: 'Túnica Nobre Imperial do Patriarca Otsutsuki (Isshiki)',
        description: 'Traje de gala dos deuses cósmicos decorado com magatamas negras absolutas.',
        iconName: 'Shield',
      },
      GLOVES: {
        name: 'Manoplas com as Marcas de Sukunahikona',
        description: 'Luvas que encolhem qualquer matéria inanimada para dimensões subatômicas.',
        iconName: 'Hand',
      },
      BOOTS: {
        name: 'Calçado Celestial do Domínio Temporal Absoluto',
        description: 'Passos que não existem no espaço físico, superando a velocidade da luz do Baryon.',
        iconName: 'Footprints',
      },
      CLOAK: {
        name: 'Sobretudo Imperial Branco com Símbolos Cósmicos',
        description: 'A capa definitiva da realeza Otsutsuki que dissipa qualquer técnica ninjutsu.',
        iconName: 'Feather',
      },
      BACKPACK: {
        name: 'Fenda da Dimensão Atemporal de Daikokuten',
        description: 'Acesso instantâneo ao bolso dimensional onde o tempo não flui e objetos não envelhecem.',
        iconName: 'Briefcase',
      },
      NECKLACE: {
        name: 'Pingente da Árvore Divina Primordial do Cosmos',
        description: 'O relicário supremo que canaliza a energia de todos os mundos devorados pelo clã.',
        iconName: 'CircleDot',
      },
      MASK: {
        name: 'Olho Dharma Imperial de Oito Raios de Isshiki',
        description: 'O Dōjutsu lendário exclusivo de Isshiki que invoca e armazena matéria instantaneamente.',
        iconName: 'Eye',
      },
      WEAPON_RANGED: {
        name: 'Estacas Negras de Compressão Molecular Instantânea',
        description: 'Hastes que aumentam de tamanho instantaneamente dentro do corpo do oponente.',
        iconName: 'Disc',
        weaponCategory: 'SHURIKEN',
      },
      WEAPON_MELEE: {
        name: 'Cetro Monolítico de Daikokuten (Arma Absoluta ADM)',
        description: 'O cetro dos deuses soberanos que rege a matéria, gravidade e tempo do universo.',
        iconName: 'Swords',
        weaponCategory: 'HEAVY',
      },
    },
  },
};
