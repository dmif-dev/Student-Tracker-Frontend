const fs = require('fs');
const path = require('path');
const folders = ['packages/web/app/mentor', 'packages/web/components/mentor'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Also replace bg-blue-600 with bg-orange-600 and ring-blue-300 with ring-orange-300 for the toggles!
  let newContent = content.replace(/([a-z]+)-primary-(\d+)/g, '$1-orange-$2');
  newContent = newContent.replace(/bg-blue-600/g, 'bg-orange-600');
  newContent = newContent.replace(/ring-blue-300/g, 'ring-orange-300');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

folders.forEach(folder => processDirectory(path.join(process.cwd(), folder)));
