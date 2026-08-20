const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && filePath.endsWith('.tsx')) {
            callback(filePath);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync(dir, function(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Common replacements for the new theme
    const replacements = [
        { regex: /text-white\/[0-9]+/g, replacement: 'text-[var(--muted-foreground)]' },
        { regex: /text-white /g, replacement: 'text-[var(--foreground)] ' },
        { regex: /text-white"/g, replacement: 'text-[var(--foreground)]"' },
        { regex: /text-white\n/g, replacement: 'text-[var(--foreground)]\n' },
        { regex: /bg-white\/\[0\.[0-9]+\]/g, replacement: 'bg-[var(--card)]' },
        { regex: /border-white\/\[0\.[0-9]+\]/g, replacement: 'border-[var(--border)]' },
        { regex: /border-white\/[0-9]+/g, replacement: 'border-[var(--border)]' },
        // specific edge cases for text
        { regex: /className="text-white"/g, replacement: 'className="text-[var(--foreground)]"' },
    ];

    for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated colors in ${filePath}`);
    }
});
