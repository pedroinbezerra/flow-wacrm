const fs = require('fs');
const path = require('path');
const pt_br = JSON.parse(fs.readFileSync('src/i18n/messages/pt-BR.json', 'utf8'));

// Flatten JSON
function flattenMessages(obj, prefix = '') {
  let result = {};
  for (const key in obj) {
    const newKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      result = { ...result, ...flattenMessages(obj[key], newKey) };
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

const flatMessages = flattenMessages(pt_br);

// Find all t() calls recursively
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(filePath);
    }
  });
}

const tCalls = [];
// Translation keys must have at least one dot (namespace.key) or be from known namespaces
const pattern = /t\(["'`]([a-zA-Z][a-zA-Z0-9._]*?)["'`]\)/g;

const knownNamespaces = ['common', 'auth', 'navigation', 'dashboard', 'roles', 'contacts', 'broadcasts', 'pipelines', 'flows', 'inbox', 'settings', 'automations', 'errors', 'time'];
const excludePatterns = ['hub.', 'searchParams'];

walkDir('src', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const key = match[1];
    const namespace = key.split('.')[0];
    // Only include keys that have a dot or are from known namespaces
    // Exclude webhook parameters
    if ((key.includes('.') && !key.includes('SELECT') && !key.includes('INSERT') && key.length < 100 &&
         !excludePatterns.some(p => key.includes(p))) ||
        knownNamespaces.includes(namespace)) {
      tCalls.push(key);
    }
  }
});

const unique = [...new Set(tCalls)];
const missing = unique.filter(key => !flatMessages[key]);

console.log('✅ Total translation calls found:', unique.length);
console.log('✅ Missing keys:', missing.length);
if (missing.length > 0) {
  console.log('❌ Missing keys:');
  missing.forEach(key => console.log('  -', key));
} else {
  console.log('✅ All translation keys are defined!');
}
