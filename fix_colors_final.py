import os
import re

files_to_fix = [
    r'client\src\pages\CustomerDashboard.jsx',
    r'client\src\pages\VendorDashboard.jsx',
    r'client\src\pages\AdminDashboard.jsx',
    r'client\src\pages\CreateItem.jsx',
    r'client\src\pages\ItemDetail.jsx',
    r'client\src\pages\MyBookings.jsx',
    r'client\src\pages\Checkout.jsx',
    r'client\src\pages\VendorCustomers.jsx',
    r'client\src\pages\VendorRegister.jsx'
]

# Define replacements using regex for flexibility
replacements = [
    (r"'#1a1a1a'", "'#FFFFFF'"),
    (r'"#1a1a1a"', '"#FFFFFF"'),
    (r"'#2a2a2a'", "'#FFFFFF'"),
    (r'"#2a2a2a"', '"#FFFFFF"'),
    (r"'#333'", "'#FFFFFF'"),
    (r"'#9333ea'", "'#0284C7'"),  # Purple to Blue
    (r"'#7b2cbf'", "'#0369A1'"),  # Dark Purple to Dark Blue
    (r"color: 'white'", "color: '#0284C7'"),
    (r'color: "white"', 'color: "#0284C7"'),
    (r"'#ccc'", "'#0284C7'"),
    (r"'#555'", "'#BAE6FD'"),
    (r"'#888'", "'#0284C7'"),
    (r"'#444'", "'#BAE6FD'"),
    (r"'#f44336'", "'#0284C7'"), # Red to Blue
    (r"'#d32f2f'", "'#0369A1'"),
    (r"'#4caf50'", "'#0284C7'"), # Green to Blue
    (r"'#ff9800'", "'#0284C7'"), # Orange to Blue
    (r"'#2196f3'", "'#0284C7'"),
    (r"'#9c27b0'", "'#0284C7'"),
    
    # Specific props
    (r"backgroundColor: '#1a1a1a'", "backgroundColor: '#FFFFFF'"),
    (r"backgroundColor: '#2a2a2a'", "backgroundColor: '#FFFFFF'"),
]

def fix_file(file_path):
    full_path = os.path.join(os.getcwd(), file_path)
    if not os.path.exists(full_path):
        print(f"Skipping {file_path} - Not found")
        return

    print(f"Processing {file_path}...")
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
            
        # Additional manual check for any missed dark colors
        content = content.replace("backgroundColor: '#1a1a1a'", "backgroundColor: '#FFFFFF'")
        
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
        else:
            print(f"No changes needed for {file_path}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    for file_path in files_to_fix:
        fix_file(file_path)
