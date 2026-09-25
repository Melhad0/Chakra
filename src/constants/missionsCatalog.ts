import { ShinobiMission } from '../types/missions';

export const SHINOBI_MISSIONS_CATALOG: ShinobiMission[] = [
  // =========================================================================
  // RANK E: ACADEMIA SHINOBI (TEMPO: 15s)
  // =========================================================================
  {
    id: 'mission_e_1',
    rank: 'E',
    title: 'Limpeza e Manutenção do Campo de Treinamento 7',
    loreBriefing: 'O solo sagrado de treino está coberto de kunais enferrujadas e troncos partidos após exercícios de taijutsu.',
    requiredRankTier: 0,
    requiredRankName: 'Estudante da Academia',
    durationSeconds: 15,
    choices: [
      {
        id: 'e1_choice_a',
        actionTitle: 'Abordagem Manual e Meticulosa',
        tacticalDescription: 'Recolher cada estilhaço com ferramentas manuais de treino, priorizando segurança e disciplina.',
        successProbability: 0.85,
        successOutcome: {
          narrativeResult: 'Campo higienizado com perfeição e as kunais foram polidas. O instrutor recompensou a disciplina com provisões de Chakra.',
          isSuccess: true,
          rewardChakraSeconds: 30,
        },
        failureOutcome: {
          narrativeResult: 'Farpas de madeira rústica e lascas de ferro perfuraram as palmas. Dano de clique manual reduzido por 1 minuto.',
          isSuccess: false,
          penaltyClickExhaustionSeconds: 60,
        },
      },
      {
        id: 'e1_choice_b',
        actionTitle: 'Usar Clones Básicos Instáveis',
        tacticalDescription: 'Conjurar Bunshin imperfeitos para acelerar a faxina por meio de força bruta rápida.',
        successProbability: 0.50,
        successOutcome: {
          narrativeResult: 'Os clones mantiveram forma estável por tempo suficiente para concluir o trabalho em velocidade recorde.',
          isSuccess: true,
          rewardChakraSeconds: 90,
        },
        failureOutcome: {
          narrativeResult: 'Os clones sofreram colapso de chakra simultâneo e explodiram em pó, espalhando lixo e drenando 5% do Chakra acumulado.',
          isSuccess: false,
          penaltyChakraLossPercent: 5,
        },
      },
    ],
  },
  {
    id: 'mission_e_2',
    rank: 'E',
    title: 'Resgate do Cão Ninja Perdido nos Becos de Konoha',
    loreBriefing: 'Um filhote ninken do clã Inuzuka escapou de seu canil e está acuado nos telhados do distrito comercial.',
    requiredRankTier: 0,
    requiredRankName: 'Estudante da Academia',
    durationSeconds: 15,
    choices: [
      {
        id: 'e2_choice_a',
        actionTitle: 'Isca de Carne Seca e Paciência',
        tacticalDescription: 'Aproximação silenciosa oferecendo petisco de carne defumada e emanando intenção pacífica.',
        successProbability: 0.80,
        successOutcome: {
          narrativeResult: 'O ninken aceitou a isca de bom grado e se entregou calmamente. O clã Inuzuka enviou Chakra medicinal em agradecimento.',
          isSuccess: true,
          rewardChakraSeconds: 45,
        },
        failureOutcome: {
          narrativeResult: 'O cão assustou-se com o ranger das telhas e fugiu pelos bueiros da aldeia. O mural sofreu 60s de atraso adicional.',
          isSuccess: false,
          penaltyCooldownSeconds: 60,
        },
      },
      {
        id: 'e2_choice_b',
        actionTitle: 'Encurralar com Rede de Fios',
        tacticalDescription: 'Lançar cabos de aço e rede de contenção para captura rápida e decisiva em meio aos becos.',
        successProbability: 0.45,
        successOutcome: {
          narrativeResult: 'Captura ágil e impecável antes que o filhote pudesse saltar para os canais de irrigação.',
          isSuccess: true,
          rewardChakraSeconds: 120,
        },
        failureOutcome: {
          narrativeResult: 'O filhote mordeu os dedos do shinobi ao ser enlaçado. Exaustão muscular de 15 segundos aplicada ao clique.',
          isSuccess: false,
          penaltyClickExhaustionSeconds: 15,
        },
      },
    ],
  },

  // =========================================================================
  // RANK D: GENNIN (TEMPO: 45s)
  // =========================================================================
  {
    id: 'mission_d_1',
    rank: 'D',
    title: 'Captura da Gata Tora da Esposa do Senhor Feudal',
    loreBriefing: 'A lendária e indomável felina carmesim foi avistada esgueirando-se entre os muros do distrito nobre leste.',
    requiredRankTier: 1,
    requiredRankName: 'Ninja Gennin',
    durationSeconds: 45,
    choices: [
      {
        id: 'd1_choice_a',
        actionTitle: 'Formação em Pinça com Rádio',
        tacticalDescription: 'Coordenar o esquadrão em quatro ângulos simultâneos, fechando as rotas de fuga através de comunicadores.',
        successProbability: 0.75,
        successOutcome: {
          narrativeResult: 'A gata Tora foi envolvida sem chance de reação. A esposa do Daimyō pagou uma generosa comissão.',
          isSuccess: true,
          rewardChakraSeconds: 180,
        },
        failureOutcome: {
          narrativeResult: 'Tora saltou no rosto do líder da equipe desferindo arranhões ferozes. CPS passivo reduzido em 15% por 40 segundos.',
          isSuccess: false,
          penaltyExhaustionSeconds: 40,
        },
      },
      {
        id: 'd1_choice_b',
        actionTitle: 'Salto Agressivo dos Telhados',
        tacticalDescription: 'Mergulho vertical direto a partir da cumeeira principal, tentando capturar a fera em pleno ar.',
        successProbability: 0.35,
        successOutcome: {
          narrativeResult: 'Acrobacia espetacular! Tora foi agarrada pelo dorso sem sofrer um arranhão. Recompensa quadruplicada.',
          isSuccess: true,
          rewardChakraSeconds: 720,
        },
        failureOutcome: {
          narrativeResult: 'Aterrissagem desastrada que quebrou telhas coloniais da mansão nobre. O prejuízo drenou 10% do saldo de Chakra.',
          isSuccess: false,
          penaltyChakraLossPercent: 10,
        },
      },
    ],
  },
  {
    id: 'mission_d_2',
    rank: 'D',
    title: 'Escolta de Comitiva Agrícola pela Floresta do Fogo',
    loreBriefing: 'Comboio de camponeses precisa atravessar uma ravina úmida infestada de javalis gigantes e saqueadores comuns.',
    requiredRankTier: 1,
    requiredRankName: 'Ninja Gennin',
    durationSeconds: 45,
    choices: [
      {
        id: 'd2_choice_a',
        actionTitle: 'Varredura por Trilhas Altas',
        tacticalDescription: 'Caminhar pelos galhos superiores das árvores para mapear armadilhas e animais antes da passagem da carroça.',
        successProbability: 0.80,
        successOutcome: {
          narrativeResult: 'A travessia ocorreu em perfeita calmaria. Os agricultores abençoaram o esquadrão com víveres energéticos.',
          isSuccess: true,
          rewardChakraSeconds: 200,
        },
        failureOutcome: {
          narrativeResult: 'Animais assustaram os bois de carga, derramando sacas de grãos. Perda de 5% de Chakra pelo atraso logístico.',
          isSuccess: false,
          penaltyChakraLossPercent: 5,
        },
      },
      {
        id: 'd2_choice_b',
        actionTitle: 'Avanço Acelerado pela Estrada Principal',
        tacticalDescription: 'Forçar marcha rápida sem desvios, repelindo ameaças em velocidade com jutsus de impacto.',
        successProbability: 0.50,
        successOutcome: {
          narrativeResult: 'Comboio entregue na metade do prazo! O mercador chefe ofereceu minérios raros para a forja de armas.',
          isSuccess: true,
          rewardChakraSeconds: 450,
          rewardForgeFragments: 2,
        },
        failureOutcome: {
          narrativeResult: 'A carroça atolou em lamaçal denso após investida de javalis. O mural de missões fica bloqueado por 3 minutos para resgate.',
          isSuccess: false,
          penaltyCooldownSeconds: 180,
        },
      },
    ],
  },

  // =========================================================================
  // RANK C: CHŪNIN (TEMPO: 120s)
  // =========================================================================
  {
    id: 'mission_c_1',
    rank: 'C',
    title: 'Eliminação dos Bandidos da Ponte da Fronteira',
    loreBriefing: 'Mercenários sem chakra ergueram barricadas na ponte comercial, extorquindo comerciantes com lâminas e bestas.',
    requiredRankTier: 2,
    requiredRankName: 'Ninja Chūnin',
    durationSeconds: 120,
    choices: [
      {
        id: 'c1_choice_a',
        actionTitle: 'Armadilhas Subterrâneas de Doton',
        tacticalDescription: 'Enterrar selos explosivos e moldar a terra para engolir as barricadas dos bandidos sem combate corpo a corpo.',
        successProbability: 0.70,
        successOutcome: {
          narrativeResult: 'As defesas dos bandidos colapsaram instantaneamente. O bando rendeu-se e seus arsenais de ferro foram apreendidos.',
          isSuccess: true,
          rewardChakraSeconds: 600,
          rewardForgeFragments: 5,
        },
        failureOutcome: {
          narrativeResult: 'Detonação prematura da terra causou estilhaços na equipe. O shinobi sofreu 45 segundos de exaustão no clique.',
          isSuccess: false,
          penaltyClickExhaustionSeconds: 45,
        },
      },
      {
        id: 'c1_choice_b',
        actionTitle: 'Ataque Noturno Direto à Tenda do Líder',
        tacticalDescription: 'Infiltração rápida à meia-noite decapitando a cadeia de comando inimiga com um golpe relâmpago.',
        successProbability: 0.40,
        successOutcome: {
          narrativeResult: 'O chefe dos mercenários foi subjugado em segundos. O cofre continha valiosos tesouros e 1 Bilhete Gacha!',
          isSuccess: true,
          rewardChakraSeconds: 1500,
          rewardGachaTickets: 1,
        },
        failureOutcome: {
          narrativeResult: 'Sentinelas com bestas de repetição emboscaram a equipe. O resgate emergencial drenou 15% do Chakra total.',
          isSuccess: false,
          penaltyChakraLossPercent: 15,
        },
      },
    ],
  },
  {
    id: 'mission_c_2',
    rank: 'C',
    title: 'Defesa do Comboio de Remédios do País das Ondas',
    loreBriefing: 'Piratas da Névoa planejam saquear remessa urgente de ervas medicinais e soro antiofídico no estreito marítimo.',
    requiredRankTier: 2,
    requiredRankName: 'Ninja Chūnin',
    durationSeconds: 120,
    choices: [
      {
        id: 'c2_choice_a',
        actionTitle: 'Cortina de Névoa Artificial (Suiton)',
        tacticalDescription: 'Cobrir as embarcações com bruma densa para iludir os batedores piratas e cruzar o canal despercebidos.',
        successProbability: 0.75,
        successOutcome: {
          narrativeResult: 'A frota pirata disparou às cegas enquanto os remédios alcançavam o porto em perfeita segurança.',
          isSuccess: true,
          rewardChakraSeconds: 700,
        },
        failureOutcome: {
          narrativeResult: 'A névoa desorientou a própria comitiva, fazendo a chalupa colidir em recifes. Atraso de 180s no mural.',
          isSuccess: false,
          penaltyCooldownSeconds: 180,
        },
      },
      {
        id: 'c2_choice_b',
        actionTitle: 'Desafio Solo ao Capitão Pirata',
        tacticalDescription: 'Abordar o navio capitânia inimigo e neutralizar o capitão em duelo singular diante de sua marujada.',
        successProbability: 0.45,
        successOutcome: {
          narrativeResult: 'Capitão derrotado com um golpe estonteante! Os piratas bateram em retirada e deixaram caixotes de forja intactos.',
          isSuccess: true,
          rewardChakraSeconds: 1800,
          rewardForgeFragments: 8,
        },
        failureOutcome: {
          narrativeResult: 'O capitão usava veneno paralisante na lâmina. CPS passivo cortado em 40% por 60 segundos.',
          isSuccess: false,
          penaltyExhaustionSeconds: 60,
        },
      },
    ],
  },

  // =========================================================================
  // RANK B: JŌNIN (TEMPO: 300s)
  // =========================================================================
  {
    id: 'mission_b_1',
    rank: 'B',
    title: 'Interceptação do Mensageiro Espião de Kusagakure',
    loreBriefing: 'Um agente renegado de elite carrega pergaminhos cifrados contendo as coordenadas das sentinelas de fronteira de Konoha.',
    requiredRankTier: 4,
    requiredRankName: 'Ninja Jōnin de Elite',
    durationSeconds: 300,
    choices: [
      {
        id: 'b1_choice_a',
        actionTitle: 'Rastreamento Silencioso e Genjutsu',
        tacticalDescription: 'Seguir o espião pelos dosséis da floresta e aplicar ilusão óptica antes que ele note a perseguição.',
        successProbability: 0.65,
        successOutcome: {
          narrativeResult: 'O espião entregou o pergaminho acreditando estar diante de seu contato. Documentos recuperados e fragmentos recolhidos.',
          isSuccess: true,
          rewardChakraSeconds: 2400,
          rewardForgeFragments: 15,
        },
        failureOutcome: {
          narrativeResult: 'O espião percebeu o Genjutsu e incinerou o pergaminho com Katon antes de ser capturado. Missão sem recompensas.',
          isSuccess: false,
          penaltyCooldownSeconds: 60,
        },
      },
      {
        id: 'b1_choice_b',
        actionTitle: 'Corte Imediato em Alta Velocidade (Raiton)',
        tacticalDescription: 'Avançar com Shunshin relâmpago para desarmar e imobilizar o espião em fração de segundo.',
        successProbability: 0.35,
        successOutcome: {
          narrativeResult: 'Execução cirúrgica à velocidade da luz! O espião portava pergaminhos secretos, 1 Bilhete Gacha e 1 Chakra Ancestral.',
          isSuccess: true,
          rewardChakraSeconds: 6000,
          rewardGachaTickets: 1,
          rewardAncestral: 1,
        },
        failureOutcome: {
          narrativeResult: 'O espião detonou um selo suicida de explosão concentrada no impacto. O recuo arrancou 25% de todo o Chakra em saldo.',
          isSuccess: false,
          penaltyChakraLossPercent: 25,
        },
      },
    ],
  },
  {
    id: 'mission_b_2',
    rank: 'B',
    title: 'Neutralização de Célula Renegada da Névoa Oculta',
    loreBriefing: 'Três nukenins portando espadas sanguinárias estão aterrorizando vilarejos pesqueiros ao longo da costa.',
    requiredRankTier: 4,
    requiredRankName: 'Ninja Jōnin de Elite',
    durationSeconds: 300,
    choices: [
      {
        id: 'b2_choice_a',
        actionTitle: 'Emboscada com Clones Explosivos',
        tacticalDescription: 'Atrair os três espadachins para um estreito rochoso onde clones com selos ocultos aguardam a emboscada.',
        successProbability: 0.60,
        successOutcome: {
          narrativeResult: 'A armadilha funcionou com precisão cirúrgica. Os renegados foram capturados e a recompensa foi creditada.',
          isSuccess: true,
          rewardChakraSeconds: 3000,
        },
        failureOutcome: {
          narrativeResult: 'Um dos alvos pressentiu o chakra explosivo e lançou bombas de fumaça, permitindo a fuga do trio. Mural travado por 5 minutos.',
          isSuccess: false,
          penaltyCooldownSeconds: 300,
        },
      },
      {
        id: 'b2_choice_b',
        actionTitle: 'Duelo de Taijutsu em Terreno Aquático',
        tacticalDescription: 'Caminhar sobre as águas e enfrentar os três renegados simultaneamente em combate corpo a corpo de alta intensidade.',
        successProbability: 0.30,
        successOutcome: {
          narrativeResult: 'Domínio absoluto das artes marciais sobre a superfície do mar! Armas lendárias confiscadas e 20 fragmentos obtidos.',
          isSuccess: true,
          rewardChakraSeconds: 8500,
          rewardForgeFragments: 20,
        },
        failureOutcome: {
          narrativeResult: 'Corte profundo de espada na perna do combatente. O esquadrão sofre 90 segundos de exaustão com CPS cortado pela metade.',
          isSuccess: false,
          penaltyExhaustionSeconds: 90,
        },
      },
    ],
  },

  // =========================================================================
  // RANK A: ANBU (TEMPO: 600s)
  // =========================================================================
  {
    id: 'mission_a_1',
    rank: 'A',
    title: 'Supressão do Batalhão Deserção da Raiz (Fundação)',
    loreBriefing: 'Remanescentes radicais da Raiz de Danzō sequestraram arquivos confidenciais contendo fórmulas de kinjutsu proibido.',
    requiredRankTier: 5,
    requiredRankName: 'Capitão da ANBU',
    durationSeconds: 600,
    choices: [
      {
        id: 'a1_choice_a',
        actionTitle: 'Infiltração com Fūinjutsu de Ocultação',
        tacticalDescription: 'Penetrar o bunker subterrâneo suprimindo 100% da assinatura de chakra para resgatar os documentos em sigilo.',
        successProbability: 0.60,
        successOutcome: {
          narrativeResult: 'Infiltração perfeita. Os pergaminhos de Kinjutsu foram repatriados, concedendo segredos e 3 Chakra Ancestral.',
          isSuccess: true,
          rewardChakraSeconds: 7200,
          rewardAncestral: 3,
        },
        failureOutcome: {
          narrativeResult: 'Um selo de barreira acionou gás letal pressurizado. A evacuação forçada causou perda de 30% do saldo de Chakra.',
          isSuccess: false,
          penaltyChakraLossPercent: 30,
        },
      },
      {
        id: 'a1_choice_b',
        actionTitle: 'Incursão Destrutiva com Ninjutsu de Larga Escala',
        tacticalDescription: 'Destruir a entrada do bunker com rajadas de fogo e vento, aniquilando a resistência em combate aberto.',
        successProbability: 0.25,
        successOutcome: {
          narrativeResult: 'Vitória avassaladora! O bunker ruiu e os arquivos mestres foram recuperados intactos com 2 Bilhetes e 5 Ancestrais.',
          isSuccess: true,
          rewardChakraSeconds: 20000,
          rewardGachaTickets: 2,
          rewardAncestral: 5,
        },
        failureOutcome: {
          narrativeResult: 'Um agente moribundo da Raiz ativou o Selo de Maldição da Terra. Exaustão brutal de 3 minutos (-75% no CPS).',
          isSuccess: false,
          penaltyExhaustionSeconds: 180,
        },
      },
    ],
  },
  {
    id: 'mission_a_2',
    rank: 'A',
    title: 'Escolta de Emergência do Lorde Feudal sob Chuva de Kunais',
    loreBriefing: 'Assassinos de elite de Iwagakure planejam emboscar a carruagem do Daimyō no estreito desfiladeiro dos relâmpagos.',
    requiredRankTier: 5,
    requiredRankName: 'Capitão da ANBU',
    durationSeconds: 600,
    choices: [
      {
        id: 'a2_choice_a',
        actionTitle: 'Desvio por Cavernas Subterrâneas',
        tacticalDescription: 'Guiar a comitiva por túneis escavados por Doton, evitando o desfiladeiro aberto e as armadilhas inimigas.',
        successProbability: 0.65,
        successOutcome: {
          narrativeResult: 'O comboio passou despercebido abaixo do fogo cruzado. O Daimyō recompensou o esquadrão com 35 Fragmentos de Forja.',
          isSuccess: true,
          rewardChakraSeconds: 8000,
          rewardForgeFragments: 35,
        },
        failureOutcome: {
          narrativeResult: 'Tremores causaram desabamento parcial na rota subterrânea. O mural de missões fica trancado por 10 minutos para remoção de escombros.',
          isSuccess: false,
          penaltyCooldownSeconds: 600,
        },
      },
      {
        id: 'a2_choice_b',
        actionTitle: 'Barreira Absoluta e Contra-Ataque Direto',
        tacticalDescription: 'Erguer cúpula de chakra impenetrável e interceptar os assassinos de frente em combate de aniquilação.',
        successProbability: 0.30,
        successOutcome: {
          narrativeResult: 'O contra-ataque dizimou o esquadrão de Iwa! O Lorde Feudal concedeu 50 Fragmentos e 4 Chakra Ancestral.',
          isSuccess: true,
          rewardChakraSeconds: 22000,
          rewardForgeFragments: 50,
          rewardAncestral: 4,
        },
        failureOutcome: {
          narrativeResult: 'Kunais explosivas atingiram a carruagem do Daimyō. Multa colossal de indenização drena 35% de todo o Chakra em saldo.',
          isSuccess: false,
          penaltyChakraLossPercent: 35,
        },
      },
    ],
  },

  // =========================================================================
  // RANK S: KAGE / AKATSUKI (TEMPO: 1.200s)
  // =========================================================================
  {
    id: 'mission_s_1',
    rank: 'S',
    title: 'Infiltração no Santuário Subterrâneo da Akatsuki',
    loreBriefing: 'Obter pergaminhos e receptores negros de transmissão de chakra dos Seis Caminhos de Pain em Amegakure.',
    requiredRankTier: 7,
    requiredRankName: 'Hokage / Kage da Vila',
    durationSeconds: 1200,
    choices: [
      {
        id: 's1_choice_a',
        actionTitle: 'Mimetismo Espacial com Barreira Oculta',
        tacticalDescription: 'Sincronizar a pulsação de chakra com a chuva de Amegakure para cruzar a barreira de detecção de Pain.',
        successProbability: 0.50,
        successOutcome: {
          narrativeResult: 'Receptores negros e mapas de rota da Akatsuki coletados com sucesso! Concede 10 Chakra Ancestral.',
          isSuccess: true,
          rewardChakraSeconds: 35000,
          rewardAncestral: 10,
        },
        failureOutcome: {
          narrativeResult: 'Detecção imediata pelo Shinra Tensei. A força gravitacional expeliu o esquadrão, gerando 4 minutos de exaustão severa.',
          isSuccess: false,
          penaltyExhaustionSeconds: 240,
        },
      },
      {
        id: 's1_choice_b',
        actionTitle: 'Invasão Oportunista no Depósito de Pergaminhos',
        tacticalDescription: 'Assaltar a câmara central de kinjutsu durante a ausência dos líderes da organização criminosa.',
        successProbability: 0.20,
        successOutcome: {
          narrativeResult: 'Saque lendário! Pergaminhos da criação do Rinnegan, 3 Bilhetes Gacha e 25 Chakra Ancestral capturados.',
          isSuccess: true,
          rewardChakraSeconds: 100000,
          rewardGachaTickets: 3,
          rewardAncestral: 25,
        },
        failureOutcome: {
          narrativeResult: 'Confronto direto contra centenas de marionetes envenenadas de Sasori. O retiro de emergência custou 50% de todo o Chakra em saldo.',
          isSuccess: false,
          penaltyChakraLossPercent: 50,
        },
      },
    ],
  },
  {
    id: 'mission_s_2',
    rank: 'S',
    title: 'Contenção de Pseudo-Jinchūriki em Surto de Calamidade',
    loreBriefing: 'Um recipiente instável banhado pelo chakra corrosivo de nove caudas perdeu o juízo, reduzindo montanhas a cinzas.',
    requiredRankTier: 7,
    requiredRankName: 'Hokage / Kage da Vila',
    durationSeconds: 1200,
    choices: [
      {
        id: 's2_choice_a',
        actionTitle: 'Selo dos Cinco Elementos em Conjunto',
        tacticalDescription: 'Coordenar cinco mestres elementais para suprimir o manto de chakra avermelhado com fūinjutsu.',
        successProbability: 0.55,
        successOutcome: {
          narrativeResult: 'O chakra corrosivo foi selado e o hospedeiro estabilizado. A aldeia recompensou com 12 Chakra Ancestral.',
          isSuccess: true,
          rewardChakraSeconds: 40000,
          rewardAncestral: 12,
        },
        failureOutcome: {
          narrativeResult: 'A carapaça avermelhada vaporizou o selo e queimou a pele dos mestres. Redução de 60% no CPS por 2 minutos.',
          isSuccess: false,
          penaltyExhaustionSeconds: 120,
        },
      },
      {
        id: 's2_choice_b',
        actionTitle: 'Duelo com Invocação de Grande Porte',
        tacticalDescription: 'Invocar um sapo chefe gigante ou lesma mística para subjugar o monstro com força bruta colossal.',
        successProbability: 0.20,
        successOutcome: {
          narrativeResult: 'A invocação imobilizou a besta em impacto titânico! 80 Fragmentos e 30 Chakra Ancestral creditados.',
          isSuccess: true,
          rewardChakraSeconds: 120000,
          rewardForgeFragments: 80,
          rewardAncestral: 30,
        },
        failureOutcome: {
          narrativeResult: 'Uma Bijuudama colateral pulverizou o vale. Devastação máxima: drena 75% de Chakra e trava o mural por 15 minutos.',
          isSuccess: false,
          penaltyChakraLossPercent: 75,
          penaltyCooldownSeconds: 900,
        },
      },
    ],
  },

  // =========================================================================
  // RANK SS: DEUS SHINOBI / RIKUDOU (TEMPO: 2.400s)
  // =========================================================================
  {
    id: 'mission_ss_1',
    rank: 'SS',
    title: 'Fechamento de Ruptura Dimensional da Fenda de Kaguya',
    loreBriefing: 'Uma fenda cósmica interdimensional aberta no espaço-tempo ameaça sugar a totalidade da biosfera do mundo ninja.',
    requiredRankTier: 8,
    requiredRankName: 'Deus Shinobi (Rikudou)',
    durationSeconds: 2400,
    choices: [
      {
        id: 'ss1_choice_a',
        actionTitle: 'Canalização das Seis Gudōdama',
        tacticalDescription: 'Dispor as Esferas da Busca da Verdade em geometria sagrada para estancar a dilatação gravitacional.',
        successProbability: 0.45,
        successOutcome: {
          narrativeResult: 'O vácuo espacial foi purificado pela harmonia das esferas negras. Concede 250.000s de CPS e 60 Chakra Ancestral.',
          isSuccess: true,
          rewardChakraSeconds: 250000,
          rewardAncestral: 60,
        },
        failureOutcome: {
          narrativeResult: 'A distorção inverteu o fluxo de gravidade local, paralisando os geradores passivos por 3 minutos de exaustão.',
          isSuccess: false,
          penaltyExhaustionSeconds: 180,
        },
      },
      {
        id: 'ss1_choice_b',
        actionTitle: 'Condensar a Fenda com Flecha de Indra Transcendental',
        tacticalDescription: 'Disparar flecha de relâmpago divino comprimida com chakra dos nove Bijuus para colapsar o portal singular.',
        successProbability: 0.15,
        successOutcome: {
          narrativeResult: 'O impacto cósmico reescreveu a física do universo ninja! Multiplicador permanente global de x1.25 em todo o CPS, 150 Ancestral e 5 Bilhetes Gacha.',
          isSuccess: true,
          permanentCpsMultiplier: 1.25,
          rewardAncestral: 150,
          rewardGachaTickets: 5,
        },
        failureOutcome: {
          narrativeResult: 'A flecha causou fissura dimensional reversa. Exaustão catastrófica de 10 minutos reduz o rendimento passivo a 10%.',
          isSuccess: false,
          penaltyExhaustionSeconds: 600,
        },
      },
    ],
  },
  {
    id: 'mission_ss_2',
    rank: 'SS',
    title: 'Selo Eterno na Raiz da Árvore Divina (Shinju Ancestral)',
    loreBriefing: 'A raiz primordial da Shinju despertou no subterrâneo cósmico, drenando oceanos e chakra natural de cinco continentes.',
    requiredRankTier: 8,
    requiredRankName: 'Deus Shinobi (Rikudou)',
    durationSeconds: 2400,
    choices: [
      {
        id: 'ss2_choice_a',
        actionTitle: 'Ritual Rikudou Chibaku Tensei',
        tacticalDescription: 'Erguer um satélite rochoso monumental a partir da crosta terrestre para sepultar o núcleo vivo da Shinju.',
        successProbability: 0.40,
        successOutcome: {
          narrativeResult: 'Um novo corpo celeste foi formado na estratosfera, aprisionando a raiz divina. Recompensa de 300.000s de CPS e 80 Ancestral.',
          isSuccess: true,
          rewardChakraSeconds: 300000,
          rewardAncestral: 80,
        },
        failureOutcome: {
          narrativeResult: 'Rejeição cósmica da raiz divina. A onda de choque drena 40% das reservas de Chakra e desativa cliques manuais por 2 minutos.',
          isSuccess: false,
          penaltyChakraLossPercent: 40,
          penaltyClickExhaustionSeconds: 120,
        },
      },
      {
        id: 'ss2_choice_b',
        actionTitle: 'Absorção Direta do Fruto Astral Incompleto',
        tacticalDescription: 'Canalizar o néctar estelar diretamente no próprio sistema circulatório de chakra para transcendência absoluta.',
        successProbability: 0.10,
        successOutcome: {
          narrativeResult: 'Transcendência divina alcançada! Concede 500 Chakra Ancestral direto e 24 horas inteiras (86.400s) de produção passiva instantânea!',
          isSuccess: true,
          rewardAncestral: 500,
          rewardChakraSeconds: 86400,
        },
        failureOutcome: {
          narrativeResult: 'Sobrecarga celular de Chakra divino! Penalidade de 20 minutos de exaustão extrema e bloqueio total do mural de missões por 20 minutos.',
          isSuccess: false,
          penaltyExhaustionSeconds: 1200,
          penaltyCooldownSeconds: 1200,
        },
      },
    ],
  },
];
