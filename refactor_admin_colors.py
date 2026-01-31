import re

# Read the file
with open('client/src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Color replacements
replacements = {
    # Dark backgrounds to white
    '#1a1a1a': '#FFFFFF',
    '#2a2a2a': '#FFFFFF',
    '#333': '#FFFFFF',
    
    # Purple to blue
    '#9333ea': '#0284C7',
    '#7c2ac9': '#026aa1',
    
    # Gray text to blue
    '#ccc': '#0284C7',
    '#888': '#0284C7',
    '#555': '#BAE6FD',
    '#444': '#BAE6FD',
    
    # Red to blue
    '#f44336': '#0284C7',
    '#d32f2f': '#026aa1',
    
    # Other colors to blue scheme
    '#ff9800': '#0284C7',
    '#4caf50': '#0284C7',
    '#2196f3': '#0284C7',
    '#9c27b0': '#0284C7',
    
    # Text color replacements
    "color: 'white'": "color: '#0284C7'",
    'color: "white"': 'color: "#0284C7"',
    "sx={{ color: 'white' }}": "sx={{ color: '#0284C7' }}",
    'sx={{ color: "white" }}': 'sx={{ color: "#0284C7" }}',
    "color='white'": "color='#0284C7'",
}

# Apply replacements
for old, new in replacements.items():
    content = content.replace(old, new)

# Special replacements for specific patterns
content = re.sub(r"color:\s*'white'", "color: '#0284C7'", content)
content = re.sub(r'color:\s*"white"', 'color: "#0284C7"', content)
content = re.sub(r"borderColor:\s*'white'", "borderColor: '#BAE6FD'", content)
content = re.sub(r'borderColor:\s*"white"', 'borderColor: "#BAE6FD"', content)

# Write back
with open('client/src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AdminDashboard.jsx has been refactored to white/blue theme")
