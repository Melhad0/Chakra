# Skill: Desenvolvedor de Web Games - Projeto "Naruto Chakra Clicker"

## 🎯 Objetivo Principal
Você é um Desenvolvedor Full-Stack Especialista em jogos incrementais (estilo Cookie Clicker). Sua tarefa é criar um jogo web completo com o tema **NARUTO**, utilizando **HTML**, **CSS** e **Python** (via Flask ou FastAPI para gerenciar o backend, rotas e salvamento de estado, além de JavaScript básico ou PyScript para a interatividade do DOM no frontend).

---

## 🎨 Tema e Identidade Visual
* **Nome do Jogo:** Chakra Clicker: A Jornada Ninja
* **Paleta de Cores:** Laranja (clássico do Naruto), Preto, Azul (representando Chakra) e Vermelho (representando a Kyuubi).
* **Estilo:** Interface limpa, responsiva, com fontes que remetam a animes/cultura oriental e efeitos visuais ao clicar.

---

## ⚙️ Mecânicas Centrais do Jogo

### 1. Recurso Principal: Chakra
* A moeda principal do jogo é o **Chakra**.
* **Botão de Clique Central:** Um ícone grande de um **Selo de Mão** ou **Símbolo de Konoha**. Ao clicar, o jogador gera Chakra.
* Deve haver partículas flutuantes (+1 Chakra) sempre que o jogador clicar.

### 2. Edifícios / Geradores Passivos (Chakra por Segundo - CPS)
O jogador pode gastar Chakra acumulado para recrutar ninjas que geram Chakra automaticamente.
* **Clone das Sombras:** Gera 1 Chakra/segundo (Custo base: 15 Chakra)
* **Genin (ex: Konohamaru):** Gera 5 Chakra/segundo (Custo base: 100 Chakra)
* **Chunin (ex: Iruka):** Gera 25 Chakra/segundo (Custo base: 500 Chakra)
* **Jonin (ex: Kakashi):** Gera 100 Chakra/segundo (Custo base: 3.000 Chakra)
* **ANBU (ex: Itachi):** Gera 400 Chakra/segundo (Custo base: 10.000 Chakra)
* **Sannin Lenda (ex: Jiraiya):** Gera 2.000 Chakra/segundo (Custo base: 50.000 Chakra)
* **Kage (ex: Minato/Hashirama):** Gera 10.000 Chakra/segundo (Custo base: 1.000.000 Chakra)
* *Regra de Custo:* Cada vez que um gerador é comprado, seu custo aumenta em 15% (fórmula: `custo_base * 1.15 ^ quantidade`).

### 3. Upgrades / Melhorias
Melhorias únicas que o jogador pode comprar para multiplicar seus ganhos:
* **Bandana Genin:** O clique manual passa a gerar 2x mais Chakra.
* **Pílula de Comida Ninja:** Aumenta a eficiência dos Clones das Sombras em 100%.
* **Sharingan:** Aumenta a eficiência dos Jonin e ANBU.
* **Modo Sábio (Senjutsu):** Multiplica todo o CPS (Chakra por Segundo) global em 3x.
* **Manto da Kyuubi:** O clique manual passa a valer 1% do seu CPS total.

### 4. Sistema de Salvar/Carregar (Python Backend)
* Utilize o Python para criar rotas de API (`/save` e `/load`).
* O estado do jogo (quantidade de Chakra, geradores comprados, upgrades ativos e timestamp do último salvamento) deve ser enviado via JSON para o backend Python e salvo em um arquivo `save.json` ou num banco de dados leve como SQLite.
* *Cálculo Offline:* Quando o jogador recarregar a página, o backend em Python deve calcular o tempo em que o jogo ficou fechado e conceder o Chakra correspondente.

---

## 🛠️ Arquitetura Exigida

Organize o projeto com a seguinte estrutura de arquivos:
1.  `app.py`: O servidor Python (Flask/FastAPI) com as rotas para servir a página e gerenciar o save/load.
2.  `templates/index.html`: O arquivo HTML principal com a estrutura da interface (Área de clique, Painel de Status, Loja de Upgrades, Loja de Geradores).
3.  `static/style.css`: Estilização completa do jogo, garantindo layout em grid ou flexbox (semelhante às 3 colunas do Cookie Clicker).
4.  `static/game.js`: A lógica de frontend lidando com a detecção de cliques, atualização do DOM a cada frame e envio de chamadas AJAX/Fetch para o servidor Python.

---

## 🚀 Instruções de Execução para o Agente
1.  **Passo 1:** Escreva o código do `app.py` configurando o servidor básico e o sistema de save.
2.  **Passo 2:** Crie o `index.html` organizando a tela em três áreas principais: O Símbolo de Clique (Esquerda), Os Status e Upgrades (Centro), e a Loja de Ninjas (Direita).
3.  **Passo 3:** Crie o `style.css` com foco total na temática de Naruto (use efeitos hover e animações de clique).
4.  **Passo 4:** Implemente o `game.js` com o Game Loop principal (atualização a cada segundo), cálculo matemático de escalonamento de custos e integração com o Python.

**Importante:** Forneça o código completo e funcional de todos os arquivos. Adicione comentários explicando onde e como o usuário pode substituir caminhos por imagens reais do anime (ex: `<img src="caminho_para_rasengan.png">`).