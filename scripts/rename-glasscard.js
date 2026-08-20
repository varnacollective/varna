const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && filePath.endsWith('.tsx')) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync(dir, function(filePath) {
    if (filePath.includes('GlassCard.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('GlassCard')) {
        content = content.replace(/import GlassCard from "@/g, 'import Card from "@');
        content = content.replace(/\/ui\/GlassCard/g, '/ui/Card');
        content = content.replace(/<GlassCard/g, '<Card');
        content = content.replace(/<\/GlassCard>/g, '</Card>');
        content = content.replace(/GlassCard /g, 'Card ');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});
