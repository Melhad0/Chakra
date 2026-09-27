# 📜 Catálogo Oficial de Chefes do Gauntlet (Fases 1 a 40)
**Chakra Clicker: A Jornada Ninja — Sistema de Desafios & Batalhas**

Este documento cataloga todos os 40 chefes canônicos do sistema de Gauntlet, detalhando seus atributos, títulos, arcos, mecânicas de combate e recompensas exclusivas.

---

## 🧮 Fórmulas de Escalação de Chefes

- **Vida Máxima (HP)**: `HP(n) = 500 * (1.42)^(n - 1)`
- **Recompensa de Chakra**: `Bounty(n) = 250 * (1.18)^(n - 1)` (Limitado a no máximo `40 * CPS_estável`)
- **Dano de Ataque do Chefe**: `Dano(n) = 20 * (1.12)^(n - 1) + (n * 5)` (Mínimo: 15)
- **Intervalo de Ataque do Chefe**: `3.0 segundos` (Ataque telegrafado com barra de conjuração)
- **Recompensa de XP Shinobi**: `XP(n) = 250 * (n)^1.75`
- **Chance de Drop de Equipamento**: `P_drop(n) = max(0.5%, 25% * (0.96)^(n - 1))`

---

## 🟢 TIER 1: INICIAL / CHŪNIN (FASES 1 A 8)

### Fase #1: Mizuki
- **Título**: Forma Bestial (Poção de Fígado)
- **Patamar**: Chūnin Renegado
- **Arco**: Clássico (Prólogo)
- **Tempo Limite**: 30 segundos
- **Chakra Ancestral**: 1
- **Mecânica Especial**: `mizuki_rage` — *Poção de Fígado Mutagênica*
  - Concede 50% de redução de dano corporal nos primeiros 10 segundos de combate.
- **Drop Exclusivo**: Colete da Academia Rasgado (Armadura Comum) + Shuriken Gigante Enferrujada (Material)

### Fase #2: Ebisu & Força Policial de Konoha
- **Título**: Instrutor Especial & Patrulha da Folha
- **Patamar**: Especialista / Chūnin
- **Arco**: Clássico (Exame Chūnin)
- **Tempo Limite**: 25 segundos
- **Chakra Ancestral**: 1
- **Mecânica Especial**: `ebisu_rush` — *Cronômetro Rigoroso*
  - Teste de agilidade inicial: o tempo de combate é reduzido para apenas 25 segundos.
- **Drop Exclusivo**: Bandana Ninja de Treinamento Especial (Armadura Comum)

### Fase #3: Kankurō
- **Título**: Marionete Corvo / Veneno Oculto
- **Patamar**: Chūnin de Sunagakure
- **Arco**: Clássico (Invasão de Konoha)
- **Tempo Limite**: 30 segundos
- **Chakra Ancestral**: 1
- **Mecânica Especial**: `kankuro_poison` — *Névoa Venenosa da Marionete*
  - Espalha toxinas no ar; 20% de chance dos ataques manuais do jogador errarem o alvo.
- **Drop Exclusivo**: Capuz Negro das Areias (Elmo Comum) + Frasco de Veneno Concentrado (Material)

### Fase #4: Genno
- **Título**: O Armadilheiro de Fumaça
- **Patamar**: Chūnin / Especialista
- **Arco**: Filler Clássico
- **Tempo Limite**: 30 segundos
- **Chakra Ancestral**: 2
- **Mecânica Especial**: `standard` — *Mestre em Selos Explosivos*
  - Combate com dano constante sustentado por armadilhas de terreno.
- **Drop Exclusivo**: Bolsa de Selos Detonadores (Cinto Incomum)

### Fase #5: Amachi
- **Título**: Cientista do País do Mar
- **Patamar**: Jōnin Baixo
- **Arco**: Filler Clássico
- **Tempo Limite**: 30 segundos
- **Chakra Ancestral**: 2
- **Mecânica Especial**: `standard` — *Fisiologia Quimérica*
  - Pele e musculatura aquática resistente a ataques leves.
- **Drop Exclusivo**: Escamas Quiméricas do Oceano (Peitoral Incomum)

### Fase #6: Ishidate
- **Título**: Mestre da Petrificação
- **Patamar**: Jōnin Baixo
- **Arco**: Filme: A Lua Crescente
- **Tempo Limite**: 30 segundos
- **Chakra Ancestral**: 2
- **Mecânica Especial**: `standard` — *Manopla de Pedra*
  - Golpes pesados de petrificação com armadura de alta densidade mineral.
- **Drop Exclusivo**: Manopla Mecânica de Rocha (Luvas Incomuns)

### Fase #7: Dotō Kazahana
- **Título**: Tirano do País da Neve
- **Patamar**: Jōnin Regular
- **Arco**: Filme: O País da Neve
- **Tempo Limite**: 30 segundos
- **Chakra Ancestral**: 3
- **Mecânica Especial**: `standard` — *Armadura Negra de Chakra*
  - Absorve rajadas elementais e exige foco em dano concentrado.
- **Drop Exclusivo**: Colete de Chakra das Neves (Peitoral Raro)

### Fase #8: Shiranami
- **Título**: Mestre dos Selos do Clã Tsuchigumo
- **Patamar**: Jōnin Regular
- **Arco**: Filler Shippuden
- **Tempo Limite**: 30 segundos
- **Chakra Ancestral**: 3
- **Mecânica Especial**: `standard` — *Kanji de Contenção*
  - Conjura barreiras restritivas de caracteres kanji.
- **Drop Exclusivo**: Amuleto Protetor Tsuchigumo (Colar Raro)

---

## 🟡 TIER 2: JŌNIN / INVASÕES (FASES 9 A 21)

### Fase #9: Jirōbō
- **Título**: Selo Amaldiçoado Nível 2 / Prisão de Terra
- **Patamar**: Jōnin / Quarteto do Som
- **Arco**: Resgate de Sasuke
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 4
- **Mecânica Especial**: `jirobo_shield` — *Doton: Prisão da Cúpula de Terra*
  - Enquanto a vida do chefe estiver acima de 70%, o escudo de pedra anula o multiplicador de acertos críticos.
- **Drop Exclusivo**: Braçadeiras do Titã de Terra (Braçadeiras Raras)

### Fase #10: Sakon e Ukon
- **Título**: Selo Amaldiçoado Nível 2 / Fusão Celular
- **Patamar**: Jōnin / Quarteto do Som
- **Arco**: Resgate de Sasuke
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 4
- **Bônus Especial**: 3 Fragmentos de Armas da Forja
- **Mecânica Especial**: `sakon_regen` — *Parasitismo e Regeneração Celular*
  - Cura 2% da vida total por segundo caso o CPS do jogador seja menor que o limiar do chefe.
- **Drop Exclusivo**: Manto Duplo do Selo Amaldiçoado (Capa Rara)

### Fase #11: Tayuya
- **Título**: Selo Amaldiçoado Nível 2 / Três Ogros Doki
- **Patamar**: Jōnin / Quarteto do Som
- **Arco**: Resgate de Sasuke
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 4
- **Mecânica Especial**: `tayuya_drain` — *Melodia Fantasma dos Doki*
  - A flauta demoníaca drena 1% do saldo total de Chakra acumulado do jogador a cada 5 segundos.
- **Drop Exclusivo**: Flauta Demoníaca dos Doki (Arma Secundária Épica)

### Fase #12: Baki da Areia
- **Título**: Lâmina de Vento Invisível
- **Patamar**: Jōnin de Elite de Sunagakure
- **Arco**: Clássico (Invasão de Konoha)
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 5
- **Mecânica Especial**: `baki_wind` — *Corte de Vento Centrado*
  - Apenas cliques direcionados ao centro exato do selo rompem a barreira de vendaval.
- **Drop Exclusivo**: Lâmina de Vácuo Oculta (Arma Épica)

### Fase #13: Haido
- **Título**: Mestre de Gelel
- **Patamar**: Jōnin Alto
- **Arco**: Filme: A Pedra de Gelel
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 5
- **Mecânica Especial**: `standard` — *Regeneração Gelel*
  - Regeneração física acelerada e armadura de alta resistência mineral.
- **Drop Exclusivo**: Runa Encantada de Gelel (Runa Épica)

### Fase #14: Toroi da Nuvem
- **Título**: Usuário do Jiton Magnético
- **Patamar**: Jōnin de Elite
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 5
- **Mecânica Especial**: `standard` — *Shurikens Magnéticas*
  - Shurikens teleguiadas por campos eletromagnéticos acelerados.
- **Drop Exclusivo**: Anel de Magnetismo Jiton (Anel Épico)

### Fase #15: Gari da Pedra
- **Título**: Punho de Bakuton Explosivo
- **Patamar**: Jōnin de Elite
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 6
- **Mecânica Especial**: `standard` — *Impacto Detonante*
  - Golpes de taijutsu explosivo contínuo que desestabilizam o terreno.
- **Drop Exclusivo**: Luvas de Detonação Bakuton (Luvas Épicas)

### Fase #16: Kushimaru Kuriarare
- **Título**: Lâmina Costuradora (Nuibari)
- **Patamar**: Sete Espadachins da Névoa
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 6
- **Mecânica Especial**: `standard` — *Costura Mortal*
  - Fios metálicos ultrafinos que perfuram e aprisionam alvos em série.
- **Drop Exclusivo**: Nuibari - A Agulha Costuradora (Espada Épica)

### Fase #17: Jinpachi Munashi
- **Título**: Espada Explosiva (Shibuki)
- **Patamar**: Sete Espadachins da Névoa
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 6
- **Mecânica Especial**: `standard` — *Rolo de Detonação*
  - Rolos de pergaminhos explosivos desencadeando explosões sequenciais.
- **Drop Exclusivo**: Shibuki - Lâmina Explosiva (Espada Lendária)

### Fase #18: Chiyo Reanimada
- **Título**: Dez Marionetes de Monzaemon
- **Patamar**: Veterana de Elite / Quase-Kage
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 7
- **Mecânica Especial**: `chiyo_puppets` — *Esquadrão Branco de Monzaemon*
  - Invoca 10 marionetes de proteção; cada uma precisa ser destruída para expor a barra de vida principal de Chiyo.
- **Drop Exclusivo**: Fios de Chakra da Marionetista (Amuleto Lendário)

### Fase #19: Pakura da Areia
- **Título**: Heroína do Shakuton (Calor)
- **Patamar**: Jōnin Superior (Kekkei Genkai)
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 7
- **Mecânica Especial**: `standard` — *Esferas Incandescentes*
  - Liberação de vapor e dessecação instantânea de qualquer umidade no ar.
- **Drop Exclusivo**: Orbe de Calor Solar Shakuton (Runa Lendária)

### Fase #20: Fū Yamanaka & Torune Aburame
- **Título**: Guardiões da Raiz ANBU
- **Patamar**: Elite da Fundação ANBU
- **Arco**: Cúpula dos Cinco Kages
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 8
- **Bônus Especial**: 5 Fragmentos de Armas + 1 Ticket de Gacha
- **Mecânica Especial**: `standard` — *Nano-Insetos Tóxicos*
  - Enxames de insetos venenosos que destroem tecidos em escala microscópica.
- **Drop Exclusivo**: Máscara Tática da Raiz ANBU (Máscara Lendária)

### Fase #21: Guren
- **Título**: Mestra da Liberação de Cristal (Shōton)
- **Patamar**: Pré-Kage
- **Arco**: Filler Shippuden (Sanbi)
- **Tempo Limite**: 35 segundos
- **Chakra Ancestral**: 8
- **Mecânica Especial**: `standard` — *Labirinto de Cristal de Jade*
  - Barreiras cristalinas refratárias que diminuem a vulnerabilidade aos ataques.
- **Drop Exclusivo**: Armadura de Cristal Carmesim (Peitoral Lendário)

---

## 🔴 TIER 3: KAGE / LENDÁRIO (FASES 22 A 33)

### Fase #22: Mifune
- **Título**: Lâmina Kurosawa - Corte Iai
- **Patamar**: Mestre Samurai Supremo / Nível Kage
- **Arco**: Cúpula dos Kages / Quarta Guerra
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 10
- **Mecânica Especial**: `mifune_iai` — *Corte Iaidō Instantâneo*
  - A cada 8 segundos desferido um corte supersônico que silencia jutsus e bônus manuais de clique por 2 segundos.
- **Drop Exclusivo**: Katana Kurosawa dos Samurais (Espada Lendária)

### Fase #23: Shinnō
- **Título**: Mestre do Chakra Escuro
- **Patamar**: Kage Baixo
- **Arco**: Filme: Kizuna (Laços)
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 10
- **Mecânica Especial**: `standard` — *Oito Portões Obscuros*
  - Ativação dos 8 Portões Internos sem penalidade biológica de morte graças à energia negra.
- **Drop Exclusivo**: Faixas dos Oito Portões Negros (Braçadeiras Lendárias)

### Fase #24: Rasa
- **Título**: Quarto Kazekage (Pó de Ouro)
- **Patamar**: Kage Médio
- **Arco**: Clássico / Guerra Ninja
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 12
- **Mecânica Especial**: `standard` — *Muralha de Sakin*
  - Massa pesada de pó de ouro magnético que amortece impactos e rajadas.
- **Drop Exclusivo**: Manto Cerimonial do Kazekage (Capa Lendária)

### Fase #25: Hiruko
- **Título**: Quimera de Quatro Kekkei Genkai
- **Patamar**: Kage Médio / Alto
- **Arco**: Filme: Herdeiros da Vontade do Fogo
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 14
- **Mecânica Especial**: `standard` — *Síntese das Quatro Linhagens*
  - Absorção de energia (Meiton), armadura de aço (Kōton) e velocidade extrema (Jinton).
- **Drop Exclusivo**: Quimera Rúnica de Quatro Elementos (Runa Lendária)

### Fase #26: Danzō Shimura
- **Título**: Liberação de Madeira Incompleta & Baku
- **Patamar**: Kage Obscuro / Líder da Raiz
- **Arco**: Cúpula dos Cinco Kages
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 16
- **Mecânica Especial**: `danzo_baku` — *Vórtice Faminto do Baku*
  - A quimera mitológica suga o espaço em intervalos periódicos, diminuindo a velocidade dos ataques.
- **Drop Exclusivo**: Bastão Oculto com Lâmina de Vento (Arma Lendária)

### Fase #27: Muku / Demônio Satori
- **Título**: Terror da Prisão de Sangue
- **Patamar**: Kage Alto / Quase-Bijuu
- **Arco**: Filme: Blood Prison
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 18
- **Mecânica Especial**: `standard` — *Instinto de Esquiva Empática*
  - Leitura empática de medo e intenções que esquiva automaticamente de golpes não potencializados por Senjutsu.
- **Drop Exclusivo**: Asas Corrompidas de Satori (Capa Mítica)

### Fase #28: Mukade
- **Título**: Forma Ryūmyaku de Rōran
- **Patamar**: Kage Alto / Fortaleza Móvel
- **Arco**: Filme: A Torre Perdida
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 20
- **Mecânica Especial**: `standard` — *Manancial de Ryūmyaku*
  - Marionete colossal conectada às Linhas Ley infinitas de Rōran para auto-reparo contínuo.
- **Drop Exclusivo**: Núcleo Energético de Ryūmyaku (Amuleto Mítico)

### Fase #29: Kinkaku & Ginkaku
- **Título**: Manto da Raposa / Ferramentas Sagradas
- **Patamar**: Kage Histórico / Pseudo-Jinchūriki
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 22
- **Mecânica Especial**: `kinkaku_words` — *Benihisago: Palavra Proibida*
  - Gera comandos proibidos na tela; clicar na opção amaldiçoada consome 15% do tempo de combate restante.
- **Drop Exclusivo**: Corda da Clareza - Kōkinjō (Colar Mítico)

### Fase #30: Terceiro Raikage
- **Título**: Armadura Raiton & Quatro Dedos
- **Patamar**: Kage Lendário Supremo
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 25
- **Bônus Especial**: 8 Fragmentos de Armas + 1 Ticket de Gacha
- **Mecânica Especial**: `raikage_armor` — *Armadura Raiton Indestrutível*
  - **Imunidade absoluta a dano passivo (CPS)**: Sofre dano exclusivamente de cliques manuais e acertos críticos.
- **Drop Exclusivo**: Manopla Relâmpago do Nukite (Luvas Míticas)

### Fase #31: Muu
- **Título**: Segundo Tsuchikage - Jinton / Fissão
- **Patamar**: Kage Lendário
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 28
- **Mecânica Especial**: `muu_fission` — *Fissão Corpórea de Poeira*
  - Ao chegar em 50% de HP, divide-se em 2 corpos idênticos com barras paralelas de vida que devem ser derrotadas.
- **Drop Exclusivo**: Manto de Poeira Invisível (Capa Mítica)

### Fase #32: Hanzō da Salamandra
- **Título**: O Carrasco dos Três Sannin
- **Patamar**: Kage Histórico Lendário
- **Arco**: Segunda Guerra Ninja
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 30
- **Mecânica Especial**: `standard` — *Ibuse: Veneno da Salamandra Negra*
  - Névoa corrosiva constante que mina a vida e vigor do oponente.
- **Drop Exclusivo**: Foice Kusarigama Corrosiva (Arma Mítica)

### Fase #33: Gengetsu Hōzuki
- **Título**: Segundo Mizukage (Jōki Boi)
- **Patamar**: Kage Lendário
- **Arco**: Quarta Guerra Ninja
- **Tempo Limite**: 40 segundos
- **Chakra Ancestral**: 35
- **Mecânica Especial**: `standard` — *Jōki Boi & Miragem do Marisco*
  - Ilusão de miragens associada a clones de água e óleo em ciclos infinitos de explosões de vapor.
- **Drop Exclusivo**: Selo da Miragem do Marisco Gigante (Runa Mítica)

---

## 🟣 TIER 4: CONTINENTAL / DIVINO (FASES 34 A 40)

### Fase #34: Mōryō
- **Título**: Demônio do Chakra Sombrio
- **Patamar**: Ameaça Continental
- **Arco**: Filme: Shippuden O Filme
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 40
- **Mecânica Especial**: `standard` — *Legião Espectral Ancestral*
  - Exércitos de terracota sustentados por chakra sombrio de regeneração em massa.
- **Drop Exclusivo**: Coroa Espectral das Sombras (Elmo Mítico)

### Fase #35: Shin Uchiha
- **Título**: Telecinese de Lâminas & Múltiplos Mangekyōs
- **Patamar**: Quase-Divino / Superior a Kage
- **Arco**: Gaiden: O Sétimo Hokage
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 45
- **Mecânica Especial**: `standard` — *Dança das Lâminas Telecinéticas*
  - Projéteis perfurantes cirúrgicos guiados pela visão interconectada dos Sharingans.
- **Drop Exclusivo**: Lâmina Telecinética Mangekyō (Arma Mítica)

### Fase #36: Menma Uzumaki
- **Título**: Avatar das Sombras & Dai Rasenringu
- **Patamar**: Bijuu Completo / Avatar das Sombras
- **Arco**: Filme: Road to Ninja
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 50
- **Mecânica Especial**: `standard` — *Dai Rasenringu Devastador*
  - Anéis gravitacionais colapsantes com potência suficiente para obliterar nações inteiras.
- **Drop Exclusivo**: Manto da Raposa Negra de Nove Caudas (Peitoral Mítico)

### Fase #37: Toneri Otsutsuki
- **Título**: Modo Chakra do Tenseigan
- **Patamar**: Divino Planetário (Otsutsuki)
- **Arco**: O Filme: The Last
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 65
- **Mecânica Especial**: `toneri_qte` — *Espada de Prata Reencarnada (Ginshō Tenseibaku)*
  - Durante o duelo, canaliza o raio lunar: **o jogador deve acertar 3 cliques rápidos no selo de contenção em 1 segundo para evitar derrota imediata!**
- **Drop Exclusivo**: Esferas do Tenseigan Lunar (Runa Divina)

### Fase #38: Urashiki Otsutsuki
- **Título**: Pescador Celestial de Almas & Rinnegan
- **Patamar**: Divino (Otsutsuki)
- **Arco**: Boruto: Arco do Passado
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 80
- **Mecânica Especial**: `standard` — *Fisga Dimensional de Almas*
  - Vara mágica dimensional capaz de pescar e extrair o chakra do adversário à distância.
- **Drop Exclusivo**: Vara de Pesca Celestial do Rinnegan (Arma Divina)

### Fase #39: Kinshiki Otsutsuki
- **Título**: Titã Forjador de Armas de Chakra
- **Patamar**: Divino Máximo (Otsutsuki de Combate)
- **Arco**: Boruto: Exame Chunin
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 100
- **Mecânica Especial**: `standard` — *Arsenal Vermelho dos Céus*
  - Forja instantânea de machados colossais e alabardas de energia pura com impacto cataclísmico.
- **Drop Exclusivo**: Alabarda Escarlate de Kinshiki (Arma Divina)

### Fase #40: Isshiki Otsutsuki
- **Título**: Daikokuten / Cubos Negros de Compressão
- **Patamar**: Divino Supremo Absoluto
- **Arco**: Boruto: Arco de Kara
- **Tempo Limite**: 45 segundos
- **Chakra Ancestral**: 150
- **Bônus Especial**: 10 Fragmentos de Armas + 2 Tickets de Gacha
- **Mecânica Especial**: `isshiki_cubes` — *Cubos Negros de Daikokuten*
  - Faz chover monólitos atemporais pesados que **suprimem todos os multiplicadores da Árvore de Clãs** até serem estilhaçados por cliques rápidos.
- **Drop Exclusivo**: Cubo Negro de Compressão Temporal (Runa Suprema)
