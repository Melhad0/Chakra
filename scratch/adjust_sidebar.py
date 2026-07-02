import os

css_path = r"C:\Users\Aluno\Downloads\Chakra\style.css"
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update left panel spacing
css = css.replace(
    'padding: 1.5rem 1rem;',
    'padding: 1rem 0.75rem;'
)
css = css.replace(
    'gap: 2rem;\n    z-index: 10;',
    'gap: 1rem;\n    z-index: 10;'
)

# 2. Update sidebar header spacing
css = css.replace(
    'padding: 1rem 0.85rem;',
    'padding: 0.75rem 0.5rem;'
)
css = css.replace(
    'margin-bottom: 0.5rem;',
    'margin-bottom: 0.25rem;'
)

# 3. Update nav tabs gap and padding
css = css.replace(
    'gap: 0.75rem;\n    background: none;',
    'gap: 0.5rem;\n    background: none;'
)
css = css.replace(
    'padding: 0.9rem 1.2rem;',
    'padding: 0.75rem 1rem;'
)

# 4. Update sidebar footer padding and gap
css = css.replace(
    'padding-top: 1.25rem;',
    'padding-top: 1rem;'
)
css = css.replace(
    'gap: 0.75rem;\n    padding-top: 1rem;',
    'gap: 0.5rem;\n    padding-top: 1rem;'
)

# 5. Enlarge hand seal button compact
css = css.replace(
    'width: 100px;\n    height: 100px;',
    'width: 140px;\n    height: 140px;'
)
css = css.replace(
    'font-size: 2.2rem;',
    'font-size: 3.2rem;'
)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("Successfully adjusted sidebar spacings and button size!")
