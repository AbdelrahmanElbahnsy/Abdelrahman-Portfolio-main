const fs = require('fs');
const path = require('path');

const dir = 'src/cms/migrations';
const files = fs.readdirSync(dir).filter(f => f.startsWith('migrate') && f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to capture the exception in the result object so runMigration can print it.
  content = content.replace(/result\.failed\+\+;/, 'result.failed++; result.error = error;');

  fs.writeFileSync(filePath, content, 'utf8');
});

// Now update runMigration.js
const runMigPath = 'src/cms/migrations/runMigration.js';
let runMigContent = fs.readFileSync(runMigPath, 'utf8');

const newCheckAndPrint = `
        const checkAndPrint = async (name, colName, r) => {
          let count = 0;
          try {
            const snap = await getCountFromServer(collection(db, colName));
            count = snap.data().count;
          } catch(e) {
            // if getCountFromServer fails due to permissions, count remains 0, but we can log the error if we want.
          }
          
          if (count === 0 && (r?.created > 0 || r?.updated > 0)) {
            console.error(\`\\n\${name}\\nWrite: SUCCESS\\nCreated: \${(r?.created||0) + (r?.updated||0)}\\nDatabase Count: 0\`);
            throw new Error(\`getDocs() or getCountFromServer() returned 0 after a reported successful write for \${name}\`);
          }

          let out = \`\\n\${name}\\nWrite: \${r?.failed > 0 ? 'FAILED' : 'SUCCESS'}\\n\`;
          if (r?.failed > 0 && r?.error) {
             out += \`Exception: \${r.error.toString()}\\n\`;
          }
          out += \`Created: \${(r?.created||0) + (r?.updated||0)}\\nDatabase Count: \${count}\`;
          console.log(out);
        };
`;

runMigContent = runMigContent.replace(/const checkAndPrint = async \([\s\S]*?console\.log\(`\\n\$\{name\}\\nWrite:.*?`\);\n\s*};/, newCheckAndPrint.trim());
fs.writeFileSync(runMigPath, runMigContent, 'utf8');

console.log("Patched to include exceptions in summary");
