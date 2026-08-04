const fs = require('fs');
const path = require('path');

const dir = 'src/cms/migrations';
const files = fs.readdirSync(dir).filter(f => f.startsWith('migrate') && f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already patched
  if (content.includes('loggedSetDoc')) return;

  // Make sure we have getCountFromServer imported
  if (!content.includes('getCountFromServer')) {
    content = content.replace(/import \{([^}]+)\} from ['"]firebase\/firestore['"];/, (match, imports) => {
      let newImports = imports.split(',').map(s => s.trim());
      newImports.push('getCountFromServer');
      return `import { ${newImports.join(', ')} } from 'firebase/firestore';`;
    });
  }

  const wrappers = `
async function loggedSetDoc(docRef, data, options) {
  try {
    const res = await (options ? setDoc(docRef, data, options) : setDoc(docRef, data));
    console.log(\`Collection path: \${docRef.parent.path}, Document ID: \${docRef.id}, Write result: SUCCESS, Returned ID: \${docRef.id}\`);
    return res;
  } catch(e) {
    console.log(\`Collection path: \${docRef.parent.path}, Document ID: \${docRef.id}, Write result: FAILED, Exception: \${e}\`);
    throw e;
  }
}
async function loggedAddDoc(colRef, data) {
  try {
    const res = await addDoc(colRef, data);
    console.log(\`Collection path: \${colRef.path}, Document ID: \${res.id}, Write result: SUCCESS, Returned ID: \${res.id}\`);
    return res;
  } catch(e) {
    console.log(\`Collection path: \${colRef.path}, Write result: FAILED, Exception: \${e}\`);
    throw e;
  }
}
`;

  content = content.replace(/export (const|async function) migrate/, wrappers + '\nexport $1 migrate');
  
  // Replace setDoc and addDoc inside functions
  content = content.replace(/await setDoc\(/g, 'await loggedSetDoc(');
  content = content.replace(/await addDoc\(/g, 'await loggedAddDoc(');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${file}`);
});
