import sys

# Read the file
with open('client/src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Apply color replacements
replacements = [
    ('#1a1a1a', '#FFFFFF'),
    ('#2a2a2a', '#FFFFFF'),
    ('#333', '#FFFFFF'),
    ('#9333ea', '#0284C7'),
    ('#7c2ac9', '#026aa1'),
    ("'#ccc'", "'#0284C7'"),
    ('"#ccc"', '"#0284C7"'),
    ("sx={{ color: '#ccc' }}", "sx={{ color: '#0284C7' }}"),
    ('#888', '#0284C7'),
    ('#555', '#BAE6FD'),
    ('#444', '#BAE6FD'),
    ('#f44336', '#0284C7'),
    ('#d32f2f', '#026aa1'),
    ('#ff9800', '#0284C7'),
    ('#4caf50', '#0284C7'),
    ('#2196f3', '#0284C7'),
    ('#9c27b0', '#0284C7'),
    ("color: 'white'", "color: '#0284C7'"),
    ('color: "white"', 'color: "#0284C7"'),
    ("borderColor: 'white'", "borderColor: '#BAE6FD'"),
    ('borderColor: "white"', 'borderColor: "#BAE6FD"'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('client/src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('AdminDashboard.jsx refactored successfully')
