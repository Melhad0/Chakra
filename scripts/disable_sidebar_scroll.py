import os

css_path = r"C:\Users\Aluno\Downloads\Chakra\style.css"
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

start_idx = css.find('.left-panel.sidebar {')
if start_idx != -1:
    end_idx = css.find('}', start_idx)
    block = css[start_idx:end_idx]
    if 'overflow' not in block:
        css = css[:end_idx] + '    overflow: hidden; /* Disable scrolling completely */\n' + css[end_idx:]
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(css)
        print("Successfully disabled scroll on left sidebar!")
    else:
        print("Overflow already configured.")
else:
    print("Could not find .left-panel.sidebar class in CSS")
