import os

# 1. Modify game.js
game_path = r"C:\Users\Aluno\Downloads\Chakra\game.js"
with open(game_path, 'r', encoding='utf-8') as f:
    game = f.read()

game = game.replace('academy_student: 0.1,', 'academy_student: 0.5,')

with open(game_path, 'w', encoding='utf-8') as f:
    f.write(game)
print("Updated game.js student CPS to 0.5!")

# 2. Modify script.py
script_path = r"C:\Users\Aluno\Downloads\Chakra\script.py"
with open(script_path, 'r', encoding='utf-8') as f:
    script = f.read()

script = script.replace('"academy_student": 0.1,', '"academy_student": 0.5,')

with open(script_path, 'w', encoding='utf-8') as f:
    f.write(script)
print("Updated script.py student CPS to 0.5!")

# 3. Modify index.html
html_path = r"C:\Users\Aluno\Downloads\Chakra\index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<span class="gen-cps">+0.1 CPS</span>', '<span class="gen-cps">+0.5 CPS</span>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html student CPS display to 0.5!")
