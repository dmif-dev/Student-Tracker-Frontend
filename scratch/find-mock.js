const fs = require('fs');
const path = require('path');

const targetDir = 'd:/projects/5/Student-Tracker/Student-Tracker-Frontend/packages/web';

function findMockFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', 'dist'].includes(file)) {
        findMockFiles(fullPath, fileList);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for hardcoded mock lists
      const hasMockArray = /const \w+\s*=\s*\[\s*{\s*(?:id|name|title)/s.test(content);
      const hasMockKeyword = /mock/i.test(content) && !fullPath.includes('documentViewerService.ts') && !fullPath.includes('layout.tsx');
      const hasTODO = /\/\/\s*TODO:.*?(mock|backend|api)/i.test(content);
      
      if (hasMockArray || hasMockKeyword || hasTODO) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

const result = findMockFiles(path.join(targetDir, 'app'));
console.log("Mock files found in app/:");
result.forEach(r => console.log(r));

const components = findMockFiles(path.join(targetDir, 'components'));
console.log("\nMock files found in components/:");
components.forEach(r => console.log(r));
