import os

# 1. Modify script.py
script_path = r"C:\Users\Aluno\Downloads\Chakra\script.py"
with open(script_path, 'r', encoding='utf-8') as f:
    script = f.read()

target_script = '"bandana_genin": False,'
replacement_script = """"bandana_genin": False,
        "sealing_scroll": False,
        "tactical_kunai": False,
        "tree_climbing": False,
        "ninja_sandals": False,
        "chakra_concentration": False,
        "shadow_clone_scroll": False,"""

if target_script in script:
    script = script.replace(target_script, replacement_script)
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script)
    print("Successfully updated script.py upgrades!")
else:
    print("Error: Could not update script.py (target not found)")

# 2. Modify game.js
game_path = r"C:\Users\Aluno\Downloads\Chakra\game.js"
with open(game_path, 'r', encoding='utf-8') as f:
    game = f.read()

# Add to state upgrades
target_game_state = 'bandana_genin: false,'
replacement_game_state = """bandana_genin: false,
        sealing_scroll: false,
        tactical_kunai: false,
        tree_climbing: false,
        ninja_sandals: false,
        chakra_concentration: false,
        shadow_clone_scroll: false,"""

game = game.replace(target_game_state, replacement_game_state)

# Add cost reduction logic
target_cost = 'const base = BASE_COSTS[key];'
replacement_cost = """let base = BASE_COSTS[key];
    if (gameState.upgrades.chakra_concentration) {
        base = Math.floor(base * 0.95);
    }"""
game = game.replace(target_cost, replacement_cost)

# Add gen multipliers inside recalculateStats
target_mult = """        if (key === 'shadow_clone' && gameState.upgrades.ninja_food_pill) {
            mult *= 2.0;
        }"""
replacement_mult = """        if (key === 'shadow_clone' && gameState.upgrades.ninja_food_pill) {
            mult *= 2.0;
        }
        if (key === 'academy_student' && gameState.upgrades.tree_climbing) {
            mult *= 2.0;
        }
        if (key === 'shadow_clone' && gameState.upgrades.shadow_clone_scroll) {
            mult *= 1.5;
        }"""
game = game.replace(target_mult, replacement_mult)

# Add global CPS multiplier
target_global_cps = 'if (gameState.upgrades.sage_mode) cps *= 3.0;'
replacement_global_cps = """if (gameState.upgrades.ninja_sandals) cps *= 1.1;
    if (gameState.upgrades.sage_mode) cps *= 3.0;"""
game = game.replace(target_global_cps, replacement_global_cps)

# Add click power modifiers
target_click = 'if (gameState.upgrades.bandana_genin) clickPower *= 1.5;'
replacement_click = """if (gameState.upgrades.sealing_scroll) clickPower += 0.1 * (gameState.generators.shadow_clone || 0);
    if (gameState.upgrades.tactical_kunai) clickPower *= 1.25;
    if (gameState.upgrades.bandana_genin) clickPower *= 1.5;"""
game = game.replace(target_click, replacement_click)

with open(game_path, 'w', encoding='utf-8') as f:
    f.write(game)
print("Successfully updated game.js stats and state logic!")

# 3. Modify index.html
html_path = r"C:\Users\Aluno\Downloads\Chakra\index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

target_html = '<!-- Bandana Genin -->'
replacement_html = """<!-- Pergaminho de Selamento -->
                        <button id="up-sealing_scroll" class="upgrade-btn" onclick="buyUpgrade('sealing_scroll', 500)">
                            <div class="up-info">
                                <span class="up-title">📜 Selo de Armazenamento</span>
                                <span class="up-desc">Clones geram +0.1 de poder por clique</span>
                                <span class="up-cost">Custo: 500 Chakra</span>
                            </div>
                        </button>

                        <!-- Kunai Tática -->
                        <button id="up-tactical_kunai" class="upgrade-btn" onclick="buyUpgrade('tactical_kunai', 1000)">
                            <div class="up-info">
                                <span class="up-title">🗡️ Kunai Tática</span>
                                <span class="up-desc">Cliques manuais +25% de poder base</span>
                                <span class="up-cost">Custo: 1.000 Chakra</span>
                            </div>
                        </button>

                        <!-- Treino de Árvore -->
                        <button id="up-tree_climbing" class="upgrade-btn" onclick="buyUpgrade('tree_climbing', 1800)">
                            <div class="up-info">
                                <span class="up-title">🌳 Escalada em Árvores</span>
                                <span class="up-desc">Estudantes com 2x mais CPS</span>
                                <span class="up-cost">Custo: 1.800 Chakra</span>
                            </div>
                        </button>

                        <!-- Sandálias Ninja Reforçadas -->
                        <button id="up-ninja_sandals" class="upgrade-btn" onclick="buyUpgrade('ninja_sandals', 3000)">
                            <div class="up-info">
                                <span class="up-title">🥾 Sandálias Reforçadas</span>
                                <span class="up-desc">Todo o CPS global +10%</span>
                                <span class="up-cost">Custo: 3.000 Chakra</span>
                            </div>
                        </button>

                        <!-- Concentração de Chakra -->
                        <button id="up-chakra_concentration" class="upgrade-btn" onclick="buyUpgrade('chakra_concentration', 4500)">
                            <div class="up-info">
                                <span class="up-title">🌀 Concentração Mental</span>
                                <span class="up-desc">Reduz custo dos aliados em 5%</span>
                                <span class="up-cost">Custo: 4.500 Chakra</span>
                            </div>
                        </button>

                        <!-- Pergaminho de Clone Rápido -->
                        <button id="up-shadow_clone_scroll" class="upgrade-btn" onclick="buyUpgrade('shadow_clone_scroll', 7500)">
                            <div class="up-info">
                                <span class="up-title">👥 Rápida Replicação</span>
                                <span class="up-desc">Clones das Sombras +50% eficientes</span>
                                <span class="up-cost">Custo: 7.500 Chakra</span>
                            </div>
                        </button>

                        <!-- Bandana Genin -->"""

if target_html in html:
    html = html.replace(target_html, replacement_html)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Successfully updated index.html with new upgrades markup!")
else:
    print("Error: Could not update index.html (target_html not found)")
