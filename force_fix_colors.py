import os
import re

files = [
    r'client\src\pages\CustomerDashboard.jsx',
    r'client\src\pages\VendorDashboard.jsx',
    r'client\src\pages\AdminDashboard.jsx',
    r'client\src\pages\VendorCustomers.jsx',
    r'client\src\pages\MyBookings.jsx',
    r'client\src\pages\Checkout.jsx',
    r'client\src\pages\VendorRegister.jsx',
    r'client\src\components\VendorNavbar.jsx',
    r'client\src\components\CustomerNavbar.jsx'
]

replacements = [
    # Backgrounds
    ("#1a1a1a", "#FFFFFF"),
    ("#2a2a2a", "#FFFFFF"),
    ("#333", "#FFFFFF"),
    ("#121212", "#FFFFFF"),
    
    # Text/Foreground
    ("color: 'white'", "color: '#0284C7'"),
    ('color: "white"', 'color: "#0284C7"'),
    ("color: '#ccc'", "color: '#0284C7'"),
    ("color: '#888'", "color: '#0284C7'"),
    ("borderColor: '#555'", "borderColor: '#BAE6FD'"),
    ("borderColor: '#444'", "borderColor: '#BAE6FD'"),
    
    # Accents (Purple -> Blue)
    ("#9333ea", "#0284C7"),
    ("#7b2cbf", "#0369A1"),
    
    # Status colors (Red/Green/Orange -> Blue variants or just Blue)
    # User said "Red colors ... to blue".
    ("#f44336", "#0284C7"),
    ("#d32f2f", "#0369A1"),
    ("#4caf50", "#0284C7"), # Green -> Blue
    ("#ff9800", "#0284C7"), # Orange -> Blue
    ("#2196f3", "#0284C7"), # Light Blue -> Medium Blue (normalization)
    ("#9c27b0", "#0284C7"), # Purple -> Blue
]

cwd = os.getcwd()
print(f"Working directory: {cwd}")

for file_rel_path in files:
    file_path = os.path.join(cwd, file_rel_path)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Simple string replacement for specific hex codes
        # We need to be careful not to replace hex codes inside other words if that were possible, 
        # but hex codes usually stand alone or in quotes.
        
        for old, new in replacements:
            # Case insensitive replacement for hex codes? No, hex is usually consistent.
            # But let's handle case variance if needed. Usually lowercase in this codebase.
            content = content.replace(old, new)
            
            # Identify "backgroundColor: '#2a2a2a'" specifically if generic replacement missed it
            # (Though generic #2a2a2a replacement above should catch it)
            
        # Regex for 'white' text that might be loose
        # catch sx={{ color: 'white' }} which is common
        content = re.sub(r"color:\s*'white'", "color: '#0284C7'", content)
        content = re.sub(r'color:\s*"white"', 'color: "#0284C7"', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
        else:
            print(f"No changes for {file_path}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
