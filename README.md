# ⚡ Chakra Clicker: A Jornada Ninja (v2.0)

<p align="center">
  <img src="https://img.shields.io/badge/Versão-2.0.0-orange?style=for-the-badge&logo=react" alt="Versão 2.0" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Python-Flask%203.0-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Flask" />
  <img src="https://img.shields.io/badge/Database-Neon%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon Postgres" />
</p>

Um RPG incremental (clicker/idle) web de alta performance e imersão profunda ambientado no universo de **Naruto**. 

O jogador canaliza Chakra através de selos manuais, recruta legiões de shinobis, domina os 8 Portões Internos, forja equipamentos em um **Paper Doll rúnico de 11 slots**, enfrenta chefes lendários em combates em tempo real com atributos de RPG até o **Nível 700**, executa missões táticas e desperta kekkei genkai ancestrais através do ciclo de prestígio.

---

## 🌟 Principais Sistemas e Funcionalidades

### 🌀 1. Palco Central & Núcleo Econômico
- **Selo de Mão Interativo**: Clique manual reativo com detecção de coordenadas, partículas flutuantes dinâmicas (+Chakra), ondas de choque expansivas (*shockwaves*), acertos críticos e vibração de tela (*camera shake*).
- **Cenários Animados do Palco**: Alternância visual dinâmica entre a *Floresta de Konohagakure* e o mítico *Vale do Fim Noturno*.
- **Mais de 30 Geradores Shinobi**: De *Estudante da Academia* e *Clones das Sombras* a *Sannin Lendários*, *Hokages*, *Reencarnações de Indra/Asura* e *Deuses Otsutsuki*.
- **Compra e Venda em Lotes**: Modos de aquisição rápida `x1`, `x10`, `x100` e `MÁXIMO`.
- **Escalação Numérica Infinita**: Integração com a biblioteca `break_infinity.js` para cálculos com valores que superam `1e308` sem perda de precisão ou travamentos de ponto flutuante.

### ⚡ 2. Técnicas Ninja & Os Oito Portões Internos
- **Árvore de Upgrades Passivos**: Dezenas de aprimoramentos canônicos (*Pergaminho de Clones*, *Sharingan*, *Modo Sábio dos Sapos*, *Manto da Kyuubi*, *Esferas da Busca da Verdade*, etc.).
- **Liberação dos 8 Portões Internos**: Da *Abertura* ao lendário *Portão da Morte*.
  - Multiplicadores massivos de CPS global e poder de impacto por tempo limitado.
  - Mecânica de exaustão muscular e fadiga temporária pós-ativação, exigindo timing estratégico do jogador.

### ⚔️ 3. Gauntlet Roguelike & Combate RPG em Tempo Real
- **Progressão por Arcos Canônicos**: Dezenas de chefes escalonados organizados em arcos (*Clássico*, *Shippuden*, *Guerra Shinobi*, *Otsutsuki*).
- **Modos de Combate Duplos**:
  - `PUSH`: Avance na linha de chefes inéditos para desbloquear patamares mais altos.
  - `FARM`: Repita batalhas contra chefes já superados para coletar XP, ouro, fragmentos e equipamentos.
- **Sistema de Atributos RPG Shinobi (Nível 1 a 700)**:
  - **Força**: Aumenta exponencialmente o dano direto infligido aos chefes por clique.
  - **Vitalidade**: Expande os pontos de vida máximos (HP) do shinobi e sua resistência.
  - **Agilidade**: Amplia a taxa de acerto crítico e a chance de esquiva (*dodge*).
- **IA de Ataque dos Chefes & Esquiva Dinâmica**:
  - Chefes desfere ataques telegrafados com barras de conjuração em tempo real.
  - Botão de Esquiva reativo e sem tempos de recarga abusivos.
- **Cenário de Guerra Animado na Box de Duelo**:
  - Tempestade com relâmpagos e raios celestiais.
  - Fissuras incandescentes no solo com vazamento de chakra.
  - Detritos de pedras e meteoritos com física gravitacional de *Chibaku Tensei*.
  - Camada de fumaça volumétrica dupla, feixes solares divinos (*god rays*) e radar holográfico de combate.

### 🛡️ 4. Inventário & Paper Doll Rúnico de 11 Slots
- **Interface Estilo ARPG Clássico**:
  - 11 slots dedicados para equipar o shinobi: *Capacete/Protetor*, *Peitoral/Colete*, *Luvas/Manoplas*, *Botas/Sandálias*, *Arma Corpo a Corpo (Melee)*, *Arma de Longo Alcance (Ranged)*, *Máscara Shinobi*, *Capa/Manto*, *Mochila Tática*, *Colar/Amuleto* e *Runa/Magatama*.
- **Mochila Ninja com 32 Slots**: Organização visual de equipamentos e materiais com badges, filtros dinâmicos e painel de inspeção detalhado.
- **Sistema de 10 Tiers Oficiais de Raridade**:
  - `01. Básico` (#71717A - Cinza Neutro, borda fosca)
  - `02. Comum` (#15803D - Verde Terroso)
  - `03. Incomum` (#22C55E - Verde Vívido Jade, brilho esmeralda)
  - `04. Raro` (#1D4ED8 - Azul Safira Profundo)
  - `05. Muito Raro` (#00F0FF - Azul Neon Cyan Glow)
  - `06. Épico` (#A855F7 - Roxo Místico Astral)
  - `07. Lendário` (#EAB308 - Âmbar Dourado Solar)
  - `08. Mítico` (#EC4899 - Shimmer Prismático Arco-Íris Animado)
  - `09. Divino` (#FFFFFF - Luz Celestial Branca Estelar)
  - `10. ADM's` (#09090B - Vácuo Obsidiana Absoluta com Borda Cromada)
- **Armas Canônicas Dedicadas para os 40 Chefes**: Cada um dos 40 chefes do Gauntlet possui sua arma temática exclusiva distribuída coerentemente nos 10 tiers (desde a *Shuriken Gigante* de Mizuki até a *Lança Daikokuten* de Isshiki Otsutsuki).
- **Os 5 Grandes Elementos (Katon, Fūton, Raiton, Doton e Suiton)**:
  - Afinidade natal sorteada ao iniciar.
  - Sub-aba dedicada aos 5 Elementos com sistema de **Sacrifício Elemental** de armas excedentes (Épicas, Lendárias, Míticas, Divinas e ADM) para desbloquear novas naturezas de chakra.
  - Conquista do status primordial de **Shinobi Avatar**.

### 📜 5. Quadro de Missões Shinobi
- **Classificação por Dificuldade**: Missões de Rank **E**, **D**, **C**, **B**, **A**, **S** e **SS**.
- **Tomada de Decisões Táticas**: Escolhas contextuais com diferentes chances de sucesso, riscos de colapso e recompensas.
- **Recompensas Variadas**: Chakra em grande escala, multiplicadores permanentes de CPS, fragmentos de forja e tickets de invocação gacha.

### 🎖️ 6. Exame Chūnin & Promoções de Patamar
- **Hierarquia Oficial Shinobi**:
  - *Estudante da Academia* ➔ *Gennin* ➔ *Chūnin* ➔ *Tokubetsu Jōnin* ➔ *Jōnin de Elite* ➔ *Capitão ANBU* ➔ *Sannin Lendário* ➔ *Kage* ➔ *Sábio dos Seis Caminhos (Rikudou)*.
- **Missões Oficiais de Promoção**:
  - Examinadores canônicos (Kakashi, Anko, Ibiki, Mestres Sapos, Conselho de Anciãos, Hagoromo).
  - Pré-requisitos de cliques, CPS, chakra total e prestígios.
  - Desbloqueio de auras cosméticas douradas e bônus de produção permanentes.

### 🧬 7. Árvore de Clãs & Prestígio (Chakra Ancestral)
- **Renascimento Shinobi**: Reinicie seu ciclo acumulando *Chakra Ancestral* baseado no progresso da era anterior.
- **Nós de Linhagem Sanguínea (Kekkei Genkai)**:
  - **Uchiha**: Despertar do Sharingan, Mangekyō Sharingan Eterno e Susano'o Perfeito.
  - **Senju**: Vitalidade infinita e Liberação de Madeira (*Mokuton*).
  - **Hyuuga**: Visão 360 Graus do Byakugan e fechamento de Tenketsu (+50% em missões).
  - **Otsutsuki**: Consumo do Fruto Proibido de Chakra (multiplicadores massivos globais).

### 🎵 8. Sintetizador de Áudio Procedural (Web Audio API)
- **Motor Sonoro 100% Nativo**: Não requer downloads de arquivos `.mp3` ou `.wav` externos.
- Síntese de áudio em tempo real via osciladores harmônicos:
  - Feedback sutil de cliques manuais e acertos críticos brilhantes.
  - Sons de compra e upgrades na loja.
  - Fanfarras triunfais para conclusões de missões e promoções.
  - Acordes graves e ressonantes para derrotas no Gauntlet.
  - Controle de áudio global com persistência no LocalStorage.

### 🌐 9. Autenticação, Nuvem Neon Postgres & Economia Offline
- **IAM Shinobi Completo**: Sistema de registro e login com senhas protegidas por criptografia (Werkzeug Hash).
- **Modo Convidado (Guest)**: Permite iniciar a jornada imediatamente sem necessidade de registro prévio.
- **Persistência Híbrida de Dados**:
  - Armazenamento em nuvem com **Neon PostgreSQL** (tabelas serverless com tipo `JSONB`).
  - Fallback automático para armazenamento em arquivos locais (`saves/` e `users.json`).
  - Cache local instantâneo via `localStorage` versionado.
- **Cálculo de Progresso Offline**: Resgate justo de Chakra gerado enquanto o navegador esteve fechado.
- **Recompensas de Presença Online**: Bônus progressivos (*Rolling CPS Buffs*) para ninjas dedicados.
- **Ranking Global**: Leaderboards em tempo real integrados à API.

---

## 📁 Arquitetura do Repositório

```text
Chakra/
├── api/
│   └── index.py                    # Serverless Functions entrypoint (Vercel)
├── docs/
│   ├── MARKDONW.md                 # Diretrizes internas de design e desenvolvimento
│   └── SKILL.md                    # Especificações técnicas e mecânicas do jogo
├── scripts/                        # Utilitários de migração e balanceamento (Python/JS)
│   ├── migrate_to_neon.py          # Script de migração para Neon PostgreSQL
│   └── sanity_check_balance.js     # Verificador de integridade de dados e balanceamento
├── src/
│   ├── components/
│   │   ├── auth/                   # Modais de Login, Registro e Sessão Shinobi
│   │   ├── challenges/             # Arena de Batalha, Gauntlet, Cenário de Guerra e Radar
│   │   ├── common/                 # Modais utilitários, seletores de lote e ícones
│   │   ├── core/                   # Palco central de clique e backgrounds animados
│   │   ├── economy/                # Painéis de geradores, upgrades e lista de técnicas
│   │   ├── layout/                 # Navbar superior, Cockpit e HUD responsivo
│   │   └── views/                  # Telas modulares (Desafios, Inventário, Clãs, Missões, Ranks)
│   ├── config/                     # Configuração dinâmica de URLs de API (local e nuvem)
│   ├── constants/                  # Catálogos de chefes, missões, equipamentos e patentes
│   ├── engine/                     # BigNumber (break_infinity), GameLoop, Áudio Web API e Fórmulas
│   ├── store/                      # Zustand Store central (useGameStore) com persistência
│   ├── styles/                     # Tailwind CSS, camadas e temas personalizados
│   ├── types/                      # Definições completas de TypeScript (Combate, Itens, Ranks)
│   ├── App.tsx                     # Orquestrador de views e ciclo de renderização
│   └── main.tsx                    # Ponto de entrada React 18
├── index.html                      # Ponto de montagem da aplicação Vite
├── package.json                    # Dependências e scripts do ecossistema Node.js
├── script.py                       # Servidor backend Python Flask (Autenticação, Saves e Rankings)
├── requirements.txt                # Dependências Python (Flask, psycopg2, gunicorn)
├── .env.example                    # Modelo de variáveis de ambiente (Neon DB, portas, CORS)
├── Makefile                        # Automação de tarefas para Linux, macOS e Windows
├── run.bat                         # Runner inteligente de 1-clique para Windows
├── run.sh                          # Runner inteligente para Linux / macOS / WSL
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js**: Versão 18.0 ou superior instalada.
- **Python**: Versão 3.10 ou superior instalada.

---

### Opção 1: Execução Automática Unificada (Recomendado)

O projeto conta com um **Orquestrador Inteligente** que detecta ferramentas disponíveis, cria automaticamente o ambiente virtual `.venv`, instala dependências (`npm` e `pip`), libera portas travadas (`5000` e `5173`), inicia simultaneamente o backend e o frontend com logs sincronizados e abre o navegador automaticamente:

- **Windows (CMD, PowerShell ou Duplo Clique)**:
  ```cmd
  run.bat
  ```
  *(Ou dê duplo clique no arquivo `run.bat` pelo Explorador de Arquivos)*

- **Linux / macOS / WSL**:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```

- **GNU Make**:
  ```bash
  make run
  ```
  *(Execute `make help` para ver todos os comandos disponíveis)*

- **NPM Concurrently**:
  ```bash
  npm run dev:all
  ```

---

### Opção 2: Execução Manual dos Serviços

Caso deseje rodar os serviços individualmente em abas de terminal separadas:

#### 1. Configurar Variáveis de Ambiente (Opcional)
Copie o arquivo de exemplo e configure sua string de conexão Neon PostgreSQL (ou use o fallback local):
```bash
cp .env.example .env
```

#### 2. Iniciar o Backend Flask (Porta 5000)
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python script.py

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python script.py
```

#### 3. Iniciar o Frontend Vite (Porta 5173)
```bash
npm install
npm run dev
```

Acesse a aplicação no navegador em: **`http://localhost:5173`**.

---

## 🛠️ Comandos do Makefile

O `Makefile` incluído padroniza o ciclo de desenvolvimento em todos os sistemas operacionais:

| Comando | Descrição |
| :--- | :--- |
| `make run` | Instala dependências, libera portas e inicia Frontend + Backend em paralelo |
| `make front` | Inicia exclusivamente o servidor de desenvolvimento do Vite |
| `make back` | Inicia exclusivamente a API Flask do Python no ambiente `.venv` |
| `make kill` | Encerra processos que estejam prendendo as portas `5000` e `5173` |
| `make clean` | Remove arquivos de compilação temporários (`dist`, `.vite`, `__pycache__`) |
| `make clean-all`| Limpeza profunda (remove também `node_modules` e `.venv`) |
| `make help` | Exibe a lista formatada de todos os atalhos disponíveis |

---

## 🧰 Tecnologias Empregadas

- **Frontend Core**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 5](https://vitejs.dev/)
- **Estilização & Design**: [Tailwind CSS](https://tailwindcss.com/), Glassmorphism, Google Fonts (*Outfit*, *Shojumaru*)
- **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/) com persistência e subscrições otimizadas
- **Cálculo Numérico Arbitrário**: [break_infinity.js](https://github.com/Patashu/break_infinity.js) (escala além de `1e308`)
- **Iconografia**: [Lucide React](https://lucide.dev/)
- **Áudio**: [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) nativa com síntese senoidal e harmônica procedural
- **Backend & API**: [Python 3](https://www.python.org/), [Flask 3](https://flask.palletsprojects.com/), Flask-CORS, Gunicorn
- **Banco de Dados**: [Neon.tech](https://neon.tech/) (PostgreSQL Serverless com tabelas JSONB e pooling otimizado)
- **Deploy Serverless**: Compatível com [Vercel](https://vercel.com/) via `api/index.py` e [Render](https://render.com/)

---

## 📜 Licença & Isenção de Responsabilidade

Este projeto foi desenvolvido com finalidade de estudo, portfólio de engenharia de software e entretenimento de fãs.

> **Aviso Legal**: Os personagens, nomes, técnicas e elementos do universo de *Naruto* são marcas registradas e de propriedade intelectual de **Masashi Kishimoto**, **Shueisha**, **Studio Pierrot** e **TV Tokyo**. Este jogo não é comercial e não possui fins lucrativos.
