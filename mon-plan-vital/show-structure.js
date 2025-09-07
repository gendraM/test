const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  files.forEach((file, idx) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const isLast = idx === files.length - 1;
    const pointer = isLast ? '└── ' : '├── ';
    if (stat.isDirectory()) {
      console.log(prefix + pointer + file + '/');
      printTree(filePath, prefix + (isLast ? '    ' : '│   '));
    } else {
      console.log(prefix + pointer + file);
    }
  });
}

console.log('\nStructure du projet :\n');
printTree(process.cwd());