import re

html_path = r"C:\Users\Aluno\Downloads\Chakra\index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the tab button
tab_pattern = r'\s*<button id="train-tab-chakra".*?</button>'
html = re.sub(tab_pattern, '', html)

# 2. Remove the game panel
panel_start = '<!-- JOGO 3: Controle de Chakra'
start_idx = html.find(panel_start)
if start_idx != -1:
    curr_idx = html.find('<div', start_idx)
    if curr_idx != -1:
        div_count = 1
        pos = curr_idx + 4
        while div_count > 0 and pos < len(html):
            next_open = html.find('<div', pos)
            next_close = html.find('</div>', pos)
            
            if next_close == -1:
                break
                
            if next_open != -1 and next_open < next_close:
                div_count += 1
                pos = next_open + 4
            else:
                div_count -= 1
                pos = next_close + 6
                
        end_idx = pos
        html = html[:start_idx] + html[end_idx:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Successfully removed Chakra Control game from index.html!")
