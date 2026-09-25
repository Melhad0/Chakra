# Chakra Clicker: A Jornada Ninja

Jogo incremental web (clicker) com temática inspirada no universo de Naruto. O jogador acumula Chakra através de cliques manuais e recrutamento passivo de shinobis, desbloqueia técnicas lendárias, evolui Bijuus, forja espadas e realiza renascimentos de prestígio.

---

## 🎮 Funcionalidades Principais

- **Geração de Chakra**:
  - Clique manual através do Selo de Mão com multiplicadores e efeitos visuais.
  - Recrutamento passivo de geradores: desde *Estudante da Academia* e *Clones das Sombras* até *Deuses Otsutsuki*.
  - Compra e venda em lotes (x1, x10, x100 ou Máximo).

- **Árvore de Upgrades & Técnicas**:
  - Dezenas de melhorias de clique e CPS (*Modo Sábio*, *Manto da Kyuubi*, *Esferas da Busca da Verdade*, etc.).
  - Sistema dos **8 Portões Internos** com bônus massivos temporários e mecânica de exaustão/colapso.

- **Mini-games de Treinamento**:
  - *Sequência de Selos de Jutsu*.
  - *Controle e Equilíbrio de Chakra*.
  - *Mecanismo de Aparar (Parry)*.

- **Missões & Invasões**:
  - Envio de esquadrões para missões de ranking D até S+.
  - Barra de progresso em tempo real e recompensas acumulativas.

- **Bijuus Lendárias**:
  - Escolha e evolução de Bestas com Cauda (de 1 a 10 Caudas).
  - Metas de estágio para desbloqueio de fusões e bônus de produção.

- **Forja Gacha de Armas**:
  - Coleta e refino de espadas ninja famosas (*Kubikiribocho*, *Samehada*, *Kusanagi*, *Totsuka*, *Hiramekarei*, *Kiba*).

- **Sistema de Prestígio (Renascimento)**:
  - Reinício de ciclo para ganho de *Chakra Ancestral*.
  - Árvore de melhorias permanentes de clã e linhagem sanguínea.

- **Autenticação & Economia Offline**:
  - Login e registro local para persistência de progresso por usuário.
  - Cálculo e coleta de Chakra gerado enquanto o jogador esteve offline.
  - Alternador de tema Claro / Escuro.

---

## 📁 Estrutura do Projeto

```text
chakra/
├── css/
│   └── style.css            # Folha de estilos central e design system
├── js/
│   ├── game.js              # Loop principal, geradores, upgrades e portões
│   ├── missions.js          # Sistema de missões e mini-games de treino
│   ├── gacha.js             # Forja e melhoria de espadas lendárias
│   ├── prestige.js          # Lógica de renascimento e Chakra Ancestral
│   └── login.js             # Validação e autenticação de usuários
├── docs/
│   ├── MARKDONW.md          # Diretrizes de desenvolvimento
│   └── SKILL.md             # Especificações técnicas do projeto
├── scripts/                 # Scripts auxiliares e utilitários em Python
├── index.html               # Interface principal do jogo
├── login.html               # Tela de login e cadastro shinobi
├── game.html                # Layout alternativo / legado
├── script.py                # Servidor backend Flask (API save/load e autenticação)
└── README.md
```

---

## 🚀 Como Executar

### Opção 1: Execução Automática Unificada ("Makerun" - Recomendado)

O projeto conta com um **Runner Orchestrator** inteligente que detecta ferramentas, cria o ambiente virtual `.venv`, instala dependências (`pip` e `npm`), limpa portas travadas (5000 e 5173), inicia ambos os servidores com logs coloridos e abre o navegador automaticamente:

- **Windows (PowerShell)**:
  ```powershell
  .\run.bat
  ```

- **Windows (CMD ou Duplo Clique)**:
  ```cmd
  run.bat
  ```
  *(Ou dê duplo clique no arquivo `run.bat` pelo Windows Explorer)*

- **Linux / macOS / WSL**:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```

- **GNU Make (Linux / macOS / WSL / Git Bash)**:
  ```bash
  make run
  ```
  *Digite `make help` para visualizar todos os comandos disponíveis (`make front`, `make back`, `make kill`, `make clean`).*

- **NPM Scripts**:
  ```bash
  npm run dev:all
  ```

---

### Opção 2: Execução Manual dos Serviços

Caso prefira iniciar cada serviço isoladamente em terminais separados:

1. **Backend Flask (Porta 5000)**:
   ```bash
   # Linux/macOS
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python script.py

   # Windows
   python -m venv .venv && .venv\Scripts\activate
   pip install -r requirements.txt
   python script.py
   ```

2. **Frontend Vite (Porta 5173)**:
   ```bash
   npm install
   npm run dev
   ```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5 Semântico, CSS3 Moderno (Variáveis CSS, Flexbox, Grid), JavaScript (ES6+ Modules).
- **Backend**: Python 3, Flask.
- **Tipografia**: Google Fonts (*Outfit*, *Shojumaru*).
