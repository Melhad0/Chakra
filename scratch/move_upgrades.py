import os

html_path = r"C:\Users\Aluno\Downloads\Chakra\index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find upgrades section
start_tag = '<section class="upgrades-section">'
end_tag = '</section>'

start_idx = html.find(start_tag)
if start_idx == -1:
    print("Error: Could not find upgrades-section start tag")
    exit(1)

end_idx = html.find(end_tag, start_idx) + len(end_tag)

upgrades_block = html[start_idx:end_idx]

# Remove it from its original place
html_removed = html[:start_idx] + html[end_idx:]

# Find where right-panel starts
right_panel_tag = '<aside class="right-panel">'
rp_idx = html_removed.find(right_panel_tag)
if rp_idx == -1:
    print("Error: Could not find right-panel tag")
    exit(1)

# Clean upgrades block content to fit the new sidebar structure
clean_content = upgrades_block.replace('<section class="upgrades-section">', '').replace('</section>', '')
clean_content = clean_content.replace('<h2>Melhorias (Upgrades)</h2>', '')
clean_content = clean_content.replace('class="upgrades-grid"', 'class="upgrades-list-container"')

# Create the new sidebar
new_sidebar = f"""<!-- Coluna Upgrades: Melhorias -->
        <aside class="upgrades-panel">
            <h2>Melhorias</h2>
            <div class="upgrades-list">
                {clean_content.strip()}
            </div>
        </aside>
        
        """

# Insert the new sidebar before right-panel
html_final = html_removed[:rp_idx] + new_sidebar + html_removed[rp_idx:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_final)

print("Successfully moved upgrades section in index.html!")
