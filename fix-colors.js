const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /#1a1a1a/g, to: '#FFFFFF' },
    { from: /#2a2a2a/g, to: '#FFFFFF' },
    { from: /#333/g, to: '#FFFFFF' },
    { from: /#9333ea/g, to: '#0284C7' },
    { from: /#7b2cbf/g, to: '#0369A1' },
    { from: /color: 'white'/g, to: "color: '#0284C7'" },
    { from: /color: white/g, to: 'color: #0284C7' },
    { from: /#ccc/g, to: '#0284C7' },
    { from: /#555/g, to: '#BAE6FD' },
    { from: /#888/g, to: '#0284C7' },
    { from: /#444/g, to: '#BAE6FD' },
    { from: /#f44336/g, to: '#0284C7' },
    { from: /#d32f2f/g, to: '#0369A1' },
    { from: /#4caf50/g, to: '#0284C7' },
    { from: /#ff9800/g, to: '#0284C7' },
    { from: /#2196f3/g, to: '#0284C7' },
    { from: /#9c27b0/g, to: '#0284C7' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
        if (content.match(from)) {
            content = content.replace(from, to);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            processFile(filePath);
        }
    });
}

// Process pages and components
processDirectory(path.join(__dirname, 'client', 'src', 'pages'));
processDirectory(path.join(__dirname, 'client', 'src', 'components'));

console.log('\n✅ All files processed!');
