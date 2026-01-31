const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/CustomerDashboard.jsx');
console.log('Target:', filePath);

try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('Original content length:', content.length);

    // Check if dark color exists
    if (content.indexOf('#1a1a1a') !== -1) {
        console.log('Found #1a1a1a');
    } else {
        console.log('Did NOT find #1a1a1a');
    }

    let newContent = content
        .replace(/#1a1a1a/g, '#FFFFFF')
        .replace(/#2a2a2a/g, '#FFFFFF')
        .replace(/#333/g, '#FFFFFF')
        .replace(/#9333ea/g, '#0284C7')
        .replace(/#7b2cbf/g, '#0369A1')
        .replace(/color: 'white'/g, "color: '#0284C7'")
        .replace(/color: "white"/g, 'color: "#0284C7"')
        .replace(/#ccc/g, '#0284C7')
        .replace(/#555/g, '#BAE6FD')
        .replace(/#888/g, '#0284C7')
        .replace(/#444/g, '#BAE6FD')
        .replace(/#f44336/g, '#0284C7')
        .replace(/#d32f2f/g, '#0369A1')
        .replace(/#4caf50/g, '#0284C7')
        .replace(/#ff9800/g, '#0284C7')
        .replace(/#2196f3/g, '#0284C7')
        .replace(/#9c27b0/g, '#0284C7')
        // Fix specific sx props to ensure visibility
        .replace(/backgroundColor: '#FFFFFF', color: 'white'/g, "backgroundColor: '#FFFFFF', color: '#0284C7'")
        .replace(/color: '#0284C7', borderColor: '#555'/g, "color: '#0284C7', borderColor: '#BAE6FD'");

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('File updated successfully!');
    } else {
        console.log('No changes made.');
    }
} catch (e) {
    console.error('Error:', e);
}
