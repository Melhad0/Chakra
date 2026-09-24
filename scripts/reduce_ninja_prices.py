import re
import math

game_path = r"C:\Users\Aluno\Downloads\Chakra\game.js"
with open(game_path, 'r', encoding='utf-8') as f:
    game = f.read()

start_idx = game.find('export const BASE_COSTS = {')
if start_idx == -1:
    print("Error: Could not find BASE_COSTS in game.js")
    exit(1)

end_idx = game.find('};', start_idx) + 2
block = game[start_idx:end_idx]

# Parse key-values
new_costs = {}
lines = block.split('\n')
new_lines = []
for line in lines:
    # Match key: value
    match = re.search(r'(\w+):\s*(\d+),?', line)
    if match:
        key = match.group(1)
        val = int(match.group(2))
        new_val = int(math.ceil(val * 0.65)) # 35% reduction
        new_costs[key] = new_val
        # Replace the original value in the line
        new_line = re.sub(rf'\b{val}\b', f'{new_val}', line)
        new_lines.append(new_line)
    else:
        new_lines.append(line)

new_block = '\n'.join(new_lines)
game = game.replace(block, new_block)

with open(game_path, 'w', encoding='utf-8') as f:
    f.write(game)

print("Successfully reduced BASE_COSTS in game.js by 35%!")

# Now update index.html static cost text
html_path = r"C:\Users\Aluno\Downloads\Chakra\index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

def format_num_simple(num):
    if num < 1000:
        return f"{num:,}"
    suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
    i = int(math.floor(math.log10(num) / 3))
    if i >= len(suffixes):
        return f"{num:.2e}"
    formatted = num / (10 ** (i * 3))
    formatted_str = f"{formatted:.1f}".replace(".0", "")
    return f"{formatted_str}{suffixes[i]}"

for key, new_val in new_costs.items():
    formatted_cost = format_num_simple(new_val)
    # Match: <span id="cost-[key]" class="gen-cost">Custo: [anything] Chakra</span>
    # and replace with the new cost
    pattern = rf'(id="cost-{key}" class="gen-cost">Custo:)(.*?)(Chakra)'
    replacement = rf'\1 {formatted_cost} \3'
    html = re.sub(pattern, replacement, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Successfully updated static costs in index.html!")
