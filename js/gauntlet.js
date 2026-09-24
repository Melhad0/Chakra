/**
 * gauntlet.js - Desafios Shinobi: Gauntlet com mais de 100 Inimigos Canônicos e Fillers
 * Abrange: Clássico, Fillers Clássicos, Shippuden, Fillers Shippuden, Guerra e Clímax Otsutsuki.
 */

import { D, formatBigNumber } from './BigNumber.js';
import { sound } from './audio.js';
import { particles } from './particles.js';

export const GAUNTLET_ENEMIES = [
    // --- 1. ARCO CLÁSSICO: FORMAÇÃO & PAÍS DAS ONDAS (1-10) ---
    { id: 1, name: "Mizuki", arc: "Clássico", title: "Instrutor Traidor", avatar: "🗡️", baseHp: 150 },
    { id: 2, name: "Bandidos de Gatō", arc: "Clássico", title: "Capangas Mercenários", avatar: "🥷", baseHp: 320 },
    { id: 3, name: "Demônios da Névoa (Gōzu & Meizu)", arc: "Clássico", title: "Irmãos Demônio", avatar: "⛓️", baseHp: 650 },
    { id: 4, name: "Haku (Espelhos de Gelo)", arc: "Clássico", title: "Portador do Hyōton", avatar: "❄️", baseHp: 1200 },
    { id: 5, name: "Zabuza Momochi", arc: "Clássico", title: "O Demônio da Névoa Oculta", avatar: "🗡️", baseHp: 2400 },
    { id: 6, name: "Espião Kusagakure", arc: "Clássico", title: "Infiltrado no Exame", avatar: "📜", baseHp: 3800 },
    { id: 7, name: "Time Oboro (Chuva)", arc: "Clássico", title: "Mestres de Clones Ilusórios", avatar: "🌧️", baseHp: 5500 },
    { id: 8, name: "Zaku Abumi", arc: "Clássico", title: "Manipulador de Ondas Sonoras", avatar: "💨", baseHp: 7500 },
    { id: 9, name: "Kin Tsuchi", arc: "Clássico", title: "Mestre dos Sinos e Fios", avatar: "🔔", baseHp: 10000 },
    { id: 10, name: "Dosu Kinuta", arc: "Clássico", title: "Braço Ressonador do Som", avatar: "🔊", baseHp: 14000 },

    // --- 2. EXAME CHŪNIN & INVASÃO DE KONOHA (11-20) ---
    { id: 11, name: "Yoroi Akadō", arc: "Clássico", title: "Drenador de Chakra", avatar: "✋", baseHp: 19000 },
    { id: 12, name: "Misumi Tsurugi", arc: "Clássico", title: "Corpo Contorcionista", avatar: "🐍", baseHp: 26000 },
    { id: 13, name: "Kankurō", arc: "Clássico", title: "Titeriteiro de Suna (Karasu)", avatar: "🎎", baseHp: 35000 },
    { id: 14, name: "Temari", arc: "Clássico", title: "Mestre do Leque de Vento", avatar: "🌪️", baseHp: 48000 },
    { id: 15, name: "Shino Aburame (Simulação)", arc: "Clássico", title: "Ninho de Insetos Kikaichū", avatar: "🪲", baseHp: 65000 },
    { id: 16, name: "Kankurō (Modo Ofensivo)", arc: "Clássico", title: "Veneno de Marionete", avatar: "☠️", baseHp: 90000 },
    { id: 17, name: "Gaara (Manifestação Parcial)", arc: "Clássico", title: "Braço de Areia de Shukaku", avatar: "🦝", baseHp: 130000 },
    { id: 18, name: "Kabuto Yakushi (Espião)", arc: "Clássico", title: "Bisturi de Chakra", avatar: "🩺", baseHp: 180000 },
    { id: 19, name: "Baki", arc: "Clássico", title: "Jōnin de Sunagakure", avatar: "🗡️", baseHp: 250000 },
    { id: 20, name: "Orochimaru (Invasão de Konoha)", arc: "Clássico", title: "Sannin das Serpentes", avatar: "🐍", baseHp: 380000 },

    // --- 3. BUSCA POR TSUNADE & QUARTETO DO SOM (21-30) ---
    { id: 21, name: "Itachi Uchiha (Visita a Konoha)", arc: "Clássico", title: "Portador do Tsukuyomi", avatar: "👁️", baseHp: 550000 },
    { id: 22, name: "Kisame Hoshigaki (Névoa)", arc: "Clássico", title: "O Monstro da Névoa", avatar: "🦈", baseHp: 800000 },
    { id: 23, name: "Jirōbō (Selo Nível 1)", arc: "Clássico", title: "Força da Terra do Som", avatar: "🪨", baseHp: 1200000 },
    { id: 24, name: "Jirōbō (Selo Nível 2)", arc: "Clássico", title: "Muralha de Prisão de Terra", avatar: "🧱", baseHp: 1800000 },
    { id: 25, name: "Kidōmaru (Selo Nível 1)", arc: "Clássico", title: "Arqueiro de Teias Douradas", avatar: "🕸️", baseHp: 2600000 },
    { id: 26, name: "Kidōmaru (Terceiro Olho N2)", arc: "Clássico", title: "Flecha Perfurante de Guerra", avatar: "🏹", baseHp: 3800000 },
    { id: 27, name: "Sakon & Ukon (Selo Nível 1)", arc: "Clássico", title: "Fusão Demoníaca de Irmãos", avatar: "👥", baseHp: 5500000 },
    { id: 28, name: "Sakon & Ukon (Parasita N2)", arc: "Clássico", title: "Invasão Celular Shinobi", avatar: "👹", baseHp: 8000000 },
    { id: 29, name: "Tayuya (Flauta Demoníaca N1)", arc: "Clássico", title: "Ilusão Sonora e Gigantes Doki", avatar: "🪈", baseHp: 12000000 },
    { id: 30, name: "Tayuya (Selo Nível 2)", arc: "Clássico", title: "Genjutsu Sonoro Supremo", avatar: "🎵", baseHp: 18000000 },

    // --- 4. VALE DO FIM & CLÍMAX CLÁSSICO (31-35) ---
    { id: 31, name: "Kimimaro (Dança dos Salgueiros)", arc: "Clássico", title: "Herdeiro do Shikotsumyaku", avatar: "🦴", baseHp: 27000000 },
    { id: 32, name: "Kimimaro (Dança das Clematis)", arc: "Clássico", title: "Chicote da Espinha Dorsal", avatar: "🦴", baseHp: 40000000 },
    { id: 33, name: "Kimimaro (Floresta de Ossos N2)", arc: "Clássico", title: "Dança das Mudas de Samambaia", avatar: "🌲", baseHp: 60000000 },
    { id: 34, name: "Sasuke Uchiha (Selo Maldito N2)", arc: "Clássico", title: "Chidori Negro das Asas", avatar: "⚡", baseHp: 90000000 },
    { id: 35, name: "Manda (Rei das Serpentes)", arc: "Clássico", title: "Invocação Colossal da Caverna Ryuchi", avatar: "🐍", baseHp: 140000000 },

    // --- 5. SAGAS FILLER CLÁSSICAS: MISSÕES SECRETAS (36-45) ---
    { id: 36, name: "Raiga Kurosuki", arc: "Filler Clássico", title: "Relâmpago das Espadas Kiba", avatar: "⚡", baseHp: 210000000 },
    { id: 37, name: "Ranmaru (Chakra Ocular)", arc: "Filler Clássico", title: "Visão Através de Barreiras", avatar: "👁️", baseHp: 300000000 },
    { id: 38, name: "Gosunkugi", arc: "Filler Clássico", title: "Ladrão do Prego de Metal", avatar: "🔩", baseHp: 450000000 },
    { id: 39, name: "Sazanami", arc: "Filler Clássico", title: "Espadachim Recluso Caçado", avatar: "🗡️", baseHp: 650000000 },
    { id: 40, name: "Hōki (Mestre dos Disfarces)", arc: "Filler Clássico", title: "Líder dos Ninjas do País dos Pássaros", avatar: "🎭", baseHp: 950000000 },
    { id: 41, name: "Genshō (Irmãos Ryūdō)", arc: "Filler Clássico", title: "Mestre do Armamento do Dragão", avatar: "🐉", baseHp: 1400000000 },
    { id: 42, name: "Rokkaku", arc: "Filler Clássico", title: "Manipulador de Bastões Sonoros", avatar: "🦯", baseHp: 2000000000 },
    { id: 43, name: "Jakaku", arc: "Filler Clássico", title: "Atirador de Lança-Espinhos", avatar: "🏹", baseHp: 3000000000 },
    { id: 44, name: "Amachi (Monstro Marinho)", arc: "Filler Clássico", title: "Cientista Mutante do Oceano", avatar: "🌊", baseHp: 4500000000 },
    { id: 45, name: "Menma (Sopro de Ocarina)", arc: "Filler Clássico", title: "Usuário do Chakra Musical Protetor", avatar: "🎶", baseHp: 6500000000 },

    // --- 6. SHIPPUDEN: RESGATE DE GAARA & AKATSUKI (46-55) ---
    { id: 46, name: "Yūra (Clone Sacrifício)", arc: "Shippuden", title: "Vanguarda com Areia Falsa", avatar: "🥷", baseHp: 10000000000 },
    { id: 47, name: "Mukade (Clone de Kisame)", arc: "Shippuden", title: "30% do Chakra da Samehada", avatar: "🦈", baseHp: 15000000000 },
    { id: 48, name: "Sasori (Carapaça Hiruko)", arc: "Shippuden", title: "Ferrão de Escorpião Envenenado", avatar: "🦂", baseHp: 24000000000 },
    { id: 49, name: "Sasori (Terceiro Kazekage)", arc: "Shippuden", title: "Chuva de Areia de Ferro", avatar: "⚙️", baseHp: 38000000000 },
    { id: 50, name: "Sasori (Corpo Marionete Vermelha)", arc: "Shippuden", title: "Desempenho das 100 Marionetes", avatar: "🎎", baseHp: 60000000000 },
    { id: 51, name: "Deidara (Pássaros de Argila C1)", arc: "Shippuden", title: "Arte da Explosão Rápida", avatar: "💣", baseHp: 95000000000 },
    { id: 52, name: "Deidara (Dragão C2)", arc: "Shippuden", title: "Bombas Guiadas com Minas de Terra", avatar: "🐲", baseHp: 150000000000 },
    { id: 53, name: "Sai (Tigres de Tinta)", arc: "Shippuden", title: "Pergaminho das Bestas de Tinta", avatar: "🖌️", baseHp: 240000000000 },
    { id: 54, name: "Yamato (Prisão de Madeira)", arc: "Shippuden", title: "Capitão Interino ANBU", avatar: "🪵", baseHp: 380000000000 },
    { id: 55, name: "Orochimaru (Ponte Tenchi)", arc: "Shippuden", title: "Invocação Tripla Rashōmon", avatar: "🚪", baseHp: 600000000000 },

    // --- 7. FILLERS SHIPPUDEN: PSEUDO-JINCHUURIKI & CRISTAL (56-65) ---
    { id: 56, name: "Fūka (Ceifadora de Almas)", arc: "Filler Shippuden", title: "Beijo dos Cinco Elementos", avatar: "💋", baseHp: 950000000000 },
    { id: 57, name: "Fudō (Muralhas de Rocha)", arc: "Filler Shippuden", title: "Titã de Terra e Granito", avatar: "🪨", baseHp: 1500000000000 },
    { id: 58, name: "Fuen (Pergaminho de Labirinto)", arc: "Filler Shippuden", title: "Mapeamento Tático Falso", avatar: "🗺️", baseHp: 2400000000000 },
    { id: 59, name: "Kazuma (Líder dos Guardiões)", arc: "Filler Shippuden", title: "Portador da Foice de Vento", avatar: "🪓", baseHp: 3800000000000 },
    { id: 60, name: "Sora (Quatro Caudas Descontrolado)", arc: "Filler Shippuden", title: "Chakra Corrompido da Kyuubi", avatar: "🦊", baseHp: 6000000000000 },
    { id: 61, name: "Guren (Estilo Cristal Shōton)", arc: "Filler Shippuden", title: "Dragão e Prisão de Jade", avatar: "💎", baseHp: 9500000000000 },
    { id: 62, name: "Rinji (Mestre dos Morcegos)", arc: "Filler Shippuden", title: "Ondas Sonoras Espiãs", avatar: "🦇", baseHp: 15000000000000 },
    { id: 63, name: "Sanbi (Três Caudas Selvagem)", arc: "Filler Shippuden", title: "Oceano de Névoa Espessa", avatar: "🐢", baseHp: 25000000000000 },
    { id: 64, name: "Gotta (Clã Iburi)", arc: "Filler Shippuden", title: "Transformação em Fumaça Mortal", avatar: "💨", baseHp: 40000000000000 },
    { id: 65, name: "Mecha-Naruto", arc: "Filler Shippuden", title: "Arma Cibernética a Laser de Chakra", avatar: "🤖", baseHp: 65000000000000 },

    // --- 8. OS IMORTAIS DA AKATSUKI: HIDAN & KAKUZU (66-72) ---
    { id: 66, name: "Hidan (Ritual de Jashin)", arc: "Shippuden", title: "O Shinobi Imortal da Foice Tripla", avatar: "🩸", baseHp: 100000000000000 },
    { id: 67, name: "Hidan (Maldição de Sangue)", arc: "Shippuden", title: "Transfusão de Danos em Círculo", avatar: "☠️", baseHp: 160000000000000 },
    { id: 68, name: "Kakuzu (Dois Corações)", arc: "Shippuden", title: "Pele Endurecida Doton", avatar: "🪡", baseHp: 260000000000000 },
    { id: 69, name: "Kakuzu (Três Máscaras Elementais)", arc: "Shippuden", title: "Combo Fogo e Vento Zukokku", avatar: "🔥", baseHp: 420000000000000 },
    { id: 70, name: "Kakuzu (Forma dos Fios Negros)", arc: "Shippuden", title: "Os Quatro Corações Unidos", avatar: "⚡", baseHp: 680000000000000 },
    { id: 71, name: "Deidara (Garuda C4 Microscópica)", arc: "Shippuden", title: "Desintegração Celular de Chakra", avatar: "💣", baseHp: 1100000000000000 },
    { id: 72, name: "Deidara (CO - Arte Suprema Final)", arc: "Shippuden", title: "Explosão de 10 Quilômetros", avatar: "💥", baseHp: 1800000000000000 },

    // --- 9. A SAGA DOS UCHIHA: ITACHI & SASUKE (73-77) ---
    { id: 73, name: "Suigetsu Hōzuki", arc: "Shippuden", title: "Corpo de Água e Espada Kubikiribōchō", avatar: "💧", baseHp: 2900000000000000 },
    { id: 74, name: "Jūgo (Liberação do Selo da Fúria)", arc: "Shippuden", title: "Canhões e Propulsores Corporais", avatar: "👹", baseHp: 4700000000000000 },
    { id: 75, name: "Itachi Uchiha (Corvos Genjutsu)", arc: "Shippuden", title: "Chamas Negras do Amaterasu", avatar: "🦅", baseHp: 7600000000000000 },
    { id: 76, name: "Itachi Uchiha (Susano'o Totsuka)", arc: "Shippuden", title: "Espada de Selamento e Espelho Yata", avatar: "🛡️", baseHp: 12000000000000000 },
    { id: 77, name: "Sasuke Taka (Chidori Kirin)", arc: "Shippuden", title: "O Dragão de Relâmpago das Nuvens", avatar: "⚡", baseHp: 20000000000000000 },

    // --- 10. A INVASÃO DE PAIN & CÚPULA DOS KAGES (78-85) ---
    { id: 78, name: "Pain (Caminho Asura)", arc: "Shippuden", title: "Arsenal de Mísseis e Lâminas Mecânicas", avatar: "🚀", baseHp: 32000000000000000 },
    { id: 79, name: "Pain (Caminho Humano)", arc: "Shippuden", title: "Extração Instantânea de Almas", avatar: "👻", baseHp: 52000000000000000 },
    { id: 80, name: "Pain (Caminho Animal)", arc: "Shippuden", title: "Invocações Imortais com Rinnegan", avatar: "🦏", baseHp: 85000000000000000 },
    { id: 81, name: "Pain (Caminho Preta)", arc: "Shippuden", title: "Absorção Absoluta de Todo Ninjutsu", avatar: "🛡️", baseHp: 140000000000000000 },
    { id: 82, name: "Pain (Caminho Naraka)", arc: "Shippuden", title: "Rei do Inferno e Ressurreição", avatar: "👹", baseHp: 230000000000000000 },
    { id: 83, name: "Konan (Dança de Papel dos 600 Bilhões)", arc: "Shippuden", title: "Oceano de Selos Explosivos", avatar: "📄", baseHp: 380000000000000000 },
    { id: 84, name: "Pain (Caminho Deva - Shinra Tensei)", arc: "Shippuden", title: "O Julgamento da Gravidade Divina", avatar: "🌌", baseHp: 650000000000000000 },
    { id: 85, name: "Danzo Shimura (Braço de Sharingans)", arc: "Shippuden", title: "Usuário do Izanagi Proibido", avatar: "👁️", baseHp: 1100000000000000000 },

    // --- 11. GUERRA MUNDIAL SHINOBI: REANIMAÇÕES LENDÁRIAS (86-94) ---
    { id: 86, name: "Exército de 100.000 Zetsus Brancos", arc: "Guerra & Otsutsuki", title: "Células Proliferadas de Hashirama", avatar: "🌱", baseHp: 2000000000000000000 },
    { id: 87, name: "Irmãos Ouro e Prata (Kinkaku & Ginkaku)", arc: "Guerra & Otsutsuki", title: "As Cinco Armas Sagradas Rikudou", avatar: "🏺", baseHp: 3500000000000000000 },
    { id: 88, name: "Asuma Sarutobi (Reanimado)", arc: "Guerra & Otsutsuki", title: "Lâminas de Vento e Cinzas Queimantes", avatar: "💨", baseHp: 6000000000000000000 },
    { id: 89, name: "Sete Espadachins da Névoa (Reanimados)", arc: "Guerra & Otsutsuki", title: "As Sete Armas Assassinas Reunidas", avatar: "⚔️", baseHp: 10000000000000000000 },
    { id: 90, name: "Rasa (Quarto Kazekage)", arc: "Guerra & Otsutsuki", title: "Pó de Ouro Magnético Sakin", avatar: "✨", baseHp: 18000000000000000000 },
    { id: 91, name: "Mū (Segundo Tsuchikage)", arc: "Guerra & Otsutsuki", title: "Liberação de Poeira Jinton", avatar: "🧊", baseHp: 32000000000000000000 },
    { id: 92, name: "Gengetsu Hōzuki (Segundo Mizukage)", arc: "Guerra & Otsutsuki", title: "Miragem do Marisco e Clone de Óleo", avatar: "🦪", baseHp: 58000000000000000000 },
    { id: 93, name: "Terceiro Raikage", arc: "Guerra & Otsutsuki", title: "A Lança de Um Dedo e Armadura Elétrica", avatar: "⚡", baseHp: 100000000000000000000 },
    { id: 94, name: "Kabuto Yakushi (Modo Sábio dos Dragões)", arc: "Guerra & Otsutsuki", title: "Transmissão da Caverna Ryūchi", avatar: "🐉", baseHp: 180000000000000000000 },

    // --- 12. O CLÍMAX DIVINO & OTSUTSUKI (95-105) ---
    { id: 95, name: "Madara Uchiha (Meteoro Tengai Shinsei)", arc: "Guerra & Otsutsuki", title: "Dois Meteoros Gigantes dos Céus", avatar: "☄️", baseHp: 350000000000000000000 },
    { id: 96, name: "Obito Uchiha (Máscara de Guerra)", arc: "Guerra & Otsutsuki", title: "Seis Jinchūrikis sob Controle", avatar: "🎭", baseHp: 650000000000000000000 },
    { id: 97, name: "Jūbi (A Besta de Dez Caudas)", arc: "Guerra & Otsutsuki", title: "Progenitor de Todo o Chakra da Terra", avatar: "👁️", baseHp: 1200000000000000000000 },
    { id: 98, name: "Obito Uchiha (Jinchūriki do Dez Caudas)", arc: "Guerra & Otsutsuki", title: "Espada dos Céus Nunoboko", avatar: "🗡️", baseHp: 2400000000000000000000 },
    { id: 99, name: "Madara Rikudou (Rinnegan Duplo)", arc: "Guerra & Otsutsuki", title: "Sombras Limbo dos Quatro Mundos", avatar: "🌙", baseHp: 4800000000000000000000 },
    { id: 100, name: "Madara Rikudou (Tsukuyomi Infinito)", arc: "Guerra & Otsutsuki", title: "A Árvore Divina Planetária", avatar: "🌳", baseHp: 9600000000000000000000 },
    { id: 101, name: "Kaguya Otsutsuki (Deusa Progenitora)", arc: "Guerra & Otsutsuki", title: "Mudança Dimensional das Seis Realidades", avatar: "👸", baseHp: 20000000000000000000000 },
    { id: 102, name: "Kaguya (Esfera da Verdade Expansiva)", arc: "Guerra & Otsutsuki", title: "Destruição e Recriação do Espaço-Tempo", avatar: "⚫", baseHp: 45000000000000000000000 },
    { id: 103, name: "Sasuke Uchiha (Susano'o Bijuu)", arc: "Guerra & Otsutsuki", title: "Flecha de Indra no Vale do Fim", avatar: "🏹", baseHp: 100000000000000000000000 },
    { id: 104, name: "Toneri Otsutsuki (Modo Tenseigan)", arc: "Guerra & Otsutsuki", title: "Espada de Ouro que Corta a Lua", avatar: "🌕", baseHp: 250000000000000000000000 },
    { id: 105, name: "Momoshiki Otsutsuki (Forma Fundida)", arc: "Guerra & Otsutsuki", title: "Criação de Macacos de Lava e Rinnegan Dourado", avatar: "👑", baseHp: 600000000000000000000000 }
];

export class GauntletManager {
    constructor() {
        this.gameState = null;
        this.saveFn = null;
        this.updateDomFn = null;

        this.currentEnemyId = 1;
        this.currentEnemyHp = D(100);
        this.currentEnemyMaxHp = D(100);
        this.timeRemaining = 30.0;
        this.isFighting = false;
        this.filterArc = "Todos";
    }

    init(gameState, saveFn, updateDomFn) {
        this.gameState = gameState;
        this.saveFn = saveFn;
        this.updateDomFn = updateDomFn;

        if (!this.gameState.gauntlet) {
            this.gameState.gauntlet = {
                defeated_ids: {},
                highest_defeated: 0
            };
        }

        // Set current enemy to highest + 1
        const nextId = (this.gameState.gauntlet.highest_defeated || 0) + 1;
        this.selectEnemy(Math.min(nextId, GAUNTLET_ENEMIES.length));
    }

    selectEnemy(id) {
        const enemy = GAUNTLET_ENEMIES.find(e => e.id === id);
        if (!enemy) return;

        this.currentEnemyId = id;
        this.currentEnemyMaxHp = D(enemy.baseHp);
        this.currentEnemyHp = D(enemy.baseHp);
        this.timeRemaining = 30.0;
        this.isFighting = true;

        this.renderUI();
    }

    tick(dt, currentCps) {
        if (!this.isFighting) return;

        this.timeRemaining -= dt;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.isFighting = false;
            sound.playAlert();
            alert("⏰ TEMPO ESGOTADO! Seu DPS não foi suficiente para derrotar o chefe. Recrute mais ninjas ou aumente seus upgrades!");
            this.renderUI();
            return;
        }

        // Passive DPS from current CPS
        const dps = D(currentCps).mul(dt);
        if (dps.gt(0)) {
            this.currentEnemyHp = this.currentEnemyHp.sub(dps);
            if (this.currentEnemyHp.lte(0)) {
                this.defeatCurrentEnemy();
                return;
            }
        }

        this.updateCombatDOM();
    }

    attackManual(clickPower) {
        if (!this.isFighting) return;

        const dmg = D(clickPower);
        this.currentEnemyHp = this.currentEnemyHp.sub(dmg);
        sound.playCrit();

        const btn = document.getElementById("gauntlet-attack-btn");
        if (btn) {
            const rect = btn.getBoundingClientRect();
            particles.spawnBurst(rect.left + rect.width / 2, rect.top, 8, "crit");
            particles.spawnFloatingText(rect.left + rect.width / 2, rect.top, `-${formatBigNumber(dmg)}`, true);
        }

        if (this.currentEnemyHp.lte(0)) {
            this.defeatCurrentEnemy();
        } else {
            this.updateCombatDOM();
        }
    }

    defeatCurrentEnemy() {
        this.currentEnemyHp = D(0);
        this.isFighting = false;
        sound.playJutsu();
        sound.playLevelUp();

        const enemy = GAUNTLET_ENEMIES.find(e => e.id === this.currentEnemyId);
        const wasFirstClear = !this.gameState.gauntlet.defeated_ids[this.currentEnemyId];

        this.gameState.gauntlet.defeated_ids[this.currentEnemyId] = true;
        if (this.currentEnemyId > (this.gameState.gauntlet.highest_defeated || 0)) {
            this.gameState.gauntlet.highest_defeated = this.currentEnemyId;
        }

        let rewardChakra = D(enemy.baseHp).mul(0.35);
        let rewardAncestral = Math.max(1, Math.floor(this.currentEnemyId / 10));

        this.gameState.chakra = D(this.gameState.chakra).add(rewardChakra);
        if (wasFirstClear) {
            this.gameState.prestige_points = (this.gameState.prestige_points || 0) + rewardAncestral;
            alert(`🎉 INIMIGO DERROTADO: ${enemy.name}!\n\nRecompensa de Primeira Vitória:\n+${formatBigNumber(rewardChakra)} Chakra\n+${rewardAncestral} Chakra Ancestral!`);
        } else {
            alert(`⚔️ Treino Concluído contra ${enemy.name}!\n+${formatBigNumber(rewardChakra)} Chakra`);
        }

        this.saveFn();
        this.updateDomFn();

        // Advance to next enemy if available
        if (this.currentEnemyId < GAUNTLET_ENEMIES.length) {
            this.selectEnemy(this.currentEnemyId + 1);
        } else {
            this.renderUI();
        }
    }

    renderUI() {
        const container = document.getElementById("gauntlet-container");
        if (!container) return;

        const currentEnemy = GAUNTLET_ENEMIES.find(e => e.id === this.currentEnemyId) || GAUNTLET_ENEMIES[0];
        const hpPercent = this.currentEnemyMaxHp.gt(0) 
            ? Math.max(0, Math.min(100, this.currentEnemyHp.div(this.currentEnemyMaxHp).toNumber() * 100))
            : 0;

        const arcs = ["Todos", "Clássico", "Filler Clássico", "Shippuden", "Filler Shippuden", "Guerra & Otsutsuki"];

        let html = `
            <div class="gauntlet-header">
                <h3>⚔️ Gauntlet Shinobi: Mais de 100 Desafios Cronológicos</h3>
                <p>Derrote mais de 100 oponentes icônicos em ordem histórica e colete recompensas lendárias de Chakra e Prestígio!</p>
                <div class="gauntlet-filters">
                    ${arcs.map(a => `
                        <button class="filter-chip ${this.filterArc === a ? 'active' : ''}" 
                                onclick="window.gauntletManager.setFilter('${a}')">${a}</button>
                    `).join('')}
                </div>
            </div>

            <!-- Arena de Batalha Ativa -->
            <div class="gauntlet-battle-stage">
                <div class="boss-card">
                    <div class="boss-avatar">${currentEnemy.avatar}</div>
                    <div class="boss-info">
                        <div class="boss-meta">#${currentEnemy.id} [${currentEnemy.arc}]</div>
                        <h2 class="boss-name">${currentEnemy.name}</h2>
                        <span class="boss-title">${currentEnemy.title}</span>

                        <div class="boss-hp-container">
                            <div class="meter-track" style="height: 18px; margin-top: 8px;">
                                <div id="boss-hp-bar" class="meter-fill fill-red" style="width: ${hpPercent}%;"></div>
                            </div>
                            <div class="boss-hp-text">
                                <span id="boss-hp-val">${formatBigNumber(this.currentEnemyHp)} / ${formatBigNumber(this.currentEnemyMaxHp)} HP</span>
                                <span id="boss-timer-val" class="boss-timer">⏳ ${this.timeRemaining.toFixed(1)}s</span>
                            </div>
                        </div>

                        <div class="boss-actions">
                            <button id="gauntlet-attack-btn" class="gauntlet-strike-btn" onclick="window.chakraGauntletAttack()">
                                💥 ATACAR COM CHAKRA!
                            </button>
                            ${!this.isFighting ? `
                                <button class="gauntlet-retry-btn" onclick="window.gauntletManager.selectEnemy(${this.currentEnemyId})">
                                    🔄 Tentar Novamente
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lista Cronológica de Inimigos -->
            <div class="gauntlet-list-wrapper">
                <h4>Lista Cronológica de Oponentes (${GAUNTLET_ENEMIES.length} Inimigos)</h4>
                <div class="gauntlet-grid">
        `;

        GAUNTLET_ENEMIES.forEach(e => {
            if (this.filterArc !== "Todos" && e.arc !== this.filterArc) return;

            const isDefeated = !!this.gameState.gauntlet.defeated_ids[e.id];
            const isCurrent = this.currentEnemyId === e.id;
            const isUnlocked = e.id <= (this.gameState.gauntlet.highest_defeated || 0) + 1;

            html += `
                <div class="gauntlet-slot ${isDefeated ? 'slot-cleared' : (isCurrent ? 'slot-current' : (isUnlocked ? 'slot-available' : 'slot-locked'))}"
                     onclick="${isUnlocked ? `window.gauntletManager.selectEnemy(${e.id})` : ''}">
                    <div class="slot-id">#${e.id}</div>
                    <div class="slot-avatar">${e.avatar}</div>
                    <div class="slot-details">
                        <span class="slot-name">${e.name}</span>
                        <span class="slot-hp">HP: ${formatBigNumber(D(e.baseHp))}</span>
                    </div>
                    <div class="slot-status">
                        ${isDefeated ? '🏆 Derrotado' : (isCurrent ? '⚔️ Lutando' : (isUnlocked ? 'Desafiar' : '🔒'))}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    setFilter(arc) {
        this.filterArc = arc;
        this.renderUI();
    }

    updateCombatDOM() {
        const hpBar = document.getElementById("boss-hp-bar");
        const hpVal = document.getElementById("boss-hp-val");
        const timerVal = document.getElementById("boss-timer-val");

        if (hpBar) {
            const hpPercent = this.currentEnemyMaxHp.gt(0) 
                ? Math.max(0, Math.min(100, this.currentEnemyHp.div(this.currentEnemyMaxHp).toNumber() * 100))
                : 0;
            hpBar.style.width = `${hpPercent}%`;
        }

        if (hpVal) {
            hpVal.innerText = `${formatBigNumber(this.currentEnemyHp)} / ${formatBigNumber(this.currentEnemyMaxHp)} HP`;
        }

        if (timerVal) {
            timerVal.innerText = `⏳ ${this.timeRemaining.toFixed(1)}s`;
            if (this.timeRemaining < 6) {
                timerVal.style.color = "#ff1744";
            } else {
                timerVal.style.color = "#ffab00";
            }
        }
    }
}

export const gauntletManager = new GauntletManager();
window.gauntletManager = gauntletManager;
