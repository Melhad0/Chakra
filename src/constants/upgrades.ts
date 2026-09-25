import { D } from '../engine/BigNumber';
import { TechniqueUpgrade, GeneratorMilestoneEffect } from '../types/upgrades';

export const GENERATOR_MILESTONE_LEVELS = [25, 50, 100, 200, 300, 500] as const;

/**
 * Retorna os bônus e insígnia de marco acumulados pelo nível de um gerador
 */
export function getGeneratorMilestoneEffects(level: number): GeneratorMilestoneEffect {
  let mult = D(1);
  let discount = 0;
  let clickRatio = 0;
  let tierName = 'Iniciado';
  let badgeColor = 'text-zinc-500 border-zinc-700/60 bg-zinc-800/40';
  let nextMilestoneLevel: number | null = 25;

  if (level >= 25) {
    mult = mult.mul(2);
    tierName = 'Bronze';
    badgeColor = 'text-amber-500 border-amber-700/60 bg-amber-950/40';
    nextMilestoneLevel = 50;
  }
  if (level >= 50) {
    mult = mult.mul(2);
    discount += 0.05;
    tierName = 'Prata';
    badgeColor = 'text-zinc-300 border-zinc-400/60 bg-zinc-800/50';
    nextMilestoneLevel = 100;
  }
  if (level >= 100) {
    mult = mult.mul(4);
    clickRatio += 0.002;
    tierName = 'Ouro';
    badgeColor = 'text-amber-300 border-amber-500/60 bg-amber-900/40';
    nextMilestoneLevel = 200;
  }
  if (level >= 200) {
    mult = mult.mul(8);
    tierName = 'Platina';
    badgeColor = 'text-cyan-300 border-cyan-500/60 bg-cyan-950/40';
    nextMilestoneLevel = 300;
  }
  if (level >= 300) {
    mult = mult.mul(16);
    tierName = 'Diamante';
    badgeColor = 'text-indigo-300 border-indigo-500/60 bg-indigo-950/40';
    nextMilestoneLevel = 500;
  }
  if (level >= 500) {
    mult = mult.mul(32);
    tierName = 'Rikudou';
    badgeColor = 'text-fuchsia-300 border-fuchsia-500/60 bg-fuchsia-950/40';
    nextMilestoneLevel = null;
  }

  return {
    cpsMultiplier: mult,
    costDiscount: discount,
    clickCpsRatio: clickRatio,
    tierName,
    badgeColor,
    nextMilestoneLevel,
  };
}

export const TECHNIQUE_UPGRADES: TechniqueUpgrade[] = [
  // =========================================================================
  // 1. TAIJUTSU & SELOS (CLIQUE ATIVO)
  // =========================================================================
  {
    id: 'leaf_hurricane',
    name: 'Furacão da Folha (Konoha Senpū)',
    category: 'taijutsu',
    description: 'Golpe rotacional veloz. Multiplica o poder de clique manual em +100%.',
    cost: D(1500),
    icon: 'zap',
    effectType: 'click_multiplier',
    multiplier: 2.0,
  },
  {
    id: 'bandana_genin',
    name: 'Bandana de Gennin Protetora',
    category: 'taijutsu',
    description: 'Símbolo de honra e firmeza. +50% de poder de clique manual.',
    cost: D(25000),
    icon: 'award',
    effectType: 'click_multiplier',
    multiplier: 1.5,
  },
  {
    id: 'lion_combo',
    name: 'Combo do Leão (Shishi Rendan)',
    category: 'taijutsu',
    description: 'Sequência aérea devastadora. Aumenta a chance de acerto crítico em +5%.',
    cost: D(180000),
    icon: 'crosshair',
    effectType: 'crit_chance',
    multiplier: 0.05,
  },
  {
    id: 'reaper_seal',
    name: 'Selo Ceifador da Morte (Shiki Fūjin)',
    category: 'taijutsu',
    description: 'Pacto proibido com o Shinigami. Converte +0.8% do CPS^0.65 direto para cada clique.',
    cost: D(3500000),
    icon: 'skull',
    effectType: 'click_cps_ratio',
    multiplier: 0.008,
  },
  {
    id: 'blade_storm',
    name: 'Tempestade de Lâminas Shinobi',
    category: 'taijutsu',
    description: 'Saraivada de armas cortantes. +30% de poder de clique manual.',
    cost: D(30000000),
    icon: 'swords',
    effectType: 'click_multiplier',
    multiplier: 1.3,
  },
  {
    id: 'rasengan_mastery',
    name: 'Mestria do Rasengan Esférico',
    category: 'taijutsu',
    description: 'Chakra condensado em rotação absoluta. Dobra o poder do clique manual (2x).',
    cost: D(90000000),
    icon: 'orbit',
    effectType: 'click_multiplier',
    multiplier: 2.0,
  },
  {
    id: 'morning_peacock',
    name: 'Pavão da Manhã (Asakujaku)',
    category: 'taijutsu',
    description: 'Punhos que incendeiam o atrito do ar. Triplica o poder do clique manual (3x).',
    cost: D(1500000000),
    icon: 'flame',
    effectType: 'click_multiplier',
    multiplier: 3.0,
  },
  {
    id: 'truth_seeking_orbs',
    name: 'Esferas da Busca da Verdade (Gudōdama)',
    category: 'taijutsu',
    description: 'Fluidez de todas as naturezas combinadas. Triplica o dano de clique manual.',
    cost: D(25000000000),
    icon: 'sparkles',
    effectType: 'click_multiplier',
    multiplier: 3.0,
  },
  {
    id: 'daytime_tiger',
    name: 'Tigre Diurno (Hirudora)',
    category: 'taijutsu',
    description: 'Pressão de ar condensada de alto impacto. Converte +1.0% do CPS^0.65 ao clique.',
    cost: D(75000000000),
    icon: 'target',
    effectType: 'click_cps_ratio',
    multiplier: 0.010,
  },
  {
    id: 'night_guy',
    name: 'Guy Noturno (Yagai Dragão Vermelho)',
    category: 'taijutsu',
    description: 'O ápice da juventude que distorce o espaço. Multiplica o multiplicador de crítico por 2.5x.',
    cost: D(5000000000000),
    icon: 'flame',
    effectType: 'crit_multiplier',
    multiplier: 2.5,
  },

  // =========================================================================
  // 2. NINJUTSU & INVOCAÇÃO (PRODUÇÃO PASSIVA / CPS)
  // =========================================================================
  {
    id: 'tree_climbing',
    name: 'Exercício de Escalada em Árvores',
    category: 'ninjutsu',
    description: 'Controle contínuo na sola dos pés. Estudantes da Academia produzem 2x CPS.',
    cost: D(1800),
    icon: 'users',
    effectType: 'generator_multiplier',
    multiplier: 2.0,
    targetGenerator: 'academy_student',
  },
  {
    id: 'shadow_clone_scroll',
    name: 'Pergaminho de Clones das Sombras',
    category: 'ninjutsu',
    description: 'Distribuição simétrica de fluxo vital. Clones das Sombras produzem +50% CPS.',
    cost: D(7500),
    icon: 'users',
    effectType: 'generator_multiplier',
    multiplier: 1.5,
    targetGenerator: 'shadow_clone',
  },
  {
    id: 'ninja_food_pill',
    name: 'Pílula de Alimento Shinobi (Hyourougan)',
    category: 'ninjutsu',
    description: 'Reabastecimento metabólico acelerado. Clones das Sombras produzem 2x CPS.',
    cost: D(12000),
    icon: 'pill',
    effectType: 'generator_multiplier',
    multiplier: 2.0,
    targetGenerator: 'shadow_clone',
  },
  {
    id: 'fire_ball_jutsu',
    name: 'Estilo Fogo: Jutsu Bola de Fogo Primordial',
    category: 'ninjutsu',
    description: 'Exalação ígnea canônica. Ninjas Gennin produzem 2.5x CPS.',
    cost: D(35000),
    icon: 'flame',
    effectType: 'generator_multiplier',
    multiplier: 2.5,
    targetGenerator: 'genin',
  },
  {
    id: 'sharingan',
    name: 'Sharingan Desperto (1 Tomoe)',
    category: 'ninjutsu',
    description: 'Percepção cinética prodigiosa. Jōnins e Capitães da ANBU produzem 2x CPS.',
    cost: D(60000),
    icon: 'eye',
    effectType: 'generator_multiplier',
    multiplier: 2.0,
    targetGenerator: 'jonin',
  },
  {
    id: 'gravity_training',
    name: 'Treino de Condicionamento Gravitacional',
    category: 'ninjutsu',
    description: 'Superação de pesos corporais. Gennins e Chūnins produzem 2x CPS.',
    cost: D(150000),
    icon: 'trending_up',
    effectType: 'generator_multiplier',
    multiplier: 2.0,
    targetGenerator: 'chunin',
  },
  {
    id: 'summoning_scroll',
    name: 'Pacto de Invocação de Sapos',
    category: 'ninjutsu',
    description: 'Contrato de sangue com o Monte Myōboku. Sannins Lendários produzem 2x CPS.',
    cost: D(400000),
    icon: 'scroll',
    effectType: 'generator_multiplier',
    multiplier: 2.0,
    targetGenerator: 'sannin',
  },
  {
    id: 'water_dragon',
    name: 'Estilo Água: Jutsu Dragão de Água',
    category: 'ninjutsu',
    description: 'Turbilhão hídrico de 44 selos. Sete Espadachins da Névoa produzem 3x CPS.',
    cost: D(850000),
    icon: 'wind',
    effectType: 'generator_multiplier',
    multiplier: 3.0,
    targetGenerator: 'seven_swordsmen',
  },
  {
    id: 'choku_tomoe',
    name: 'Mangekyō com Padrão Choku Tomoe',
    category: 'ninjutsu',
    description: 'Agilidade ocular sem limites. Hokages da Vila produzem 2x CPS.',
    cost: D(1200000),
    icon: 'eye',
    effectType: 'generator_multiplier',
    multiplier: 2.0,
    targetGenerator: 'kage',
  },
  {
    id: 'chidori_stream',
    name: 'Fluxo Elétrico Chidori Nagashi',
    category: 'ninjutsu',
    description: 'Descarga de alta frequência no solo. Membros da Akatsuki produzem 2.5x CPS.',
    cost: D(45000000),
    icon: 'zap',
    effectType: 'generator_multiplier',
    multiplier: 2.5,
    targetGenerator: 'akatsuki_member',
  },
  {
    id: 'edo_tensei',
    name: 'Invocação Proibida: Reanimação Edo Tensei',
    category: 'ninjutsu',
    description: 'Almas presas em invólucros imortais. Jinchūrikis Perfeitos produzem 2x CPS.',
    cost: D(2500000000),
    icon: 'skull',
    effectType: 'generator_multiplier',
    multiplier: 2.0,
    targetGenerator: 'jinchuriki',
  },
  {
    id: 'six_paths_sage',
    name: 'Bênção do Sábio dos Seis Caminhos',
    category: 'ninjutsu',
    description: 'Unificação da linhagem de Hagoromo. Multiplica todo o CPS global por 5x.',
    cost: D(80000000000),
    icon: 'sun',
    effectType: 'global_cps',
    multiplier: 5.0,
  },
  {
    id: 'infinite_tsukuyomi',
    name: 'Luz Carmesim do Tsukuyomi Infinito',
    category: 'ninjutsu',
    description: 'Genjutsu universal projetado na lua. Multiplica todo o CPS global por 2x.',
    cost: D(250000000000),
    icon: 'moon',
    effectType: 'global_cps',
    multiplier: 2.0,
  },
  {
    id: 'divine_tree',
    name: 'Fruto Sagrado da Árvore Divina (Shinju)',
    category: 'ninjutsu',
    description: 'A semente primordial de todo o chakra do cosmos. Multiplica todo o CPS global por 8x.',
    cost: D(2500000000000),
    icon: 'trees',
    effectType: 'global_cps',
    multiplier: 8.0,
  },
  {
    id: 'creation_all_things',
    name: 'Criação de Todas as Coisas (Banbutsu Sōzō)',
    category: 'ninjutsu',
    description: 'Manifesta formas a partir do nada. Multiplica CPS por 10x e Clique por 5x.',
    cost: D(10000000000000),
    icon: 'infinity',
    effectType: 'global_cps',
    multiplier: 10.0,
  },

  // =========================================================================
  // 3. SENJUTSU & TRANSFORMAÇÕES (PICOS TEMPORÁRIOS & SINERGIAS)
  // =========================================================================
  {
    id: 'sage_mode',
    name: 'Modo Sábio dos Sapos (Senjutsu Perfeito)',
    category: 'senjutsu',
    description: 'Harmonia com a energia natural da terra. +50% em toda a produção passiva global.',
    cost: D(10000000),
    icon: 'sparkles',
    effectType: 'global_cps',
    multiplier: 1.5,
  },
  {
    id: 'kyuubi_cloak',
    name: 'Manto da Kyuubi (Chakra de 1 Cauda)',
    category: 'senjutsu',
    description: 'Chakra corrosivo e ardente. Converte +0.2% do CPS^0.65 ao clique e potencializa liberação dos Portões.',
    cost: D(250000000),
    icon: 'flame',
    effectType: 'click_cps_ratio',
    multiplier: 0.002,
  },
  {
    id: 'kurama_mode',
    name: 'Modo Kurama Completo (Sincronia Total)',
    category: 'senjutsu',
    description: 'União fraternal com a Besta de Nove Caudas. Multiplica todo o CPS global por 2.5x.',
    cost: D(800000000),
    icon: 'flame',
    effectType: 'global_cps',
    multiplier: 2.5,
  },
  {
    id: 'perfect_susanoo',
    name: 'Susano\'o Perfeito Estabilizado',
    category: 'senjutsu',
    description: 'Colosso divino destruidor de montanhas. Converte +1.2% do CPS^0.65 diretamente para clique.',
    cost: D(8000000000),
    icon: 'shield',
    effectType: 'click_cps_ratio',
    multiplier: 0.012,
  },
  {
    id: 'otsutsuki_power',
    name: 'Herança Genética Otsutsuki Primordial',
    category: 'senjutsu',
    description: 'Poder divino transcendental. Multiplica CPS por 6x e Clique Manual por 4x.',
    cost: D(800000000000),
    icon: 'crown',
    effectType: 'global_cps',
    multiplier: 6.0,
  },
  {
    id: 'sage_art_wood',
    name: 'Arte Sábia: Vários Milhares de Mãos Verdadeiras',
    category: 'senjutsu',
    description: 'A colossal estátua búdica de madeira de Hashirama. Multiplica CPS global por 4x.',
    cost: D(15000000000000),
    icon: 'trees',
    effectType: 'global_cps',
    multiplier: 4.0,
  },
  {
    id: 'six_paths_senjutsu',
    name: 'Senjutsu dos Seis Caminhos Divino',
    category: 'senjutsu',
    description: 'Plena soberania sobre a realidade física. Multiplica todo o CPS global por 5x.',
    cost: D(50000000000000),
    icon: 'sun',
    effectType: 'global_cps',
    multiplier: 5.0,
  },

  // =========================================================================
  // 4. FŪINJUTSU & ECONOMIA (EFICIÊNCIA & DESCONTOS)
  // =========================================================================
  {
    id: 'sealing_scroll',
    name: 'Selo de Armazenamento Básico',
    category: 'fuinjutsu',
    description: 'Compressão eficiente de pergaminhos. +10% de eficiência global em toda a economia.',
    cost: D(500),
    icon: 'scroll',
    effectType: 'global_cps',
    multiplier: 1.1,
  },
  {
    id: 'tactical_kunai',
    name: 'Kunai Tática com Selo Teleportador',
    category: 'fuinjutsu',
    description: 'Arma balanceada para desdobramentos táticos. +15% de eficiência econômica global.',
    cost: D(1000),
    icon: 'sword',
    effectType: 'global_cps',
    multiplier: 1.15,
  },
  {
    id: 'ninja_sandals',
    name: 'Sandálias de Deslocamento Rápido',
    category: 'fuinjutsu',
    description: 'Aderência e rapidez em terrenos hostis. +20% de velocidade na taxa de chakra.',
    cost: D(3000),
    icon: 'footprints',
    effectType: 'global_cps',
    multiplier: 1.2,
  },
  {
    id: 'chakra_concentration',
    name: 'Concentração de Fluxo e Redução de Atrito',
    category: 'fuinjutsu',
    description: 'Minimiza o desperdício de energia. Reduz o custo de compra de todos os geradores em 5%.',
    cost: D(4500),
    icon: 'percent',
    effectType: 'generator_cost_discount',
    multiplier: 0.05,
  },
  {
    id: 'four_symbols_seal',
    name: 'Selo de Quatro Símbolos (Shishō Fūin)',
    category: 'fuinjutsu',
    description: 'Estrutura geométrica de confinamento. Reduz o custo de compra de todos os geradores em 4%.',
    cost: D(85000),
    icon: 'shield',
    effectType: 'generator_cost_discount',
    multiplier: 0.04,
  },
  {
    id: 'eight_trigrams_seal',
    name: 'Estilo de Selamento de Oito Trigramas',
    category: 'fuinjutsu',
    description: 'Dois selos entrelaçados para circulação contínua. Reduz custo de geradores em mais 6%.',
    cost: D(2500000),
    icon: 'shield_alert',
    effectType: 'generator_cost_discount',
    multiplier: 0.06,
  },
  {
    id: 'adamantine_chains',
    name: 'Correntes Adamantinas do Clã Uzumaki',
    category: 'fuinjutsu',
    description: 'Chakra condensado capaz de prender Bijuus. Reduz custo de geradores em 8% e aprimora taxa offline.',
    cost: D(80000000),
    icon: 'layers',
    effectType: 'generator_cost_discount',
    multiplier: 0.08,
  },
  {
    id: 'karma_seal',
    name: 'Marca de Selamento do Karma Celestial',
    category: 'fuinjutsu',
    description: 'Backup genético supremo. Reduz custo de todos os geradores em 10% e duplica acúmulo offline.',
    cost: D(12000000000),
    icon: 'hexagon',
    effectType: 'generator_cost_discount',
    multiplier: 0.10,
  },
];

export const UPGRADES_BY_ID = Object.fromEntries(
  TECHNIQUE_UPGRADES.map((u) => [u.id, u])
) as Record<string, TechniqueUpgrade>;
