<p align="center">
  <img src="https://img.shields.io/badge/chakra-clicker-F59E0B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMjEgMTVhMiAyIDAgMCAxLTIgMkg3bC00IDRWNWE0IDIgMCAwIDEgMi0yaDE0YTIgMiAwIDAgMSAyIDJ6Ii8+PC9zdmc+" alt="Chakra Clicker" />
</p>

<h1 align="center">⚡ Chakra Clicker ⚡</h1>

<p align="center">
  <strong>Recrute o exército ninja definitivo, desbloqueie os Oito Portões Internos e ascenda ao patamar de Deus Otsutsuki — um clique de cada vez.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Engine-React_18_+_Vite_5-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Lang-TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/State-Zustand_4-6D3F1E?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Backend-Flask_+_Neon_Postgres-000?style=flat-square&logo=postgresql&logoColor=white" alt="Flask + Neon" />
  <img src="https://img.shields.io/badge/Math-break__infinity.js-FF6B6B?style=flat-square" alt="break_infinity.js" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/Versão-2.0.0-F59E0B?style=flat-square" alt="v2.0.0" />
</p>

<p align="center">
  <code>📸 Espaço reservado para Screenshot / GIF da Gameplay</code>
</p>

---

## 📜 Visão Geral & Enredo

**Chakra Clicker** é um **idle/clicker game incremental** ambientado no universo ninja de Naruto, construído como uma Single Page Application reativa com arquitetura desacoplada de game loop determinístico.

Você assume o papel de um jovem aspirante da **Academia Ninja de Konoha**. Seu objetivo é acumular **chakra** através de cliques manuais e geradores automáticos (tropas), investir em **técnicas**, subir de **patente shinobi**, enfrentar **chefes lendários** em um gauntlet roguelike, forjar **armas raras** e, eventualmente, **renascer** (prestígio) para desbloquear a **Árvore Genealógica de Clãs** — uma progressão meta que transcende ciclos de jogo.

A progressão escala de **0.5 chakra/s** (Estudantes da Academia) até produtividades na faixa de **10^30 chakra/s** (Shibai Otsutsuki), suportada pela biblioteca `break_infinity.js` para aritmética de números arbitrariamente grandes.

---

## 🎮 Como Jogar — Mapa de Controles

| Entrada | Ação |
|---|---|
| **Clique Esquerdo** no Palco Central | Gerar chakra manual (com floating numbers e shockwaves cinéticas) |
| **Toque / Tap** (Mobile) | Mesmo efeito do clique — touch-friendly |
| **ESC** | Retornar à visão principal do Cockpit Shinobi |
| **Botões da Navbar** | Navegar entre módulos: Desafios, Missões, Inventário, Rankings, etc. |
| **🔊 / 🔇** (Navbar) | Toggle de áudio procedural (SFX sintetizado via Web Audio API) |
| **#** (Navbar) | Alternar entre notação por sufixos (K, M, B, T…) e científica (1.23e15) |
| **⚡** (Navbar) | Toggle do Modo Cinético (partículas, tremor, screen shake em crits) |
| **Painéis Laterais** (◀ ▶) | Expandir/colapsar sidebars do Cockpit (Economy / Operations) |

---

## ⚙️ Mecânicas & Funcionalidades

### 🏯 Economia & Geradores (42 Tropas)

- **42 tropas** organizadas em 5 tiers progressivos: **Iniciante** → **Elite** → **Lendário** → **Cósmico** → **Divino**
- Cada tropa possui **lore canônico**, custo exponencial com inflação geométrica escalonada (1.18× → 1.22× → 1.28× por patamar de nível) e produção de chakra por segundo (CPS)
- Compras em modo **×1, ×10, ×25, ×100** ou **MAX**, com suporte a **venda** com reembolso parcial
- **Marcos de Nível** (milestones) que concedem bônus passivos ao atingir níveis específicos (25, 50, 75, 100, 150, 200)

### 🔮 Técnicas & Melhorias (27+ Upgrades)

- **Técnicas ninja** com cadeias evolutivas (v1 → v2 → v3): Fūinjutsu, Ninjutsu, Taijutsu
- Upgrades globais: multiplicadores de CPS (×2, ×5, ×8, ×10), conversão CPS→Clique, redução de custo de geradores
- Desbloqueio temático (Rasengan, Manto da Kyuubi, Susano'o Perfeito, Tsukuyomi Infinito, Fruto da Árvore Divina…)

### 🚪 Oito Portões Internos (Hachimon Tonkō)

- **8 Portões** desbloqueáveis com custo crescente de chakra
- Ativação temporária com **multiplicador massivo de CPS** (até 80×), seguida de período de exaustão muscular
- Sidebar dedicada com visualização do estado de cada portão

### 🌳 Árvore Genealógica de Clãs (Prestígio)

- Sistema de **Renascimento Shinobi** que reseta o progresso em troca de **Chakra Ancestral**
- **60 nós** distribuídos em 5 branches: **Raiz**, **Senju**, **Uchiha**, **Hyūga** e **Ōtsutsuki**
- Cada nó concede bônus permanentes: multiplicadores de CPS, poder de clique, chance de crítico, dano crítico e multiplicador de recompensas
- Revelação progressiva dos nós por compra

### ⚔️ Gauntlet Roguelike — Arena de Desafios

- **125+ chefes canônicos** organizados em arcos narrativos: Clássico, Shippuden, Guerra & Ōtsutsuki, Boruto & Pós-Guerra
- Cada chefe possui **HP escalável**, temporizador de batalha, mecânica exclusiva (escudos, regeneração, veneno, QTEs…), loot temático e recompensas de chakra + XP
- **Loot de boss**: 10 drops temáticos por chefe com sistema de raridades (Básico → Divino → ADM)
- **Auto-avanço** e **auto-loop** para farming automático
- **Sistema RPG de Combate**: nível 1-700 com atributos distribuíveis (Força / Vitalidade / Agilidade)

### 📋 Missões Shinobi (Ranks E a SS)

- **Quadro de missões** com briefing narrativo, escolhas táticas e probabilidade de sucesso
- Cada missão requer patente mínima e possui tempo de execução
- **Minigames** embutidos que concedem bônus de taxa de sucesso
- Recompensas: chakra, chakra ancestral, bilhetes gacha, fragmentos de forja, buffs temporários, multiplicadores permanentes
- Penalidades de falha: exaustão, drenagem de chakra, cooldown

### 🎰 Pavilhão Gacha & Forja Lendária

- **Templo de Invocação** com pulls ×1 e ×10 usando bilhetes ganhos em missões e boss fights
- **Forja de Armas Lendárias** usando fragmentos de forja com catálogo de receitas
- **Refinamento** de equipamentos equipados para subir nível de refinação
- **Desmontagem** de itens para obter fragmentos

### 🎒 Inventário RPG & Afinidade Elemental

- **Paper Doll** com **11 slots** de equipamento: Elmo, Peitoral, Luvas, Botas, Capa, Mochila, Colar, Máscara, Arma Corpo a Corpo, Arma de Longo Alcance, Runa
- **10 níveis de raridade**: Básico, Comum, Incomum, Raro, Muito Raro, Épico, Lendário, Mítico, Divino, ADM
- **5 Afinidades Elementais** (Katon, Fūton, Raiton, Doton, Suiton) com sistema de sacrifício elemental
- Mochila com filtros por raridade e classe de equipamento

### 🏅 Patentes & Promoções Shinobi

- **Hierarquia completa** de patentes: Estudante → Genin → Chūnin → Jōnin → ANBU → Sannin → Kage → Sábio → Deus Shinobi
- **Missões de promoção** sequenciais para ascender de patamar
- **Recompensas exclusivas** por patente: descontos de custo, multiplicadores, novos ranks de missão desbloqueados

### 🏆 Rankings & Leaderboards

- **Quadro de Honra Global** sincronizado com Neon Postgres (leaderboard em tempo real)
- Ranking por chakra total, nível de combate, chefes derrotados e patente

### 🎁 Recompensas de Presença Online

- **Sistema de provisões** com metas de tempo online perpétuas
- Recompensas escalonadas por tier de presença
- Buff temporário de CPS ao resgatar recompensas

### 💬 Chat Shinobi da Aldeia

- Chat integrado com **3 canais** (Geral, Clãs, Anúncios)
- Mensagens ambientais simuladas da comunidade
- Sistema de **reações com emoji** e picker de emojis rápidos

### 🔊 Motor de Áudio Procedural

- **SFX 100% sintetizado via Web Audio API** — sem arquivos de áudio externos
- Efeitos sonoros distintos: clique, crítico, compra, level up, jutsu, sucesso de missão, falha, drop mítico
- Toggle de mute com persistência em `localStorage`

### 💾 Salvamento & Persistência

- **Auto-save** a cada 10 segundos em `localStorage`
- **Save ao fechar** a aba (`beforeunload`)
- **Cloud Save** sincronizado com **Neon Postgres** para contas autenticadas
- Cada usuário possui sua própria chave de save isolada

---

## 🏗️ Arquitetura Técnica

```
src/
├── engine/                    # Núcleo do motor de jogo
│   ├── GameLoop.ts            # Loop desacoplado: 20 ticks lógicos/s (fixo) + 60 FPS render
│   ├── BigNumber.ts           # Wrapper break_infinity.js com formatação e notação dinâmica
│   ├── formulas.ts            # Fórmulas de custo, CPS, clique, desconto, prestígio, presença
│   ├── audio.ts               # Sintetizador procedural (Web Audio API) com 7 efeitos
│   └── data.ts                # 42 geradores, 27 upgrades e 8 portões (definições iniciais)
│
├── store/
│   └── useGameStore.ts        # Zustand store monolítico (~2500 linhas) com todo o estado do jogo
│
├── hooks/
│   ├── useGameLoop.ts         # Hook React: inicializa loop, auto-save e beforeunload
│   └── usePlaytime.ts         # Tracker de tempo online e contagem de recompensas
│
├── types/                     # 15 módulos de tipagem TypeScript
│   ├── auth.ts                # Schemas Zod para autenticação shinobi
│   ├── combat.ts              # Boss, Gauntlet, RPG stats, loot preview
│   ├── economy.ts             # Geradores e modos de loja
│   ├── inventory.ts           # 11 slots de gear, Paper Doll, materiais
│   ├── missions.ts            # Missões E-SS, escolhas táticas, outcomes
│   ├── prestige.ts            # Árvore de clãs, branches, nós
│   ├── rarity.ts              # 10 tiers de raridade com pesos estocásticos
│   ├── rankings.ts            # Patentes e definições de promoção
│   └── ...
│
├── constants/                 # Dados estáticos e catálogos
│   ├── upgrades.ts            # 27+ técnicas com evolução v1/v2/v3
│   ├── rankings.ts            # Hierarquia de 9 patentes e cálculos de rank
│   ├── missionsCatalog.ts     # Catálogo completo de missões (ranks E a SS)
│   ├── bossLootData.ts        # 10 drops temáticos × 125 chefes = 1250 definições
│   ├── clanNodes.ts           # 60 nós da Árvore Genealógica de Clãs
│   ├── gachaPool.ts           # Pool de invocação do Pavilhão Gacha
│   ├── forgeCatalog.ts        # Receitas da Forja Lendária
│   └── ...
│
├── data/
│   └── gauntletBosses.ts      # 125+ chefes com HP, mecânicas, lore e loot
│
├── components/
│   ├── core/                  # Palco de ação, background animado, Oito Portões
│   ├── layout/                # Navbar, CockpitLayout (3 colunas responsivas)
│   ├── economy/               # Painel econômico, cards de upgrade, lista de tropas
│   ├── challenges/            # Painel de operações, cenário de batalha, ranking dashboard
│   ├── views/                 # 7 views dedicadas (Challenges, ClanTree, Missions, Inventory…)
│   ├── missions/              # Componentes de missões e minigames
│   ├── chat/                  # Chat Shinobi (widget integrado)
│   ├── auth/                  # Login, cadastro, modal de autenticação
│   └── common/                # Badge, IconRenderer, modais, notificadores
│
├── config/
│   └── api.ts                 # URL da API com suporte a Vercel e local
│
└── App.tsx                    # Roteamento por estado, gate de auth, montagem de views
```

### Padrão do Game Loop

O motor utiliza um **loop fixo-variável desacoplado** (`GameEngineLoop`):

- **20 ticks lógicos por segundo** (50ms cada) — determinísticos, acumulados via `requestAnimationFrame`
- **Renderização visual** a 60 FPS (variável, sincronizada ao monitor)
- **Proteção contra espiral de morte**: delta time travado em 1000ms quando a aba fica suspensa
- O tick lógico processa: acúmulo de CPS, timers de buff/cooldown/exaustão, regeneração de boss, auto-save trigger

### Gerenciamento de Estado

Todo o estado do jogo vive em um único **Zustand store** (`useGameStore.ts`, ~2500 linhas), incluindo:

- Estado econômico (chakra, geradores, upgrades, clãs)
- Estado de combate (gauntlet, boss HP, atributos RPG)
- Estado de inventário (Paper Doll, mochila, afinidade elemental)
- Estado de missões, presença, chat, auth e navegação
- Actions (clickChakra, buyGenerator, tick, saveGame, loadGame…)

### Backend & Cloud

| Componente | Tecnologia |
|---|---|
| API REST | Flask (Python) com CORS |
| Banco de Dados | Neon Postgres Serverless (JSONB para saves) |
| Auth | Registro/Login com bcrypt hash (Werkzeug) |
| Deploy | Vercel (frontend Vite + API serverless Python) |
| Local Dev | `concurrently` orquestrando Flask (porta 5000) + Vite (porta 5173) |

---

## 🚀 Como Executar Localmente

### Pré-Requisitos

- **Node.js** ≥ 18 LTS ([nodejs.org](https://nodejs.org/))
- **Python** ≥ 3.10 ([python.org](https://www.python.org/))
- **Git** ([git-scm.com](https://git-scm.com/))
- *(Opcional)* Conta gratuita no [Neon](https://neon.tech) para cloud saves e leaderboards

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Melhad0/Chakra.git
cd Chakra

# 2. Instale as dependências do frontend
npm install

# 3. Crie o ambiente virtual Python e instale as dependências do backend
python -m venv .venv

# Windows:
.venv\Scripts\pip install -r requirements.txt

# Linux/macOS:
.venv/bin/pip install -r requirements.txt

# 4. (Opcional) Configure o banco de dados Neon
#    Copie .env.example para .env e preencha DATABASE_URL
cp .env.example .env
```

### Execução

```bash
# Opção 1 — Script orquestrador (Windows) — Recomendado
run.bat

# Opção 2 — Manualmente com concurrently
npm run dev:all

# Opção 3 — Apenas o frontend (sem backend/cloud saves)
npm run dev
```

O jogo estará disponível em **http://localhost:5173** e o backend em **http://localhost:5000**.

### Build de Produção

```bash
npm run build
npm run preview
```

---

## 📐 Stack Técnica Detalhada

| Camada | Tecnologias |
|---|---|
| **Frontend** | React 18, TypeScript 5, Vite 5, Tailwind CSS 3 |
| **Estado** | Zustand 4 (store reativo sem boilerplate) |
| **Matemática** | `break_infinity.js` (números até ~10^308) |
| **Ícones** | Lucide React (300+ ícones vetoriais) |
| **Validação** | Zod 4 (schemas de auth e dados) |
| **Áudio** | Web Audio API (sintetizador procedural nativo) |
| **Backend** | Flask 3 + Flask-CORS + Psycopg2 |
| **Database** | Neon PostgreSQL Serverless (JSONB, Free Tier) |
| **Deploy** | Vercel (rewrites para API serverless Python) |
| **Dev Tools** | Concurrently, PostCSS, Autoprefixer |

---

## 🎨 Créditos & Atribuição de Assets

| Recurso | Origem | Licença |
|---|---|---|
| **Ícones SVG** | [Lucide Icons](https://lucide.dev/) | ISC License |
| **Efeitos Sonoros** | Gerados proceduralmente via Web Audio API (código original) | — |
| **Sprites / Avatares** | Renderizados via CSS (gradientes, sombras e emoji Unicode) | — |
| **Backgrounds** | CSS puro (animações keyframe, gradientes radiais e partículas) | — |
| **Universo Naruto** | Referências temáticas a personagens e conceitos do universo criado por **Masashi Kishimoto** | Fan-made / Uso educacional |
| **Tipografia** | System font stack do Tailwind (sem fontes externas) | — |

> **Nota:** Este projeto é uma obra **fan-made educacional** e não possui afiliação, endosso ou licenciamento oficial da Shueisha, Pierrot, ou quaisquer detentores dos direitos de Naruto/Boruto. Todos os nomes e referências são utilizados exclusivamente para fins de estudo e entretenimento sem fins lucrativos.

---

## 📊 Números do Projeto

| Métrica | Valor |
|---|---|
| Tropas / Geradores | 42 |
| Técnicas / Upgrades | 27+ |
| Chefes do Gauntlet | 125+ |
| Nós da Árvore de Clãs | 60 |
| Missões | 35+ |
| Slots de Equipamento | 11 |
| Tiers de Raridade | 10 |
| Patentes Shinobi | 9 |
| Portões Internos | 8 |
| Canais de Chat | 3 |
| SFX Procedurais | 7 |

---

<p align="center">
  <sub>Feito com ⚡ chakra e ☕ café por <a href="https://github.com/Melhad0">@Melhad0</a></sub>
</p>
